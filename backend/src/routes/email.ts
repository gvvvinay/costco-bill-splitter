import express from 'express';
import { sendExpenseSummaryEmail } from '../services/emailService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Test endpoint to send summary email on demand
router.post('/send-summary', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Get user email from database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user || !user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    await sendExpenseSummaryEmail(user.email, userId);
    
    res.json({ 
      message: 'Summary email sent successfully',
      email: user.email 
    });
  } catch (error: any) {
    console.error('Error sending summary email:', error);
    res.status(500).json({ 
      error: 'Failed to send summary email',
      details: error.message 
    });
  }
});

export default router;
