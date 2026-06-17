import { useState, useEffect, useMemo } from 'react';
import { Layers, Recycle, Users, Wallet, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { Transaksi, Profile } from '../../types';
import { formatRupiah, formatAngka, formatTanggalJam } from '../../lib/utils';
import { StatCard } from '../ui/stat-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  transactions: Transaksi[];
  profiles: Profile[];
  setTab: (tab: string) => void;
  id?: string;
}

export function AdminDashboard({ transactions, profiles, setTab, id }: AdminDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Filter transactions today
    const todayTransactions = transactions.filter((tx) => {
      const txDateStr = new Date(tx.created_at).toISOString().split('T')[0];
      return txDateStr === todayStr;
    });

    const txTodayCount = todayTransactions.length;
    const kgTodayCount = todayTransactions.reduce((sum, tx) => sum + Number(tx.total_berat), 0);
    const valueTodayCount = todayTransactions.reduce((sum, tx) => sum + Number(tx.total_nilai), 0);

    // Active users count in the current month (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const activeUserIdsRef = new Set();
    transactions.forEach((tx) => {
      const txTime = new Date(tx.created_at).getTime();
      if (txTime >= thirtyDaysAgo) {
        activeUserIdsRef.add(tx.nasabah_id);
      }
    });

    return {
      txToday: txTodayCount,
      kgToday: kgTodayCount,
      valueToday: valueTodayCount,
      activeUsersMonth: activeUserIdsRef.size,
    };
  }, [transactions]);

  // Chart data: transaction weight (kg) per day for the last 7 days including today
  const chartData = useMemo(() => {
    const dataList = [];
    const map: Record<string, number> = {};

    // Get last 7 days range
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const keyStr = d.toISOString().split('T')[0];
      map[keyStr] = 0;
    }

    // Accumulate
    transactions.forEach((tx) => {
      const keyStr = new Date(tx.created_at).toISOString().split('T')[0];
      if (map[keyStr] !== undefined) {
        map[keyStr] += Number(tx.total_berat);
      }
    });

    // Format for Recharts
    const keys = Object.keys(map).sort();
    return keys.map((key) => {
      const date = new Date(key);
      const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(date);
      return {
        hari: label,
        berat: Number(map[key].toFixed(1)),
      };
    });
  }, [transactions]);

  // Get 10 recent transactions joined with user name
  const recentTransactions = useMemo(() => {
    const list = transactions.map((tx) => {
      const user = profiles.find((p) => p.id === tx.nasabah_id);
      return {
        ...tx,
        nasabah_nama: user ? user.nama : 'Unknown Nasabah',
        nasabah_email: user ? user.email : 'No Email',
      };
    });

    return list
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [transactions, profiles]);

  return (
    <div id={id} className="space-y-6 font-sans">
      {/* Page Header (Desktop only) */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight leading-none">Dashboard Admin</h2>
        <p className="text-sm text-neutral-550 mt-1 font-medium">
          Ikhtisar performa operasional penimbangan dan pencatatan sampah unit hari ini.
        </p>
      </div>

      {/* 4 Stat Cards — optimized spacing/fluidity for mobile 2 cols */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wide">Transaksi Hari Ini</span>
          <h4 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight mt-1 truncate">
            {stats.txToday} Setoran
          </h4>
          <span className="text-[10px] text-brand-600 font-bold mt-1.5">&#10003; Sukses</span>
        </div>
        
        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wide">Timbangan Volume</span>
          <h4 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight mt-1 truncate">
            {formatAngka(stats.kgToday)} kg
          </h4>
          <span className="text-[10px] text-neutral-450 font-medium mt-1.5">Sampah masuk</span>
        </div>

        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wide">Nasabah Aktif</span>
          <h4 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight mt-1 truncate">
            {stats.activeUsersMonth} Warga
          </h4>
          <span className="text-[10px] text-neutral-450 font-medium mt-1.5">Mendukung pilah</span>
        </div>

        <div className="bg-white border border-neutral-155 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wide">Nilai Rupiah</span>
          <h4 className="text-lg sm:text-2xl font-black text-brand-650 tracking-tight mt-1 truncate">
            {formatRupiah(stats.valueToday)}
          </h4>
          <span className="text-[10px] text-neutral-450 font-medium mt-1.5">Disalurkan hari ini</span>
        </div>
      </div>

      {/* Grid: Graph Volume and Latest Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 Days volumes chart */}
        <div className="bg-white border border-neutral-155 rounded-2xl p-5 lg:col-span-7">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Volume Sampah Masuk (7 Hari Terakhir)</h3>
              <p className="text-2xs text-neutral-400 font-semibold mt-0.5 uppercase tracking-wide">Total tonase sampah dalam kilogram</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-brand-600 font-bold bg-brand-50 rounded-full px-2.5 py-0.5 border border-brand-100/50">
              <TrendingUp className="h-3 w-3" /> Tren Timbangan
            </span>
          </div>

          <div className="h-60 flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e8e5" />
                  <XAxis dataKey="hari" tick={{ fontSize: 10, fill: '#737370', fontWeight: '600' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#737370', fontWeight: '600' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9f9f8' }} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="berat" name="Berat (kg)" fill="#2a9d5c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-2xs text-neutral-400 font-bold">Memuat grafik...</p>
            )}
          </div>
        </div>

        {/* Right Column: Fast Links & Setup Info */}
        <div className="lg:col-span-5 bg-white border border-neutral-155 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Aksi Cepat Petugas</h3>
            <p className="text-2xs text-neutral-400 font-semibold uppercase tracking-wide mt-0.5 mb-4">Menu operasional harian utama</p>
            
            <div className="space-y-3">
              <button
                onClick={() => setTab('scan')}
                className="w-full flex items-center justify-between p-3.5 border border-neutral-155 hover:border-brand-500 rounded-xl bg-white hover:bg-brand-50/10 cursor-pointer group transition-colors text-left"
              >
                <div>
                  <span className="font-bold text-xs text-neutral-850 block">Pencatatan Transaksi Baru</span>
                  <span className="text-xxs text-neutral-500 mt-0.5 font-medium leading-none block">Scan QR nasabah dan timbang sampah</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
              </button>

              <button
                onClick={() => setTab('harga')}
                className="w-full flex items-center justify-between p-3.5 border border-neutral-155 hover:border-brand-500 rounded-xl bg-white hover:bg-brand-50/10 cursor-pointer group transition-colors text-left"
              >
                <div>
                  <span className="font-bold text-xs text-neutral-850 block">Perbarui Harga Sampah</span>
                  <span className="text-xxs text-neutral-500 mt-0.5 font-medium leading-none block">Ubah tarif per kilogram mengikuti pasar dinas</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100 bg-neutral-50/70 border border-neutral-100/50 rounded-xl p-3 text-2xs text-neutral-500 leading-relaxed font-semibold">
            <strong>💡 Petunjuk Demo:</strong> Jika ingin mencoba penimbangan sampah, silakan rekam ID Nasabah (e.g. <code>nasabah-uuid-1</code> atau salin ID dari dashboard Profil Nasabah) lalu masukkan ID tersebut di menu <strong>Scan &amp; Input</strong> untuk mulai menyimulasikan transaksi secara utuh.
          </div>
        </div>
      </div>

      {/* 10 Recent Transactions Modern Mobile List & Desktop Table */}
      <div className="bg-white border border-neutral-155 rounded-2xl p-5">
        <h3 className="font-bold text-neutral-900 text-sm mb-4">10 Transaksi Terakhir Unit Jakarta</h3>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-500 font-medium">
            Belum ada transaksi di unit ini hari ini.
          </div>
        ) : (
          <div>
            {/* MOBILE LIST */}
            <div className="divide-y divide-neutral-100 md:hidden">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Recycle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{tx.nasabah_nama}</p>
                      <p className="text-3xs text-neutral-400 font-semibold">{formatTanggalJam(tx.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand-600">+{tx.poin_diperoleh} Poin</p>
                    <p className="text-3xs text-neutral-400 font-bold">{tx.total_berat} kg • {formatRupiah(tx.total_nilai)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider border-b border-neutral-100">
                    <th className="py-3 px-4">Nasabah</th>
                    <th className="py-3 px-4">Waktu Transaksi</th>
                    <th className="py-3 px-4">Total Berat</th>
                    <th className="py-3 px-4">Nilai Rupiah</th>
                    <th className="py-3 px-4 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-extrabold text-neutral-800 block text-xs">{tx.nasabah_nama}</span>
                          <span className="text-3xs text-neutral-400 block font-semibold mt-0.5">{tx.nasabah_email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{formatTanggalJam(tx.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-neutral-700">{tx.total_berat} kg</td>
                      <td className="py-3 px-4 text-neutral-800 font-bold">{formatRupiah(tx.total_nilai)}</td>
                      <td className="py-3 px-4 text-right text-brand-600 font-black">+{tx.poin_diperoleh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
