import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure safe file upload storage (handles Vercel serverless /tmp vs local disk)
const uploadDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve('uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Uploads] Could not initialize directory:', err);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {}
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG documents are allowed.'));
    }
  },
});

// List clinicians with verification status for referrals
router.get('/clinicians', authenticateUser, async (req, res) => {
  try {
    const clinicians = await prisma.clinicianProfile.findMany({
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        facility: true,
        credentialVerifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    res.json({ success: true, data: clinicians });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch clinicians.' });
  }
});

// List referrals (role scoped)
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { role, clinicianProfile, healthWorkerProfile } = req.user!;
  const { status } = req.query as Record<string, string>;

  try {
    const where: any = {};
    if (role === 'DOCTOR' && clinicianProfile?.id) {
      where.referredDoctorId = clinicianProfile.id;
    } else if (role === 'HEALTH_WORKER' && healthWorkerProfile?.id) {
      where.referringWorkerId = healthWorkerProfile.id;
    }

    if (status) {
      where.status = status;
    }

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { referralDate: 'desc' },
      include: {
        beneficiary: {
          include: {
            village: true,
            pregnancies: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
        referringWorker: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        referredDoctor: {
          include: { user: { select: { fullName: true } }, facility: true },
        },
        clinicalReviews: {
          include: { doctor: { include: { user: true } } },
        },
        supportingDocuments: true,
        followUpTask: true,
      },
    });

    res.json({ success: true, data: referrals });
  } catch (err: any) {
    console.error('Error fetching referrals:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch referrals.' });
  }
});

// Create a Referral (Health Worker, Admin)
router.post('/', authenticateUser, requireRole(['HEALTH_WORKER', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const {
    beneficiaryId,
    referredDoctorId,
    followUpTaskId,
    reason,
    priority = 'MEDIUM',
  } = req.body;

  if (!beneficiaryId || !referredDoctorId || !reason) {
    res.status(400).json({
      success: false,
      error: 'Beneficiary ID, Referred Doctor ID, and Reason are required.',
    });
    return;
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        beneficiaryId,
        referredDoctorId,
        followUpTaskId: followUpTaskId || null,
        referringWorkerId: req.user!.healthWorkerProfile?.id || null,
        reason,
        priority,
        status: 'PENDING',
      },
      include: {
        referredDoctor: { include: { user: true } },
        beneficiary: true,
      },
    });

    // If follow-up task exists, mark as REFERRED and set requiresClinicianApproval
    if (followUpTaskId) {
      await prisma.followUpTask.update({
        where: { id: followUpTaskId },
        data: {
          status: 'REFERRED',
          requiresClinicianApproval: true,
          nextAction: 'REFERRAL',
        },
      });
    }

    await createAuditLog(
      req,
      'REFERRAL_CREATED',
      'Referral',
      referral.id,
      `Referred beneficiary ${referral.beneficiary.fullName} to Dr. ${referral.referredDoctor.user.fullName} for: ${reason}`
    );

    res.json({ success: true, data: referral });
  } catch (err: any) {
    console.error('Error creating referral:', err);
    res.status(500).json({ success: false, error: 'Failed to create referral.' });
  }
});

// Update Referral Status (Accept / Reject)
router.patch('/:id/status', authenticateUser, requireRole(['DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, doctorNotes } = req.body;

  if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
    res.status(400).json({ success: false, error: 'Valid status (ACCEPTED or REJECTED) required.' });
    return;
  }

  try {
    const referral = await prisma.referral.update({
      where: { id },
      data: {
        status,
        doctorNotes,
        reviewedAt: new Date(),
      },
    });

    await createAuditLog(
      req,
      `REFERRAL_${status}`,
      'Referral',
      id,
      `Doctor marked referral as ${status}. Notes: ${doctorNotes || 'None'}`
    );

    res.json({ success: true, data: referral });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update referral status.' });
  }
});

// Submit Clinical Review (Doctor)
router.post('/:id/clinical-review', authenticateUser, requireRole(['DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { clinicalFindings, followUpPlan, nextReviewDate, status = 'APPROVED' } = req.body;

  if (!clinicalFindings) {
    res.status(400).json({ success: false, error: 'Clinical findings are required.' });
    return;
  }

  try {
    const referral = await prisma.referral.findUnique({
      where: { id },
      include: { followUpTask: true },
    });

    if (!referral) {
      res.status(404).json({ success: false, error: 'Referral not found.' });
      return;
    }

    const review = await prisma.clinicalReview.create({
      data: {
        referralId: id,
        followUpTaskId: referral.followUpTaskId,
        doctorId: req.user!.clinicianProfile?.id || referral.referredDoctorId,
        clinicalFindings,
        followUpPlan,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        status,
      },
    });

    // Update referral status to COMPLETED if approved
    if (status === 'APPROVED') {
      await prisma.referral.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    }

    await createAuditLog(
      req,
      'CLINICAL_REVIEW_SUBMITTED',
      'ClinicalReview',
      review.id,
      `Clinical review submitted with status ${status} by Dr. ${req.user!.fullName}`
    );

    res.json({ success: true, data: review });
  } catch (err: any) {
    console.error('Error submitting clinical review:', err);
    res.status(500).json({ success: false, error: 'Failed to submit clinical review.' });
  }
});

// Upload Supporting Document (Multer)
router.post('/:id/upload-document', authenticateUser, upload.single('document'), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    res.status(400).json({ success: false, error: 'No document file uploaded.' });
    return;
  }

  try {
    const referral = await prisma.referral.findUnique({ where: { id } });
    if (!referral) {
      res.status(404).json({ success: false, error: 'Referral not found.' });
      return;
    }

    const doc = await prisma.supportingDocument.create({
      data: {
        referralId: id,
        followUpTaskId: referral.followUpTaskId,
        uploaderUserId: req.user!.userId,
        originalFilename: file.originalname,
        storedFilename: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        reviewStatus: 'PENDING', // Uploading a document does NOT automatically count as approval!
      },
    });

    await createAuditLog(
      req,
      'DOCUMENT_UPLOADED',
      'SupportingDocument',
      doc.id,
      `File ${file.originalname} uploaded by ${req.user!.fullName}. Status remains PENDING.`
    );

    res.json({
      success: true,
      data: doc,
      message: 'Document uploaded successfully. Document review status is PENDING review.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to upload document.' });
  }
});

// Update Document Review Status (Doctor / Admin)
router.patch('/documents/:docId/status', authenticateUser, requireRole(['DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { docId } = req.params;
  const { reviewStatus } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(reviewStatus)) {
    res.status(400).json({ success: false, error: 'Review status must be APPROVED or REJECTED.' });
    return;
  }

  try {
    const doc = await prisma.supportingDocument.update({
      where: { id: docId },
      data: { reviewStatus },
    });

    await createAuditLog(
      req,
      'DOCUMENT_REVIEW_UPDATED',
      'SupportingDocument',
      docId,
      `Document review status marked as ${reviewStatus} by ${req.user!.fullName}`
    );

    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update document status.' });
  }
});

export default router;
