import { createClient } from '@supabase/supabase-js';
import { Profile, SampahKategori, Transaksi, TransaksiDetail, Artikel, Badge, NasabahBadge, TransaksiWithDetailAndProfile } from '../types';
import { INITIAL_KATEGORI, INITIAL_ARTIKEL, INITIAL_BADGES } from './constants';
import { getLevel } from './utils';

// Check if environment variables are available
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isRealSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// MOCK LOCAL STORAGE DATABASE ENGINE
// ==========================================
// This ensures that our app is ALWAYS 100% functional even when Supabase is not provisioned.
// It stores all data inside local storage dynamically.

const KEYS = {
  PROFILES: 'smash_profiles',
  TRANSAKSI: 'smash_transaksi',
  TRANSAKSI_DETAIL: 'smash_transaksi_detail',
  KATEGORI: 'smash_sampah_kategori',
  ARTIKEL: 'smash_artikel',
  BADGES: 'smash_badges',
  NASABAH_BADGES: 'smash_nasabah_badges',
  SESSION: 'smash_current_session',
};

// Help initialize data
export function initializeMockDatabase() {
  if (!localStorage.getItem(KEYS.KATEGORI)) {
    localStorage.setItem(KEYS.KATEGORI, JSON.stringify(INITIAL_KATEGORI));
  }
  if (!localStorage.getItem(KEYS.ARTIKEL)) {
    localStorage.setItem(KEYS.ARTIKEL, JSON.stringify(INITIAL_ARTIKEL));
  }
  if (!localStorage.getItem(KEYS.BADGES)) {
    localStorage.setItem(KEYS.BADGES, JSON.stringify(INITIAL_BADGES));
  }

  // Set up default accounts if not exists
  if (!localStorage.getItem(KEYS.PROFILES)) {
    const defaultProfiles: Profile[] = [
      {
        id: 'admin-uuid-1',
        nama: 'Petugas Joko Suwarno',
        email: 'admin@smash.id',
        role: 'admin',
        kelurahan: 'Menteng',
        total_poin: 0,
        level: 'Pemula Hijau',
        avatar_url: null,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'nasabah-uuid-1',
        nama: 'Budi Santoso',
        email: 'nasabah@smash.id',
        role: 'nasabah',
        kelurahan: 'Gambir',
        total_poin: 1250,
        level: 'Pengumpul Aktif',
        avatar_url: null,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'nasabah-uuid-2',
        nama: 'Siti Rahma',
        email: 'siti@smash.id',
        role: 'nasabah',
        kelurahan: 'Kebon Jeruk',
        total_poin: 5400,
        level: 'Pahlawan Bumi',
        avatar_url: null,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(defaultProfiles));
  }

  // Set up default historical transactions to make the dashboards look alive
  if (!localStorage.getItem(KEYS.TRANSAKSI)) {
    const defaultTransactions: Transaksi[] = [
      {
        id: 'tx-1',
        nasabah_id: 'nasabah-uuid-1',
        admin_id: 'admin-uuid-1',
        total_berat: 15.5,
        total_nilai: 31000,
        poin_diperoleh: 155,
        catatan: 'Botol plastik bersih tanpa label',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-2',
        nasabah_id: 'nasabah-uuid-1',
        admin_id: 'admin-uuid-1',
        total_berat: 42.0,
        total_nilai: 84000,
        poin_diperoleh: 420,
        catatan: 'Karton bekas packing pindahan',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-3',
        nasabah_id: 'nasabah-uuid-2',
        admin_id: 'admin-uuid-1',
        total_berat: 120.0,
        total_nilai: 600000,
        poin_diperoleh: 1200,
        catatan: 'Besi tua scrap dan komponen logam berat',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx-4',
        nasabah_id: 'nasabah-uuid-2',
        admin_id: 'admin-uuid-1',
        total_berat: 24.5,
        total_nilai: 49000,
        poin_diperoleh: 245,
        catatan: 'Plastik campur ember bekas',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    const defaultDetails: TransaksiDetail[] = [
      {
        id: 'det-1',
        transaksi_id: 'tx-1',
        kategori_id: 'kategori-2', // Plastik
        berat_kg: 15.5,
        harga_saat_itu: 2000,
        subtotal: 31000,
      },
      {
        id: 'det-2',
        transaksi_id: 'tx-2',
        kategori_id: 'kategori-1', // Kertas & Kardus
        berat_kg: 42.0,
        harga_saat_itu: 2000, // Misal plastik dulu
        subtotal: 84000,
      },
      {
        id: 'det-3',
        transaksi_id: 'tx-3',
        kategori_id: 'kategori-3', // Logam & Kaleng
        berat_kg: 120.0,
        harga_saat_itu: 5000,
        subtotal: 600000,
      },
      {
        id: 'det-4',
        transaksi_id: 'tx-4',
        kategori_id: 'kategori-2', // Plastik
        berat_kg: 24.5,
        harga_saat_itu: 2000,
        subtotal: 49000,
      }
    ];

    localStorage.setItem(KEYS.TRANSAKSI, JSON.stringify(defaultTransactions));
    localStorage.setItem(KEYS.TRANSAKSI_DETAIL, JSON.stringify(defaultDetails));
  }

  if (!localStorage.getItem(KEYS.NASABAH_BADGES)) {
    const defaultNasabahBadges: NasabahBadge[] = [
      {
        nasabah_id: 'nasabah-uuid-1',
        badge_id: 'badge-1',
        diperoleh_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        nasabah_id: 'nasabah-uuid-1',
        badge_id: 'badge-2',
        diperoleh_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        nasabah_id: 'nasabah-uuid-2',
        badge_id: 'badge-1',
        diperoleh_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        nasabah_id: 'nasabah-uuid-2',
        badge_id: 'badge-2',
        diperoleh_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        nasabah_id: 'nasabah-uuid-2',
        badge_id: 'badge-3',
        diperoleh_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        nasabah_id: 'nasabah-uuid-2',
        badge_id: 'badge-4',
        diperoleh_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(KEYS.NASABAH_BADGES, JSON.stringify(defaultNasabahBadges));
  }
}

// Global invocation to ensure we always have mock DB structured
initializeMockDatabase();

export const mockDb = {
  getProfiles(): Profile[] {
    return JSON.parse(localStorage.getItem(KEYS.PROFILES) || '[]');
  },
  saveProfiles(profiles: Profile[]) {
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  },
  getTransaksi(): Transaksi[] {
    return JSON.parse(localStorage.getItem(KEYS.TRANSAKSI) || '[]');
  },
  saveTransaksi(transaksi: Transaksi[]) {
    localStorage.setItem(KEYS.TRANSAKSI, JSON.stringify(transaksi));
  },
  getTransaksiDetail(): TransaksiDetail[] {
    return JSON.parse(localStorage.getItem(KEYS.TRANSAKSI_DETAIL) || '[]');
  },
  saveTransaksiDetail(details: TransaksiDetail[]) {
    localStorage.setItem(KEYS.TRANSAKSI_DETAIL, JSON.stringify(details));
  },
  getKategori(): SampahKategori[] {
    return JSON.parse(localStorage.getItem(KEYS.KATEGORI) || '[]');
  },
  saveKategori(kategori: SampahKategori[]) {
    localStorage.setItem(KEYS.KATEGORI, JSON.stringify(kategori));
  },
  getArtikel(): Artikel[] {
    return JSON.parse(localStorage.getItem(KEYS.ARTIKEL) || '[]');
  },
  saveArtikel(artikel: Artikel[]) {
    localStorage.setItem(KEYS.ARTIKEL, JSON.stringify(artikel));
  },
  getBadges(): Badge[] {
    return JSON.parse(localStorage.getItem(KEYS.BADGES) || '[]');
  },
  getNasabahBadges(): NasabahBadge[] {
    return JSON.parse(localStorage.getItem(KEYS.NASABAH_BADGES) || '[]');
  },
  saveNasabahBadges(nb: NasabahBadge[]) {
    localStorage.setItem(KEYS.NASABAH_BADGES, JSON.stringify(nb));
  },
  getCurrentSession(): Profile | null {
    const sess = localStorage.getItem(KEYS.SESSION);
    return sess ? JSON.parse(sess) : null;
  },
  setCurrentSession(p: Profile | null) {
    if (p) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(p));
    } else {
      localStorage.removeItem(KEYS.SESSION);
    }
  }
};
