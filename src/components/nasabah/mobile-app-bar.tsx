import { Bell, ChevronLeft } from 'lucide-react';

interface MobileAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function MobileAppBar({ title, showBack = false, onBack }: MobileAppBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white border-b border-neutral-100">
      {/* Safe area inset header spacing */}
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-150 transition-colors -ml-2 cursor-pointer"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700" />
            </button>
          ) : null}
          {title ? (
            <span className="font-semibold text-neutral-900 text-sm tracking-tight">{title}</span>
          ) : (
            <span className="font-extrabold text-brand-500 text-lg tracking-tight">SMASH</span>
          )}
        </div>
        
        {/* Secondary feature alert bell */}
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors relative cursor-pointer"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <Bell className="w-5 h-5 text-neutral-600" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  );
}
