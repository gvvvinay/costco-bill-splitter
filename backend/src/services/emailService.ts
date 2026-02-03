import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });
};

interface ExpenseSummary {
  totalSessions: number;
  totalAmount: number;
  totalItems: number;
  activeParticipants: number;
  recentSessions: Array<{
    name: string;
    total: number;
    itemCount: number;
    date: string;
  }>;
  topSpenders: Array<{
    name: string;
    amount: number;
  }>;
}

export async function generateExpenseSummary(userId: string): Promise<ExpenseSummary> {
  // Get all sessions for the user
  const sessions = await prisma.billSplitSession.findMany({
    where: { userId },
    include: {
      lineItems: true,
      participants: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals
  const totalAmount = sessions.reduce((sum, session) => {
    const itemsTotal = session.lineItems.reduce((itemSum, item) => itemSum + item.price, 0);
    const sessionTotal = itemsTotal + (session.taxAmount || 0);
    return sum + sessionTotal;
  }, 0);

  const totalItems = sessions.reduce((sum, session) => sum + session.lineItems.length, 0);

  // Get unique active participants
  const allParticipants = sessions.flatMap(s => s.participants);
  const uniqueParticipants = new Set(allParticipants.map(p => p.name));

  // Recent sessions (last 5)
  const recentSessions = sessions.slice(0, 5).map(session => ({
    name: session.name,
    total: session.lineItems.reduce((sum, item) => sum + item.price, 0) + (session.taxAmount || 0),
    itemCount: session.lineItems.length,
    date: session.createdAt.toLocaleDateString(),
  }));

  // Calculate spending by participant
  const participantSpending = new Map<string, number>();
  
  for (const session of sessions) {
    for (const item of session.lineItems) {
      const assignments = await prisma.itemAssignment.findMany({
        where: { lineItemId: item.id },
        include: { participant: true },
      });

      const shareAmount = item.price / (assignments.length || 1);
      
      for (const a of assignments) {
        const current = participantSpending.get(a.participant.name) || 0;
        participantSpending.set(a.participant.name, current + shareAmount);
      }
    }
  }

  // Get top 5 spenders
  const topSpenders = Array.from(participantSpending.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    totalSessions: sessions.length,
    totalAmount,
    totalItems,
    activeParticipants: uniqueParticipants.size,
    recentSessions,
    topSpenders,
  };
}

export async function sendExpenseSummaryEmail(userEmail: string, userId: string) {
  try {
    const summary = await generateExpenseSummary(userId);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .stat-card {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .stat-label {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .stat-value {
            color: #667eea;
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
          }
          .session-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #667eea;
            border-radius: 4px;
          }
          .session-name {
            font-weight: bold;
            color: #333;
          }
          .session-details {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .spender-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .amount {
            color: #667eea;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Daily Expense Summary</h1>
          <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
          <div class="stat-card">
            <div class="stat-label">Total Sessions</div>
            <div class="stat-value">${summary.totalSessions}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Expenses</div>
            <div class="stat-value">$${summary.totalAmount.toFixed(2)}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Items</div>
            <div class="stat-value">${summary.totalItems}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Active Participants</div>
            <div class="stat-value">${summary.activeParticipants}</div>
          </div>

          ${summary.recentSessions.length > 0 ? `
          <div class="stat-card">
            <h3>Recent Sessions</h3>
            ${summary.recentSessions.map(session => `
              <div class="session-item">
                <div class="session-name">${session.name}</div>
                <div class="session-details">
                  $${session.total.toFixed(2)} • ${session.itemCount} items • ${session.date}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${summary.topSpenders.length > 0 ? `
          <div class="stat-card">
            <h3>Top Spenders</h3>
            ${summary.topSpenders.map(spender => `
              <div class="spender-item">
                <span>${spender.name}</span>
                <span class="amount">$${spender.amount.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This is an automated summary from SplitFair</p>
          <p>Daily reports are sent at 8:00 PM</p>
        </div>
      </body>
      </html>
    `;

    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"SplitFair" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Daily Expense Summary - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    });

    console.log(`📧 Expense summary email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending expense summary email:', error);
    throw error;
  }
}
