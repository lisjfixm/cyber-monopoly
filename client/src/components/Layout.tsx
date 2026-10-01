import { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { WifiOff } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';

const Layout = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[var(--bg-deep)] text-[var(--text-primary)] overflow-x-hidden grid-bg relative">
      <div className="theme-bg-effect absolute inset-0 pointer-events-none overflow-hidden" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[var(--bg-deep)]/80" />

      {/* 离线提示横幅 */}
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(90deg, rgba(255,0,100,0.9), rgba(255,0,200,0.9))',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(255, 0, 150, 0.5)',
            animation: 'slide-down 0.3s ease-out',
          }}
        >
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-cyber tracking-wide">
            目前處於離線狀態，聯機模式不可用
          </span>
        </div>
      )}

      <div className="relative z-10 pb-16 md:pb-0">
        <div key={location.pathname} className="page-enter w-full min-h-full">
          <Outlet />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );};

export default Layout;
