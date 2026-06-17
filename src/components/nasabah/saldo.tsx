import React, { useState, useMemo } from 'react';
import { AlertTriangle, Wallet, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Profile, Transaksi } from '../../types';
import { formatRupiah, formatAngka, formatTanggal } from '../../lib/utils';

interface SaldoProps {
  profile: Profile;
  transactions: Transaksi[];
  id?: string;
}

export function NasabahSaldo({ profile, transactions, id }: SaldoProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [nominal, setNominal] = useState('');
  const [rekening, setRekening] = useState('');
  const [bank, setBank] = useState('GOPAY');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const saldoRupiah = profile.total_poin * 1; // 1 poin = Rp 1

  // Sort transactions chronologically to show historical points income
  const pointHistory = useMemo(() => {
    return [...transactions]
      .filter((tx) => tx.poin_diperoleh > 0)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [transactions]);

  const handleCairkan = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNominal = Number(nominal);
    if (!nominal || isNaN(cleanNominal) || cleanNominal <= 0) {
      alert('Silakan masukkan nominal pencairan yang valid');
      return;
    }

    if (cleanNominal < 10000) {
      alert('Minimal penarikan saldo adalah Rp 10.000');
      return;
    }

    if (cleanNominal > saldoRupiah) {
      alert('Saldo Anda tidak mencukupi untuk nominal pencairan tersebut');
      return;
    }

    // Success response mock for the demo
    setModalOpen(false);
    setSuccessMessage(`Permintaan pencairan sebesar ${formatRupiah(cleanNominal)} sedang diajukan dan akan diproses dalam 2–3 hari kerja ke rekening ${bank} ${rekening}.`);
    setNominal('');
    setRekening('');
    
    // Auto-clear success message after 8 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 8000);
  };

  return (
    <div id={id} className="space-y-6 font-sans">
      
      {/* Page Header (Desktop only) */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Saldo &amp; Kemitraan</h2>
        <p className="text-sm text-neutral-550 mt-1">
          Konversikan poin kontribusi lingkungan Anda menjadi rupiah dengan mudah.
        </p>
      </div>

      {/* Success Toast / Notification Banner */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-green-800 animate-in fade-in duration-150">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <strong className="font-bold block">Permintaan Berhasil Terkirim!</strong>
            <span className="mt-1 block text-neutral-600 leading-relaxed font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Saldo Card — e-wallet style, bg-neutral-900 (Wajib no gradient) */}
      <div className="bg-neutral-900 rounded-2xl p-5 text-white shadow-xs relative overflow-hidden">
        <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Saldo SMASH</p>
        <p className="text-4xl font-extrabold mt-2.5 tabular-nums tracking-tight">
          {formatRupiah(saldoRupiah)}
        </p>
        <p className="text-neutral-400 text-xs mt-1.5 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          {formatAngka(profile.total_poin)} poin terkumpul
        </p>

        {/* Tombol Cairkan — DEMO */}
        <button
          onClick={() => setModalOpen(true)}
          id="btn-cairkan-saldo"
          className="mt-6 w-full bg-white text-neutral-950 rounded-xl py-3.5 font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer select-none touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          Cairkan Saldo
        </button>
      </div>

      {/* Informative summary card */}
      <div className="bg-white border border-neutral-155 rounded-xl p-4 space-y-3">
        <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Ketentuan Penarikan Jurnal</h4>
        <div className="space-y-2 text-xs text-neutral-550 font-medium leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
            <p>Minimal pencairan saldo adalah <strong className="text-neutral-800">Rp 10.000</strong> (setara 10.000 poin).</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
            <p>Mendukung transfer ke dompet digital (GoPay, OVO, Dana) dan rekening Bank DKI.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
            <p>Pencairan saldo di halaman demo ini bersifat simulasi dan tidak memotong poin di database asli Anda.</p>
          </div>
        </div>
      </div>

      {/* Point Income History list */}
      <div className="bg-white border border-neutral-155 rounded-xl p-4">
        <h4 className="font-bold text-neutral-950 text-sm mb-3">Riwayat Transaksi Poin</h4>
        
        {pointHistory.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-neutral-500 font-medium">Belum ada pemasukan poin.</p>
            <p className="text-3xs text-neutral-400 mt-0.5">Poin dikreditkan otomatis setiap setoran divalidasi oleh petugas.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {pointHistory.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-brand-50 text-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-800">Setoran dihitung ({tx.total_berat} kg)</p>
                    <p className="text-3xs text-neutral-400 font-semibold">{formatTanggal(tx.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-brand-600">+{formatAngka(tx.poin_diperoleh)} Poin</p>
                  <p className="text-3xs text-neutral-400 font-bold">{formatRupiah(tx.poin_diperoleh * 1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Demo Pencairan (Bottom sheet on mobile, centered dialog on desktop) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-150">
          
          {/* Main Container */}
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-5 border-t md:border border-neutral-200 shadow-lg animate-in slide-in-from-bottom duration-200">
            
            {/* Banner demo */}
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 mb-4 text-xs text-amber-800 font-semibold leading-normal">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p>Fitur Demo — Tidak memproses transaksi nyata.</p>
            </div>

            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Pencairan Kemitraan Digital</h3>
            <p className="text-2xs text-neutral-400 mt-1 font-semibold uppercase">Poin saat ini: {formatAngka(profile.total_poin)} (Rupiah: {formatRupiah(saldoRupiah)})</p>

            <form onSubmit={handleCairkan} className="space-y-4 mt-4">
              <div>
                <label className="block text-xxs font-bold text-neutral-500 uppercase mb-1">Metode Transfer Dompet</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="h-10 w-full border border-neutral-200 rounded-lg px-3 text-xs focus:ring-1 focus:ring-brand-500 bg-white text-neutral-850 font-bold"
                >
                  <option value="GOPAY">GoPay Wallet</option>
                  <option value="OVO">OVO Cash</option>
                  <option value="DANA">DANA Wallet</option>
                  <option value="BANK-DKI">Bank DKI (JakOne)</option>
                  <option value="BCA">Bank Central Asia (BCA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-neutral-500 uppercase mb-1">Nomor Rekening / No HP</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0812XXXXXXXX"
                  value={rekening}
                  onChange={(e) => setRekening(e.target.value)}
                  className="h-10 w-full border border-neutral-200 rounded-lg px-3 text-xs focus:ring-1 focus:ring-brand-500 font-bold text-neutral-800"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xxs font-bold text-neutral-500 uppercase">Nominal Pencairan (IDR)</label>
                  <span className="text-[10px] text-brand-600 font-bold cursor-pointer" onClick={() => setNominal(String(saldoRupiah))}>Tarik Semua</span>
                </div>
                <input
                  type="number"
                  required
                  min={10000}
                  max={saldoRupiah}
                  placeholder="Minimal Rp 10.000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="h-10 w-full border border-neutral-200 rounded-lg px-3 text-xs focus:ring-1 focus:ring-brand-500 font-extrabold text-neutral-900"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">Batas penarikan Anda: {formatRupiah(saldoRupiah)}</span>
              </div>

              {/* Action buttons with 44px min height touch target */}
              <div className="flex gap-2.5 pt-2 pb-safe">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 h-10 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-10 bg-brand-500 text-white hover:bg-brand-610 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  Konfirmasi Cairkan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
