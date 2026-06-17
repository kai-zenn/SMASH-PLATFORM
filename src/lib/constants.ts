import { SampahKategori, Artikel, Badge } from '../types';

export const POIN_PER_KG = 10;

export const LEVEL_THRESHOLDS = [
  { nama: 'Pemula Hijau', min: 0 },
  { nama: 'Pengumpul Aktif', min: 500 },
  { nama: 'Pejuang Lingkungan', min: 2000 },
  { nama: 'Pahlawan Bumi', min: 5000 },
];

export const INITIAL_KATEGORI: SampahKategori[] = [
  {
    id: 'kategori-1',
    nama: 'Kertas & Kardus',
    harga_per_kg: 1500,
    satuan: 'kg',
    deskripsi: 'Koran, majalah, kardus bekas, kertas HVS',
    warna: '#3b82f6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'kategori-2',
    nama: 'Plastik',
    harga_per_kg: 2000,
    satuan: 'kg',
    deskripsi: 'Botol plastik, ember, kantong tebal, wadah makan',
    warna: '#f59e0b',
    created_at: new Date().toISOString(),
  },
  {
    id: 'kategori-3',
    nama: 'Logam & Kaleng',
    harga_per_kg: 5000,
    satuan: 'kg',
    deskripsi: 'Kaleng minuman, besi, tembaga, alumunium',
    warna: '#6b7280',
    created_at: new Date().toISOString(),
  },
  {
    id: 'kategori-4',
    nama: 'Kaca & Botol',
    harga_per_kg: 500,
    satuan: 'kg',
    deskripsi: 'Botol kaca, pecahan kaca bersih, toples',
    warna: '#06b6d4',
    created_at: new Date().toISOString(),
  },
  {
    id: 'kategori-5',
    nama: 'Elektronik',
    harga_per_kg: 10000,
    satuan: 'kg',
    deskripsi: 'HP rusak, kabel, baterai bekas, komponen keyboard',
    warna: '#8b5cf6',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_ARTIKEL: Artikel[] = [
  {
    id: 'artikel-1',
    judul: 'Cara Mudah Pilah Sampah di Rumah',
    slug: 'cara-pilah-sampah',
    konten: 'Memilah sampah adalah langkah pertama yang bisa kamu lakukan untuk menjaga lingkungan. Mulailah dengan tiga wadah berbeda: satu untuk sampah organik, satu untuk sampah daur ulang (kertas, plastik, logam, kaca), dan satu untuk sampah residu yang tidak bisa didaur ulang. Dengan memilah sampah di rumah, kamu membantu mengurangi volume sampah di TPA Bantargebang serta mempermudah petugas bank sampah memproses bahan yang bernilai ekonomi tinggi.',
    ringkasan: 'Panduan lengkap memilah 5 kategori sampah di rumah.',
    kategori: 'panduan',
    gambar_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString(),
  },
  {
    id: 'artikel-2',
    judul: 'Kenapa Sampah Plastik Sangat Berbahaya?',
    slug: 'bahaya-plastik',
    konten: 'Plastik membutuhkan 400 hingga 1000 tahun untuk terurai secara alami. Selama proses penguraian itu, plastik melepaskan mikroplastik yang masuk ke rantai makanan, udara, bahkan air minum kita. Jakarta sendiri menghasilkan ribuan ton plastik setiap harinya. Melalui program SMASH Bank Sampah Jakarta, plastik tersebut dikumpulkan, didaur ulang, dan disulap menjadi bijih plastik berkualitas tinggi untuk menekan produksi plastik baru.',
    ringkasan: 'Fakta mengejutkan tentang dampak jangka panjang sampah plastik.',
    kategori: 'fakta',
    gambar_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString(),
  },
  {
    id: 'artikel-3',
    judul: '5 Manfaat Nyata Bank Sampah untuk Keluarga',
    slug: 'manfaat-bank-sampah',
    konten: 'Selain dampak lingkungan, bank sampah memberikan manfaat langsung bagi keluarga. Sampah yang selama ini dibuang begitu saja bisa dikonversi menjadi saldo yang bisa dicairkan kapan saja. Poin yang dikumpulkan juga mengantar kamu naik level, membuka lencana kehormatan sosial, dan melatih budaya hidup ramah lingkungan sejak dari lingkungan keluarga terdekat.',
    ringkasan: 'Keuntungan finansial dan sosial yang bisa kamu rasakan.',
    kategori: 'tips',
    gambar_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_BADGES: Badge[] = [
  { id: 'badge-1', nama: 'Pemula Hijau', deskripsi: 'Selamat bergabung di SMASH!', min_poin: 0, ikon: '🌱' },
  { id: 'badge-2', nama: 'Pengumpul Aktif', deskripsi: 'Sudah mengumpulkan 500 poin', min_poin: 500, ikon: '♻️' },
  { id: 'badge-3', nama: 'Pejuang Lingkungan', deskripsi: 'Mencapai 2000 poin', min_poin: 2000, ikon: '🌿' },
  { id: 'badge-4', nama: 'Pahlawan Bumi', deskripsi: 'Lebih dari 5000 poin terkumpul', min_poin: 5000, ikon: '🌍' },
];

export const DUMMY_LOKASI = [
  {
    id: 1,
    nama: 'Bank Sampah Kebon Jeruk',
    alamat: 'Jl. Raya Kebon Jeruk No. 12, Jakarta Barat',
    operasional: 'Senin–Sabtu 08:00–16:00',
    telp: '0812-3456-7890',
  },
  {
    id: 2,
    nama: 'Bank Sampah Tebet Bersih',
    alamat: 'Jl. Tebet Barat Dalam VII, Jakarta Selatan',
    operasional: 'Senin–Jumat 09:00–15:00',
    telp: '0812-7654-3210',
  },
  {
    id: 3,
    nama: 'Bank Sampah Cempaka Putih',
    alamat: 'Jl. Cempaka Putih Tengah No. 5, Jakarta Pusat',
    operasional: 'Selasa–Sabtu 08:00–14:00',
    telp: '0813-8888-9999',
  },
  {
    id: 4,
    nama: 'Bank Sampah Kelapa Gading',
    alamat: 'Jl. Gading Raya No. 88, Jakarta Utara',
    operasional: 'Senin–Sabtu 07:00–15:00',
    telp: '0811-2222-3333',
  },
  {
    id: 5,
    nama: 'Bank Sampah Duren Sawit',
    alamat: 'Jl. Duren Sawit Raya No. 33, Jakarta Timur',
    operasional: 'Senin–Jumat 08:00–16:00',
    telp: '0815-4444-5555',
  },
];
