import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  QrCode, User, MapPin, Award, Flame, Plus, Trash2, Save, ArrowLeft, CheckCircle, Search, Calendar, ChevronRight 
} from 'lucide-react';
import { Profile, SampahKategori, Transaksi, TransaksiDetail } from '../../types';
import { getLevel, hitungPoin, formatRupiah, formatAngka } from '../../lib/utils';

interface ScanProps {
  profiles: Profile[];
  categories: SampahKategori[];
  adminProfile: Profile;
  onSaveTransaction: (
    nasabahId: string,
    totalBerat: number,
    totalNilai: number,
    poinDiperoleh: number,
    catatan: string,
    items: { kategoriId: string; berat_kg: number; hargaPerKg: number; subtotal: number }[]
  ) => { success: boolean; error?: string; txId?: string };
  id?: string;
}

interface ItemRow {
  kategoriId: string;
  berat: string; // use string to avoid input jumping
}

export function AdminScan({ profiles, categories, adminProfile, onSaveTransaction, id }: ScanProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedNasabah, setSelectedNasabah] = useState<Profile | null>(null);

  // Manual search fallback in Step 1
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Transaction items state (Step 2)
  const [items, setItems] = useState<ItemRow[]>([{ kategoriId: categories[0]?.id || '', berat: '' }]);
  const [catatan, setCatatan] = useState('');

  // Step 3 Result State
  const [savedTxId, setSavedTxId] = useState<string>('');
  const [savedSummary, setSavedSummary] = useState<{
    poin: number;
    rupiah: number;
    berat: number;
    kategoriCount: number;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Step 1 Scanner mounting
  useEffect(() => {
    if (cameraActive && step === 1) {
      // Small timeout to guarantee element #qr-reader exists
      const timer = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            'qr-reader',
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              aspectRatio: 1.0,
            },
            /* verbose= */ false
          );

          scannerRef.current = scanner;

          scanner.render(
            (decodedText) => {
              // Decoded text is expected to be uuid of customer profile
              const user = profiles.find((p) => p.id === decodedText.trim() && p.role === 'nasabah');
              if (user) {
                setSelectedNasabah(user);
                setCameraActive(false);
                scanner.clear();
                setStep(2);
              } else {
                alert('QR Code terdeteksi, namun ID Nasabah tidak valid dalam sistem.');
              }
            },
            (err) => {
              // normal scan failures can be silenced
            }
          );
        } catch (e) {
          console.error('Camera init error', e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {}
        }
      };
    }
  }, [cameraActive, step, profiles]);

  // Handle manual nasabah select bypass
  const handleSelectBypass = (p: Profile) => {
    setSelectedNasabah(p);
    setCameraActive(false);
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (e) {}
    }
    setStep(2);
  };

  // Filter profiles for select bypass list
  const filteredBypassProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const nasabahs = profiles.filter((p) => p.role === 'nasabah');
    if (!q) return nasabahs.slice(0, 4); // show first 4 default for quick pick
    return nasabahs.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.kelurahan && p.kelurahan.toLowerCase().includes(q))
    );
  }, [profiles, searchQuery]);

  // Form row manipulations (Step 2)
  const addRow = () => {
    setItems((prev) => [...prev, { kategoriId: categories[0]?.id || '', berat: '' }]);
  };

  const deleteRow = (idx: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRowKategori = (idx: number, catId: string) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, kategoriId: catId } : row))
    );
  };

  const updateRowBerat = (idx: number, val: string) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, berat: val } : row))
    );
  };

  // Compute live aggregates of current items list
  const computedAggregates = useMemo(() => {
    let totalBerat = 0;
    let totalNilai = 0;

    const rowDetails = items.map((row) => {
      const cat = categories.find((c) => c.id === row.kategoriId);
      const beratNum = Number(row.berat) || 0;
      const harga = cat ? cat.harga_per_kg : 0;
      const subtotal = beratNum * harga;

      totalBerat += beratNum;
      totalNilai += subtotal;

      return {
        kategoriId: row.kategoriId,
        berat_kg: beratNum,
        hargaPerKg: harga,
        subtotal: subtotal,
      };
    });

    const poin = hitungPoin(totalBerat);

    return {
      totalBerat: Number(totalBerat.toFixed(3)),
      totalNilai: totalNilai,
      poin: poin,
      rowDetails: rowDetails,
    };
  }, [items, categories]);

  // Form submission handler to dispatch transaction payload
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabah) return;

    // Validate rows
    const validRows = computedAggregates.rowDetails.filter((row) => row.berat_kg > 0);
    if (validRows.length === 0) {
      alert('Silakan masukkan berat timbangan (kg) yang valid minimal untuk satu baris sampah');
      return;
    }

    const { success, error, txId } = onSaveTransaction(
      selectedNasabah.id,
      computedAggregates.totalBerat,
      computedAggregates.totalNilai,
      computedAggregates.poin,
      catatan,
      validRows
    );

    if (success && txId) {
      setSavedTxId(txId);
      setSavedSummary({
        poin: computedAggregates.poin,
        rupiah: computedAggregates.totalNilai,
        berat: computedAggregates.totalBerat,
        kategoriCount: validRows.length,
      });
      setStep(3);
    } else {
      alert(`Gagal menyimpan transaksi: ${error || 'Terjadi kesalahan sistem'}`);
    }
  };

  const resetAllAndBack = () => {
    setSelectedNasabah(null);
    setItems([{ kategoriId: categories[0]?.id || '', berat: '' }]);
    setCatatan('');
    setSavedTxId('');
    setSavedSummary(null);
    setSearchQuery('');
    setStep(1);
    setCameraActive(false);
  };

  return (
    <div id={id} className="space-y-6 font-sans">
      {/* Dynamic Header */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight">Pencatatan Penyetoran</h2>
        <p className="text-sm text-neutral-500 mt-1 font-normal">
          Loket digital penerimaan sampah nasabah. Scan QR Card nasabah, timbang, dan catat poin langsung.
        </p>
      </div>

      {/* STEP 1: SCAN OR SELECT USER CARD */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Block - Camera module */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 lg:col-span-6 flex flex-col items-center">
            <h3 className="font-semibold text-neutral-800 text-center mb-1">Pasang Scanner Kamera</h3>
            <p className="text-xs text-neutral-500 text-center mb-6 max-w-sm">
              Gunakan kamera ponsel/laptop untuk memindai kartu digital nasabah yang disodorkan.
            </p>

            {cameraActive ? (
              <div className="w-full max-w-sm">
                <div id="qr-reader" className="w-full rounded-md border border-neutral-200 overflow-hidden" />
                <button
                  onClick={() => setCameraActive(false)}
                  className="mt-4 w-full h-9 border border-neutral-200 text-neutral-600 hover:text-neutral-800 rounded font-semibold text-xs"
                >
                  Matikan Kamera
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10">
                <div className="p-4 bg-brand-50 text-brand-500 rounded-full mb-4">
                  <QrCode className="h-10 w-10 stroke-1" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCameraActive(true);
                  }}
                  className="h-10 px-6 bg-brand-500 hover:bg-brand-600 font-semibold text-white text-sm rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  Aktifkan Scanner QR
                </button>
              </div>
            )}
          </div>

          {/* Right Block - Database user finder (Bypass for testing convenience!) */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 lg:col-span-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-1">Sari Buku Tamu Nasabah (Bypass Manual)</h3>
              <p className="text-xs text-neutral-500 mb-5 leading-normal">
                Bypass scanner dengan mencari nama atau email nasabah di bawah jika perangkat Anda tidak mendukung izin kamera.
              </p>

              {/* Bypass search field */}
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama, email, atau kelurahan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Bypass listings list */}
              <div className="space-y-2.5">
                {filteredBypassProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectBypass(p)}
                    className="flex justify-between items-center p-3 border border-neutral-100/80 hover:border-brand-500 rounded-lg cursor-pointer hover:bg-neutral-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div className="w-8 h-8 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {p.nama[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-neutral-800 text-xs block group-hover:text-brand-600 transition-colors truncate">
                          {p.nama}
                        </span>
                        <span className="text-4xs text-neutral-400 block truncate">{p.email} • {p.kelurahan || 'Kelurahan -'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-3xs font-semibold text-neutral-400 group-hover:text-brand-600 transition-all flex-shrink-0">
                      <span>Pilih Nasabah</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3.5 border-t border-neutral-100 text-3xs text-neutral-400 uppercase tracking-wider font-mono">
              Total Nasabah Registrasi: {profiles.filter((p) => p.role === 'nasabah').length} Warga
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MULTI-ITEM WEIGHT TRANSACTION FORM */}
      {step === 2 && selectedNasabah && (
        <form onSubmit={handleSaveSubmit} className="space-y-6">
          {/* Target Profile Metadata Recap */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedNasabah.nama[0]}
              </div>
              <div>
                <span className="text-3xs text-neutral-400 font-semibold uppercase tracking-wide">Nasabah Penyetor</span>
                <h4 className="font-semibold text-neutral-800 leading-tight block">{selectedNasabah.nama}</h4>
                <div className="flex items-center gap-3 text-3xs text-neutral-500 mt-1">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" /> Kelurahan: {selectedNasabah.kelurahan || '-'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-brand-600 font-semibold">
                    🌱 {selectedNasabah.level} ({formatAngka(selectedNasabah.total_poin)} Poin)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAllAndBack}
              className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Ganti Nasabah
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Block - Items list inputs */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-800 text-sm">Rincian Timbangan Sampah</h3>
                <button
                  type="button"
                  onClick={addRow}
                  className="px-3 h-8 bg-brand-50 hover:bg-brand-100 text-brand-700 hover:text-brand-800 transition-colors text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Kategori
                </button>
              </div>

              {/* Dynamic row list */}
              <div className="space-y-3 pt-2">
                {items.map((row, idx) => {
                  const currentCategory = categories.find((c) => c.id === row.kategoriId);
                  const beratNum = Number(row.berat) || 0;
                  const price = currentCategory ? currentCategory.harga_per_kg : 0;
                  const subtotal = beratNum * price;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-3 sm:pb-0 border-b border-neutral-50 sm:border-b-0"
                    >
                      {/* Dropdown category selection */}
                      <div className="w-full sm:w-1/2">
                        <select
                          value={row.kategoriId}
                          onChange={(e) => updateRowKategori(idx, e.target.value)}
                          className="h-9 w-full border border-neutral-200 rounded-md px-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nama} ({formatRupiah(cat.harga_per_kg)}/{cat.satuan})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Weight KG number input */}
                      <div className="w-full sm:w-1/4 flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="Berat (kg)"
                          value={row.berat}
                          onChange={(e) => updateRowBerat(idx, e.target.value)}
                          className="h-9 w-full border border-neutral-200 rounded-md px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                        />
                        <span className="text-xs text-neutral-400 font-medium">kg</span>
                      </div>

                      {/* Subtotal evaluation display */}
                      <div className="w-full sm:w-1/4 flex items-center justify-between pl-2">
                        <span className="text-xs font-bold text-neutral-800">
                          {formatRupiah(subtotal)}
                        </span>
                        
                        {/* Delete button (only if list count > 1) */}
                        <button
                          type="button"
                          disabled={items.length === 1}
                          onClick={() => deleteRow(idx)}
                          className={`p-1.5 rounded transition-colors ${
                            items.length === 1
                              ? 'text-neutral-300 cursor-not-allowed'
                              : 'text-neutral-400 hover:text-red-500 hover:bg-neutral-50'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optionally Catatan text area */}
              <div className="pt-4 border-t border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Kondisi material atau keterangan tambahan lainnya..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full border border-neutral-200 rounded-md p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>
            </div>

            {/* Right Block - Totals Summary bill */}
            <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-neutral-800 text-sm pb-2 border-b border-neutral-50">Ringkasan Konversi</h3>
                
                <div className="space-y-4 py-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Berat Timbangan</span>
                    <span className="font-semibold text-neutral-800">{computedAggregates.totalBerat} kg</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500">Rasio Harga Perolehan</span>
                    <span className="font-semibold text-brand-600 font-mono">Dinamis</span>
                  </div>

                  <hr className="border-neutral-100" />

                  <div className="space-y-1">
                    <span className="text-xxs uppercase font-semibold text-neutral-400 tracking-wider">Total Nilai Pembayaran</span>
                    <p className="text-2xl font-extrabold text-brand-600 tabular-nums">
                      {formatRupiah(computedAggregates.totalNilai)}
                    </p>
                  </div>

                  <div className="bg-brand-50 border border-brand-100/50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-brand-800 block">Poin yang Akan Diberikan</span>
                      <span className="text-xxs text-neutral-500 mt-0.5">Dihitung otomatis: 10 poin/kg</span>
                    </div>
                    <span className="text-xl font-extrabold text-brand-600">
                      +{formatAngka(computedAggregates.poin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission click */}
              <div className="pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="h-4 w-4" /> Simpan Penimbangan
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: TRANSACTION CREATED SUCCESS RECEIPT DISPLAY */}
      {step === 3 && savedSummary && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 max-w-xl mx-auto space-y-6 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <span className="text-3xs text-brand-600 border border-brand-200 bg-brand-50 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Transaksi Tersimpan
            </span>
            <h3 className="text-lg font-bold text-neutral-800">Cetak Memo Setoran Berhasil</h3>
            <p className="text-xs text-neutral-400">ID Referensi: {savedTxId}</p>
          </div>

          <hr className="w-full border-neutral-100" />

          {/* Quick numbers recaps */}
          <div className="grid grid-cols-3 gap-4 w-full pt-2">
            <div className="bg-neutral-50 rounded-md p-3">
              <span className="text-xxs text-neutral-400 uppercase tracking-wider font-semibold block">Total Ditimbang</span>
              <span className="font-extrabold text-neutral-800 mt-1 block text-sm">{savedSummary.berat} kg</span>
            </div>

            <div className="bg-neutral-50 rounded-md p-3">
              <span className="text-xxs text-neutral-400 uppercase tracking-wider font-semibold block">Konversi Uang</span>
              <span className="font-extrabold text-brand-600 mt-1 block text-sm">{formatRupiah(savedSummary.rupiah)}</span>
            </div>

            <div className="bg-neutral-50 rounded-md p-3">
              <span className="text-xxs text-neutral-400 uppercase tracking-wider font-semibold block">Poin Masuk</span>
              <span className="font-extrabold text-brand-600 mt-1 block text-sm">+{savedSummary.poin}</span>
            </div>
          </div>

          <div className="w-full bg-brand-50/10 border border-brand-100/10 text-neutral-600 text-xs rounded-lg p-4 font-normal leading-relaxed text-left">
            🚩 <strong>Notifikasi Poin Nasabah:</strong> Poin nasabah serta level keanggotaan mereka telah disesuaikan secara real-time. Nasabah dapat mengakses detail riwayat ini langsung dari ponsel masing-masing.
          </div>

          {/* Action to go back to Step 1 */}
          <button
            type="button"
            onClick={resetAllAndBack}
            className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Mulai Timbangan Baru <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
