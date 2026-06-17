import { useState, useEffect, useMemo } from 'react';
import { Leaf, Trees, Droplet, Award, Zap, HelpCircle } from 'lucide-react';
import { Transaksi, TransaksiDetail, SampahKategori } from '../../types';
import { formatAngka, hitungCO2 } from '../../lib/utils';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie
} from 'recharts';

interface DampakProps {
  transactions: Transaksi[];
  details: TransaksiDetail[];
  categories: SampahKategori[];
  userLevel: string;
  id?: string;
}

export function NasabahDampak({ transactions, details, categories, userLevel, id }: DampakProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalKg = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + Number(tx.total_berat), 0);
  }, [transactions]);

  // Formulas
  const { co2Kg, pohon, airLiter } = useMemo(() => {
    return hitungCO2(totalKg);
  }, [totalKg]);

  // Bar Chart Data: Group total weight by month (Last 6 months)
  const barChartData = useMemo(() => {
    const monthlyMap: Record<string, number> = {};
    const monthsRange: string[] = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = 0;
      monthsRange.push(key);
    }

    // Accumulate transaction weights
    transactions.forEach((tx) => {
      try {
        const date = new Date(tx.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap[key] !== undefined) {
          monthlyMap[key] += Number(tx.total_berat);
        }
      } catch (err) {
        // Safe check
      }
    });

    // Format for Recharts
    return monthsRange.map((key) => {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
      return {
        bulan: label,
        berat: Number(monthlyMap[key].toFixed(1)),
      };
    });
  }, [transactions]);

  // Pie Chart Data: Group by category
  const pieChartData = useMemo(() => {
    const categoryWeights: Record<string, { name: string; value: number; color: string }> = {};

    // Initialize active categories to ensure they show up in composition
    categories.forEach((cat) => {
      categoryWeights[cat.id] = {
        name: cat.nama,
        value: 0,
        color: cat.warna || '#2a9d5c',
      };
    });

    // Group transaction details weight
    details.forEach((det) => {
      if (categoryWeights[det.kategori_id]) {
        categoryWeights[det.kategori_id].value += Number(det.berat_kg);
      }
    });

    // Convert to array and filter out zero values to look clean
    return Object.values(categoryWeights)
      .filter((item) => item.value > 0)
      .map((item) => ({
        ...item,
        value: Number(item.value.toFixed(1)),
      }));
  }, [details, categories]);

  // Motivation text based on level
  const motivationText = useMemo(() => {
    switch (userLevel) {
      case 'Pahlawan Bumi':
        return 'Anda adalah teladan nyata bagi warga DKI Jakarta! Kontribusi masif Anda telah menyelematkan ekosistem dan menginspirasi puluhan orang lain dalam melestarikan lingkungan perkotaan.';
      case 'Pejuang Lingkungan':
        return 'Hebat sekali! Anda terus melangkah membersihkan lingkungan. Langkah konsisten Anda mengurangi berton-ton emisi karbon demi masa depan Jakarta yang asri.';
      case 'Pengumpul Aktif':
        return 'Pencapaian yang luar biasa! Sampah rumah tangga Anda tidak lagi berakhir mencemari laut dan tanah, melainkan kembali berputar dalam sirkulasi ekonomi berkat ketekunan Anda.';
      default:
        return 'Langkah awal yang hebat! Setiap kilogram sampah plastik atau kardus yang Anda pilah di rumah memiliki arti penting dalam mengurangi penumpukan sampah di perkotaan Jakarta.';
    }
  }, [userLevel]);

  return (
    <div id={id} className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight">Dampak Lingkungan</h2>
        <p className="text-sm text-neutral-500 mt-1 font-normal">
          Lihat visualisasi nyata dari kontribusi pemilahan sampah Anda terhadap lestarinya bumi.
        </p>
      </div>

      {/* Motivation Box */}
      <div className="bg-brand-50 border border-brand-100 rounded-lg p-5 flex items-start gap-4">
        <div className="bg-brand-500 text-white rounded-md p-2 flex items-center justify-center flex-shrink-0">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-semibold text-brand-900 text-sm">Pencapaian Level Anda: 🌱 {userLevel}</h4>
          <p className="text-xs text-brand-800 leading-relaxed mt-1">{motivationText}</p>
        </div>
      </div>

      {/* 3 Green Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CO2 Saved */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-md">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-500 font-medium">CO₂ Berkurang</span>
            <h4 className="text-2xl font-bold text-neutral-800 mt-0.5 tabular-nums">
              {formatAngka(co2Kg)} kg
            </h4>
            <p className="text-xxs text-neutral-400 mt-0.5">Emisi karbon dihemat</p>
          </div>
        </div>

        {/* Trees Saved */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 flex items-center gap-4">
          <div className="bg-green-50 text-green-600 p-3 rounded-md">
            <Trees className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-500 font-medium">Pohon Diselamatkan</span>
            <h4 className="text-2xl font-bold text-neutral-800 mt-0.5 tabular-nums">
              {formatAngka(pohon)} pohon
            </h4>
            <p className="text-xxs text-neutral-400 mt-0.5">Ekuivalen penyerapan CO₂/tahun</p>
          </div>
        </div>

        {/* Water Saved */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-md">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-500 font-medium">Air Dihemat</span>
            <h4 className="text-2xl font-bold text-neutral-800 mt-0.5 tabular-nums">
              {formatAngka(airLiter)} Liter
            </h4>
            <p className="text-xxs text-neutral-400 mt-0.5">Air dari proses daur ulang</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Weight per month */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 lg:col-span-7">
          <h3 className="font-semibold text-neutral-800 text-sm mb-1">Penyetoran Sampah (kg)</h3>
          <p className="text-xs text-neutral-400 mb-6 font-normal">Perbandingan volume timbangan sampah 6 bulan terakhir</p>
          
          <div className="h-64 flex items-center justify-center">
            {mounted ? (
              totalKg === 0 ? (
                <p className="text-xs text-neutral-400 font-normal">Belum ada data penyetoran untuk ditampilkan grafiknya.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f2f0" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#737370' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#737370' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9f9f8' }} contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                    <Bar dataKey="berat" name="Timbangan (kg)" fill="#2a9d5c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <p className="text-xs text-neutral-400">Memuat grafik...</p>
            )}
          </div>
        </div>

        {/* Pie Chart: Waste distribution */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 lg:col-span-5">
          <h3 className="font-semibold text-neutral-800 text-sm mb-1">Distribusi Jenis Sampah</h3>
          <p className="text-xs text-neutral-400 mb-6 font-normal">Komposisi sampah yang Anda setorkan berdasarkan kg</p>

          <div className="h-64 flex flex-col items-center justify-center">
            {mounted ? (
              pieChartData.length === 0 ? (
                <p className="text-xs text-neutral-400 font-normal">Belum ada detail data sampah untuk komparasi grafik.</p>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legends list */}
                  <div className="flex flex-col gap-2 flex-grow sm:max-w-[180px]">
                    {pieChartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-neutral-600 truncate flex-grow">{entry.name}</span>
                        <span className="font-bold text-neutral-800 whitespace-nowrap">{entry.value} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs text-neutral-400">Memuat grafik...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
