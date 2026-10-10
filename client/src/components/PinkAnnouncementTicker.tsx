import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, BellRing, ChevronRight, Heart } from 'lucide-react';
import { ArticleModal, type Article } from './ArticleModal.js';
import { apiFetch } from '../api/client.js';

export const PinkAnnouncementTicker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    async function loadTickerArticles() {
      const res = await apiFetch<Article[]>('/articles?category=TICKER_ANNOUNCEMENT');
      if (res.success && res.data && res.data.length > 0) {
        setArticles(res.data);
      }
    }
    loadTickerArticles();
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const isTa = i18n.language === 'ta';

  if (articles.length === 0) return null;

  return (
    <>
      <section
        className="bg-[#FCE7F3] border-y border-pink-200 text-[#9D174D] h-11 sm:h-12 flex items-center overflow-hidden relative shadow-xs"
        aria-label="Public Health Announcement Ticker"
      >
        {/* Left Ticker Label */}
        <div className="z-20 bg-[#FCE7F3] pl-4 sm:pl-8 pr-3 flex items-center gap-2 font-bold text-xs uppercase tracking-wider shrink-0 shadow-r border-r border-pink-300/60">
          <span className="w-2 h-2 rounded-full bg-pink-700 animate-ping inline-block"></span>
          <span className="hidden sm:inline">{t('ticker.title')}</span>
          <BellRing className="w-3.5 h-3.5 sm:hidden text-pink-700" />
        </div>

        {/* Marquee Track */}
        <div
          className="flex-1 overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div
            className={`animate-ticker flex items-center gap-10 whitespace-nowrap text-xs sm:text-sm font-medium ${
              isPaused ? 'paused' : ''
            }`}
          >
            {/* Duplicated list to create seamless infinite scroll */}
            {[...articles, ...articles].map((item, idx) => (
              <button
                key={`${item.slug}-${idx}`}
                onClick={() => setSelectedArticle(item)}
                className="inline-flex items-center gap-2 hover:underline focus:outline-none focus:ring-1 focus:ring-pink-700 rounded px-1.5 py-0.5 text-[#9D174D] cursor-pointer group transition"
                title={t('ticker.readMore')}
              >
                <Heart className="w-3.5 h-3.5 fill-pink-600 text-pink-600 shrink-0" />
                <span>{isTa ? item.titleTa : item.titleEn}</span>
                <span className="text-[10px] bg-pink-200/80 px-1 rounded text-pink-800 uppercase font-semibold">
                  {t('common.viewDetails')}
                </span>
                <span className="text-pink-300">|</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Pause / Play Control */}
        <div className="z-20 bg-[#FCE7F3] pr-4 sm:pr-8 pl-2 shrink-0 border-l border-pink-300/60">
          <button
            onClick={togglePause}
            className="p-1 rounded text-pink-700 hover:text-pink-900 hover:bg-pink-200/50 transition focus:outline-none focus:ring-1 focus:ring-pink-700"
            aria-label={isPaused ? t('ticker.play') : t('ticker.pause')}
            title={isPaused ? t('ticker.play') : t('ticker.pause')}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-pink-700" /> : <Pause className="w-3.5 h-3.5 fill-pink-700" />}
          </button>
        </div>
      </section>

      {/* Article Detail & PDF Modal */}
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
    </>
  );
};
