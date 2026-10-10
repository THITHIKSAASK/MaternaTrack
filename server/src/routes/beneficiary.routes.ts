import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// List beneficiaries with authorization & filters
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { role, userId, healthWorkerProfile, parentProfile, clinicianProfile } = req.user!;
    const { search, type, villageId, status, page = '1', limit = '15' } = req.query as Record<string, string>;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where: any = {};

    // 1. Enforce Role Scoping
    if (role === 'PARENT') {
      where.parentUserId = userId;
    } else if (role === 'HEALTH_WORKER') {
      // Scoped to health worker assigned area or assigned worker id
      if (healthWorkerProfile?.id) {
        where.OR = [
          { assignedWorkerId: healthWorkerProfile.id },
          ...(healthWorkerProfile.assignedAreaId ? [{ villageId: healthWorkerProfile.assignedAreaId }] : []),
        ];
      }
    } else if (role === 'DOCTOR') {
      // Doctor can see patients who have referrals or appointments with them
      if (clinicianProfile?.id) {
        where.OR = [
          { appointments: { some: { doctorId: clinicianProfile.id } } },
          { followUpTasks: { some: { referrals: { some: { referredDoctorId: clinicianProfile.id } } } } },
        ];
      }
    } // ADMIN sees all

    // 2. Filters
    if (type && ['MOTHER', 'CHILD'].includes(type)) {
      where.type = type;
    }
    if (villageId) {
      where.villageId = villageId;
    }
    if (search) {
      const s = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { fullName: { contains: s } },
            { tamilName: { contains: s } },
            { beneficiaryId: { contains: s } },
            { rchId: { contains: s } },
          ],
        },
      ];
    }

    const [total, beneficiaries] = await Promise.all([
      prisma.beneficiary.count({ where }),
      prisma.beneficiary.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          village: true,
          assignedWorker: {
            include: { user: { select: { fullName: true, phone: true } } },
          },
          pregnancies: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
          motherRelations: {
            include: { child: true },
          },
          childRelations: {
            include: { mother: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: beneficiaries,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    console.error('Error fetching beneficiaries:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch beneficiaries.' });
  }
});

// Single Beneficiary Detail
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { role, userId, healthWorkerProfile, clinicianProfile } = req.user!;

  try {
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        OR: [{ id }, { beneficiaryId: id }],
      },
      include: {
        village: {
          include: { parentArea: true },
        },
        assignedWorker: {
          include: { user: { select: { fullName: true, phone: true, email: true } } },
        },
        pregnancies: {
          orderBy: { registrationDate: 'desc' },
          include: {
            maternalServices: {
              orderBy: { scheduledDate: 'asc' },
            },
          },
        },
        maternalServices: {
          orderBy: { scheduledDate: 'asc' },
        },
        immunizationRecords: {
          orderBy: { dueDate: 'asc' },
          include: { vaccine: true },
        },
        appointments: {
          orderBy: { scheduledDate: 'desc' },
          include: { doctor: { include: { user: { select: { fullName: true } } } } },
        },
        followUpTasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            contactAttempts: { orderBy: { attemptDate: 'desc' } },
            referrals: {
              include: {
                referredDoctor: { include: { user: { select: { fullName: true } } } },
                clinicalReviews: true,
              },
            },
            supportingDocuments: true,
          },
        },
        reminders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        motherRelations: {
          include: {
            child: {
              include: {
                immunizationRecords: {
                  include: { vaccine: true },
                  orderBy: { dueDate: 'asc' },
                },
              },
            },
          },
        },
        childRelations: {
          include: {
            mother: {
              include: {
                pregnancies: true,
              },
            },
          },
        },
      },
    });

    if (!beneficiary) {
      res.status(404).json({ success: false, error: 'Beneficiary not found.' });
      return;
    }

    // Authorization checks
    if (role === 'PARENT' && beneficiary.parentUserId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied to this beneficiary profile.' });
      return;
    }

    res.json({ success: true, data: beneficiary });
  } catch (err: any) {
    console.error('Error fetching beneficiary detail:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch beneficiary detail.' });
  }
});

export default router;
