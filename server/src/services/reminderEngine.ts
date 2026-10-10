import { prisma } from '../prisma.js';

export interface ReminderJobResult {
  generatedRemindersCount: number;
  overdueTasksCreatedCount: number;
  processedBeneficiariesCount: number;
  details: string[];
}

export async function processReminderAndOverdueEngine(referenceDate: Date = new Date()): Promise<ReminderJobResult> {
  const result: ReminderJobResult = {
    generatedRemindersCount: 0,
    overdueTasksCreatedCount: 0,
    processedBeneficiariesCount: 0,
    details: [],
  };

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const threeDaysAhead = new Date(today);
  threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

  // 1. Process Maternal Services
  const scheduledMaternalServices = await prisma.maternalService.findMany({
    where: {
      status: { in: ['SCHEDULED', 'OVERDUE'] },
    },
    include: {
      beneficiary: {
        include: {
          village: true,
          assignedWorker: true,
        },
      },
    },
  });

  for (const service of scheduledMaternalServices) {
    const dueDate = new Date(service.scheduledDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let reminderType: string | null = null;
    if (diffDays === 3) {
      reminderType = 'ADVANCE_3_DAYS';
    } else if (diffDays === 0) {
      reminderType = 'DUE_TODAY';
    } else if (diffDays <= -7) {
      reminderType = 'OVERDUE_7_DAYS';
    }

    if (reminderType) {
      // Check duplicate reminder
      const existingReminder = await prisma.reminder.findFirst({
        where: {
          beneficiaryId: service.beneficiaryId,
          serviceType: service.serviceType,
          reminderType,
          targetDueDate: service.scheduledDate,
        },
      });

      if (!existingReminder) {
        const contentEn = `MaternaTrack Reminder: Your ${service.serviceType.replace('_', ' ')} checkup is scheduled for ${dueDate.toLocaleDateString('en-IN')}. Please visit your local PHC/Sub-centre.`;
        const contentTa = `மதர்னாட்ராக் நினைவூட்டல்: உங்கள் ${service.serviceType.replace('_', ' ')} பரிசோதனை நாள் ${dueDate.toLocaleDateString('ta-IN')}. ஆரம்ப சுகாதார நிலையத்தை அணுகவும்.`;

        await prisma.reminder.create({
          data: {
            beneficiaryId: service.beneficiaryId,
            serviceType: service.serviceType,
            targetDueDate: service.scheduledDate,
            reminderType,
            channel: 'SMS',
            status: 'SIMULATED_SENT',
            scheduledFor: today,
            sentAt: today,
            contentEn,
            contentTa,
          },
        });
        result.generatedRemindersCount++;
        result.details.push(`Generated ${reminderType} for ${service.beneficiary.fullName} (${service.serviceType})`);
      }
    }

    // Check if overdue and needs FollowUpTask
    if (diffDays < 0) {
      // Update service status to OVERDUE if not already
      if (service.status !== 'OVERDUE') {
        await prisma.maternalService.update({
          where: { id: service.id },
          data: { status: 'OVERDUE' },
        });
      }

      // Check if open follow-up task exists
      const existingTask = await prisma.followUpTask.findFirst({
        where: {
          beneficiaryId: service.beneficiaryId,
          serviceType: service.serviceType,
          status: { in: ['OPEN', 'IN_PROGRESS', 'REFERRED'] },
        },
      });

      if (!existingTask) {
        const taskCode = `TASK-M-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;
        await prisma.followUpTask.create({
          data: {
            taskCode,
            beneficiaryId: service.beneficiaryId,
            serviceType: service.serviceType,
            relatedServiceId: service.id,
            dueDate: service.scheduledDate,
            assignedWorkerId: service.beneficiary.assignedWorkerId,
            priority: diffDays <= -14 ? 'HIGH' : 'MEDIUM',
            status: 'OPEN',
            nextAction: 'HOME_VISIT',
          },
        });
        result.overdueTasksCreatedCount++;
        result.details.push(`Created follow-up task for ${service.beneficiary.fullName} (${service.serviceType}) overdue by ${Math.abs(diffDays)} days`);
      }
    }
  }

  // 2. Process Child Immunization Records
  const scheduledVaccines = await prisma.childImmunizationRecord.findMany({
    where: {
      status: { in: ['SCHEDULED', 'OVERDUE'] },
    },
    include: {
      vaccine: true,
      child: {
        include: {
          village: true,
          assignedWorker: true,
        },
      },
    },
  });

  for (const record of scheduledVaccines) {
    const dueDate = new Date(record.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let reminderType: string | null = null;
    if (diffDays === 3) {
      reminderType = 'ADVANCE_3_DAYS';
    } else if (diffDays === 0) {
      reminderType = 'DUE_TODAY';
    } else if (diffDays <= -7) {
      reminderType = 'OVERDUE_7_DAYS';
    }

    if (reminderType) {
      const existingReminder = await prisma.reminder.findFirst({
        where: {
          beneficiaryId: record.childBeneficiaryId,
          serviceType: record.vaccine.name,
          reminderType,
          targetDueDate: record.dueDate,
        },
      });

      if (!existingReminder) {
        const contentEn = `MaternaTrack Reminder: ${record.child.fullName} is due for ${record.vaccine.name} vaccine on ${dueDate.toLocaleDateString('en-IN')}. Protect your child on time.`;
        const contentTa = `மதர்னாட்ராக் நினைவூட்டல்: ${record.child.tamilName || record.child.fullName} குழந்தைக்கு ${record.vaccine.tamilName || record.vaccine.name} தடுப்பூசி நாள் ${dueDate.toLocaleDateString('ta-IN')}.`;

        await prisma.reminder.create({
          data: {
            beneficiaryId: record.childBeneficiaryId,
            serviceType: record.vaccine.name,
            targetDueDate: record.dueDate,
            reminderType,
            channel: 'SMS',
            status: 'SIMULATED_SENT',
            scheduledFor: today,
            sentAt: today,
            contentEn,
            contentTa,
          },
        });
        result.generatedRemindersCount++;
      }
    }

    if (diffDays < 0) {
      if (record.status !== 'OVERDUE') {
        await prisma.childImmunizationRecord.update({
          where: { id: record.id },
          data: { status: 'OVERDUE' },
        });
      }

      const existingTask = await prisma.followUpTask.findFirst({
        where: {
          beneficiaryId: record.childBeneficiaryId,
          serviceType: record.vaccine.name,
          status: { in: ['OPEN', 'IN_PROGRESS', 'REFERRED'] },
        },
      });

      if (!existingTask) {
        const taskCode = `TASK-C-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;
        await prisma.followUpTask.create({
          data: {
            taskCode,
            beneficiaryId: record.childBeneficiaryId,
            serviceType: record.vaccine.name,
            relatedServiceId: record.id,
            dueDate: record.dueDate,
            assignedWorkerId: record.child.assignedWorkerId,
            priority: diffDays <= -14 ? 'HIGH' : 'MEDIUM',
            status: 'OPEN',
            nextAction: 'PHONE_CALL',
          },
        });
        result.overdueTasksCreatedCount++;
      }
    }
  }

  result.processedBeneficiariesCount = scheduledMaternalServices.length + scheduledVaccines.length;
  return result;
}
