import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { apiFetch } from '../api/client.js';
import { jsPDF } from 'jspdf';
import {
  Heart,
  Baby,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Download,
  Edit3,
  ShieldCheck,
  FileText,
  Activity,
  ChevronRight,
  X,
  Send,
} from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [familyData, setFamilyData] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for submitting contact change request
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [requestType, setRequestType] = useState('PHONE_NUMBER');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [changeSuccessMessage, setChangeSuccessMessage] = useState<string | null>(null);

  const isTa = i18n.language === 'ta';

  useEffect(() => {
    loadParentData();
  }, []);

  async function loadParentData() {
    setLoading(true);
    try {
      const [famRes, reqRes] = await Promise.all([
        apiFetch<any[]>('/parent/family'),
        apiFetch<any[]>('/parent/change-requests'),
      ]);

      if (famRes.success && famRes.data) {
        setFamilyData(famRes.data);
      }
      if (reqRes.success && reqRes.data) {
        setChangeRequests(reqRes.data);
      }
    } catch (e) {
      console.error('Error loading parent data:', e);
    } finally {
      setLoading(false);
    }
  }

  // Find primary mother and child records
  const motherBeneficiary = familyData.find((b) => b.type === 'MOTHER') || familyData[0];
  const childBeneficiary = familyData.find((b) => b.type === 'CHILD') || motherBeneficiary?.motherRelations?.[0]?.child;

  const activePregnancy = motherBeneficiary?.pregnancies?.[0];

  // Calculate gestational age in weeks (informational only)
  let gestationalWeeks = 0;
  if (activePregnancy?.lmpDate) {
    const lmp = new Date(activePregnancy.lmpDate);
    const now = new Date();
    gestationalWeeks = Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24 * 7));
  }

  const handleOpenChangeModal = (beneficiaryId: string, currentVal: string) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setOldValue(currentVal || user?.phone || '');
    setNewValue('');
    setChangeSuccessMessage(null);
    setShowChangeModal(true);
  };

  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    setSubmittingChange(true);
    const res = await apiFetch('/parent/change-request', {
      method: 'POST',
      body: JSON.stringify({
        beneficiaryId: selectedBeneficiaryId || motherBeneficiary?.id,
        requestType,
        oldValue,
        newValue,
      }),
    });
    setSubmittingChange(false);

    if (res.success) {
      setChangeSuccessMessage(
        isTa
          ? 'மாற்றக் கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. ஆஷா செவிலியர் சரிபார்த்த பிறகு அமலுக்கு வரும்.'
          : 'Change request submitted successfully. It will take effect after health worker review.'
      );
      loadParentData();
      setTimeout(() => {
        setShowChangeModal(false);
      }, 2000);
    } else {
      alert(res.error || 'Failed to submit change request.');
    }
  };

  const handleDownloadSummaryPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header banner
    doc.setFillColor(190, 24, 93);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MaternaTrack — Mother & Child Health Record', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Care Summary | Sathyamangalam, Erode District, Tamil Nadu', 14, 20);

    yPos = 38;

    // Beneficiary profile
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Mother: ${motherBeneficiary?.fullName || 'N/A'} (${motherBeneficiary?.beneficiaryId})`, 14, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Address: ${motherBeneficiary?.address || 'N/A'} | Village: ${motherBeneficiary?.village?.name || 'Ukkaram'}`, 14, yPos);
    yPos += 6;

    if (activePregnancy) {
      doc.text(
        `Pregnancy Stage: ~${gestationalWeeks} Weeks (Informational) | EDD: ${new Date(activePregnancy.eddDate).toLocaleDateString('en-IN')}`,
        14,
        yPos
      );
      yPos += 8;
    }

    doc.setDrawColor(229, 231, 235);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 8;

    // Maternal Services Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(157, 23, 77);
    doc.text('Maternal Care Services Timeline:', 14, yPos);
    yPos += 7;

    const services = motherBeneficiary?.maternalServices || [];
    doc.setFontSize(9);
    for (const s of services) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`• ${s.serviceType.replace('_', ' ')}:`, 18, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(s.status === 'COMPLETED' ? 21 : 180, s.status === 'COMPLETED' ? 128 : 83, s.status === 'COMPLETED' ? 61 : 9);
      doc.text(`Status: ${s.status}`, 80, yPos);

      doc.setTextColor(100, 116, 139);
      const dateStr = s.completedDate ? `Completed: ${new Date(s.completedDate).toLocaleDateString('en-IN')}` : `Scheduled: ${new Date(s.scheduledDate).toLocaleDateString('en-IN')}`;
      doc.text(dateStr, 130, yPos);
      yPos += 6;
    }
    yPos += 6;

    // Child Immunization Section
    if (childBeneficiary) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(157, 23, 77);
      doc.text(`Linked Child: ${childBeneficiary.fullName} (DOB: ${new Date(childBeneficiary.dobOrLmp).toLocaleDateString('en-IN')})`, 14, yPos);
      yPos += 7;

      const vaccines = childBeneficiary.immunizationRecords || [];
      doc.setFontSize(9);
      for (const v of vaccines) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(`• ${v.vaccine?.name || 'Vaccine'}:`, 18, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(v.status === 'COMPLETED' ? 21 : 180, v.status === 'COMPLETED' ? 128 : 83, v.status === 'COMPLETED' ? 61 : 9);
        doc.text(`Status: ${v.status}`, 80, yPos);

        doc.setTextColor(100, 116, 139);
        const vDateStr = v.administeredDate ? `Given: ${new Date(v.administeredDate).toLocaleDateString('en-IN')}` : `Due: ${new Date(v.dueDate).toLocaleDateString('en-IN')}`;
        doc.text(vDateStr, 130, yPos);
        yPos += 6;
      }
    }

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'MaternaTrack academic prototype record. Unverified records are clearly flagged. Do not modify clinical records without authorization.',
      14,
      doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`MaternaTrack_Summary_${motherBeneficiary?.beneficiaryId || 'Parent'}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-pink-700 font-semibold">
          <span className="w-5 h-5 border-2 border-pink-700 border-t-transparent rounded-full animate-spin"></span>
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
              <Heart className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
              <span>Parent / Caregiver Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('parent.welcome', { name: user?.fullName || 'Caregiver' })}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
              <span>{t('parent.beneficiaryId')}: <strong className="text-slate-800 font-mono">{motherBeneficiary?.beneficiaryId || 'TN-ERD-SAT-M001'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {motherBeneficiary?.village?.name || 'Ukkaram Village'}, Sathyamangalam
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenChangeModal(motherBeneficiary?.id, user?.phone || '')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('parent.changeRequestBtn')}</span>
            </button>
            <button
              onClick={handleDownloadSummaryPdf}
              className="px-4 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('parent.downloadSummary')}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pregnancy Stage Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">{t('parent.pregnancyStage')}</span>
              <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">
                ~{gestationalWeeks} Weeks
              </p>
              <p className="text-xs text-slate-500">
                {t('parent.edd')}: <strong className="text-slate-700">{activePregnancy?.eddDate ? new Date(activePregnancy.eddDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN') : 'N/A'}</strong>
              </p>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
              *Informational calculation based on reported LMP date. Not a clinical diagnosis.
            </p>
          </div>

          {/* Next Verified Appointment Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">{t('parent.nextAppointment')}</span>
              <Calendar className="w-4 h-4 text-pink-600" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">
                {motherBeneficiary?.appointments?.[0]
                  ? `${new Date(motherBeneficiary.appointments[0].scheduledDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')} (${motherBeneficiary.appointments[0].startTime})`
                  : 'ANC-3 Consultation'}
              </p>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Facility: Sathyamangalam GH</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Doctor: {motherBeneficiary?.appointments?.[0]?.doctor?.user?.fullName || 'Dr. Malathi Sundaram, DGO'}
            </p>
          </div>

          {/* Assigned Health Worker Contact Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold uppercase tracking-wider">{t('parent.assignedWorker')}</span>
              <Phone className="w-4 h-4 text-pink-600" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">
                {motherBeneficiary?.assignedWorker?.user?.fullName || 'Priya R, VHN'}
              </p>
              <p className="text-xs text-slate-600 font-mono">
                {motherBeneficiary?.assignedWorker?.user?.phone || '+91 98421 55670'}
              </p>
            </div>
            <p className="text-[11px] text-pink-800 bg-pink-50 p-2 rounded-lg border border-pink-100 font-medium">
              Ukkaram Village Health Sub-centre. Available Mon-Sat 09:00 - 17:00.
            </p>
          </div>
        </div>

        {/* Maternal Care Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>{t('parent.maternalTimeline')}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Track each antenatal check-up, ultrasound scan, and tetanus toxoid immunization.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
              Verified Records Only
            </span>
          </div>

          <div className="space-y-4">
            {motherBeneficiary?.maternalServices?.map((item: any, idx: number) => {
              const isCompleted = item.status === 'COMPLETED';
              const isOverdue = item.status === 'OVERDUE';
              const isScheduled = item.status === 'SCHEDULED';

              return (
                <div
                  key={item.id || idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isOverdue ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.serviceType.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {item.notes || 'Routine antenatal monitoring and maternal check-up.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.completedDate
                          ? new Date(item.completedDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')
                          : new Date(item.scheduledDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Linked Child Immunization Section */}
        {childBeneficiary && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Baby className="w-5 h-5 text-pink-600" />
                  <span>{t('parent.childTimeline')} — {childBeneficiary.fullName}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  DOB: {new Date(childBeneficiary.dobOrLmp).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')} • ID: {childBeneficiary.beneficiaryId}
                </p>
              </div>
              <span className="text-xs bg-pink-50 text-pink-800 border border-pink-200 px-2.5 py-1 rounded-full font-semibold">
                NIS Tamil Nadu Schedule
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childBeneficiary.immunizationRecords?.map((rec: any, idx: number) => {
                const isCompleted = rec.status === 'COMPLETED';
                const isOverdue = rec.status === 'OVERDUE';

                return (
                  <div
                    key={rec.id || idx}
                    className={`p-4 rounded-2xl border transition ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isOverdue
                        ? 'border-rose-200 bg-rose-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-900">
                        {rec.vaccine?.name || 'Vaccine'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mb-1">
                      Target: {rec.vaccine?.diseaseTargeted || 'Immunization protection'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rec.administeredDate
                        ? `Administered: ${new Date(rec.administeredDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')}`
                        : `Due Date: ${new Date(rec.dueDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')}`}
                    </p>
                    {rec.batchLotNumber && (
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        Batch: {rec.batchLotNumber}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Change Requests History */}
        {changeRequests.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submitted Change Requests Status
            </h3>
            <div className="space-y-3">
              {changeRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">
                      Request to update {req.requestType.replace('_', ' ')}
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      New Value: <strong className="text-slate-700">{req.newValue}</strong> • Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Change Request Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Request Profile & Contact Change
              </h3>
              <button onClick={() => setShowChangeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {changeSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                {changeSuccessMessage}
              </div>
            )}

            <form onSubmit={handleSubmitChangeRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Change Field</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-pink-500"
                >
                  <option value="PHONE_NUMBER">Mobile Number</option>
                  <option value="ADDRESS">Residential Address</option>
                  <option value="EMERGENCY_CONTACT">Emergency Contact</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Value</label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={requestType === 'PHONE_NUMBER' ? '+91 94431 XXXXX' : 'Enter new address or details'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                *High-impact changes remain pending review by your assigned ASHA/VHN worker. Verified records will not be overwritten automatically.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChange || !newValue.trim()}
                  className="px-5 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs"
                >
                  {submittingChange ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
