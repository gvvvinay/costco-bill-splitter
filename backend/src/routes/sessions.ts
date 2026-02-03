import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all sessions for current user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.billSplitSession.findMany({
      where: { userId: req.userId },
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get single session
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
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
          },
          orderBy: { orderIndex: 'asc' }
        },
        settlements: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Create new session
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    // Get the current user to auto-add them as first participant
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    const session = await prisma.billSplitSession.create({
      data: {
        name,
        userId: req.userId!,
        participants: {
          create: {
            name: currentUser.username
          }
        }
      },
      include: {
        participants: true,
        lineItems: true
      }
    });

    res.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Archive/Unarchive session
router.patch('/:id/archive', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { archived } = req.body;

    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await prisma.billSplitSession.update({
      where: { id: req.params.id },
      data: {
        archived: archived ?? true,
        archivedAt: archived ? new Date() : null
      },
      include: {
        participants: true,
        lineItems: true
      }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Archive session error:', error);
    res.status(500).json({ error: 'Failed to archive session' });
  }
});

// Add participant
router.post('/:id/participants', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Participant name is required' });
    }

    // Verify session ownership
    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participant = await prisma.participant.create({
      data: {
        name,
        sessionId: req.params.id
      }
    });

    res.json(participant);
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

// Update line item
router.put('/:sessionId/items/:itemId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, quantity, price, taxable } = req.body;

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

    const lineItem = await prisma.lineItem.update({
      where: { id: req.params.itemId },
      data: {
        ...(name !== undefined && { name }),
        ...(quantity !== undefined && { quantity }),
        ...(price !== undefined && { price }),
        ...(taxable !== undefined && { taxable })
      },
      include: {
        assignments: {
          include: {
            participant: true
          }
        }
      }
    });

    res.json(lineItem);
  } catch (error) {
    console.error('Update line item error:', error);
    res.status(500).json({ error: 'Failed to update line item' });
  }
});

// Delete line item
router.delete('/:sessionId/items/:itemId', authMiddleware, async (req: AuthRequest, res) => {
  try {
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

    await prisma.lineItem.delete({
      where: { id: req.params.itemId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete line item error:', error);
    res.status(500).json({ error: 'Failed to delete line item' });
  }
});

// Update line item (edit name/price)
router.put('/:sessionId/items/:itemId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, price } = req.body;

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

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    // Update the item
    const updatedItem = await prisma.lineItem.update({
      where: { id: req.params.itemId },
      data: {
        name: name.trim(),
        price: price
      },
      include: {
        assignments: {
          include: {
            participant: true
          }
        }
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update line item error:', error);
    res.status(500).json({ error: 'Failed to update line item' });
  }
});

// Add new line item
router.post('/:sessionId/items', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, price, quantity = 1 } = req.body;

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

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Get the highest orderIndex for new items
    const lastItem = await prisma.lineItem.findFirst({
      where: { sessionId: req.params.sessionId },
      orderBy: { orderIndex: 'desc' }
    });

    const newOrderIndex = (lastItem?.orderIndex ?? -1) + 1;

    // Create new item
    const newItem = await prisma.lineItem.create({
      data: {
        name: name.trim(),
        price: price,
        quantity: quantity,
        taxable: false,
        orderIndex: newOrderIndex,
        sessionId: req.params.sessionId
      },
      include: {
        assignments: {
          include: {
            participant: true
          }
        }
      }
    });

    res.json(newItem);
  } catch (error) {
    console.error('Add line item error:', error);
    res.status(500).json({ error: 'Failed to add line item' });
  }
});

// Assign item to participants
router.post('/:sessionId/items/:itemId/assign', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { participantIds } = req.body;

    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'participantIds must be an array' });
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

    // Delete existing assignments
    await prisma.itemAssignment.deleteMany({
      where: { lineItemId: req.params.itemId }
    });

    // Create new assignments
    if (participantIds.length > 0) {
      await prisma.itemAssignment.createMany({
        data: participantIds.map(participantId => ({
          lineItemId: req.params.itemId,
          participantId
        }))
      });
    }

    const lineItem = await prisma.lineItem.findUnique({
      where: { id: req.params.itemId },
      include: {
        assignments: {
          include: {
            participant: true
          }
        }
      }
    });

    res.json(lineItem);
  } catch (error) {
    console.error('Assign item error:', error);
    res.status(500).json({ error: 'Failed to assign item' });
  }
});

// Calculate split
router.get('/:id/calculate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
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

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Calculate totals
    const participantTotals: Record<string, {
      participantId: string;
      name: string;
      subtotal: number;
      taxAmount: number;
      total: number;
      items: Array<{ name: string; price: number; splitCount: number; share: number }>;
    }> = {};

    // Initialize participant totals
    session.participants.forEach((p) => {
      participantTotals[p.id] = {
        participantId: p.id,
        name: p.name,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        items: []
      };
    });

    let totalPreTax = 0;
    let totalTaxableAmount = 0;

    // Calculate subtotals
    session.lineItems.forEach((item) => {
      const assignmentCount = item.assignments.length;
      
      if (assignmentCount > 0) {
        const sharePerPerson = item.price / assignmentCount;
        
        item.assignments.forEach((assignment) => {
          const participantData = participantTotals[assignment.participantId];
          if (participantData) {
            participantData.subtotal += sharePerPerson;
            participantData.items.push({
              name: item.name,
              price: item.price,
              splitCount: assignmentCount,
              share: sharePerPerson,
              taxable: item.taxable
            } as any);
          }
        });

        totalPreTax += item.price;
        if (item.taxable) {
          totalTaxableAmount += item.price;
        }
      }
    });

    // Calculate tax proportionally
    const taxRate = totalTaxableAmount > 0 ? session.taxAmount / totalTaxableAmount : 0;

    Object.values(participantTotals).forEach(p => {
      // Calculate tax for this participant's taxable items
      const taxableSubtotal = (p.items as any[])
        .filter(item => item.taxable)
        .reduce((sum, item) => sum + item.share, 0);
      
      p.taxAmount = Math.round(taxableSubtotal * taxRate * 100) / 100;
      p.total = Math.round((p.subtotal + p.taxAmount) * 100) / 100;
      p.subtotal = Math.round(p.subtotal * 100) / 100;
      
      // Remove taxable flag from items before sending response
      p.items = (p.items as any[]).map(({ taxable, ...item }) => item);
    });

    // Handle rounding errors
    const calculatedTotal = Object.values(participantTotals)
      .reduce((sum, p) => sum + p.total, 0);
    const actualTotal = totalPreTax + session.taxAmount;
    const roundingError = Math.round((actualTotal - calculatedTotal) * 100) / 100;

    res.json({
      participants: Object.values(participantTotals),
      summary: {
        subtotal: Math.round(totalPreTax * 100) / 100,
        tax: session.taxAmount,
        total: actualTotal,
        roundingError
      }
    });
  } catch (error) {
    console.error('Calculate split error:', error);
    res.status(500).json({ error: 'Failed to calculate split' });
  }
});

// Mark session as settled
router.post('/:id/settle', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { settlements } = req.body; // Array of { participantId, participantName, amount, settled }

    const session = await prisma.billSplitSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Create or update settlements
    if (settlements && Array.isArray(settlements)) {
      for (const settlement of settlements) {
        await prisma.settlement.upsert({
          where: {
            sessionId_participantId: {
              sessionId: req.params.id,
              participantId: settlement.participantId
            }
          },
          create: {
            sessionId: req.params.id,
            participantId: settlement.participantId,
            participantName: settlement.participantName,
            amountOwed: settlement.amount,
            amountPaid: settlement.settled ? settlement.amount : 0,
            settled: settlement.settled,
            settledAt: settlement.settled ? new Date() : null
          },
          update: {
            amountPaid: settlement.settled ? settlement.amount : 0,
            settled: settlement.settled,
            settledAt: settlement.settled ? new Date() : null
          }
        });
      }
    }

    // Check if all settlements are complete
    const allSettlements = await prisma.settlement.findMany({
      where: { sessionId: req.params.id }
    });

    const allSettled = allSettlements.every(s => s.settled);

    // Update session settled status
    const updatedSession = await prisma.billSplitSession.update({
      where: { id: req.params.id },
      data: {
        settled: allSettled,
        settledAt: allSettled ? new Date() : null
      },
      include: {
        settlements: true
      }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Settlement error:', error);
    res.status(500).json({ error: 'Failed to update settlement' });
  }
});

// Export sessions to CSV
router.get('/export/csv', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = {
      userId: req.userId
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate as string);
      }
    }

    const sessions = await prisma.billSplitSession.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Build CSV
    let csv = 'Session Name,Date,Participant,Item,Price,Split Count,Amount Owed,Settled,Total\n';

    for (const session of sessions) {
      for (const item of session.lineItems) {
        for (const assignment of item.assignments) {
          const splitCount = item.assignments.length;
          const shareAmount = (item.price / splitCount).toFixed(2);
          const settlement = session.settlements?.find(s => s.participantId === assignment.participantId);
          const settled = settlement?.settled ? 'Yes' : 'No';
          
          csv += `"${session.name}",${session.createdAt.toISOString().split('T')[0]},${assignment.participant.name},"${item.name}",${item.price},${splitCount},${shareAmount},${settled},${session.totalAmount}\n`;
        }
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="costco-splits-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
