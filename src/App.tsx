import React, { useState, useEffect, useMemo } from 'react';
import { 
  mockDb, isRealSupabaseConfigured 
} from './lib/supabase';
import { Profile, SampahKategori, Transaksi, TransaksiDetail, Artikel, Badge, NasabahBadge } from './types';
import { getLevel, formatRupiah } from './lib/utils';
import { INITIAL_KATEGORI, INITIAL_BADGES } from './lib/constants';

// Sidebar Components import
import { NasabahSidebar } from './components/nasabah/sidebar';
import { AdminSidebar } from './components/admin/sidebar';
import { MobileBottomNav } from './components/nasabah/mobile-bottom-nav';
import { MobileAppBar } from './components/nasabah/mobile-app-bar';
import { NasabahDesktopSidebar } from './components/nasabah/desktop-sidebar';
import { AdminMobileAppBar } from './components/admin/mobile-app-bar';
import { AdminMobileBottomNav } from './components/admin/mobile-bottom-nav';
import { AdminDesktopSidebar } from './components/admin/desktop-sidebar';

// Nasabah Sub-pages import
import { NasabahDashboard } from './components/nasabah/dashboard';
import { NasabahRiwayat } from './components/nasabah/riwayat';
import { NasabahSaldo } from './components/nasabah/saldo';
import { NasabahDampak } from './components/nasabah/dampak';
import { NasabahEdukasi } from './components/nasabah/edukasi';
import { NasabahPeta } from './components/nasabah/peta';

// Admin Sub-pages import
import { AdminDashboard } from './components/admin/dashboard';
import { AdminScan } from './components/admin/scan';
import { AdminNasabah } from './components/admin/nasabah';
import { AdminHarga } from './components/admin/harga';
import { AdminLaporan } from './components/admin/laporan';

// Utility Icons
import { ShieldAlert, Recycle, Info, LogOut, CheckCircle, ChevronRight, UserPlus, LogIn, Lock, Mail, User } from 'lucide-react';

export default function App() {
  // Database local states (mirrors Supabase / Local mock databases)
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<SampahKategori[]>([]);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [details, setDetails] = useState<TransaksiDetail[]>([]);
  const [articles, setArticles] = useState<Artikel[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [nasabahBadges, setNasabahBadges] = useState<NasabahBadge[]>([]);

  // Session state
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [guestRole, setGuestRole] = useState<'guest' | 'nasabah' | 'admin'>('guest');

  // Active navigation tab
  const [nasabahTab, setNasabahTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('dashboard');

  // Auth pages local states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login fields with validations
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register fields with validations
  const [registerNama, setRegisterNama] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerKelurahan, setRegisterKelurahan] = useState('Gambir');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);

  // System alert / feedback toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Load database arrays under initial mount
  useEffect(() => {
    // Sync states from local storage engine
    setProfiles(mockDb.getProfiles());
    setCategories(mockDb.getKategori());
    setTransactions(mockDb.getTransaksi());
    setDetails(mockDb.getTransaksiDetail());
    setArticles(mockDb.getArtikel());
    setBadges(mockDb.getBadges());
    setNasabahBadges(mockDb.getNasabahBadges());

    // Check persistent session
    const activeSession = mockDb.getCurrentSession();
    if (activeSession) {
      setCurrentUser(activeSession);
      setGuestRole(activeSession.role);
    }
  }, []);

  // Sync state back to local storage whenever they shift
  const syncProfilesToDb = (updated: Profile[]) => {
    setProfiles(updated);
    mockDb.saveProfiles(updated);
    // Update live session active reference if it matches current
    if (currentUser) {
      const matchKey = updated.find((p) => p.id === currentUser.id);
      if (matchKey) {
        setCurrentUser(matchKey);
        mockDb.setCurrentSession(matchKey);
      }
    }
  };

  const syncTransactionsToDb = (updated: Transaksi[]) => {
    setTransactions(updated);
    mockDb.saveTransaksi(updated);
  };

  const syncDetailsToDb = (updated: TransaksiDetail[]) => {
    setDetails(updated);
    mockDb.saveTransaksiDetail(updated);
  };

  const syncCategoriesToDb = (updated: SampahKategori[]) => {
    setCategories(updated);
    mockDb.saveKategori(updated);
  };

  const syncNasabahBadgesToDb = (updated: NasabahBadge[]) => {
    setNasabahBadges(updated);
    mockDb.saveNasabahBadges(updated);
  };

  // Helper trigger custom notifications
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // ==========================================
  // AUTHENTICATION LOGIC FLOWS
  // ==========================================

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Form validations
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Email dan password wajib diisi');
      return;
    }
    if (loginPassword.length < 8) {
      setLoginError('Password minimal harus terdiri dari 8 karakter');
      return;
    }

    // Attempt retrieve match profile from mock DB array
    const matchedProfile = profiles.find(
      (p) => p.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (!matchedProfile) {
      setLoginError('Email tidak terdaftar atau password salah');
      return;
    }

    // Set active session
    setCurrentUser(matchedProfile);
    setGuestRole(matchedProfile.role);
    mockDb.setCurrentSession(matchedProfile);
    
    // Reset inputs
    setLoginEmail('');
    setLoginPassword('');
    showToast(`Selamat datang kembali, ${matchedProfile.nama}! 👋`, 'success');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    // Form validations
    if (!registerNama.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setRegisterError('Semua kolom wajib diisi lengkap');
      return;
    }
    if (registerPassword.length < 8) {
      setRegisterError('Password minimal harus terdiri dari 8 karakter');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Konfirmasi password tidak cocok');
      return;
    }

    // Check duplicate email
    const emailExist = profiles.some(
      (p) => p.email.toLowerCase() === registerEmail.toLowerCase().trim()
    );
    if (emailExist) {
      setRegisterError('Email sudah terdaftar dalam sistem SMASH');
      return;
    }

    // Build new unique user Profile
    const newUid = `nasabah-uuid-${Date.now()}`;
    const newProfile: Profile = {
      id: newUid,
      nama: registerNama.trim(),
      email: registerEmail.toLowerCase().trim(),
      role: 'nasabah',
      kelurahan: registerKelurahan,
      total_poin: 0,
      level: 'Pemula Hijau',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };

    // Update state & mock DB persistent storage
    const updatedProfiles = [...profiles, newProfile];
    syncProfilesToDb(updatedProfiles);

    // Setup initial badges acquired list for Pemula Hijau (Level milestone 0)
    const initBadge: NasabahBadge = {
      nasabah_id: newUid,
      badge_id: 'badge-1', // Pemula Hijau
      diperoleh_at: new Date().toISOString(),
    };
    const updatedNasabahBadges = [...nasabahBadges, initBadge];
    syncNasabahBadgesToDb(updatedNasabahBadges);

    // Directly log the user on completion
    setCurrentUser(newProfile);
    setGuestRole('nasabah');
    mockDb.setCurrentSession(newProfile);

    // Clean forms
    setRegisterNama('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    showToast(`Registrasi sukses! Selamat bergabung di Bank Sampah Jakarta, ${newProfile.nama}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGuestRole('guest');
    mockDb.setCurrentSession(null);
    setNasabahTab('dashboard');
    setAdminTab('dashboard');
    setAuthMode('login');
    showToast('Anda telah logout dengan aman dari sistem.', 'info');
  };

  // ==========================================
  // TRANSACTION LOGGING LOGIC (Adminscan callback)
  // ==========================================

  const handleSaveTransactionCallback = (
    nasabahId: string,
    totalBerat: number,
    totalNilai: number,
    poinDiperoleh: number,
    catatan: string,
    itemsToSave: { kategoriId: string; berat_kg: number; hargaPerKg: number; subtotal: number }[]
  ) => {
    try {
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Hanya administrator yang berhak mencatat transaksi' };
      }

      // 1. Generate core transaction block
      const newTxId = `tx-uuid-${Date.now()}`;
      const newTx: Transaksi = {
        id: newTxId,
        nasabah_id: nasabahId,
        admin_id: currentUser.id,
        total_berat: totalBerat,
        total_nilai: totalNilai,
        poin_diperoleh: poinDiperoleh,
        catatan: catatan.trim() || null,
        created_at: new Date().toISOString(),
      };

      // 2. Generate items details records mapping
      const newDetails: TransaksiDetail[] = itemsToSave.map((it, idx) => ({
        id: `det-item-uuid-${Date.now()}-${idx}`,
        transaksi_id: newTxId,
        kategori_id: it.kategoriId,
        berat_kg: it.berat_kg,
        harga_saat_itu: it.hargaPerKg,
        subtotal: it.subtotal,
      }));

      // 3. Update points level of target customer
      const targetUser = profiles.find((p) => p.id === nasabahId);
      if (!targetUser) {
        return { success: false, error: 'Nasabah tidak ditemukan' };
      }

      const postPoinSum = targetUser.total_poin + poinDiperoleh;
      const postLevelName = getLevel(postPoinSum);

      const modifiedProfiles = profiles.map((p) => {
        if (p.id === nasabahId) {
          return {
            ...p,
            total_poin: postPoinSum,
            level: postLevelName,
          };
        }
        return p;
      });

      // 4. Validate and unlock new acquired Badges
      const userCollectedBadges = nasabahBadges.filter((nb) => nb.nasabah_id === nasabahId);
      const newlyAcquiredBadges: NasabahBadge[] = [];

      INITIAL_BADGES.forEach((b) => {
        // checks if match has it already
        const alreadyHasIt = userCollectedBadges.some((unb) => unb.badge_id === b.id);
        if (!alreadyHasIt && postPoinSum >= b.min_poin) {
          newlyAcquiredBadges.push({
            nasabah_id: nasabahId,
            badge_id: b.id,
            diperoleh_at: new Date().toISOString(),
          });
        }
      });

      // Commit changes instantly to state matrices & local storage database
      syncTransactionsToDb([...transactions, newTx]);
      syncDetailsToDb([...details, ...newDetails]);
      syncProfilesToDb(modifiedProfiles);
      
      if (newlyAcquiredBadges.length > 0) {
        syncNasabahBadgesToDb([...nasabahBadges, ...newlyAcquiredBadges]);
      }

      return { success: true, txId: newTxId };
    } catch (e: any) {
      return { success: false, error: e.message || 'Kesalahan penyimpanan' };
    }
  };

  // ==========================================
  // PRICE MANAGEMENT CALLBACK
  // ==========================================
  const handleUpdateCategoryPriceCallback = (id: string, newPrice: number) => {
    try {
      const matchAndEdit = categories.map((cat) => {
        if (cat.id === id) {
          return {
            ...cat,
            harga_per_kg: newPrice,
          };
        }
        return cat;
      });

      syncCategoriesToDb(matchAndEdit);
      showToast(`Harga kategori berhasil diperbarui ke ${formatRupiah(newPrice)}/kg`, 'success');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Kesalahan database' };
    }
  };

  // Get current user badges in a memoized list
  const activeUserBadges = useMemo(() => {
    if (!currentUser) return [];
    const ownedBadgeIds = nasabahBadges
      .filter((nb) => nb.nasabah_id === currentUser.id)
      .map((nb) => nb.badge_id);

    return INITIAL_BADGES.filter((b) => ownedBadgeIds.includes(b.id));
  }, [nasabahBadges, currentUser]);

  return (
    <div className="min-h-screen bg-neutral-0 font-sans flex flex-col antialiased selection:bg-brand-100 selection:text-brand-800">
      
      {/* Toast Notification element */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 border border-neutral-800 text-white rounded-lg p-4 shadow-lg pr-12 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-150">
          <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0" />
          <p className="text-xs font-medium leading-normal">{toastMessage.text}</p>
        </div>
      )}

      {/* ==========================================
          VISUAL VIEW STATE 1: GUEST ANONYMOUS AUTH PORTAL (SPLIT SCREENS)
          ========================================== */}
      {guestRole === 'guest' && (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-neutral-50">
          
          {/* Aesthetic corporate banner panel (Left on desktop) */}
          <div className="md:w-1/2 bg-neutral-900 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden bg-radial from-neutral-800 to-neutral-900">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/25 rounded-full px-3 py-1 text-xxs text-brand-400 font-semibold mb-6">
                🌱 Bank Sampah DKI Jakarta
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase font-sans">
                SMASH DIGITAL
              </h1>
              <p className="text-sm text-neutral-400 mt-3 max-w-sm leading-relaxed font-normal">
                Sistem Manajemen Sampah terintegrasi untuk mewujudkan Jakarta Bersih, Hijau, dan Berdaya Ekonomi secara digital.
              </p>
            </div>

            {/* Micro infographics indicators in splash screen */}
            <div className="space-y-4 pt-10 md:pt-0 z-10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">Pilah &amp; Setor</span>
                  <span className="text-xxs text-neutral-400 block mt-0.5">Bawa sampah kering terpilah Anda ke unit terdekat</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">Tukar Poin</span>
                  <span className="text-xxs text-neutral-400 block mt-0.5">Akumulasi poin timbangan bertambah real-time</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">Cairkan Saldo</span>
                  <span className="text-xxs text-neutral-400 block mt-0.5">Tarik dana ke GoPay, OVO, Dana, atau Bank DKI</span>
                </div>
              </div>
            </div>

            {/* Background vector elements */}
            <div className="absolute right-0 bottom-0 opacity-5 -mb-24 -mr-24 pointer-events-none scale-150">
              <Recycle className="h-96 w-96 text-white" />
            </div>
          </div>

          {/* Core interactive Form panel (Right on desktop) */}
          <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-lg p-6 md:p-8 shadow-xs">
              
              {/* Dynamic Header Auth selector */}
              <div className="text-center mb-6">
                <div className="h-10 w-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Recycle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
                  {authMode === 'login' ? 'Login Portal SMASH' : 'Daftar Anggota Nasabah'}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  {authMode === 'login' 
                    ? 'Masukkan email keanggotaan Anda untuk mengakses dashboard'
                    : 'Lengkapi formulir untuk mulai mengumpulkan poin lingkungan'}
                </p>
              </div>

              {/* LOGIN FORM VIEWS */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded p-2.5 flex items-center gap-1.5 leading-relaxed font-normal">
                      <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Terdaftar</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="e.g. nasabah@smash.id"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-10 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-neutral-600">Password</label>
                      <span className="text-3xs text-neutral-400 cursor-pointer hover:text-neutral-600 font-semibold uppercase tracking-wider">Lupa Sandi?</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Password min 8 karakter"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-10 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-login"
                    className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-6"
                  >
                    <LogIn className="h-4 w-4" /> Masuk ke Dashboard
                  </button>

                  <div className="pt-4 text-center border-t border-neutral-100 text-xs text-neutral-500">
                    Belum punya keanggotaan warga?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setLoginError(null);
                      }}
                      className="text-brand-600 font-bold hover:underline cursor-pointer"
                    >
                      Daftar Mandiri
                    </button>
                    
                    {/* Demo quick account access info credentials below */}
                    <div className="mt-5 text-4xs bg-neutral-50 border border-neutral-100/60 p-2.5 rounded text-left space-y-1 text-neutral-400 leading-relaxed font-mono">
                      <p className="font-semibold uppercase text-brand-600 tracking-wider">KUNCI AKSES DEMO:</p>
                      <p>• Nasabah: <span className="text-neutral-700">nasabah@smash.id</span> / <span className="text-neutral-700">nasabah123</span></p>
                      <p>• Admin: <span className="text-neutral-700">admin@smash.id</span> / <span className="text-neutral-700">admin123</span></p>
                    </div>
                  </div>
                </form>
              ) : (
                /* REGISTER SYSTEM SCREEN VIEW */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {registerError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded p-2.5 flex items-center gap-1.5 leading-relaxed font-normal">
                      <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Nama Lengkap Sesuai KTP</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Budi Santoso"
                        value={registerNama}
                        onChange={(e) => setRegisterNama(e.target.value)}
                        className="h-10 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Aktif</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="e.g. budi@gmail.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="h-10 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Domisili Kelurahan Jakarta</label>
                    <select
                      value={registerKelurahan}
                      onChange={(e) => setRegisterKelurahan(e.target.value)}
                      className="h-10 w-full border border-neutral-200 rounded-md px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer font-medium text-neutral-700"
                    >
                      <option value="Gambir">Gambir (Jakarta Pusat)</option>
                      <option value="Menteng">Menteng (Jakarta Pusat)</option>
                      <option value="Kebon Jeruk">Kebon Jeruk (Jakarta Barat)</option>
                      <option value="Tebet">Tebet (Jakarta Selatan)</option>
                      <option value="Kelapa Gading">Kelapa Gading (Jakarta Utara)</option>
                      <option value="Duren Sawit">Duren Sawit (Jakarta Timur)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Min 8 karakter"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="h-10 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Konfirmasi Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="Ulangi password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="h-10 w-full border border-neutral-200 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-register"
                    className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-6"
                  >
                    <UserPlus className="h-4 w-4" /> Daftar Akun Mandiri
                  </button>

                  <div className="pt-4 text-center border-t border-neutral-100 text-xs text-neutral-500">
                    Sudah terdaftar sebagai warga?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setRegisterError(null);
                      }}
                      className="text-brand-600 font-bold hover:underline cursor-pointer"
                    >
                      Login di sini
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          VISUAL VIEW STATE 2: CERTIFIED NASABAH PLATFORM
          ========================================== */}
      {guestRole === 'nasabah' && currentUser && (
        <div className="min-h-screen bg-neutral-50 w-full">
          {/* Mobile App Bar — fixed top, hanya mobile */}
          <MobileAppBar 
            title={nasabahTab === 'dashboard' ? undefined : (nasabahTab === 'saldo' ? 'Saldo Poin' : nasabahTab === 'riwayat' ? 'Riwayat Setor' : nasabahTab === 'dampak' ? 'Dampak Lingkungan' : nasabahTab === 'edukasi' ? 'Edukasi' : 'Peta Lokasi')} 
            showBack={nasabahTab !== 'dashboard'} 
            onBack={() => setNasabahTab('dashboard')} 
          />

          {/* Desktop Sidebar — hanya desktop */}
          <NasabahDesktopSidebar 
            currentTab={nasabahTab} 
            setTab={setNasabahTab} 
            onLogout={handleLogout} 
          />

          {/* Main Content */}
          <main
            className="pt-[calc(3.5rem+env(safe-area-inset-top)+1.25rem)] pb-[calc(4rem+env(safe-area-inset-bottom)+1.25rem)] px-4 md:ml-56 md:pt-0 md:pb-0 md:px-0"
          >
            {/* Desktop: inner wrapper dengan padding */}
            <div className="md:p-8 md:max-w-7xl md:mx-auto space-y-6">
              
              {nasabahTab === 'dashboard' && (
                <NasabahDashboard
                  profile={currentUser}
                  transactions={transactions.filter((t) => t.nasabah_id === currentUser.id)}
                  badges={activeUserBadges}
                  allBadges={INITIAL_BADGES}
                  setTab={setNasabahTab}
                  id="tab-nasabah-dashboard"
                />
              )}

              {nasabahTab === 'riwayat' && (
                <NasabahRiwayat
                  transactions={transactions.filter((t) => t.nasabah_id === currentUser.id)}
                  details={details}
                  categories={categories}
                  id="tab-nasabah-riwayat"
                />
              )}

              {nasabahTab === 'saldo' && (
                <NasabahSaldo
                  profile={currentUser}
                  transactions={transactions.filter((t) => t.nasabah_id === currentUser.id)}
                  id="tab-nasabah-saldo"
                />
              )}

              {nasabahTab === 'dampak' && (
                <NasabahDampak
                  transactions={transactions.filter((t) => t.nasabah_id === currentUser.id)}
                  details={details.filter((d) => {
                    const txMatch = transactions.find((t) => t.id === d.transaksi_id);
                    return txMatch && txMatch.nasabah_id === currentUser.id;
                  })}
                  categories={categories}
                  userLevel={currentUser.level}
                  id="tab-nasabah-dampak"
                />
              )}

              {nasabahTab === 'edukasi' && (
                <NasabahEdukasi
                  articles={articles}
                  id="tab-nasabah-edukasi"
                />
              )}

              {nasabahTab === 'peta' && (
                <NasabahPeta
                  id="tab-nasabah-peta"
                />
              )}

            </div>
          </main>

          {/* Mobile Bottom Nav — fixed bottom, hanya mobile */}
          <MobileBottomNav currentTab={nasabahTab} setTab={setNasabahTab} />
        </div>
      )}

      {/* ==========================================
          VISUAL VIEW STATE 3: AUDITED ADMINISTRATIVE PANEL
          ========================================== */}
      {guestRole === 'admin' && currentUser && (
        <div className="min-h-screen bg-neutral-50 w-full">
          {/* Mobile App Bar — fixed top, hanya mobile */}
          <AdminMobileAppBar 
            title={adminTab === 'dashboard' ? undefined : (adminTab === 'scan' ? 'Scan & Input' : adminTab === 'nasabah' ? 'Data Nasabah' : adminTab === 'harga' ? 'Kelola Harga' : 'Laporan Bank Sampah')} 
            showBack={adminTab !== 'dashboard'} 
            onBack={() => setAdminTab('dashboard')}
            adminName={currentUser.nama}
            onLogout={handleLogout}
          />

          {/* Desktop Sidebar — hanya desktop */}
          <AdminDesktopSidebar 
            currentTab={adminTab} 
            setTab={setAdminTab} 
            userNama={currentUser.nama}
            onLogout={handleLogout} 
          />

          {/* Main Content */}
          <main
            className="pt-[calc(3.5rem+env(safe-area-inset-top)+1.25rem)] pb-[calc(4rem+env(safe-area-inset-bottom)+1.25rem)] px-4 md:ml-56 md:pt-0 md:pb-0 md:px-0"
          >
            {/* Desktop: inner wrapper dengan padding */}
            <div className="md:p-8 md:max-w-7xl md:mx-auto space-y-6">
              
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  transactions={transactions}
                  profiles={profiles}
                  setTab={setAdminTab}
                  id="tab-admin-dashboard"
                />
              )}

              {adminTab === 'scan' && (
                <AdminScan
                  profiles={profiles}
                  categories={categories}
                  adminProfile={currentUser}
                  onSaveTransaction={handleSaveTransactionCallback}
                  id="tab-admin-scan"
                />
              )}

              {adminTab === 'nasabah' && (
                <AdminNasabah
                  profiles={profiles}
                  transactions={transactions}
                  id="tab-admin-nasabah"
                />
              )}

              {adminTab === 'harga' && (
                <AdminHarga
                  categories={categories}
                  onUpdateCategoryPrice={handleUpdateCategoryPriceCallback}
                  id="tab-admin-harga"
                />
              )}

              {adminTab === 'laporan' && (
                <AdminLaporan
                  transactions={transactions}
                  details={details}
                  categories={categories}
                  profiles={profiles}
                  id="tab-admin-laporan"
                />
              )}

            </div>
          </main>

          {/* Mobile Bottom Nav — fixed bottom, hanya mobile */}
          <AdminMobileBottomNav currentTab={adminTab} setTab={setAdminTab} />
        </div>
      )}

    </div>
  );
}
