import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendExpenseSummaryEmail } from './emailService.js';
import { sendWhatsAppSummary } from './whatsappService.js';

const prisma = new PrismaClient();

export function startScheduledJobs() {
  // Schedule daily email at 8:00 PM (20:00)
  // Cron format: minute hour day month day-of-week
  // '0 20 * * *' means: at minute 0, hour 20 (8 PM), every day
  cron.schedule('0 20 * * *', async () => {
    console.log('🕐 Running scheduled job: Daily expense summary emails');
    
    try {
      // Send to specific email (callmegvv@gmail.com)
      const targetEmail = 'callmegvv@gmail.com';
      
      // Get all users and their expenses
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      // If the target email exists in users, send their summary
      const targetUser = users.find(u => u.email === targetEmail);
      
      if (targetUser) {
        console.log(`📨 Sending daily summary to ${targetEmail}`);
        await sendExpenseSummaryEmail(targetEmail, targetUser.id);
        console.log(`✅ Sent summary to ${targetEmail}`);
      } else {
        console.log(`⚠️ User ${targetEmail} not found. Sending summary for first user.`);
        // Fallback: send for the first user if target email not found
        if (users.length > 0) {
          await sendExpenseSummaryEmail(targetEmail, users[0].id);
          console.log(`✅ Sent summary to ${targetEmail} using first user's data`);
        }
      }

      // Also send via WhatsApp if configured
      const waTo = process.env.WHATSAPP_RECIPIENT_NUMBER;
      const waEnabled = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && waTo);
      if (waEnabled) {
        try {
          const waUserId = (targetUser?.id) || (users[0]?.id);
          if (waUserId) {
            console.log(`📲 Sending WhatsApp summary to ${waTo}`);
            await sendWhatsAppSummary(waUserId, waTo);
            console.log(`✅ WhatsApp summary sent to ${waTo}`);
          }
        } catch (err) {
          console.error('❌ Failed to send WhatsApp summary:', err);
        }
      } else {
        console.log('ℹ️ WhatsApp not configured. Skipping WhatsApp summary.');
      }

      console.log('✨ Daily email job completed');
    } catch (error) {
      console.error('Error in scheduled email job:', error);
    }
  });

  // For testing: Send email every minute (uncomment to test)
  // cron.schedule('* * * * *', async () => {
  //   console.log('Test job running every minute');
  //   const user = await prisma.user.findFirst();
  //   if (user) {
  //     await sendExpenseSummaryEmail(user.email, user.id);
  //   }
  // });

  console.log('⏰ Scheduled jobs initialized - Daily summaries at 8:00 PM');
}
