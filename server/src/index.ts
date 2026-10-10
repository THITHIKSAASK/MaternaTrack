import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

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

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Static uploads (files served securely)
const uploadsPath = path.resolve('uploads');
app.use('/uploads', express.static(uploadsPath));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MaternaTrack API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: 'Sathyamangalam / Erode District, Tamil Nadu',
    demoNotice: 'Academic prototype demonstration. Not connected to official live state portals.',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/maternal', maternalRoutes);
app.use('/api/immunization', immunizationRoutes);
app.use('/api/followup', followupRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/reports', reportRoutes);

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An internal server error occurred.',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
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
