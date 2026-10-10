import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticateUser, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// General Analytics (Health Worker, Doctor, Admin)
router.get('/analytics', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    // 1. Beneficiaries counts
    const [totalMothers, totalChildren, totalBeneficiaries] = await Promise.all([
      prisma.beneficiary.count({ where: { type: 'MOTHER' } }),
      prisma.beneficiary.count({ where: { type: 'CHILD' } }),
      prisma.beneficiary.count(),
    ]);

    // 2. Active pregnancies & Trimester breakdown
    const activePregnancies = await prisma.pregnancy.findMany({
      where: { status: 'ACTIVE' },
    });

    const now = new Date();
    let trimester1 = 0; // 0-12 weeks
    let trimester2 = 0; // 13-27 weeks
    let trimester3 = 0; // 28+ weeks
    let highRiskCount = 0;

    for (const p of activePregnancies) {
      if (p.highRiskStatus) highRiskCount++;
      const lmp = new Date(p.lmpDate);
      const gestationalWeeks = Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (gestationalWeeks <= 12) trimester1++;
      else if (gestationalWeeks <= 27) trimester2++;
      else trimester3++;
    }

    // 3. Maternal services status
    const [maternalCompleted, maternalOverdue, maternalScheduled, maternalUnverified] = await Promise.all([
      prisma.maternalService.count({ where: { status: 'COMPLETED' } }),
      prisma.maternalService.count({ where: { status: 'OVERDUE' } }),
      prisma.maternalService.count({ where: { status: 'SCHEDULED' } }),
      prisma.maternalService.count({ where: { status: 'UNVERIFIED' } }),
    ]);

    // 4. Immunization records status
    const [immCompleted, immOverdue, immScheduled, immUnverified] = await Promise.all([
      prisma.childImmunizationRecord.count({ where: { status: 'COMPLETED' } }),
      prisma.childImmunizationRecord.count({ where: { status: 'OVERDUE' } }),
      prisma.childImmunizationRecord.count({ where: { status: 'SCHEDULED' } }),
      prisma.childImmunizationRecord.count({ where: { status: 'UNVERIFIED' } }),
    ]);

    // 5. On-time completion calculation
    // Eligible services completed by due date / all completed or overdue services
    const totalEligibleMaternal = maternalCompleted + maternalOverdue;
    const totalEligibleImm = immCompleted + immOverdue;
    const combinedEligible = totalEligibleMaternal + totalEligibleImm;
    const combinedCompleted = maternalCompleted + immCompleted;
    const onTimeCompletionRate = combinedEligible > 0 ? Math.round((combinedCompleted / combinedEligible) * 100) : 0;

    // 6. Follow-up task resolution rate
    const [openTasks, inProgressTasks, referredTasks, resolvedTasks, closedTasks] = await Promise.all([
      prisma.followUpTask.count({ where: { status: 'OPEN' } }),
      prisma.followUpTask.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.followUpTask.count({ where: { status: 'REFERRED' } }),
      prisma.followUpTask.count({ where: { status: 'RESOLVED' } }),
      prisma.followUpTask.count({ where: { status: 'CLOSED' } }),
    ]);

    const totalOverdueTasks = openTasks + inProgressTasks + referredTasks + resolvedTasks + closedTasks;
    const resolvedOrClosedCount = resolvedTasks + closedTasks;
    const followUpResolutionRate = totalOverdueTasks > 0 ? Math.round((resolvedOrClosedCount / totalOverdueTasks) * 100) : 0;

    // 7. Tasks by priority
    const [urgentTasks, highTasks, medTasks, lowTasks] = await Promise.all([
      prisma.followUpTask.count({ where: { priority: 'URGENT', status: { in: ['OPEN', 'IN_PROGRESS', 'REFERRED'] } } }),
      prisma.followUpTask.count({ where: { priority: 'HIGH', status: { in: ['OPEN', 'IN_PROGRESS', 'REFERRED'] } } }),
      prisma.followUpTask.count({ where: { priority: 'MEDIUM', status: { in: ['OPEN', 'IN_PROGRESS', 'REFERRED'] } } }),
      prisma.followUpTask.count({ where: { priority: 'LOW', status: { in: ['OPEN', 'IN_PROGRESS', 'REFERRED'] } } }),
    ]);

    // 8. Missed visit reasons breakdown
    const tasksWithReasons = await prisma.followUpTask.findMany({
      where: { missedVisitReason: { not: null } },
      select: { missedVisitReason: true },
    });

    const reasonsMap: Record<string, number> = {};
    for (const t of tasksWithReasons) {
      if (t.missedVisitReason) {
        reasonsMap[t.missedVisitReason] = (reasonsMap[t.missedVisitReason] || 0) + 1;
      }
    }
    const missedReasonsBreakdown = Object.entries(reasonsMap).map(([reason, count]) => ({ reason, count }));

    // 9. Area breakdown
    const areas = await prisma.administrativeArea.findMany({
      where: { type: 'VILLAGE_PANCHAYAT' },
      include: {
        _count: {
          select: { beneficiaries: true },
        },
      },
    });

    const areaBreakdown = areas.map((a) => ({
      name: a.name,
      tamilName: a.tamilName,
      count: a._count.beneficiaries,
    }));

    // 10. Pending referrals
    const pendingReferralsCount = await prisma.referral.count({ where: { status: 'PENDING' } });

    res.json({
      success: true,
      data: {
        summary: {
          totalBeneficiaries,
          totalMothers,
          totalChildren,
          activePregnancies: activePregnancies.length,
          highRiskPregnancies: highRiskCount,
          pendingReferrals: pendingReferralsCount,
        },
        rates: {
          onTimeCompletionRate,
          completionDenominator: combinedEligible,
          followUpResolutionRate,
          resolutionDenominator: totalOverdueTasks,
          reminderDeliveryRate: 'N/A (Local Simulation Mode)',
        },
        maternalBreakdown: {
          completed: maternalCompleted,
          overdue: maternalOverdue,
          scheduled: maternalScheduled,
          unverified: maternalUnverified,
        },
        immunizationBreakdown: {
          completed: immCompleted,
          overdue: immOverdue,
          scheduled: immScheduled,
          unverified: immUnverified,
        },
        trimesterBreakdown: [
          { name: '1st Trimester (0-12 wks)', count: trimester1 },
          { name: '2nd Trimester (13-27 wks)', count: trimester2 },
          { name: '3rd Trimester (28+ wks)', count: trimester3 },
        ],
        tasksByPriority: [
          { priority: 'Urgent', count: urgentTasks, color: '#B91C1C' },
          { priority: 'High', count: highTasks, color: '#EA580C' },
          { priority: 'Medium', count: medTasks, color: '#B45309' },
          { priority: 'Low', count: lowTasks, color: '#0369A1' },
        ],
        taskStatusBreakdown: [
          { status: 'Open', count: openTasks },
          { status: 'In Progress', count: inProgressTasks },
          { status: 'Referred', count: referredTasks },
          { status: 'Resolved / Closed', count: resolvedOrClosedCount },
        ],
        missedReasonsBreakdown,
        areaBreakdown,
      },
    });
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, error: 'Failed to calculate analytics.' });
  }
});

// CSV Export Endpoint
router.get('/export-csv', authenticateUser, requireRole(['HEALTH_WORKER', 'DOCTOR', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      include: {
        village: true,
        assignedWorker: { include: { user: true } },
        pregnancies: { where: { status: 'ACTIVE' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'Beneficiary ID,Full Name,Tamil Name,Type,Gender,Village,Assigned Worker,Pregnancy Status,Created Date\n';
    const rows = beneficiaries.map((b) => {
      const preg = b.pregnancies[0] ? `Active (EDD: ${new Date(b.pregnancies[0].eddDate).toLocaleDateString('en-IN')})` : 'None';
      const worker = b.assignedWorker?.user?.fullName || 'Unassigned';
      return `"${b.beneficiaryId}","${b.fullName}","${b.tamilName}","${b.type}","${b.gender}","${b.village?.name || 'N/A'}","${worker}","${preg}","${new Date(b.createdAt).toLocaleDateString('en-IN')}"`;
    });

    const csvContent = header + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="maternatrack-beneficiaries-report.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to generate CSV export.' });
  }
});

export default router;
