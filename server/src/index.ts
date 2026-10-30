import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import { checkDatabaseConnection } from './prisma.js';
import authRoutes from './routes/auth.routes.js';
import beneficiaryRoutes from './routes/beneficiary.routes.js';
import maternalRoutes from './routes/maternal.routes.js';
import immunizationRoutes from './routes/immunization.routes.js';
import followupRoutes from './routes/followup.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import referralRoutes from './routes/referral.routes.js';
import parentRoutes from './routes/parent.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import articleRoutes from './routes/article.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure dynamic CORS for local dev, custom domain, and all Vercel deployments
const explicitOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://materna-track.vercel.app',
  'https://materna-track-73el.vercel.app',
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin serverless rewrites)
    if (!origin) return callback(null, true);

    // Allow localhost, custom client URL, or any Vercel preview/production deployment
    if (
      explicitOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Static uploads (handles serverless /tmp vs local disk gracefully)
const uploadsPath = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve('uploads');
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
} catch (e) {
  // Silent fallback on restricted environments
}
app.use('/uploads', express.static(uploadsPath));

// Health Check Endpoint (accessible at /api/health, /health, or root ping)
const healthHandler = async (req: express.Request, res: express.Response) => {
  const dbCheck = await checkDatabaseConnection();

  res.status(200).json({
    status: 'HEALTHY',
    database: dbCheck.connected ? 'CONNECTED' : `UNAVAILABLE (${dbCheck.message})`,
    environment: process.env.NODE_ENV || 'development',
    serverless: Boolean(process.env.VERCEL),
    service: 'MaternaTrack API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: 'Sathyamangalam / Erode District, Tamil Nadu',
    demoNotice: 'Academic prototype demonstration. Not connected to official live state portals.',
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', healthHandler);

// Root informational endpoint when accessed directly
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MaternaTrack API Server',
    health: '/api/health',
    status: 'RUNNING',
  });
});

// Mount API Routes (under both /api and root to guarantee compatibility with all serverless rewrite schemes)
const mountAllRoutes = (prefix: string = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/beneficiaries`, beneficiaryRoutes);
  app.use(`${prefix}/maternal`, maternalRoutes);
  app.use(`${prefix}/immunization`, immunizationRoutes);
  app.use(`${prefix}/followup`, followupRoutes);
  app.use(`${prefix}/appointments`, appointmentRoutes);
  app.use(`${prefix}/referrals`, referralRoutes);
  app.use(`${prefix}/parent`, parentRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/reminders`, reminderRoutes);
  app.use(`${prefix}/assistant`, assistantRoutes);
  app.use(`${prefix}/articles`, articleRoutes);
  app.use(`${prefix}/reports`, reportRoutes);
};

mountAllRoutes('/api');
mountAllRoutes('');

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An internal server error occurred.',
  });
});

// Start local listener only when not running inside Vercel serverless environment
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` MaternaTrack Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Client URL: ${CLIENT_URL}`);
    console.log(` Region: Sathyamangalam, Erode District, Tamil Nadu`);
    console.log(`====================================================`);
  });
}

export default app;
