import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { PinkAnnouncementTicker } from '../components/PinkAnnouncementTicker.js';
import { ArticleModal, type Article } from '../components/ArticleModal.js';
import { apiFetch } from '../api/client.js';
import {
  Heart,
  Baby,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Users,
  Stethoscope,
  Sparkles,
  ExternalLink,
  Download,
  AlertCircle,
  FileText,
  MapPin,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const isTa = i18n.language === 'ta';

  useEffect(() => {
    async function loadMilestones() {
      const res = await apiFetch<Article[]>('/articles?category=HISTORICAL_MILESTONE');
      if (res.success && res.data) {
        setMilestones(res.data);
      }
    }
    loadMilestones();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Signature Moving Pink Announcement Strip */}
      <PinkAnnouncementTicker />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50/70 via-white to-slate-50 border-b border-pink-100/60 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-900 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse"></span>
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t('hero.headline')}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t('hero.subheadline')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={user ? (user.role === 'PARENT' ? '/parent' : user.role === 'HEALTH_WORKER' ? '/worker' : user.role === 'DOCTOR' ? '/doctor' : '/admin') : '/login'}
                  className="bg-pink-700 hover:bg-pink-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md transition flex items-center gap-2 group text-sm sm:text-base"
                >
                  <span>{t('hero.primaryCta')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <a
                  href="#maternal-care"
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-5 py-3.5 rounded-xl shadow-xs transition text-sm sm:text-base"
                >
                  {t('hero.secondaryCta')}
                </a>
              </div>

              {/* Demonstrative Focus Area Notice */}
              <div className="pt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-200">
                <MapPin className="w-4 h-4 text-pink-700 shrink-0" />
                <span>
                  <strong>Primary Demonstration Area:</strong> Sathyamangalam, Ukkaram, Bhavanisagar, Rangasamudram & Gobichettipalayam, Erode District, Tamil Nadu.
                </span>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-xl border border-pink-100 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700">
                      <Heart className="w-6 h-6 fill-pink-600 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {isTa ? 'தாய் சேய் நல்வாழ்வு பயணம்' : 'Connected Mother & Child Care'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isTa ? 'பதிவு முதல் முடிவுற்ற சேவை வரை' : 'From Registration to Verified Completion'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
                    ACTIVE
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {isTa ? 'கர்ப்ப பதிவு & முதல் பரிசோதனை (ANC-1)' : 'Antenatal Check-up 1 (ANC-1)'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isTa ? 'முடிவுற்றது • டிடி-1 தடுப்பூசி வழங்கப்பட்டது' : 'Completed & Verified • Td-1 Administered'}
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold text-[11px]">100%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {isTa ? 'மூன்றாம் பரிசோதனை (ANC-3) & ரத்தப் பரிசோதனை' : 'Antenatal Check-up 3 (ANC-3)'}
                        </p>
                        <p className="text-[11px] text-amber-800">
                          {isTa ? 'அடுத்த 3 நாட்களில் வரவுள்ளது • நினைவூட்டல் அனுப்பப்பட்டது' : 'Due in 3 Days • Advance Reminder Sent'}
                        </p>
                      </div>
                    </div>
                    <span className="text-amber-700 font-bold text-[11px] uppercase">DUE SOON</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Baby className="w-4 h-4 text-pink-700 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {isTa ? 'குழந்தை தடுப்பூசி (பென்டாவேலண்ட்-2 & ஓபிவி-2)' : 'Child Vaccine (Pentavalent-2 & OPV-2)'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isTa ? '10-வது வாரம் • திட்டமிடப்பட்டது' : '10th Week • Scheduled from Verified Birth Date'}
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-600 font-semibold text-[11px]">WEEK 10</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      Materna Voice AI
                    </span>
                    <span className="text-[10px] text-emerald-400">READY</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {isTa ? 'குரல் அல்லது தட்டச்சு மூலம் தமிழ் மற்றும் ஆங்கிலத்தில் தகவல்களை பெறலாம்.' : 'Ask in Tamil or English with voice speech or typed text.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Our Mission */}
      <section id="mission" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-pink-700 text-xs font-bold uppercase tracking-wider">
              {t('nav.mission')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isTa ? 'நினைவூட்டலுடன் நில்லாமல், சேவை நிறைவை உறுதி செய்தல்' : 'Closing the Care Gap Beyond Passive Reminders'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isTa
                ? 'பெரும்பாலான அமைப்புகள் நினைவூட்டல் குறுஞ்செய்தி அனுப்புவதோடு நின்றுவிடுகின்றன. ஆனால் மதர்னாட்ராக், விடுபட்ட வருகைகளை ஆஷா செவிலியர்கள் மற்றும் மருத்துவர்களோடு இணைத்து கணக்கு காட்டத்தக்க தொடர் சேவையாக மாற்றுகிறது.'
                : 'Traditional reminder apps stop at sending an SMS. MaternaTrack actively identifies overdue cases, creates accountable follow-up workflows for community nurses, and requires verified clinical reviews before cases are closed.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-700 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isTa ? 'தாய்-சேய் ஒருங்கிணைந்த பதிவுகள்' : 'Connected Mother-Child Records'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa
                  ? 'கர்ப்பகால பதிவுகளிலிருந்து பிரசவம் மற்றும் குழந்தையின் 5-ஆவது வயது வரையிலான தடுப்பூசி அட்டவணை வரை ஒரே இடத்தில் தொடர்ச்சி.'
                  : 'A seamless journey linking pregnancy milestones directly with infant delivery details and childhood immunization calendars.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isTa ? 'விடுபட்ட வருகை மீட்பு & தொடர் பணி' : 'Accountable Follow-up Tasks'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa
                  ? 'பரிசோதனை தவறினால் தானாகவே ஆஷா பணியாளருக்கு பணி ஒதுக்கீடு செய்யப்பட்டு, தொடர்பு விவரங்கள் மற்றும் காரணங்கள் பதிவு செய்யப்படுகின்றன.'
                  : 'Overdue appointments trigger structured follow-up tasks with documented contact attempts, barrier reasons, and escalation paths.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-700 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isTa ? 'சரிபார்க்கப்பட்ட மருத்துவ நிறைவு' : 'Verified Clinical Completion'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa
                  ? 'ஆவணத்தை பதிவேற்றுவது மட்டுமே ஒப்புதலாகாது. அங்கீகரிக்கப்பட்ட மருத்துவர் மதிப்பாய்வு செய்து உறுதி செய்த பிறகே பணி நிறைவு பெறும்.'
                  : 'Document upload alone never counts as clinical approval. High-risk cases require verified clinician review and audit logging.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Maternal Care Journey */}
      <section id="maternal-care" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-pink-700 text-xs font-bold uppercase tracking-wider">
              {t('nav.maternalCare')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isTa ? 'கர்ப்பகால தாய்மை நலம் மற்றும் மருத்துவ மைல்கற்கள்' : 'Antenatal & Postnatal Care Continuity'}
            </h2>
            <p className="text-slate-600 text-sm">
              {isTa ? 'தேசிய மற்றும் தமிழ்நாடு சுகாதார வழிகாட்டுதல்களின்படி கட்டமைக்கப்பட்ட 4 அத்தியாவசிய பரிசோதனைகள்.' : 'Structured according to MOHFW RMNCH+A protocol with at least 4 comprehensive check-ups.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                1st Trimester (0-12 Wks)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {isTa ? 'ANC-1: ஆரம்ப பதிவு' : 'ANC-1: Early Registration'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa ? 'ரத்த அழுத்தம், எச்பி, ரத்த வகை பரிசோதனை, Td-1 தடுப்பூசி மற்றும் போலிக் அமில மாத்திரைகள் விநியோகம்.' : 'Blood pressure, Hb profiling, blood grouping, Td-1 immunization, and initial folic acid supplementation.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                2nd Trimester (14-26 Wks)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {isTa ? 'ANC-2: குறைபாடு ஸ்கேன் & Td-2' : 'ANC-2: Anomaly Ultrasound & Td-2'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa ? 'அல்ட்ராசவுண்ட் ஸ்கேன், Td-2 தடுப்பூசி, ஐ.எஃப்.ஏ (IFA) இரும்புச்சத்து மாத்திரைகள் மற்றும் சர்க்கரை பரிசோதனை (OGTT).' : 'Detailed anomaly scan, second Td dose, 100 IFA tablets, and oral glucose tolerance testing (OGTT).'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                3rd Trimester (28-34 Wks)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {isTa ? 'ANC-3: குழந்தை வளர்ச்சி கண்காணிப்பு' : 'ANC-3: Growth & Complication Screening'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa ? 'கரு வளர்ச்சி, ரத்த சோகை மறுபரிசோதனை, உயர் ரத்த அழுத்தம் மற்றும் பிரசவ திட்டமிடல்.' : 'Fetal growth monitoring, fundal height tracking, repeat Hb screening, and delivery facility mapping.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                Term (36 Wks+)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {isTa ? 'ANC-4 & பிரசவ திட்டம்' : 'ANC-4: Institutional Birth Plan'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isTa ? 'அரசு மருத்துவமனையில் பாதுகாப்பான பிரசவத்திற்கான ஏற்பாடுகள், 108 அவசர ஊர்தி தொடர்பு.' : 'Final presentation evaluation, hospital bed linkage, 108 ambulance coordination, and PNC scheduling.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Child Immunization NIS */}
      <section id="child-immunization" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-pink-700 text-xs font-bold uppercase tracking-wider">
              {t('nav.immunization')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isTa ? 'தேசிய மற்றும் தமிழ்நாடு தடுப்பூசி அட்டவணை' : 'National & Tamil Nadu Immunization Milestones'}
            </h2>
            <p className="text-slate-600 text-sm">
              {isTa ? 'அனைத்து குழந்தைகளுக்கும் உரிய காலத்தில் தடுப்பூசி வழங்கி தீவிர தொற்றுநோய்களிலிருந்து பாதுகாப்பு.' : 'Governed by deterministic biological timing rules to safeguard against preventable childhood diseases.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">At Birth (0-24 Hours)</span>
                <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded">Day 0</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>BCG (Tuberculosis)</li>
                <li>OPV-0 (Oral Polio birth dose)</li>
                <li>Hepatitis B birth dose</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">6 Weeks</span>
                <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded">Week 6</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Pentavalent-1 (DPT, Hep B, Hib)</li>
                <li>OPV-1 & Rotavirus-1</li>
                <li>fIPV-1 (Fractional IPV) & PCV-1</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">10 Weeks</span>
                <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded">Week 10</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Pentavalent-2</li>
                <li>OPV-2</li>
                <li>Rotavirus-2</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">14 Weeks</span>
                <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded">Week 14</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Pentavalent-3 & OPV-3</li>
                <li>Rotavirus-3</li>
                <li>fIPV-2 & PCV-2</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">9 - 12 Months</span>
                <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded">9 Months</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>MR-1 (Measles & Rubella)</li>
                <li>PCV Booster</li>
                <li>Vitamin A Dose 1</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">16 - 24 Months</span>
                <span className="text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded">16-24 Months</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>MR-2 (Measles & Rubella 2nd dose)</li>
                <li>DPT Booster-1</li>
                <li>OPV Booster</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: History Timeline */}
      <section id="timeline" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-pink-700 text-xs font-bold uppercase tracking-wider">
              {t('timeline.title')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isTa ? 'தாய் சேய் நல்வாழ்வு அமைப்பின் பரிணாம மைல்கற்கள்' : 'Maternal & Child Healthcare Evolution'}
            </h2>
            <p className="text-slate-600 text-sm">
              {t('timeline.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-pink-700 uppercase bg-pink-50 px-2 py-0.5 rounded">
                      Milestone {idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.reviewDate).getFullYear()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isTa ? item.titleTa : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTa ? item.summaryTa : item.summaryEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedArticle(item)}
                    className="text-pink-700 hover:text-pink-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('timeline.readArticle')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">PDF Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Role-based Collaboration (ASHA / ANM / Doctor) */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-pink-700 text-xs font-bold uppercase tracking-wider">
              {t('nav.howItWorks')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isTa ? 'பெற்றோர், சுகாதாரப் பணியாளர் மற்றும் மருத்துவரின் ஒருங்கிணைப்பு' : 'Coordinated Care Architecture'}
            </h2>
            <p className="text-slate-600 text-sm">
              {isTa ? 'ஒரே தரவுத்தளத்தில் மூன்று பணிநிலைகளும் தங்களுக்குரிய பாதுகாப்பான பணித்தளத்தில் செயல்படுகின்றன.' : 'Three distinct user workspaces working with the same persistent database.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-pink-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Parent Portal</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>View upcoming appointment and vaccination due dates</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Request mobile number and village address updates</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Download official healthcare summary PDF in Tamil or English</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-pink-700 hover:underline pt-2"
              >
                Access Parent Portal →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Health Worker Dashboard (VHN/ASHA)</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Filter beneficiaries by Sathyamangalam villages</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Record & verify administered vaccines and ANC visits</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Log contact attempts, migration reasons, and refer high-risk cases</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-pink-700 hover:underline pt-2"
              >
                Access Worker Dashboard →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Doctor Workspace (DGO)</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Schedule consultations with break-time conflict detection</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Review and accept high-risk maternal referrals</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Perform clinical reviews with mandatory supporting documents</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-pink-700 hover:underline pt-2"
              >
                Access Clinician Workspace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </div>
  );
};
