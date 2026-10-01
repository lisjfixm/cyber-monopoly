import { useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { GameState } from '@shared/api.interface';
import { CELLS } from '@shared/game-config';
import {
  drawFateCard,
  drawChanceCard,
  buildHouse,
  mortgageProperty,
  surrender as surrenderFn,
} from '@shared/game-engine';

interface DevToolsPanelProps {
  gameState: GameState;
  onChange: (state: GameState) => void;
  onForceFate: () => void;
  onForceChance: () => void;
}

export default function DevToolsPanel({
  gameState,
  onChange,
  onForceFate,
  onForceChance,
}: DevToolsPanelProps) {
  const [open, setOpen] = useState(false);
  const [targetCell, setTargetCell] = useState<number>(1);
  const [moneyAmount, setMoneyAmount] = useState<number>(10000);
  const [targetPlayer, setTargetPlayer] = useState<number>(1);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-2 left-2 z-[60] px-2 py-1 text-xs opacity-40 hover:opacity-100 bg-black/80 border border-yellow-500/50 text-yellow-400 rounded"
      >
        DEV
      </button>
    );
  }

  const currentIdx = gameState.currentPlayerIndex;
  const currentPlayer = gameState.players[currentIdx];

  const makeLog = (text: string) => ({
    id: Date.now(),
    type: 'system' as const,
    text,
  });

  const teleport = () => {
    const newState = structuredClone(gameState) as GameState;
    newState.players[currentIdx].position = targetCell;
    newState.logs.push(makeLog(`[DEV] 瞬移到格 ${targetCell}`));
    onChange(newState);
    logger.info(`[DEV] teleported player ${currentIdx} to cell ${targetCell}`);
  };

  const addMoney = () => {
    const newState = structuredClone(gameState) as GameState;
    newState.players[currentIdx].money += moneyAmount;
    newState.logs.push(makeLog(`[DEV] 增加 $${moneyAmount}`));
    onChange(newState);
  };

  const setMoneyZero = () => {
    const newState = structuredClone(gameState) as GameState;
    newState.players[targetPlayer].money = 0;
    newState.logs.push(makeLog(`[DEV] 玩家 ${targetPlayer} 金錢設為 0`));
    onChange(newState);
  };

  const giveAllProperties = () => {
    const newState = structuredClone(gameState) as GameState;
    const owned: number[] = [];
    for (const cell of CELLS) {
      if (cell.type === 'property') {
        if (!newState.properties[cell.id]) {
          newState.properties[cell.id] = {
            owner: currentIdx,
            buildings: 0,
            isMortgaged: false,
            insured: false,
            specialBuilding: null,
            upgradePath: null,
            evolutionLevel: 0,
            ownerTeam: null,
          };
          owned.push(cell.id);
        }
      }
    }
    newState.ownedProperties[currentIdx] = owned.length;
    newState.logs.push(makeLog(`[DEV] 獲得所有地產 (${owned.length}塊)`));
    onChange(newState);
  };

  const forceSurrender = () => {
    const newState = surrenderFn(gameState, targetPlayer);
    onChange(newState);
    logger.info(`[DEV] forced surrender of player ${targetPlayer}`);
  };

  const triggerFate = () => {
    const newState = structuredClone(gameState) as GameState;
    const card = drawFateCard();
    newState.pendingFateCard = card;
    newState.phase = 'fate';
    newState.logs.push(makeLog(`[DEV] 強制抽取命運卡：${card.name}`));
    onChange(newState);
    onForceFate();
  };

  const triggerChance = () => {
    const newState = structuredClone(gameState) as GameState;
    const card = drawChanceCard();
    newState.pendingChanceCard = card;
    newState.phase = 'chance';
    newState.logs.push(makeLog(`[DEV] 強制抽取機會卡：${card.name}`));
    onChange(newState);
    onForceChance();
  };

  const buildOnCurrent = () => {
    const cellId = currentPlayer.position;
    const prop = gameState.properties[cellId];
    if (!prop || prop.owner !== currentIdx) {
      logger.warn(`[DEV] cannot build: not owner of cell ${cellId}`);
      return;
    }
    try {
      const newState = buildHouse(gameState, currentIdx, cellId);
      onChange(newState);
    } catch (e) {
      logger.error(`[DEV] buildHouse failed`, e);
    }
  };

  const mortgageCurrent = () => {
    const cellId = currentPlayer.position;
    const prop = gameState.properties[cellId];
    if (!prop || prop.owner !== currentIdx) {
      logger.warn(`[DEV] cannot mortgage: not owner of cell ${cellId}`);
      return;
    }
    try {
      const newState = mortgageProperty(gameState, currentIdx, cellId);
      onChange(newState);
    } catch (e) {
      logger.error(`[DEV] mortgage failed`, e);
    }
  };

  return (
    <div className="fixed bottom-2 left-2 z-[60] w-72 bg-black/95 border border-yellow-500/50 rounded p-3 text-xs text-yellow-300 font-mono">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-yellow-500/30">
        <span className="font-bold text-yellow-400">DEV TOOLS</span>
        <button onClick={() => setOpen(false)} className="text-yellow-600 hover:text-yellow-300">
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-yellow-500/70">
          當前玩家: P{currentIdx} ({currentPlayer.name})  ¥{currentPlayer.money.toLocaleString()}
        </div>

        <div className="flex gap-1 items-center">
          <button onClick={teleport} className="px-2 py-1 bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-700 rounded text-[11px]">
            瞬移到
          </button>
          <input
            type="number"
            value={targetCell}
            onChange={(e) => setTargetCell(Number(e.target.value))}
            className="flex-1 px-2 py-1 bg-black border border-yellow-700/50 rounded text-[11px] text-yellow-300 w-14"
            min={0}
            max={35}
          />
        </div>

        <div className="flex gap-1 items-center">
          <button onClick={addMoney} className="px-2 py-1 bg-green-900/40 hover:bg-green-800/60 border border-green-700 rounded text-[11px] text-green-300">
            +$
          </button>
          <input
            type="number"
            value={moneyAmount}
            onChange={(e) => setMoneyAmount(Number(e.target.value))}
            className="flex-1 px-2 py-1 bg-black border border-green-700/50 rounded text-[11px] text-green-300"
          />
        </div>

        <button
          onClick={giveAllProperties}
          className="w-full px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700 rounded text-[11px] text-purple-300"
        >
          獲得所有地產
        </button>

        <div className="flex gap-1">
          <button
            onClick={triggerFate}
            className="flex-1 px-2 py-1 bg-pink-900/40 hover:bg-pink-800/60 border border-pink-700 rounded text-[11px] text-pink-300"
          >
            命運卡
          </button>
          <button
            onClick={triggerChance}
            className="flex-1 px-2 py-1 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 rounded text-[11px] text-blue-300"
          >
            機會卡
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={buildOnCurrent}
            className="flex-1 px-2 py-1 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700 rounded text-[11px] text-cyan-300"
          >
            當前格建房
          </button>
          <button
            onClick={mortgageCurrent}
            className="flex-1 px-2 py-1 bg-orange-900/40 hover:bg-orange-800/60 border border-orange-700 rounded text-[11px] text-orange-300"
          >
            當前格抵押
          </button>
        </div>

        <div className="pt-2 border-t border-yellow-700/30">
          <div className="text-yellow-500/70 mb-1">強制結束遊戲</div>
          <div className="flex gap-1 items-center">
            <span className="text-[10px]">目標玩家:</span>
            <select
              value={targetPlayer}
              onChange={(e) => setTargetPlayer(Number(e.target.value))}
              className="flex-1 px-1 py-0.5 bg-black border border-red-700/50 rounded text-[11px] text-red-300"
            >
              {gameState.players.map((p, i) => (
                <option key={i} value={i}>
                  P{i} {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={setMoneyZero}
              className="flex-1 px-2 py-1 bg-red-900/40 hover:bg-red-800/60 border border-red-700 rounded text-[11px] text-red-300"
            >
              設金錢=0
            </button>
            <button
              onClick={forceSurrender}
              className="flex-1 px-2 py-1 bg-red-900/60 hover:bg-red-800/80 border border-red-500 rounded text-[11px] text-red-200 font-bold"
            >
              強制投降
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
