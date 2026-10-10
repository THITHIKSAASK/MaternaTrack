import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// Ensure all endpoints in this router require ADMIN
router.use(authenticateUser, requireRole(['ADMIN']));

// List users with roles & status
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        preferredLanguage: true,
        isActive: true,
        createdAt: true,
        clinicianProfile: true,
        healthWorkerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-active', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    await createAuditLog(
      req,
      'USER_STATUS_TOGGLED',
      'User',
      id,
      `User ${user.email} status changed to ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}`
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to toggle user status.' });
  }
});

// List clinicians and their credential verification status
router.get('/clinicians', async (req, res) => {
  try {
    const clinicians = await prisma.clinicianProfile.findMany({
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        facility: true,
        credentialVerifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    res.json({ success: true, data: clinicians });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch clinicians.' });
  }
});

// Verify Clinician Credentials (ADMIN only)
router.post('/clinicians/:id/verify-credentials', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, notes, documentUrl } = req.body; // status: VERIFIED or REJECTED

  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    res.status(400).json({ success: false, error: 'Status must be VERIFIED or REJECTED.' });
    return;
  }

  try {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!clinician) {
      res.status(404).json({ success: false, error: 'Clinician profile not found.' });
      return;
    }

    // 1. Create verification record
    const record = await prisma.credentialVerification.create({
      data: {
        clinicianId: id,
        verifiedByUserId: req.user!.userId,
        status,
        notes,
        documentUrl,
        verifiedAt: new Date(),
      },
    });

    // 2. Update isRegistrationVerified on clinicianProfile
    const isVerified = status === 'VERIFIED';
    const updatedClinician = await prisma.clinicianProfile.update({
      where: { id },
      data: { isRegistrationVerified: isVerified },
      include: { user: true },
    });

    await createAuditLog(
      req,
      `CLINICIAN_CREDENTIAL_${status}`,
      'ClinicianProfile',
      id,
      `Admin ${req.user!.fullName} marked Dr. ${clinician.user.fullName} credentials as ${status}. Notes: ${notes || 'Verified'}`
    );

    res.json({
      success: true,
      data: { verification: record, clinician: updatedClinician },
      message: `Clinician credentials successfully marked as ${status}.`,
    });
  } catch (err: any) {
    console.error('Error verifying clinician credentials:', err);
    res.status(500).json({ success: false, error: 'Failed to update credential verification.' });
  }
});

// Administrative areas list
router.get('/areas', async (req, res) => {
  try {
    const areas = await prisma.administrativeArea.findMany({
      orderBy: { name: 'asc' },
      include: {
        subAreas: true,
        facilities: true,
      },
    });
    res.json({ success: true, data: areas });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch administrative areas.' });
  }
});

// View Audit Logs
router.get('/audit-logs', async (req, res) => {
  const { page = '1', limit = '30' } = req.query as Record<string, string>;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  try {
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { fullName: true, email: true, role: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs.' });
  }
});

export default router;
