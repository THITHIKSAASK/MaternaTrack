import { Router } from 'express';
import { prisma } from '../prisma.js';
import { hashPassword, comparePassword, signToken, setAuthCookie, clearAuthCookie } from '../utils/auth.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

// Demo accounts info (safe for demo presentation)
router.get('/demo-accounts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        role: 'PARENT',
        label: 'Parent / Caregiver Demo',
        email: 'parent.demo@materna.local',
        password: 'DemoParent@2026',
        description: 'Linked to pregnant mother Kausalya & her newborn in Sathyamangalam block.',
      },
      {
        role: 'HEALTH_WORKER',
        label: 'Health Worker Demo (ASHA / ANM)',
        email: 'worker.demo@materna.local',
        password: 'DemoWorker@2026',
        description: 'ASHA Worker Priya R, serving Sathyamangalam and Bhavanisagar areas.',
      },
      {
        role: 'DOCTOR',
        label: 'Clinician Demo (DGO / Obstetrician)',
        email: 'doctor.demo@materna.local',
        password: 'DemoDoctor@2026',
        description: 'Dr. Malathi Sundaram, MBBS, DGO at Sathyamangalam Government Hospital.',
      },
      {
        role: 'ADMIN',
        label: 'System Administrator Demo',
        email: 'admin.demo@materna.local',
        password: 'DemoAdmin@2026',
        description: 'System administration, credential verification, and schedule management.',
      },
    ],
  });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        parentProfile: true,
        healthWorkerProfile: {
          include: { assignedArea: true },
        },
        clinicianProfile: {
          include: { facility: true },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    setAuthCookie(res, token);
    await createAuditLog(req, 'USER_LOGIN', 'User', user.id, `User signed in as role ${user.role}`, user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          phone: user.phone,
          preferredLanguage: user.preferredLanguage,
          parentProfile: user.parentProfile,
          healthWorkerProfile: user.healthWorkerProfile,
          clinicianProfile: user.clinicianProfile,
        },
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal login error.' });
  }
});

// Current User Me
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        parentProfile: true,
        healthWorkerProfile: {
          include: { assignedArea: true },
        },
        clinicianProfile: {
          include: { facility: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        parentProfile: user.parentProfile,
        healthWorkerProfile: user.healthWorkerProfile,
        clinicianProfile: user.clinicianProfile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error fetching current user.' });
  }
});

// Update Preferred Language
router.patch('/language', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { language } = req.body;
  if (!language || !['en', 'ta'].includes(language)) {
    res.status(400).json({ success: false, error: 'Valid language (en or ta) required.' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { preferredLanguage: language },
    });
    res.json({ success: true, message: 'Language updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error updating language.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Signed out successfully.' });
});

export default router;
