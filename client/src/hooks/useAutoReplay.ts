import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import type { GameState, ReplayLogEntry, ReplayActionType } from '@shared/api.interface';
import {
  loadReplays,
  saveReplays,
  MAX_REPLAYS,
} from '@client/src/pages/ReplayPage/ReplayList';
import type { StoredReplay } from '@client/src/pages/ReplayPage/ReplayList';

interface UseAutoReplayOptions {
  gameState: GameState | null;
  gameStarted: boolean;
  gameMode: string;
}

/**
 * 自動錄制回放 hook
 * 監聽 gameState 變化，自動記錄關鍵事件到 replayLog
 * 遊戲結束時自動保存到 localStorage（最多 MAX_REPLAYS 局）
 */
export function useAutoReplay({
  gameState,
  gameStarted,
  gameMode,
}: UseAutoReplayOptions): void {
  const replayLogRef = useRef<ReplayLogEntry[]>([]);
  const prevStateRef = useRef<GameState | null>(null);
  const startTimeRef = useRef<number>(0);
  const savedRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  // 深比較地塊所有權變化
  const getPropertyOwnerMap = useCallback(
    (state: GameState): Record<number, number> => {
      const map: Record<number, number> = {};
      for (const [cellId, prop] of Object.entries(state.properties)) {
        if (prop && prop.owner !== -1) {
          map[Number(cellId)] = prop.owner;
        }
      }
      return map;
    },
    [],
  );

  // 深比較建築等級變化
  const getPropertyBuildingMap = useCallback(
    (state: GameState): Record<number, number> => {
      const map: Record<number, number> = {};
      for (const [cellId, prop] of Object.entries(state.properties)) {
        if (prop) {
          map[Number(cellId)] = prop.buildings;
        }
      }
      return map;
    },
    [],
  );

  // 取得玩家金錢 map
  const getPlayerMoneyMap = useCallback(
    (state: GameState): number[] => {
      return state.players.map((p) => p.money);
    },
    [],
  );

  // 取得玩家破產狀態
  const getPlayerBankruptMap = useCallback(
    (state: GameState): boolean[] => {
      return state.players.map((p) => p.isBankrupt);
    },
    [],
  );

  // 添加日誌條目
  const addEntry = useCallback(
    (
      turn: number,
      playerIndex: number,
      action: ReplayActionType,
      payload?: Record<string, unknown>,
      stateSnapshot?: GameState,
    ) => {
      const entry: ReplayLogEntry = {
        turn,
        playerIndex,
        action,
        payload,
        stateSnapshot,
        timestamp: Date.now(),
      };
      replayLogRef.current.push(entry);
    },
    [],
  );

  // 保存回放
  const saveReplay = useCallback(
    (finalState: GameState) => {
      if (savedRef.current) return;
      if (replayLogRef.current.length === 0) return;

      try {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const winnerIndex = finalState.winner;
        const winnerName =
          winnerIndex !== null && winnerIndex >= 0
            ? finalState.players[winnerIndex]?.name
            : undefined;

        const replay: StoredReplay = {
          id: `replay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          gameMode,
          players: finalState.players.map((p) => ({
            name: p.name,
            color: p.color,
          })),
          log: replayLogRef.current,
          finalState,
          createdAt: new Date().toISOString(),
          duration,
          winner: winnerName,
          totalTurns: finalState.totalTurns,
        };

        const existing = loadReplays();
        const updated = [replay, ...existing].slice(0, MAX_REPLAYS);
        saveReplays(updated);
        savedRef.current = true;
        logger.info(`回放已自動保存，共 ${replay.log.length} 條記錄`);
      } catch (err) {
        logger.error(
          '自動保存回放失敗:',
          err instanceof Error ? err.message : String(err),
        );
      }
    },
    [gameMode],
  );

  // 重置錄制狀態
  const resetRecording = useCallback(() => {
    replayLogRef.current = [];
    prevStateRef.current = null;
    startTimeRef.current = Date.now();
    savedRef.current = false;
    initializedRef.current = false;
  }, []);

  // 初始化：遊戲開始時記錄初始狀態快照
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (initializedRef.current) return;

    initializedRef.current = true;
    startTimeRef.current = Date.now();
    replayLogRef.current = [];

    // 初始狀態快照（從第0回合開始）
    addEntry(
      gameState.totalTurns,
      gameState.currentPlayerIndex,
      'turn_end',
      undefined,
      gameState,
    );

    prevStateRef.current = gameState;
  }, [gameState, gameStarted, addEntry]);

  // 狀態變化檢測
  useEffect(() => {
    if (!gameState || !gameStarted) return;
    if (!initializedRef.current) return;

    const prev = prevStateRef.current;
    if (!prev) {
      prevStateRef.current = gameState;
      return;
    }

    const turn = gameState.totalTurns;
    const currentPlayer = gameState.currentPlayerIndex;

    // 1. 檢測擲骰：phase 從 rolling 離開（進入 moving/fate/chance/buying 等）
    if (prev.phase === 'rolling' && gameState.phase !== 'rolling') {
      addEntry(turn, currentPlayer, 'roll', {
        dice: [...gameState.lastDiceValues],
      });
    }

    // 2. 檢測買地：properties 的 owner 變化（且變成非-1）
    const prevOwners = getPropertyOwnerMap(prev);
    const currOwners = getPropertyOwnerMap(gameState);
    for (const cellIdStr of Object.keys(currOwners)) {
      const cellId = Number(cellIdStr);
      const prevOwner = prevOwners[cellId];
      const currOwner = currOwners[cellId];
      if (prevOwner === undefined && currOwner !== undefined) {
        // 新買地
        addEntry(turn, currOwner, 'buy', {
          cellId,
          from: 'bank',
        });
      } else if (prevOwner !== undefined && currOwner !== prevOwner) {
        // 所有權轉移（交易/強制收購等）
        addEntry(turn, currOwner, 'buy', {
          cellId,
          from: prevOwner,
          to: currOwner,
        });
      }
    }

    // 3. 檢測建房/拆房：buildings 等級變化
    const prevBuildings = getPropertyBuildingMap(prev);
    const currBuildings = getPropertyBuildingMap(gameState);
    for (const cellIdStr of Object.keys(currBuildings)) {
      const cellId = Number(cellIdStr);
      const prevLvl = prevBuildings[cellId] ?? 0;
      const currLvl = currBuildings[cellId] ?? 0;
      if (currLvl > prevLvl) {
        const owner = currOwners[cellId];
        if (owner !== undefined) {
          addEntry(turn, owner, 'build', {
            cellId,
            level: currLvl,
            delta: currLvl - prevLvl,
          });
        }
      } else if (currLvl < prevLvl) {
        const owner = currOwners[cellId];
        if (owner !== undefined) {
          addEntry(turn, owner, 'demolish', {
            cellId,
            level: currLvl,
            delta: prevLvl - currLvl,
          });
        }
      }
    }

    // 4. 檢測付費：phase 從 rolling 轉變後金錢變化（過路費等）
    // 注意：GamePhase 沒有'moving'，移動後直接進入 buying/fate/chance/rolling
    // 金錢變化可能由多種原因引起，此處僅記錄非 buy 階段的金錢變化
    if (prev.phase === 'rolling' && gameState.phase !== 'rolling') {
      const prevMoney = getPlayerMoneyMap(prev);
      const currMoney = getPlayerMoneyMap(gameState);
      for (let i = 0; i < currMoney.length; i += 1) {
        const delta = currMoney[i] - prevMoney[i];
        if (delta !== 0) {
          addEntry(turn, i, 'pay_toll', {
            amount: Math.abs(delta),
            balance: currMoney[i],
            isGain: delta > 0,
          });
          break; // 每個狀態變化只記錄一次金錢事件
        }
      }
    }

    // 5. 檢測抽命運卡
    if (prev.phase !== 'fate' && gameState.phase === 'fate') {
      addEntry(turn, currentPlayer, 'draw_fate', {
        cardId: gameState.pendingFateCard?.id,
        cardName: gameState.pendingFateCard?.name,
      });
    }

    // 6. 檢測抽機會卡
    if (prev.phase !== 'chance' && gameState.phase === 'chance') {
      addEntry(turn, currentPlayer, 'draw_chance', {
        cardId: gameState.pendingChanceCard?.id,
        cardName: gameState.pendingChanceCard?.name,
      });
    }

    // 7. 檢測破產
    const prevBankrupt = getPlayerBankruptMap(prev);
    const currBankrupt = getPlayerBankruptMap(gameState);
    for (let i = 0; i < currBankrupt.length; i += 1) {
      if (currBankrupt[i] && !prevBankrupt[i]) {
        addEntry(turn, i, 'bankruptcy', {
          finalAssets: gameState.players[i]?.totalAssets ?? 0,
        });
      }
    }

    // 8. 檢測回合結束：totalTurns 增加 + phase 回到 rolling（帶快照）
    if (gameState.totalTurns > prev.totalTurns) {
      addEntry(
        gameState.totalTurns,
        prev.currentPlayerIndex,
        'turn_end',
        undefined,
        gameState, // 每回合結束存快照
      );
    }

    // 9. 檢測遊戲結束
    if (prev.phase !== 'ended' && gameState.phase === 'ended') {
      addEntry(
        turn,
        gameState.winner ?? currentPlayer,
        'game_end',
        {
          winner: gameState.winner,
          totalTurns: gameState.totalTurns,
        },
        gameState, // 最終狀態快照
      );

      // 保存到 localStorage
      saveReplay(gameState);
    }

    prevStateRef.current = gameState;
  }, [
    gameState,
    gameStarted,
    addEntry,
    getPropertyOwnerMap,
    getPropertyBuildingMap,
    getPlayerMoneyMap,
    getPlayerBankruptMap,
    saveReplay,
  ]);

  // 組件卸載或遊戲重置時清理
  useEffect(() => {
    return () => {
      // 頁面離開時，如果遊戲已結束但沒保存，這裡不強制保存（避免中途退出產生殘缺回放）
    };
  }, []);

  // 監聽 gameState 從有變無（重置遊戲）
  useEffect(() => {
    if (gameState === null && initializedRef.current) {
      resetRecording();
    }
  }, [gameState, resetRecording]);
}

export default useAutoReplay;
