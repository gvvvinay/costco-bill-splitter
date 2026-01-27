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
    
    console.log(`Received file: ${file.name}, size: ${file.size} bytes, type: ${file.mimetype}`);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).' 
      });
    }

    // Validate file exists and has content
    if (file.size === 0 || !file.data) {
      return res.status(400).json({ error: 'Uploaded file is empty or invalid' });
    }

    // Save file from buffer
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    try {
      await fs.writeFile(filepath, file.data);
      
      // Verify file was written correctly
      const stats = await fs.stat(filepath);
      console.log(`File saved successfully: ${filepath} (${stats.size} bytes)`);
      
      if (stats.size === 0) {
        throw new Error('File saved but has zero size');
      }
    } catch (err) {
      console.error('File save error:', err);
      return res.status(500).json({ error: 'Failed to save uploaded file' });
    }

    console.log(`Receipt saved: ${filepath}, attempting OCR...`);

    // Parse receipt with better error handling
    let parseResult;
    try {
      // Add timeout and better error handling
      parseResult = await Promise.race([
        parseReceipt(filepath),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('OCR timeout after 45 seconds')), 45000)
        )
      ]);
      console.log(`OCR completed: found ${parseResult.items.length} items`);
    } catch (error: any) {
      console.error('OCR parsing failed:', error.message);
      // Return empty result to allow manual entry
      parseResult = { items: [], subtotal: 0, tax: 0, total: 0 };
    }

    // Create line items (will be empty, user can add manually)
    const lineItems = await Promise.all(
      parseResult.items.map((item, index) =>
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
