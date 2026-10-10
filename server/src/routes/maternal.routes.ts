import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// Record or update a maternal service (Health Worker, Doctor, Admin)
router.post('/record-service', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const {
    pregnancyId,
    beneficiaryId,
    serviceType,
    completedDate,
    status = 'COMPLETED',
    facilityId,
    administeredBy,
    batchNumber,
    notes,
    isVerified = true,
  } = req.body;

  if (!beneficiaryId || !serviceType) {
    res.status(400).json({ success: false, error: 'Beneficiary ID and Service Type are required.' });
    return;
  }

  try {
    const verifiedStatus = isVerified ? 'COMPLETED' : 'UNVERIFIED';

    // Find if scheduled service exists to update
    const existing = await prisma.maternalService.findFirst({
      where: {
        beneficiaryId,
        serviceType,
        status: { in: ['SCHEDULED', 'OVERDUE', 'UNVERIFIED'] },
      },
    });

    let service;
    if (existing) {
      service = await prisma.maternalService.update({
        where: { id: existing.id },
        data: {
          completedDate: completedDate ? new Date(completedDate) : new Date(),
          status: verifiedStatus,
          facilityId: facilityId || existing.facilityId,
          administeredBy: administeredBy || req.user!.fullName,
          batchNumber: batchNumber || existing.batchNumber,
          notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}${notes}` : existing.notes,
          verifiedByUserId: isVerified ? req.user!.userId : null,
          verifiedAt: isVerified ? new Date() : null,
        },
      });
    } else {
      let resolvedPregnancyId = pregnancyId;
      if (!resolvedPregnancyId) {
        const activePreg = await prisma.pregnancy.findFirst({
          where: { motherBeneficiaryId: beneficiaryId, status: 'ACTIVE' },
        });
        resolvedPregnancyId = activePreg?.id;
      }

      if (!resolvedPregnancyId) {
        res.status(400).json({ success: false, error: 'No active pregnancy record linked to this mother.' });
        return;
      }

      service = await prisma.maternalService.create({
        data: {
          pregnancyId: resolvedPregnancyId,
          beneficiaryId,
          serviceType,
          scheduledDate: completedDate ? new Date(completedDate) : new Date(),
          completedDate: completedDate ? new Date(completedDate) : new Date(),
          status: verifiedStatus,
          facilityId,
          administeredBy: administeredBy || req.user!.fullName,
          batchNumber,
          notes,
          verifiedByUserId: isVerified ? req.user!.userId : null,
          verifiedAt: isVerified ? new Date() : null,
        },
      });
    }

    // If there was an open follow-up task for this service, resolve it!
    const openTask = await prisma.followUpTask.findFirst({
      where: {
        beneficiaryId,
        serviceType,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });

    if (openTask) {
      await prisma.followUpTask.update({
        where: { id: openTask.id },
        data: {
          status: 'RESOLVED',
          resolutionNotes: `Service marked ${verifiedStatus} by ${req.user!.fullName} on ${new Date().toLocaleDateString()}`,
          reviewerUserId: req.user!.userId,
        },
      });
    }

    await createAuditLog(
      req,
      'MATERNAL_SERVICE_RECORDED',
      'MaternalService',
      service.id,
      `Recorded ${serviceType} as ${verifiedStatus} for beneficiary ${beneficiaryId}`
    );

    res.json({ success: true, data: service });
  } catch (err: any) {
    console.error('Error recording maternal service:', err);
    res.status(500).json({ success: false, error: 'Failed to record maternal service.' });
  }
});

// Verify an unverified service
router.patch('/verify-service/:id', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const service = await prisma.maternalService.findUnique({ where: { id } });
    if (!service) {
      res.status(404).json({ success: false, error: 'Maternal service not found.' });
      return;
    }

    const updated = await prisma.maternalService.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        verifiedByUserId: req.user!.userId,
        verifiedAt: new Date(),
        notes: notes ? `${service.notes ? service.notes + ' | Verified: ' : 'Verified: '}${notes}` : service.notes,
      },
    });

    await createAuditLog(
      req,
      'MATERNAL_SERVICE_VERIFIED',
      'MaternalService',
      id,
      `Verified by ${req.user!.fullName} (${req.user!.role})`
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to verify maternal service.' });
  }
});

export default router;
