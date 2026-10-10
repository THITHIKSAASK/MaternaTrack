import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isOverlapping, parseMinutes, validateDoctorAppointment } from '../appointmentValidator.js';
import { prisma } from '../../prisma.js';
import { closeFollowUpTask } from '../followUpService.js';
import { processReminderAndOverdueEngine } from '../reminderEngine.js';

describe('MaternaTrack Core Healthcare Workflow Rules', () => {
  describe('Appointment Conflict and Break Timing Validation', () => {
    it('should parse time string into total minutes correctly', () => {
      expect(parseMinutes('09:00')).toBe(540);
      expect(parseMinutes('13:30')).toBe(810);
      expect(parseMinutes('00:00')).toBe(0);
    });

    it('should accurately detect overlapping appointment intervals', () => {
      // Overlap: 10:00 - 10:30 and 10:15 - 10:45
      expect(
        isOverlapping(
          { startTime: '10:00', endTime: '10:30' },
          { startTime: '10:15', endTime: '10:45' }
        )
      ).toBe(true);

      // Back-to-back (not overlapping): 10:00 - 10:30 and 10:30 - 11:00
      expect(
        isOverlapping(
          { startTime: '10:00', endTime: '10:30' },
          { startTime: '10:30', endTime: '11:00' }
        )
      ).toBe(false);

      // Inside: 10:00 - 11:00 and 10:15 - 10:45
      expect(
        isOverlapping(
          { startTime: '10:00', endTime: '11:00' },
          { startTime: '10:15', endTime: '10:45' }
        )
      ).toBe(true);
    });

    it('should block an appointment that falls inside scheduled doctor break timings', async () => {
      const doctor = await prisma.clinicianProfile.findFirst({
        where: { breakTimings: { not: null } },
      });

      if (!doctor) return;

      // Doctor break is 13:00 to 14:00
      const result = await validateDoctorAppointment({
        doctorId: doctor.id,
        scheduledDate: new Date(),
        startTime: '13:15',
        endTime: '13:45',
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('break');
    });

    it('should block conflicting overlapping appointments on the same day for same clinician', async () => {
      const doctor = await prisma.clinicianProfile.findFirst();
      if (!doctor) return;

      // Appointment exists at 10:00 - 10:30 today in seed data
      const result = await validateDoctorAppointment({
        doctorId: doctor.id,
        scheduledDate: new Date(),
        startTime: '10:10',
        endTime: '10:40',
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('already has a scheduled appointment');
    });

    it('should permit non-conflicting appointment slot', async () => {
      const doctor = await prisma.clinicianProfile.findFirst();
      if (!doctor) return;

      const result = await validateDoctorAppointment({
        doctorId: doctor.id,
        scheduledDate: new Date(),
        startTime: '15:00',
        endTime: '15:30',
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('Follow-up Task Critical Closure Rule', () => {
    it('should forbid closing a clinician-requiring task without approved doctor review and linked documents', async () => {
      // Find task requiring clinician approval
      const highRiskTask = await prisma.followUpTask.findFirst({
        where: { requiresClinicianApproval: true },
      });

      if (!highRiskTask) return;

      const dummyReq = { ip: '127.0.0.1' } as any;

      // Attempt to close as health worker without doctor review
      const result = await closeFollowUpTask({
        taskId: highRiskTask.id,
        closingUserId: 'dummy-worker-id',
        closingUserRole: 'HEALTH_WORKER',
        resolutionNotes: 'Tried to close manually',
        req: dummyReq,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires clinician review');
    });
  });

  describe('Intelligent Reminder Engine & Duplicate Prevention', () => {
    it('should process reminders and suppress duplicates on subsequent runs', async () => {
      // Run engine for today
      const run1 = await processReminderAndOverdueEngine(new Date());
      expect(run1).toBeDefined();
      expect(run1.processedBeneficiariesCount).toBeGreaterThan(0);

      // Run engine a second time immediately
      const run2 = await processReminderAndOverdueEngine(new Date());
      // On second immediate run, duplicate reminders should NOT be recreated
      expect(run2.generatedRemindersCount).toBe(0);
    });
  });
});
