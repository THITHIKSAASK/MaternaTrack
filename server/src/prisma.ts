import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a remote database URL is explicitly configured (e.g. Postgres, MySQL, or Turso)
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // On Vercel serverless functions, root filesystem is read-only.
  // SQLite database must be placed in /tmp to allow read-write access.
  if (process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'server', 'prisma', 'dev.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'server', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[Prisma] Successfully initialized /tmp/dev.db from ${candidate}`);
            copied = true;
            break;
          } catch (err) {
            console.warn(`[Prisma] Failed to copy db from ${candidate}:`, err);
          }
        }
      }

      if (!copied) {
        console.warn('[Prisma] Bundled dev.db not found. Creating empty database file at /tmp/dev.db');
        try {
          fs.writeFileSync(tmpDbPath, '');
        } catch (e) {
          console.warn('[Prisma] Could not create /tmp/dev.db:', e);
        }
      }
    }

    const sqliteUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = sqliteUrl;
    return sqliteUrl;
  }

  return envUrl || 'file:./dev.db';
}

const resolvedUrl = getDatabaseUrl();

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolvedUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out after 3s')), 3000)),
    ]);
    return { connected: true, message: 'Database connection verified' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Database connection error' };
  }
}
