import { LayoutDashboard, QrCode, Users, Tags, FileText, LogOut, Shield } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scan', label: 'Scan & Input Transaksi', icon: QrCode },
  { id: 'nasabah', label: 'Data Nasabah', icon: Users },
  { id: 'harga', label: 'Kelola Harga Sampah', icon: Tags },
  { id: 'laporan', label: 'Laporan Rekapitulasi', icon: FileText },
];

interface AdminDesktopSidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  userNama: string;
  onLogout: () => void;
}

export function AdminDesktopSidebar({ currentTab, setTab, userNama, onLogout }: AdminDesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-neutral-900 border-r border-neutral-800 text-neutral-300 fixed left-0 top-0 bottom-0 z-40">
      {/* Header Container Branding */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-800 flex-shrink-0">
        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
          <Shield className="text-white w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-white text-sm tracking-tight leading-none">SMASH Admin</span>
          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1">Pusat Control</span>
        </div>
      </div>

      {/* Profile info area */}
      <div className="px-5 py-4 border-b border-neutral-800 flex-shrink-0">
        <p className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wide">Administrator</p>
        <p className="text-xs font-bold text-white truncate mt-0.5">{userNama}</p>
        <span className="inline-block mt-2 text-[10px] text-brand-400 font-bold bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
          ● Petugas Aktif
        </span>
      </div>

      {/* Navigation Links list */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group cursor-pointer w-full text-left font-sans select-none ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 font-bold border-l-2 border-brand-500 pl-2.5'
                  : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Action area */}
      <div className="px-3 py-4 border-t border-neutral-800 flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group cursor-pointer font-medium text-left"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-neutral-550 group-hover:text-red-400" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
