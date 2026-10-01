import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { User, Lock, Hash, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { useAccount } from '@client/src/hooks/useAccount';
import OAuthLoginButtons from '@client/src/components/OAuthLoginButtons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@client/src/components/ui/dialog';

type TabType = 'login' | 'register';

interface FormErrors {
  username?: string;
  nickname?: string;
  password?: string;
  confirmPassword?: string;
}

const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/;

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isLoading, isLoggedIn, updateProfile } = useAccount();

  const [tab, setTab] = useState<TabType>('login');
  const [username, setUsername] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [oauthError, setOauthError] = useState<string>('');
  const [showNicknameSetup, setShowNicknameSetup] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [nicknameSetupError, setNicknameSetupError] = useState<string>('');
  const [isSettingNickname, setIsSettingNickname] = useState<boolean>(false);

  // 從 URL 讀取 tab 參數與 OAuth 回調結果
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const oauthErrorParam = searchParams.get('oauth_error');
    if (tabParam === 'register' || tabParam === 'login') {
      setTab(tabParam);
    }
    if (oauthErrorParam) {
      setOauthError(decodeURIComponent(oauthErrorParam));
    }
  }, [searchParams.toString()]);

  // 已登入則跳回首頁
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const validateLogin = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) {
      newErrors.username = '請輸入帳號';
    } else if (!USERNAME_REGEX.test(username)) {
      newErrors.username = '帳號需為3-20位英文或數字';
    }

    if (!password) {
      newErrors.password = '請輸入密碼';
    } else if (password.length < 6) {
      newErrors.password = '密碼至少6位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, password]);

  const validateRegister = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) {
      newErrors.username = '請輸入帳號';
    } else if (!USERNAME_REGEX.test(username)) {
      newErrors.username = '帳號需為3-20位英文或數字';
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      newErrors.nickname = '請輸入暱稱';
    } else if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      newErrors.nickname = '暱稱需為2-20字';
    }

    if (!password) {
      newErrors.password = '請輸入密碼';
    } else if (password.length < 6) {
      newErrors.password = '密碼至少6位';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '請確認密碼';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '兩次密碼不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, nickname, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError('');

      const isValid = tab === 'login' ? validateLogin() : validateRegister();
      if (!isValid) return;

      try {
        if (tab === 'login') {
          await login(username.trim(), password);
        } else {
          await register(username.trim(), password, nickname.trim());
        }
      } catch (err) {
        const msg = (err as any)?.response?.data?.message
          || (err instanceof Error ? err.message : '操作失敗，請重試');
        setSubmitError(msg);
        logger.error('Auth submit failed', { error: err, tab });
      }
    },
    [tab, validateLogin, validateRegister, login, register, username, password, nickname],
  );

  const switchTab = (newTab: TabType) => {
    setTab(newTab);
    setErrors({});
    setSubmitError('');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleGuestContinue = () => {
    navigate('/');
  };

  const handleNicknameSetupSubmit = useCallback(async () => {
    const trimmed = nicknameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setNicknameSetupError('暱稱需為2-20字');
      return;
    }

    setIsSettingNickname(true);
    setNicknameSetupError('');
    try {
      await updateProfile({ nickname: trimmed });
      setShowNicknameSetup(false);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : '設置失敗，請重試';
      setNicknameSetupError(message);
      logger.error('Nickname setup failed', { error: err });
    } finally {
      setIsSettingNickname(false);
    }
  }, [nicknameInput, updateProfile, navigate]);

  // 生成霓虹粒子數據（純 CSS 動畫，不依賴圖片）
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 10,
        color: Math.random() > 0.5 ? 'cyan' : 'pink',
      })),
    [],
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* 背景漸層 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(0, 80, 120, 0.25), transparent 50%),'
            + 'radial-gradient(ellipse at 80% 70%, rgba(120, 0, 80, 0.2), transparent 50%),'
            + 'radial-gradient(ellipse at 50% 100%, rgba(80, 0, 120, 0.15), transparent 60%),'
            + 'linear-gradient(180deg, hsl(240, 30%, 4%) 0%, hsl(260, 25%, 6%) 50%, hsl(240, 20%, 5%) 100%)',
          zIndex: 0,
        }}
      />

      {/* 網格地面 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--cyan) 8%, transparent) 1px, transparent 1px),'
            + 'linear-gradient(90deg, color-mix(in srgb, var(--cyan) 8%, transparent) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          backgroundPosition: 'center bottom',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      {/* 霓虹粒子漂浮 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color === 'cyan' ? 'var(--cyan)' : 'var(--pink)',
            boxShadow:
              p.color === 'cyan'
                ? '0 0 6px var(--cyan-glow), 0 0 12px var(--cyan-glow)'
                : '0 0 6px var(--pink-glow), 0 0 12px var(--pink-glow)',
            opacity: 0.6,
            animation: `float-particle-${p.color} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            zIndex: 1,
          }}
        />
      ))}

      {/* 掃描線（加強流動感） */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient('
            + '0deg,'
            + 'rgba(0, 0, 0, 0.18),'
            + 'rgba(0, 0, 0, 0.18) 1px,'
            + 'transparent 1px,'
            + 'transparent 3px'
            + ')',
          animation: 'scanline-shift 8s linear infinite',
          zIndex: 10,
        }}
      />

      {/* 橫向掃描光 */}
      <div
        className="fixed inset-x-0 pointer-events-none"
        style={{
          top: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(0, 255, 255, 0.06), transparent)',
          animation: 'scan-sweep 6s ease-in-out infinite',
          zIndex: 11,
        }}
      />

      {/* 返回按鈕 */}
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-4 left-4 cyber-btn p-2 flex items-center gap-1 z-20 relative"
        style={{
          borderColor: 'var(--text-secondary)',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
        title="返回"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* 卡片外發光層 */}
        <div
          className="absolute -inset-px opacity-60 blur-md"
          style={{
            background:
              tab === 'login'
                ? 'linear-gradient(135deg, var(--cyan), transparent 40%, transparent 60%, var(--pink))'
                : 'linear-gradient(135deg, var(--pink), transparent 40%, transparent 60%, var(--cyan))',
            filter: 'blur(12px)',
            transition: 'all 0.5s ease',
          }}
        />
        <div
          className="relative"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98), rgba(10, 10, 20, 0.96))',
            border: `1px solid ${tab === 'login' ? 'var(--cyan)' : 'var(--pink)'}`,
            boxShadow:
              tab === 'login'
                ? '0 0 30px rgba(0, 255, 255, 0.35), 0 0 60px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 255, 255, 0.06)'
                : '0 0 30px rgba(255, 107, 157, 0.35), 0 0 60px rgba(255, 107, 157, 0.1), inset 0 0 30px rgba(255, 107, 157, 0.06)',
            backdropFilter: 'blur(10px)',
          }}
        >
        {/* 霓虹角飾 */}
        <div
          className="absolute -top-px -left-px w-6 h-6"
          style={{
            borderTop: '2px solid var(--cyan)',
            borderLeft: '2px solid var(--cyan)',
            boxShadow: '-3px -3px 8px rgba(0, 255, 255, 0.6)',
          }}
        />
        <div
          className="absolute -top-px -right-px w-6 h-6"
          style={{
            borderTop: '2px solid var(--cyan)',
            borderRight: '2px solid var(--cyan)',
            boxShadow: '3px -3px 8px rgba(0, 255, 255, 0.6)',
          }}
        />
        <div
          className="absolute -bottom-px -left-px w-6 h-6"
          style={{
            borderBottom: '2px solid var(--cyan)',
            borderLeft: '2px solid var(--cyan)',
            boxShadow: '-3px 3px 8px rgba(0, 255, 255, 0.6)',
          }}
        />
        <div
          className="absolute -bottom-px -right-px w-6 h-6"
          style={{
            borderBottom: '2px solid var(--cyan)',
            borderRight: '2px solid var(--cyan)',
            boxShadow: '3px 3px 8px rgba(0, 255, 255, 0.6)',
          }}
        />

        <div className="p-6 md:p-8">
          {/* Logo / 標題 */}
          <div className="text-center mb-8">
            <h1
              className="font-cyber text-3xl md:text-5xl font-bold tracking-widest"
              style={{
                color: 'var(--cyan)',
                textShadow:
                  '0 0 10px var(--cyan-glow), 0 0 20px var(--cyan-glow), 0 0 40px var(--cyan-glow), 0 0 80px rgba(0, 255, 255, 0.5)',
                animation: 'logo-pulse 3s ease-in-out infinite',
              }}
            >
              賽博大富翁
            </h1>
            <p
              className="mt-2 font-cyber text-xs md:text-sm tracking-[0.4em] uppercase"
              style={{
                color: 'var(--pink)',
                textShadow: '0 0 8px var(--pink-glow)',
                letterSpacing: '0.35em',
              }}
            >
              CYBER MONOPOLY
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--cyan)]" />
              <span>ACCOUNT</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--cyan)]" />
            </div>
          </div>

          {/* Tab 切換 */}
          <div className="flex mb-6 border-b" style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}>
            <button
              type="button"
              onClick={() => switchTab('login')}
              className="flex-1 py-3 text-sm font-cyber tracking-wider transition-all relative"
              style={{
                color: tab === 'login' ? 'var(--cyan)' : 'var(--text-secondary)',
              }}
            >
              登入
              {tab === 'login' && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: 'var(--cyan)',
                    boxShadow: '0 0 8px var(--cyan-glow)',
                  }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className="flex-1 py-3 text-sm font-cyber tracking-wider transition-all relative"
              style={{
                color: tab === 'register' ? 'var(--pink)' : 'var(--text-secondary)',
              }}
            >
              註冊
              {tab === 'register' && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: 'var(--pink)',
                    boxShadow: '0 0 8px var(--pink-glow)',
                  }}
                />
              )}
            </button>
          </div>

          {/* 提交錯誤提示 */}
          {submitError && (
            <div
              className="mb-4 p-3 text-sm font-cyber tracking-wide"
              style={{
                border: '1px solid var(--red)',
                color: 'var(--red)',
                background: 'rgba(255, 0, 0, 0.08)',
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
                textShadow: '0 0 5px rgba(255, 0, 0, 0.5)',
              }}
            >
              {submitError}
            </div>
          )}

          {/* oauth 錯誤提示 */}
          {oauthError && (
            <div
              className="mb-4 p-3 text-sm font-cyber tracking-wide"
              style={{
                border: '1px solid var(--red)',
                color: 'var(--red)',
                background: 'rgba(255, 0, 0, 0.08)',
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
                textShadow: '0 0 5px rgba(255, 0, 0, 0.5)',
              }}
            >
              {oauthError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 帳號 */}
            <div>
              <label
                className="block text-xs font-cyber tracking-wider mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                帳號
              </label>
              <div
                className={`relative flex items-center cyber-input-group ${errors.username ? 'cyber-input-group-error' : ''}`}
              >
                <User
                  size={16}
                  className="absolute left-3"
                  style={{ color: errors.username ? 'var(--red)' : 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3-20位英文或數字"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p
                  className="mt-1 text-xs font-cyber"
                  style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* 暱稱（僅註冊） */}
            {tab === 'register' && (
              <div>
                <label
                  className="block text-xs font-cyber tracking-wider mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  暱稱
                </label>
                <div
                  className={`relative flex items-center cyber-input-group ${errors.nickname ? 'cyber-input-group-error' : ''}`}
                >
                  <Hash
                    size={16}
                    className="absolute left-3"
                    style={{ color: errors.nickname ? 'var(--red)' : 'var(--text-secondary)' }}
                  />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="2-20字"
                    className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    autoComplete="nickname"
                  />
                </div>
                {errors.nickname && (
                  <p
                    className="mt-1 text-xs font-cyber"
                    style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
                  >
                    {errors.nickname}
                  </p>
                )}
              </div>
            )}

            {/* 密碼 */}
            <div>
              <label
                className="block text-xs font-cyber tracking-wider mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                密碼
              </label>
              <div
                className={`relative flex items-center cyber-input-group ${errors.password ? 'cyber-input-group-error' : ''}`}
              >
                <Lock
                  size={16}
                  className="absolute left-3"
                  style={{ color: errors.password ? 'var(--red)' : 'var(--text-secondary)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位"
                  className="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 p-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p
                  className="mt-1 text-xs font-cyber"
                  style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* 確認密碼（僅註冊） */}
            {tab === 'register' && (
              <div>
                <label
                  className="block text-xs font-cyber tracking-wider mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  確認密碼
                </label>
                <div
                  className={`relative flex items-center cyber-input-group ${errors.confirmPassword ? 'cyber-input-group-error' : ''}`}
                >
                  <Lock
                    size={16}
                    className="absolute left-3"
                    style={{
                      color: errors.confirmPassword ? 'var(--red)' : 'var(--text-secondary)',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次輸入密碼"
                    className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p
                    className="mt-1 text-xs font-cyber"
                    style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
                  >
                    {errors.confirmPassword}
                  </p>
                )}
                {!errors.confirmPassword && confirmPassword.length > 0 && (
                  <p
                    className="mt-1 text-xs font-cyber"
                    style={{
                      color: password === confirmPassword ? 'var(--green)' : 'var(--red)',
                      textShadow: password === confirmPassword
                        ? '0 0 4px rgba(0, 255, 128, 0.5)'
                        : '0 0 4px rgba(255, 0, 0, 0.5)',
                    }}
                  >
                    {password === confirmPassword ? '確認 密碼一致' : '兩次密碼不一致'}
                  </p>
                )}
              </div>
            )}

            {/* 忘記密碼（僅登入） */}
            {tab === 'login' && (
              <div className="text-right">
                <span
                  className="text-xs font-cyber tracking-wide cursor-default"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  忘記密碼請聯繫管理員
                </span>
              </div>
            )}

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-base font-cyber tracking-widest transition-all mt-2 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                border: `1px solid ${tab === 'login' ? 'var(--cyan)' : 'var(--pink)'}`,
                color: tab === 'login' ? 'var(--cyan)' : 'var(--pink)',
                background:
                  tab === 'login'
                    ? 'linear-gradient(180deg, rgba(0, 255, 255, 0.15), rgba(0, 255, 255, 0.05))'
                    : 'linear-gradient(180deg, rgba(255, 107, 157, 0.15), rgba(255, 107, 157, 0.05))',
                boxShadow:
                  tab === 'login'
                    ? '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1)'
                    : '0 0 20px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.2), inset 0 0 15px rgba(255, 107, 157, 0.1)',
                textShadow: `0 0 10px ${tab === 'login' ? 'var(--cyan-glow)' : 'var(--pink-glow)'}`,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (isLoading) return;
                const el = e.currentTarget;
                el.style.boxShadow =
                  tab === 'login'
                    ? '0 0 30px rgba(0, 255, 255, 0.7), 0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.15)'
                    : '0 0 30px rgba(255, 107, 157, 0.7), 0 0 60px rgba(255, 107, 157, 0.3), inset 0 0 20px rgba(255, 107, 157, 0.15)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow =
                  tab === 'login'
                    ? '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1)'
                    : '0 0 20px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.2), inset 0 0 15px rgba(255, 107, 157, 0.1)';
              }}
            >
              {isLoading ? '處理中...' : tab === 'login' ? '登入' : '註冊'}
            </button>
          </form>

          {/* 第三方登入分隔 */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,255,255,0.3))' }} />
            <span
              className="text-xs font-cyber tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              或使用第三方登入
            </span>
            <span className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(0,255,255,0.3))' }} />
          </div>

          {/* 第三方登入按鈕 */}
          <OAuthLoginButtons disabled={isLoading} />

          {/* 訪客入口 */}
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={handleGuestContinue}
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-cyber tracking-wide transition-all flex items-center justify-center gap-2 rounded-sm"
              style={{
                border: '1px dashed var(--text-secondary)',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.02)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (isLoading) return;
                const el = e.currentTarget;
                el.style.borderColor = 'var(--cyan)';
                el.style.color = 'var(--cyan)';
                el.style.boxShadow = '0 0 12px rgba(0, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--text-secondary)';
                el.style.color = 'var(--text-secondary)';
                el.style.boxShadow = 'none';
              }}
            >
              <UserPlus size={18} />
              <span>遊客試玩</span>
            </button>
            <p
              className="mt-2 text-center text-xs font-cyber tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              無需註冊即可體驗，資料僅保存於本機
            </p>
          </div>
        </div>
        </div>

        {/* 底部裝飾線 */}
        <div
          className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{
            background: tab === 'login'
              ? 'linear-gradient(to right, transparent, var(--cyan), transparent)'
              : 'linear-gradient(to right, transparent, var(--pink), transparent)',
            boxShadow: tab === 'login'
              ? '0 0 10px var(--cyan-glow)'
              : '0 0 10px var(--pink-glow)',
          }}
        />
      </div>

      {/* 底部版權資訊 */}
      <div
        className="absolute bottom-4 left-0 right-0 text-center z-20"
        style={{ color: 'var(--text-muted)' }}
      >
        <p className="text-[10px] font-cyber tracking-widest">
          © 2026 CYBER MONOPOLY · 賽博大富翁 · ALL RIGHTS RESERVED
        </p>
        <p className="text-[9px] mt-1 tracking-wide" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          本遊戲純屬虛構，請勿沉迷 · 版本 v1.3.0
        </p>
      </div>

      {/* 首次設置暱稱彈窗 */}
      <Dialog open={showNicknameSetup} onOpenChange={setShowNicknameSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>設定你的暱稱</DialogTitle>
            <DialogDescription>
              這是你在賽博大富翁中的顯示名稱，之後可隨時在個人資料中修改。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label
                className="block text-xs font-cyber tracking-wider mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                暱稱
              </label>
              <div
                className={`relative flex items-center cyber-input-group ${nicknameSetupError ? 'cyber-input-group-error' : ''}`}
              >
                <Hash
                  size={16}
                  className="absolute left-3"
                  style={{ color: nicknameSetupError ? 'var(--red)' : 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="2-20字"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  autoFocus
                />
              </div>
              {nicknameSetupError && (
                <p
                  className="mt-1 text-xs font-cyber"
                  style={{ color: 'var(--red)', textShadow: '0 0 4px rgba(255,0,0,0.5)' }}
                >
                  {nicknameSetupError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleNicknameSetupSubmit}
              disabled={isSettingNickname}
              className="px-6 py-2 text-sm font-cyber tracking-wider transition-all"
              style={{
                border: '1px solid var(--cyan)',
                color: 'var(--cyan)',
                background: 'rgba(0, 255, 255, 0.1)',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 8px rgba(0, 255, 255, 0.1)',
                textShadow: '0 0 6px var(--cyan-glow)',
                cursor: isSettingNickname ? 'not-allowed' : 'pointer',
                opacity: isSettingNickname ? 0.6 : 1,
              }}
            >
              {isSettingNickname ? '設定中...' : '確認並進入'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
