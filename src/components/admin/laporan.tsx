import { useState, useMemo, useEffect } from 'react';
import { 
  FileText, Calendar, Search, Download, Recycle, Wallet, Layers, Users, MapPin, Printer 
} from 'lucide-react';
import { Transaksi, TransaksiDetail, SampahKategori, Profile } from '../../types';
import { formatRupiah, formatAngka, formatTanggal } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LaporanProps {
  transactions: Transaksi[];
  details: TransaksiDetail[];
  categories: SampahKategori[];
  profiles: Profile[];
  id?: string;
}

export function AdminLaporan({ transactions, details, categories, profiles, id }: LaporanProps) {
  const [mounted, setMounted] = useState(false);

  // Default range: last 30 days
  const [startDateStr, setStartDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered transactions in the date range
  const filteredTransactions = useMemo(() => {
    const start = new Date(startDateStr).getTime() - 1; // inclusive
    const end = new Date(endDateStr).getTime() + 24 * 60 * 60 * 1000 + 1; // inclusive of end day
    
    return transactions.filter((tx) => {
      const txTime = new Date(tx.created_at).getTime();
      return txTime >= start && txTime <= end;
    });
  }, [transactions, startDateStr, endDateStr]);

  // Aggregate stats in current selection
  const stats = useMemo(() => {
    let totalKg = 0;
    let totalNilai = 0;
    const uniqueNasabah = new Set<string>();

    filteredTransactions.forEach((tx) => {
      totalKg += Number(tx.total_berat);
      totalNilai += Number(tx.total_nilai);
      uniqueNasabah.add(tx.nasabah_id);
    });

    return {
      txCount: filteredTransactions.length,
      kgSum: Number(totalKg.toFixed(3)),
      nilaiSum: totalNilai,
      nasabahCount: uniqueNasabah.size,
    };
  }, [filteredTransactions]);

  // Aggregated Category Recap report
  const categoryRecaps = useMemo(() => {
    const map: Record<string, { name: string; totalKg: number; totalNilai: number }> = {};
    
    // Init categories
    categories.forEach((cat) => {
      map[cat.id] = { name: cat.nama, totalKg: 0, totalNilai: 0 };
    });

    const txIdsInSelection = new Set(filteredTransactions.map((tx) => tx.id));

    // Sum detailed records
    details.forEach((det) => {
      if (txIdsInSelection.has(det.transaksi_id) && map[det.kategori_id]) {
        map[det.kategori_id].totalKg += Number(det.berat_kg);
        map[det.kategori_id].totalNilai += Number(det.subtotal);
      }
    });

    return Object.values(map).map((val) => ({
      ...val,
      totalKg: Number(val.totalKg.toFixed(1)),
    }));
  }, [categories, filteredTransactions, details]);

  // Daily Chart Data for Recharts
  const dailyChartData = useMemo(() => {
    const map: Record<string, number> = {};

    // Populate all date strings between start and end
    const startObj = new Date(startDateStr);
    const endObj = new Date(endDateStr);
    const daysDiff = Math.min(
      90, // cap visual bar graph days count to avoid chart clutter
      Math.round((endObj.getTime() - startObj.getTime()) / (24 * 60 * 60 * 1000)) + 1
    );

    for (let i = 0; i < daysDiff; i++) {
      const d = new Date(startDateStr);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      map[dateKey] = 0;
    }

    // Accumulate transaction weight
    filteredTransactions.forEach((tx) => {
      const dateKey = new Date(tx.created_at).toISOString().split('T')[0];
      if (map[dateKey] !== undefined) {
        map[dateKey] += Number(tx.total_berat);
      }
    });

    return Object.keys(map).sort().map((dateStr) => {
      const d = new Date(dateStr);
      const label = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
      return {
        tanggal: label,
        berat: Number(map[dateStr].toFixed(1)),
      };
    });
  }, [filteredTransactions, startDateStr, endDateStr]);

  // Ekspor PDF Function with jsPDF & jspdf-autotable
  const exportPDFReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Outer framing styling & title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(26, 99, 57); // Deep Brand Green
    doc.text('REKAPITULASI JURNAL BANK SAMPAH JAKARTA (SMASH)', 14, 20);

    // Metadata reporting range
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Periode Laporan: ${formatTanggal(startDateStr)} s.d. ${formatTanggal(endDateStr)}`, 14, 26);
    doc.text(`Dicetak Pada: ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}`, 14, 31);

    doc.line(14, 34, 196, 34); // Divider line

    // Write executive stats blocks
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('1. IKHTISAR KINERJA PERIODE', 14, 42);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`- Total Transaksi Disetor: ${stats.txCount} Kali Penimbangan`, 18, 49);
    doc.text(`- Akumulasi Volume Sampah: ${formatAngka(stats.kgSum)} kg`, 18, 55);
    doc.text(`- Putaran Nilai Rekapitulasi: ${formatRupiah(stats.nilaiSum)}`, 18, 61);
    doc.text(`- Anggota Warga Aktif: ${stats.nasabahCount} Nasabah Unik`, 18, 67);

    // Write category details block using autoTable
    doc.setFont('Helvetica', 'bold');
    doc.text('2. DETAIL REKAP GOLONGAN SAMPAH', 14, 76);

    const tableHeaders = [['No', 'Golongan Kategori Sampah', 'Volume Timbangan (kg)', 'Total Nilai (IDR)', 'Satuan']];
    const tableRows = categoryRecaps.map((item, idx) => [
      String(idx + 1),
      item.name,
      `${formatAngka(item.totalKg)} kg`,
      formatRupiah(item.totalNilai),
      'kg',
    ]);

    // Render autotable
    autoTable(doc, {
      startY: 81,
      head: tableHeaders,
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [42, 157, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, font: 'Helvetica' },
      margin: { left: 14, right: 14 },
    });

    // Signature footer
    const finalY = (doc as any).lastAutoTable.finalY || 140;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Mengetahui dan Memvalidasi,', 140, finalY + 20);
    doc.setFont('Helvetica', 'bold');
    doc.text('Keagenan Bank Sampah Jakarta', 140, finalY + 38);

    // Save
    doc.save(`Laporan_SMASH_${startDateStr}_ke_${endDateStr}.pdf`);
  };

  return (
    <div id={id} className="space-y-6 font-sans">
      {/* Page Header (Search bar stays responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden md:block">
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Laporan Audit Penimbangan</h2>
          <p className="text-sm text-neutral-550 mt-1 font-medium">
            Analisis sirkulasi volume sampah perkotaan DKI dan ekspor PDF resmi rekap bulanan.
          </p>
        </div>

        {/* Date Selector form */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-neutral-155 px-2.5 py-1.5 rounded-xl">
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Dari</span>
              <input
                type="date"
                id="start-date-picker"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="text-xs bg-transparent text-neutral-700 font-bold focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 bg-white border border-neutral-155 px-2.5 py-1.5 rounded-xl">
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Ke</span>
              <input
                type="date"
                id="end-date-picker"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="text-xs bg-transparent text-neutral-700 font-bold focus:outline-none w-full"
              />
            </div>
          </div>

          <button
            onClick={exportPDFReport}
            id="btn-export-pdf"
            className="h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors w-full sm:w-auto"
            style={{ minHeight: '44px' }}
          >
            <Printer className="h-4 w-4" /> Cetak PDF (jspdf)
          </button>
        </div>
      </div>

      {/* 4 Performance diagnostic mini-cards — optimized spacing/fluidity for mobile 2 cols */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wide">Frekuensi</span>
          <h4 className="text-lg sm:text-2xl font-black text-neutral-800 mt-1 tabular-nums">{stats.txCount} Transaksi</h4>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">Selesai terdata</span>
        </div>

        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wide">Volume</span>
          <h4 className="text-lg sm:text-2xl font-black text-neutral-800 mt-1 tabular-nums">{formatAngka(stats.kgSum)} kg</h4>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">Diselamatkan</span>
        </div>

        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wide">Pencairan</span>
          <h4 className="text-lg sm:text-2xl font-black text-brand-650 mt-1 tabular-nums truncate">{formatRupiah(stats.nilaiSum)}</h4>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">Sirkulasi nilai sampah</span>
        </div>

        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wide">Warga Aktif</span>
          <h4 className="text-lg sm:text-2xl font-black text-neutral-800 mt-1 tabular-nums">{stats.nasabahCount} Nasabah</h4>
          <span className="text-[10px] text-neutral-400 font-medium mt-1">Berperan serta aktif</span>
        </div>
      </div>

      {/* Grid: Graph weight vs tabular aggregates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left block - Daily weight fluctuation */}
        <div className="bg-white border border-neutral-155 rounded-2xl p-5 lg:col-span-7">
          <h3 className="font-bold text-neutral-900 text-sm">Tren Volume Timbangan Harian (kg)</h3>
          <p className="text-2xs text-neutral-400 uppercase tracking-widest font-semibold mt-0.5 mb-5">Fluktuasi akumulasi kilogram sampah yang disetor</p>
          
          <div className="h-60 flex items-center justify-center">
            {mounted ? (
              dailyChartData.length === 0 ? (
                <p className="text-2xs text-neutral-400 font-semibold">Belum ada transaksi di rentang tanggal tersebut.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e8e5" />
                    <XAxis dataKey="tanggal" tick={{ fontSize: 9, fill: '#737370', fontWeight: '600' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#737370', fontWeight: '600' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9f9f8' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="berat" fill="#2a9d5c" name="Berat (kg)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <p className="text-2xs text-neutral-400 font-semibold">Memuat analisis tren...</p>
            )}
          </div>
        </div>

        {/* Right block - Categories breakdown summary */}
        <div className="bg-white border border-neutral-155 rounded-2xl p-5 lg:col-span-5">
          <h3 className="font-bold text-neutral-900 text-sm">Rekapitulasi Sektoral Kategori</h3>
          <p className="text-2xs text-neutral-400 uppercase tracking-widest font-semibold mt-0.5 mb-5">Arus volume dan nilai per kelompok kategori material</p>

          <div className="overflow-hidden border border-neutral-155 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-bold text-4xs uppercase tracking-wider border-b border-neutral-100">
                    <th className="py-2.5 px-3">Golongan Kategori</th>
                    <th className="py-2.5 px-3">Volume</th>
                    <th className="py-2.5 px-3 text-right">Nilai Total IDR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {categoryRecaps.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-neutral-800">{item.name}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-600">{item.totalKg} kg</td>
                      <td className="py-3 px-3 text-right font-black text-neutral-800">{formatRupiah(item.totalNilai)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
