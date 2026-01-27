import Tesseract from 'tesseract.js';

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
 * Parse a Costco receipt image using OCR
 * This is a v1 implementation that handles typical Costco receipt formats
 */
export async function parseReceipt(imagePath: string): Promise<ParseResult> {
  let worker;
  try {
    // Create worker with improved settings for receipt scanning
    worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      errorHandler: (err) => {
        console.error('Tesseract error:', err);
      }
    });

    // Configure Tesseract for better receipt recognition
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,  // Automatic page segmentation
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,/$%-&*',  // Common receipt characters
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,  // Use LSTM neural net (best quality)
    });

    // Recognize text with preprocessing
    const { data: { text } } = await worker.recognize(imagePath, {
      // Image preprocessing for better results
      rotateAuto: true,  // Auto-rotate if needed
    });
    
    // Terminate worker
    await worker.terminate();

    console.log('OCR text extracted, parsing...');
    return parseCostcoReceipt(text);
  } catch (error: any) {
    console.error('OCR error:', error.message);
    
    // Make sure to terminate worker even on error
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // Ignore termination errors
      }
    }
    
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
 * Parse Costco receipt text format
 * Costco receipts typically have format:
 * ITEM NAME                    PRICE
 * Or with quantity:
 * QTY ITEM NAME                PRICE
 */
function parseCostcoReceipt(text: string): ParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const items: ParsedItem[] = [];
  let subtotal = 0;
  let tax = 0;
  let total = 0;

  // Common Costco keywords to skip
  const skipKeywords = [
    'costco',
    'wholesale',
    'member',
    'card',
    'thank you',
    'receipt',
    'cashier',
    'register',
    'date',
    'time',
    'warehouse'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Skip header/footer lines
    if (skipKeywords.some(kw => line.includes(kw))) {
      continue;
    }

    // Look for totals
    if (line.includes('subtotal')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) subtotal = parseFloat(match[1]);
      continue;
    }

    if (line.includes('tax') && !line.includes('taxable')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) tax = parseFloat(match[1]);
      continue;
    }

    if (line.includes('total') && !line.includes('subtotal')) {
      const match = line.match(/(\d+\.\d{2})/);
      if (match) total = parseFloat(match[1]);
      continue;
    }

    // Try to parse item line
    // Format: "ITEM NAME              PRICE" or "QTY ITEM NAME          PRICE"
    // Also handle prices with spaces like "12. 99" or missing decimals
    const priceMatch = line.match(/(\d+[\.\s]*\d{2})[\s]*$/);
    
    if (priceMatch) {
      // Clean up price format (handle "12. 99" -> "12.99")
      const priceStr = priceMatch[1].replace(/\s+/g, '').replace(/^(\d+)(\d{2})$/, '$1.$2');
      const price = parseFloat(priceStr);
      
      // Skip if price is unreasonably high or low
      if (price < 0.01 || price > 9999.99 || isNaN(price)) {
        continue;
      }
      
      let name = line.substring(0, line.lastIndexOf(priceMatch[1])).trim();
      let quantity = 1;

      // Check for quantity at start (various formats)
      const qtyMatch = name.match(/^(\d+)\s*[xX\*]?\s+(.+)/);
      if (qtyMatch) {
        quantity = parseInt(qtyMatch[1]);
        name = qtyMatch[2].trim();
      }

      // Clean up name - remove extra spaces and common OCR artifacts
      name = name
        .replace(/\s{2,}/g, ' ')
        .replace(/[|]/g, 'I')  // Common OCR mistake
        .replace(/[0O]/g, 'O')  // Normalize O and 0 in text
        .trim();

      // Only add if name is reasonable length and not just numbers
      if (name.length > 2 && !/^\d+$/.test(name)) {
        items.push({
          name,
          quantity,
          price,
          taxable: true // Assume taxable by default
        });
      }
    }
  }

  // If we didn't find totals in text, calculate them
  if (subtotal === 0 && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.price, 0);
  }

  if (total === 0) {
    total = subtotal + tax;
  }

  return {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}
