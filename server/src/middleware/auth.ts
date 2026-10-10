import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { prisma } from '../prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    parentProfile?: any;
    healthWorkerProfile?: any;
    clinicianProfile?: any;
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please sign in again.',
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        parentProfile: true,
        healthWorkerProfile: true,
        clinicianProfile: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account not active or no longer exists.',
      });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      parentProfile: user.parentProfile,
      healthWorkerProfile: user.healthWorkerProfile,
      clinicianProfile: user.clinicianProfile,
    };

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal authentication error.',
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
