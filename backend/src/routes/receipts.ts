import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { parseReceipt } from '../services/receiptParser.js';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

// Upload and parse receipt
router.post('/upload/:sessionId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.files || !req.files.receipt) {
      return res.status(400).json({ error: 'No receipt file uploaded' });
    }

    // Verify session ownership
    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const file = Array.isArray(req.files.receipt) ? req.files.receipt[0] : req.files.receipt;
    
    console.log(`[UPLOAD] Received file: ${file.name}, size: ${file.size} bytes, type: ${file.mimetype}`);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.warn(`[UPLOAD] Invalid file type: ${file.mimetype}`);
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).' 
      });
    }

    // Validate file exists and has content
    if (file.size === 0 || !file.data) {
      console.error('[UPLOAD] File is empty or has no data');
      return res.status(400).json({ error: 'Uploaded file is empty or invalid' });
    }

    // Validate minimum size (at least 100 bytes)
    if (file.size < 100) {
      console.error(`[UPLOAD] File too small: ${file.size} bytes`);
      return res.status(400).json({ error: 'Uploaded file appears to be corrupted (too small)' });
    }

    // Save file from buffer
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    try {
      console.log(`[UPLOAD] Writing file to: ${filepath}`);
      await fs.writeFile(filepath, file.data);
      
      // Verify file was written correctly
      const stats = await fs.stat(filepath);
      console.log(`[UPLOAD] File saved successfully: ${filepath} (${stats.size} bytes)`);
      
      if (stats.size === 0) {
        throw new Error('File saved but has zero size');
      }

      // Verify file is readable
      const fileContent = await fs.readFile(filepath);
      console.log(`[UPLOAD] File verified readable (${fileContent.length} bytes)`);
    } catch (err: any) {
      console.error('[UPLOAD] File save error:', err.message);
      return res.status(500).json({ error: 'Failed to save uploaded file: ' + err.message });
    }

    console.log(`[UPLOAD] Receipt saved, starting Gemini vision analysis...`);

    // Parse receipt with better error handling
    let parseResult;
    let ocrSuccess = false;
    try {
      // Add timeout and better error handling
      parseResult = await Promise.race([
        parseReceipt(filepath),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Gemini analysis timeout after 60 seconds')), 60000)
        )
      ]);
      
      ocrSuccess = parseResult.items.length > 0;
      console.log(`[UPLOAD] Gemini analysis completed: found ${parseResult.items.length} items, success: ${ocrSuccess}`);
    } catch (error: any) {
      console.error('[UPLOAD] Gemini analysis failed:', error.message);
      // Return empty result to allow manual entry
      parseResult = { items: [], subtotal: 0, tax: 0, total: 0 };
      ocrSuccess = false;
    }

    // Create line items (will be empty, user can add manually)
    const lineItems = await Promise.all(
      parseResult.items.map((item: any, index: number) =>
        prisma.lineItem.create({
          data: {
            sessionId: req.params.sessionId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            taxable: item.taxable,
            orderIndex: index
          }
        })
      )
    );

    // Update session with totals
    await prisma.billSplitSession.update({
      where: { id: req.params.sessionId },
      data: {
        receiptUrl: filename,
        totalAmount: parseResult.total,
        taxAmount: parseResult.tax
      }
    });

    res.json({
      items: lineItems,
      total: parseResult.total,
      tax: parseResult.tax,
      subtotal: parseResult.subtotal,
      ocrSuccess: parseResult.items.length > 0
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

// Download original receipt file
router.get('/download/:sessionId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Verify session ownership
    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.receiptUrl) {
      return res.status(404).json({ error: 'No receipt uploaded for this session' });
    }

    const filepath = path.join(UPLOAD_DIR, session.receiptUrl);

    // Verify file exists and is readable
    try {
      await fs.stat(filepath);
    } catch (err) {
      console.error(`[DOWNLOAD] File not found: ${filepath}`);
      return res.status(404).json({ error: 'Receipt file not found' });
    }

    // Send file
    res.download(filepath, session.receiptUrl, (err) => {
      if (err) {
        console.error('[DOWNLOAD] Error sending file:', err);
      } else {
        console.log(`[DOWNLOAD] File sent successfully: ${session.receiptUrl}`);
      }
    });
  } catch (error: any) {
    console.error('[DOWNLOAD] Error:', error.message);
    res.status(500).json({ error: 'Failed to download receipt' });
  }
});

// Manual parse (for testing without OCR)
router.post('/manual/:sessionId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { items, tax, total, subtotal } = req.body;

    // Verify session ownership
    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.sessionId,
        userId: req.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete existing line items
    await prisma.lineItem.deleteMany({
      where: { sessionId: req.params.sessionId }
    });

    // Create line items
    const lineItems = await Promise.all(
      items.map((item: any, index: number) =>
        prisma.lineItem.create({
          data: {
            sessionId: req.params.sessionId,
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price,
            taxable: item.taxable !== false,
            orderIndex: index
          }
        })
      )
    );

    // Update session
    await prisma.billSplitSession.update({
      where: { id: req.params.sessionId },
      data: {
        totalAmount: total || subtotal + tax,
        taxAmount: tax || 0
      }
    });

    res.json({
      items: lineItems,
      total: total || subtotal + tax,
      tax: tax || 0,
      subtotal: subtotal
    });
  } catch (error) {
    console.error('Manual parse error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

export default router;
