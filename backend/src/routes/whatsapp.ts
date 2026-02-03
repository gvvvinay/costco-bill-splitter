import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { sendWhatsAppSummary } from '../services/whatsappService.js';

const router = express.Router();

// Send WhatsApp summary on demand (requires JWT)
router.post('/send-summary', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const to = (req.body?.to as string) || process.env.WHATSAPP_RECIPIENT_NUMBER;
    if (!to) {
      return res.status(400).json({ error: 'Recipient phone number required in body { to: "+123..." } or set WHATSAPP_RECIPIENT_NUMBER in .env' });
    }

    await sendWhatsAppSummary(userId, to);
    res.json({ message: 'WhatsApp summary sent', to });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send WhatsApp summary', details: error?.message });
  }
});

export default router;
