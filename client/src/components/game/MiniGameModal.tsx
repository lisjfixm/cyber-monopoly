import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { X } from 'lucide-react';
import { MINIGAME_NAMES } from '@shared/game-config';
import type { GameState, MiniGameState } from '@shared/api.interface';
import MemoryMatchGame from './MemoryMatchGame';
import RhythmMasterGame from './RhythmMasterGame';
import ShootingChallengeGame from './ShootingChallengeGame';
import DataMinerGame from './DataMinerGame';
import FirewallBreachGame from './FirewallBreachGame';
import CyberRacerGame from './CyberRacerGame';
import AuctionMasterGame from './AuctionMasterGame';

interface MiniGameModalProps {
  open: boolean;
  gameState: GameState;
  playerIndex: number;
  miniGameState: MiniGameState;
  onAction: (action: string, data?: unknown) => void;
  onClose: () => void;
}

// ========== 老虎机子组件 ==========
const SLOT_SYMBOLS = ['柒', '鑽', '星', '鈴', '檸', '櫻'];

interface SlotMachineProps {
  reels: [number, number, number];
  spinning: boolean;
  finished: boolean;
  reward: number;
  onSpin: () => void;
}

const SlotMachine: FC<SlotMachineProps> = ({ reels, spinning, finished, reward, onSpin }) => {
  const [displayReels, setDisplayReels] = useState<[number, number, number]>([0, 0, 0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      intervalRef.current = setInterval(() => {
        setDisplayReels([
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
        ] as [number, number, number]);
      }, 80);

      const timer1 = setTimeout(() => {
        setDisplayReels((prev) => {
          const next = [...prev] as [number, number, number];
          next[0] = reels[0] ?? 0;
          return next;
        });
      }, 600);
      const timer2 = setTimeout(() => {
        setDisplayReels((prev) => {
          const next = [...prev] as [number, number, number];
          next[1] = reels[1] ?? 0;
          return next;
        });
      }, 1000);
      const timer3 = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayReels((prev) => {
          const next = [...prev] as [number, number, number];
          next[2] = reels[2] ?? 0;
          return next;
        });
      }, 1400);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setDisplayReels(reels);
    }
    return undefined;
  }, [spinning, reels]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {displayReels.map((idx, i) => (
          <div
            key={i}
            className="w-16 h-20 md:w-20 md:h-24 flex items-center justify-center rounded-lg text-3xl md:text-4xl"
            style={{
              border: '2px solid var(--pink)',
              backgroundColor: 'var(--bg-mid)',
              boxShadow:
                '0 0 12px color-mix(in srgb, var(--pink) 40%, transparent), inset 0 0 10px color-mix(in srgb, var(--pink) 15%, transparent)',
            }}
          >
            {SLOT_SYMBOLS[idx]}
          </div>
        ))}
      </div>

      {finished && (
        <div
          className="text-center font-cyber tracking-wider"
          style={{
            color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
            textShadow: reward > 0 ? '0 0 8px var(--green)' : 'none',
            animation: reward > 0 ? 'pulse-glow 1.5s ease-in-out infinite' : undefined,
          }}
        >
          {reward >= 3000 ? (
            <div className="text-xl md:text-2xl">大獎 +¥{reward}</div>
          ) : reward >= 500 ? (
            <div className="text-lg">小獎 +¥{reward}</div>
          ) : (
            <div className="text-base">未中奖</div>
          )}
        </div>
      )}

      {!finished && !spinning && (
        <button
          onClick={onSpin}
          className="cyber-btn cyber-btn-pink px-8 py-3 text-lg font-cyber tracking-widest"
        >
          開始
        </button>
      )}

      {spinning && (
        <div className="text-[var(--text-secondary)] font-cyber text-sm tracking-wider">
          转动中...
        </div>
      )}
    </div>
  );
};

// ========== 21点子组件 ==========
interface BlackjackProps {
  playerCards: number[];
  dealerCards: number[];
  finished: boolean;
  reward: number;
  onHit: () => void;
  onStand: () => void;
}

const calcBjTotal = (cards: number[]): number => {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c === 1) {
      aces += 1;
      total += 11;
    } else if (c >= 10) {
      total += 10;
    } else {
      total += c;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
};

const Blackjack: FC<BlackjackProps> = ({
  playerCards,
  dealerCards,
  finished,
  reward,
  onHit,
  onStand,
}) => {
  const playerTotal = calcBjTotal(playerCards);
  const dealerTotal = finished ? calcBjTotal(dealerCards) : 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 庄家 */}
      <div className="text-center w-full">
        <div
          className="text-xs font-cyber tracking-wider mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          庄家 {finished && <span className="text-[var(--cyan)]">({dealerTotal}点)</span>}
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {dealerCards.map((c, i) => {
            const hidden = !finished && i > 0;
            return (
              <div
                key={i}
                className="w-10 h-14 md:w-12 md:h-16 rounded flex items-center justify-center font-cyber text-base md:text-lg"
                style={{
                  border: '1px solid var(--purple)',
                  backgroundColor: hidden ? 'var(--bg-mid)' : 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  boxShadow: hidden
                    ? 'inset 0 0 8px color-mix(in srgb, var(--purple) 20%, transparent)'
                    : '0 0 6px color-mix(in srgb, var(--purple) 30%, transparent)',
                }}
              >
                {hidden ? '?' : c === 1 ? 'A' : c >= 11 ? ['J', 'Q', 'K'][c - 11] : c}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[var(--text-muted)] font-cyber text-xs">VS</div>

      {/* 玩家 */}
      <div className="text-center w-full">
        <div
          className="text-xs font-cyber tracking-wider mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          你的手牌 <span className="text-[var(--cyan)]">({playerTotal}点)</span>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {playerCards.map((c, i) => (
            <div
              key={i}
              className="w-10 h-14 md:w-12 md:h-16 rounded flex items-center justify-center font-cyber text-base md:text-lg"
              style={{
                border: '1px solid var(--cyan)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                boxShadow: '0 0 6px color-mix(in srgb, var(--cyan) 30%, transparent)',
              }}
            >
              {c === 1 ? 'A' : c >= 11 ? ['J', 'Q', 'K'][c - 11] : c}
            </div>
          ))}
        </div>
      </div>

      {finished && (
        <div
          className="text-center font-cyber tracking-wider"
          style={{
            color: reward > 0 ? 'var(--green)' : dealerTotal === playerTotal ? 'var(--yellow)' : 'var(--text-secondary)',
            textShadow: reward > 0 ? '0 0 8px var(--green)' : dealerTotal === playerTotal ? '0 0 6px var(--yellow)' : 'none',
          }}
        >
          {reward > 0 ? (
            <div className="text-lg md:text-xl">獲勝 +¥{reward}</div>
          ) : dealerTotal === playerTotal ? (
            <div className="text-base">平局</div>
          ) : (
            <div className="text-base">失败，无损失</div>
          )}
        </div>
      )}

      {!finished && (
        <div className="flex gap-3">
          <button
            onClick={onHit}
            disabled={playerTotal >= 21}
            className="cyber-btn px-6 py-2 text-sm font-cyber tracking-wide"
          >
            要牌
          </button>
          <button
            onClick={onStand}
            className="cyber-btn cyber-btn-pink px-6 py-2 text-sm font-cyber tracking-wide"
          >
            停牌
          </button>
        </div>
      )}
    </div>
  );
};

// ========== 猜大小子组件 ==========
interface GuessBigSmallProps {
  diceResult: number;
  finished: boolean;
  reward: number;
  onGuessBig: () => void;
  onGuessSmall: () => void;
  onGuessLeopard: (value: number) => void;
}

const DICE_SYMBOLS = ['①', '②', '③', '④', '⑤', '⑥'];

const GuessBigSmall: FC<GuessBigSmallProps> = ({
  diceResult,
  finished,
  reward,
  onGuessBig,
  onGuessSmall,
  onGuessLeopard,
}) => {
  const [rolling, setRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(1);
  const [leopardMode, setLeopardMode] = useState(false);
  const [leopardValue, setLeopardValue] = useState<number>(6);

  useEffect(() => {
    if (finished && diceResult > 0) {
      setRolling(true);
      let count = 0;
      const total = 15;
      const interval = setInterval(() => {
        count += 1;
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        if (count >= total) {
          clearInterval(interval);
          setRolling(false);
          setDisplayValue(diceResult);
        }
      }, 70);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [finished, diceResult]);

  const handleLeopardSubmit = () => {
    onGuessLeopard(leopardValue);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className="w-24 h-24 md:w-28 md:h-28 rounded-xl flex items-center justify-center text-5xl md:text-6xl"
        style={{
          border: `2px solid ${finished ? (reward > 0 ? 'var(--green)' : 'var(--red)') : 'var(--cyan)'}`,
          backgroundColor: 'var(--bg-mid)',
          boxShadow: `0 0 20px color-mix(in srgb, ${finished ? (reward > 0 ? 'var(--green)' : 'var(--red)') : 'var(--cyan)'} 40%, transparent), inset 0 0 15px color-mix(in srgb, ${finished ? (reward > 0 ? 'var(--green)' : 'var(--red)') : 'var(--cyan)'} 15%, transparent)`,
          animation: rolling ? 'dice-roll 0.3s linear infinite' : finished ? 'pulse-glow 1.5s ease-in-out infinite' : undefined,
        }}
      >
        {rolling ? '骰' : DICE_SYMBOLS[displayValue - 1]}
      </div>

      {rolling && (
        <div className="text-[var(--text-secondary)] font-cyber text-sm">掷骰中...</div>
      )}

      {finished && !rolling && (
        <div className="text-center">
          <div
            className="font-cyber text-lg tracking-wider mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            结果：{diceResult} 点
          </div>
          <div
            className="font-cyber tracking-wider"
            style={{
              color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
              textShadow: reward > 0 ? '0 0 8px var(--green)' : 'none',
            }}
          >
            {reward > 0 ? `猜對 +¥${reward}` : '猜錯了'}
          </div>
        </div>
      )}

      {!finished && !rolling && (
        <>
          {!leopardMode ? (
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <div className="flex gap-2">
                <button
                  onClick={onGuessSmall}
                  className="flex-1 cyber-btn py-3 text-base font-cyber tracking-wide"
                  style={{
                    borderColor: 'var(--blue)',
                    color: 'var(--blue)',
                    backgroundColor: 'color-mix(in srgb, var(--blue) 8%, transparent)',
                  }}
                >
                  小 (1-3)
                </button>
                <button
                  onClick={onGuessBig}
                  className="flex-1 cyber-btn cyber-btn-pink py-3 text-base font-cyber tracking-wide"
                >
                  大 (4-6)
                </button>
              </div>
              <button
                onClick={() => setLeopardMode(true)}
                className="cyber-btn py-2 text-sm font-cyber tracking-wide w-full"
                style={{
                  borderColor: 'var(--yellow)',
                  color: 'var(--yellow)',
                  backgroundColor: 'color-mix(in srgb, var(--yellow) 8%, transparent)',
                }}
              >
                豹子（猜具體點數，獎勵翻倍）
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <div
                className="text-xs font-cyber tracking-wider"
                style={{ color: 'var(--yellow)' }}
              >
                 選擇豹子点数
              </div>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setLeopardValue(n)}
                    className="w-10 h-10 rounded-lg text-xl font-cyber transition-all hover:scale-110"
                    style={{
                      border: leopardValue === n
                        ? '2px solid var(--yellow)'
                        : '1px solid var(--border-neon-cyan)',
                      backgroundColor: leopardValue === n
                        ? 'color-mix(in srgb, var(--yellow) 20%, transparent)'
                        : 'var(--bg-mid)',
                      color: leopardValue === n ? 'var(--yellow)' : 'var(--text-primary)',
                      boxShadow: leopardValue === n
                        ? '0 0 10px color-mix(in srgb, var(--yellow) 50%, transparent)'
                        : 'none',
                    }}
                  >
                    {DICE_SYMBOLS[n - 1]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setLeopardMode(false)}
                  className="flex-1 cyber-btn py-2 text-sm font-cyber"
                >
                  返回
                </button>
                <button
                  onClick={handleLeopardSubmit}
                  className="flex-1 cyber-btn cyber-btn-pink py-2 text-sm font-cyber"
                >
                   確認
                </button>
              </div>
              <div
                className="text-[10px] font-cyber"
                style={{ color: 'var(--text-muted)' }}
              >
                奖励：猜对获得双倍奖金
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ========== 主弹窗组件 ==========
const MiniGameModal: FC<MiniGameModalProps> = ({
  open,
  miniGameState,
  onAction,
  onClose,
}) => {
  if (!open) return null;

  const { type, finished, reward, reels, spinning, playerCards, dealerCards, diceResult,
    memoryCards, memoryFlipped, memoryMatched, memoryTimeLeft, memoryMoves,
    rhythmNotes, rhythmHitCount, rhythmTotalNotes,
    shootingTargets, shootingBullets,
    minerScore, minerCombo, minerTimeLeft, minerPlaying,
    firewallRound, firewallLives, firewallShowing, firewallSequence, firewallPlayerInput,
    racerLane, racerTimeLeft, racerPlaying, racerObstacles, racerSpeed,
    auctionItems, auctionCurrentItem, auctionAiBid, auctionAiThinking, auctionPlayerPassed,
  } = miniGameState;
  const gameName = MINIGAME_NAMES[type] ?? '迷你遊戲';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)',
        backdropFilter: 'blur(4px)',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          border: '1px solid var(--purple)',
          boxShadow:
            '0 0 30px color-mix(in srgb, var(--purple) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--purple) 5%, transparent)',
          animation: 'float-up 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'color-mix(in srgb, var(--purple) 30%, transparent)' }}
        >
          <div>
            <div className="text-[10px] font-cyber text-[var(--text-secondary)] tracking-widest mb-1">
              MINI GAME
            </div>
            <h2
              className="font-cyber text-xl tracking-wider"
              style={{
                color: 'var(--purple)',
                textShadow: '0 0 8px color-mix(in srgb, var(--purple) 60%, transparent)',
              }}
            >
              {gameName}
            </h2>
          </div>
          {finished && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Game area */}
        <div className="p-5 md:p-6 flex flex-col items-center">
          {type === 'slot_machine' && (
            <SlotMachine
              reels={reels ?? [0, 0, 0]}
              spinning={!!spinning}
              finished={finished}
              reward={reward}
              onSpin={() => onAction('spin_slots')}
            />
          )}

          {type === 'blackjack' && (
            <Blackjack
              playerCards={playerCards ?? []}
              dealerCards={dealerCards ?? []}
              finished={finished}
              reward={reward}
              onHit={() => onAction('blackjack_hit')}
              onStand={() => onAction('blackjack_stand')}
            />
          )}

          {type === 'guess_number' && (
            <GuessBigSmall
              diceResult={diceResult ?? 0}
              finished={finished}
              reward={reward}
              onGuessBig={() => onAction('guess_big')}
              onGuessSmall={() => onAction('guess_small')}
              onGuessLeopard={(value) => onAction('guess_leopard', { value })}
            />
          )}

          {type === 'memory_match' && (
            <MemoryMatchGame
              cards={memoryCards ?? []}
              finished={finished}
              reward={reward}
              timeLeft={memoryTimeLeft ?? 30}
              moves={memoryMoves ?? 0}
              matched={memoryMatched ?? []}
              onFlip={(index) => onAction('memory_flip', { index })}
              onCheckMatch={() => onAction('memory_check_match')}
              onFinish={() => onAction('memory_finish')}
            />
          )}

          {type === 'rhythm_master' && (
            <RhythmMasterGame
              notes={rhythmNotes ?? []}
              finished={finished}
              reward={reward}
              hitCount={rhythmHitCount ?? 0}
              totalNotes={rhythmTotalNotes ?? 10}
              onStart={() => onAction('rhythm_start')}
              onHit={(noteId) => onAction('rhythm_hit', { noteId })}
              onFinish={() => onAction('rhythm_finish')}
            />
          )}

          {type === 'shooting_challenge' && (
            <ShootingChallengeGame
              targets={shootingTargets ?? []}
              finished={finished}
              reward={reward}
              bullets={shootingBullets ?? 3}
              onShoot={(targetId) => onAction('shooting_shoot', { targetId })}
            />
          )}

          {type === 'data_miner' && (
            <DataMinerGame
              score={minerScore ?? 0}
              combo={minerCombo ?? 0}
              timeLeft={minerTimeLeft ?? 15}
              playing={!!minerPlaying}
              finished={finished}
              reward={reward}
              onStart={() => onAction('miner_start')}
              onHit={(points) => onAction('miner_hit', { points })}
              onTick={(timeLeft) => onAction('miner_tick', { timeLeft })}
              onFinish={() => onAction('miner_finish')}
            />
          )}

          {type === 'firewall_breach' && (
            <FirewallBreachGame
              round={firewallRound ?? 1}
              lives={firewallLives ?? 3}
              showing={!!firewallShowing}
              sequence={firewallSequence ?? []}
              playerInput={firewallPlayerInput ?? []}
              finished={finished}
              reward={reward}
              onStart={() => onAction('firewall_start')}
              onShowSequence={() => onAction('firewall_show')}
              onPlayerInput={(index) => onAction('firewall_input', { index })}
              onNextRound={() => onAction('firewall_next')}
              onFinish={(success) => onAction('firewall_finish', { success })}
            />
          )}

          {type === 'cyber_racer' && (
            <CyberRacerGame
              lane={racerLane ?? 1}
              timeLeft={racerTimeLeft ?? 30}
              playing={!!racerPlaying}
              obstacles={racerObstacles ?? []}
              speed={racerSpeed ?? 1.5}
              finished={finished}
              reward={reward}
              onStart={() => onAction('racer_start')}
              onMove={(lane) => onAction('racer_move', { lane })}
              onTick={(timeLeft, obstacles, speed) => onAction('racer_tick', { timeLeft, obstacles, speed })}
              onCrash={() => onAction('racer_crash')}
              onFinish={() => onAction('racer_finish')}
            />
          )}

          {type === 'auction_master' && (
            <AuctionMasterGame
              items={(auctionItems ?? []) as Array<{ id: number; name: string; minBid: number; value: number; icon: 'coins' | 'item' | 'mystery'; won?: boolean; bidAmount?: number }>}
              currentItem={auctionCurrentItem ?? 0}
              aiBid={auctionAiBid ?? 0}
              aiThinking={!!auctionAiThinking}
              playerPassed={!!auctionPlayerPassed}
              finished={finished}
              reward={reward}
              onStart={() => onAction('auction_start')}
              onPlayerBid={() => onAction('auction_bid')}
              onPlayerPass={() => onAction('auction_pass')}
              onNextItem={() => onAction('auction_next')}
            />
          )}
        </div>

        {/* 奖励飞入动画提示 */}
        {finished && reward > 0 && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-cyber text-3xl font-bold"
            style={{
              color: 'var(--green)',
              textShadow: '0 0 20px var(--green), 0 0 40px var(--green)',
              animation: 'float-up 1s ease-out forwards',
            }}
          >
            +¥{reward}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGameModal;
