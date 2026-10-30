import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// List beneficiaries with authorization & filters
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { role, userId, healthWorkerProfile, clinicianProfile } = req.user!;
    const { search, type, villageId, status, page = '1', limit = '50' } = req.query as Record<string, string>;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where: any = {};

    // 1. Enforce Role Scoping
    if (role === 'PARENT') {
      where.parentUserId = userId;
    } else if (role === 'HEALTH_WORKER') {
      // Health worker sees assigned beneficiaries or beneficiaries in their assigned administrative area
      if (healthWorkerProfile?.id) {
        where.OR = [
          { assignedWorkerId: healthWorkerProfile.id },
          ...(healthWorkerProfile.assignedAreaId ? [{ villageId: healthWorkerProfile.assignedAreaId }] : []),
        ];
      }
    } else if (role === 'DOCTOR') {
      // DOCTOR has clinical visibility across registered facility and community beneficiaries
      // so newly registered patients by health workers reflect immediately to doctors
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
            include: {
              maternalServices: {
                orderBy: { scheduledDate: 'asc' },
              },
            },
          },
          immunizationRecords: {
            include: { vaccine: true },
            orderBy: { dueDate: 'asc' },
            take: 5,
          },
          appointments: {
            take: 3,
            orderBy: { scheduledDate: 'desc' },
            include: { doctor: { include: { user: { select: { fullName: true } } } } },
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
  const { role, userId } = req.user!;

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

// Register New Beneficiary (Health Worker, Doctor, Admin)
router.post('/', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      fullName,
      tamilName,
      type,
      dobOrLmp,
      gender,
      bloodGroup,
      aadharRef,
      rchId,
      address,
      villageId: inputVillageId,
      assignedWorkerId: inputWorkerId,
      highRiskStatus = false,
      riskNotes,
      gravidity = 1,
      parity = 0,
      phone,
    } = req.body;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      res.status(400).json({ success: false, error: 'Patient full name is required.' });
      return;
    }

    if (!type || !['MOTHER', 'CHILD'].includes(type)) {
      res.status(400).json({ success: false, error: 'Valid beneficiary type (MOTHER or CHILD) is required.' });
      return;
    }

    if (!dobOrLmp) {
      res.status(400).json({
        success: false,
        error: type === 'MOTHER' ? 'Last Menstrual Period (LMP) date is required.' : 'Date of Birth (DOB) is required.',
      });
      return;
    }

    const parsedDate = new Date(dobOrLmp);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ success: false, error: 'Invalid date provided for DOB/LMP.' });
      return;
    }

    // Determine assigned worker
    let assignedWorkerId = inputWorkerId || null;
    if (!assignedWorkerId && req.user?.healthWorkerProfile?.id) {
      assignedWorkerId = req.user.healthWorkerProfile.id;
    } else if (!assignedWorkerId) {
      const defaultWorker = await prisma.healthWorkerProfile.findFirst();
      if (defaultWorker) assignedWorkerId = defaultWorker.id;
    }

    // Determine village
    let villageId = inputVillageId || null;
    if (!villageId && req.user?.healthWorkerProfile?.assignedAreaId) {
      villageId = req.user.healthWorkerProfile.assignedAreaId;
    } else if (!villageId) {
      const defaultVillage = await prisma.administrativeArea.findFirst({
        where: { type: 'VILLAGE_PANCHAYAT' },
      });
      if (defaultVillage) villageId = defaultVillage.id;
    }

    // Generate unique Beneficiary ID
    const totalCount = await prisma.beneficiary.count();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const beneficiaryId = `TN-ERD-${type === 'MOTHER' ? 'M' : 'C'}${String(totalCount + 1).padStart(3, '0')}-${randomSuffix}`;

    const newBeneficiary = await prisma.$transaction(async (tx) => {
      // 1. Create Beneficiary
      const beneficiary = await tx.beneficiary.create({
        data: {
          beneficiaryId,
          type,
          fullName: fullName.trim(),
          tamilName: (tamilName && tamilName.trim()) || fullName.trim(),
          dobOrLmp: parsedDate,
          gender: gender || (type === 'MOTHER' ? 'FEMALE' : 'FEMALE'),
          bloodGroup: bloodGroup || null,
          aadharRef: aadharRef ? aadharRef.replace(/\d(?=\d{4})/g, 'X') : null,
          rchId: rchId || `RCH-${Date.now().toString().slice(-8)}`,
          address: address || null,
          villageId: villageId || null,
          assignedWorkerId: assignedWorkerId || null,
        },
      });

      // 2. If MOTHER: Create active Pregnancy & standard Maternal Services
      if (type === 'MOTHER') {
        const eddDate = new Date(parsedDate.getTime() + 280 * 24 * 60 * 60 * 1000);
        const pregnancy = await tx.pregnancy.create({
          data: {
            motherBeneficiaryId: beneficiary.id,
            lmpDate: parsedDate,
            eddDate,
            gravidity: Number(gravidity) || 1,
            parity: Number(parity) || 0,
            highRiskStatus: Boolean(highRiskStatus),
            riskNotes: riskNotes || (highRiskStatus ? 'Flagged as high-risk during registration' : null),
            status: 'ACTIVE',
          },
        });

        // Seed initial maternal services relative to LMP
        const maternalServicesList = [
          { serviceType: 'ANC_1', daysOffset: 60 },
          { serviceType: 'ANC_2', daysOffset: 140 },
          { serviceType: 'ANC_3', daysOffset: 210 },
          { serviceType: 'ANC_4', daysOffset: 252 },
          { serviceType: 'TT_TD_1', daysOffset: 90 },
          { serviceType: 'TT_TD_2', daysOffset: 120 },
          { serviceType: 'IFA_DISTRIBUTION', daysOffset: 100 },
          { serviceType: 'USG_SCAN', daysOffset: 130 },
        ];

        for (const s of maternalServicesList) {
          const scheduledDate = new Date(parsedDate.getTime() + s.daysOffset * 24 * 60 * 60 * 1000);
          await tx.maternalService.create({
            data: {
              pregnancyId: pregnancy.id,
              beneficiaryId: beneficiary.id,
              serviceType: s.serviceType,
              scheduledDate,
              status: scheduledDate < new Date() ? 'COMPLETED' : 'SCHEDULED',
              completedDate: scheduledDate < new Date() ? scheduledDate : null,
              administeredBy: req.user?.fullName,
            },
          });
        }
      }

      // 3. If CHILD: Seed core child immunization records based on NIS schedule
      if (type === 'CHILD') {
        const vaccines = await tx.vaccine.findMany({
          orderBy: { targetAgeWeeks: 'asc' },
        });

        for (const v of vaccines) {
          const dueDate = new Date(parsedDate.getTime() + v.targetAgeWeeks * 7 * 24 * 60 * 60 * 1000);
          await tx.childImmunizationRecord.create({
            data: {
              childBeneficiaryId: beneficiary.id,
              vaccineId: v.id,
              dueDate,
              status: dueDate < new Date() ? 'COMPLETED' : 'SCHEDULED',
              administeredDate: dueDate < new Date() ? dueDate : null,
              administeredBy: req.user?.fullName,
            },
          });
        }
      }

      return beneficiary;
    });

    // 4. Create Audit Log so this action is permanently recorded and visible to Admin
    await createAuditLog(
      req,
      'BENEFICIARY_REGISTERED',
      'Beneficiary',
      newBeneficiary.id,
      `New ${type.toLowerCase()} patient ${fullName} (${newBeneficiary.beneficiaryId}) registered by ${req.user!.fullName} (${req.user!.role}).`
    );

    // 5. Fetch complete newly created beneficiary with relations
    const fullCreated = await prisma.beneficiary.findUnique({
      where: { id: newBeneficiary.id },
      include: {
        village: true,
        assignedWorker: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        pregnancies: {
          where: { status: 'ACTIVE' },
          include: { maternalServices: true },
        },
        immunizationRecords: {
          include: { vaccine: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `${type === 'MOTHER' ? 'Mother' : 'Child'} patient registered successfully and synchronized across Doctor and Admin workspaces!`,
      data: fullCreated,
    });
  } catch (err: any) {
    console.error('Error creating beneficiary:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to register new beneficiary.' });
  }
});

export default router;
