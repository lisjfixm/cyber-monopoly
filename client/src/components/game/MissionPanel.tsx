import type { FC } from 'react';
import { X, Check, Coins } from 'lucide-react';
import type { Mission } from '@shared/api.interface';

interface MissionPanelProps {
  missions: Mission[];
  isOpen: boolean;
  onClose: () => void;
}

const MissionPanel: FC<MissionPanelProps> = ({ missions, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(10, 10, 25, 0.85)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          border: '1px solid var(--pink)',
          boxShadow:
            '0 0 40px rgba(255, 107, 157, 0.3), inset 0 0 20px rgba(255, 107, 157, 0.05)',
          animation: 'float-up 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded transition-all hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: 'rgba(255, 107, 157, 0.3)' }}
        >
          <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
            當前任務 / MISSIONS
          </div>
          <h2
            className="text-2xl md:text-3xl font-cyber tracking-wider"
            style={{
              color: 'var(--pink)',
              textShadow:
                '0 0 10px var(--pink), 0 0 20px var(--pink), 0 0 40px var(--pink)',
            }}
          >
            當前任務
          </h2>
        </div>

        {/* Mission list */}
        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          {missions.length === 0 ? (
            <div
              className="text-center py-8 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              暫無任務
            </div>
          ) : (
            missions.map((mission: Mission) => {
              const progress = Math.min(
                100,
                (mission.progress / mission.target) * 100,
              );
              const isCompleted = mission.completed;
              const isClaimed = mission.claimed;

              return (
                <div
                  key={mission.id}
                  className="relative p-4 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--bg-mid)',
                    border: isCompleted
                      ? '1px solid var(--green)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isCompleted
                      ? '0 0 15px rgba(0, 255, 128, 0.4), inset 0 0 10px rgba(0, 255, 128, 0.1)'
                      : 'none',
                  }}
                >
                  {/* Status badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="font-cyber text-base tracking-wide"
                      style={{
                        color: isCompleted
                          ? 'var(--green)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {mission.name}
                    </div>
                    {isCompleted && (
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-cyber"
                        style={{
                          backgroundColor: 'rgba(0, 255, 128, 0.15)',
                          color: 'var(--green)',
                          border: '1px solid var(--green)',
                        }}
                      >
                        <Check className="w-3 h-3" />
                        {isClaimed ? '已領取' : '已完成'}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div
                    className="text-xs mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {mission.description}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isCompleted
                            ? 'var(--green)'
                            : 'var(--pink)',
                          boxShadow: isCompleted
                            ? '0 0 8px var(--green)'
                            : '0 0 8px var(--pink)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] font-cyber">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        進度
                      </span>
                      <span
                        style={{
                          color: isCompleted
                            ? 'var(--green)'
                            : 'var(--text-primary)',
                        }}
                      >
{mission.progress} / {mission.target}
                         {isCompleted && ' 確認'}
                      </span>
                    </div>
                  </div>

                  {/* Reward */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
                    style={{
                      backgroundColor: 'rgba(250, 204, 21, 0.08)',
                      border: '1px solid rgba(250, 204, 21, 0.2)',
                    }}
                  >
                    <Coins
                      className="w-4 h-4"
                      style={{ color: '#facc15' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      獎勵：
                    </span>
                    <span
                      className="font-cyber"
                      style={{ color: '#facc15' }}
                    >
                      金錢 ¥{mission.reward.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t text-center text-xs"
          style={{
            borderColor: 'rgba(255, 107, 157, 0.3)',
            color: 'var(--text-secondary)',
          }}
        >
          目標 完成任務獲得金錢獎勵
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--cyan)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--cyan)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--cyan)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--cyan)]" />
      </div>
    </div>
  );
};

export default MissionPanel;
