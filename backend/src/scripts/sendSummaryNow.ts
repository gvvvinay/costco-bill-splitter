import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { sendExpenseSummaryEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const targetEmail = process.env.EMAIL_USER || 'callmegvv@gmail.com';
    let user = await prisma.user.findFirst({ where: { email: targetEmail } });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      console.error('❌ No user found in database to generate summary.');
      process.exit(1);
    }

    console.log(`📨 Sending summary to ${targetEmail} using userId=${user.id}`);
    await sendExpenseSummaryEmail(targetEmail, user.id);
    console.log('✅ Summary email sent successfully.');
  } catch (error) {
    console.error('❌ Error sending summary:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
