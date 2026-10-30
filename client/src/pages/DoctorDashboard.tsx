import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { apiFetch } from '../api/client.js';
import {
  Stethoscope,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Building,
  Check,
  X,
  Heart,
  Baby,
  Search,
  Users,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'appointments' | 'referrals' | 'patients'>('appointments');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString());

  // Appointment creation state
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookBeneficiaryId, setBookBeneficiaryId] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookStartTime, setBookStartTime] = useState('14:30');
  const [bookEndTime, setBookEndTime] = useState('15:00');
  const [bookType, setBookType] = useState('HIGH_RISK_REFERRAL');
  const [bookNotes, setBookNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Clinical Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');

  // Document upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const isTa = i18n.language === 'ta';

  useEffect(() => {
    loadDoctorData();

    // Auto-refresh interval (every 8 seconds) so health worker actions reflect live to the doctor
    const interval = setInterval(() => {
      loadDoctorData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  async function loadDoctorData(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [appRes, refRes, benRes] = await Promise.all([
        apiFetch<any[]>('/appointments'),
        apiFetch<any[]>('/referrals'),
        apiFetch<any[]>('/beneficiaries?limit=100'),
      ]);

      if (appRes.success && appRes.data) setAppointments(appRes.data);
      if (refRes.success && refRes.data) setReferrals(refRes.data);
      if (benRes.success && benRes.data) {
        setBeneficiaries(benRes.data);
        if (benRes.data.length > 0 && !bookBeneficiaryId) {
          setBookBeneficiaryId(benRes.data[0].id);
        }
      }
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error loading doctor dashboard:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    const doctorProfileId = user?.clinicianProfile?.id;
    if (!doctorProfileId || !bookBeneficiaryId) return;

    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: doctorProfileId,
        beneficiaryId: bookBeneficiaryId,
        scheduledDate: bookDate,
        startTime: bookStartTime,
        endTime: bookEndTime,
        consultationType: bookType,
        notes: bookNotes,
      }),
    });

    if (res.success) {
      alert('Consultation scheduled successfully!');
      setShowBookModal(false);
      loadDoctorData();
    } else {
      setBookingError(res.error || 'Failed to schedule consultation.');
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    const res = await apiFetch(`/appointments/${appId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (res.success) {
      loadDoctorData();
    } else {
      alert(res.error || 'Failed to update status.');
    }
  };

  const handleAcceptReferral = async (refId: string) => {
    const res = await apiFetch(`/referrals/${refId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTED', doctorNotes: 'Accepted for specialized obstetric evaluation.' }),
    });

    if (res.success) {
      alert('Referral accepted.');
      loadDoctorData();
    }
  };

  const handleSubmitClinicalReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral || !clinicalFindings) return;

    const res = await apiFetch(`/referrals/${selectedReferral.id}/clinical-review`, {
      method: 'POST',
      body: JSON.stringify({
        clinicalFindings,
        followUpPlan,
        nextReviewDate,
        status: 'APPROVED',
      }),
    });

    if (res.success) {
      alert('Clinical review approved and recorded!');
      setShowReviewModal(false);
      loadDoctorData();
    } else {
      alert(res.error || 'Failed to submit clinical review.');
    }
  };

  const handleUploadDocument = async (referralId: string) => {
    if (!uploadFile) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('document', uploadFile);

    try {
      const data = await apiFetch(`/referrals/${referralId}/upload-document`, {
        method: 'POST',
        body: formData,
      });

      setUploadingDoc(false);

      if (data.success) {
        alert('Document uploaded! Note: Upload status is PENDING review until approved.');
        setUploadFile(null);
        loadDoctorData();
      } else {
        alert(data.error || 'Upload failed.');
      }
    } catch (err: any) {
      setUploadingDoc(false);
      alert('Network error uploading document.');
    }
  };

  const filteredPatients = beneficiaries.filter((b) => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    return (
      b.fullName?.toLowerCase().includes(q) ||
      b.tamilName?.toLowerCase().includes(q) ||
      b.beneficiaryId?.toLowerCase().includes(q) ||
      b.village?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-3 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clinician Profile Strip */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                <Stethoscope className="w-3.5 h-3.5 text-pink-400" />
                <span>Consultant Obstetrician Workspace</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Multi-Role Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.fullName || 'Dr. Malathi Sundaram'}
            </h1>
            <p className="text-xs text-slate-600">
              <strong>MBBS, DGO (Diploma in Gynaecology & Obstetrics)</strong> • Sathyamangalam Government Hospital
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Reg No: TNMC/DEMO/2014/9812 • Consultation Hours: 09:00 - 13:00, 14:00 - 16:30
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-0.5 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Break Timings: 13:00 - 14:00</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Protected break interval. Appointments automatically blocked.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => loadDoctorData()}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Sync now"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Synced {lastSyncedTime}</span>
              </button>

              <button
                onClick={() => setShowBookModal(true)}
                className="px-4 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'appointments' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Appointments</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'referrals' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Specialist Referrals</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
              {referrals.filter((r) => r.status === 'PENDING').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'patients' ? 'bg-pink-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Registered Patients</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {beneficiaries.length}
            </span>
          </button>
        </div>

        {/* SECTION 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-700" />
                  <span>{t('doctor.todayAppointments')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Live consultation schedule with conflict detection and break protection.
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
                {appointments.length} Consultations
              </span>
            </div>

            <div className="space-y-3">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {app.startTime} - {app.endTime}
                      </span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {app.beneficiary?.fullName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        ({app.beneficiary?.beneficiaryId})
                      </span>
                      <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-bold uppercase">
                        {app.consultationType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Notes: {app.notes || 'Routine specialist monitoring.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        app.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'IN_CONSULTATION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>

                    {app.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No appointments scheduled for today yet. Use "Book Consultation" to schedule one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: SPECIALIST REFERRALS */}
        {activeTab === 'referrals' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-pink-700" />
                  <span>{t('doctor.pendingReferrals')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Referred by Sathyamangalam block VHNs requiring DGO specialist review.
                </p>
              </div>
              <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-bold">
                {referrals.filter((r) => r.status === 'PENDING').length} Action Required
              </span>
            </div>

            <div className="space-y-4">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="font-bold text-slate-900 text-base">
                        {ref.beneficiary?.fullName}
                      </span>
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        ({ref.beneficiary?.beneficiaryId})
                      </span>
                      <span className="ml-2 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded uppercase">
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
                      Status: {ref.status}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                    <p className="font-semibold text-slate-900">Reason for Referral:</p>
                    <p className="leading-relaxed">{ref.reason}</p>
                  </div>

                  {/* Supporting Documents Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700">Supporting Clinical Documents:</h4>
                    {ref.supportingDocuments?.length > 0 ? (
                      <div className="space-y-1 text-xs">
                        {ref.supportingDocuments.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                          >
                            <span className="font-medium text-slate-800">{doc.originalFilename}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                doc.reviewStatus === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.reviewStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No documents attached yet.</p>
                    )}

                    {/* Upload file button */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700"
                      />
                      <button
                        onClick={() => handleUploadDocument(ref.id)}
                        disabled={!uploadFile || uploadingDoc}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDoc ? 'Uploading...' : 'Upload Clinical Document'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Clinical Review Decision */}
                  {ref.clinicalReviews?.length > 0 ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Approved Clinical Review On Record:</span>
                      </div>
                      <p className="text-emerald-800">{ref.clinicalReviews[0].clinicalFindings}</p>
                      <p className="text-emerald-700 text-[11px]">
                        Follow-up Plan: {ref.clinicalReviews[0].followUpPlan || 'Continue specialist monitoring.'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      {ref.status === 'PENDING' && (
                        <button
                          onClick={() => handleAcceptReferral(ref.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
                        >
                          Accept Referral
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReferral(ref);
                          setShowReviewModal(true);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold"
                      >
                        Conduct Clinical Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: REGISTERED PATIENTS DIRECTORY (HEALTH WORKER REGISTERED SYNC) */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-700" />
                  <span>Registered Patients & Clinical Case Directory</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time synchronization across Health Workers, Clinicians, and Administrators.
                </p>
              </div>

              {/* Patient Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patient, ID, village..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-200 text-[10px]">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Beneficiary ID</th>
                    <th className="py-3 px-3 sm:px-4">Patient Name</th>
                    <th className="py-3 px-3 sm:px-4">Type</th>
                    <th className="py-3 px-3 sm:px-4">Risk Level</th>
                    <th className="py-3 px-3 sm:px-4">Assigned VHN / Worker</th>
                    <th className="py-3 px-3 sm:px-4">Village</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((b) => {
                    const isHighRisk = b.pregnancies?.[0]?.highRiskStatus || Boolean(b.riskNotes);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 sm:px-4 font-mono font-semibold text-slate-900">
                          {b.beneficiaryId}
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="font-bold text-slate-900">{b.fullName}</div>
                          {b.tamilName && b.tamilName !== b.fullName && (
                            <div className="text-[11px] text-slate-500 font-tamil">{b.tamilName}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              b.type === 'MOTHER'
                                ? 'bg-pink-50 text-pink-800 border border-pink-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {b.type === 'MOTHER' ? <Heart className="w-3 h-3" /> : <Baby className="w-3 h-3" />}
                            <span>{b.type}</span>
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
                          {b.assignedWorker?.user?.fullName || 'ASHA Worker'}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-slate-600">
                          {b.village?.name || 'Sathyamangalam'}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <button
                            onClick={() => {
                              setBookBeneficiaryId(b.id);
                              setShowBookModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-[11px] font-semibold transition shadow-xs"
                          >
                            Book Appointment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No registered patients matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Book Appointment Modal (With conflict detection) */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Schedule Clinician Consultation
              </h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Patient</label>
                <select
                  value={bookBeneficiaryId}
                  onChange={(e) => setBookBeneficiaryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.beneficiaryId}) - {b.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookStartTime}
                    onChange={(e) => setBookStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    required
                    value={bookEndTime}
                    onChange={(e) => setBookEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong>Schedule Guard:</strong> Doctor break is 13:00 - 14:00. Booking during break or overlapping existing slots will trigger an immediate conflict alert.
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinical Consultation Notes</label>
                <textarea
                  rows={2}
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  placeholder="e.g. Follow-up for gestational diabetes biophysical profile..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold shadow-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Review Modal */}
      {showReviewModal && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Clinical Review & Case Approval
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClinicalReview} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                Patient: <strong>{selectedReferral.beneficiary?.fullName}</strong> ({selectedReferral.beneficiary?.beneficiaryId})
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinical Findings & Diagnosis</label>
                <textarea
                  required
                  rows={3}
                  value={clinicalFindings}
                  onChange={(e) => setClinicalFindings(e.target.value)}
                  placeholder="e.g. Gestational Diabetes Mellitus confirmed. Initiated medical nutrition therapy and weekly fetal kick charting..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Follow-up Management Plan</label>
                <textarea
                  rows={2}
                  value={followUpPlan}
                  onChange={(e) => setFollowUpPlan(e.target.value)}
                  placeholder="e.g. Repeat fasting blood glucose in 2 weeks at Ukkaram PHC. Next specialist review at Sathy GH."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Next Specialist Review Date</label>
                <input
                  type="date"
                  value={nextReviewDate}
                  onChange={(e) => setNextReviewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold shadow-xs"
                >
                  Approve Clinical Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
