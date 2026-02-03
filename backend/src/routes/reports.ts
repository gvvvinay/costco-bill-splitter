import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/activity', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.billSplitSession.findMany({
      where: { userId: req.userId },
      include: {
        participants: true,
        lineItems: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const activities: any[] = [];

    sessions.forEach(session => {
      // Session creation
      activities.push({
        id: `session-${session.id}`,
        type: 'create_session',
        description: `Created trip "${session.name}"`,
        date: session.createdAt,
        sessionId: session.id,
        sessionName: session.name,
        user: 'You' // Since currently only the owner can edit
      });

      // Participants
      session.participants.forEach(p => {
        activities.push({
          id: `participant-${p.id}`,
          type: 'add_participant',
          description: `Added ${p.name} to "${session.name}"`,
          date: p.createdAt,
          sessionId: session.id,
          sessionName: session.name,
          user: 'You'
        });
      });

      // Items
      session.lineItems.forEach(item => {
        activities.push({
          id: `item-${item.id}`,
          type: 'add_item',
          description: `Added item "${item.name}" ($${item.price.toFixed(2)}) to "${session.name}"`,
          date: item.createdAt,
          sessionId: session.id,
          sessionName: session.name,
          user: 'You'
        });
      });
    });

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(activities);
  } catch (error) {
    console.error('Activity report error:', error);
    res.status(500).json({ error: 'Failed to fetch activity report' });
  }
});

export default router;
