import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Lock, Check, Zap, Star, Skull, Shield, FileEdit, Coins, Target, Clock } from 'lucide-react';
import { STORY_LEVELS } from '@shared/game-config';
import type { StoryLevelConfig, StoryLevelId } from '@shared/api.interface';
import { getLocalScenarios, type CustomScenario } from '@client/src/utils/customScenarios';

const STORAGE_KEY = 'cyber_monopoly_story_progress';

interface StoryProgress {
  completed: number[];
  current: number;
}

function useStoryProgress() {
  const [progress, setProgress] = useState<StoryProgress>({ completed: [], current: 1 });
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoryProgress;
        if (parsed && Array.isArray(parsed.completed) && typeof parsed.current === 'number') {
          setProgress(parsed);
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveProgress = useCallback((p: StoryProgress) => {
    setProgress(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  }, []);

  const completeLevel = useCallback((levelId: number) => {
    setProgress(prev => {
      if (prev.completed.includes(levelId)) return prev;
      const newCompleted = [...prev.completed, levelId];
      const newCurrent = Math.min(10, levelId + 1);
      const next: StoryProgress = { completed: newCompleted, current: newCurrent };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isUnlocked = useCallback((levelId: number): boolean => {
    if (progress.completed.includes(levelId)) return true;
    if (levelId === 1) return true;
    return progress.completed.includes(levelId - 1);
  }, [progress.completed]);

  const isCompleted = useCallback((levelId: number): boolean => {
    return progress.completed.includes(levelId);
  }, [progress.completed]);

  return { progress, loaded, completeLevel, isUnlocked, isCompleted, saveProgress };
}

const difficultyConfig: Record<StoryLevelConfig['difficulty'], { label: string; color: string; bg: string }> = {
  easy: { label: '簡單', color: 'var(--green)', bg: 'rgba(0, 255, 128, 0.12)' },
  normal: { label: '普通', color: 'var(--yellow, #facc15)', bg: 'rgba(250, 204, 21, 0.12)' },
  hard: { label: '困難', color: 'var(--orange, #ff8c42)', bg: 'rgba(255, 140, 66, 0.12)' },
  extreme: { label: '極限', color: 'var(--red)', bg: 'rgba(255, 77, 109, 0.12)' },
};

const getDifficultyIcon = (difficulty: StoryLevelConfig['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return <Star size={12} />;
    case 'normal':
      return <Zap size={12} />;
    case 'hard':
      return <Shield size={12} />;
    case 'extreme':
      return <Skull size={12} />;
    default:
      return null;
  }
};

const StoryModePage = () => {
  const navigate = useNavigate();
  const { progress, loaded, completeLevel, isUnlocked, isCompleted } = useStoryProgress();
  const [selectedLevel, setSelectedLevel] = useState<StoryLevelConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
  const [localScenarios, setLocalScenarios] = useState<CustomScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<CustomScenario | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ levelId: number }>).detail;
      if (detail && typeof detail.levelId === 'number') {
        completeLevel(detail.levelId);
      }
    };
    window.addEventListener('story:complete-level', handler);
    return () => {
      window.removeEventListener('story:complete-level', handler);
    };
  }, [completeLevel]);

  useEffect(() => {
    setLocalScenarios(getLocalScenarios());
  }, [activeTab]);

  const completedCount = progress.completed.length;

  const handleLevelClick = (level: StoryLevelConfig) => {
    if (!isUnlocked(level.id)) return;
    setSelectedLevel(level);
  };

  const handleStart = () => {
    if (!selectedLevel) return;
    navigate('/game', { state: { storyLevel: selectedLevel.id as StoryLevelId } });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!loaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center scanlines">
        <div className="text-neon-cyan font-cyber tracking-wider">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 md:py-8 scanlines relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: 'var(--cyan)' }}
        />
        <div
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: 'var(--pink)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span className="font-cyber tracking-wider">返回</span>
          </button>

          <div className="text-center flex-1 mx-4">
            <h1 className="font-cyber text-2xl md:text-4xl text-neon-cyan tracking-widest mb-1">
              劇情模式
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] font-cyber tracking-wider">
              通關 10 大關卡，成為賽博傳說
            </p>
          </div>

          <div
            className="cyber-card px-3 py-2 text-center"
            style={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
          >
            <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)]">
              進度
            </div>
            <div className="font-cyber text-lg md:text-xl text-neon-cyan">
              {completedCount}
              <span className="text-sm text-[var(--text-secondary)]"> / 10</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {activeTab === 'official' && (
          <div className="mb-8 md:mb-10">
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: 'rgba(0, 255, 255, 0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(completedCount / 10) * 100}%`,
                  background: 'linear-gradient(90deg, var(--cyan), var(--pink))',
                  boxShadow: '0 0 10px var(--cyan), 0 0 20px var(--pink)',
                }}
              />
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 max-w-md mx-auto">
          {[
            { key: 'official', label: '官方關卡' },
            { key: 'custom', label: '自製劇本' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key as 'official' | 'custom'); setSelectedLevel(null); setSelectedScenario(null); }}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: isActive ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'official' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Level Map */}
            <div className="flex-1 lg:max-w-md">
            <div className="relative">
              {/* 纵向连接线 */}
              <div
                className="absolute left-6 top-4 bottom-4 w-px"
                style={{
                  background: 'linear-gradient(180deg, var(--cyan) 0%, var(--pink) 50%, var(--purple) 100%)',
                  opacity: 0.4,
                  boxShadow: '0 0 6px var(--cyan)',
                }}
              />

              <div className="space-y-3">
                {STORY_LEVELS.map((level: StoryLevelConfig) => {
                  const unlocked = isUnlocked(level.id);
                  const completed = isCompleted(level.id);
                  const isCurrent = !completed && unlocked;
                  const isSelected = selectedLevel?.id === level.id;
                  const diffCfg = difficultyConfig[level.difficulty];

                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleLevelClick(level)}
                      disabled={!unlocked}
                      className={`cyber-card w-full text-left p-3 pl-12 relative transition-all ${
                        unlocked ? 'hover:scale-[1.01] cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{
                        borderColor: completed
                          ? 'var(--green)'
                          : isSelected
                            ? 'var(--pink)'
                            : unlocked
                              ? 'rgba(0, 255, 255, 0.25)'
                              : 'rgba(255, 255, 255, 0.08)',
                        boxShadow: completed
                          ? '0 0 15px rgba(0, 255, 128, 0.25), inset 0 0 10px rgba(0, 255, 128, 0.1)'
                          : isCurrent
                            ? '0 0 15px rgba(255, 107, 157, 0.25)'
                            : undefined,
                        animation: isCurrent ? 'pulse-glow 2s ease-in-out infinite' : undefined,
                      }}
                    >
                      {/* 节点圆点 */}
                      <div
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-cyber text-sm font-bold"
                        style={{
                          background: completed
                            ? 'var(--green)'
                            : unlocked
                              ? 'var(--cyan)'
                              : 'rgba(255, 255, 255, 0.1)',
                          color: completed || unlocked ? '#000' : 'rgba(255, 255, 255, 0.3)',
                          boxShadow: completed
                            ? '0 0 12px var(--green)'
                            : unlocked
                              ? '0 0 12px var(--cyan)'
                              : 'none',
                        }}
                      >
                        {completed ? (
                          <Check size={16} strokeWidth={3} />
                        ) : unlocked ? (
                          level.id
                        ) : (
                          <Lock size={12} />
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="font-cyber text-base md:text-lg tracking-wider truncate"
                              style={{
                                color: completed
                                  ? 'var(--green)'
                                  : unlocked
                                    ? 'var(--text-primary)'
                                    : 'rgba(255, 255, 255, 0.3)',
                              }}
                            >
                              {level.name}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                            {level.description}
                          </p>
                        </div>

                        <span
                          className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-cyber tracking-wider"
                          style={{
                            color: diffCfg.color,
                            backgroundColor: diffCfg.bg,
                            border: `1px solid ${diffCfg.color}40`,
                          }}
                        >
                          {getDifficultyIcon(level.difficulty)}
                          {diffCfg.label}
                        </span>
                      </div>

                      {level.specialRule && unlocked && (
                        <div className="mt-1.5 text-[10px] font-cyber tracking-wider" style={{ color: 'var(--purple)' }}>
                          閃電 {level.specialRule}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Level Detail */}
          <div className="flex-1">
            {selectedLevel ? (
              <div
                className="cyber-card p-5 md:p-6 sticky top-4"
                style={{
                  borderColor: 'var(--pink)',
                  boxShadow: '0 0 25px rgba(255, 107, 157, 0.2), inset 0 0 15px rgba(255, 107, 157, 0.08)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
                      第 {selectedLevel.id} 關
                    </div>
                    <h2
                      className="font-cyber text-xl md:text-2xl tracking-wider"
                      style={{ color: 'var(--pink)' }}
                    >
                      {selectedLevel.name}
                    </h2>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-sm text-sm font-cyber tracking-wider"
                    style={{
                      color: difficultyConfig[selectedLevel.difficulty].color,
                      backgroundColor: difficultyConfig[selectedLevel.difficulty].bg,
                      border: `1px solid ${difficultyConfig[selectedLevel.difficulty].color}50`,
                    }}
                  >
                    {getDifficultyIcon(selectedLevel.difficulty)}
                    {difficultyConfig[selectedLevel.difficulty].label}
                  </span>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-5">
                  {selectedLevel.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">初始資金</span>
                    <span className="font-cyber text-neon-cyan">
                      ¥{selectedLevel.startingMoney.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">AI 數量</span>
                    <span className="font-cyber text-[var(--text-primary)]">
                      {selectedLevel.aiCount} 個
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">AI 攻擊性</span>
                    <span className="font-cyber text-[var(--text-primary)]">
                      {Math.round(selectedLevel.aiAggression * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">遊戲模式</span>
                    <span className="font-cyber text-[var(--text-primary)]">
                      {selectedLevel.gameMode === 'classic'
                        ? '經典'
                        : selectedLevel.gameMode === 'crazy'
                          ? '瘋狂'
                          : selectedLevel.gameMode === 'battle_royale'
                            ? '大逃殺'
                            : selectedLevel.gameMode}
                    </span>
                  </div>
                  {selectedLevel.specialRule && (
                    <div
                      className="p-3 rounded-sm text-sm"
                      style={{
                        border: '1px solid var(--purple)',
                        backgroundColor: 'rgba(168, 85, 247, 0.08)',
                      }}
                    >
                      <div className="text-xs font-cyber tracking-wider mb-1" style={{ color: 'var(--purple)' }}>
                        特殊規則
                      </div>
                      <div className="text-[var(--text-primary)]">
                        閃電 {selectedLevel.specialRule}
                      </div>
                    </div>
                  )}
                  <div
                    className="p-3 rounded-sm text-sm"
                    style={{
                      border: '1px solid var(--green)',
                      backgroundColor: 'rgba(0, 255, 128, 0.06)',
                    }}
                  >
                    <div className="text-xs font-cyber tracking-wider mb-1" style={{ color: 'var(--green)' }}>
                      通關獎勵
                    </div>
                    <div className="text-[var(--text-primary)]">
                      獎盃 {selectedLevel.reward}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  className="cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest"
                >
                  開始挑戰
                </button>
              </div>
            ) : (
              <div
                className="cyber-card p-8 md:p-10 text-center sticky top-4"
                style={{ borderColor: 'rgba(0, 255, 255, 0.15)' }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    border: '1px solid var(--cyan)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                  }}
                >
                  <Zap size={28} style={{ color: 'var(--cyan)' }} />
                </div>
                <h3 className="font-cyber text-lg text-neon-cyan tracking-wider mb-2">
                  選擇關卡
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  點擊左側已解鎖的關卡查看詳情
                  <br />
                  通關後自動解鎖下一關
                </p>
              </div>
            )}
          </div>
        </div>
      )}

        {/* Custom Scenarios Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--text-secondary)]">
                本地劇本：{localScenarios.length} 個
              </div>
              <button
                type="button"
                onClick={() => navigate('/scenario-editor')}
                className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-2"
                style={{
                  borderColor: 'var(--green)',
                  color: 'var(--green)',
                  backgroundColor: 'rgba(0, 255, 128, 0.08)',
                }}
              >
                <FileEdit size={16} />
                劇本製作器
              </button>
            </div>

            {localScenarios.length === 0 ? (
              <div className="cyber-card p-8 text-center" style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ border: '1px solid var(--cyan)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}>
                  <FileEdit size={28} style={{ color: 'var(--cyan)' }} />
                </div>
                <h3 className="font-cyber text-lg text-neon-cyan tracking-wider mb-2">
                  尚無自製劇本
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  使用劇本製作器創建專屬挑戰
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/scenario-editor')}
                  className="cyber-btn px-6 py-2 text-sm font-cyber tracking-wider"
                  style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
                >
                  前往製作器
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localScenarios.map((scenario) => {
                  const isSelected = selectedScenario?.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setSelectedScenario(scenario)}
                      className="cyber-card p-4 text-left hover:scale-[1.02] transition-transform"
                      style={{
                        borderColor: isSelected ? 'var(--pink)' : 'rgba(0, 255, 255, 0.2)',
                        boxShadow: isSelected ? '0 0 15px rgba(255, 107, 157, 0.3)' : 'none',
                      }}
                    >
                      <div className="font-cyber text-base tracking-wider text-neon-cyan truncate mb-1">
                        {scenario.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 min-h-[32px]">
                        {scenario.description}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Coins size={12} /> 初始資金
                          </span>
                          <span className="font-cyber text-neon-cyan">${scenario.startingMoney.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Skull size={12} /> AI
                          </span>
                          <span className="font-cyber">{scenario.aiCount} 個</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Target size={12} /> 勝利
                          </span>
                          <span className="font-cyber" style={{ color: 'var(--green)' }}>
                            {scenario.victoryCondition === 'reach_money' ? '累積資產' :
                             scenario.victoryCondition === 'own_properties' ? '擁有地產' : '淘汰對手'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                            <Clock size={12} /> 回合
                          </span>
                          <span className="font-cyber">{scenario.maxTurns > 0 ? `${scenario.maxTurns}` : '無限制'}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedScenario && (
              <div className="cyber-card p-6" style={{ borderColor: 'var(--pink)' }}>
                <h3 className="font-cyber text-xl text-neon-cyan tracking-wider mb-2">
                  {selectedScenario.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {selectedScenario.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs mb-1">初始資金</div>
                    <div className="font-cyber text-neon-cyan">${selectedScenario.startingMoney.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs mb-1">AI 數量</div>
                    <div className="font-cyber">{selectedScenario.aiCount} 個</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs mb-1">AI 難度</div>
                    <div className="font-cyber">{selectedScenario.aiDifficulty === 'easy' ? '簡單' : selectedScenario.aiDifficulty === 'normal' ? '普通' : selectedScenario.aiDifficulty === 'hard' ? '困難' : '極限'}</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-secondary)] text-xs mb-1">回合上限</div>
                    <div className="font-cyber">{selectedScenario.maxTurns > 0 ? `${selectedScenario.maxTurns} 回合` : '無限制'}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-[var(--text-secondary)] text-xs mb-1">勝利條件</div>
                  <div className="font-cyber text-lg" style={{ color: 'var(--green)' }}>
                    {selectedScenario.victoryCondition === 'reach_money' ? `資產達到 $${selectedScenario.victoryParam.toLocaleString()}` :
                     selectedScenario.victoryCondition === 'own_properties' ? `擁有 ${selectedScenario.victoryParam} 個地產` :
                     '淘汰所有對手'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/game', { state: { customStoryScenario: selectedScenario } });
                  }}
                  className="cyber-btn w-full py-3 text-base font-cyber tracking-wider"
                  style={{
                    borderColor: 'var(--pink)',
                    color: 'var(--pink)',
                    backgroundColor: 'rgba(255, 107, 157, 0.1)',
                    boxShadow: '0 0 15px rgba(255, 107, 157, 0.2)',
                  }}
                >
                  <Zap className="inline mr-2" size={18} />
                  開始挑戰
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 107, 157, 0.25);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 107, 157, 0.5), 0 0 40px rgba(255, 107, 157, 0.2);
          }
        }
      `}</style>
    </div>
  );
};

export default StoryModePage;
