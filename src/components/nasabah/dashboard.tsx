import React, { useState, useRef, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Calendar, ClipboardList, Recycle, Sparkles, ChevronRight, Award, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { Profile, Transaksi, Badge } from '../../types';
import { formatRupiah, formatAngka, formatTanggal, getLevelProgress, getNextLevel } from '../../lib/utils';

interface DashboardProps {
  profile: Profile;
  transactions: Transaksi[];
  badges: Badge[];
  allBadges: Badge[];
  setTab: (tab: string) => void;
  id?: string;
}

export function NasabahDashboard({ profile, transactions, badges, allBadges, setTab, id }: DashboardProps) {
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Statistics
  const totalPoin = profile.total_poin;
  const saldoRupiah = totalPoin * 1; // 1 Poin = Rp 1
  const totalKg = Number(transactions.reduce((sum, tx) => sum + Number(tx.total_berat), 0).toFixed(1));
  const totalTransaksi = transactions.length;

  const nextLevel = getNextLevel(totalPoin);
  const levelProgress = getLevelProgress(totalPoin);

  // Latest 5 transactions
  const latestTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Current formatted date in Indonesian
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  const downloadQR = () => {
    setDownloading(true);
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_SMASH_${profile.nama.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    }
    setDownloading(false);
  };

  return (
    <div id={id} className="space-y-6 font-sans">
      {/* Greeting Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-neutral-950 tracking-tight leading-none">
          Halo, {profile.nama} 👋
        </h2>
        <p className="text-sm text-neutral-400 mt-1 font-medium">
          {formattedToday}
        </p>
      </div>

      {/* Hero Card — bg brand, bukan gradient */}
      <div className="bg-brand-500 rounded-2xl p-5 text-white active:scale-[0.99] transition-transform shadow-xs">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-brand-100 text-xs font-semibold uppercase tracking-wider">Total Poin Kamu</p>
            <p className="text-4xl font-extrabold tabular-nums mt-1.5 flex items-baseline gap-1">
              {formatAngka(totalPoin)}
              <span className="text-sm font-semibold text-brand-100">Poin</span>
            </p>
            <p className="text-brand-100 text-xs mt-1 font-medium">
              Setara {formatRupiah(saldoRupiah)}
            </p>
          </div>
          <div className="bg-brand-400 rounded-xl p-2.5 flex items-center justify-center">
            <Recycle className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-brand-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-brand-400/20">
            Level: {profile.level} 🌱
          </span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-xl p-4 border border-neutral-155">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-neutral-700">Progress ke level berikutnya</span>
          <span className="text-xs font-bold text-neutral-900">{totalPoin}/{nextLevel?.min || 500} poin</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-1.5 font-medium">
          {nextLevel ? `${nextLevel.min - totalPoin} poin lagi untuk "${nextLevel.nama}"` : 'Level tertinggi! 🎉'}
        </p>
      </div>

      {/* Quick stats 2 kolom */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-neutral-155">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-2">
            <Recycle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900 tabular-nums">{totalKg} kg</p>
          <p className="text-xs text-neutral-550 mt-0.5 font-medium">Total sampah disetor</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-neutral-155">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900 tabular-nums">{totalTransaksi}x</p>
          <p className="text-xs text-neutral-550 mt-0.5 font-medium">Total transaksi</p>
        </div>
      </div>

      {/* Grid: Main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Last Transactions & Badges */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Latest Transactions */}
          <div className="bg-white rounded-xl border border-neutral-155 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-neutral-900 text-sm">Transaksi Terakhir</h3>
              <button
                onClick={() => setTab('riwayat')}
                className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-0.5 cursor-pointer"
                style={{ minHeight: '44px', display: 'flex', itemsCenter: 'center' }}
              >
                Lihat semua riwayat <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {latestTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-neutral-500 font-medium">Belum ada riwayat transaksi penyetoran.</p>
                <p className="text-2xs text-neutral-400 mt-1">Gunakan Kartu QR di kanan untuk memulai penyetoran keliling.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {latestTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Recycle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-800">Setor Sampah</p>
                        <p className="text-3xs text-neutral-400 font-medium">{formatTanggal(tx.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-brand-600">+{tx.poin_diperoleh} Poin</p>
                      <p className="text-3xs text-neutral-400 font-semibold">{formatRupiah(tx.total_nilai)} • {tx.total_berat}kg</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badge Saya section */}
          <div className="bg-white rounded-xl border border-neutral-155 p-5">
            <h3 className="font-bold text-neutral-900 text-sm mb-4">Lencana Kehormatan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allBadges.map((badge) => {
                const isOwned = badges.some((b) => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`border rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all ${
                      isOwned
                        ? 'bg-neutral-50/50 border-brand-200'
                        : 'bg-neutral-50/20 border-neutral-100 opacity-50'
                    }`}
                  >
                    <span className="text-2xl mb-1 filter drop-shadow-xs">{badge.ikon}</span>
                    <span className="text-xs font-bold text-neutral-800 truncate w-full">{badge.nama}</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 font-medium leading-tight h-8 line-clamp-2 w-full">{badge.deskripsi}</span>
                    
                    <div className="mt-2">
                      {isOwned ? (
                        <span className="bg-brand-50 text-brand-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-brand-100">
                          Diperoleh
                        </span>
                      ) : (
                        <span className="bg-neutral-100 text-neutral-500 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {badge.min_poin} Poin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Digital Member Card with QR */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-neutral-155 rounded-2xl p-5 flex flex-col items-center shadow-xs">
            <h3 className="font-bold text-neutral-900 text-sm text-center mb-1">Kartu Anggota Digital</h3>
            <p className="text-[11px] text-neutral-500 text-center mb-4 leading-normal font-medium max-w-xs">
              Tunjukkan QR Code di bawah ini kepada petugas Bank Sampah untuk memproses timbangan setoran Anda.
            </p>

            {/* QR Container Frame */}
            <div className="p-4 bg-white border border-neutral-200/80 rounded-xl flex items-center justify-center mb-3" ref={qrRef}>
              <QRCodeCanvas
                value={profile.id}
                size={160}
                level="Q"
                includeMargin={false}
              />
            </div>

            <span className="text-xs font-mono text-neutral-550 bg-neutral-50 border border-neutral-100 px-3 py-1 rounded-md mb-4 w-full text-center truncate">
              ID: {profile.id}
            </span>

            <button
              onClick={downloadQR}
              disabled={downloading}
              className="w-full h-11 bg-brand-500 text-white hover:bg-brand-610 active:scale-98 transition-all rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs select-none"
              style={{ minHeight: '44px' }}
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Mengunduh...' : 'Unduh QR Code'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
