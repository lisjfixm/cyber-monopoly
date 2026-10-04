import React, { useEffect, useRef } from 'react';
import { Bot, CarFront } from 'lucide-react';
import { toast } from 'sonner';
import { useDroneMount as droneMountEngine, useHoverCarMount as hoverCarMountEngine } from '@shared/game-engine';
import type { GameState } from '@shared/api.interface';
import { vibrate, vibrationPatterns } from '@client/src/utils/vibrate';

interface MountQuickActionsProps {
  gameState: GameState;
  playerIndex: number;
  /** 是否處於可主動操作的狀態（我的回合、rolling 階段、未結束、未破產） */
  canAct: boolean;
  onApply: (next: GameState) => void;
}

// 建立淺層不可變副本，避免直接改到 React state 裡的舊物件
function cloneForMountUse(state: GameState, playerIndex: number): GameState {
  const players = state.players.slice();
  const src = players[playerIndex];
  players[playerIndex] = {
    ...src,
    mounts: src.mounts ? { ...src.mounts } : src.mounts,
  };
  return { ...state, players, logs: state.logs.slice() };
}

const MountQuickActions: React.FC<MountQuickActionsProps> = ({ gameState, playerIndex, canAct, onApply }) => {
  // 同步鎖：防止快速連點在 React state 更新前重複消耗次數
  const busyRef = useRef(false);
  // gameState 更新（消耗成功）後解鎖，允許下一次操作
  useEffect(() => {
    busyRef.current = false;
  }, [gameState]);
  const player = gameState.players[playerIndex];
  if (!player) return null;

  const droneUses = player.mounts?.droneMountUses ?? 0;
  const carUses = player.mounts?.hoverCarUses ?? 0;
  // 沒有這兩個坐騎（皆未裝備 / 皆無次數）就不渲染，保持主畫面精簡
  if (droneUses <= 0 && carUses <= 0) return null;

  const disabled = !canAct || player.isBankrupt;

  const handleDrone = () => {
    if (disabled || droneUses <= 0 || busyRef.current) return;
    busyRef.current = true;
    const next = cloneForMountUse(gameState, playerIndex);
    const amount = droneMountEngine(next, playerIndex);
    if (amount > 0) {
      onApply(next);
      vibrate(vibrationPatterns.light);
      toast(`偵察無人機：獲得 ${amount} 元情報收入`, { duration: 2000 });
    } else {
      busyRef.current = false;
    }
  };

  const handleCar = () => {
    if (disabled || carUses <= 0 || busyRef.current) return;
    busyRef.current = true;
    const next = cloneForMountUse(gameState, playerIndex);
    const steps = hoverCarMountEngine(next, playerIndex);
    if (steps > 0) {
      onApply(next);
      vibrate(vibrationPatterns.medium ?? vibrationPatterns.light);
      toast(`懸浮跑車：向前馳騁 ${steps} 格`, { duration: 2000 });
    } else {
      busyRef.current = false;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {droneUses > 0 && (
        <button
          type="button"
          onClick={handleDrone}
          disabled={disabled}
          className="cyber-btn px-3 py-2 text-xs font-cyber tracking-wide whitespace-nowrap flex-shrink-0 min-h-[44px]"
          style={{
            borderColor: 'var(--green)',
            color: disabled ? 'rgba(0,255,128,0.4)' : 'var(--green)',
            backgroundColor: 'rgba(0,255,128,0.08)',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          aria-label="使用偵察無人機：獲得情報收入"
        >
          <Bot size={14} className="inline mr-1 -mt-0.5" />
          無人機 ({droneUses})
        </button>
      )}
      {carUses > 0 && (
        <button
          type="button"
          onClick={handleCar}
          disabled={disabled}
          className="cyber-btn px-3 py-2 text-xs font-cyber tracking-wide whitespace-nowrap flex-shrink-0 min-h-[44px]"
          style={{
            borderColor: 'var(--cyan)',
            color: disabled ? 'rgba(0,255,255,0.4)' : 'var(--cyan)',
            backgroundColor: 'rgba(0,255,255,0.08)',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          aria-label="使用懸浮跑車：向前移動 5 格"
        >
          <CarFront size={14} className="inline mr-1 -mt-0.5" />
          跑車 ({carUses})
        </button>
      )}
    </div>
  );
};

export default MountQuickActions;
