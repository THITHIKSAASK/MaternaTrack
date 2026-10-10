import { prisma } from '../prisma.js';

export interface TimeSlot {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export function parseMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function isOverlapping(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = parseMinutes(slot1.startTime);
  const end1 = parseMinutes(slot1.endTime);
  const start2 = parseMinutes(slot2.startTime);
  const end2 = parseMinutes(slot2.endTime);

  // Overlap occurs if start of one is before end of other, and end of one is after start of other
  return Math.max(start1, start2) < Math.min(end1, end2);
}

export async function validateDoctorAppointment(params: {
  doctorId: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  excludeAppointmentId?: string;
}): Promise<{ valid: boolean; reason?: string }> {
  const { doctorId, scheduledDate, startTime, endTime, excludeAppointmentId } = params;

  // 1. Fetch Doctor profile including breakTimings
  const doctor = await prisma.clinicianProfile.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    return { valid: false, reason: 'Doctor profile not found.' };
  }

  // 2. Validate start < end
  const startMin = parseMinutes(startTime);
  const endMin = parseMinutes(endTime);
  if (endMin <= startMin) {
    return { valid: false, reason: 'Appointment end time must be after start time.' };
  }

  // 3. Check Break Timings
  if (doctor.breakTimings) {
    try {
      const breaks: TimeSlot[] = JSON.parse(doctor.breakTimings);
      for (const b of breaks) {
        if (isOverlapping({ startTime, endTime }, b)) {
          return {
            valid: false,
            reason: `Appointment overlaps with doctor's scheduled break (${b.startTime} - ${b.endTime}).`,
          };
        }
      }
    } catch (e) {
      // ignore parse error if custom format
    }
  }

  // 4. Check existing appointments on the same date for this doctor
  const startOfDay = new Date(scheduledDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(scheduledDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
  });

  for (const existing of existingAppointments) {
    if (
      isOverlapping(
        { startTime, endTime },
        { startTime: existing.startTime, endTime: existing.endTime }
      )
    ) {
      return {
        valid: false,
        reason: `Doctor already has a scheduled appointment at this time (${existing.startTime} - ${existing.endTime}).`,
      };
    }
  }

  return { valid: true };
}
