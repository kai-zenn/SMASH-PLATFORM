import { LayoutDashboard, QrCode, Users, Tags, FileText } from 'lucide-react';

const adminNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'scan', icon: QrCode, label: 'Scan' },
  { id: 'nasabah', icon: Users, label: 'Nasabah' },
  { id: 'harga', icon: Tags, label: 'Harga' },
  { id: 'laporan', icon: FileText, label: 'Laporan' },
];

interface AdminMobileBottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export function AdminMobileBottomNav({ currentTab, setTab }: AdminMobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-neutral-100">
      <div className="flex items-center justify-around h-16 px-1">
        {adminNavItems.map(({ id, icon: Icon, label }) => {
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
