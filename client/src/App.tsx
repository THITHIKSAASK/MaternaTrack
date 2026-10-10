import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { MaternaVoice } from './components/MaternaVoice.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ParentPortal } from './pages/ParentPortal.js';
import { HealthWorkerDashboard } from './pages/HealthWorkerDashboard.js';
import { DoctorDashboard } from './pages/DoctorDashboard.js';
import { AdminWorkspace } from './pages/AdminWorkspace.js';
import { ReportsPage } from './pages/ReportsPage.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-pink-700 font-semibold">
          <span className="w-5 h-5 border-2 border-pink-700 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading MaternaTrack...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md text-center space-y-3 shadow-md">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600">
            Your current role (<strong className="font-mono">{user.role}</strong>) does not have authorization to view this workspace.
          </p>
          <a
            href="/"
            className="inline-block mt-3 px-4 py-2 bg-pink-700 text-white rounded-xl text-xs font-semibold"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-pink-100 selection:text-pink-900">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/parent"
                element={
                  <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker"
                element={
                  <ProtectedRoute allowedRoles={['HEALTH_WORKER', 'ADMIN']}>
                    <HealthWorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminWorkspace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['HEALTH_WORKER', 'DOCTOR', 'ADMIN']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <MaternaVoice />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
