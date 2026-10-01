import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Users,
  MapPin,
  Trophy,
  Gamepad2,
  AlertTriangle,
  Shield,
  Lock,
} from 'lucide-react';
import { useTranslation } from '@client/src/i18n';
import {
  AntiCheatMonitor,
  type AntiCheatEvent,
  type AntiCheatLevel,
} from '@client/src/utils/anti-cheat';

const STORAGE_KEY = 'cyber_monopoly_admin_logged_in';
const ADMIN_PASSWORD = 'admin123';

// 模擬熱門地塊
const HOT_PROPERTIES = [
  { name: '高新園', visits: 15420 },
  { name: '重工區', visits: 14280 },
  { name: '企業樓', visits: 13150 },
  { name: '新城市', visits: 12080 },
  { name: '總部', visits: 11560 },
  { name: '主塔', visits: 10890 },
  { name: '富豪區', visits: 9720 },
  { name: '科技城', visits: 8650 },
  { name: '金融街', visits: 7580 },
  { name: '星光道', visits: 6420 },
];

// 模擬 12 職業勝率
const PROFESSION_STATS = [
  { name: '企業家', winRate: 58.2 },
  { name: '駭客', winRate: 55.6 },
  { name: '投資客', winRate: 53.8 },
  { name: '工程師', winRate: 51.2 },
  { name: '銀行家', winRate: 49.7 },
  { name: '賭神', winRate: 48.5 },
  { name: '律師', winRate: 47.3 },
  { name: '醫生', winRate: 45.9 },
  { name: '間諜', winRate: 44.2 },
  { name: '藝術家', winRate: 42.8 },
  { name: '科學家', winRate: 41.5 },
  { name: '流浪漢', winRate: 38.9 },
];

const LEVEL_COLORS: Record<AntiCheatLevel, string> = {
  warning: 'var(--yellow)',
  severe: 'var(--orange)',
  critical: 'var(--red)',
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [onlineCount, setOnlineCount] = useState<number>(1337);
  const [todayGames, setTodayGames] = useState<number>(3847);
  const [antiCheatLogs, setAntiCheatLogs] = useState<AntiCheatEvent[]>([]);

  // 檢查登入狀態
  useEffect(() => {
    try {
      const flag = localStorage.getItem(STORAGE_KEY);
      if (flag === 'true') {
        setLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // 線上人數模擬波動
  useEffect(() => {
    if (!loggedIn) return;
    const timer = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10; // -10 ~ +10
        const next = Math.max(1200, Math.min(1500, prev + delta));
        return next;
      });
      setTodayGames((prev) => {
        const delta = Math.floor(Math.random() * 5);
        return prev + delta;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [loggedIn]);

  // 讀取反作弊日誌
  useEffect(() => {
    if (!loggedIn) return;
    const monitor = AntiCheatMonitor.getInstance();
    setAntiCheatLogs(monitor.getEvents());

    // 定期刷新
    const timer = setInterval(() => {
      setAntiCheatLogs(monitor.getEvents());
    }, 3000);

    return () => clearInterval(timer);
  }, [loggedIn]);

  const handleLogin = useCallback((): void => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setError('');
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
    } else {
      setError(t('admin.wrongPassword'));
    }
  }, [password, t]);

  const maxVisits = useMemo(
    () => Math.max(...HOT_PROPERTIES.map((p) => p.visits)),
    [],
  );

  if (!loggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 scanlines bg-[var(--bg-deep)]">
        <div
          className="cyber-card w-full max-w-md p-6 md:p-8 relative overflow-hidden"
          style={{
            borderColor: 'var(--red)',
            boxShadow: '0 0 30px rgba(255, 0, 0, 0.2), inset 0 0 20px rgba(255, 0, 0, 0.05)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--red)] to-transparent" />

          <div className="text-center mb-6">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '2px solid var(--red)',
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.4)',
              }}
            >
              <Lock size={28} style={{ color: 'var(--red)' }} />
            </div>
            <h1
              className="font-cyber text-2xl tracking-wider"
              style={{ color: 'var(--red)', textShadow: '0 0 10px rgba(255,0,0,0.5)' }}
            >
              {t('admin.title')}
            </h1>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block text-xs font-cyber tracking-wider mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('admin.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
                placeholder={t('admin.passwordPlaceholder')}
                className="cyber-input w-full"
                style={{
                  borderColor: error ? 'var(--red)' : 'var(--border-neon)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--red)' }}>
                  <AlertTriangle size={12} />
                  {error}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="cyber-btn w-full py-3 font-cyber tracking-wider"
              style={{
                borderColor: 'var(--red)',
                color: 'var(--red)',
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
              }}
            >
              {t('admin.login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full scanlines bg-[var(--bg-deep)]">
      {/* Top Bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-neon)' }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ChevronLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1
          className="font-cyber text-xl md:text-2xl tracking-wider"
          style={{ color: 'var(--red)', textShadow: '0 0 8px rgba(255,0,0,0.5)' }}
        >
          <Shield size={20} className="inline mr-2" />
          {t('admin.title')}
        </h1>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* 第一行：在線人數 + 今日局數 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="cyber-card p-5 relative overflow-hidden"
            style={{
              borderColor: 'var(--cyan)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.05)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} style={{ color: 'var(--cyan)' }} />
              <h2
                className="font-cyber text-base tracking-wider"
                style={{ color: 'var(--cyan)' }}
              >
                {t('admin.onlineUsers')}
              </h2>
            </div>
            <div
              className="font-cyber text-4xl md:text-5xl tracking-widest pulse-glow"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 15px var(--cyan), 0 0 30px var(--cyan)',
              }}
            >
              {onlineCount.toLocaleString()}
            </div>
            <div className="absolute top-4 right-4">
              <span
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }}
              />
            </div>
          </div>

          <div
            className="cyber-card p-5 relative overflow-hidden"
            style={{
              borderColor: 'var(--pink)',
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.2), inset 0 0 10px rgba(255, 0, 255, 0.05)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Gamepad2 size={20} style={{ color: 'var(--pink)' }} />
              <h2
                className="font-cyber text-base tracking-wider"
                style={{ color: 'var(--pink)' }}
              >
                {t('admin.todayGames')}
              </h2>
            </div>
            <div
              className="font-cyber text-4xl md:text-5xl tracking-widest"
              style={{
                color: 'var(--pink)',
                textShadow: '0 0 15px var(--pink), 0 0 30px var(--pink)',
              }}
            >
              {todayGames.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 第二行：熱門地塊 + 職業統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 熱門地塊 */}
          <div
            className="cyber-card p-5"
            style={{
              borderColor: 'var(--yellow)',
              boxShadow: '0 0 15px rgba(255, 200, 0, 0.15), inset 0 0 10px rgba(255, 200, 0, 0.03)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={20} style={{ color: 'var(--yellow)' }} />
              <h2
                className="font-cyber text-base tracking-wider"
                style={{ color: 'var(--yellow)' }}
              >
                {t('admin.hotProperties')}
              </h2>
            </div>
            <div className="space-y-2">
              {HOT_PROPERTIES.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span
                    className="font-cyber text-xs w-5 text-right"
                    style={{ color: i < 3 ? 'var(--yellow)' : 'var(--text-muted)' }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    className="text-xs w-20 truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {p.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-mid)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(p.visits / maxVisits) * 100}%`,
                        background: `linear-gradient(90deg, var(--yellow), var(--orange))`,
                        boxShadow: '0 0 6px var(--yellow)',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-cyber w-12 text-right"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {p.visits.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 職業勝率 */}
          <div
            className="cyber-card p-5"
            style={{
              borderColor: 'var(--green)',
              boxShadow: '0 0 15px rgba(0, 255, 128, 0.15), inset 0 0 10px rgba(0, 255, 128, 0.03)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy size={20} style={{ color: 'var(--green)' }} />
              <h2
                className="font-cyber text-base tracking-wider"
                style={{ color: 'var(--green)' }}
              >
                {t('admin.professionStats')}
              </h2>
            </div>
            <div className="space-y-2">
              {PROFESSION_STATS.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span
                    className="font-cyber text-xs w-5 text-right"
                    style={{ color: i < 3 ? 'var(--green)' : 'var(--text-muted)' }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    className="text-xs w-20 truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {p.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-mid)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.winRate}%`,
                        background: `linear-gradient(90deg, var(--green), var(--cyan))`,
                        boxShadow: '0 0 6px var(--green)',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-cyber w-12 text-right"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {p.winRate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 第三行：反作弊記錄 */}
        <div
          className="cyber-card p-5"
          style={{
            borderColor: 'var(--red)',
            boxShadow: '0 0 15px rgba(255, 0, 0, 0.15), inset 0 0 10px rgba(255, 0, 0, 0.03)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={20} style={{ color: 'var(--red)' }} />
            <h2
              className="font-cyber text-base tracking-wider"
              style={{ color: 'var(--red)' }}
            >
              {t('admin.antiCheatLogs')}
            </h2>
            <span
              className="text-xs font-cyber px-2 py-0.5 rounded"
              style={{
                background: 'rgba(255, 0, 0, 0.1)',
                color: 'var(--red)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
              }}
            >
              {antiCheatLogs.length}
            </span>
          </div>

          {antiCheatLogs.length === 0 ? (
            <div
              className="text-center py-8 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('admin.noRecords')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left py-2 px-2 font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {t('admin.time')}
                    </th>
                    <th className="text-left py-2 px-2 font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {t('admin.level')}
                    </th>
                    <th className="text-left py-2 px-2 font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {t('admin.type')}
                    </th>
                    <th className="text-left py-2 px-2 font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {t('admin.details')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {antiCheatLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-cyber tracking-wider"
                          style={{
                            backgroundColor: `${LEVEL_COLORS[log.level]}20`,
                            color: LEVEL_COLORS[log.level],
                            border: `1px solid ${LEVEL_COLORS[log.level]}40`,
                          }}
                        >
                          {t(`admin.${log.level}`)}
                        </span>
                      </td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-primary)' }}>
                        {log.type}
                      </td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
