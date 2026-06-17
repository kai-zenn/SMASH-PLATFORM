import { Home, ClipboardList, Leaf, BookOpen, Wallet } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Beranda' },
  { id: 'riwayat', icon: ClipboardList, label: 'Riwayat' },
  { id: 'dampak', icon: Leaf, label: 'Dampak' },
  { id: 'edukasi', icon: BookOpen, label: 'Edukasi' },
  { id: 'saldo', icon: Wallet, label: 'Saldo' },
];

interface MobileBottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export function MobileBottomNav({ currentTab, setTab }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-neutral-100">
      {/* Container framing items */}
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0 transition-colors cursor-pointer select-none touch-manipulation ${
                isActive
                  ? 'text-brand-500'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
              style={{ minHeight: '44px' }}
            >
              <Icon
                className={`w-5.5 h-5.5 flex-shrink-0 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`}
              />
              <span className={`text-[10px] font-medium truncate tracking-tight ${isActive ? 'font-semibold text-brand-600' : 'text-neutral-500'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iPhone indicator notch */}
      <div className="h-safe-area-inset-bottom bg-white" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
