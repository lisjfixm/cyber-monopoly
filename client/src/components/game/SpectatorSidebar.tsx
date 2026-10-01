import React from 'react';
import { Eye, User, Crown } from 'lucide-react';

export interface SpectatorInfo {
  id: string;
  nickname: string;
  following?: number;
}

export interface SpectatorSidebarProps {
  spectators: SpectatorInfo[];
  currentView?: number | 'free';
  onFollowPlayer?: (playerIndex: number | null) => void;
  playerNames?: string[];
  playerColors?: string[];
}

const SpectatorSidebar: React.FC<SpectatorSidebarProps> = ({
  spectators,
  currentView = 'free',
  onFollowPlayer,
  playerNames = [],
  playerColors = [],
}) => {
  return (
    <div
      className="cyber-card border-neon-cyan p-3 md:p-4 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
      }}
    >
      {/* 標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye
            className="w-4 h-4 md:w-5 md:h-5"
            style={{ color: 'var(--cyan)' }}
          />
          <h3
            className="font-cyber text-base tracking-wider"
            style={{
              color: 'var(--cyan)',
              textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
            }}
          >
            觀戰者
          </h3>
        </div>
        <span
          className="text-xs font-cyber px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            color: 'var(--cyan)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
          }}
        >
          {spectators.length} 人
        </span>
      </div>

      {/* 當前視角 */}
      {currentView !== 'free' && currentView !== undefined && (
        <div
          className="text-xs px-2 py-1.5 rounded flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(255, 107, 157, 0.08)',
            border: '1px solid rgba(255, 107, 157, 0.3)',
            color: 'var(--pink)',
          }}
        >
          <Crown className="w-3.5 h-3.5" />
          <span className="font-cyber tracking-wide">
            當前視角：{playerNames[currentView] || `玩家${currentView + 1}`}
          </span>
        </div>
      )}
      {currentView === 'free' && (
        <div
          className="text-xs px-2 py-1.5 rounded flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: 'var(--purple)',
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="font-cyber tracking-wide">自由視角</span>
        </div>
      )}

      {/* 觀戰者列表 */}
      <div className="flex-1 overflow-y-auto space-y-1 max-h-64">
        {spectators.length === 0 && (
          <div className="text-center text-text-muted text-xs py-6">
            暫無觀戰者
          </div>
        )}
        {spectators.map((s: SpectatorInfo) => {
          const followColor = s.following !== undefined && playerColors[s.following]
            ? playerColors[s.following]
            : 'var(--text-muted)';
          return (
            <div
              key={s.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors hover:bg-white/5"
              style={{
                backgroundColor: s.following !== undefined && currentView === s.following
                  ? 'rgba(0, 255, 255, 0.06)'
                  : 'transparent',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <User
                  className="w-3 h-3"
                  style={{ color: 'var(--text-secondary)' }}
                />
              </div>
              <span
                className="text-sm flex-1 truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {s.nickname}
              </span>
              {s.following !== undefined && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-cyber"
                  style={{
                    backgroundColor: `${followColor}20`,
                    color: followColor,
                    border: `1px solid ${followColor}40`,
                  }}
                  title={`正在觀看 ${playerNames[s.following] || `玩家${s.following + 1}`}`}
                >
                  P{s.following + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 切換視角按鈕（自由視角） */}
      {onFollowPlayer && currentView !== 'free' && (
        <button
          type="button"
          onClick={() => onFollowPlayer(null)}
          className="cyber-btn w-full py-2 text-xs font-cyber tracking-wide"
          style={{
            borderColor: 'rgba(168, 85, 247, 0.4)',
            color: 'var(--purple)',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
          }}
        >
          切換為自由視角
        </button>
      )}
    </div>
  );
};

export default SpectatorSidebar;
