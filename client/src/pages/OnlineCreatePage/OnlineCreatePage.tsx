import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Swords, Lock, Globe, Timer } from 'lucide-react';
import { monopoly, ranking } from '@client/src/api';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import type { GameMode } from '@shared/api.interface';
import { TURN_TIME_OPTIONS } from '@shared/game-config';

const PLAYER_OPTIONS = [2, 4, 6];

const MODE_OPTIONS: { value: GameMode; label: string; desc: string; icon: typeof Zap }[] = [
  { value: 'classic', label: '經典模式', desc: '標準大富翁規則', icon: Users },
  { value: 'fast', label: '快速模式', desc: '低本金·高節奏', icon: Zap },
  { value: 'crazy', label: '瘋狂模式', desc: '高風險·高回報', icon: Swords },
];

const OnlineCreatePage = () => {
  const navigate = useNavigate();
  const { visitorId } = usePlayerIdentity();
  const [hostName, setHostName] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [blindAuction, setBlindAuction] = useState<boolean>(false);
  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(0);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const MAX_LEN = 10;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_LEN) return;
    setHostName(value);
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = hostName.trim();

    if (!name) {
      setError('請輸入你的暱稱');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 同步玩家身份到排行榜系统
      if (visitorId && name) {
        try {
          await ranking.rankingApi.getOrCreatePlayer(visitorId, name);
        } catch {
          // 忽略排行榜同步錯誤，不影響建立房間
        }
      }
      const pwd = password.length === 4 ? password : undefined;
      const room = await monopoly.monopolyApi.createRoom(
        name,
        maxPlayers,
        gameMode,
        visitorId,
        pwd,
        isPublic,
        blindAuction ? 'blind' : undefined,
        turnTimeLimit > 0 ? turnTimeLimit : undefined,
      );
      navigate(`/online/room/${room.roomCode}?player=0`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '建立房間失敗';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative">
      <div className="w-full max-w-lg cyber-card p-6 md:p-8">
        <h2 className="font-cyber text-2xl md:text-3xl text-neon-purple text-center tracking-wider mb-2">
          建立房間
        </h2>
        <p className="text-center text-[var(--text-secondary)] text-sm mb-8 font-cyber tracking-wider">
          建立戰局 · 邀請對手
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 人數選擇 */}
          <div className="space-y-3">
            <label className="block font-cyber text-sm tracking-wider" style={{ color: 'var(--cyan)' }}>
              玩家人數
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {PLAYER_OPTIONS.map((count) => {
                const selected = maxPlayers === count;
                return (
                  <button
                    type="button"
                    key={count}
                    onClick={() => setMaxPlayers(count)}
                    className="cyber-btn py-4 md:py-5 flex flex-col items-center gap-1 transition-all"
                    style={{
                      borderColor: selected ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)',
                      color: selected ? 'var(--cyan)' : 'var(--text-secondary)',
                      background: selected ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                      boxShadow: selected ? '0 0 16px rgba(0, 255, 255, 0.3), inset 0 0 12px rgba(0, 255, 255, 0.1)' : 'none',
                    }}
                  >
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="font-cyber text-base md:text-lg tracking-wider">
                      {count}人
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 模式選擇 */}
          <div className="space-y-3">
            <label className="block font-cyber text-sm tracking-wider" style={{ color: 'var(--pink)' }}>
              遊戲模式
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {MODE_OPTIONS.map((mode) => {
                const selected = gameMode === mode.value;
                const IconComp = mode.icon;
                return (
                  <button
                    type="button"
                    key={mode.value}
                    onClick={() => setGameMode(mode.value)}
                    className="cyber-btn py-3 md:py-4 flex flex-col items-center gap-1 transition-all text-center px-1"
                    style={{
                      borderColor: selected ? 'var(--pink)' : 'rgba(255, 107, 157, 0.2)',
                      color: selected ? 'var(--pink)' : 'var(--text-secondary)',
                      background: selected ? 'rgba(255, 107, 157, 0.08)' : 'transparent',
                      boxShadow: selected ? '0 0 16px rgba(255, 107, 157, 0.3), inset 0 0 12px rgba(255, 107, 157, 0.08)' : 'none',
                    }}
                  >
                    <IconComp className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="font-cyber text-xs md:text-sm tracking-wider">
                      {mode.label}
                    </span>
                    <span className="text-[10px] md:text-xs opacity-70 leading-tight">
                      {mode.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 暱稱輸入 */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider" style={{ color: 'var(--purple)' }}>
              你的暱稱
            </label>
            <input
              type="text"
              value={hostName}
              onChange={handleChange}
              placeholder="輸入你的暱稱"
              maxLength={MAX_LEN}
              className="cyber-input"
              style={{
                borderColor: 'rgba(168, 85, 247, 0.4)',
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.2)',
              }}
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {hostName.length}/{MAX_LEN}
            </div>
          </div>

          {/* 公開房間開關 */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider" style={{ color: 'var(--cyan)' }}>
              公開房間
            </label>
            <button
              type="button"
              onClick={() => setIsPublic((prev) => !prev)}
              className="cyber-btn w-full py-3 px-4 flex items-center justify-between text-sm font-cyber tracking-wider transition-all"
              style={{
                borderColor: isPublic ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)',
                color: isPublic ? 'var(--cyan)' : 'var(--text-secondary)',
                background: isPublic ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                boxShadow: isPublic ? '0 0 12px rgba(0, 255, 255, 0.2)' : 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <Globe size={16} />
                {isPublic ? '開啟（所有人可見）' : '關閉（僅邀請）'}
              </span>
              <span
                className="w-10 h-5 rounded-full relative transition-colors"
                style={{
                  backgroundColor: isPublic ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.15)',
                  boxShadow: isPublic ? '0 0 8px rgba(0, 255, 255, 0.5)' : 'none',
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    backgroundColor: 'var(--bg-deep)',
                    left: isPublic ? 'calc(100% - 18px)' : '2px',
                  }}
                />
              </span>
            </button>
          </div>

          {/* 暗拍模式開關 */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider" style={{ color: 'var(--purple)' }}>
              暗拍模式
            </label>
            <button
              type="button"
              onClick={() => setBlindAuction((prev) => !prev)}
              className="cyber-btn w-full py-3 px-4 flex items-center justify-between text-sm font-cyber tracking-wider transition-all"
              style={{
                borderColor: blindAuction ? 'var(--purple)' : 'rgba(168, 85, 247, 0.2)',
                color: blindAuction ? 'var(--purple)' : 'var(--text-secondary)',
                background: blindAuction ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                boxShadow: blindAuction ? '0 0 12px rgba(168, 85, 247, 0.3)' : 'none',
              }}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-cyber" style={{ color: 'var(--purple)' }}>匿名</span>
                {blindAuction ? '開啟（秘密出價）' : '關閉（公開競標）'}
              </span>
              <span
                className="w-10 h-5 rounded-full relative transition-colors"
                style={{
                  backgroundColor: blindAuction ? 'var(--purple)' : 'rgba(255, 255, 255, 0.15)',
                  boxShadow: blindAuction ? '0 0 8px rgba(168, 85, 247, 0.5)' : 'none',
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    backgroundColor: 'var(--bg-deep)',
                    left: blindAuction ? 'calc(100% - 18px)' : '2px',
                  }}
                />
              </span>
            </button>
          </div>

          {/* 回合倒計時 */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider flex items-center gap-2" style={{ color: 'var(--cyan)' }}>
              <Timer size={14} />
              回合倒計時
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {TURN_TIME_OPTIONS.map((opt) => {
                const selected = turnTimeLimit === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setTurnTimeLimit(opt.value)}
                    className="cyber-btn py-3 flex flex-col items-center gap-1 transition-all"
                    style={{
                      borderColor: selected ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)',
                      color: selected ? 'var(--cyan)' : 'var(--text-secondary)',
                      background: selected ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                      boxShadow: selected ? '0 0 16px rgba(0, 255, 255, 0.3), inset 0 0 12px rgba(0, 255, 255, 0.1)' : 'none',
                    }}
                  >
                    <span className="font-cyber text-sm tracking-wider">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {turnTimeLimit > 0 ? `倒計時結束將自動擲骰` : '無時間限制，玩家可慢慢思考'}
            </div>
          </div>

          {/* 房間密碼 */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider flex items-center gap-2" style={{ color: 'var(--yellow)' }}>
              <Lock size={14} />
              房間密碼（選填）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPassword(val);
                setError('');
              }}
              placeholder="4 位數字密碼"
              maxLength={4}
              inputMode="numeric"
              className="cyber-input font-mono tracking-[0.3em] text-center"
              style={{
                borderColor: 'rgba(255, 200, 0, 0.3)',
                boxShadow: password ? '0 0 8px rgba(255, 200, 0, 0.2)' : 'none',
                color: 'var(--yellow)',
                letterSpacing: '0.3em',
                paddingLeft: '0.75em',
              }}
            />
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>設定密碼後，其他人需要輸入密碼才能加入</span>
              <span>{password.length}/4</span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-center" style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn w-full py-3 text-base font-cyber tracking-wider"
            style={{
              borderColor: 'var(--purple)',
              color: 'var(--purple)',
              background: 'rgba(168, 85, 247, 0.08)',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.3)',
            }}
          >
            {loading ? '建立中...' : '建立房間'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleBack}
          className="mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-purple transition-colors font-cyber tracking-wider"
        >
          ← 返回主選單
        </button>
      </div>
    </div>
  );
};

export default OnlineCreatePage;
