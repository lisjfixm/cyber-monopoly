import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { Shield, Heart, Lock } from 'lucide-react';

interface FirewallBreachGameProps {
  round: number;
  lives: number;
  showing: boolean;
  sequence: number[];
  playerInput: number[];
  finished: boolean;
  reward: number;
  onStart: () => void;
  onShowSequence: () => void;
  onPlayerInput: (index: number) => void;
  onNextRound: () => void;
  onFinish: (success: boolean) => void;
}

const GRID_SIZE = 6;
const ROUND_LENGTHS = [4, 6, 8];

const FirewallBreachGame: FC<FirewallBreachGameProps> = ({
  round,
  lives,
  showing,
  sequence,
  playerInput,
  finished,
  reward,
  onStart,
  onShowSequence,
  onPlayerInput,
  onNextRound,
  onFinish,
}) => {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [canInput, setCanInput] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showingRef = useRef<boolean>(false);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const playSequence = useCallback((seq: number[]) => {
    if (showingRef.current) return;
    showingRef.current = true;
    setCanInput(false);
    onShowSequence();
    let idx = 0;

    const showNext = () => {
      if (idx >= seq.length) {
        setHighlighted(null);
        showingRef.current = false;
        setCanInput(true);
        setStatusText('輪到你了！按順序點擊');
        return;
      }
      setHighlighted(seq[idx] ?? 0);
      timeoutRef.current = setTimeout(() => {
        setHighlighted(null);
        timeoutRef.current = setTimeout(() => {
          idx += 1;
          showNext();
        }, 150);
      }, 450);
    };
    timeoutRef.current = setTimeout(showNext, 500);
  }, [onShowSequence]);

  const handleStart = useCallback(() => {
    clearTimeouts();
    setGameStarted(true);
    setStatusText('');
    setWrongFlash(null);
    onStart();
  }, [clearTimeouts, onStart]);

  useEffect(() => {
    if (gameStarted && showing && sequence.length > 0 && !canInput) {
      playSequence(sequence);
    }
    return () => { clearTimeouts(); };
  }, [gameStarted, showing, sequence, canInput, playSequence, clearTimeouts]);

  useEffect(() => {
    if (!gameStarted || canInput || showingRef.current) return;
    if (sequence.length === 0) return;
    if (playerInput.length === sequence.length && round < ROUND_LENGTHS.length) {
      setCanInput(false);
      setStatusText(`第 ${round} 輪通過！`);
      timeoutRef.current = setTimeout(() => {
        onNextRound();
      }, 1200);
    }
    return () => { clearTimeouts(); };
  }, [playerInput.length, sequence.length, round, canInput, gameStarted, onNextRound, clearTimeouts]);

  const handleCellClick = (index: number) => {
    if (!canInput || showingRef.current || finished) return;
    if (playerInput.length >= sequence.length) return;

    const expected = sequence[playerInput.length];
    if (index === expected) {
      setHighlighted(index);
      setTimeout(() => setHighlighted(null), 150);
      onPlayerInput(index);
    } else {
      setWrongFlash(index);
      setCanInput(false);
      setStatusText('錯誤！');
      setTimeout(() => setWrongFlash(null), 300);
      timeoutRef.current = setTimeout(() => {
        if (lives <= 1) {
          onFinish(false);
        } else {
          setStatusText(`剩餘 ${lives - 1} 條生命，重試本輪`);
          setTimeout(() => {
            playSequence(sequence);
          }, 800);
        }
      }, 800);
    }
  };

  const getRoundReward = (r: number): number => {
    const rewards = [200, 400, 800];
    return rewards[r - 1] ?? 0;
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: 'var(--purple)' }}>
          <Shield className="w-4 h-4" />
          <span>第 {Math.max(1, round)} / 3 輪</span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className="w-4 h-4"
              style={{
                color: i < lives ? 'var(--red)' : 'var(--text-muted)',
                fill: i < lives ? 'var(--red)' : 'none',
                opacity: i < lives ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {statusText && (
        <div className="font-cyber text-sm tracking-wider" style={{ color: 'var(--yellow)' }}>
          {statusText}
        </div>
      )}

      <div
        className="grid gap-1.5 p-3 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(3, 1fr)`,
          backgroundColor: 'var(--bg-mid)',
          border: '1px solid var(--border-neon-pink)',
          boxShadow: 'inset 0 0 15px color-mix(in srgb, var(--purple) 10%, transparent)',
        }}
      >
        {!gameStarted && !finished && (
          <div className="col-span-3 flex flex-col items-center justify-center gap-2 py-6">
            <Lock className="w-10 h-10" style={{ color: 'var(--purple)' }} />
            <div className="font-cyber text-lg tracking-wider" style={{ color: 'var(--text-primary)' }}>
              防火牆突破
            </div>
            <div className="text-xs text-center px-4" style={{ color: 'var(--text-secondary)' }}>
              記住閃爍的密碼格順序<br />
              3 條生命，通過 3 輪
            </div>
            <button
              onClick={handleStart}
              className="cyber-btn cyber-btn-pink px-6 py-2 font-cyber tracking-wider mt-2"
            >
              開始破解
            </button>
          </div>
        )}

        {(gameStarted || finished) &&
          [...Array(GRID_SIZE)].map((_, i) => {
            const isHighlighted = highlighted === i;
            const isWrong = wrongFlash === i;
            const isClicked = playerInput.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={!canInput}
                className="w-16 h-16 md:w-18 md:h-18 rounded-md flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isHighlighted
                    ? 'var(--cyan)'
                    : isWrong
                    ? 'var(--red)'
                    : isClicked && canInput
                    ? 'color-mix(in srgb, var(--green) 30%, transparent)'
                    : 'var(--bg-dark)',
                  border: `2px solid ${isHighlighted ? 'var(--cyan-glow)' : isWrong ? 'var(--red)' : 'var(--border-neon-pink)'}`,
                  boxShadow: isHighlighted
                    ? '0 0 20px var(--cyan), inset 0 0 10px var(--cyan-glow)'
                    : isWrong
                    ? '0 0 15px var(--red)'
                    : 'none',
                  cursor: canInput ? 'pointer' : 'default',
                  transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span className="font-cyber text-lg" style={{ color: isHighlighted || isWrong ? 'var(--bg-deep)' : 'var(--text-muted)' }}>
                  {i + 1}
                </span>
              </button>
            );
          })}
      </div>

      {finished && (
        <div className="flex flex-col items-center gap-1">
          <div className="font-cyber text-xl tracking-wider" style={{ color: reward > 0 ? 'var(--green)' : 'var(--red)' }}>
            {reward >= 1400 ? '破解成功！' : reward > 0 ? '部分通過' : '破解失敗'}
          </div>
          <div className="font-cyber text-2xl font-bold" style={{
            color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
            textShadow: reward > 0 ? '0 0 10px var(--green)' : 'none',
          }}>
            {reward > 0 ? `+¥${reward}` : '無獎勵'}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
             第1輪 ¥200 / 第2輪 ¥400 / 第3輪 ¥800
          </div>
        </div>
      )}
    </div>
  );
};

export default FirewallBreachGame;
