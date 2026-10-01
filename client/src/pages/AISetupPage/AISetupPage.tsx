import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, Users, Zap, Brain, Sparkles } from 'lucide-react';
import { PLAYER_COLOR_HEX } from '@shared/game-config';

const AI_PLAYER_COUNT_OPTIONS = [2, 4, 6] as const;
type AIPlayerCountOption = typeof AI_PLAYER_COUNT_OPTIONS[number];

type AIDifficulty = 'easy' | 'normal' | 'hard' | 'hell';
type AIPersonality = 'conservative' | 'aggressive' | 'speculator' | 'trader';

const DIFFICULTY_OPTIONS: { key: AIDifficulty; label: string; desc: string; color: string }[] = [
  { key: 'easy', label: '簡單', desc: '新手友善', color: 'var(--green)' },
  { key: 'normal', label: '普通', desc: '標準對局', color: 'var(--cyan)' },
  { key: 'hard', label: '困難', desc: '進階挑戰', color: 'var(--pink)' },
  { key: 'hell', label: '地獄', desc: '精準計算·聯合圍剿', color: 'var(--red)' },
];

const PERSONALITY_INFO: Record<AIPersonality, { name: string; desc: string; color: string }> = {
  conservative: { name: '保守派', desc: '穩健保本，謹慎購地', color: 'var(--cyan)' },
  aggressive: { name: '激進派', desc: '瘋狂擴張，高風險高回報', color: 'var(--red)' },
  speculator: { name: '投機派', desc: '熱衷拍賣股票，短線暴利', color: 'var(--yellow)' },
  trader: { name: '貿易派', desc: '精通交易談判，四兩撥千斤', color: 'var(--green)' },
};

const PERSONALITY_KEYS: AIPersonality[] = ['conservative', 'aggressive', 'speculator', 'trader'];

const MAX_LEN = 10;

const AISetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const countParam = searchParams.get('count');

  const initialCount: AIPlayerCountOption = countParam
    ? (parseInt(countParam, 10) as AIPlayerCountOption)
    : 2;

  const validInitialCount: AIPlayerCountOption =
    AI_PLAYER_COUNT_OPTIONS.includes(initialCount) ? initialCount : 2;

  const [playerCount, setPlayerCount] = useState<AIPlayerCountOption>(validInitialCount);
  const [playerName, setPlayerName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [aiPersonalities, setAiPersonalities] = useState<AIPersonality[]>([]);
  const [error, setError] = useState<string>('');

  const aiCount = playerCount - 1;

  useEffect(() => {
    const personalities: AIPersonality[] = [];
    for (let i = 0; i < aiCount; i += 1) {
      personalities.push(PERSONALITY_KEYS[i % PERSONALITY_KEYS.length]);
    }
    setAiPersonalities(personalities);
  }, [aiCount]);

  const getAIName = (idx: number): string => `AI-${idx}`;

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > MAX_LEN) return;
    setPlayerName(value);
    setError('');
  };

  const handleCountChange = (count: AIPlayerCountOption) => {
    setPlayerCount(count);
    setError('');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = playerName.trim();

    if (!name) {
      setError('請輸入你的暱稱');
      return;
    }

    // 检查昵称是否和 AI 名字冲突
    for (let i = 1; i <= aiCount; i += 1) {
      if (name === getAIName(i)) {
        setError('暱稱不能與 AI 相同');
        return;
      }
    }

    const params = new URLSearchParams();
    params.set('mode', 'ai');
    params.set('playerCount', String(playerCount));
    params.set('aiDifficulty', difficulty);
    params.set('p1', name);
    for (let i = 1; i <= aiCount; i += 1) {
      params.set(`p${i + 1}`, getAIName(i));
      params.set(`aiPersonality${i}`, aiPersonalities[i - 1] ?? 'aggressive');
    }

    navigate(`/mode-select?${params.toString()}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const colors = Object.values(PLAYER_COLOR_HEX) as string[];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative">
      <div className="w-full max-w-md cyber-card p-6 md:p-8">
        <h2 className="font-cyber text-2xl md:text-3xl text-neon-pink text-center tracking-wider mb-2">
          人機對戰
        </h2>
        <p className="text-center text-[var(--text-secondary)] text-sm mb-6 font-cyber tracking-wider">
          挑戰賽博 AI · 智鬥霓虹
        </p>

        {/* 玩家数量选择 */}
        <div className="mb-6">
          <label className="block font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <Users size={14} />
            選擇對戰規模
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AI_PLAYER_COUNT_OPTIONS.map((count) => {
              const isSelected = playerCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleCountChange(count)}
                  className="py-3 font-cyber text-base transition-all rounded-sm"
                  style={{
                    border: `1px solid ${
                      isSelected ? 'var(--pink)' : 'rgba(255, 107, 157, 0.2)'
                    }`,
                    backgroundColor: isSelected
                      ? 'rgba(255, 107, 157, 0.15)'
                      : 'rgba(255, 107, 157, 0.03)',
                    color: isSelected ? 'var(--pink)' : 'var(--text-primary)',
                    boxShadow: isSelected
                      ? '0 0 15px rgba(255, 107, 157, 0.5), inset 0 0 10px rgba(255, 107, 157, 0.2)'
                      : 'none',
                    textShadow: isSelected ? '0 0 8px rgba(255, 107, 157, 0.8)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {count}人
                  <span className="block text-[10px] opacity-70 tracking-normal mt-0.5">
                    1人 vs {count - 1}AI
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 玩家昵称输入 */}
          <div className="space-y-1.5">
            <label
              className="flex items-center gap-2 font-cyber text-sm tracking-wider"
              style={{ color: 'var(--red)' }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'var(--red)',
                  boxShadow: '0 0 6px var(--red)',
                }}
              />
              <span>玩家 · 你</span>
            </label>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="輸入你的暱稱"
              maxLength={MAX_LEN}
              className="cyber-input w-full"
              style={{
                borderColor: 'rgba(255, 77, 109, 0.4)',
                boxShadow: '0 0 8px rgba(255, 77, 109, 0.2)',
              }}
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {playerName.length}/{MAX_LEN}
            </div>
          </div>

          {/* AI 难度选择 */}
          <div className="space-y-2">
            <label className="block font-cyber text-sm tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
              <Zap size={14} />
              AI 难度
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isSelected = difficulty === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDifficulty(opt.key)}
                    className="py-2 font-cyber text-sm transition-all rounded-sm flex flex-col items-center"
                    style={{
                      border: `1px solid ${isSelected ? opt.color : `${opt.color}33`}`,
                      backgroundColor: isSelected ? `${opt.color}26` : 'transparent',
                      color: isSelected ? opt.color : 'var(--text-primary)',
                      boxShadow: isSelected ? `0 0 10px ${opt.color}66` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="text-base">{opt.label}</span>
                    <span className="text-[9px] opacity-60 mt-0.5 normal-case">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI 对手列表 */}
          <div
            className="cyber-card p-3 space-y-2"
            style={{
              borderColor: 'rgba(77, 195, 255, 0.3)',
              boxShadow: '0 0 10px rgba(77, 195, 255, 0.1)',
            }}
          >
              <div className="flex items-center gap-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--blue)' }}>
                <Bot size={12} />
                <span>AI 對手 ({aiCount} 位) · 個性隨機分配</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: aiCount }).map((_, idx: number) => {
                  const aiIdx = idx + 1;
                  const colorHex = colors[aiIdx % colors.length];
                  const personality = aiPersonalities[idx];
                  const pInfo = personality ? PERSONALITY_INFO[personality] : null;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 px-2 py-1.5 text-xs rounded-sm flex-1 min-w-[100px]"
                      style={{
                        border: `1px solid ${colorHex}44`,
                        backgroundColor: `${colorHex}11`,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colorHex }}
                        />
                        <span style={{ color: colorHex }} className="font-cyber">{getAIName(aiIdx)}</span>
                      </div>
                      {pInfo && (
                        <div className="flex items-center gap-1">
                          <Brain size={10} style={{ color: pInfo.color }} />
                          <span className="text-[10px] font-cyber" style={{ color: pInfo.color }}>
                            {pInfo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>

          {error && (
            <div className="text-sm text-center pt-2" style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="cyber-btn cyber-btn-pink w-full py-3 text-base mt-2"
          >
            開始遊戲
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

export default AISetupPage;
