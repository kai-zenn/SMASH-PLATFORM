import { Bell, ChevronLeft, Shield, LogOut } from 'lucide-react';

interface AdminMobileAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  adminName?: string;
  onLogout?: () => void;
}

export function AdminMobileAppBar({ title, showBack = false, onBack, adminName, onLogout }: AdminMobileAppBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-neutral-900 border-b border-neutral-800">
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors -ml-2 cursor-pointer text-neutral-300"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : null}
          {title ? (
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm tracking-tight">{title}</span>
              {adminName && (
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Admin: {adminName}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-5.5 h-5.5 bg-brand-500 rounded flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm tracking-tight leading-none">SMASH Admin</span>
                <span className="text-[9px] text-brand-400 font-bold tracking-wide mt-0.5 uppercase">Dashboard</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Action: Logout Button alongside indicator */}
        <div className="flex items-center gap-2">
          <div className="bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-brand-400">
            Pusat
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center rounded-full text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Keluar"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

