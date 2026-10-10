import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { closeFollowUpTask, reopenFollowUpTask } from '../services/followUpService.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// List follow up tasks
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { role, healthWorkerProfile, clinicianProfile } = req.user!;
  const { status, priority, areaId } = req.query as Record<string, string>;

  try {
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    if (role === 'HEALTH_WORKER') {
      if (healthWorkerProfile?.id) {
        where.OR = [
          { assignedWorkerId: healthWorkerProfile.id },
          ...(healthWorkerProfile.assignedAreaId ? [{ beneficiary: { villageId: healthWorkerProfile.assignedAreaId } }] : []),
        ];
      }
    } else if (role === 'DOCTOR') {
      if (clinicianProfile?.id) {
        where.referrals = {
          some: { referredDoctorId: clinicianProfile.id },
        };
      }
    }

    const tasks = await prisma.followUpTask.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      include: {
        beneficiary: {
          include: {
            village: true,
          },
        },
        assignedWorker: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        contactAttempts: {
          orderBy: { attemptDate: 'desc' },
          take: 5,
        },
        referrals: {
          include: {
            referredDoctor: { include: { user: { select: { fullName: true } } } },
            clinicalReviews: true,
          },
        },
      },
    });

    res.json({ success: true, data: tasks });
  } catch (err: any) {
    console.error('Error fetching follow up tasks:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch follow-up tasks.' });
  }
});

// Single Task Detail
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.followUpTask.findUnique({
      where: { id },
      include: {
        beneficiary: {
          include: {
            village: { include: { parentArea: true } },
            pregnancies: true,
            assignedWorker: { include: { user: true } },
          },
        },
        assignedWorker: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        contactAttempts: {
          orderBy: { attemptDate: 'desc' },
        },
        referrals: {
          include: {
            referredDoctor: { include: { user: { select: { fullName: true } } } },
            clinicalReviews: { include: { doctor: { include: { user: true } } } },
            supportingDocuments: true,
          },
        },
        supportingDocuments: true,
      },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }

    res.json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch task.' });
  }
});

// Record a contact attempt
router.post('/:id/contact-attempt', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { method, outcome, notes, missedVisitReason, nextAction, nextFollowUpDate } = req.body;

  if (!method || !outcome) {
    res.status(400).json({ success: false, error: 'Contact method and outcome are required.' });
    return;
  }

  try {
    const task = await prisma.followUpTask.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }

    // 1. Create ContactAttempt
    const attempt = await prisma.contactAttempt.create({
      data: {
        followUpTaskId: id,
        method,
        outcome,
        notes,
        workerId: req.user!.userId,
      },
    });

    // 2. Update task details
    const updatedTask = await prisma.followUpTask.update({
      where: { id },
      data: {
        contactAttemptsCount: { increment: 1 },
        lastContactAttemptDate: new Date(),
        missedVisitReason: missedVisitReason || task.missedVisitReason,
        nextAction: nextAction || task.nextAction,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : task.nextFollowUpDate,
        status: task.status === 'OPEN' ? 'IN_PROGRESS' : task.status,
      },
    });

    await createAuditLog(
      req,
      'CONTACT_ATTEMPT_RECORDED',
      'FollowUpTask',
      id,
      `Method: ${method}, Outcome: ${outcome}. Reason: ${missedVisitReason || 'N/A'}`
    );

    res.json({ success: true, data: { attempt, task: updatedTask } });
  } catch (err: any) {
    console.error('Error recording contact attempt:', err);
    res.status(500).json({ success: false, error: 'Failed to record contact attempt.' });
  }
});

// Close task (Enforces critical closure rules)
router.post('/:id/close', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;

  if (!resolutionNotes) {
    res.status(400).json({ success: false, error: 'Resolution notes are required for task closure.' });
    return;
  }

  try {
    const result = await closeFollowUpTask({
      taskId: id,
      closingUserId: req.user!.userId,
      closingUserRole: req.user!.role,
      resolutionNotes,
      req,
    });

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, data: result.task, message: 'Follow-up task closed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to close follow-up task.' });
  }
});

// Reopen task
router.post('/:id/reopen', authenticateUser, requireRole(['HEALTH_WORKER', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ success: false, error: 'Reopening reason is required.' });
    return;
  }

  try {
    const result = await reopenFollowUpTask({
      taskId: id,
      reopeningUserId: req.user!.userId,
      reason,
      req,
    });

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, data: result.task, message: 'Follow-up task reopened.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to reopen task.' });
  }
});

export default router;
