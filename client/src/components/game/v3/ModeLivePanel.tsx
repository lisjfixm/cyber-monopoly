import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, Shield, Users } from 'lucide-react';
import type { GameState, PlayerState } from '@shared/api.interface';
import { PLAYER_COLOR_HEX } from '@shared/game-config';
import { V3_MODES, isV3Mode, type V3ModeId } from './modeMeta';

interface ModeLivePanelProps {
  gameState: GameState;
}

interface Row {
  key: string;
  name: string;
  color: string;
  score: number;
  detail: string;
  bankrupt?: boolean;
}

const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('zh-Hant');
};

const ModeLivePanel: React.FC<ModeLivePanelProps> = ({ gameState }) => {
  const [open, setOpen] = useState(false);
  const mode = gameState.mode;

  const rows: Row[] = useMemo(() => {
    if (!isV3Mode(mode)) return [];
    const m: V3ModeId = mode;

    if (m === 'stock_frenzy') {
      return gameState.players.map((p: PlayerState) => {
        let stockValue = 0;
        for (const h of p.stocks) {
          const price = gameState.stockStates?.[h.symbol]?.price ?? gameState.stocks?.[h.symbol] ?? 0;
          stockValue += h.quantity * price;
        }
        const score = stockValue + p.money * 0.1;
        return {
          key: `p-${p.playerIndex}`,
          name: p.name,
          color: PLAYER_COLOR_HEX[p.color] || 'var(--cyan)',
          score,
          detail: `持倉 ${fmt(stockValue)} + 現金加成 ${fmt(p.money * 0.1)}`,
          bankrupt: p.isBankrupt,
        };
      });
    }

    if (m === 'black_market_race') {
      return gameState.players.map((p: PlayerState) => {
        const assets = p.totalAssets ?? p.money;
        const itemBonus = p.items.length * 800;
        return {
          key: `p-${p.playerIndex}`,
          name: p.name,
          color: PLAYER_COLOR_HEX[p.color] || 'var(--red)',
          score: assets + itemBonus,
          detail: `資產 ${fmt(assets)} + 道具 ${p.items.length} 件`,
          bankrupt: p.isBankrupt,
        };
      });
    }

    // twin_strike：以隊伍為單位
    if (m === 'twin_strike' && gameState.teams) {
      return (Object.keys(gameState.teams) as Array<'red' | 'blue'>).map((tid) => {
        const team = gameState.teams?.[tid];
        if (!team) return null as unknown as Row;
        const alive = team.playerIndices.filter((i: number) => !gameState.players[i]?.isBankrupt).length;
        const total = team.playerIndices.length;
        return {
          key: `team-${tid}`,
          name: team.name,
          color: tid === 'red' ? '#ff4d6d' : '#4dabf7',
          score: team.totalAssets ?? team.money,
          detail: `共享金庫 ${fmt(team.money)} · 存活 ${alive}/${total}`,
          bankrupt: alive === 0,
        };
      }).filter(Boolean) as Row[];
    }

    return [];
  }, [gameState, mode]);

  if (!isV3Mode(mode) || rows.length === 0) return null;

  const meta = V3_MODES[mode];
  const sorted = [...rows].sort((a: Row, b: Row) => b.score - a.score);
  const maxScore = sorted.length > 0 && sorted[0].score > 0 ? sorted[0].score : 1;

  const headerIcon = mode === 'twin_strike' ? <Users size={14} /> : <BarChart3 size={14} />;

  return (
    <div
      className="cyber-card px-3 py-2"
      style={{
        borderColor: `${meta.color}66`,
        backgroundColor: `${meta.color}0d`,
        boxShadow: `0 0 10px ${meta.color}22, inset 0 0 8px ${meta.color}11`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between min-h-[44px]"
        aria-expanded={open}
        aria-label="展開新模式即時戰況"
      >
        <span className="flex items-center gap-1.5 text-xs font-cyber tracking-wider" style={{ color: meta.color }}>
          {headerIcon}
          {mode === 'stock_frenzy' && '股潮即時排名'}
          {mode === 'black_market_race' && '軍火即時排名'}
          {mode === 'twin_strike' && '陣營金庫'}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-cyber" style={{ color: meta.color }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {open ? '收起' : '展開'}
        </span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {mode === 'twin_strike' && (
            <div className="flex items-center gap-1.5 text-[10px] font-cyber" style={{ color: 'var(--text-secondary)' }}>
              <Shield size={11} /> 隊伍共享金庫 · 全員倒地即落敗
            </div>
          )}
          {sorted.map((row: Row, idx: number) => {
            const widthPct = Math.max(0, Math.min(100, (row.score / maxScore) * 100));
            return (
              <div
                key={row.key}
                className="flex items-center gap-2 text-xs"
                style={{ opacity: row.bankrupt ? 0.45 : 1 }}
              >
                <span className="font-cyber w-4 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {idx + 1}
                </span>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color, boxShadow: `0 0 4px ${row.color}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" style={{ color: row.color }}>{row.name}</span>
                    <span className="font-cyber flex-shrink-0">{fmt(row.score)}</span>
                  </div>
                  <div className="h-1 rounded-full mt-0.5 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${widthPct}%`, backgroundColor: row.color, transition: 'width 200ms ease' }} />
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5">{row.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModeLivePanel;
