// Types Database SMASH

export interface Profile {
  id: string;
  nama: string;
  email: string;
  role: 'nasabah' | 'admin';
  kelurahan: string | null;
  total_poin: number;
  level: string;
  avatar_url: string | null;
  created_at: string;
}

export interface SampahKategori {
  id: string;
  nama: string;
  harga_per_kg: number;
  satuan: string;
  deskripsi: string | null;
  warna: string;
  created_at: string;
}

export interface Transaksi {
  id: string;
  nasabah_id: string;
  admin_id: string;
  total_berat: number;
  total_nilai: number;
  poin_diperoleh: number;
  catatan: string | null;
  created_at: string;
}

export interface TransaksiDetail {
  id: string;
  transaksi_id: string;
  kategori_id: string;
  berat_kg: number;
  harga_saat_itu: number;
  subtotal: number;
}

export interface Artikel {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string | null;
  kategori: string;
  gambar_url: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  nama: string;
  deskripsi: string;
  min_poin: number;
  ikon: string;
}

export interface NasabahBadge {
  nasabah_id: string;
  badge_id: string;
  diperoleh_at: string;
}

// Join types yang sering dipakai
export type TransaksiDetailWithKategori = TransaksiDetail & {
  sampah_kategori: SampahKategori;
};

export type TransaksiWithDetailAndProfile = Transaksi & {
  transaksi_detail: TransaksiDetailWithKategori[];
  profiles: Pick<Profile, 'nama' | 'email' | 'kelurahan'>;
};
