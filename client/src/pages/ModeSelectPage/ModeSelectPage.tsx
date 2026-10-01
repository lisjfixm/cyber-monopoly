import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import TutorialOverlay from '@client/src/components/game/TutorialOverlay';
import { TUTORIAL_STEPS } from '@client/src/config/tutorial';
import { useTutorial } from '@client/src/hooks/useTutorial';
import { Map } from 'lucide-react';
import { useAchievements } from '@client/src/hooks/useAchievements';
import { GAME_MODES, PLAYER_COLOR_HEX, DEFAULT_PLAYER_NAMES } from '@shared/game-config';
import type { GameMode, PlayMode, GameModeConfig } from '@shared/api.interface';

interface ModeOption {
  key: GameMode;
  label: string;
  config: GameModeConfig;
  color: string;
  description: string;
  icon: string;
  gradient?: string;
  difficulty?: string;
}

interface ModeGroup {
  title: string;
  titleColor: string;
  modes: ModeOption[];
}

const ModeSelectPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [error, setError] = useState<string>('');
  const [randomBoard, setRandomBoard] = useState<boolean>(false);
  const [blindAuction, setBlindAuction] = useState<boolean>(false);

  // 新手教学
  const { unlock: unlockAchievement } = useAchievements();
  const tutorial = useTutorial({
    onComplete: () => {
      unlockAchievement('beginner');
    },
  });

  // 模式选择页只处理第2步（ruleModes，索引2）
  const tutorialVisible = tutorial.isActive && tutorial.currentStep === 2;

  const playModeParam = searchParams.get('mode') as PlayMode | null;
  const playerCountParam = searchParams.get('playerCount');
  const aiDifficulty = searchParams.get('aiDifficulty') || 'normal';
  const parsedPlayerCount = playerCountParam ? parseInt(playerCountParam, 10) : NaN;
  const playerCount = Number.isNaN(parsedPlayerCount)
    ? 2
    : Math.max(2, Math.min(6, parsedPlayerCount));

  // AI 難度顯示對照（需涵蓋 hell，否則地獄難度會誤顯示為「普通」）
  const AI_DIFFICULTY_LABELS: Record<string, string> = {
    easy: '簡單',
    normal: '普通',
    hard: '困難',
    hell: '地獄',
  };

  // 解析玩家名称
  const playerNames: string[] = [];
  for (let i = 0; i < playerCount; i += 1) {
    const name = searchParams.get(`p${i + 1}`);
    playerNames.push(name || DEFAULT_PLAYER_NAMES[i] || `玩家${i + 1}`);
  }

  const hasValidPlayers = playerNames.length >= 2 && playerNames.every((n: string) => n);

  useEffect(() => {
    if (!playModeParam || !hasValidPlayers) {
      setError('參數不完整，請返回重新開始');
    }
  }, [playModeParam, hasValidPlayers]);

  const modeGroups: ModeGroup[] = [
    {
      title: '基礎模式',
      titleColor: 'var(--cyan)',
      modes: [
        {
          key: 'classic',
          label: '經典模式',
          config: GAME_MODES.classic,
          color: 'var(--cyan)',
          description: '標準規則，穩步經營',
          icon: '都市',
        },
        {
          key: 'fast',
          label: '快速模式',
          config: GAME_MODES.fast,
          color: 'var(--green)',
          description: '地價更低，節奏更快',
          icon: '閃電',
        },
        {
          key: 'crazy',
          label: '瘋狂模式',
          config: GAME_MODES.crazy,
          color: 'var(--pink)',
          description: '命運加倍，瘋狂豪賭',
          icon: '火焰',
        },
      ],
    },
    {
      title: '競技模式',
      titleColor: 'hsl(160, 100%, 50%)',
      modes: [
        {
          key: 'race',
          label: '競速模式',
          config: GAME_MODES.race,
          color: 'hsl(160, 100%, 50%)',
          description: '先繞3圈獲勝',
          icon: '賽車',
        },
        {
          key: 'survival',
          label: '生存模式',
          config: GAME_MODES.survival,
          color: 'var(--red)',
          description: '血量歸零淘汰',
          icon: '生命',
        },
        {
          key: 'battle_royale',
          label: '大逃殺模式',
          config: GAME_MODES.battle_royale,
          color: 'hsl(20, 100%, 50%)',
          description: '毒圈收縮',
          icon: '槍戰',
        },
        {
          key: 'dark',
          label: '黑暗模式',
          config: GAME_MODES.dark,
          color: 'hsl(270, 80%, 50%)',
          description: '對手資訊隱藏',
          icon: '未知',
        },
      ],
    },
    {
      title: '合作模式',
      titleColor: 'var(--blue)',
      modes: [
        {
          key: 'coop2v2',
          label: '合作模式 2v2',
          config: GAME_MODES.coop2v2,
          color: 'var(--blue)',
          description: '紅藍隊伍對抗',
          icon: '團隊',
        },
        {
          key: 'coop_boss',
          label: '合作打Boss',
          config: GAME_MODES.coop_boss,
          color: 'hsl(0, 100%, 40%)',
          gradient: 'linear-gradient(135deg, hsl(0, 100%, 40%), hsl(0, 0%, 10%))',
          description: '4人對抗超強AI',
          icon: '首領',
        },
      ],
    },
    {
      title: '特殊玩法',
      titleColor: 'hsl(45, 100%, 55%)',
      modes: [
        {
          key: 'treasure',
          label: '奪寶模式',
          config: GAME_MODES.treasure,
          color: 'hsl(45, 100%, 55%)',
          description: '帶寶藏回起點獲勝',
          icon: '寶藏',
        },
        {
          key: 'emperor',
          label: '皇帝模式',
          config: GAME_MODES.emperor,
          color: 'hsl(45, 100%, 50%)',
          gradient: 'linear-gradient(135deg, hsl(45, 100%, 50%), hsl(270, 80%, 60%))',
          description: '一人稱帝，眾人納稅',
          icon: '皇帝',
        },
         {
           key: 'custom',
           label: '自訂模式',
           config: GAME_MODES.custom,
           color: 'var(--text-secondary)',
           description: '自由調整規則',
            icon: '設定',
          },
        ],
      },
      {
        title: '戰術模式',
       titleColor: 'hsl(280, 100%, 65%)',
       modes: [
         {
           key: 'lightning',
           label: '閃電戰',
           config: GAME_MODES.lightning,
           color: 'hsl(45, 100%, 60%)',
           description: '50回合後按總資產決勝負',
            icon: '閃電',
            difficulty: '普通',
         },
         {
           key: 'resource',
           label: '資源爭奪',
           config: GAME_MODES.resource,
           color: 'hsl(140, 100%, 55%)',
           description: '爭奪數據核心，資源最多者勝',
            icon: '資源',
            difficulty: '困難',
          },
          {
            key: 'team_deathmatch',
           label: '團隊死鬥',
           config: GAME_MODES.team_deathmatch,
           color: 'hsl(0, 100%, 60%)',
           description: '2v2 組隊，消滅對方全隊獲勝',
            icon: '戰爭',
            difficulty: '困難',
          },
          {
            key: 'darknet',
           label: '暗網模式',
           config: GAME_MODES.darknet,
           color: 'hsl(270, 80%, 55%)',
           description: '匿名對局，交易抽成，道具增強',
            icon: '暗網',
            difficulty: '地獄',
          },
       ],
     },
   ];

  const handleSelect = (key: GameMode) => {
    setSelectedMode(key);
  };

  const handleConfirm = () => {
    if (!playModeParam || !hasValidPlayers) {
      setError('參數不完整，請返回重新開始');
      return;
    }

    if (playModeParam === 'online') {
      toast.error('聯機功能暫不可用，請選擇本地或人機模式');
      navigate('/');
      return;
    }

    // 构建完整参数
    const params = new URLSearchParams();
    params.set('mode', selectedMode);
    params.set('playMode', playModeParam);
    params.set('playerCount', String(playerCount));
    if (randomBoard) {
      params.set('randomBoard', '1');
    }
    if (blindAuction) {
      params.set('blindAuction', '1');
    }
    if (playModeParam === 'ai') {
      params.set('aiDifficulty', aiDifficulty);
    }
    playerNames.forEach((name: string, idx: number) => {
      params.set(`p${idx + 1}`, name);
    });

    navigate(`/game?${params.toString()}`);
  };

  const handleBack = () => {
    if (!playModeParam) {
      navigate('/');
      return;
    }
    if (playModeParam === 'local') {
      navigate('/local-setup');
    } else if (playModeParam === 'ai') {
      navigate('/ai-setup');
    } else {
      navigate('/');
    }
  };

  const colors = Object.values(PLAYER_COLOR_HEX) as string[];

  const modeLabel = playModeParam === 'ai' ? '人機模式' : '本地多人';
  const isAIMode = playModeParam === 'ai';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative">
      <div className="w-full max-w-2xl xl:max-w-6xl lg:max-w-4xl">
        <h2 className="font-cyber text-2xl md:text-3xl text-neon-cyan text-center tracking-wider mb-2">
          選擇遊戲模式
        </h2>
         <p className="text-center text-[var(--text-secondary)] text-sm mb-6 font-cyber tracking-wider">
           十六種風格 · 不同挑戰
         </p>

        {/* Players Info */}
        {!error && hasValidPlayers && (
          <div className="cyber-card p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-cyber text-xs tracking-wider text-[var(--text-secondary)]">
                {modeLabel}
              </span>
              <span
                className="font-cyber text-xs tracking-wider px-2 py-0.5 rounded-sm"
                style={{
                  border: '1px solid var(--cyan)',
                  color: 'var(--cyan)',
                  boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
                }}
              >
                {playerCount} 人模式
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {playerNames.map((name: string, idx: number) => {
                const colorHex = colors[idx % colors.length];
                const isAI = isAIMode && idx > 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2 py-1 text-sm rounded-sm"
                    style={{
                      border: `1px solid ${colorHex}55`,
                      backgroundColor: `${colorHex}15`,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: colorHex,
                        boxShadow: `0 0 4px ${colorHex}`,
                      }}
                    />
                    <span style={{ color: colorHex }}>{name}</span>
                    {isAI && (
                      <span className="text-[10px] opacity-70 ml-0.5">AI</span>
                    )}
                  </div>
                );
              })}
            </div>
            {isAIMode && (
              <div className="mt-3 text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                 難度：
                <span style={{ color: 'var(--blue)' }}>
                   {AI_DIFFICULTY_LABELS[aiDifficulty] || '普通'}
                </span>
              </div>
            )}
          </div>
        )}

        {error ? (
          <div
            className="cyber-card p-6 text-center"
            style={{ borderColor: 'rgba(255, 77, 109, 0.4)' }}
          >
            <p style={{ color: 'var(--red)' }}>{error}</p>
            <button
              type="button"
              onClick={handleBack}
              className="cyber-btn mt-4 px-6 py-2 text-sm"
            >
              返回
            </button>
          </div>
        ) : (
          <>
            {/* Mode Cards */}
            <div className="mb-6" data-tutorial="rule-modes">
              {modeGroups.map((group: ModeGroup) => (
                <div key={group.title} className="mb-5">
                  <div
                    className="col-span-full font-cyber text-sm md:text-base tracking-wider mb-3 flex items-center gap-2"
                    style={{ color: group.titleColor }}
                  >
                    <span
                      className="inline-block w-1 h-4 rounded-sm"
                      style={{
                        backgroundColor: group.titleColor,
                        boxShadow: `0 0 8px ${group.titleColor}`,
                      }}
                    />
                    {group.title}
                    <span
                      className="flex-1 h-px"
                      style={{
                        background: `linear-gradient(90deg, ${group.titleColor}40, transparent)`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-3">
                     {group.modes.map((mode: ModeOption) => {
                       const isSelected = selectedMode === mode.key;
                       const borderColor = isSelected ? mode.color : `${mode.color}30`;
                       const glowColor = mode.color;
                       // 團隊死鬥需要至少4人
                       const disabled = mode.key === 'team_deathmatch' && playerCount < 4;
                       const difficultyColor =
                         mode.difficulty === '地獄'
                           ? 'var(--red)'
                           : mode.difficulty === '困難'
                           ? 'hsl(30, 100%, 60%)'
                           : mode.difficulty === '普通'
                           ? 'var(--green)'
                           : null;
                       return (
                         <button
                           key={mode.key}
                           type="button"
                           onClick={() => !disabled && handleSelect(mode.key)}
                           title={disabled ? '需要4人以上（2v2）' : undefined}
                           className={`cyber-card p-3 md:p-4 text-left transition-all hover:scale-[1.03] flex flex-col items-center text-center min-h-0 ${
                             disabled ? 'opacity-50 grayscale cursor-not-allowed hover:scale-100' : ''
                           }`}
                           style={{
                             borderColor,
                             boxShadow: isSelected
                               ? `0 0 15px ${glowColor}60, 0 0 30px ${glowColor}30, inset 0 0 12px ${glowColor}15`
                               : `0 0 6px ${mode.color}15`,
                             background: mode.gradient && isSelected
                               ? `${mode.gradient}, rgba(0,0,0,0.6)`
                               : undefined,
                           }}
                         >
                          <div
                            className="text-2xl md:text-3xl mb-1.5 md:mb-2 flex-shrink-0"
                            style={{
                              filter: isSelected
                                ? `drop-shadow(0 0 6px ${glowColor})`
                                : 'none',
                            }}
                          >
                            {mode.icon}
                          </div>
                          <div
                            className="font-cyber text-xs md:text-sm tracking-wider mb-1 truncate w-full"
                            style={{
                              color: mode.color,
                              textShadow: isSelected
                                ? `0 0 8px ${glowColor}80`
                                : 'none',
                            }}
                          >
                            {mode.label}
                          </div>
                           <p className="text-[10px] md:text-xs text-[var(--text-secondary)] leading-tight line-clamp-2 w-full">
                             {mode.description}
                           </p>
                           {mode.difficulty && difficultyColor && (
                             <div
                               className="mt-1.5 text-[10px] font-cyber tracking-wider px-1.5 py-0.5 rounded"
                               style={{
                                 color: difficultyColor,
                                 border: `1px solid ${difficultyColor}50`,
                                 backgroundColor: `${difficultyColor}10`,
                                 textShadow: `0 0 4px ${difficultyColor}60`,
                               }}
                             >
                               {mode.difficulty}
                             </div>
                           )}
                           {isSelected && (
                            <div
                              className="mt-2 text-[10px] font-cyber tracking-wider"
                              style={{
                                color: mode.color,
                                textShadow: `0 0 6px ${glowColor}`,
                              }}
                            >
                              ◉ 已選擇
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 隨機地圖開關 */}
            <div
              className="cyber-card p-4 mb-4 flex items-center justify-between"
              style={{
                borderColor: randomBoard ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)',
                boxShadow: randomBoard
                  ? '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                  : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-cyber" style={{ color: 'var(--cyan)' }}>隨機</span>
                <div>
                  <div
                    className="font-cyber text-base tracking-wider"
                    style={{ color: randomBoard ? 'var(--cyan)' : 'var(--text-primary)' }}
                  >
                    隨機地圖
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    每次開局隨機生成棋盤，體驗不一樣的大富翁
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRandomBoard(!randomBoard)}
                className="relative w-14 h-7 rounded-full transition-all flex-shrink-0"
                style={{
                  backgroundColor: randomBoard ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${randomBoard ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.2)'}`,
                  boxShadow: randomBoard
                    ? '0 0 10px rgba(0, 255, 255, 0.5), inset 0 0 8px rgba(0, 255, 255, 0.2)'
                    : undefined,
                }}
                aria-label="隨機地圖開關"
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                  style={{
                    left: randomBoard ? 'calc(100% - 22px)' : '2px',
                    backgroundColor: randomBoard ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.4)',
                    boxShadow: randomBoard
                      ? '0 0 8px var(--cyan), 0 0 16px var(--cyan)'
                      : 'none',
                  }}
                />
              </button>
            </div>

             {/* 暗拍模式開關 */}
             <div
               className="cyber-card p-4 mb-4 flex items-center justify-between"
               style={{
                 borderColor: blindAuction ? 'var(--purple)' : 'rgba(168, 85, 247, 0.2)',
                 boxShadow: blindAuction
                   ? '0 0 15px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.1)'
                   : undefined,
               }}
             >
               <div className="flex items-center gap-3">
                  <span className="text-2xl font-cyber" style={{ color: 'var(--purple)' }}>暗拍</span>
                 <div>
                   <div
                     className="font-cyber text-base tracking-wider"
                     style={{ color: blindAuction ? 'var(--purple)' : 'var(--text-primary)' }}
                   >
                     暗拍模式
                   </div>
                   <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                     所有人同時秘密出價，價高者得，考驗你的判斷力！
                   </p>
                 </div>
               </div>
               <button
                 type="button"
                 onClick={() => setBlindAuction(!blindAuction)}
                 className="relative w-14 h-7 rounded-full transition-all flex-shrink-0"
                 style={{
                   backgroundColor: blindAuction ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                   border: `1px solid ${blindAuction ? 'var(--purple)' : 'rgba(255, 255, 255, 0.2)'}`,
                   boxShadow: blindAuction
                     ? '0 0 10px rgba(168, 85, 247, 0.5), inset 0 0 8px rgba(168, 85, 247, 0.2)'
                     : undefined,
                 }}
                 aria-label="暗拍模式開關"
               >
                 <span
                   className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                   style={{
                     left: blindAuction ? 'calc(100% - 22px)' : '2px',
                     backgroundColor: blindAuction ? 'var(--purple)' : 'rgba(255, 255, 255, 0.4)',
                     boxShadow: blindAuction
                       ? '0 0 8px var(--purple), 0 0 16px var(--purple)'
                       : 'none',
                   }}
                 />
               </button>
             </div>

             {/* 自訂地圖入口 */}
             <button
               type="button"
               onClick={() => navigate('/map-editor')}
               className="cyber-card w-full p-4 mb-4 flex items-center justify-between text-left transition-all hover:scale-[1.01]"
               style={{
                 borderColor: 'var(--yellow)',
                 boxShadow: '0 0 12px rgba(250, 204, 21, 0.15)',
               }}
             >
               <div className="flex items-center gap-3">
                 <Map size={24} style={{ color: 'var(--yellow)' }} />
                 <div>
                   <div className="font-cyber text-base tracking-wider" style={{ color: 'var(--yellow)' }}>
                      自訂地圖
                   </div>
                   <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                     使用地圖編輯器設計專屬棋盤
                   </p>
                 </div>
               </div>
               <span className="text-xs font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                 前往 →
               </span>
             </button>


            <button
              type="button"
              onClick={handleConfirm}
              className="cyber-btn w-full py-3 text-base"
            >
              確認開始
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider"
            >
              ← 返回
            </button>

            {/* 新手教学浮层 */}
            {tutorialVisible && tutorial.currentStepConfig && (
              <TutorialOverlay
                steps={TUTORIAL_STEPS}
                currentStep={tutorial.currentStep}
                onNext={tutorial.nextStep}
                onPrev={tutorial.prevStep}
                onSkip={tutorial.skipTutorial}
                onClose={tutorial.closeTutorial}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModeSelectPage;
