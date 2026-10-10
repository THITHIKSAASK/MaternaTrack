import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer, Download, ExternalLink, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { jsPDF } from 'jspdf';

export interface Article {
  id: string;
  slug: string;
  titleEn: string;
  titleTa: string;
  category: string;
  summaryEn: string;
  summaryTa: string;
  contentEn: string;
  contentTa: string;
  sourceUrl: string;
  reviewDate: string;
  imageUrl?: string;
}

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { t, i18n } = useTranslation();

  if (!article) return null;

  const isTa = i18n.language === 'ta';
  const title = isTa ? article.titleTa : article.titleEn;
  const summary = isTa ? article.summaryTa : article.summaryEn;
  const content = isTa ? article.contentTa : article.contentEn;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header banner
    doc.setFillColor(190, 24, 93); // #BE185D Brand Rose
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MaternaTrack — Public Health Education', 14, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('From pregnancy registration to verified care completion | Sathyamangalam, Tamil Nadu', 14, 20);

    yPos = 38;

    // Document Title
    doc.setTextColor(31, 41, 55); // #1F2937
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(article.titleEn, pageWidth - 28);
    doc.text(titleLines, 14, yPos);
    yPos += titleLines.length * 7 + 4;

    // Metadata Strip
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Category: ${article.category.replace('_', ' ')}  |  Review Date: ${new Date(article.reviewDate).toLocaleDateString('en-IN')}`, 14, yPos);
    yPos += 8;

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;

    // Summary Box
    doc.setFillColor(255, 247, 250); // #FFF7FA
    doc.rect(14, yPos, pageWidth - 28, 22, 'F');
    doc.setDrawColor(252, 231, 243);
    doc.rect(14, yPos, pageWidth - 28, 22, 'D');

    doc.setTextColor(157, 23, 77); // #9D174D
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Core Clinical Summary:', 18, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(article.summaryEn, pageWidth - 36);
    doc.text(summaryLines, 18, yPos + 14);
    yPos += 30;

    // Full Content
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contentLines = doc.splitTextToSize(article.contentEn, pageWidth - 28);
    doc.text(contentLines, 14, yPos);
    yPos += contentLines.length * 6 + 14;

    // Source Citation Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, pageWidth - 28, 24, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, yPos, pageWidth - 28, 24, 'D');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Official Reference Attribution:', 18, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(3, 105, 161);
    doc.text(article.sourceUrl, 18, yPos + 14);

    doc.setTextColor(100, 116, 139);
    doc.text('Ministry of Health and Family Welfare (MOHFW) & Tamil Nadu Directorate of Public Health', 18, yPos + 20);

    // Footer Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'MaternaTrack academic prototype. Not an official state portal. Verify with qualified health workers.',
      14,
      doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`MaternaTrack_${article.slug}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 p-6 border-b border-pink-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-pink-700 text-white shadow-xs">
                <Heart className="w-3 h-3 fill-white" />
                {article.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(article.reviewDate).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN')}
              </span>
            </div>
            <h2 id="article-modal-title" className="text-xl font-bold text-slate-900 leading-snug">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-white/80 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm leading-relaxed">
          {/* Summary Callout */}
          <div className="bg-pink-50/60 border border-pink-200/70 rounded-xl p-4 text-pink-950 font-medium">
            <p className="text-xs font-semibold uppercase tracking-wider text-pink-700 mb-1">
              {isTa ? 'சுருக்கம்' : 'Key Guidance'}
            </p>
            {summary}
          </div>

          {/* Full Content */}
          <div className="prose prose-slate max-w-none text-slate-800">
            <p className="whitespace-pre-line leading-relaxed">{content}</p>
          </div>

          {/* Source Attribution Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isTa ? 'சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ ஆதாரம்' : 'Verified Authoritative Reference'}</span>
            </div>
            <p className="text-slate-600">
              {isTa
                ? 'இந்த வழிகாட்டுதல் மத்திய சுகாதார அமைச்சகம் (MOHFW) மற்றும் தமிழ்நாடு பொது சுகாதார இயக்குநரகத்தின் வழிகாட்டுதல்களை அடிப்படையாகக் கொண்டது.'
                : 'This guidance aligns with Ministry of Health and Family Welfare (MOHFW) Universal Immunization and RMNCH+A operational protocols.'}
            </p>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-pink-700 hover:text-pink-800 font-medium hover:underline pt-1"
            >
              <span>{article.sourceUrl}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {t('app.footerNotice')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('common.print')}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('common.download')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
