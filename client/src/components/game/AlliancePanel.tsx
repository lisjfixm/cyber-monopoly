import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { Handshake, Swords, X, Check } from 'lucide-react';
import type { PlayerState } from '@shared/api.interface';
import {
  getAllianceState,
  sendInvite,
  acceptInvite,
  rejectInvite,
  betray,
  isAllied,
  applyReputationDelta,
  getEffectiveReputation,
  type AllianceState,
} from '@client/src/utils/alliance';

interface AlliancePanelProps {
  players: PlayerState[];
  myPlayerIndex: number;
  onBetrayalLog: (text: string) => void;
  onReputationChange?: () => void;
}

type ModalState =
  | { type: 'none' }
  | { type: 'betray'; target: number }
  | { type: 'invite'; target: number };

const AlliancePanel: FC<AlliancePanelProps> = ({
  players, myPlayerIndex, onBetrayalLog, onReputationChange,
}) => {
  const [allianceState, setAllianceState] = useState<AllianceState>({
    alliances: [], invites: [],
  });
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  useEffect(() => { setAllianceState(getAllianceState()); }, []);

  const handleSendInvite = useCallback((targetIndex: number) => {
    setAllianceState(sendInvite(allianceState, myPlayerIndex, targetIndex));
    setModal({ type: 'none' });
  }, [allianceState, myPlayerIndex]);

  const handleAcceptInvite = useCallback((fromIndex: number) => {
    setAllianceState(acceptInvite(allianceState, fromIndex, myPlayerIndex));
  }, [allianceState, myPlayerIndex]);

  const handleRejectInvite = useCallback((fromIndex: number) => {
    setAllianceState(rejectInvite(allianceState, fromIndex, myPlayerIndex));
  }, [allianceState, myPlayerIndex]);

  const handleBetray = useCallback((allyIndex: number) => {
    setAllianceState(betray(allianceState, myPlayerIndex, allyIndex));
    applyReputationDelta(myPlayerIndex, -10);
    const allyName = players[allyIndex]?.name ?? `玩家${allyIndex + 1}`;
    onBetrayalLog(`你背叛了盟友 ${allyName}，聲望 -10`);
    setModal({ type: 'none' });
    onReputationChange?.();
  }, [allianceState, myPlayerIndex, players, onBetrayalLog, onReputationChange]);

  const receivedInvites = allianceState.invites.filter((i) => i.to === myPlayerIndex);
  const sentSet = new Set(
    allianceState.invites.filter((i) => i.from === myPlayerIndex).map((i) => i.to),
  );
  const otherPlayers = players.filter(
    (p) => p.playerIndex !== myPlayerIndex && !p.isBankrupt,
  );
  if (otherPlayers.length === 0) return null;

  const modalTarget = modal.type !== 'none' ? players[modal.target] : null;
  const isBetray = modal.type === 'betray';
  const accentColor = isBetray ? 'var(--red)' : 'var(--green)';
  const accentGlow = isBetray
    ? 'rgba(255, 0, 77, 0.4)' : 'rgba(0, 255, 128, 0.4)';
  const accentBg = isBetray
    ? 'rgba(255, 0, 77, 0.1)' : 'rgba(0, 255, 128, 0.1)';

  return (
    <div className="cyber-card p-3 md:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Handshake className="w-4 h-4" style={{ color: 'var(--green)' }} />
        <span className="font-cyber text-sm tracking-wider" style={{ color: 'var(--green)' }}>
          結盟系統
        </span>
      </div>

      {receivedInvites.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="text-xs font-cyber tracking-wider" style={{ color: 'var(--cyan)' }}>
            收到的邀請
          </div>
          {receivedInvites.map((inv) => {
            const fp = players[inv.from];
            if (!fp) return null;
            return (
              <div key={`inv-${inv.from}-${inv.to}`}
                className="flex items-center justify-between p-2 rounded"
                style={{
                  background: 'rgba(0, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                }}>
                <span className="text-xs text-text-primary truncate flex-1 mr-2">
                  {fp.name} 邀請結盟
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleAcceptInvite(inv.from)}
                    className="p-1 rounded" title="接受"
                    style={{
                      color: 'var(--green)',
                      border: '1px solid var(--green)',
                      boxShadow: '0 0 6px rgba(0, 255, 128, 0.3)',
                    }}>
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleRejectInvite(inv.from)}
                    className="p-1 rounded" title="拒絕"
                    style={{
                      color: 'var(--red)',
                      border: '1px solid var(--red)',
                      boxShadow: '0 0 6px rgba(255, 0, 77, 0.3)',
                    }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {otherPlayers.map((player) => {
          const allied = isAllied(allianceState, myPlayerIndex, player.playerIndex);
          const hasSent = sentSet.has(player.playerIndex);
          const effRep = getEffectiveReputation(player.reputation, player.playerIndex);
          return (
            <div key={player.playerIndex}
              className="flex items-center justify-between p-2 rounded"
              style={{
                background: allied ? 'rgba(0, 255, 128, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                border: allied
                  ? '1px solid rgba(0, 255, 128, 0.25)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
              }}>
              <div className="flex-1 min-w-0 mr-2">
                <div className="text-xs text-text-primary truncate flex items-center gap-1">
                  {allied && (
                    <Handshake className="w-3 h-3 flex-shrink-0"
                      style={{ color: 'var(--green)' }} />
                  )}
                  {player.name}
                </div>
                <div className="text-[10px] text-text-secondary">
                  聲望 {effRep}
                  {allied && (
                    <span style={{ color: 'var(--green)' }} className="ml-1">· 結盟中</span>
                  )}
                  {hasSent && !allied && (
                    <span style={{ color: 'var(--cyan)' }} className="ml-1">· 等待回應</span>
                  )}
                </div>
              </div>
              {allied ? (
                <button onClick={() => setModal({ type: 'betray', target: player.playerIndex })}
                  className="px-2 py-1 text-[10px] font-cyber tracking-wider rounded flex items-center gap-1 flex-shrink-0"
                  style={{
                    color: 'var(--red)',
                    border: '1px solid var(--red)',
                    boxShadow: '0 0 8px rgba(255, 0, 77, 0.25)',
                    background: 'rgba(255, 0, 77, 0.06)',
                  }}>
                  <Swords className="w-3 h-3" />背叛
                </button>
              ) : hasSent ? (
                <span
                  className="px-2 py-1 text-[10px] font-cyber tracking-wider rounded flex-shrink-0"
                  style={{
                    color: 'var(--cyan)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    background: 'rgba(0, 255, 255, 0.05)',
                  }}>已邀請</span>
              ) : (
                <button onClick={() => setModal({ type: 'invite', target: player.playerIndex })}
                  className="px-2 py-1 text-[10px] font-cyber tracking-wider rounded flex items-center gap-1 flex-shrink-0"
                  style={{
                    color: 'var(--green)',
                    border: '1px solid var(--green)',
                    boxShadow: '0 0 8px rgba(0, 255, 128, 0.25)',
                    background: 'rgba(0, 255, 128, 0.06)',
                  }}>
                  <Handshake className="w-3 h-3" />結盟邀請
                </button>
              )}
            </div>
          );
        })}
      </div>

      {modal.type !== 'none' && modalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => setModal({ type: 'none' })}>
           <div className="cyber-card p-5 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: accentColor, boxShadow: `0 0 30px ${accentGlow}` }}>
            <div className="flex items-center gap-2 mb-3">
              {isBetray ? (
                <Swords className="w-5 h-5" style={{ color: accentColor }} />
              ) : (
                <Handshake className="w-5 h-5" style={{ color: accentColor }} />
              )}
              <span className="font-cyber text-lg tracking-wider" style={{ color: accentColor }}>
                {isBetray ? '確認背叛？' : '發出結盟邀請'}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              {isBetray ? (
                <>背叛盟友後雙方結盟解除，
                  <span style={{ color: 'var(--red)' }}>聲望 -10</span>
                  ，往後經過其土地不再豁免過路費。</>
              ) : (
                <>向 <span className="text-text-primary">{modalTarget.name}</span>{' '}
                  發出結盟邀請？<br />
                  結盟後互相經過土地時
                  <span style={{ color: 'var(--green)' }}>豁免過路費</span>（需後端支援）。</>
              )}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal({ type: 'none' })}
                className="flex-1 py-2 text-sm font-cyber tracking-wider rounded"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-neon)',
                }}>取消</button>
              <button
                onClick={() => isBetray ? handleBetray(modal.target) : handleSendInvite(modal.target)}
                className="flex-1 py-2 text-sm font-cyber tracking-wider rounded"
                style={{
                  color: accentColor,
                  border: `1px solid ${accentColor}`,
                  boxShadow: `0 0 12px ${accentGlow}`,
                  background: accentBg,
                }}>
                {isBetray ? '確認背叛' : '發送邀請'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlliancePanel;
