import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// Parent: Get all linked family beneficiaries
router.get('/family', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { userId, role } = req.user!;

  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { parentUserId: userId },
      include: {
        village: { include: { parentArea: true } },
        assignedWorker: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
        pregnancies: {
          orderBy: { registrationDate: 'desc' },
          include: {
            maternalServices: { orderBy: { scheduledDate: 'asc' } },
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
          include: { doctor: { include: { user: true, facility: true } } },
        },
        reminders: {
          orderBy: { scheduledFor: 'desc' },
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
            mother: true,
          },
        },
      },
    });

    res.json({ success: true, data: beneficiaries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch family records.' });
  }
});

// Parent: Submit contact/profile change request
router.post('/change-request', authenticateUser, requireRole(['PARENT']), async (req: AuthenticatedRequest, res) => {
  const { beneficiaryId, requestType, oldValue, newValue } = req.body;

  if (!beneficiaryId || !requestType || !newValue) {
    res.status(400).json({
      success: false,
      error: 'Beneficiary ID, request type, and new value are required.',
    });
    return;
  }

  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
    });

    if (!beneficiary || beneficiary.parentUserId !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Access denied to this beneficiary record.' });
      return;
    }

    const changeRequest = await prisma.parentChangeRequest.create({
      data: {
        parentUserId: req.user!.userId,
        beneficiaryId,
        requestType,
        oldValue: oldValue || '',
        newValue,
        status: 'PENDING',
      },
    });

    await createAuditLog(
      req,
      'PARENT_CHANGE_REQUEST_SUBMITTED',
      'ParentChangeRequest',
      changeRequest.id,
      `Requested update for ${requestType} to "${newValue}". Awaiting health worker review.`
    );

    res.json({
      success: true,
      data: changeRequest,
      message: 'Change request submitted successfully. It will take effect after authorized review.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to submit change request.' });
  }
});

// List change requests (Parent sees their own, Health Worker/Admin sees all in their scope)
router.get('/change-requests', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { role, userId } = req.user!;

  try {
    const where: any = {};
    if (role === 'PARENT') {
      where.parentUserId = userId;
    }

    const requests = await prisma.parentChangeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        parentUser: { select: { fullName: true, phone: true, email: true } },
        beneficiary: true,
        reviewedByUser: { select: { fullName: true } },
      },
    });

    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch change requests.' });
  }
});

// Review change request (Health Worker / Admin)
router.patch('/change-requests/:id/review', authenticateUser, requireRole(['HEALTH_WORKER', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ success: false, error: 'Status must be APPROVED or REJECTED.' });
    return;
  }

  try {
    const request = await prisma.parentChangeRequest.findUnique({
      where: { id },
      include: { beneficiary: true },
    });

    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found.' });
      return;
    }

    const updated = await prisma.parentChangeRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedByUserId: req.user!.userId,
        reviewedAt: new Date(),
      },
    });

    // If APPROVED, safely apply the change to the beneficiary or user
    if (status === 'APPROVED') {
      if (request.requestType === 'PHONE_NUMBER') {
        await prisma.user.update({
          where: { id: request.parentUserId },
          data: { phone: request.newValue },
        });
      } else if (request.requestType === 'ADDRESS') {
        await prisma.beneficiary.update({
          where: { id: request.beneficiaryId },
          data: { address: request.newValue },
        });
      }
    }

    await createAuditLog(
      req,
      `PARENT_CHANGE_REQUEST_${status}`,
      'ParentChangeRequest',
      id,
      `Change request for ${request.requestType} marked ${status} by ${req.user!.fullName}`
    );

    res.json({ success: true, data: updated, message: `Change request ${status.toLowerCase()} successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to review change request.' });
  }
});

export default router;
