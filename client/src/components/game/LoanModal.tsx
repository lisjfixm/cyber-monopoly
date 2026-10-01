import { useState } from 'react';
import type { FC } from 'react';
import { X, Landmark, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { LOAN_MAX, LOAN_INTEREST_RATE } from '@shared/game-config';

interface LoanModalProps {
  open: boolean;
  onClose: () => void;
  playerIndex: number;
  currentLoan: number;
  playerMoney: number;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
}

const LOAN_QUICK_AMOUNTS = [1000, 2000, 3000, 5000];
const REPAY_QUICK_AMOUNTS = [500, 1000];

const LoanModal: FC<LoanModalProps> = ({
  open,
  onClose,
  currentLoan,
  playerMoney,
  onTakeLoan,
  onRepayLoan,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(1000);
  const [repayAmount, setRepayAmount] = useState<number>(500);

  if (!open) return null;

  const canTakeLoan = currentLoan <= 0;
  const canRepay = currentLoan > 0;
  const nextInterest = Math.ceil(currentLoan * LOAN_INTEREST_RATE);

  const handleTakeLoan = () => {
    if (!canTakeLoan || loanAmount <= 0) return;
    onTakeLoan(loanAmount);
  };

  const handleRepayLoan = (amount: number) => {
    if (!canRepay || amount <= 0) return;
    onRepayLoan(amount);
  };

  const handleRepayAll = () => {
    if (!canRepay) return;
    const repayAll = Math.min(currentLoan, playerMoney);
    onRepayLoan(repayAll);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card rounded-lg w-full max-w-md relative"
        style={{
          border: '1px solid var(--cyan)',
          boxShadow: '0 0 20px var(--cyan-glow), inset 0 0 20px rgba(0, 255, 255, 0.1)',
          animation: 'modal-in 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[var(--border-neon-cyan)]">
          <div className="flex items-center gap-3">
            <Landmark
              className="w-7 h-7 md:w-8 md:h-8"
              style={{
                color: 'var(--yellow)',
                filter: 'drop-shadow(0 0 6px var(--yellow))',
              }}
            />
            <div>
              <h2
                className="font-cyber text-xl md:text-2xl tracking-wider"
                style={{
                  color: 'var(--yellow)',
                  textShadow: '0 0 10px var(--yellow), 0 0 20px rgba(250, 204, 21, 0.5)',
                }}
              >
                銀行貸款
              </h2>
              <p className="text-[10px] md:text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                CYBER BANKING SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-5">
          {/* Loan status summary */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(255, 0, 0, 0.08)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
              }}
            >
              <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                貸款餘額
              </div>
              <div
                className="font-cyber text-lg md:text-xl tracking-wider"
                style={{
                  color: 'var(--red)',
                  textShadow: '0 0 6px var(--red)',
                }}
              >
                ¥{currentLoan.toLocaleString()}
              </div>
              {currentLoan > 0 && (
                <div className="text-[10px] mt-1" style={{ color: 'var(--red)' }}>
                  下期利息：¥{nextInterest.toLocaleString()}
                </div>
              )}
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(0, 255, 128, 0.08)',
                border: '1px solid rgba(0, 255, 128, 0.3)',
              }}
            >
              <div className="text-[10px] font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                可用現金
              </div>
              <div
                className="font-cyber text-lg md:text-xl tracking-wider"
                style={{
                  color: 'var(--green)',
                  textShadow: '0 0 6px var(--green)',
                }}
              >
                ¥{playerMoney.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Interest info */}
          <div
            className="text-center text-xs p-2 rounded"
            style={{
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(180, 180, 220, 0.05)',
              border: '1px dashed var(--border-neon-cyan)',
            }}
          >
            每回合利息 <span style={{ color: 'var(--cyan)' }}>5%</span>，按當前餘額計算
            <br />
            貸款上限：<span style={{ color: 'var(--cyan)' }}>¥{LOAN_MAX.toLocaleString()}</span>
            {canTakeLoan && ' · 無未償還貸款時可借'}
          </div>

          {/* Borrow section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownCircle className="w-4 h-4" style={{ color: 'var(--green)' }} />
              <span
                className="font-cyber text-sm tracking-wider"
                style={{ color: 'var(--green)', textShadow: '0 0 4px var(--green)' }}
              >
                借款
              </span>
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {LOAN_QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setLoanAmount(amount)}
                  disabled={!canTakeLoan || amount > LOAN_MAX}
                  className={`py-1.5 text-xs font-cyber tracking-wide rounded transition-all ${
                    loanAmount === amount
                      ? ''
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    border: `1px solid ${loanAmount === amount ? 'var(--green)' : 'var(--border-neon-cyan)'}`,
                    color: loanAmount === amount ? 'var(--green)' : 'var(--text-secondary)',
                    backgroundColor: loanAmount === amount ? 'rgba(0, 255, 128, 0.15)' : 'transparent',
                    boxShadow: loanAmount === amount ? '0 0 8px rgba(0, 255, 128, 0.3)' : 'none',
                  }}
                >
                  {amount / 1000}k
                </button>
              ))}
            </div>

            {/* Amount slider / input */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="range"
                min={500}
                max={LOAN_MAX}
                step={500}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                disabled={!canTakeLoan}
                className="flex-1 accent-[var(--green)]"
              />
              <span
                className="font-cyber text-sm w-20 text-right"
                style={{ color: 'var(--green)' }}
              >
                ¥{loanAmount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleTakeLoan}
              disabled={!canTakeLoan || loanAmount <= 0}
              className="w-full py-2.5 rounded font-cyber tracking-wider text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: '1px solid var(--green)',
                color: 'var(--green)',
                backgroundColor: 'rgba(0, 255, 128, 0.1)',
                boxShadow: canTakeLoan ? '0 0 10px rgba(0, 255, 128, 0.3)' : 'none',
                textShadow: '0 0 6px var(--green)',
              }}
            >
              {canTakeLoan ? '確認借款' : '有未償還貸款，無法再借'}
            </button>
          </div>

          {/* Repay section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle className="w-4 h-4" style={{ color: 'var(--pink)' }} />
              <span
                className="font-cyber text-sm tracking-wider"
                style={{ color: 'var(--pink)', textShadow: '0 0 4px var(--pink-glow)' }}
              >
                還款
              </span>
            </div>

            {/* Quick repay buttons */}
            <div className="flex gap-1.5 mb-2">
              <button
                onClick={handleRepayAll}
                disabled={!canRepay}
                className="flex-1 py-1.5 text-xs font-cyber tracking-wide rounded transition-all disabled:opacity-40"
                style={{
                  border: '1px solid var(--pink)',
                  color: 'var(--pink)',
                  backgroundColor: 'rgba(255, 107, 157, 0.1)',
                }}
              >
                全部償還
              </button>
              {REPAY_QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRepayAmount(amount)}
                  disabled={!canRepay}
                  className={`py-1.5 px-2 text-xs font-cyber tracking-wide rounded transition-all ${
                    repayAmount === amount ? '' : 'opacity-60 hover:opacity-100'
                  } disabled:opacity-40`}
                  style={{
                    border: `1px solid ${repayAmount === amount ? 'var(--pink)' : 'var(--border-neon-cyan)'}`,
                    color: repayAmount === amount ? 'var(--pink)' : 'var(--text-secondary)',
                    backgroundColor: repayAmount === amount ? 'rgba(255, 107, 157, 0.15)' : 'transparent',
                    boxShadow: repayAmount === amount ? '0 0 8px rgba(255, 107, 157, 0.3)' : 'none',
                  }}
                >
                  ¥{amount}
                </button>
              ))}
            </div>

            {/* Custom repay amount */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="range"
                min={100}
                max={Math.min(currentLoan, playerMoney) || 100}
                step={100}
                value={repayAmount}
                onChange={(e) => setRepayAmount(Number(e.target.value))}
                disabled={!canRepay}
                className="flex-1 accent-[var(--pink)]"
              />
              <span
                className="font-cyber text-sm w-20 text-right"
                style={{ color: 'var(--pink)' }}
              >
                ¥{repayAmount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => handleRepayLoan(repayAmount)}
              disabled={!canRepay || repayAmount <= 0 || repayAmount > playerMoney}
              className="w-full py-2.5 rounded font-cyber tracking-wider text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                border: '1px solid var(--pink)',
                color: 'var(--pink)',
                backgroundColor: 'rgba(255, 107, 157, 0.1)',
                boxShadow: canRepay ? '0 0 10px rgba(255, 107, 157, 0.3)' : 'none',
                textShadow: '0 0 6px var(--pink-glow)',
              }}
            >
              {canRepay ? '確認還款' : '無未償還貸款'}
            </button>
            {canRepay && repayAmount > playerMoney && (
              <div className="text-[10px] text-center mt-1" style={{ color: 'var(--red)' }}>
                現金不足
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanModal;
