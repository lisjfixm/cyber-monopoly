import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { Database, Zap, Timer } from 'lucide-react';

interface DataBlock {
  id: number;
  x: number;
  y: number;
  size: number;
  value: number;
  spawned: number;
  lifetime: number;
}

interface DataMinerGameProps {
  score: number;
  combo: number;
  timeLeft: number;
  playing: boolean;
  finished: boolean;
  reward: number;
  onStart: () => void;
  onHit: (points: number) => void;
  onTick: (timeLeft: number) => void;
  onFinish: () => void;
}

const ARENA_W = 300;
const ARENA_H = 220;
const GAME_DURATION = 15;

const DataMinerGame: FC<DataMinerGameProps> = ({
  score,
  combo,
  timeLeft,
  playing,
  finished,
  reward,
  onStart,
  onHit,
  onTick,
  onFinish,
}) => {
  const [blocks, setBlocks] = useState<DataBlock[]>([]);
  const [localScore, setLocalScore] = useState<number>(0);
  const [localCombo, setLocalCombo] = useState<number>(0);
  const [localTime, setLocalTime] = useState<number>(GAME_DURATION);
  const [popups, setPopups] = useState<Array<{ id: number; x: number; y: number; value: number }>>([]);
  const blockIdRef = useRef<number>(0);
  const popupIdRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);

  const spawnBlock = useCallback((now: number) => {
    const size = 28 + Math.random() * 20;
    const x = 10 + Math.random() * (ARENA_W - size - 20);
    const y = 10 + Math.random() * (ARENA_H - size - 20);
    const value = Math.random() < 0.15 ? 3 : Math.random() < 0.4 ? 2 : 1;
    const lifetime = value === 1 ? 2000 : value === 2 ? 1500 : 1000;
    blockIdRef.current += 1;
    const newBlock: DataBlock = {
      id: blockIdRef.current,
      x,
      y,
      size,
      value,
      spawned: now,
      lifetime,
    };
    setBlocks((prev) => [...prev, newBlock]);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (finishedRef.current) return;
    const elapsed = timestamp - startTimeRef.current;
    const remaining = Math.max(0, GAME_DURATION - elapsed / 1000);
    setLocalTime(remaining);
    onTick(remaining);

    const spawnInterval = remaining < 5 ? 500 : remaining < 10 ? 700 : 900;
    if (timestamp - lastSpawnRef.current > spawnInterval) {
      spawnBlock(timestamp);
      lastSpawnRef.current = timestamp;
    }

    setBlocks((prev) => prev.filter((b) => timestamp - b.spawned < b.lifetime));

    setPopups((prev) => prev.filter((p) => timestamp - p.id < 800));

    if (remaining <= 0) {
      finishedRef.current = true;
      onFinish();
      return;
    }
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [onTick, onFinish, spawnBlock]);

  const handleStart = useCallback(() => {
    setBlocks([]);
    setLocalScore(0);
    setLocalCombo(0);
    setLocalTime(GAME_DURATION);
    setPopups([]);
    finishedRef.current = false;
    blockIdRef.current = 0;
    startTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    onStart();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [onStart, gameLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleBlockClick = (block: DataBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    if (finishedRef.current) return;
    setBlocks((prev) => prev.filter((b) => b.id !== block.id));
    const newCombo = localCombo + 1;
    const comboBonus = Math.floor(newCombo / 5);
    const points = block.value + comboBonus;
    setLocalScore((s) => s + points);
    setLocalCombo(newCombo);
    onHit(points);
    popupIdRef.current = Date.now() + Math.random();
    setPopups((prev) => [
      ...prev,
      { id: popupIdRef.current, x: block.x + block.size / 2, y: block.y, value: points },
    ]);
  };

  const getBlockColor = (value: number): string => {
    if (value >= 3) return 'var(--pink)';
    if (value >= 2) return 'var(--cyan)';
    return 'var(--green)';
  };

  const formatTime = (t: number): string => t.toFixed(1);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: 'var(--cyan)' }}>
          <Database className="w-4 h-4" />
          <span>{Math.floor(localScore)}</span>
        </div>
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: 'var(--yellow)' }}>
          <Zap className="w-4 h-4" />
          <span>x{localCombo}</span>
        </div>
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: localTime < 5 ? 'var(--red)' : 'var(--text-secondary)' }}>
          <Timer className="w-4 h-4" />
          <span>{formatTime(localTime)}s</span>
        </div>
      </div>

      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          width: ARENA_W,
          height: ARENA_H,
          backgroundColor: 'var(--bg-mid)',
          border: '1px solid var(--border-neon-cyan)',
          boxShadow: 'inset 0 0 20px color-mix(in srgb, var(--cyan) 10%, transparent)',
        }}
      >
        {!playing && !finished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Database className="w-12 h-12" style={{ color: 'var(--cyan)' }} />
            <div className="font-cyber text-lg tracking-wider" style={{ color: 'var(--text-primary)' }}>
              數據挖掘
            </div>
            <div className="text-xs text-center px-4" style={{ color: 'var(--text-secondary)' }}>
              點擊數據塊挖取資料<br />
              連擊越多，得分越高
            </div>
            <button
              onClick={handleStart}
              className="cyber-btn cyber-btn-pink px-6 py-2 font-cyber tracking-wider mt-2"
            >
              開始挖掘
            </button>
          </div>
        )}

        {playing &&
          blocks.map((block) => {
            const age = performance.now() - block.spawned;
            const fadeIn = Math.min(1, age / 200);
            const fadeOut = age > block.lifetime - 300 ? Math.max(0, (block.lifetime - age) / 300) : 1;
            const opacity = Math.min(fadeIn, fadeOut);
            return (
              <button
                key={block.id}
                onClick={(e) => handleBlockClick(block, e)}
                className="absolute rounded-md flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
                style={{
                  left: block.x,
                  top: block.y,
                  width: block.size,
                  height: block.size,
                  backgroundColor: `color-mix(in srgb, ${getBlockColor(block.value)} 25%, transparent)`,
                  border: `2px solid ${getBlockColor(block.value)}`,
                  boxShadow: `0 0 10px color-mix(in srgb, ${getBlockColor(block.value)} 60%, transparent)`,
                  opacity,
                  color: getBlockColor(block.value),
                  fontSize: block.size * 0.5,
                  fontWeight: 'bold',
                }}
              >
                {block.value}
              </button>
            );
          })}

        {playing &&
          popups.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none font-cyber font-bold text-sm"
              style={{
                left: p.x,
                top: p.y,
                color: 'var(--green)',
                textShadow: '0 0 6px var(--green)',
                animation: 'float-up 0.8s ease-out forwards',
                transform: 'translateX(-50%)',
              }}
            >
              +{p.value}
            </div>
          ))}

        {finished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-deep) 80%, transparent)' }}
          >
            <div className="font-cyber text-xl tracking-wider" style={{ color: 'var(--cyan)' }}>
              挖掘結束
            </div>
            <div className="font-cyber text-3xl font-bold" style={{ color: 'var(--green)', textShadow: '0 0 10px var(--green)' }}>
              {Math.floor(score)} 點
            </div>
            <div className="font-cyber text-base" style={{ color: 'var(--yellow)' }}>
              {reward > 0 ? `+¥${reward}` : '未達最低獎勵'}
            </div>
          </div>
        )}
      </div>

      {finished && (
        <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          每點 x50 現金，滿 20 點獲得隨機道具
        </div>
      )}
    </div>
  );
};

export default DataMinerGame;
