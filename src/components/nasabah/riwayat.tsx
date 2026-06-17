import { useState, useMemo } from 'react';
import { Calendar, Layers, ChevronDown, ChevronUp, Recycle, Info } from 'lucide-react';
import { Transaksi, TransaksiDetail, SampahKategori } from '../../types';
import { formatRupiah, formatAngka, formatTanggal } from '../../lib/utils';

interface RiwayatProps {
  transactions: Transaksi[];
  details: TransaksiDetail[];
  categories: SampahKategori[];
  id?: string;
}

export function NasabahRiwayat({ transactions, details, categories, id }: RiwayatProps) {
  const [selectedBulan, setSelectedBulan] = useState<string>('semua');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Get list of available months in transactions for filter
  const uniqueMonths = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const seen = new Set<string>();

    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sorted.forEach((tx) => {
      try {
        const date = new Date(tx.created_at);
        const y = date.getFullYear();
        const m = date.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        
        if (!seen.has(key)) {
          seen.add(key);
          const name = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
          list.push({ key, label: name });
        }
      } catch (e) {
        // Safe check
      }
    });

    return list;
  }, [transactions]);

  // Months lists combined for horizontal scrolling chips
  const filterChips = useMemo(() => {
    return [
      { value: 'semua', label: 'Semua' },
      ...uniqueMonths.map((m) => ({ value: m.key, label: m.label })),
    ];
  }, [uniqueMonths]);

  // Aggregate detail items grouped by transaction_id
  const detailsByTxId = useMemo(() => {
    const map: Record<string, (TransaksiDetail & { category?: SampahKategori })[]> = {};
    details.forEach((det) => {
      if (!map[det.transaksi_id]) {
        map[det.transaksi_id] = [];
      }
      const cat = categories.find((c) => c.id === det.kategori_id);
      map[det.transaksi_id].push({
        ...det,
        category: cat,
      });
    });
    return map;
  }, [details, categories]);

  // Expansion toggle
  const toggleExpanded = (txId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [txId]: !prev[txId],
    }));
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (selectedBulan === 'semua') {
      return [...transactions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return transactions
      .filter((tx) => {
        const d = new Date(tx.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedBulan;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [transactions, selectedBulan]);

  // Dynamic calculations for aggregates
  const aggregates = useMemo(() => {
    let weight = 0;
    let value = 0;
    let points = 0;

    filteredTransactions.forEach((tx) => {
      weight += Number(tx.total_berat);
      value += Number(tx.total_nilai);
      points += tx.poin_diperoleh;
    });

    return { weight, value, points };
  }, [filteredTransactions]);

  return (
    <div id={id} className="space-y-6 font-sans">
      
      {/* View Header (Only Visible on desktop, clean spacing) */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Riwayat Penyetoran</h2>
        <p className="text-sm text-neutral-500 mt-1 font-normal">
          Catatan detail timbangan dan poin dari seluruh setoran sampah Anda.
        </p>
      </div>

      {/* Filter bulan — horizontal scroll chips (Wajib Mobile & Desktop) */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-neutral-700 md:hidden">Pilih Periode Jurnal:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer select-none touch-manipulation border ${
                selectedBulan === chip.value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
              style={{ minHeight: '40px', minWidth: '80px' }}
              onClick={() => setSelectedBulan(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Aggregates Highlights for Warga */}
      <div className="grid grid-cols-3 gap-3 bg-white border border-neutral-155 rounded-xl p-3">
        <div className="text-center border-r border-neutral-100 last:border-0">
          <p className="text-[10px] font-bold text-neutral-500 uppercase">Volume</p>
          <p className="text-sm font-black text-neutral-800 mt-0.5 tabular-nums">{formatAngka(aggregates.weight)} kg</p>
        </div>
        <div className="text-center border-r border-neutral-100 last:border-0">
          <p className="text-[10px] font-bold text-neutral-500 uppercase">Nilai</p>
          <p className="text-sm font-black text-neutral-800 mt-0.5 tabular-nums">{formatRupiah(aggregates.value)}</p>
        </div>
        <div className="text-center last:border-0">
          <p className="text-[10px] font-bold text-neutral-500 uppercase">Poin</p>
          <p className="text-sm font-black text-brand-600 mt-0.5 tabular-nums">+{formatAngka(aggregates.points)}</p>
        </div>
      </div>

      {/* Conditional visual state */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white border border-neutral-155 rounded-xl p-10 text-center flex flex-col items-center justify-center">
          <Layers className="h-10 w-10 text-neutral-300 stroke-1 mb-3" />
          <p className="font-bold text-neutral-700 text-sm">Tidak Ada Transaksi</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-normal font-medium">
            {selectedBulan === 'semua'
              ? 'Anda belum pernah menyetor sampah di salah satu lokasi kami.'
              : 'Tidak ada transaksi penyetoran sampah terdaftar pada bulan terpilih.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* MOBILE CARD LIST: Shown under md screen sizes */}
          <div className="space-y-3.5 md:hidden">
            {filteredTransactions.map((trx) => {
              const items = detailsByTxId[trx.id] || [];
              const isExpanded = !!expandedCards[trx.id];

              return (
                <div
                  key={trx.id}
                  className="bg-white rounded-xl border border-neutral-155 overflow-hidden transition-all shadow-2xs"
                >
                  {/* Header of card */}
                  <div
                    onClick={() => toggleExpanded(trx.id)}
                    className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-50 cursor-pointer active:bg-neutral-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-50 text-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Recycle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Setor Sampah</p>
                        <p className="text-3xs text-neutral-400 font-semibold">{formatTanggal(trx.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs font-black text-brand-600">+{trx.poin_diperoleh} poin</p>
                        <p className="text-3xs text-neutral-400 font-bold">{formatRupiah(trx.total_nilai)}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Detail list elements per item */}
                  <div className="px-4 py-2 space-y-1 bg-white">
                    {items.slice(0, isExpanded ? undefined : 2).map((detail) => (
                      <div key={detail.id} className="flex justify-between text-xs font-medium text-neutral-600">
                        <span>{detail.category?.nama || 'Sampah'}</span>
                        <span className="text-neutral-500">{detail.berat_kg} kg</span>
                      </div>
                    ))}
                    {!isExpanded && items.length > 2 && (
                      <p className="text-3xs text-neutral-400 font-bold text-center mt-1">
                        +{items.length - 2} item lainnya. Ketuk kartu untuk memperluas.
                      </p>
                    )}
                  </div>

                  {/* Expanded contents details wrapper */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 bg-neutral-50/30 border-t border-neutral-100">
                      <div className="space-y-2 mt-2">
                        <p className="text-3xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                          <Info className="h-3 w-3" /> Rincian Kalkulasi:
                        </p>
                        
                        <div className="space-y-1.5 ml-1">
                          {items.map((it) => (
                            <div key={it.id} className="flex justify-between text-xxs font-medium text-neutral-700">
                              <span>• {it.category?.nama} ({it.berat_kg} kg @ {formatRupiah(it.harga_saat_itu)})</span>
                              <span className="font-bold text-neutral-800">{formatRupiah(it.subtotal)}</span>
                            </div>
                          ))}
                        </div>

                        {trx.catatan && (
                          <div className="mt-2 text-[10px] leading-relaxed bg-white border border-neutral-100 text-neutral-500 rounded p-2">
                            <strong>Catatan Petugas:</strong> &ldquo;{trx.catatan}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="px-4 py-2.5 bg-neutral-50/80 border-t border-neutral-100 flex justify-between text-xs font-bold text-neutral-600">
                    <span>Total Berat Matriks</span>
                    <span className="text-neutral-800 font-extrabold">{trx.total_berat} kg</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW LAYOUT: Hidden under md screens, clean table */}
          <div className="hidden md:block bg-white border border-neutral-155 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10"></th>
                    <th className="py-3.5 px-4">Tanggal Transaksi</th>
                    <th className="py-3.5 px-4">Detail Komposisi</th>
                    <th className="py-3.5 px-4">Total Berat</th>
                    <th className="py-3.5 px-4">Nilai Konversi</th>
                    <th className="py-3.5 px-4 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTransactions.map((tx) => {
                    const items = detailsByTxId[tx.id] || [];
                    const isCurrentExpanded = !!expandedCards[tx.id];

                    return (
                      <>
                        <tr
                          key={tx.id}
                          onClick={() => toggleExpanded(tx.id)}
                          className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-4 text-neutral-400">
                            {isCurrentExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-neutral-400" />
                              <span className="font-bold text-neutral-800">{formatTanggal(tx.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-bold bg-brand-50 border border-brand-100/30 rounded-full px-2.5 py-0.5">
                              {items.length} Golongan Sampah
                            </span>
                          </td>
                          <td className="py-4 px-4 font-extrabold text-neutral-700">
                            {tx.total_berat} kg
                          </td>
                          <td className="py-4 px-4 font-bold text-neutral-800">
                            {formatRupiah(tx.total_nilai)}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-brand-600">
                            +{tx.poin_diperoleh}
                          </td>
                        </tr>

                        {isCurrentExpanded && (
                          <tr className="bg-neutral-50/10">
                            <td colSpan={6} className="py-4 px-6 border-b border-neutral-100">
                              <div className="space-y-3.5 border-l-2 border-neutral-250 pl-5 py-0.5">
                                <h5 className="text-xs font-extrabold text-neutral-600 uppercase tracking-widest flex items-center gap-1 mb-2">
                                  <Info className="h-3.5 w-3.5 text-neutral-405" />
                                  Rincian Kelompok Timbangan
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {items.map((it) => (
                                    <div
                                      key={it.id}
                                      className="bg-white border border-neutral-200/60 rounded p-3 flex justify-between items-center text-xs"
                                    >
                                      <div>
                                        <p className="font-bold text-neutral-850">
                                          {it.category?.nama || 'Sampah'}
                                        </p>
                                        <p className="text-neutral-400 font-mono mt-0.5 font-semibold">
                                          {it.berat_kg} kg @ {formatRupiah(it.harga_saat_itu)}
                                        </p>
                                      </div>
                                      <span className="font-extrabold text-neutral-800">
                                        {formatRupiah(it.subtotal)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {tx.catatan && (
                                  <div className="mt-2 text-xs bg-brand-50/10 border border-brand-100/50 text-neutral-550 rounded p-2.5 max-w-xl font-medium">
                                    <strong>Catatan petugas:</strong> &rdquo;{tx.catatan}&ldquo;
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
