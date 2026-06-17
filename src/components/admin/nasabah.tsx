import { useState, useMemo } from 'react';
import { Users, Search, MapPin, Calendar, Clock, Activity, Flame, Wallet, Recycle, X, ChevronRight } from 'lucide-react';
import { Profile, Transaksi } from '../../types';
import { formatRupiah, formatAngka, formatTanggal, formatTanggalJam } from '../../lib/utils';

interface NasabahListProps {
  profiles: Profile[];
  transactions: Transaksi[];
  id?: string;
}

export function AdminNasabah({ profiles, transactions, id }: NasabahListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Filter only nasabah profiles
  const nasabahProfiles = useMemo(() => {
    return profiles.filter((p) => p.role === 'nasabah');
  }, [profiles]);

  // Client-side search filters
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return nasabahProfiles;
    const q = searchQuery.toLowerCase().trim();
    return nasabahProfiles.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.kelurahan && p.kelurahan.toLowerCase().includes(q))
    );
  }, [nasabahProfiles, searchQuery]);

  // 10 latest transactions for the selected user details modal
  const userTransactions = useMemo(() => {
    if (!selectedUser) return [];
    return transactions
      .filter((tx) => tx.nasabah_id === selectedUser.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [transactions, selectedUser]);

  // Total accumulative diagnostics for the selected user inside modal
  const userAggregates = useMemo(() => {
    if (!selectedUser) return { weight: 0, money: 0, count: 0 };
    const userAllTxs = transactions.filter((tx) => tx.nasabah_id === selectedUser.id);
    const weight = userAllTxs.reduce((sum, tx) => sum + Number(tx.total_berat), 0);
    const money = userAllTxs.reduce((sum, tx) => sum + Number(tx.total_nilai), 0);
    
    return {
      weight: Number(weight.toFixed(3)),
      money: money,
      count: userAllTxs.length,
    };
  }, [transactions, selectedUser]);

  return (
    <div id={id} className="space-y-6 font-sans">
      {/* Page Header (Search bar stays responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden md:block">
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Anggota Nasabah</h2>
          <p className="text-sm text-neutral-550 mt-1 font-medium">
            Kelola data warga, cek level keanggotaan, dan pantau kontribusi setor individu.
          </p>
        </div>

        {/* Search tool */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Cari nasabah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full border border-neutral-155 rounded-xl pl-9 pr-3 text-xs focus:ring-1 focus:ring-brand-500 bg-white"
          />
        </div>
      </div>

      {/* Main Table Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white border border-neutral-155 rounded-xl p-10 text-center flex flex-col items-center justify-center">
          <Users className="h-10 w-10 text-neutral-300 stroke-1 mb-2" />
          <p className="font-bold text-neutral-700 text-sm">Nasabah Tidak Ditemukan</p>
          <p className="text-xs text-neutral-500 mt-1 leading-normal font-medium">Masukkan nama, email, atau kelurahan Jakarta yang terdaftar.</p>
        </div>
      ) : (
        <div>
          {/* MOBILE LIST */}
          <div className="space-y-3 md:hidden">
            {filteredUsers.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedUser(p)}
                className="bg-white rounded-xl border border-neutral-155 p-4 flex items-center justify-between cursor-pointer active:bg-neutral-50/50 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                    {p.nama[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-800 text-xs">{p.nama}</h4>
                    <p className="text-3xs text-neutral-400 font-semibold mt-0.5">{p.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded-full uppercase border border-brand-100">
                        {p.level}
                      </span>
                      <span className="text-3xs text-neutral-400 font-semibold">• {p.kelurahan || 'Kelurahan -'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-right">
                    <p className="text-xs font-black text-neutral-800">{formatAngka(p.total_poin)}</p>
                    <p className="text-[9px] text-neutral-400 font-bold">Poin</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white border border-neutral-155 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Kelurahan</th>
                    <th className="py-3.5 px-4">Level</th>
                    <th className="py-3.5 px-4 text-center">Poin</th>
                    <th className="py-3.5 px-4 text-right">Bergabung Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedUser(p)}
                      className="hover:bg-neutral-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center font-bold text-xs">
                            {p.nama[0]}
                          </div>
                          <span className="font-bold text-neutral-800 text-xs">{p.nama}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 font-medium">{p.email}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-neutral-600 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{p.kelurahan || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xxs font-bold px-2.5 py-0.5 rounded-full uppercase border border-brand-100">
                          🌱 {p.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-neutral-800">{formatAngka(p.total_poin)}</td>
                      <td className="py-3.5 px-4 text-right text-neutral-400 text-xs font-semibold">
                        {formatTanggal(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 z-[60] animate-in fade-in duration-100">
          <div className="bg-white rounded-t-2xl md:rounded-2xl border-t md:border border-neutral-200 w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
            
            {/* Modal Header bar */}
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center font-bold text-sm">
                  {selectedUser.nama[0]}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm leading-tight">{selectedUser.nama}</h3>
                  <p className="text-3xs text-neutral-400 font-semibold mt-0.5 uppercase tracking-wide">ID: {selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-200/50 transition-colors cursor-pointer text-neutral-500 hover:text-neutral-800"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body section */}
            <div className="p-5 overflow-y-auto space-y-6 scrollbar-hide pb-safe">
              {/* Overall diagnostics stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-neutral-155 rounded-xl p-3">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Volume</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Recycle className="h-4 w-4 text-brand-500" />
                    <span className="font-black text-neutral-800 text-xs">{userAggregates.weight} kg</span>
                  </div>
                </div>

                <div className="border border-neutral-155 rounded-xl p-3">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Cair Rp</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Wallet className="h-4 w-4 text-brand-500" />
                    <span className="font-black text-neutral-800 text-xs">{formatRupiah(userAggregates.money)}</span>
                  </div>
                </div>

                <div className="border border-neutral-155 rounded-xl p-3">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Setoran</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Activity className="h-4 w-4 text-brand-500" />
                    <span className="font-black text-neutral-800 text-xs">{userAggregates.count}x</span>
                  </div>
                </div>

                <div className="border border-brand-100 rounded-xl p-3 bg-brand-50/40">
                  <span className="text-[10px] text-brand-700 uppercase tracking-widest block font-bold">Poin Saku</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Flame className="h-4 w-4 text-brand-600" />
                    <span className="font-black text-brand-700 text-xs">{formatAngka(selectedUser.total_poin)}</span>
                  </div>
                </div>
              </div>

              {/* User 10 Latest transactions list */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-800 text-xs border-b border-neutral-50 pb-2">10 Transaksi Terakhir</h4>
                
                {userTransactions.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-3 text-center">Belum ada riwayat transaksi tercatat.</p>
                ) : (
                  <div>
                    {/* PC View Table inside modal */}
                    <div className="hidden md:block overflow-x-auto max-h-60 rounded-xl border border-neutral-155">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Tanggal Waktu</th>
                            <th className="py-2.5 px-3">Berat Total</th>
                            <th className="py-2.5 px-3">Konversi Rupiah</th>
                            <th className="py-2.5 px-3 text-right">Poin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {userTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-neutral-50">
                              <td className="py-2.5 px-3">
                                <span className="flex items-center gap-1 text-neutral-550 font-semibold">
                                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                  {formatTanggalJam(tx.created_at)}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-neutral-700">{tx.total_berat} kg</td>
                              <td className="py-2.5 px-3 text-neutral-800 font-bold">{formatRupiah(tx.total_nilai)}</td>
                              <td className="py-2.5 px-3 text-right font-black text-brand-600">+{tx.poin_diperoleh}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View Card list inside modal */}
                    <div className="space-y-3 md:hidden max-h-64 overflow-y-auto pr-1 pad-safe scrollbar-hide">
                      {userTransactions.map((tx) => (
                        <div key={tx.id} className="border border-neutral-155 rounded-xl p-3 bg-neutral-0/30 flex items-center justify-between">
                          <div>
                            <p className="text-3xs text-neutral-400 font-bold uppercase tracking-wide">{formatTanggal(tx.created_at)}</p>
                            <p className="text-xs text-neutral-700 font-bold mt-1">{tx.total_berat} kg ({formatRupiah(tx.total_nilai)})</p>
                          </div>
                          <span className="text-xs font-black text-brand-600">+{tx.poin_diperoleh} P</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer close with iphone safe area & 44px min touch height target */}
            <div className="p-4 border-t border-neutral-50 bg-neutral-50 flex items-center pb-safe">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full h-11 border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Tutup Detail Jurnal
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
