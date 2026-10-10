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
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  async function loadDoctorData() {
    setLoading(true);
    try {
      const [appRes, refRes, benRes] = await Promise.all([
        apiFetch<any[]>('/appointments'),
        apiFetch<any[]>('/referrals'),
        apiFetch<any[]>('/beneficiaries'),
      ]);

      if (appRes.success && appRes.data) setAppointments(appRes.data);
      if (refRes.success && refRes.data) setReferrals(refRes.data);
      if (benRes.success && benRes.data) {
        setBeneficiaries(benRes.data);
        if (benRes.data.length > 0) setBookBeneficiaryId(benRes.data[0].id);
      }
    } catch (e) {
      console.error('Error loading doctor dashboard:', e);
    } finally {
      setLoading(false);
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

    const token = localStorage.getItem('maternatrack_token');
    try {
      const res = await fetch(`http://localhost:5000/api/referrals/${referralId}/upload-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clinician Profile Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                <Stethoscope className="w-3.5 h-3.5 text-pink-400" />
                <span>Consultant Obstetrician Workspace</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('doctor.verifiedBadge')}</span>
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Break Timings: 13:00 - 14:00</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Appointments are automatically blocked during break interval.
              </p>
            </div>

            <button
              onClick={() => setShowBookModal(true)}
              className="px-4 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('doctor.bookAppointment')}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Today's Appointments */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                  <div className="flex items-center gap-2">
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
                    Notes: {app.notes || 'Routine high-risk monitoring.'}
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
          </div>
        </div>

        {/* Section 2: High-Risk Referrals Queue */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                  <div className="flex items-center gap-2 pt-1">
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
      </div>

      {/* Book Appointment Modal (With conflict detection) */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
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

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Patient</label>
                <select
                  value={bookBeneficiaryId}
                  onChange={(e) => setBookBeneficiaryId(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Clinical Review & Case Approval
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClinicalReview} className="space-y-4 text-xs">
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
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white font-semibold"
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
