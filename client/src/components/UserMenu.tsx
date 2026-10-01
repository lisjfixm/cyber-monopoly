import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAccount, getGuestNickname } from '@client/src/hooks/useAccount';

const UserMenu = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { account, isLoggedIn, logout } = useAccount();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const guestNickname = getGuestNickname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogin = () => {
    setOpen(false);
    navigate('/login?tab=login');
  };

  const handleRegister = () => {
    setOpen(false);
    navigate('/login?tab=register');
  };

  const handleProfile = () => {
    setOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const displayName = isLoggedIn ? account?.nickname : guestNickname || '遊客';
  const accentColor = isLoggedIn ? 'var(--cyan)' : 'var(--text-secondary)';
  const glowColor = isLoggedIn ? 'rgba(0, 255, 255, 0.4)' : 'transparent';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="cyber-btn flex items-center gap-2 px-3 py-2"
        style={{
          borderColor: accentColor,
          color: accentColor,
          background: isLoggedIn ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255,255,255,0.03)',
          boxShadow: isLoggedIn ? `0 0 10px ${glowColor}` : 'none',
        }}
        title={displayName}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{
            background: isLoggedIn
              ? 'linear-gradient(135deg, var(--cyan), var(--pink))'
              : 'rgba(255,255,255,0.1)',
            color: isLoggedIn ? 'var(--bg-deep)' : 'var(--text-secondary)',
            boxShadow: isLoggedIn ? '0 0 8px var(--cyan-glow)' : 'none',
          }}
        >
          {isLoggedIn ? (
            <span className="font-bold text-xs">{displayName?.[0] || '?'}</span>
          ) : (
            <User size={14} />
          )}
        </div>
        <span className="hidden md:inline text-sm font-cyber tracking-wide">
          {displayName}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[160px] z-50 rounded-sm overflow-hidden"
          style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--cyan)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
          }}
        >
          {isLoggedIn ? (
            <>
              <div
                className="px-4 py-3 border-b"
                style={{
                  borderColor: 'rgba(0, 255, 255, 0.2)',
                  background: 'rgba(0, 255, 255, 0.05)',
                }}
              >
                <div
                  className="font-cyber text-sm tracking-wide"
                  style={{ color: 'var(--cyan)' }}
                >
                  {account?.nickname}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  等級 {account?.level ?? 1} · {account?.elo ?? 0} ELO
                </div>
              </div>
              <button
                type="button"
                onClick={handleProfile}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-[var(--cyan)]/10"
                style={{ color: 'var(--text-primary)' }}
              >
                <UserCircle size={16} style={{ color: 'var(--cyan)' }} />
                <span className="font-cyber tracking-wide">個人資料</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-[var(--red)]/10"
                style={{ color: 'var(--red)' }}
              >
                <LogOut size={16} />
                <span className="font-cyber tracking-wide">登出</span>
              </button>
            </>
          ) : (
            <>
              <div
                className="px-4 py-3 border-b"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  className="font-cyber text-sm tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  遊客模式
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  登入後資料同步至雲端
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogin}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-[var(--cyan)]/10"
                style={{ color: 'var(--cyan)' }}
              >
                <LogIn size={16} />
                <span className="font-cyber tracking-wide">登入</span>
              </button>
              <button
                type="button"
                onClick={handleRegister}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-[var(--pink)]/10"
                style={{ color: 'var(--pink)' }}
              >
                <UserCircle size={16} />
                <span className="font-cyber tracking-wide">註冊</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
