import { Home, ClipboardList, Leaf, BookOpen, LogOut, MapPin, Wallet } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Beranda' },
  { id: 'riwayat', icon: ClipboardList, label: 'Riwayat Setor' },
  { id: 'saldo', icon: Wallet, label: 'Saldo Poin' },
  { id: 'dampak', icon: Leaf, label: 'Dampak Lingkungan' },
  { id: 'edukasi', icon: BookOpen, label: 'Edukasi' },
  { id: 'peta', icon: MapPin, label: 'Peta Lokasi', isDemo: true },
];

interface DesktopSidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
}

export function NasabahDesktopSidebar({ currentTab, setTab, onLogout }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-neutral-100 fixed left-0 top-0 bottom-0 z-40">
      {/* Header Container Branding */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-neutral-100 flex-shrink-0">
        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">S</span>
        </div>
        <span className="font-extrabold text-neutral-900 text-base tracking-tight">SMASH</span>
      </div>

      {/* Nav list structure */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, icon: Icon, label, isDemo }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group cursor-pointer w-full text-left font-sans select-none ${
                isActive
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-500' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
              <span className="truncate">{label}</span>
              {isDemo && (
                <span className="ml-auto text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action area */}
      <div className="px-3 py-4 border-t border-neutral-100 flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-neutral-600 hover:bg-red-50 hover:text-red-650 transition-colors group cursor-pointer font-medium text-left"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-neutral-400 group-hover:text-red-400" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
