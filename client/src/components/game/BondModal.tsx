import { useState } from 'react';
import type { FC } from 'react';
import { X, FileText, TrendingUp, Wallet, ArrowUpCircle, ArrowDownCircle, User } from 'lucide-react';
import {
  BOND_MIN_AMOUNT,
  BOND_MAX_AMOUNT,
  BOND_MIN_INTEREST,
  BOND_MAX_INTEREST,
  BOND_MIN_TURNS,
  BOND_MAX_TURNS,
} from '@shared/game-config';
import type { Bond, PlayerState } from '@shared/api.interface';

type BondTab = 'issue' | 'subscribe' | 'mine';

interface BondModalProps {
  open: boolean;
  onClose: () => void;
  playerIndex: number;
  bonds: Bond[];
  players: PlayerState[];
  playerMoney: number;
  onIssue: (amount: number, interestRate: number, turns: number) => void;
  onSubscribe: (bondId: string) => void;
}

const BondModal: FC<BondModalProps> = ({
  open,
  onClose,
  playerIndex,
  bonds,
  players,
  playerMoney,
  onIssue,
  onSubscribe,
}) => {
  const [activeTab, setActiveTab] = useState<BondTab>('issue');
  const [amount, setAmount] = useState<number>(BOND_MIN_AMOUNT);
  const [interestRate, setInterestRate] = useState<number>(BOND_MIN_INTEREST);
  const [turns, setTurns] = useState<number>(BOND_MIN_TURNS);
  const [confirmIssue, setConfirmIssue] = useState<boolean>(false);

  if (!open) return null;

  // 可认购债券：已发行但未被认购且不是自己发行的
  const availableBonds = bonds.filter(
    (b: Bond) => b.status === 'issued' && b.holderId === null && b.issuerId !== playerIndex,
  );

  // 我发行的债券
  const myIssuedBonds = bonds.filter((b: Bond) => b.issuerId === playerIndex && b.active);
  // 我持有的债券
  const myHeldBonds = bonds.filter((b: Bond) => b.holderId === playerIndex && b.active);

  const repaymentAmount = Math.floor(amount * (1 + interestRate));

  const handleIssue = () => {
    if (!confirmIssue) {
      setConfirmIssue(true);
      return;
    }
    onIssue(amount, interestRate, turns);
    setConfirmIssue(false);
  };

  const getIssuerName = (issuerId: number): string => {
    return players[issuerId]?.name ?? `玩家${issuerId + 1}`;
  };

  const formatPercent = (rate: number): string => {
    return `${Math.round(rate * 100)}%`;
  };

  const tabButtons: { key: BondTab; label: string; icon: typeof FileText }[] = [
    { key: 'issue', label: '發行債券', icon: ArrowUpCircle },
    { key: 'subscribe', label: '認購債券', icon: ArrowDownCircle },
    { key: 'mine', label: '我的債券', icon: Wallet },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card rounded-lg w-full max-w-lg relative"
        style={{
          border: '1px solid hsl(45, 100%, 60%)',
          boxShadow:
            '0 0 30px hsla(45, 100%, 60%, 0.3), inset 0 0 20px hsla(45, 100%, 60%, 0.05)',
          animation: 'modal-in 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[hsl(45_100%_60%_0.3)]">
          <div className="flex items-center gap-3">
            <FileText
              className="w-7 h-7 md:w-8 md:h-8"
              style={{
                color: 'hsl(45, 100%, 60%)',
                filter: 'drop-shadow(0 0 8px hsla(45, 100%, 60%, 0.6))',
              }}
            />
            <div>
              <h2
                className="font-cyber text-xl md:text-2xl tracking-wider"
                style={{
                  color: 'hsl(45, 100%, 60%)',
                  textShadow: '0 0 10px hsla(45, 100%, 60%, 0.6), 0 0 20px hsla(45, 100%, 60%, 0.3)',
                }}
              >
                債券市場
              </h2>
              <p
                className="text-[10px] md:text-xs mt-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                CYBER BOND EXCHANGE
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[hsl(45_100%_60%_0.2)]">
          {tabButtons.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setConfirmIssue(false);
                }}
                className="flex-1 py-2.5 px-2 text-xs md:text-sm font-cyber tracking-wider flex items-center justify-center gap-1.5 transition-all"
                style={{
                  color: isActive ? 'hsl(45, 100%, 60%)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid hsl(45, 100%, 60%)' : '2px solid transparent',
                  textShadow: isActive ? '0 0 6px hsla(45, 100%, 60%, 0.6)' : 'none',
                  backgroundColor: isActive ? 'hsla(45, 100%, 60%, 0.08)' : 'transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 max-h-[60vh] overflow-y-auto">
          {/* 發行債券 Tab */}
          {activeTab === 'issue' && (
            <div className="space-y-5">
              {/* 可用现金 */}
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: 'hsla(45, 100%, 60%, 0.08)',
                  border: '1px solid hsla(45, 100%, 60%, 0.3)',
                }}
              >
                <div
                  className="text-[10px] font-cyber tracking-wider mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  可用現金
                </div>
                <div
                  className="font-cyber text-xl tracking-wider"
                  style={{
                    color: 'hsl(45, 100%, 60%)',
                    textShadow: '0 0 8px hsla(45, 100%, 60%, 0.5)',
                  }}
                >
                  ¥{playerMoney.toLocaleString()}
                </div>
              </div>

              {/* 金額滑桿 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                    債券面額
                  </span>
                  <span
                    className="font-cyber text-sm tracking-wider"
                    style={{ color: 'hsl(45, 100%, 60%)' }}
                  >
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={BOND_MIN_AMOUNT}
                  max={BOND_MAX_AMOUNT}
                  step={500}
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                    setConfirmIssue(false);
                  }}
                  className="w-full accent-[hsl(45_100%_60%)]"
                />
                <div
                  className="flex justify-between text-[10px] mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>¥{BOND_MIN_AMOUNT.toLocaleString()}</span>
                  <span>¥{BOND_MAX_AMOUNT.toLocaleString()}</span>
                </div>
              </div>

              {/* 利率滑桿 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                    利率
                  </span>
                  <span
                    className="font-cyber text-sm tracking-wider"
                    style={{ color: 'hsl(45, 100%, 60%)' }}
                  >
                    {formatPercent(interestRate)}
                  </span>
                </div>
                <input
                  type="range"
                  min={BOND_MIN_INTEREST * 100}
                  max={BOND_MAX_INTEREST * 100}
                  step={5}
                  value={interestRate * 100}
                  onChange={(e) => {
                    setInterestRate(Number(e.target.value) / 100);
                    setConfirmIssue(false);
                  }}
                  className="w-full accent-[hsl(45_100%_60%)]"
                />
                <div
                  className="flex justify-between text-[10px] mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>{formatPercent(BOND_MIN_INTEREST)}</span>
                  <span>{formatPercent(BOND_MAX_INTEREST)}</span>
                </div>
              </div>

              {/* 期數滑桿 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                    期數
                  </span>
                  <span
                    className="font-cyber text-sm tracking-wider"
                    style={{ color: 'hsl(45, 100%, 60%)' }}
                  >
                    {turns} 回合
                  </span>
                </div>
                <input
                  type="range"
                  min={BOND_MIN_TURNS}
                  max={BOND_MAX_TURNS}
                  step={1}
                  value={turns}
                  onChange={(e) => {
                    setTurns(Number(e.target.value));
                    setConfirmIssue(false);
                  }}
                  className="w-full accent-[hsl(45_100%_60%)]"
                />
                <div
                  className="flex justify-between text-[10px] mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>{BOND_MIN_TURNS} 回合</span>
                  <span>{BOND_MAX_TURNS} 回合</span>
                </div>
              </div>

              {/* 預計償還 */}
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: 'rgba(255, 77, 109, 0.08)',
                  border: '1px solid rgba(255, 77, 109, 0.3)',
                }}
              >
                <div
                  className="text-[10px] font-cyber tracking-wider mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  到期償還總額
                </div>
                <div
                  className="font-cyber text-lg tracking-wider"
                  style={{
                    color: 'var(--pink)',
                    textShadow: '0 0 6px var(--pink-glow)',
                  }}
                >
                  ¥{repaymentAmount.toLocaleString()}
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  本金 ¥{amount.toLocaleString()} + 利息 ¥{Math.floor(amount * interestRate).toLocaleString()}
                </div>
              </div>

              {/* 提示 */}
              <div
                className="text-center text-[11px] p-2 rounded"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(180, 180, 220, 0.05)',
                  border: '1px dashed hsla(45, 100%, 60%, 0.3)',
                }}
              >
                發行後立即獲得本金，到期需償還本金+利息
                <br />
                無人認購則自動作廢
              </div>

              {/* 發行按鈕 */}
              <button
                onClick={handleIssue}
                className="w-full py-3 rounded font-cyber tracking-wider text-sm transition-all"
                style={{
                  border: '1px solid hsl(45, 100%, 60%)',
                  color: 'hsl(45, 100%, 60%)',
                  backgroundColor: confirmIssue
                    ? 'hsla(45, 100%, 60%, 0.2)'
                    : 'hsla(45, 100%, 60%, 0.1)',
                  boxShadow: '0 0 10px hsla(45, 100%, 60%, 0.3)',
                  textShadow: '0 0 6px hsla(45, 100%, 60%, 0.6)',
                }}
              >
                {confirmIssue ? '注意 再次確認發行' : '發行債券'}
              </button>
            </div>
          )}

          {/* 認購債券 Tab */}
          {activeTab === 'subscribe' && (
            <div className="space-y-3">
              {availableBonds.length === 0 ? (
                <div
                  className="text-center py-8 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  暫無可認購債券
                </div>
              ) : (
                availableBonds.map((bond: Bond) => {
                  const issuerName = getIssuerName(bond.issuerId);
                  const maturityAmount = Math.floor(bond.amount * (1 + bond.interestRate));
                  const canAfford = playerMoney >= bond.amount;

                  return (
                    <div
                      key={bond.id}
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-mid)',
                        border: '1px solid hsla(45, 100%, 60%, 0.25)',
                        boxShadow: '0 0 8px hsla(45, 100%, 60%, 0.1)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User
                            className="w-4 h-4"
                            style={{ color: 'var(--cyan)' }}
                          />
                          <span
                            className="font-cyber text-sm tracking-wider"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {issuerName}
                          </span>
                        </div>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider"
                          style={{
                            color: 'hsl(45, 100%, 60%)',
                            border: '1px solid hsla(45, 100%, 60%, 0.5)',
                            backgroundColor: 'hsla(45, 100%, 60%, 0.1)',
                          }}
                        >
                          可認購
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <div
                            className="text-[10px] mb-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            面額
                          </div>
                          <div
                            className="font-cyber text-sm tracking-wide"
                            style={{ color: 'hsl(45, 100%, 60%)' }}
                          >
                            ¥{bond.amount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-[10px] mb-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            利率
                          </div>
                          <div
                            className="font-cyber text-sm tracking-wide"
                            style={{ color: 'var(--green)' }}
                          >
                            {formatPercent(bond.interestRate)}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-[10px] mb-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            剩餘
                          </div>
                          <div
                            className="font-cyber text-sm tracking-wide"
                            style={{ color: 'var(--cyan)' }}
                          >
                            {bond.turnsRemaining} 回合
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between p-2 rounded mb-3"
                        style={{
                          backgroundColor: 'rgba(0, 255, 128, 0.08)',
                          border: '1px solid rgba(0, 255, 128, 0.2)',
                        }}
                      >
                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          到期償還
                        </span>
                        <span
                          className="font-cyber text-sm tracking-wider"
                          style={{ color: 'var(--green)', textShadow: '0 0 4px var(--green)' }}
                        >
                          ¥{maturityAmount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => onSubscribe(bond.id)}
                        disabled={!canAfford}
                        className="w-full py-2 rounded font-cyber tracking-wider text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          border: '1px solid hsl(45, 100%, 60%)',
                          color: 'hsl(45, 100%, 60%)',
                          backgroundColor: 'hsla(45, 100%, 60%, 0.1)',
                          boxShadow: canAfford ? '0 0 8px hsla(45, 100%, 60%, 0.3)' : 'none',
                          textShadow: '0 0 4px hsla(45, 100%, 60%, 0.5)',
                        }}
                      >
                        {canAfford ? '認購' : '現金不足'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 我的債券 Tab */}
          {activeTab === 'mine' && (
            <div className="space-y-4">
              {/* 我发行的 */}
              <div>
                <div
                  className="text-xs font-cyber tracking-wider mb-2"
                  style={{ color: 'var(--pink)', textShadow: '0 0 4px var(--pink-glow)' }}
                >
                  我發行的（{myIssuedBonds.length}）
                </div>
                {myIssuedBonds.length === 0 ? (
                  <div
                    className="text-center py-4 text-xs rounded"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-mid)',
                    }}
                  >
                    暫無發行中債券
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myIssuedBonds.map((bond: Bond) => {
                      const maturityAmount = Math.floor(bond.amount * (1 + bond.interestRate));
                      const statusLabel: Record<Bond['status'], string> = {
                        issued: '等待認購',
                        subscribed: '已被認購',
                        matured: '已到期',
                        repaid: '已償還',
                        defaulted: '違約',
                      };
                      const statusColor: Record<Bond['status'], string> = {
                        issued: 'hsl(45, 100%, 60%)',
                        subscribed: 'var(--cyan)',
                        matured: 'var(--pink)',
                        repaid: 'var(--green)',
                        defaulted: 'var(--red)',
                      };

                      return (
                        <div
                          key={bond.id}
                          className="p-2.5 rounded-lg flex items-center justify-between"
                          style={{
                            backgroundColor: 'var(--bg-mid)',
                            border: '1px solid rgba(255, 107, 157, 0.2)',
                          }}
                        >
                          <div>
                            <div
                              className="font-cyber text-sm tracking-wide"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ¥{bond.amount.toLocaleString()} · {formatPercent(bond.interestRate)}
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                              剩餘 {bond.turnsRemaining} 回合 · 償還 ¥{maturityAmount.toLocaleString()}
                            </div>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider"
                            style={{
                              color: statusColor[bond.status],
                              border: `1px solid ${statusColor[bond.status]}55`,
                              backgroundColor: `${statusColor[bond.status]}15`,
                            }}
                          >
                            {statusLabel[bond.status]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 我持有的 */}
              <div>
                <div
                  className="text-xs font-cyber tracking-wider mb-2"
                  style={{ color: 'var(--green)', textShadow: '0 0 4px var(--green)' }}
                >
                  我持有的（{myHeldBonds.length}）
                </div>
                {myHeldBonds.length === 0 ? (
                  <div
                    className="text-center py-4 text-xs rounded"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-mid)',
                    }}
                  >
                    暫無持有中債券
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myHeldBonds.map((bond: Bond) => {
                      const maturityAmount = Math.floor(bond.amount * (1 + bond.interestRate));
                      const issuerName = getIssuerName(bond.issuerId);
                      const statusLabel: Record<Bond['status'], string> = {
                        issued: '等待認購',
                        subscribed: '持有中',
                        matured: '已到期',
                        repaid: '已兌付',
                        defaulted: '違約',
                      };
                      const statusColor: Record<Bond['status'], string> = {
                        issued: 'hsl(45, 100%, 60%)',
                        subscribed: 'var(--green)',
                        matured: 'var(--pink)',
                        repaid: 'var(--green)',
                        defaulted: 'var(--red)',
                      };

                      return (
                        <div
                          key={bond.id}
                          className="p-2.5 rounded-lg flex items-center justify-between"
                          style={{
                            backgroundColor: 'var(--bg-mid)',
                            border: '1px solid rgba(0, 255, 128, 0.2)',
                          }}
                        >
                          <div>
                            <div
                              className="font-cyber text-sm tracking-wide"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {issuerName} · ¥{maturityAmount.toLocaleString()}
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                              剩餘 {bond.turnsRemaining} 回合 · 利率 {formatPercent(bond.interestRate)}
                            </div>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-cyber tracking-wider"
                            style={{
                              color: statusColor[bond.status],
                              border: `1px solid ${statusColor[bond.status]}55`,
                              backgroundColor: `${statusColor[bond.status]}15`,
                            }}
                          >
                            {statusLabel[bond.status]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[hsl(45_100%_60%)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[hsl(45_100%_60%)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[hsl(45_100%_60%)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[hsl(45_100%_60%)]" />
      </div>
    </div>
  );
};

export default BondModal;
