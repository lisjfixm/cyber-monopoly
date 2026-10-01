import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { monopoly, ranking } from '@client/src/api';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';

const OnlineJoinPage = () => {
  const navigate = useNavigate();
  const { visitorId } = usePlayerIdentity();
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const CODE_LEN = 6;
  const MAX_NAME_LEN = 10;
  const PWD_LEN = 4;

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, CODE_LEN);
    setRoomCode(value);
    setError('');
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_NAME_LEN) return;
    setPlayerName(value);
    setError('');
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, PWD_LEN);
    setPassword(value);
    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = playerName.trim();

    if (roomCode.length !== CODE_LEN) {
      setError('請輸入 6 位房間碼');
      return;
    }
    if (!name) {
      setError('請輸入你的暱稱');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 同步玩家身份到排行榜系統
      if (visitorId && name) {
        try {
          await ranking.rankingApi.getOrCreatePlayer(visitorId, name);
        } catch {
          // 忽略排行榜同步錯誤，不影響加入房間
        }
      }
      const pwd = password.length === PWD_LEN ? password : undefined;
      const result = await monopoly.monopolyApi.joinRoom(
        roomCode,
        name,
        visitorId,
        pwd,
      );
      navigate(`/online/room/${result.room.roomCode}?player=${result.playerIndex}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加入房間失敗';
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
      <div className="w-full max-w-md cyber-card p-6 md:p-8">
        <h2 className="font-cyber text-2xl md:text-3xl text-neon-pink text-center tracking-wider mb-2">
          加入房間
        </h2>
        <p className="text-center text-[var(--text-secondary)] text-sm mb-8 font-cyber tracking-wider">
          輸入房間碼 · 加入戰局
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider text-neon-cyan">
              房間碼
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={handleCodeChange}
              placeholder="請輸入 6 位數字房間碼"
              maxLength={CODE_LEN}
              inputMode="numeric"
              className="cyber-input text-center font-cyber text-2xl tracking-[0.3em]"
              style={{
                letterSpacing: '0.3em',
                borderColor: 'rgba(0, 255, 255, 0.4)',
              }}
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {roomCode.length}/{CODE_LEN}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider" style={{ color: 'var(--blue)' }}>
              玩家暱稱
            </label>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="輸入你的暱稱"
              maxLength={MAX_NAME_LEN}
              className="cyber-input"
              style={{
                borderColor: 'rgba(77, 195, 255, 0.4)',
                boxShadow: '0 0 8px rgba(77, 195, 255, 0.2)',
              }}
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {playerName.length}/{MAX_NAME_LEN}
            </div>
          </div>

          {/* 房間密碼（選填） */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider flex items-center gap-2" style={{ color: 'var(--yellow)' }}>
              <Lock size={14} />
              房間密碼（選填）
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="如房間有密碼請輸入"
              maxLength={PWD_LEN}
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
            <div className="text-right text-xs text-[var(--text-muted)]">
              {password.length}/{PWD_LEN}
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
            className="cyber-btn cyber-btn-pink w-full py-3 text-base"
          >
            {loading ? '加入中...' : '加入房間'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleBack}
          className="mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-pink transition-colors font-cyber tracking-wider"
        >
          ← 返回主選單
        </button>
      </div>
    </div>
  );
};

export default OnlineJoinPage;
