import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// List all vaccines
router.get('/vaccines', async (req, res) => {
  try {
    const vaccines = await prisma.vaccine.findMany({
      orderBy: { targetAgeWeeks: 'asc' },
    });
    res.json({ success: true, data: vaccines });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch vaccine schedule.' });
  }
});

// Record or update child vaccination dose
router.post('/record-dose', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const {
    childBeneficiaryId,
    vaccineId,
    administeredDate,
    status = 'COMPLETED',
    facilityId,
    administeredBy,
    batchLotNumber,
    notes,
    isVerified = true,
  } = req.body;

  if (!childBeneficiaryId || !vaccineId) {
    res.status(400).json({ success: false, error: 'Child Beneficiary ID and Vaccine ID are required.' });
    return;
  }

  try {
    const verifiedStatus = isVerified ? 'COMPLETED' : 'UNVERIFIED';

    // Check if scheduled record exists
    const existing = await prisma.childImmunizationRecord.findFirst({
      where: {
        childBeneficiaryId,
        vaccineId,
      },
      include: { vaccine: true },
    });

    let record;
    if (existing) {
      record = await prisma.childImmunizationRecord.update({
        where: { id: existing.id },
        data: {
          administeredDate: administeredDate ? new Date(administeredDate) : new Date(),
          status: verifiedStatus,
          facilityId: facilityId || existing.facilityId,
          administeredBy: administeredBy || req.user!.fullName,
          batchLotNumber: batchLotNumber || existing.batchLotNumber,
          notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}${notes}` : existing.notes,
          verifiedByUserId: isVerified ? req.user!.userId : null,
          verifiedAt: isVerified ? new Date() : null,
        },
        include: { vaccine: true },
      });
    } else {
      const vaccine = await prisma.vaccine.findUnique({ where: { id: vaccineId } });
      if (!vaccine) {
        res.status(404).json({ success: false, error: 'Vaccine not found.' });
        return;
      }

      record = await prisma.childImmunizationRecord.create({
        data: {
          childBeneficiaryId,
          vaccineId,
          dueDate: administeredDate ? new Date(administeredDate) : new Date(),
          administeredDate: administeredDate ? new Date(administeredDate) : new Date(),
          status: verifiedStatus,
          facilityId,
          administeredBy: administeredBy || req.user!.fullName,
          batchLotNumber,
          notes,
          verifiedByUserId: isVerified ? req.user!.userId : null,
          verifiedAt: isVerified ? new Date() : null,
        },
        include: { vaccine: true },
      });
    }

    // Resolve any open follow-up task for this vaccine
    const openTask = await prisma.followUpTask.findFirst({
      where: {
        beneficiaryId: childBeneficiaryId,
        serviceType: record.vaccine.name,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });

    if (openTask) {
      await prisma.followUpTask.update({
        where: { id: openTask.id },
        data: {
          status: 'RESOLVED',
          resolutionNotes: `Vaccine ${record.vaccine.name} marked ${verifiedStatus} by ${req.user!.fullName}`,
          reviewerUserId: req.user!.userId,
        },
      });
    }

    await createAuditLog(
      req,
      'IMMUNIZATION_RECORDED',
      'ChildImmunizationRecord',
      record.id,
      `Recorded ${record.vaccine.name} as ${verifiedStatus} for child ${childBeneficiaryId}`
    );

    res.json({ success: true, data: record });
  } catch (err: any) {
    console.error('Error recording immunization:', err);
    res.status(500).json({ success: false, error: 'Failed to record immunization.' });
  }
});

// Verify an unverified vaccination
router.patch('/verify-dose/:id', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const record = await prisma.childImmunizationRecord.findUnique({
      where: { id },
      include: { vaccine: true },
    });
    if (!record) {
      res.status(404).json({ success: false, error: 'Record not found.' });
      return;
    }

    const updated = await prisma.childImmunizationRecord.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        verifiedByUserId: req.user!.userId,
        verifiedAt: new Date(),
        notes: notes ? `${record.notes ? record.notes + ' | Verified: ' : 'Verified: '}${notes}` : record.notes,
      },
      include: { vaccine: true },
    });

    await createAuditLog(
      req,
      'IMMUNIZATION_VERIFIED',
      'ChildImmunizationRecord',
      id,
      `Verified dose ${record.vaccine.name} for child ${record.childBeneficiaryId}`
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to verify vaccination dose.' });
  }
});

export default router;
