import type { LucideProps } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, Users, User } from 'lucide-react';

interface NavTab {
  path: string;
  label: string;
  icon: React.FC<LucideProps>;
}

const tabs: NavTab[] = [
  { path: '/', label: '首頁', icon: Home },
  { path: '/local-setup', label: '遊戲', icon: Gamepad2 },
  { path: '/social', label: '社交', icon: Users },
  { path: '/profile', label: '我的', icon: User },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="主導覽"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden backdrop-blur-md border-t"
      style={{
        backgroundColor: 'var(--bg-dark)',
        borderTopColor: 'hsla(180, 100%, 50%, 0.3)',
        paddingBottom: 'calc(8px + var(--safe-bottom, 0px))',
      }}
    >
      <ul className="flex items-stretch">
        {tabs.map((tab: NavTab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <li key={tab.path} className="flex-1">
              <button
                type="button"
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                className="w-full flex flex-col items-center justify-center gap-1 py-2 min-h-[48px] transition-all duration-200"
                style={{
                  color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                  textShadow: active
                    ? '0 0 10px currentColor, 0 0 20px currentColor'
                    : 'none',
                }}
              >
                <Icon
                  className="w-5 h-5 transition-all duration-200"
                  style={{
                    filter: active
                      ? 'drop-shadow(0 0 6px var(--cyan-glow)) drop-shadow(0 0 12px var(--cyan-glow))'
                      : 'none',
                  }}
                />
                <span
                  className="text-[10px] tracking-wide font-medium"
                  style={{
                    textShadow: active
                      ? '0 0 8px currentColor, 0 0 16px currentColor'
                      : 'none',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
