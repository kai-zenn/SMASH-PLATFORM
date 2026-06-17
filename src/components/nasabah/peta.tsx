import { useState, useMemo } from 'react';
import { AlertTriangle, MapPin, Clock, Phone, Search, Navigation } from 'lucide-react';
import { DUMMY_LOKASI } from '../../lib/constants';

interface PetaProps {
  id?: string;
}

export function NasabahPeta({ id }: PetaProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return DUMMY_LOKASI;
    const q = searchQuery.toLowerCase();
    return DUMMY_LOKASI.filter(
      (loc) =>
        loc.nama.toLowerCase().includes(q) ||
        loc.alamat.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleRouteClick = (locName: string) => {
    alert(`Rute simulasi menuju "${locName}" telah dihitung! Mulai navigasi GPS Anda.`);
  };

  return (
    <div id={id} className="space-y-6">
      {/* COMPULSORY BANNER DEMO - MOST IMPORTANT */}
      <div className="flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>
          <strong>Fitur Demo.</strong> Halaman ini adalah tampilan prototipe dan tidak memproses data nyata.
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800 tracking-tight font-sans">
            Lokasi Unit Bank Sampah Jakarta
          </h2>
          <p className="text-sm text-neutral-500 mt-1 font-normal">
            Cari dan kunjungi unit Bank Sampah terdekat dari tempat tinggal Anda untuk penyetoran.
          </p>
        </div>

        {/* Input Search of location */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Cari wilayah/nama unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-medium text-neutral-700"
          />
        </div>
      </div>

      {/* Grid List of Units */}
      {filteredLocations.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-10 text-center">
          <MapPin className="h-10 w-10 text-neutral-300 mx-auto stroke-1 mb-2" />
          <p className="font-medium text-neutral-700">Unit Bank Sampah Tidak Ditemukan</p>
          <p className="text-xs text-neutral-500 mt-1">Gunakan kata kunci pencarian wilayah lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between hover:border-neutral-300 transition-colors"
            >
              <div className="space-y-4">
                {/* Header title */}
                <div className="flex items-start gap-3">
                  <div className="bg-brand-50 text-brand-600 rounded-md p-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-850 mt-0.5 leading-tight tracking-tight">
                      {loc.nama}
                    </h4>
                    <span className="inline-block bg-neutral-100 text-neutral-600 text-3xs font-semibold rounded px-1.5 py-0.5 mt-2">
                      DKI Jakarta
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-neutral-500 pt-2 font-normal leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Navigation className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span>{loc.alamat}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span>{loc.operasional}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span>Hubungi: {loc.telp}</span>
                  </div>
                </div>
              </div>

              {/* Action route button (Demo interaction) */}
              <div className="pt-5 mt-4 border-t border-neutral-50 flex">
                <button
                  onClick={() => handleRouteClick(loc.nama)}
                  className="w-full h-8 px-4 bg-brand-50 hover:bg-brand-100 text-brand-700 hover:text-brand-800 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="h-3 w-3" /> Petunjuk Rute (Demo)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
