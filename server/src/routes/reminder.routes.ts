import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { processReminderAndOverdueEngine } from '../services/reminderEngine.js';

const router = Router();

// List reminders
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { role, userId } = req.user!;

  try {
    const where: any = {};
    if (role === 'PARENT') {
      where.beneficiary = { parentUserId: userId };
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { scheduledFor: 'desc' },
      take: 50,
      include: {
        beneficiary: {
          select: {
            id: true,
            fullName: true,
            tamilName: true,
            beneficiaryId: true,
            type: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: reminders,
      providerMode: 'LOCAL_SIMULATION_MODE',
      notice: 'Provider not configured. Notifications are simulated locally for academic demonstration.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch reminders.' });
  }
});

// Run engine execution manually (Health worker / Admin)
router.post('/run-engine', authenticateUser, requireRole(['HEALTH_WORKER', 'ADMIN', 'DOCTOR']), async (req: AuthenticatedRequest, res) => {
  const { referenceDate } = req.body;

  try {
    const date = referenceDate ? new Date(referenceDate) : new Date();
    const result = await processReminderAndOverdueEngine(date);

    res.json({
      success: true,
      data: result,
      message: `Engine processed ${result.processedBeneficiariesCount} services. Generated ${result.generatedRemindersCount} reminders and ${result.overdueTasksCreatedCount} follow-up tasks.`,
    });
  } catch (err: any) {
    console.error('Error running reminder engine:', err);
    res.status(500).json({ success: false, error: 'Failed to run reminder engine.' });
  }
});

export default router;
