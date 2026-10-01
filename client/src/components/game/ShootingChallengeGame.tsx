import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

interface ShootingTarget {
  id: number;
  x: number;
  y: number;
  speed: number;
  hit: boolean;
}

interface ShootingChallengeGameProps {
  targets: ShootingTarget[];
  finished: boolean;
  reward: number;
  bullets: number;
  onShoot: (targetId?: number) => void;
}

const AREA_WIDTH = 320;
const AREA_HEIGHT = 200;
const TARGET_SIZE = 36;
const TICK_INTERVAL = 40;

const ShootingChallengeGame: FC<ShootingChallengeGameProps> = ({
  targets,
  finished,
  reward,
  bullets,
  onShoot,
}) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [localTargets, setLocalTargets] = useState<ShootingTarget[]>([]);
  const [localBullets, setLocalBullets] = useState<number>(bullets);
  const [localHits, setLocalHits] = useState<number>(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [muzzleFlash, setMuzzleFlash] = useState<boolean>(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef<boolean>(false);

  const hitCount = targets.filter((t) => t.hit).length;

  useEffect(() => {
    if (!gameStarted || finished) return;

    let initialTargets: ShootingTarget[];
    if (targets.length > 0) {
      initialTargets = targets.map((t, idx) => ({
        ...t,
        x: -30 - idx * 60 - Math.random() * 40,
        y: 15 + Math.random() * 70,
        speed: t.speed,
      }));
    } else {
      // 本地生成靶标
      initialTargets = [];
      for (let i = 0; i < 5; i++) {
        initialTargets.push({
          id: i,
          x: -30 - i * 60 - Math.random() * 40,
          y: 15 + Math.random() * 70,
          speed: 0.8 + Math.random() * 0.8 + i * 0.15,
          hit: false,
        });
      }
    }
    setLocalTargets(initialTargets);
    setLocalBullets(bullets);
    setLocalHits(0);
    finishedRef.current = false;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || finished) return;

    intervalRef.current = setInterval(() => {
      setLocalTargets((prev) => {
        const updated = prev.map((t) => {
          if (t.hit) return t;
          const newX = t.x + t.speed * 2;
          // 如果飞出右侧，从左侧重新进入
          if (newX > 110) {
            return {
              ...t,
              x: -10 - Math.random() * 20,
              y: 15 + Math.random() * 70,
              speed: t.speed + 0.1, // 速度递增
            };
          }
          return { ...t, x: newX };
        });
        return updated;
      });
    }, TICK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameStarted, finished]);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || finished || localBullets <= 0) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 100);

    // 检查是否命中任何靶标
    let hitTargetId: number | undefined;
    for (const t of localTargets) {
      if (t.hit) continue;
      const targetRadiusPercentX = ((TARGET_SIZE / 2) / AREA_WIDTH) * 100;
      const targetRadiusPercentY = ((TARGET_SIZE / 2) / AREA_HEIGHT) * 100;
      const dx = clickX - t.x;
      const dy = clickY - t.y;
      const dist = Math.sqrt(
        Math.pow(dx / targetRadiusPercentX, 2) +
          Math.pow(dy / targetRadiusPercentY, 2),
      );
      if (dist < 1.2) {
        hitTargetId = t.id;
        break;
      }
    }

    if (hitTargetId !== undefined) {
      setLocalTargets((prev) =>
        prev.map((t) => (t.id === hitTargetId ? { ...t, hit: true } : t)),
      );
      setLocalHits((prev) => prev + 1);
    }

    const newBullets = localBullets - 1;
    setLocalBullets(newBullets);
    onShoot(hitTargetId);

    if (newBullets <= 0 && !finishedRef.current) {
      finishedRef.current = true;
      // 子弹用完自动结算（服务端会处理）
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleStart = () => {
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* 状态栏 */}
      <div className="flex justify-between w-full max-w-xs px-1">
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--cyan)' }}
        >
          🔫 子彈：{localBullets}/{bullets + (targets.length > 0 ? 0 : 0)}
        </div>
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--pink)' }}
        >
          命中：{Math.max(localHits, hitCount)}
        </div>
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          最高 1200
        </div>
      </div>

      {/* 靶场区域 */}
      <div
        ref={gameAreaRef}
        onClick={handleAreaClick}
        onMouseMove={handleMouseMove}
        className="relative rounded-lg overflow-hidden"
        style={{
          width: '100%',
          maxWidth: `${AREA_WIDTH}px`,
          height: `${AREA_HEIGHT}px`,
          border: '2px solid var(--red)',
          backgroundColor: 'var(--bg-mid)',
          cursor: gameStarted && !finished && localBullets > 0 ? 'crosshair' : 'default',
          boxShadow:
            '0 0 12px color-mix(in srgb, var(--red) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--red) 10%, transparent)',
          transition: 'box-shadow 0.1s',
        }}
      >
        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(color-mix(in srgb, var(--red) 30%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--red) 30%, transparent) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* 靶标 */}
        {gameStarted &&
          localTargets.map((t) => {
            if (t.hit) return null;
            return (
              <div
                key={t.id}
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: `${TARGET_SIZE}px`,
                  height: `${TARGET_SIZE}px`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'var(--red)',
                  boxShadow: `0 0 12px var(--red), inset 0 0 8px color-mix(in srgb, var(--pink) 50%, transparent)`,
                  border: '2px solid var(--pink)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--bg-deep)' }}
                />
              </div>
            );
          })}

        {/* 命中标记 */}
        {gameStarted &&
          localTargets.map((t) => {
            if (!t.hit) return null;
            return (
              <div
                key={`hit-${t.id}`}
                className="absolute text-xl"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: 'var(--green)',
                  textShadow: '0 0 8px var(--green)',
                  animation: 'pulse-glow 0.5s ease-out',
                }}
              >
                ✦
              </div>
            );
          })}

        {/* 准心 */}
        {gameStarted && !finished && localBullets > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="relative"
              style={{
                width: '24px',
                height: '24px',
                opacity: muzzleFlash ? 1 : 0.7,
              }}
            >
              <div
                className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2"
                style={{ backgroundColor: 'var(--red)' }}
              />
              <div
                className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
                style={{ backgroundColor: 'var(--red)' }}
              />
              <div
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  border: '1px solid var(--red)',
                }}
              />
            </div>
          </div>
        )}

        {/* 枪口闪光效果 */}
        {muzzleFlash && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--red) 20%, transparent)',
            }}
          />
        )}
      </div>

      {finished && (
        <div
          className="text-center font-cyber tracking-wider"
          style={{
            color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
            textShadow: reward > 0 ? '0 0 8px var(--green)' : 'none',
          }}
        >
          {reward >= 1200 ? (
            <div className="text-xl md:text-2xl">🎯 神槍手 +¥{reward}</div>
          ) : reward >= 600 ? (
            <div className="text-lg">✨ 不錯 +¥{reward}</div>
          ) : reward >= 200 ? (
            <div className="text-base">還行 +¥{reward}</div>
          ) : (
            <div className="text-base">全部射偏，無獎勵</div>
          )}
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            命中：{Math.max(localHits, hitCount)} 個
          </div>
        </div>
      )}

      {!gameStarted && !finished && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleStart}
            className="cyber-btn cyber-btn-pink px-8 py-3 text-lg font-cyber tracking-widest"
          >
            開始
          </button>
          <div
            className="text-[10px] font-cyber"
            style={{ color: 'var(--text-secondary)' }}
          >
            點擊移動靶標射擊，共 {bullets} 發子彈
          </div>
        </div>
      )}
    </div>
  );
};

export default ShootingChallengeGame;
