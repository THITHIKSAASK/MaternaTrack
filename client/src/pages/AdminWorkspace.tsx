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
  RefreshCw,
  Heart,
  Baby,
  Search,
  Activity,
  Calendar,
  Check,
} from 'lucide-react';

export const AdminWorkspace: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'patients' | 'clinicians' | 'users' | 'areas' | 'audit'>('patients');
  const [beneficiariesList, setBeneficiariesList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cliniciansList, setCliniciansList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [engineResult, setEngineResult] = useState<any | null>(null);
  const [runningEngine, setRunningEngine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString());

  // Load data & set up automatic multi-role sync polling
  useEffect(() => {
    loadAdminData();

    // Auto-refresh interval (every 8 seconds) so health worker actions reflect live to admin
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [activeTab]);

  async function loadAdminData(silent = false) {
    if (!silent) setLoading(true);
    try {
      if (activeTab === 'patients') {
        const res = await apiFetch<any[]>('/beneficiaries?limit=100');
        if (res.success && res.data) setBeneficiariesList(res.data);
      } else if (activeTab === 'users') {
        const res = await apiFetch<any[]>('/admin/users');
        if (res.success && res.data) setUsersList(res.data);
      } else if (activeTab === 'clinicians') {
        const res = await apiFetch<any[]>('/admin/clinicians');
        if (res.success && res.data) setCliniciansList(res.data);
      } else if (activeTab === 'areas') {
        const res = await apiFetch<any[]>('/admin/areas');
        if (res.success && res.data) setAreasList(res.data);
      } else if (activeTab === 'audit') {
        const res = await apiFetch<any[]>('/admin/audit-logs?limit=50');
        if (res.success && res.data) setAuditLogs(res.data);
      }
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      if (!silent) setLoading(false);
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
        loadAdminData(true);
      } else {
        alert(res.error || 'Engine execution failed.');
      }
    } catch (e) {
      setRunningEngine(false);
      alert('Error triggering reminder engine.');
    }
  };

  const filteredPatients = beneficiariesList.filter((b) => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    return (
      b.fullName?.toLowerCase().includes(q) ||
      b.tamilName?.toLowerCase().includes(q) ||
      b.beneficiaryId?.toLowerCase().includes(q) ||
      b.village?.name?.toLowerCase().includes(q) ||
      b.assignedWorker?.user?.fullName?.toLowerCase().includes(q)
    );
  });

  const motherCount = beneficiariesList.filter((b) => b.type === 'MOTHER').length;
  const childCount = beneficiariesList.filter((b) => b.type === 'CHILD').length;
  const highRiskCount = beneficiariesList.filter(
    (b) => b.pregnancies?.[0]?.highRiskStatus || b.riskNotes
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-3 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                <span>Administrative Oversight & Governance</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Multi-Role Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.fullName || 'System Administrator'}
            </h1>
            <p className="text-xs text-slate-500">
              Office of the Deputy Director of Health Services (DDHS), Erode District, Tamil Nadu.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => loadAdminData()}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Sync now"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Synced {lastSyncedTime}</span>
            </button>

            <button
              onClick={handleRunReminderEngine}
              disabled={runningEngine}
              className="px-4 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{runningEngine ? 'Running Engine...' : 'Run Reminder Engine'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'patients' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patients & Beneficiaries</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {beneficiariesList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('clinicians')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition ${
              activeTab === 'clinicians' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Clinician Credentials
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition ${
              activeTab === 'users' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab('areas')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition ${
              activeTab === 'areas' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Administrative Geography
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
        </div>

        {/* Engine Result Box */}
        {engineResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Reminder & Overdue Engine Execution Completed:</span>
            </div>
            <p className="text-emerald-800">
              Processed <strong>{engineResult.processedBeneficiariesCount}</strong> eligible services •
              Generated <strong>{engineResult.generatedRemindersCount}</strong> advance/due reminders •
              Created <strong>{engineResult.overdueTasksCreatedCount}</strong> overdue follow-up tasks.
            </p>
          </div>
        )}

        {/* TAB 0: PATIENTS & BENEFICIARIES DIRECTORY (REAL-TIME SYNC) */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Registered</span>
                <p className="text-2xl font-black text-slate-900">{beneficiariesList.length}</p>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> System synchronized
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Mothers</span>
                <p className="text-2xl font-black text-pink-700">{motherCount}</p>
                <p className="text-[10px] text-slate-500">Antenatal / Postnatal</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Children</span>
                <p className="text-2xl font-black text-blue-700">{childCount}</p>
                <p className="text-[10px] text-slate-500">Immunization tracking</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">High Risk</span>
                <p className="text-2xl font-black text-rose-700">{highRiskCount}</p>
                <p className="text-[10px] text-rose-600">Requires clinician review</p>
              </div>
            </div>

            {/* Patients Table Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Live System Beneficiary Registry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Any new patient added by health workers or doctors appears here in real-time.
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by name, ID, village..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">Beneficiary ID</th>
                      <th className="py-3 px-3 sm:px-4">Patient Name</th>
                      <th className="py-3 px-3 sm:px-4">Type</th>
                      <th className="py-3 px-3 sm:px-4">Risk Status</th>
                      <th className="py-3 px-3 sm:px-4">Assigned Worker</th>
                      <th className="py-3 px-3 sm:px-4">Village</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((p) => {
                      const isHighRisk = p.pregnancies?.[0]?.highRiskStatus || Boolean(p.riskNotes);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 sm:px-4 font-mono font-semibold text-slate-900">
                            {p.beneficiaryId}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <div className="font-bold text-slate-900">{p.fullName}</div>
                            {p.tamilName && p.tamilName !== p.fullName && (
                              <div className="text-[11px] text-slate-500 font-tamil">{p.tamilName}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                p.type === 'MOTHER'
                                  ? 'bg-pink-50 text-pink-800 border border-pink-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {p.type === 'MOTHER' ? <Heart className="w-3 h-3" /> : <Baby className="w-3 h-3" />}
                              <span>{p.type}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isHighRisk
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isHighRisk ? 'High Risk' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-700">
                            {p.assignedWorker?.user?.fullName || 'ASHA Worker'}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-600">
                            {p.village?.name || 'Sathyamangalam'}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right text-slate-400 font-mono text-[11px]">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPatients.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No patients matching search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: CLINICIANS CREDENTIAL VERIFICATION */}
        {activeTab === 'clinicians' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Clinician Credential Verification Queue
              </h3>
              <p className="text-xs text-slate-500">
                Only verified clinicians with confirmed State Medical Council registration may approve restricted high-risk clinical reviews.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {cliniciansList.map((c) => (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Registered System Accounts</h3>
              <p className="text-xs text-slate-500">Manage user access and deactivate accounts as needed.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Full Name</th>
                    <th className="py-3 px-3 sm:px-4">Email</th>
                    <th className="py-3 px-3 sm:px-4">Role</th>
                    <th className="py-3 px-3 sm:px-4">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 sm:px-4 font-bold text-slate-900">{u.fullName}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-800 border border-pink-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 hover:bg-slate-100 transition"
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
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
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
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">System Security Audit Logs</h3>
              <p className="text-xs text-slate-500">
                Every patient registration, service verification, and referral action is logged with actor identity, action type, and timestamp.
              </p>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">
                      <span className="text-pink-700">[{log.action}]</span>{' '}
                      <span className="text-slate-700 font-sans">{log.details}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      User: {log.user?.fullName || 'System'} ({log.user?.role || 'N/A'}) • Entity: {log.entityType}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-sans">
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
