import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { ChevronLeft, ChevronRight, Timer, Car } from 'lucide-react';

interface Obstacle {
  id: number;
  lane: number;
  y: number;
}

interface CyberRacerGameProps {
  lane: number;
  timeLeft: number;
  playing: boolean;
  obstacles: Obstacle[];
  speed: number;
  finished: boolean;
  reward: number;
  onStart: () => void;
  onMove: (lane: number) => void;
  onTick: (timeLeft: number, obstacles: Obstacle[], speed: number) => void;
  onCrash: () => void;
  onFinish: () => void;
}

const LANES = 3;
const GAME_DURATION = 30;
const TRACK_WIDTH = 240;
const TRACK_HEIGHT = 280;
const CAR_SIZE = 36;

const CyberRacerGame: FC<CyberRacerGameProps> = ({
  lane,
  timeLeft,
  playing,
  obstacles,
  speed,
  finished,
  reward,
  onStart,
  onMove,
  onTick,
  onCrash,
  onFinish,
}) => {
  const [localLane, setLocalLane] = useState<number>(1);
  const [localTime, setLocalTime] = useState<number>(GAME_DURATION);
  const [localObstacles, setLocalObstacles] = useState<Obstacle[]>([]);
  const [localSpeed, setLocalSpeed] = useState<number>(1.5);
  const [crashed, setCrashed] = useState<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastObstacleRef = useRef<number>(0);
  const obstacleIdRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const trackOffsetRef = useRef<number>(0);

  const gameLoop = useCallback((timestamp: number) => {
    if (finishedRef.current) return;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    setLocalTime(remaining);

    const currentSpeed = 1.5 + elapsed * 0.08;
    setLocalSpeed(currentSpeed);

    trackOffsetRef.current = (trackOffsetRef.current + currentSpeed * 3) % 40;

    const spawnInterval = Math.max(600, 1400 - elapsed * 30);
    if (timestamp - lastObstacleRef.current > spawnInterval) {
      obstacleIdRef.current += 1;
      const newObs: Obstacle = {
        id: obstacleIdRef.current,
        lane: Math.floor(Math.random() * LANES),
        y: -40,
      };
      setLocalObstacles((prev) => [...prev, newObs]);
      lastObstacleRef.current = timestamp;
    }

    setLocalObstacles((prev) => {
      const updated = prev
        .map((o) => ({ ...o, y: o.y + currentSpeed * 4 }))
        .filter((o) => o.y < TRACK_HEIGHT + 40);

      const playerY = TRACK_HEIGHT - CAR_SIZE - 10;
      for (const o of updated) {
        if (o.lane === localLane && o.y + CAR_SIZE > playerY && o.y < playerY + CAR_SIZE) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            setCrashed(true);
            onCrash();
            return updated;
          }
        }
      }
      onTick(remaining, updated, currentSpeed);
      return updated;
    });

    if (remaining <= 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish();
      return;
    }
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [localLane, onCrash, onFinish, onTick]);

  const handleStart = useCallback(() => {
    setLocalLane(1);
    setLocalTime(GAME_DURATION);
    setLocalObstacles([]);
    setLocalSpeed(1.5);
    setCrashed(false);
    finishedRef.current = false;
    obstacleIdRef.current = 0;
    trackOffsetRef.current = 0;
    startTimeRef.current = performance.now();
    lastObstacleRef.current = performance.now();
    onStart();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [onStart, gameLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!playing || finished) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setLocalLane((l) => Math.max(0, l - 1));
        onMove(Math.max(0, localLane - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setLocalLane((l) => Math.min(LANES - 1, l + 1));
        onMove(Math.min(LANES - 1, localLane + 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playing, finished, localLane, onMove]);

  const handleLaneClick = (laneIdx: number) => {
    if (!playing || finished) return;
    setLocalLane(laneIdx);
    onMove(laneIdx);
  };

  const laneWidth = TRACK_WIDTH / LANES;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: 'var(--cyan)' }}>
          <Car className="w-4 h-4" />
          <span>{Math.floor((GAME_DURATION - localTime) / 5) * 100}m</span>
        </div>
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: localTime < 10 ? 'var(--red)' : 'var(--text-secondary)' }}>
          <Timer className="w-4 h-4" />
          <span>{localTime.toFixed(1)}s</span>
        </div>
      </div>

      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          backgroundColor: 'var(--bg-dark)',
          border: '1px solid var(--border-neon-cyan)',
        }}
      >
        {!playing && !finished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-deep) 80%, transparent)' }}
          >
            <Car className="w-12 h-12" style={{ color: 'var(--cyan)' }} />
            <div className="font-cyber text-lg tracking-wider" style={{ color: 'var(--text-primary)' }}>
              賽博賽車
            </div>
            <div className="text-xs text-center px-6" style={{ color: 'var(--text-secondary)' }}>
              左右切換車道，躲避障礙車<br />
              存活 30 秒獲得滿分獎勵
            </div>
            <button
              onClick={handleStart}
              className="cyber-btn cyber-btn-pink px-6 py-2 font-cyber tracking-wider mt-2"
            >
              開始比賽
            </button>
          </div>
        )}

        {[...Array(LANES - 1)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: laneWidth * (i + 1),
              width: 2,
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                var(--text-muted) 0px,
                var(--text-muted) 15px,
                transparent 15px,
                transparent 35px
              )`,
              backgroundPosition: `0 ${trackOffsetRef.current}px`,
              opacity: 0.3,
            }}
          />
        ))}

        {playing && localObstacles.map((o) => (
          <div
            key={o.id}
            className="absolute flex items-center justify-center rounded"
            style={{
              left: o.lane * laneWidth + (laneWidth - CAR_SIZE) / 2,
              top: o.y,
              width: CAR_SIZE,
              height: CAR_SIZE,
              backgroundColor: 'color-mix(in srgb, var(--red) 30%, transparent)',
              border: '2px solid var(--red)',
              boxShadow: '0 0 8px color-mix(in srgb, var(--red) 60%, transparent)',
            }}
          >
            <Car className="w-5 h-5" style={{ color: 'var(--red)' }} />
          </div>
        ))}

        {playing && (
          <div
            className="absolute flex items-center justify-center rounded transition-all duration-75"
            style={{
              left: localLane * laneWidth + (laneWidth - CAR_SIZE) / 2,
              top: TRACK_HEIGHT - CAR_SIZE - 10,
              width: CAR_SIZE,
              height: CAR_SIZE,
              backgroundColor: 'color-mix(in srgb, var(--cyan) 30%, transparent)',
              border: '2px solid var(--cyan)',
              boxShadow: '0 0 12px color-mix(in srgb, var(--cyan) 60%, transparent)',
            }}
          >
            <Car className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          </div>
        )}

        {playing && (
          <div className="absolute bottom-0 left-0 right-0 flex h-16">
            {[...Array(LANES)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleLaneClick(i)}
                className="flex-1 opacity-0 hover:opacity-10"
                style={{ backgroundColor: 'var(--cyan)' }}
              />
            ))}
          </div>
        )}

        {finished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-deep) 85%, transparent)' }}
          >
            <div className="font-cyber text-xl tracking-wider" style={{ color: crashed ? 'var(--red)' : 'var(--green)' }}>
              {crashed ? '撞車了！' : '抵達終點！'}
            </div>
            <div className="font-cyber text-2xl font-bold" style={{
              color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
              textShadow: reward > 0 ? '0 0 10px var(--green)' : 'none',
            }}>
              {reward > 0 ? `+¥${reward}` : '無獎勵'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              每 5 秒 ¥100，撞車獎勵減半
            </div>
          </div>
        )}
      </div>

      {playing && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              const newLane = Math.max(0, localLane - 1);
              setLocalLane(newLane);
              onMove(newLane);
            }}
            className="cyber-btn w-16 h-12 flex items-center justify-center"
            disabled={localLane === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              const newLane = Math.min(LANES - 1, localLane + 1);
              setLocalLane(newLane);
              onMove(newLane);
            }}
            className="cyber-btn w-16 h-12 flex items-center justify-center"
            disabled={localLane === LANES - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CyberRacerGame;
