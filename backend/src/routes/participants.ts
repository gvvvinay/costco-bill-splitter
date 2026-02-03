import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all global participants for user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const participants = await prisma.globalParticipant.findMany({
      where: { userId: req.userId },
      orderBy: { name: 'asc' }
    });

    res.json(participants);
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Create or get global participant
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Participant name is required' });
    }

    const participant = await prisma.globalParticipant.upsert({
      where: {
        userId_name: {
          userId: req.userId!,
          name: name.trim()
        }
      },
      create: {
        name: name.trim(),
        userId: req.userId!
      },
      update: {}
    });

    res.json(participant);
  } catch (error) {
    console.error('Create participant error:', error);
    res.status(500).json({ error: 'Failed to create participant' });
  }
});

// Get settlement summary across all sessions
router.get('/settlement-summary', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get all sessions with full calculation data
    const sessions = await prisma.billSplitSession.findMany({
      where: { 
        userId: req.userId,
        archived: false  // Only show active sessions
      },
      include: {
        participants: true,
        lineItems: {
          include: {
            assignments: {
              include: {
                participant: true
              }
            }
          }
        },
        settlements: true
      }
    });

    // Aggregate by participant name
    const summaryMap = new Map<string, {
      participantName: string;
      totalOwed: number;
      totalPaid: number;
      balance: number;
      sessions: Array<{
        sessionId: string;
        sessionName: string;
        amountOwed: number;
        amountPaid: number;
        settled: boolean;
        settledAt?: string;
      }>;
      fullySettled: boolean;
    }>();

    // Process each session
    for (const session of sessions) {
      // Calculate split for this session
      const participantTotals: Record<string, number> = {};
      
      session.participants.forEach(p => {
        participantTotals[p.id] = 0;
      });

      // Calculate each participant's share
      session.lineItems.forEach(item => {
        const assignmentCount = item.assignments.length;
        if (assignmentCount > 0) {
          const sharePerPerson = item.price / assignmentCount;
          item.assignments.forEach(assignment => {
            if (participantTotals[assignment.participantId] !== undefined) {
              participantTotals[assignment.participantId] += sharePerPerson;
            }
          });
        }
      });

      // Add proportional tax
      const totalPreTax = session.lineItems.reduce((sum, item) => {
        return item.assignments.length > 0 ? sum + item.price : sum;
      }, 0);
      const taxRate = totalPreTax > 0 ? session.taxAmount / totalPreTax : 0;

      // Process each participant
      session.participants.forEach(participant => {
        const subtotal = participantTotals[participant.id] || 0;
        const tax = Math.round(subtotal * taxRate * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;

        if (total === 0) return; // Skip if no amount owed

        const name = participant.name;
        
        if (!summaryMap.has(name)) {
          summaryMap.set(name, {
            participantName: name,
            totalOwed: 0,
            totalPaid: 0,
            balance: 0,
            sessions: [],
            fullySettled: true
          });
        }

        // Check if there's a settlement record
        const settlement = session.settlements.find(s => s.participantId === participant.id);
        const amountPaid = settlement?.amountPaid || 0;
        const isSettled = settlement?.settled || false;

        const summary = summaryMap.get(name)!;
        summary.totalOwed += total;
        summary.totalPaid += amountPaid;
        summary.sessions.push({
          sessionId: session.id,
          sessionName: session.name,
          amountOwed: total,
          amountPaid: amountPaid,
          settled: isSettled,
          settledAt: settlement?.settledAt?.toISOString()
        });

        if (!isSettled) {
          summary.fullySettled = false;
        }
      });
    }

    // Calculate balances
    summaryMap.forEach(summary => {
      summary.balance = summary.totalOwed - summary.totalPaid;
    });

    // Convert to array and sort by name
    const summaries = Array.from(summaryMap.values()).sort((a, b) => 
      a.participantName.localeCompare(b.participantName)
    );

    res.json(summaries);
  } catch (error) {
    console.error('Get settlement summary error:', error);
    res.status(500).json({ error: 'Failed to fetch settlement summary' });
  }
});

// Settle a participant across all sessions (or mark as paid)
router.post('/settle', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { participantName } = req.body;

    if (!participantName) {
      return res.status(400).json({ error: 'Participant name is required' });
    }

    // Get all user sessions with their data to calculate totals
    const sessions = await prisma.billSplitSession.findMany({
      where: { 
        userId: req.userId,
        archived: false // Only settle active sessions
      },
      include: {
        participants: true,
        lineItems: {
          include: {
            assignments: true
          }
        },
        settlements: true // Include existing settlements
      }
    });

    let settledCount = 0;

    // Process each session to find the participant and calculate owed amount
    for (const session of sessions) {
      // Find participant by name in this session
      const participant = session.participants.find(p => p.name === participantName);
      
      if (!participant) continue; // Participant not in this session

      // Calculate what they owe (reuse logic from summary)
      let subtotal = 0;
      let taxableSubtotal = 0;
      let totalPreTax = 0;
      let totalTaxableAmount = 0;
      
      // Calculate totals for tax rate
      session.lineItems.forEach(item => {
        if (item.assignments.length > 0) {
          totalPreTax += item.price;
          if (item.taxable) totalTaxableAmount += item.price;
        }
      });
      
      const taxRate = totalTaxableAmount > 0 ? session.taxAmount / totalTaxableAmount : 0;

      // Calculate participant share
      session.lineItems.forEach(item => {
        const assignmentCount = item.assignments.length;
        if (assignmentCount > 0) {
            const isAssigned = item.assignments.some(a => a.participantId === participant.id);
            if (isAssigned) {
                const share = item.price / assignmentCount;
                subtotal += share;
                if (item.taxable) {
                    taxableSubtotal += share;
                }
            }
        }
      });
      
      const taxShare = taxableSubtotal * taxRate;
      const totalOwed = Math.round((subtotal + taxShare) * 100) / 100;

      // Skip if they owe nothing and have no existing record
      if (totalOwed <= 0 && (!session.settlements.find(s => s.participantId === participant.id))) {
          continue; 
      }
      
      // Upsert settlement record
      await prisma.settlement.upsert({
        where: {
          sessionId_participantId: {
            sessionId: session.id,
            participantId: participant.id
          }
        },
        create: {
          sessionId: session.id,
          participantId: participant.id,
          participantName: participant.name,
          amountOwed: totalOwed,
          amountPaid: totalOwed, // Mark as fully paid
          settled: true,
          settledAt: new Date()
        },
        update: {
          amountOwed: totalOwed,
          amountPaid: totalOwed,
          settled: true,
          settledAt: new Date()
        }
      });
      
      settledCount++;
    }

    res.json({ success: true, settledCount });
  } catch (error) {
    console.error('Settle participant error:', error);
    res.status(500).json({ error: 'Failed to settle participant' });
  }
});

export default router;
