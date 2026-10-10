import { Request } from 'express';
import { prisma } from '../prisma.js';

export async function createAuditLog(
  req: Request | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: string | null,
  fallbackUserId?: string | null
): Promise<void> {
  try {
    const userId = (req as any)?.user?.userId || fallbackUserId || null;
    const ipAddress = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
