import { generateExpenseSummary } from './emailService.js';

const META_API_URL = (phoneNumberId: string) => `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

function formatSummaryText(summary: Awaited<ReturnType<typeof generateExpenseSummary>>): string {
  const lines: string[] = [];
  lines.push(`Daily Expense Summary (${new Date().toLocaleDateString()})`);
  lines.push(`Total Sessions: ${summary.totalSessions}`);
  lines.push(`Total Expenses: $${summary.totalAmount.toFixed(2)}`);
  lines.push(`Total Items: ${summary.totalItems}`);
  lines.push(`Active Participants: ${summary.activeParticipants}`);
  if (summary.recentSessions.length) {
    lines.push('Recent Sessions:');
    for (const s of summary.recentSessions) {
      lines.push(`• ${s.name}: $${s.total.toFixed(2)} • ${s.itemCount} items • ${s.date}`);
    }
  }
  if (summary.topSpenders.length) {
    lines.push('Top Spenders:');
    for (const t of summary.topSpenders) {
      lines.push(`• ${t.name}: $${t.amount.toFixed(2)}`);
    }
  }
  lines.push('— Sent by SplitFair');
  return lines.join('\n');
}

export async function sendWhatsAppText(toNumber: string, text: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp credentials missing: set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
  }

  const res = await fetch(META_API_URL(phoneNumberId), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toNumber,
      type: 'text',
      text: { body: text }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp API error: ${res.status} ${errText}`);
  }
}

export async function sendWhatsAppSummary(userId: string, toNumber: string) {
  const summary = await generateExpenseSummary(userId);
  const text = formatSummaryText(summary);
  await sendWhatsAppText(toNumber, text);
}
