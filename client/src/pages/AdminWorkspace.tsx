import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { apiFetch } from '../api/client.js';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const AdminWorkspace: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'clinicians' | 'areas' | 'audit' | 'engine'>('clinicians');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cliniciansList, setCliniciansList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [engineResult, setEngineResult] = useState<any | null>(null);
  const [runningEngine, setRunningEngine] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  async function loadAdminData() {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await apiFetch<any[]>('/admin/users');
        if (res.success && res.data) setUsersList(res.data);
      } else if (activeTab === 'clinicians') {
        const res = await apiFetch<any[]>('/admin/clinicians');
        if (res.success && res.data) setCliniciansList(res.data);
      } else if (activeTab === 'areas') {
        const res = await apiFetch<any[]>('/admin/areas');
        if (res.success && res.data) setAreasList(res.data);
      } else if (activeTab === 'audit') {
        const res = await apiFetch<any[]>('/admin/audit-logs');
        if (res.success && res.data) setAuditLogs(res.data);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleUserActive = async (userId: string) => {
    const res = await apiFetch(`/admin/users/${userId}/toggle-active`, { method: 'PATCH' });
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to toggle status.');
    }
  };

  const handleVerifyClinician = async (clinicianId: string, status: 'VERIFIED' | 'REJECTED') => {
    const notes = prompt(`Enter notes for marking credentials as ${status}:`, 'Verified by Directorate of Medical Services Erode');
    if (notes === null) return;

    const res = await apiFetch(`/admin/clinicians/${clinicianId}/verify-credentials`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });

    if (res.success) {
      alert(`Clinician credentials marked as ${status}!`);
      loadAdminData();
    } else {
      alert(res.error || 'Failed to update credentials.');
    }
  };

  const handleRunReminderEngine = async () => {
    setRunningEngine(true);
    setEngineResult(null);
    try {
      const res = await apiFetch('/reminders/run-engine', {
        method: 'POST',
        body: JSON.stringify({ referenceDate: new Date() }),
      });
      setRunningEngine(false);
      if (res.success && res.data) {
        setEngineResult(res.data);
      } else {
        alert(res.error || 'Engine execution failed.');
      }
    } catch (e) {
      setRunningEngine(false);
      alert('Error triggering reminder engine.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              <span>Administrative Oversight & System Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.fullName || 'System Administrator'}
            </h1>
            <p className="text-xs text-slate-500">
              Office of the Deputy Director of Health Services (DDHS), Erode District, Tamil Nadu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunReminderEngine}
              disabled={runningEngine}
              className="px-4 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{runningEngine ? 'Running Engine...' : 'Run Reminder & Overdue Engine'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('clinicians')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'clinicians' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Clinician Credential Review
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'users' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'areas' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Administrative Geography
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'audit' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* Engine Result Box */}
        {engineResult && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Reminder & Overdue Engine Execution Completed:</span>
            </div>
            <p className="text-emerald-800">
              Processed <strong>{engineResult.processedBeneficiariesCount}</strong> eligible services.
              Generated <strong>{engineResult.generatedRemindersCount}</strong> advance/due reminders.
              Created <strong>{engineResult.overdueTasksCreatedCount}</strong> overdue follow-up tasks.
            </p>
          </div>
        )}

        {/* TAB 1: CLINICIANS CREDENTIAL VERIFICATION */}
        {activeTab === 'clinicians' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Clinician Credential Verification Queue
              </h3>
              <p className="text-xs text-slate-500">
                Only verified clinicians with confirmed State Medical Council registration may approve restricted high-risk clinical reviews.
              </p>
            </div>

            <div className="space-y-4">
              {cliniciansList.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        Dr. {c.user?.fullName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          c.isRegistrationVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.isRegistrationVerified ? 'VERIFIED' : 'PENDING REVIEW'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>{c.dgoQualification}</strong> • Facility: {c.facility?.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Reg Number: {c.registrationNumber || 'Not Provided'} • Institution: {c.institution} ({c.yearOfQualification})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleVerifyClinician(c.id, 'VERIFIED')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                    >
                      Verify Credentials
                    </button>
                    <button
                      onClick={() => handleVerifyClinician(c.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold shadow-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Registered System Accounts</h3>
              <p className="text-xs text-slate-500">Manage user access and deactivate accounts as needed.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{u.fullName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-800 border border-pink-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 hover:bg-slate-100"
                        >
                          Toggle Active
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADMINISTRATIVE GEOGRAPHY */}
        {activeTab === 'areas' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Administrative Area Reference Hierarchy
              </h3>
              <p className="text-xs text-slate-500">
                Erode District → Sathyamangalam / Bhavanisagar Blocks → Village Panchayats & PHCs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areasList.map((area) => (
                <div
                  key={area.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{area.name} ({area.tamilName})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                      {area.type}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Source: <a href={area.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-pink-700 underline">{area.sourceUrl}</a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">System Security Audit Logs</h3>
              <p className="text-xs text-slate-500">Every sensitive action, service verification, and status update is logged with user identity and timestamp.</p>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">
                      [{log.action}] <span className="text-slate-600 font-sans">{log.details}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      User: {log.user?.fullName || 'System'} ({log.user?.email || 'N/A'}) • Entity: {log.entityType}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
