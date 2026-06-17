import { useState } from 'react';
import { Tags, Pencil, Check, X, AlertCircle } from 'lucide-react';
import { SampahKategori } from '../../types';
import { formatRupiah } from '../../lib/utils';

interface HargaProps {
  categories: SampahKategori[];
  onUpdateCategoryPrice: (id: string, newPrice: number) => { success: boolean; error?: string };
  id?: string;
}

export function AdminHarga({ categories, onUpdateCategoryPrice, id }: HargaProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');

  const startEditing = (cat: SampahKategori) => {
    setEditingId(cat.id);
    setEditPrice(String(cat.harga_per_kg));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const handleSavePrice = (id: string) => {
    const priceNum = Number(editPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Masukkan harga yang valid (angka positif)');
      return;
    }

    const { success, error } = onUpdateCategoryPrice(id, priceNum);
    if (success) {
      setEditingId(null);
      setEditPrice('');
    } else {
      alert(`Gagal merubah harga: ${error || 'Kesalahan sistem'}`);
    }
  };

  return (
    <div id={id} className="space-y-6 font-sans">
      {/* Page Header (Desktop) */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Kelola Harga Acuan Sampah
        </h2>
        <p className="text-sm text-neutral-550 mt-1 font-medium">
          Perbarui harga konversi per kilogram secara real-time. Perubahan harga tidak akan mempengaruhi transaksi lampau.
        </p>
      </div>

      {/* Safety info box explaining non-retroactive status of prices updates */}
      <div className="bg-blue-50 border border-blue-150 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed font-semibold">
          <strong>Perhatian Regulasi:</strong> Perubahan nominal harga di bawah ini berlaku untuk timbangan baru mulai terhitung detik ini. Nilai transaksi <em>(harga_saat_itu)</em> yang sudah terlanjur dicetak pada kuitansi timbangan lampau terkunci aman di dalam relasi database demi akuntabilitas audit keuangan.
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="space-y-4 md:hidden">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;

          return (
            <div key={cat.id} className="bg-white rounded-xl border border-neutral-155 p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.warna || '#2a9d5c' }}
                  />
                  <div>
                    <h4 className="font-bold text-neutral-800 text-xs">{cat.nama}</h4>
                    <p className="text-3xs text-neutral-400 font-bold uppercase tracking-wider">{cat.satuan}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSavePrice(cat.id)}
                        className="w-9 h-9 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="w-9 h-9 border border-neutral-200 hover:bg-neutral-100 text-neutral-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(cat)}
                      className="px-3 py-1.5 border border-neutral-200 text-neutral-600 hover:text-brand-600 hover:border-brand-500 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      style={{ minHeight: '44px' }}
                    >
                      <Pencil className="h-3 w-3" /> Edit Tarif
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xxs text-neutral-500 font-semibold leading-relaxed">
                {cat.deskripsi || '-'}
              </p>

              <div className="pt-3 border-t border-neutral-100 flex justify-between items-center bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100/50">
                <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wide">Tarif Acuan</span>
                {isEditing ? (
                  <div className="flex items-center gap-1.5 max-w-[130px]">
                    <span className="text-xs text-neutral-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="h-8 w-full border border-neutral-200 rounded px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold bg-white"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-black text-brand-600">{formatRupiah(cat.harga_per_kg)}/{cat.satuan}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-neutral-255 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Nama Golongan Kategori</th>
                <th className="py-3 px-4">Deskripsi Deskriptif</th>
                <th className="py-3 px-4">Satuan Berat</th>
                <th className="py-3 px-4">Harga / kg Saat Ini</th>
                <th className="py-3 px-4 text-right">Aksi Sunting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;

                return (
                  <tr key={cat.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.warna || '#2a9d5c' }}
                        />
                        <span className="font-bold text-neutral-800 text-xs">{cat.nama}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-neutral-500 max-w-xs truncate font-semibold">
                      {cat.deskripsi || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-xs font-semibold">{cat.satuan}</td>
                    
                    {/* Inline Conditional Edit Fields */}
                    <td className="py-3.5 px-4 font-extrabold text-neutral-800">
                      {isEditing ? (
                        <div className="flex items-center gap-2 max-w-[130px]">
                          <span className="text-xs text-neutral-400 font-bold">Rp</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-8 w-full border border-neutral-200 rounded px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-extrabold bg-white"
                          />
                        </div>
                      ) : (
                        <span className="text-xs">{formatRupiah(cat.harga_per_kg)}</span>
                      )}
                    </td>

                    {/* Interactive controls */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSavePrice(cat.id)}
                            className="p-1 h-7 w-7 bg-brand-500 hover:bg-brand-600 text-white rounded flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                            id={`btn-save-price-${cat.id}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 h-7 w-7 border border-neutral-200 hover:bg-neutral-100 text-neutral-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(cat)}
                          className="h-8 px-3 border border-neutral-200 text-neutral-600 hover:text-brand-600 hover:border-brand-500 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ml-auto"
                          id={`btn-edit-price-${cat.id}`}
                        >
                          <Pencil className="h-3 w-3" /> Edit Tarif
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
