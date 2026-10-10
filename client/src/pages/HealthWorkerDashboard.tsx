import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { apiFetch } from '../api/client.js';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PhoneCall,
  UserPlus,
  Stethoscope,
  FileText,
  Calendar,
  Baby,
  Heart,
  ChevronRight,
  X,
  Send,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building,
} from 'lucide-react';

export const HealthWorkerDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'tasks' | 'referrals'>('overview');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');

  // Modals
  const [showRecordServiceModal, setShowRecordServiceModal] = useState(false);
  const [showContactAttemptModal, setShowContactAttemptModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Service form states
  const [serviceBeneficiaryId, setServiceBeneficiaryId] = useState('');
  const [serviceType, setServiceType] = useState('ANC_3');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchNumber, setBatchNumber] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  // Contact attempt states
  const [contactMethod, setContactMethod] = useState('HOME_VISIT');
  const [contactOutcome, setContactOutcome] = useState('REACHED_PROMISED');
  const [missedReason, setMissedReason] = useState('Caregiver requested rescheduling');
  const [nextAction, setNextAction] = useState('RESCHEDULE');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]
  );
  const [contactNotes, setContactNotes] = useState('');

  // Referral states
  const [referralBeneficiaryId, setReferralBeneficiaryId] = useState('');
  const [referralDoctorId, setReferralDoctorId] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [referralPriority, setReferralPriority] = useState('HIGH_RISK');

  const isTa = i18n.language === 'ta';

  useEffect(() => {
    loadWorkerData();
  }, [searchQuery, typeFilter, villageFilter]);

  async function loadWorkerData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (typeFilter) params.set('type', typeFilter);
      if (villageFilter) params.set('villageId', villageFilter);

      const [bRes, tRes, rRes, cRes, aRes] = await Promise.all([
        apiFetch<any[]>(`/beneficiaries?${params.toString()}`),
        apiFetch<any[]>('/followup'),
        apiFetch<any[]>('/referrals'),
        apiFetch<any[]>('/referrals/clinicians'),
        apiFetch<any>('/reports/analytics'),
      ]);

      if (bRes.success && bRes.data) setBeneficiaries(bRes.data);
      if (tRes.success && tRes.data) setTasks(tRes.data);
      if (rRes.success && rRes.data) setReferrals(rRes.data);
      if (cRes.success && cRes.data) {
        setClinicians(cRes.data);
        if (cRes.data.length > 0) setReferralDoctorId(cRes.data[0].id);
      }
      if (aRes.success && aRes.data) setAnalytics(aRes.data);
    } catch (e) {
      console.error('Error loading worker dashboard:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleRecordServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceBeneficiaryId || !serviceType) return;

    const res = await apiFetch('/maternal/record-service', {
      method: 'POST',
      body: JSON.stringify({
        beneficiaryId: serviceBeneficiaryId,
        serviceType,
        completedDate: serviceDate,
        batchNumber,
        notes: serviceNotes,
        isVerified: true,
      }),
    });

    if (res.success) {
      alert('Service recorded and verified successfully!');
      setShowRecordServiceModal(false);
      loadWorkerData();
    } else {
      alert(res.error || 'Failed to record service.');
    }
  };

  const handleContactAttemptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const res = await apiFetch(`/followup/${selectedTask.id}/contact-attempt`, {
      method: 'POST',
      body: JSON.stringify({
        method: contactMethod,
        outcome: contactOutcome,
        missedVisitReason: missedReason,
        nextAction,
        nextFollowUpDate,
        notes: contactNotes,
      }),
    });

    if (res.success) {
      alert('Contact attempt and next action logged successfully!');
      setShowContactAttemptModal(false);
      loadWorkerData();
    } else {
      alert(res.error || 'Failed to log contact attempt.');
    }
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralBeneficiaryId || !referralDoctorId || !referralReason) return;

    const res = await apiFetch('/referrals', {
      method: 'POST',
      body: JSON.stringify({
        beneficiaryId: referralBeneficiaryId,
        referredDoctorId: referralDoctorId,
        followUpTaskId: selectedTask?.id || null,
        reason: referralReason,
        priority: referralPriority,
      }),
    });

    if (res.success) {
      alert('Referral created successfully and assigned to clinician!');
      setShowReferralModal(false);
      loadWorkerData();
    } else {
      alert(res.error || 'Failed to create referral.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>Health Worker Workspace (VHN / ASHA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.fullName || 'Priya R, VHN'}
            </h1>
            <p className="text-xs text-slate-500">
              Assigned Area: <strong>Ukkaram Village, Sathyamangalam Block, Erode District</strong> • Worker Code: <strong className="font-mono">VHN-SAT-04</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (beneficiaries.length > 0) setServiceBeneficiaryId(beneficiaries[0].id);
                setShowRecordServiceModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('worker.recordServiceBtn')}</span>
            </button>
            <button
              onClick={() => {
                if (beneficiaries.length > 0) setReferralBeneficiaryId(beneficiaries[0].id);
                setShowReferralModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Stethoscope className="w-4 h-4 text-pink-400" />
              <span>{t('worker.createReferral')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'overview' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            {t('worker.overview')}
          </button>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'beneficiaries' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>{t('worker.beneficiaries')}</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {beneficiaries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'tasks' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>{t('worker.followUpTasks')}</span>
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {tasks.filter((t) => t.status !== 'CLOSED').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'referrals' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>{t('worker.referrals')}</span>
            <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {referrals.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRIC CARDS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t('worker.pregnantAssigned')}
                </span>
                <p className="text-3xl font-extrabold text-slate-900">
                  {analytics?.summary?.activePregnancies || 2}
                </p>
                <p className="text-[11px] text-pink-700 font-medium">
                  {analytics?.summary?.highRiskPregnancies || 1} High-risk flagged for Dr. Malathi
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t('worker.dueThisWeek')}
                </span>
                <p className="text-3xl font-extrabold text-slate-900">
                  {analytics?.maternalBreakdown?.scheduled || 3}
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  Advance reminders sent to families
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t('worker.openTasks')}
                </span>
                <p className="text-3xl font-extrabold text-rose-700">
                  {tasks.filter((t) => t.status !== 'CLOSED').length}
                </p>
                <p className="text-[11px] text-rose-800 font-medium">
                  Requires home visit or contact log
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  On-Time Completion Rate
                </span>
                <p className="text-3xl font-extrabold text-emerald-700">
                  {analytics?.rates?.onTimeCompletionRate || 80}%
                </p>
                <p className="text-[11px] text-slate-500">
                  Measured across {analytics?.rates?.completionDenominator || 10} eligible services
                </p>
              </div>
            </div>

            {/* Today's Action Items List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-700" />
                  <span>Immediate Follow-up Queue & Pending Actions</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Sathyamangalam Field List
                </span>
              </div>

              <div className="space-y-3">
                {tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {task.beneficiary?.fullName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({task.beneficiary?.beneficiaryId})
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            task.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Service: <strong>{task.serviceType}</strong> • Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      {task.missedVisitReason && (
                        <p className="text-[11px] text-slate-500">
                          Recorded Reason: <em>{task.missedVisitReason}</em>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowContactAttemptModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-pink-700" />
                        <span>Log Contact</span>
                      </button>
                      {task.status !== 'CLOSED' && (
                        <button
                          onClick={async () => {
                            const notes = prompt('Enter resolution notes for closing this task:');
                            if (!notes) return;
                            const res = await apiFetch(`/followup/${task.id}/close`, {
                              method: 'POST',
                              body: JSON.stringify({ resolutionNotes: notes }),
                            });
                            if (res.success) {
                              alert('Task closed successfully!');
                              loadWorkerData();
                            } else {
                              alert(res.error || 'Failed to close task.');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold shadow-xs"
                        >
                          Close Task
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BENEFICIARIES TABLE */}
        {activeTab === 'beneficiaries' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Assigned Household Beneficiaries
                </h3>
                <p className="text-xs text-slate-500">
                  Showing mothers and infants assigned in your authorized administrative area.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, ID..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50"
                >
                  <option value="">All Types</option>
                  <option value="MOTHER">Mothers</option>
                  <option value="CHILD">Children</option>
                </select>
              </div>
            </div>

            {/* Beneficiaries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Beneficiary ID</th>
                    <th className="py-3 px-4">Full Name & Tamil Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Village</th>
                    <th className="py-3 px-4">Pregnancy / DOB</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {beneficiaries.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {b.beneficiaryId}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{b.fullName}</p>
                        <p className="text-[11px] text-slate-500">{b.tamilName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.type === 'MOTHER'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {b.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{b.village?.name || 'Ukkaram'}</td>
                      <td className="py-3 px-4">
                        {b.pregnancies?.[0]
                          ? `EDD: ${new Date(b.pregnancies[0].eddDate).toLocaleDateString()}`
                          : `DOB: ${new Date(b.dobOrLmp).toLocaleDateString()}`}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setServiceBeneficiaryId(b.id);
                            setShowRecordServiceModal(true);
                          }}
                          className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg font-semibold text-[11px] transition mr-2"
                        >
                          Record Service
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FOLLOW-UP TASKS */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Overdue Follow-Up Tasks & Recovery Actions
              </h3>
              <p className="text-xs text-slate-500">
                Generated automatically when antenatal visits or childhood immunizations pass their target date.
              </p>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {task.taskCode}: {task.serviceType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        task.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'REFERRED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {task.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Beneficiary:</span>{' '}
                      <strong>{task.beneficiary?.fullName}</strong> ({task.beneficiary?.beneficiaryId})
                    </div>
                    <div>
                      <span className="text-slate-400">Due Date:</span>{' '}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-slate-400">Contact Attempts:</span>{' '}
                      <strong>{task.contactAttemptsCount} attempts recorded</strong>
                    </div>
                  </div>

                  {task.missedVisitReason && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                      <strong>Recorded Reason:</strong> {task.missedVisitReason} • <strong>Next Action:</strong> {task.nextAction || 'None'}
                    </div>
                  )}

                  {task.requiresClinicianApproval && (
                    <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                      <span>This task requires clinical review by Dr. Malathi Sundaram before closure.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowContactAttemptModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Log Attempt
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setReferralBeneficiaryId(task.beneficiaryId);
                        setShowReferralModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
                    >
                      Refer Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REFERRALS TO DOCTOR */}
        {activeTab === 'referrals' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Doctor Referrals & Clinical Coordination
                </h3>
                <p className="text-xs text-slate-500">
                  Referrals sent to Dr. Malathi Sundaram, DGO at Sathyamangalam Government Hospital.
                </p>
              </div>
              <button
                onClick={() => {
                  if (beneficiaries.length > 0) setReferralBeneficiaryId(beneficiaries[0].id);
                  setShowReferralModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold shadow-xs"
              >
                + New Referral
              </button>
            </div>

            <div className="space-y-4">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {ref.beneficiary?.fullName}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({ref.beneficiary?.beneficiaryId})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          ref.priority === 'HIGH_RISK' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200'
                        }`}
                      >
                        {ref.priority}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        ref.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ref.status === 'ACCEPTED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                    <strong>Reason for Referral:</strong> {ref.reason}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Referred to: <strong>Dr. Malathi Sundaram (DGO)</strong></span>
                    <span>Date: {new Date(ref.referralDate).toLocaleDateString()}</span>
                  </div>

                  {ref.clinicalReviews?.length > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-900">Clinician Review Decision:</p>
                      <p className="text-emerald-800">{ref.clinicalReviews[0].clinicalFindings}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record Service Modal */}
      {showRecordServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Record Completed Service / Vaccination
              </h3>
              <button onClick={() => setShowRecordServiceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordServiceSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Beneficiary</label>
                <select
                  value={serviceBeneficiaryId}
                  onChange={(e) => setServiceBeneficiaryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-pink-500"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.beneficiaryId}) - {b.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Service / Vaccine</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  >
                    <option value="ANC_1">ANC-1 Check-up</option>
                    <option value="ANC_2">ANC-2 Check-up</option>
                    <option value="ANC_3">ANC-3 Check-up</option>
                    <option value="ANC_4">ANC-4 Check-up</option>
                    <option value="TT_TD_1">Td-1 Vaccine</option>
                    <option value="TT_TD_2">Td-2 Vaccine</option>
                    <option value="IFA_DISTRIBUTION">IFA Tablets Distribution</option>
                    <option value="USG_SCAN">Ultrasound Scan</option>
                    <option value="PNC_1">PNC-1 Check-up</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Service Date</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Batch / Lot Number (if applicable)</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. TD2026-B812"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinical Observations / Notes</label>
                <textarea
                  rows={2}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. BP 115/75, Hb 11.2 g/dL, normal fetal heart rate heard."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                *Recording this service marks it as verified by your VHN credentials and resolves related open tasks.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold"
                >
                  Save & Verify Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Contact Attempt Modal */}
      {showContactAttemptModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Record Contact Attempt: {selectedTask.taskCode}
              </h3>
              <button onClick={() => setShowContactAttemptModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContactAttemptSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Method</label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  >
                    <option value="HOME_VISIT">Home Visit</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="COMMUNITY_CENTRE">Community Centre</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Outcome</label>
                  <select
                    value={contactOutcome}
                    onChange={(e) => setContactOutcome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  >
                    <option value="REACHED_PROMISED">Reached - Promised Visit</option>
                    <option value="UNREACHABLE">Unreachable</option>
                    <option value="MIGRATED_TEMPORARY">Temporary Migration</option>
                    <option value="WRONG_NUMBER">Phone Changed</option>
                    <option value="REFUSED">Refused / Hesitancy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Missed Visit Reason</label>
                <select
                  value={missedReason}
                  onChange={(e) => setMissedReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  <option value="Caregiver requested rescheduling">Caregiver requested rescheduling</option>
                  <option value="Parent unavailable">Parent unavailable</option>
                  <option value="Phone unreachable">Phone unreachable</option>
                  <option value="Temporary migration">Temporary migration</option>
                  <option value="Transport or distance barrier">Transport or distance barrier</option>
                  <option value="Clinical review required">Clinical review required</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Next Action</label>
                  <select
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  >
                    <option value="RESCHEDULE">Reschedule Visit</option>
                    <option value="HOME_VISIT">Repeat Home Visit</option>
                    <option value="REFERRAL">Refer to Doctor</option>
                    <option value="PHONE_CALL">Follow-up Call</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Field Notes</label>
                <textarea
                  rows={2}
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="Notes from interaction with parent or caregiver..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactAttemptModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold"
                >
                  Log Contact Attempt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refer to Doctor Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Create Clinical Referral to Doctor
              </h3>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReferralSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Beneficiary</label>
                <select
                  value={referralBeneficiaryId}
                  onChange={(e) => setReferralBeneficiaryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.beneficiaryId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Clinician (DGO)</label>
                <select
                  value={referralDoctorId}
                  onChange={(e) => setReferralDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  {clinicians.map((c) => (
                    <option key={c.id} value={c.id}>
                      Dr. {c.user?.fullName} ({c.dgoQualification}) - {c.facility?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Priority Level</label>
                <select
                  value={referralPriority}
                  onChange={(e) => setReferralPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  <option value="HIGH_RISK">High Risk (Immediate Review)</option>
                  <option value="URGENT">Urgent Obstetric Consultation</option>
                  <option value="MEDIUM">Routine Specialist Evaluation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reason for Referral</label>
                <textarea
                  required
                  rows={3}
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  placeholder="e.g. Gestational diabetes, severe anemia, persistent elevated BP, or fetal growth discrepancy..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold"
                >
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
