import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { sendWhatsAppSummary } from '../services/whatsappService.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const to = process.env.WHATSAPP_RECIPIENT_NUMBER;
    if (!to) {
      console.error('❌ Set WHATSAPP_RECIPIENT_NUMBER in .env');
      process.exit(1);
    }
    let user = await prisma.user.findFirst({ where: { email: process.env.EMAIL_USER } });
    if (!user) user = await prisma.user.findFirst();
    if (!user) {
      console.error('❌ No user found for summary');
      process.exit(1);
    }
    console.log(`📲 Sending WhatsApp summary to ${to} using userId=${user.id}`);
    await sendWhatsAppSummary(user.id, to);
    console.log('✅ WhatsApp summary sent successfully.');
  } catch (err) {
    console.error('❌ Error sending WhatsApp summary:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
