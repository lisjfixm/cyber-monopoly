import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import TutorialOverlay from '@client/src/components/game/TutorialOverlay';
import { TUTORIAL_STEPS } from '@client/src/config/tutorial';
import { useTutorial } from '@client/src/hooks/useTutorial';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { PLAYER_COLOR_HEX, DEFAULT_PLAYER_NAMES } from '@shared/game-config';

const PLAYER_COUNT_OPTIONS = [2, 3, 4, 5, 6] as const;
type PlayerCountOption = typeof PLAYER_COUNT_OPTIONS[number];

const MAX_LEN = 10;

const LocalSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const countParam = searchParams.get('count');

  const initialCount: PlayerCountOption = (() => {
    const parsed = countParam ? parseInt(countParam, 10) : NaN;
    if (Number.isNaN(parsed)) return 2;
    return Math.max(2, Math.min(6, parsed)) as PlayerCountOption;
  })();

  const [playerCount, setPlayerCount] = useState<PlayerCountOption>(initialCount);

  // 初始化玩家名称
  const getInitialNames = (count: number): string[] => {
    const names: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const paramName = searchParams.get(`p${i + 1}`);
      names.push(paramName || '');
    }
    return names;
  };

  const [playerNames, setPlayerNames] = useState<string[]>(() => getInitialNames(initialCount));
  const [error, setError] = useState<string>('');

  // 新手教学
  const { unlock: unlockAchievement } = useAchievements();
  const tutorial = useTutorial({
    onComplete: () => {
      unlockAchievement('beginner');
    },
  });

  // 本地设置页只处理第1步（gameModes，索引1）
  const tutorialVisible = tutorial.isActive && tutorial.currentStep === 1;

  useEffect(() => {
    // 调整玩家数量时，保留已有名字，新位置填空
    setPlayerNames((prev) => {
      const next: string[] = [];
      for (let i = 0; i < playerCount; i += 1) {
        next.push(prev[i] ?? '');
      }
      return next;
    });
    setError('');
  }, [playerCount]);

  const handleCountChange = (count: PlayerCountOption) => {
    setPlayerCount(count);
  };

  const handleNameChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_LEN) return;
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError('');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedNames = playerNames.map((n: string) => n.trim());

    // 检查空昵称
    const hasEmpty = trimmedNames.some((n: string) => !n);
    if (hasEmpty) {
      setError('請輸入所有玩家的暱稱');
      return;
    }

    // 检查重复昵称
    const uniqueNames = new Set(trimmedNames);
    if (uniqueNames.size !== trimmedNames.length) {
      setError('玩家暱稱不能重複');
      return;
    }

    // 构建 URL 参数
    const params = new URLSearchParams();
    params.set('mode', 'local');
    params.set('playerCount', String(playerCount));
    trimmedNames.forEach((name: string, idx: number) => {
      params.set(`p${idx + 1}`, name);
    });

    if (modeParam === 'custom') {
      // 自定义模式：直接进入游戏
      params.set('mode', 'custom');
      params.set('playMode', 'local');
      navigate(`/game?${params.toString()}`);
    } else {
      navigate(`/mode-select?${params.toString()}`);
    }
  };

  const handleTutorialNext = () => {
    tutorial.nextStep();
  };

  const handleTutorialPrev = () => {
    if (tutorial.currentStep > 1) {
      tutorial.prevStep();
    } else {
      tutorial.skipTutorial();
      navigate('/');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const colors = Object.values(PLAYER_COLOR_HEX) as string[];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative">
      <div className="w-full max-w-md cyber-card p-6 md:p-8" data-tutorial="game-modes">
        <h2 className="font-cyber text-2xl md:text-3xl text-neon-cyan text-center tracking-wider mb-2">
          本地多人对战
        </h2>
        <p className="text-center text-[var(--text-secondary)] text-sm mb-6 font-cyber tracking-wider">
          一部装置 · 同屏对决
        </p>

        {/* 玩家数量选择 */}
        <div className="mb-6">
          <label className="block font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <Users size={14} />
            選擇玩家數量
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PLAYER_COUNT_OPTIONS.map((count) => {
              const isSelected = playerCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleCountChange(count)}
                  className="py-3 font-cyber text-base transition-all rounded-sm"
                  style={{
                    border: `1px solid ${
                      isSelected ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)'
                    }`,
                    backgroundColor: isSelected
                      ? 'rgba(0, 255, 255, 0.15)'
                      : 'rgba(0, 255, 255, 0.03)',
                    color: isSelected ? 'var(--cyan)' : 'var(--text-primary)',
                    boxShadow: isSelected
                      ? '0 0 15px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2)'
                      : 'none',
                    textShadow: isSelected ? '0 0 8px rgba(0, 255, 255, 0.8)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {count}人
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Array.from({ length: playerCount }).map((_, idx: number) => {
            const colorHex = colors[idx % colors.length];
            const defaultName = DEFAULT_PLAYER_NAMES[idx] || `玩家${idx + 1}`;
            return (
              <div key={idx} className="space-y-1.5">
                <label
                  className="flex items-center gap-2 font-cyber text-sm tracking-wider"
                  style={{ color: colorHex }}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: colorHex,
                      boxShadow: `0 0 6px ${colorHex}`,
                    }}
                  />
                  <span>玩家 {idx + 1}</span>
                </label>
                <input
                  type="text"
                  value={playerNames[idx] || ''}
                  onChange={handleNameChange(idx)}
                  placeholder={defaultName}
                  maxLength={MAX_LEN}
                  className="cyber-input w-full"
                  style={{
                    borderColor: `${colorHex}66`,
                    boxShadow: `0 0 8px ${colorHex}33`,
                  }}
                />
                <div className="text-right text-xs text-[var(--text-muted)]">
                  {(playerNames[idx] || '').length}/{MAX_LEN}
                </div>
              </div>
            );
          })}

          {error && (
            <div className="text-sm text-center pt-2" style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="cyber-btn w-full py-3 text-base mt-4"
          >
            開始遊戲
          </button>
        </form>

        <button
          type="button"
          onClick={handleBack}
          className="mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider"
        >
          ← 返回主選單
        </button>
      </div>

      {/* 新手教学浮层 */}
      {tutorialVisible && tutorial.currentStepConfig && (
        <TutorialOverlay
          steps={TUTORIAL_STEPS}
          currentStep={tutorial.currentStep}
          onNext={handleTutorialNext}
          onPrev={handleTutorialPrev}
          onSkip={tutorial.skipTutorial}
          onClose={tutorial.closeTutorial}
        />
      )}
    </div>
  );
};

export default LocalSetupPage;
