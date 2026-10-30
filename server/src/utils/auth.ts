import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'maternatrack-dev-super-secure-jwt-secret-key-2026!';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
}
