import { useState, type FC } from 'react';
import {
  ChevronsUp,
  ChevronsDown,
  Vault,
  Crosshair,
  Gem,
  Trophy,
  Cpu,
  Repeat,
} from 'lucide-react';
import type { GameState } from '@shared/api.interface';
import { getV4ModeLabel, isV4Mode } from './modeMeta';

interface V4ModeLivePanelProps {
  gameState: GameState;
  currentPlayerIndex: number;
}

const fmt = (n: number | undefined): string => (n ?? 0).toLocaleString('zh-Hant');

/**
 * v4 新模式即時狀態面板（單一緊湊、可摺疊、不遮擋棋盤與主操作）。
 * 僅在對應的 v4 模式下顯示。
 */
const V4ModeLivePanel: FC<V4ModeLivePanelProps> = ({ gameState, currentPlayerIndex }) => {
  const [open, setOpen] = useState(true);
  const mode = gameState.mode;
  if (!isV4Mode(mode)) return null;

  const label = getV4ModeLabel(mode) ?? '量子模式';
  const players = gameState.players;

  let body: React.ReactNode = null;
  let Icon: typeof Vault = Vault;

  if (mode === 'heist') {
    Icon = Vault;
    const hm = gameState.heistMode;
    const myRole = hm?.roles?.[currentPlayerIndex];
    const cores = hm?.dataCoresCollected ?? {};
    const totalCores = Object.values(cores).reduce((a, b) => a + b, 0);
    body = (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">我的角色</span>
          <span className="font-cyber" style={{ color: myRole === 'robber' ? 'var(--orange)' : 'var(--blue)' }}>
            {myRole === 'robber' ? '劫匪（奪核心）' : myRole === 'guard' ? '保全（攔截）' : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">已收集資料核心</span>
          <span className="font-cyber" style={{ color: 'var(--cyan)' }}>{totalCores}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">已逃生劫匪</span>
          <span className="font-cyber" style={{ color: 'var(--green)' }}>{hm?.escapedRobbers ?? 0}</span>
        </div>
      </div>
    );
  } else if (mode === 'bounty_hunt') {
    Icon = Crosshair;
    const bh = gameState.bountyHuntMode;
    const targetName = bh && bh.currentBountyTarget >= 0 ? players[bh.currentBountyTarget]?.name : '無';
    const remain = Math.max(0, (bh?.rotationInterval ?? 0) - (bh?.bountyTurns ?? 0));
    body = (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">當前懸賞目標</span>
          <span className="font-cyber" style={{ color: 'var(--red)' }}>{targetName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">懸賞金額</span>
          <span className="font-cyber" style={{ color: 'var(--yellow)' }}>${fmt(bh?.currentBountyAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">距輪換</span>
          <span className="font-cyber">{remain} 回合</span>
        </div>
      </div>
    );
  } else if (mode === 'gold_rush') {
    Icon = Gem;
    const gr = gameState.goldRushMode;
    const mined = players[currentPlayerIndex]?.minesMined ?? 0;
    body = (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">活躍金礦</span>
          <span className="font-cyber" style={{ color: 'var(--yellow)' }}>{gr?.activeMines?.length ?? 0} 處</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">我已開採</span>
          <span className="font-cyber" style={{ color: 'var(--green)' }}>{mined} 座</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">下個礦點倒數</span>
          <span className="font-cyber">{gr?.nextMineTurn ?? 0} 回合</span>
        </div>
      </div>
    );
  } else if (mode === 'cyber_olympics') {
    Icon = Trophy;
    const co = gameState.cyberOlympicsMode;
    const board = co?.scoreboard ?? {};
    const ranked = players
      .map((p, i) => ({ name: p.name, score: board[i] ?? 0 }))
      .sort((a, b) => b.score - a.score);
    body = (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between mb-1">
          <span className="text-[var(--text-secondary)]">獎牌榜（{co?.eventsCompleted ?? 0}/{co?.totalEvents ?? 0} 場）</span>
        </div>
        {ranked.map((r, i) => (
          <div key={r.name} className="flex justify-between">
            <span className="truncate max-w-[60%]">{i + 1}. {r.name}</span>
            <span className="font-cyber" style={{ color: i === 0 ? 'var(--yellow)' : 'var(--text-secondary)' }}>{r.score} 分</span>
          </div>
        ))}
      </div>
    );
  } else if (mode === 'rogue_ai') {
    Icon = Cpu;
    const ra = gameState.rogueAiMode;
    const hp = ra?.coreHealth ?? 0;
    const max = ra?.coreMaxHealth ?? 100;
    const pct = Math.max(0, Math.min(100, (hp / max) * 100));
    body = (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">核心生命值</span>
          <span className="font-cyber" style={{ color: pct > 30 ? 'var(--green)' : 'var(--red)' }}>{hp}/{max}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-mid)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 30 ? 'var(--green)' : 'var(--red)' }} />
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">核心狀態</span>
          <span className="font-cyber" style={{ color: ra?.coreShutdown ? 'var(--red)' : 'var(--purple)' }}>
            {ra?.coreShutdown ? '已關閉' : '運作中'}
          </span>
        </div>
      </div>
    );
  } else if (mode === 'time_loop') {
    Icon = Repeat;
    const tl = gameState.timeLoopMode;
    const score = tl?.accumulatedScore?.[currentPlayerIndex] ?? 0;
    const loopPct = Math.max(0, Math.min(100, ((tl?.loopTurns ?? 0) / (tl?.loopLength ?? 8)) * 100));
    body = (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">本迴圈進度</span>
          <span className="font-cyber">{tl?.loopTurns ?? 0}/{tl?.loopLength ?? 8} 回合</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-mid)' }}>
          <div className="h-full rounded-full" style={{ width: `${loopPct}%`, backgroundColor: 'var(--cyan)' }} />
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">已破環</span>
          <span className="font-cyber" style={{ color: 'var(--cyan)' }}>{tl?.loopsBroken ?? 0} 次</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">我的累積分數</span>
          <span className="font-cyber" style={{ color: 'var(--green)' }}>{fmt(score)} / {tl?.breakThreshold ?? 5000}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cyber-card rounded-xl overflow-hidden"
      style={{ border: '1px solid hsl(180, 100%, 60% / 0.3)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 min-h-[44px]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5 font-cyber text-xs tracking-wider" style={{ color: 'hsl(180, 100%, 60%)' }}>
          <Icon size={14} /> {label}
        </span>
        {open ? <ChevronsDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronsUp size={14} style={{ color: 'var(--text-secondary)' }} />}
      </button>
      {open && <div className="px-3 pb-3">{body}</div>}
    </div>
  );
};

export default V4ModeLivePanel;
