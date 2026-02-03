import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ParsedItem {
  name: string;
  quantity: number;
  price: number;
  taxable: boolean;
}

export interface ParseResult {
  items: ParsedItem[];
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Validate that a file is a readable image
 */
async function validateImageFile(imagePath: string): Promise<Buffer> {
  try {
    const stats = await fs.stat(imagePath);
    
    if (stats.size === 0) {
      throw new Error('Image file is empty');
    }
    
    if (stats.size > 50 * 1024 * 1024) {
      throw new Error('Image file too large (max 50MB)');
    }
    
    // Check file extension
    const ext = path.extname(imagePath).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!validExts.includes(ext)) {
      throw new Error(`Invalid image format: ${ext}`);
    }
    
    // Read file to ensure it's not corrupted
    const buffer = await fs.readFile(imagePath);
    
    // Check for image magic numbers
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49;
    const isWebp = buffer.toString('utf8', 0, 4) === 'RIFF' && 
                   buffer.toString('utf8', 8, 12) === 'WEBP';
    
    if (!isJpeg && !isPng && !isGif && !isWebp) {
      throw new Error('File is not a valid image (invalid magic number)');
    }
    
    console.log(`[GEMINI] Image validation passed: ${imagePath} (${stats.size} bytes)`);
    return buffer;
  } catch (error: any) {
    throw new Error(`Image validation failed: ${error.message}`);
  }
}

/**
 * Parse a receipt image using Google Gemini Vision API
 */
export async function parseReceipt(imagePath: string): Promise<ParseResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }
  
  try {
    // Validate image first
    console.log(`[GEMINI] Validating image: ${imagePath}`);
    const imageBuffer = await validateImageFile(imagePath);
    
    const base64Image = imageBuffer.toString('base64');
    const fileExtension = path.extname(imagePath).toLowerCase();
    
    // Determine MIME type based on extension
    let mimeType = 'image/jpeg';
    if (fileExtension === '.png') mimeType = 'image/png';
    else if (fileExtension === '.gif') mimeType = 'image/gif';
    else if (fileExtension === '.webp') mimeType = 'image/webp';
    
    console.log(`[GEMINI] Initializing Gemini API...`);
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log(`[GEMINI] Analyzing receipt image...`);
    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        },
      },
      {
        text: `Analyze this receipt image and extract item information as valid JSON only.

Return ONLY valid JSON (no markdown, no code blocks, no explanations):
{
  "items": [
    {"name": "item description", "quantity": 1, "price": 9.99, "taxable": true}
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00
}

Rules:
- Extract only individual product/service line items (not subtotals, tax lines, or totals)
- quantity: number purchased (default 1)
- price: unit or line total price
- taxable: true unless marked as tax-exempt
- subtotal: sum before tax
- tax: tax amount on receipt
- total: final amount

Return ONLY JSON, nothing else.`,
      },
    ]);
    
    const responseText = response.response.text();
    
    if (!responseText) {
      console.error('[GEMINI] No response from Gemini');
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0
      };
    }

    console.log('[GEMINI] Received response from Gemini');

    // Parse the JSON response
    const parseResult = parseGeminiResponse(responseText);
    console.log(`[GEMINI] Analysis complete: found ${parseResult.items.length} items`);
    
    return parseResult;
  } catch (error: any) {
    console.error('[GEMINI] Fatal error:', error.message);
    
    // Return empty result on error so the user can manually enter items
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    };
  }
}

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(responseText: string): ParseResult {
  try {
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonStr = responseText.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.includes('```json')) {
      const match = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
      if (match) {
        jsonStr = match[1];
      }
    } else if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```\n?([\s\S]*?)\n?```/);
      if (match) {
        jsonStr = match[1];
      }
    }
    
    // Try to find JSON object in response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate and sanitize the response
    const items: ParsedItem[] = (parsed.items || [])
      .filter((item: any) => item && item.name && typeof item.price === 'number')
      .map((item: any) => ({
        name: String(item.name).trim(),
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        price: Math.round(parseFloat(item.price) * 100) / 100,
        taxable: item.taxable !== false
      }));

    let subtotal = Math.round(parseFloat(parsed.subtotal || 0) * 100) / 100;
    let tax = Math.round(parseFloat(parsed.tax || 0) * 100) / 100;
    let total = Math.round(parseFloat(parsed.total || 0) * 100) / 100;

    // Validate subtotal
    if (subtotal === 0 && items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      subtotal = Math.round(subtotal * 100) / 100;
    }

    // Validate total
    if (total === 0) {
      total = subtotal + tax;
      total = Math.round(total * 100) / 100;
    }

    console.log(`[GEMINI] Parsed ${items.length} items, subtotal: $${subtotal}, tax: $${tax}, total: $${total}`);

    return {
      items,
      subtotal,
      tax,
      total
    };
  } catch (error: any) {
    console.error('[GEMINI] Failed to parse response:', error.message);
    console.error('[GEMINI] Raw response:', responseText.substring(0, 300));
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    };
  }
}
