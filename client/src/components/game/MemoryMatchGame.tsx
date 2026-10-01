import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

const CARD_EMOJIS = ['💎', '🎲', '🎯', '🌟', '🔥', '⚡'];

interface MemoryMatchGameProps {
  cards: number[];
  finished: boolean;
  reward: number;
  timeLeft: number;
  moves: number;
  matched: number[];
  onFlip: (index: number) => void;
  onCheckMatch: () => void;
  onFinish: () => void;
}

const MemoryMatchGame: FC<MemoryMatchGameProps> = ({
  cards,
  finished,
  reward,
  timeLeft,
  moves,
  matched,
  onFlip,
  onCheckMatch,
  onFinish,
}) => {
  const [localCards, setLocalCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [displayTime, setDisplayTime] = useState<number>(timeLeft);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchedSet = new Set(matched);

  // 初始化卡片：若 props 有卡片则用 props，否则本地生成
  useEffect(() => {
    if (cards.length > 0) {
      setLocalCards(cards);
    } else if (localCards.length === 0) {
      const pairs: number[] = [];
      for (let i = 0; i < 6; i++) pairs.push(i, i);
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      setLocalCards(pairs);
    }
  }, [cards, localCards.length]);

  useEffect(() => {
    if (gameStarted && !finished && displayTime > 0) {
      timerRef.current = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return undefined;
  }, [gameStarted, finished, displayTime > 0]);

  useEffect(() => {
    if (displayTime === 0 && gameStarted && !finished) {
      onFinish();
    }
  }, [displayTime, gameStarted, finished, onFinish]);

  useEffect(() => {
    if (matchedSet.size >= 12 && !finished) {
      timeoutRef.current = setTimeout(() => onFinish(), 500);
    }
   }, [matchedSet.size, finished, onFinish]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (isChecking || finished) return;
    if (flipped.includes(index)) return;
    if (matchedSet.has(index)) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    onFlip(index);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [a, b] = newFlipped;
    const isMatch = localCards[a] === localCards[b];
      timeoutRef.current = setTimeout(() => {
        onCheckMatch();
        setFlipped([]);
        setIsChecking(false);
        if (isMatch) {
          // 匹配成功，不做额外处理，matched 会从 props 更新
        }
      }, 800);
    }
  };

  const isCardFlipped = (index: number): boolean => {
    return flipped.includes(index) || matchedSet.has(index);
  };

  const matchedPairs = Math.floor(matchedSet.size / 2);

  if (localCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--text-secondary)] font-cyber">
        載入中...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 状态栏 */}
      <div className="flex justify-between w-full max-w-xs px-1">
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--cyan)' }}
        >
          ⏱ {displayTime}s
        </div>
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          翻牌：{Math.floor(moves)}
        </div>
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--pink)' }}
        >
          配对：{matchedPairs}/6
        </div>
      </div>

      {/* 卡片网格 */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {localCards.map((cardValue, idx) => {
          const flippedOrMatched = isCardFlipped(idx);
          const isMatched = matchedSet.has(idx);
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              disabled={finished || isMatched || (flipped.length >= 2 && !flippedOrMatched)}
              className="w-14 h-16 md:w-16 md:h-20 rounded-lg flex items-center justify-center text-2xl md:text-3xl transition-all duration-300"
              style={{
                border: isMatched
                  ? '2px solid var(--green)'
                  : flippedOrMatched
                    ? '2px solid var(--cyan)'
                    : '2px solid var(--purple)',
                backgroundColor: flippedOrMatched ? 'var(--bg-mid)' : 'var(--bg-card)',
                boxShadow: isMatched
                  ? '0 0 12px color-mix(in srgb, var(--green) 50%, transparent), inset 0 0 8px color-mix(in srgb, var(--green) 20%, transparent)'
                  : flippedOrMatched
                    ? '0 0 10px color-mix(in srgb, var(--cyan) 40%, transparent), inset 0 0 6px color-mix(in srgb, var(--cyan) 20%, transparent)'
                    : 'inset 0 0 8px color-mix(in srgb, var(--purple) 20%, transparent)',
                transform: flippedOrMatched ? 'scale(1)' : 'scale(1)',
                cursor: isMatched ? 'default' : 'pointer',
              }}
            >
              {flippedOrMatched ? CARD_EMOJIS[cardValue] : '?'}
            </button>
          );
        })}
      </div>

      {finished && (
        <div
          className="text-center font-cyber tracking-wider"
          style={{
            color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
            textShadow: reward > 0 ? '0 0 8px var(--green)' : 'none',
          }}
        >
          {reward >= 1000 ? (
            <div className="text-xl md:text-2xl">🎉 全對 +¥{reward}</div>
          ) : reward >= 500 ? (
            <div className="text-lg">✨ 不錯 +¥{reward}</div>
          ) : reward >= 200 ? (
            <div className="text-base">還行 +¥{reward}</div>
          ) : (
            <div className="text-base">時間到，無獎勵</div>
          )}
        </div>
      )}

      {!gameStarted && !finished && (
        <button
          onClick={() => setGameStarted(true)}
          className="cyber-btn cyber-btn-pink px-8 py-3 text-lg font-cyber tracking-widest"
        >
          開始
        </button>
      )}
    </div>
  );
};

export default MemoryMatchGame;
