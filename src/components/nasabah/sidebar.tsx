import { LayoutDashboard, History, Wallet, Leaf, BookOpen, MapPin, LogOut } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  userNama: string;
  userLevel: string;
  onLogout: () => void;
  id?: string;
}

export function NasabahSidebar({ currentTab, setTab, userNama, userLevel, onLogout, id }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'riwayat', label: 'Riwayat Setor', icon: History },
    { id: 'saldo', label: 'Saldo Poin', icon: Wallet },
    { id: 'dampak', label: 'Dampak Lingkungan', icon: Leaf },
    { id: 'edukasi', label: 'Edukasi', icon: BookOpen },
    { id: 'peta', label: 'Peta Lokasi', icon: MapPin, isDemo: true },
  ];

  return (
    <div
      id={id}
      className="w-16 md:w-60 bg-neutral-900 text-neutral-300 flex flex-col justify-between h-screen sticky top-0 border-r border-neutral-800 transition-all duration-300 flex-shrink-0"
    >
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="p-4 md:p-6 border-b border-neutral-800 flex items-center gap-2">
          <div className="bg-brand-500 text-white rounded-md p-1.5 flex items-center justify-center font-bold text-lg w-8 h-8">
            S
          </div>
          <span className="hidden md:inline font-bold text-xl text-white tracking-wider">
            SMASH
          </span>
        </div>

        {/* User Info Section (Only visible on desktop) */}
        <div className="p-4 border-b border-neutral-800 hidden md:block">
          <p className="text-xs text-neutral-500">Nasabah</p>
          <p className="font-medium text-white truncate text-sm mt-0.5">{userNama}</p>
          <div className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full px-2.5 py-0.5 text-xxs font-medium mt-2">
            🌱 {userLevel}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 md:p-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500 pl-2.5'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-brand-500' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                <span className="hidden md:inline truncate">{item.label}</span>
                {item.isDemo && (
                  <span className="hidden md:inline-block bg-amber-500/10 text-amber-500 text-xxs font-bold px-1.5 py-0.5 rounded ml-auto scale-90">
                    Demo
                  </span>
                )}
                
                {/* Tooltip for collapsed sidebar */}
                <div className="md:hidden absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                  {item.label} {item.isDemo ? '(Demo)' : ''}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-2 md:p-4 border-t border-neutral-800">
        <button
          onClick={onLogout}
          id="btn-sidebar-logout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group relative"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-red-400" />
          <span className="hidden md:inline">Keluar</span>
          
          <div className="md:hidden absolute left-full ml-2 px-2 py-1 bg-red-950 text-red-300 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md border border-red-900">
            Keluar
          </div>
        </button>
      </div>
    </div>
  );
}
