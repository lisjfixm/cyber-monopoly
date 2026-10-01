import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

interface RhythmNote {
  id: number;
  time: number;
  lane: number;
  hit: boolean;
}

interface RhythmMasterGameProps {
  notes: RhythmNote[];
  finished: boolean;
  reward: number;
  hitCount: number;
  totalNotes: number;
  onStart: () => void;
  onHit: (noteId: number) => void;
  onFinish: () => void;
}

const LANE_COLORS = ['var(--cyan)', 'var(--pink)', 'var(--purple)'];
const LANE_KEYS = ['A', 'S', 'D'];
const GAME_DURATION = 10000; // 10秒游戏时长
const NOTE_FALL_DURATION = 2000; // 音符下落时间
const JUDGE_LINE_PERCENT = 85; // 判定线位置（底部百分比）
const HIT_WINDOW = 15; // 判定窗口（像素容差）

const RhythmMasterGame: FC<RhythmMasterGameProps> = ({
  notes,
  finished,
  reward,
  hitCount,
  totalNotes,
  onStart,
  onHit,
  onFinish,
}) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [localNotes, setLocalNotes] = useState<RhythmNote[]>([]);
  const [localHits, setLocalHits] = useState<Set<number>>(new Set());
  const [localMissed, setLocalMissed] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef<boolean>(false);

  // 同步 props 中的音符到本地
  useEffect(() => {
    if (notes.length > 0 && localNotes.length === 0) {
      setLocalNotes(notes);
    }
  }, [notes, localNotes.length]);

  const activeNotes = localNotes.length > 0 ? localNotes : notes;
  const activeTotalNotes = totalNotes > 0 ? totalNotes : activeNotes.length;
  const hitRate = activeTotalNotes > 0 ? Math.round((hitCount / activeTotalNotes) * 100) : 0;

  useEffect(() => {
    if (!gameStarted || finished) return;

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      setCurrentTime(elapsed);

      // 检查已过判定线的音符（未命中）
      activeNotes.forEach((note) => {
        if (localHits.has(note.id) || localMissed.has(note.id)) return;
        // 音符到达判定线后还没 hit，算 miss
        if (elapsed > note.time + NOTE_FALL_DURATION * 0.2) {
          setLocalMissed((prev) => new Set(prev).add(note.id));
          setCombo(0);
        }
      });

      // 检查游戏是否结束
      const allProcessed =
        localHits.size + localMissed.size >= activeTotalNotes || elapsed > GAME_DURATION + 1000;
      if (allProcessed && !finishedRef.current) {
        finishedRef.current = true;
        setTimeout(() => onFinish(), 500);
        return;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameStarted, startTime, activeNotes, activeTotalNotes, localHits, localMissed, finished, onFinish]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || finished) return;
      const key = e.key.toUpperCase();
      const laneIdx = LANE_KEYS.indexOf(key);
      if (laneIdx >= 0) {
        handleLaneHit(laneIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, finished]);

  const handleLaneHit = (laneIdx: number) => {
    if (!gameStarted || finished) return;

    const elapsed = currentTime;
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    const areaHeight = gameArea.clientHeight;
    const judgeLineY = areaHeight * (JUDGE_LINE_PERCENT / 100);

    // 找当前轨道最接近判定线的未命中音符
    let closestNote: RhythmNote | null = null;
    let closestDist = Infinity;

    activeNotes.forEach((note) => {
      if (note.lane !== laneIdx) return;
      if (localHits.has(note.id) || localMissed.has(note.id)) return;

      // 计算音符当前 Y 位置
      const noteProgress = (elapsed - note.time) / NOTE_FALL_DURATION;
      const noteY = areaHeight * noteProgress;
      const dist = Math.abs(noteY - judgeLineY);

      if (dist < closestDist && dist < 40) {
        closestDist = dist;
        closestNote = note;
      }
    });

    if (closestNote) {
      setLocalHits((prev) => new Set(prev).add(closestNote!.id));
      setCombo((prev) => prev + 1);
      onHit(closestNote.id);
    }
  };

  const handleStart = () => {
    // 若尚未有音符，本地生成
    if (localNotes.length === 0 && notes.length === 0) {
      const newNotes: RhythmNote[] = [];
      for (let i = 0; i < 10; i++) {
        newNotes.push({
          id: i,
          time: 1000 + i * 800 + Math.floor(Math.random() * 300),
          lane: Math.floor(Math.random() * 3),
          hit: false,
        });
      }
      setLocalNotes(newNotes);
    }
    setGameStarted(true);
    setStartTime(performance.now());
    setLocalHits(new Set());
    setLocalMissed(new Set());
    finishedRef.current = false;
    onStart();
  };

  const getNoteY = (note: RhythmNote): number => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return -50;
    const areaHeight = gameArea.clientHeight;
    const noteProgress = (currentTime - note.time) / NOTE_FALL_DURATION;
    return areaHeight * noteProgress - 20;
  };

  const isNoteVisible = (note: RhythmNote): boolean => {
    if (localHits.has(note.id) || localMissed.has(note.id)) return false;
    const y = getNoteY(note);
    return y > -30 && y < (gameAreaRef.current?.clientHeight ?? 300) + 30;
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* 状态栏 */}
      <div className="flex justify-between w-full max-w-xs px-1">
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--cyan)' }}
        >
          命中：{hitCount}/{activeTotalNotes}
        </div>
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--pink)' }}
        >
          連擊：{combo}
        </div>
        <div
          className="text-xs font-cyber tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          {hitRate}%
        </div>
      </div>

      {/* 游戏区域 */}
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-xs rounded-lg overflow-hidden"
        style={{
          height: '320px',
          border: '2px solid var(--purple)',
          backgroundColor: 'var(--bg-mid)',
          boxShadow:
            '0 0 12px color-mix(in srgb, var(--purple) 40%, transparent), inset 0 0 20px color-mix(in srgb, var(--purple) 10%, transparent)',
        }}
      >
        {/* 轨道分隔线 */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: `${(i / 3) * 100}%`,
              width: '1px',
              backgroundColor: 'color-mix(in srgb, var(--purple) 30%, transparent)',
            }}
          />
        ))}

        {/* 判定线 */}
        <div
          className="absolute left-0 right-0 h-0.5"
          style={{
            top: `${JUDGE_LINE_PERCENT}%`,
            backgroundColor: 'var(--green)',
            boxShadow: '0 0 8px var(--green), 0 0 16px var(--green)',
          }}
        />

        {/* 音符 */}
        {gameStarted &&
          activeNotes.map((note) => {
            if (!isNoteVisible(note)) return null;
            const y = getNoteY(note);
            const laneWidth = 100 / 3;
            return (
              <div
                key={note.id}
                className="absolute rounded-md"
                style={{
                  left: `calc(${note.lane * laneWidth + laneWidth / 2}% - 18px)`,
                  top: `${y}px`,
                  width: '36px',
                  height: '16px',
                  backgroundColor: LANE_COLORS[note.lane],
                  boxShadow: `0 0 10px ${LANE_COLORS[note.lane]}`,
                }}
              />
            );
          })}
      </div>

      {/* 点击区域 */}
      {gameStarted && !finished && (
        <div className="flex gap-2 w-full max-w-xs">
          {[0, 1, 2].map((laneIdx) => (
            <button
              key={laneIdx}
              onClick={() => handleLaneHit(laneIdx)}
              className="flex-1 h-12 rounded-lg font-cyber text-lg tracking-wider active:scale-95 transition-transform"
              style={{
                border: `2px solid ${LANE_COLORS[laneIdx]}`,
                backgroundColor: `color-mix(in srgb, ${LANE_COLORS[laneIdx]} 10%, transparent)`,
                color: LANE_COLORS[laneIdx],
                boxShadow: `0 0 8px color-mix(in srgb, ${LANE_COLORS[laneIdx]} 30%, transparent)`,
              }}
            >
              {LANE_KEYS[laneIdx]}
            </button>
          ))}
        </div>
      )}

      {finished && (
        <div
          className="text-center font-cyber tracking-wider"
          style={{
            color: reward > 0 ? 'var(--green)' : 'var(--text-secondary)',
            textShadow: reward > 0 ? '0 0 8px var(--green)' : 'none',
          }}
        >
          {reward >= 1500 ? (
            <div className="text-xl md:text-2xl">節奏 完美節奏 +¥{reward}</div>
          ) : reward >= 800 ? (
            <div className="text-lg">星光 不錯 +¥{reward}</div>
          ) : reward >= 300 ? (
            <div className="text-base">還行 +¥{reward}</div>
          ) : (
            <div className="text-base">節奏不準，無獎勵</div>
          )}
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            命中率：{hitRate}%
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
            按 A/S/D 或點擊下方按鈕
          </div>
        </div>
      )}
    </div>
  );
};

export default RhythmMasterGame;
