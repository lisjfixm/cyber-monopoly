import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Coins, Sparkles, RotateCw, History } from 'lucide-react';
import { toast } from 'sonner';
import { useLuckyWheel, type SpinResult } from '@client/src/hooks/useLuckyWheel';
import { vibrate, vibrationPatterns } from '@client/src/utils/vibrate';

const SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / SEGMENTS;
const SPIN_TURNS = 5; // 每次轉 5 圈

// 計算讓第 idx 個扇形對準頂部指針所需的旋轉角度
function rotationForIndex(idx: number): number {
  // 扇形中心位於：-90 + idx*45 + 22.5 度（從 3 點鐘方向逆時針計算的 CSS rotate 角度）
  // 我們希望中心轉到 -90 度（正上方）
  // 但因為每次都累加，我們在這裡直接計算「絕對目標角度」
  const centerAngle = -90 + idx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  const target = -90 - centerAngle; // 把中心轉到正上方
  return SPIN_TURNS * 360 + target;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polar(cx, cy, r, startAngle);
  const e = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}

const LuckyWheelPage = () => {
  const navigate = useNavigate();
  const { canSpin, totalSpins, history, prizes, spin } = useLuckyWheel();

  const [rotation, setRotation] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSpin = useCallback(() => {
    if (spinning) return;
    if (!canSpin) {
      toast.info('今日已轉過，請明日再來');
      return;
    }

    let result: SpinResult;
    try {
      result = spin();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '轉盤失敗');
      return;
    }

    setSpinning(true);
    vibrate(vibrationPatterns.medium);

    // 隨機一個「視覺上的」目標索引；實際獎勵已經由 spin() 決定，
    // 但為了視覺一致性，我們用 prize.id 作為最終停頓位置
    const targetIdx = result.prize.id;
    const targetRotation = rotationForIndex(targetIdx);
    // 累加：在上一次旋轉基礎上繼續轉
    setRotation((prev) => {
      // 把新目標加到比 prev 大的最小值
      const base = prev - (prev % 360);
      return base + targetRotation + 360;
    });

    spinTimeoutRef.current = setTimeout(() => {
      setSpinning(false);
      setLastResult(result);
      vibrate(result.prize.type === 'jackpot' ? vibrationPatterns.win : vibrationPatterns.light);
      if (result.prize.type === 'nothing') {
        toast('謝謝參與，明日再來');
      } else {
        const parts: string[] = [];
        if (result.coinDelta > 0) parts.push(`金幣 +${result.coinDelta}`);
        if (result.fragmentDelta > 0) parts.push(`碎片 +${result.fragmentDelta}`);
        toast.success(`獲得 ${result.prize.label}`, {
          description: parts.length > 0 ? parts.join(' · ') : undefined,
        });
      }
    }, 4200);
  }, [spinning, canSpin, spin]);

  const R = 140;
  const C = R + 10;

  return (
    <div className="min-h-screen w-full px-4 pt-6 pb-24 md:pb-10 max-w-2xl mx-auto">
      {/* 頂欄 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-cyber text-2xl md:text-3xl tracking-wider text-neon-cyan" style={{ textShadow: '0 0 12px var(--cyan-glow)' }}>
            幸運轉盤
          </h1>
          <p className="text-xs font-cyber tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
            每日一次免費轉盤 · v2.0.0
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="cyber-btn p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="歷史紀錄"
        >
          <History size={18} />
        </button>
      </div>

      {/* 狀態列 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="cyber-card p-3 flex items-center gap-3">
          <Gift size={20} style={{ color: 'var(--yellow)' }} />
          <div>
            <div className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>剩餘次數</div>
            <div className="font-cyber text-lg" style={{ color: canSpin ? 'var(--green)' : 'var(--text-muted)' }}>
              {canSpin ? '1 次' : '今日已用完'}
            </div>
          </div>
        </div>
        <div className="cyber-card p-3 flex items-center gap-3">
          <Sparkles size={20} style={{ color: 'var(--purple)' }} />
          <div>
            <div className="text-xs font-cyber" style={{ color: 'var(--text-secondary)' }}>累計轉數</div>
            <div className="font-cyber text-lg" style={{ color: 'var(--purple)' }}>{totalSpins}</div>
          </div>
        </div>
      </div>

      {/* 轉盤本體 */}
      <div className="relative mx-auto my-8" style={{ width: R * 2 + 40, height: R * 2 + 40 }}>
        {/* 指針 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ top: -6, filter: 'drop-shadow(0 0 6px var(--pink))' }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '20px solid var(--pink)',
            }}
          />
        </div>

        {/* 外圈光暈 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 40px rgba(0,255,255,0.2), inset 0 0 30px rgba(0,0,0,0.6)',
            border: '2px solid var(--border-neon-cyan)',
          }}
        />

        {/* SVG 轉盤 */}
        <svg
          width={R * 2 + 20}
          height={R * 2 + 20}
          viewBox={`0 0 ${R * 2 + 20} ${R * 2 + 20}`}
          className="absolute"
          style={{
            left: 10,
            top: 10,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
          }}
        >
          {prizes.map((prize, i) => {
            const start = i * SEGMENT_ANGLE;
            const end = (i + 1) * SEGMENT_ANGLE;
            return (
              <g key={prize.id}>
                <path
                  d={segmentPath(C, C, R, start, end)}
                  fill={prize.color}
                  stroke="rgba(0,255,255,0.3)"
                  strokeWidth={1}
                />
                <text
                  x={polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).x}
                  y={polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={prize.textColor}
                  fontSize="11"
                  fontFamily="Orbitron, monospace"
                  fontWeight="bold"
                  transform={`rotate(${start + SEGMENT_ANGLE / 2 + 90}, ${polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).x}, ${polar(C, C, R * 0.65, start + SEGMENT_ANGLE / 2).y})`}
                >
                  {prize.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 中心按鈕 */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={!canSpin || spinning}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full flex flex-col items-center justify-center font-cyber"
          style={{
            width: 80,
            height: 80,
            background: canSpin && !spinning ? 'radial-gradient(circle, rgba(0,255,255,0.3), rgba(0,0,0,0.8))' : 'rgba(60,60,70,0.8)',
            border: `2px solid ${canSpin && !spinning ? 'var(--cyan)' : 'rgba(255,255,255,0.15)'}`,
            boxShadow: canSpin && !spinning ? '0 0 20px var(--cyan-glow)' : 'none',
            color: canSpin && !spinning ? 'var(--cyan)' : 'var(--text-muted)',
            cursor: canSpin && !spinning ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
          aria-label="開始轉盤"
        >
          <RotateCw size={22} className={spinning ? 'animate-spin' : ''} />
          <span className="text-xs mt-1 tracking-wider">{spinning ? '轉動中' : canSpin ? '開始' : '已轉完'}</span>
        </button>
      </div>

      {/* 上次結果 */}
      {lastResult && (
        <div
          className="cyber-card p-4 mt-4 text-center"
          style={{ borderColor: lastResult.prize.textColor, boxShadow: `0 0 15px ${lastResult.prize.textColor}44` }}
        >
          <div className="text-xs font-cyber mb-1" style={{ color: 'var(--text-secondary)' }}>本次結果</div>
          <div className="font-cyber text-xl" style={{ color: lastResult.prize.textColor, textShadow: `0 0 8px ${lastResult.prize.textColor}` }}>
            {lastResult.prize.label}
          </div>
          {(lastResult.coinDelta > 0 || lastResult.fragmentDelta > 0) && (
            <div className="text-sm mt-2 font-cyber" style={{ color: 'var(--text-secondary)' }}>
              {lastResult.coinDelta > 0 && <span className="mr-3 inline-flex items-center gap-1"><Coins size={14} /> +{lastResult.coinDelta}</span>}
              {lastResult.fragmentDelta > 0 && <span className="inline-flex items-center gap-1"><Sparkles size={14} /> +{lastResult.fragmentDelta}</span>}
            </div>
          )}
        </div>
      )}

      {/* 歷史彈窗 */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="cyber-card p-5 w-full max-w-md max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-cyber text-lg mb-4" style={{ color: 'var(--cyan)' }}>轉盤紀錄</h3>
            {history.length === 0 ? (
              <p className="text-sm font-cyber" style={{ color: 'var(--text-secondary)' }}>尚無紀錄</p>
            ) : (
              <ul className="space-y-2">
                {history.slice().reverse().map((h, i) => {
                  const prize = prizes[h.prizeId];
                  return (
                    <li key={i} className="flex justify-between items-center text-sm font-cyber p-2" style={{ borderBottom: '1px solid var(--border-neon)' }}>
                      <span style={{ color: prize?.textColor ?? 'var(--text-primary)' }}>{prize?.label ?? '未知'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{h.date}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="cyber-btn w-full mt-4 py-2 text-sm"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .cyber-card { border-radius: 8px; }
        }
      `}</style>
    </div>
  );
};

export default LuckyWheelPage;
