import { useState, useMemo } from 'react';
import { BookOpen, Calendar, ArrowLeft, Heart, Eye } from 'lucide-react';
import { Artikel } from '../../types';
import { formatTanggal } from '../../lib/utils';

interface EdukasiProps {
  articles: Artikel[];
  id?: string;
}

export function NasabahEdukasi({ articles, id }: EdukasiProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('semua');

  // Find currently read article
  const currentArticle = useMemo(() => {
    if (!selectedSlug) return null;
    return articles.find((art) => art.slug === selectedSlug);
  }, [articles, selectedSlug]);

  // Filter based on active category tab
  const filteredArticles = useMemo(() => {
    if (activeTab === 'semua') return articles;
    return articles.filter((art) => art.kategori.toLowerCase() === activeTab.toLowerCase());
  }, [articles, activeTab]);

  return (
    <div id={id} className="space-y-6">
      {currentArticle ? (
        /* DETAIL ARTICLE SCREEN */
        <div className="bg-white border border-neutral-200 rounded-lg p-6 lg:p-8 space-y-6">
          {/* Back Action */}
          <button
            onClick={() => setSelectedSlug(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Edukasi
          </button>

          {/* Banner Image */}
          {currentArticle.gambar_url && (
            <div className="w-full h-64 sm:h-96 rounded-lg overflow-hidden border border-neutral-100">
              <img
                src={currentArticle.gambar_url}
                alt={currentArticle.judul}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta header */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-block bg-brand-50 text-brand-600 font-semibold rounded-full text-2xs px-2.5 py-0.5 uppercase tracking-wide">
                {currentArticle.kategori}
              </span>
              <span className="text-neutral-300">•</span>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatTanggal(currentArticle.created_at)}</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-800 tracking-tight leading-tight">
              {currentArticle.judul}
            </h3>
          </div>

          <hr className="border-neutral-100" />

          {/* Article Main Text Content - Render as paragraphs */}
          <div className="text-neutral-600 text-sm leading-relaxed space-y-4 max-w-3xl">
            {currentArticle.konten.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>
      ) : (
        /* ARTICLES INDEX LIST SCREEN */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight font-sans">Edukasi Bijak Sampah</h2>
              <p className="text-sm text-neutral-500 mt-1 font-normal">
                Pelajari infografis, tips, dan panduan praktis memilah serta mendaur ulang sampah sehari-hari.
              </p>
            </div>
          </div>

          {/* Tab Filters */}
          <div className="flex border-b border-neutral-100">
            {['semua', 'panduan', 'fakta', 'tips'].map((tab) => (
              <button
                key={tab}
                id={`tab-edukasi-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-5 text-xs font-semibold capitalize tracking-wide transition-all border-b-2 cursor-pointer ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid listing */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center">
              <BookOpen className="h-10 w-10 text-neutral-300 mx-auto stroke-1 mb-2" />
              <p className="font-medium text-neutral-700">Tidak ada artikel di kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedSlug(art.slug)}
                  className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-all cursor-pointer flex flex-col group"
                >
                  {/* Photo Thumbnail */}
                  <div className="w-full h-44 overflow-hidden relative bg-neutral-100">
                    {art.gambar_url ? (
                      <img
                        src={art.gambar_url}
                        alt={art.judul}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <BookOpen className="h-8 w-8 stroke-1" />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 bg-brand-500 text-white rounded-md text-3xs font-bold uppercase tracking-wide px-2 py-0.5 shadow-sm">
                      {art.kategori}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-4xs text-neutral-400 mb-1 font-mono uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTanggal(art.created_at)}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-neutral-800 line-clamp-2 tracking-tight group-hover:text-brand-600 transition-colors">
                        {art.judul}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 font-normal leading-relaxed">
                        {art.ringkasan || art.konten}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-50/50 flex items-center justify-between text-2xs font-semibold text-brand-600 hover:text-brand-700">
                      <span>Baca Selengkapnya →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
