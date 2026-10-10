import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { validateDoctorAppointment } from '../services/appointmentValidator.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// List appointments (role-scoped)
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { role, userId, clinicianProfile } = req.user!;
  const { doctorId, date, status } = req.query as Record<string, string>;

  try {
    const where: any = {};

    if (role === 'DOCTOR') {
      if (clinicianProfile?.id) {
        where.doctorId = clinicianProfile.id;
      }
    } else if (role === 'PARENT') {
      where.beneficiary = { parentUserId: userId };
    } else if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: startOfDay, lte: endOfDay };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      include: {
        doctor: {
          include: {
            user: { select: { fullName: true, phone: true } },
            facility: true,
          },
        },
        beneficiary: {
          include: {
            village: true,
            pregnancies: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
      },
    });

    res.json({ success: true, data: appointments });
  } catch (err: any) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments.' });
  }
});

// Create appointment (with conflict check and break time check)
router.post('/', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const {
    doctorId,
    beneficiaryId,
    scheduledDate,
    startTime,
    endTime,
    consultationType = 'ANTENATAL_CHECKUP',
    notes,
  } = req.body;

  if (!doctorId || !beneficiaryId || !scheduledDate || !startTime || !endTime) {
    res.status(400).json({
      success: false,
      error: 'Doctor ID, Beneficiary ID, Scheduled Date, Start Time and End Time are required.',
    });
    return;
  }

  try {
    // 1. Conflict and Break time check
    const validation = await validateDoctorAppointment({
      doctorId,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
    });

    if (!validation.valid) {
      res.status(409).json({ success: false, error: validation.reason });
      return;
    }

    // 2. Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        beneficiaryId,
        scheduledDate: new Date(scheduledDate),
        startTime,
        endTime,
        consultationType,
        notes,
        createdByUserId: req.user!.userId,
        status: 'SCHEDULED',
      },
      include: {
        doctor: { include: { user: true } },
        beneficiary: true,
      },
    });

    await createAuditLog(
      req,
      'APPOINTMENT_CREATED',
      'Appointment',
      appointment.id,
      `Booked appointment with Dr. ${appointment.doctor.user.fullName} on ${scheduledDate} (${startTime} - ${endTime})`
    );

    res.json({ success: true, data: appointment });
  } catch (err: any) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ success: false, error: 'Failed to create appointment.' });
  }
});

// Reschedule appointment
router.patch('/:id/reschedule', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { scheduledDate, startTime, endTime, notes } = req.body;

  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found.' });
      return;
    }

    const validation = await validateDoctorAppointment({
      doctorId: existing.doctorId,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      excludeAppointmentId: id,
    });

    if (!validation.valid) {
      res.status(409).json({ success: false, error: validation.reason });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledDate: new Date(scheduledDate),
        startTime,
        endTime,
        status: 'RESCHEDULED',
        notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}Rescheduled: ${notes}` : existing.notes,
      },
    });

    await createAuditLog(
      req,
      'APPOINTMENT_RESCHEDULED',
      'Appointment',
      id,
      `Rescheduled to ${scheduledDate} (${startTime} - ${endTime})`
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to reschedule appointment.' });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required.' });
    return;
  }

  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found.' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}${notes}` : existing.notes,
      },
    });

    await createAuditLog(
      req,
      'APPOINTMENT_STATUS_UPDATED',
      'Appointment',
      id,
      `Status updated to ${status}`
    );

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update appointment status.' });
  }
});

export default router;
