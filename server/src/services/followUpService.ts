import { prisma } from '../prisma.js';
import { createAuditLog } from '../utils/audit.js';
import { Request } from 'express';

export async function closeFollowUpTask(params: {
  taskId: string;
  closingUserId: string;
  closingUserRole: string;
  resolutionNotes: string;
  req: Request;
}): Promise<{ success: boolean; error?: string; task?: any }> {
  const { taskId, closingUserId, closingUserRole, resolutionNotes, req } = params;

  const task = await prisma.followUpTask.findUnique({
    where: { id: taskId },
    include: {
      referrals: {
        include: {
          clinicalReviews: true,
          supportingDocuments: true,
        },
      },
      supportingDocuments: true,
    },
  });

  if (!task) {
    return { success: false, error: 'Follow-up task not found.' };
  }

  if (task.status === 'CLOSED') {
    return { success: false, error: 'Task is already closed.' };
  }

  // Check critical condition: If task requires clinician approval
  if (task.requiresClinicianApproval) {
    // 1. Must be closed by or have prior approval from an authorized DOCTOR
    let hasDoctorApprovedReview = false;

    // Check all clinical reviews across task's referrals
    for (const referral of task.referrals) {
      const approvedReview = referral.clinicalReviews.find((r) => r.status === 'APPROVED');
      if (approvedReview) {
        hasDoctorApprovedReview = true;
        break;
      }
    }

    if (!hasDoctorApprovedReview && closingUserRole !== 'DOCTOR') {
      return {
        success: false,
        error:
          'This task requires clinician review. A verified doctor must conduct and approve a clinical review before closure.',
      };
    }

    // Check documents: Uploading a document is NOT enough by itself, it must have been reviewed
    const hasDocuments = task.supportingDocuments.length > 0 || task.referrals.some((r) => r.supportingDocuments.length > 0);
    if (!hasDocuments) {
      return {
        success: false,
        error: 'Clinical approval requires linked supporting medical documentation.',
      };
    }
  }

  const updatedTask = await prisma.followUpTask.update({
    where: { id: taskId },
    data: {
      status: 'CLOSED',
      resolutionNotes,
      reviewerUserId: closingUserId,
      closedAt: new Date(),
    },
  });

  await createAuditLog(
    req,
    'FOLLOWUP_TASK_CLOSED',
    'FollowUpTask',
    taskId,
    `Closed with notes: ${resolutionNotes}. Closed by role: ${closingUserRole}`,
    closingUserId
  );

  return { success: true, task: updatedTask };
}

export async function reopenFollowUpTask(params: {
  taskId: string;
  reopeningUserId: string;
  reason: string;
  req: Request;
}): Promise<{ success: boolean; error?: string; task?: any }> {
  const { taskId, reopeningUserId, reason, req } = params;

  const task = await prisma.followUpTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { success: false, error: 'Task not found.' };
  }

  const updatedTask = await prisma.followUpTask.update({
    where: { id: taskId },
    data: {
      status: 'IN_PROGRESS',
      resolutionNotes: `Reopened: ${reason}. Previous notes: ${task.resolutionNotes || 'None'}`,
      closedAt: null,
    },
  });

  await createAuditLog(
    req,
    'FOLLOWUP_TASK_REOPENED',
    'FollowUpTask',
    taskId,
    `Task reopened by supervisor. Reason: ${reason}`,
    reopeningUserId
  );

  return { success: true, task: updatedTask };
}
