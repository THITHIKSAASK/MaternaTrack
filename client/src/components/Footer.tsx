import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Shield, PhoneCall, ExternalLink, Info, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MaternaTrack</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('app.fullName')}
            </p>
            <p className="text-xs font-medium text-pink-400">
              {t('app.tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
              <span>{t('app.region')}</span>
            </div>
          </div>

          {/* Emergency & Helpline Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase border-b border-slate-800 pb-2">
              Emergency & Helplines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-slate-300">108 Emergency Ambulance:</span>
                <span className="font-bold text-emerald-400 font-mono">108</span>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-slate-300">102 Mother & Child Transport:</span>
                <span className="font-bold text-emerald-400 font-mono">102</span>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-slate-300">104 TN Health Helpline:</span>
                <span className="font-bold text-emerald-400 font-mono">104</span>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-slate-300">Sathyamangalam GH:</span>
                <span className="text-slate-300 font-mono">+91 4295 220022</span>
              </li>
            </ul>
          </div>

          {/* Official Public Health References */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase border-b border-slate-800 pb-2">
              Official Reference Sources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://rmnch.mohfw.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>MOHFW RMNCH+A Public Health Portal</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.mohfw.gov.in/sites/default/files/Universal.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>National Immunization Schedule (NIS)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tnhealth.org/directorate/dphis.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>Directorate of Public Health, Tamil Nadu</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>World Health Organization (WHO)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Demo & Academic Notice */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase border-b border-slate-800 pb-2">
              Academic Prototype Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded border border-slate-800">
              {t('app.footerNotice')}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded border border-amber-900/40">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{t('app.syntheticNotice')}</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MaternaTrack. Academic Research Prototype. Sathyamangalam, Erode District, Tamil Nadu.</p>
          <p className="text-[11px] text-slate-400">
            Powered by deterministic schedule engines & verified clinical continuity.
          </p>
        </div>
      </div>
    </footer>
  );
};
