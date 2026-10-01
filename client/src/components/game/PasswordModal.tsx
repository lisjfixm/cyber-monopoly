import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';

export interface PasswordModalProps {
  open: boolean;
  roomName?: string;
  onClose: () => void;
  onConfirm: (password: string) => void;
  error?: string;
}

const PasswordModal = ({
  open,
  roomName,
  onClose,
  onConfirm,
  error,
}: PasswordModalProps) => {
  const [password, setPassword] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const PASSWORD_LEN = 4;

  useEffect(() => {
    if (open) {
      setPassword('');
      // focus after dialog animates in
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, PASSWORD_LEN);
    setPassword(value);
  };

  const handleConfirm = () => {
    if (password.length === PASSWORD_LEN) {
      onConfirm(password);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && password.length === PASSWORD_LEN) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent
        className="cyber-card max-w-sm"
        style={{
          borderColor: 'var(--purple)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
          backgroundColor: 'hsl(240, 18%, 10%)',
        }}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle
            className="font-cyber text-2xl tracking-wider text-center flex items-center justify-center gap-2"
            style={{ color: 'var(--purple)', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}
          >
            <Lock size={20} />
            輸入房間密碼
          </DialogTitle>
          {roomName && (
            <p className="text-center text-[var(--text-secondary)] text-sm font-cyber tracking-wider">
              {roomName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={PASSWORD_LEN}
              inputMode="numeric"
              className="cyber-input text-center font-cyber text-3xl"
              style={{
                width: '180px',
                letterSpacing: '0.5em',
                paddingLeft: '0.75em',
                borderColor: error
                  ? 'var(--red)'
                  : 'rgba(168, 85, 247, 0.5)',
                boxShadow: error
                  ? '0 0 12px rgba(255, 77, 77, 0.4)'
                  : '0 0 8px rgba(168, 85, 247, 0.3)',
                color: error ? 'var(--red)' : 'var(--cyan)',
              }}
              placeholder="••••"
            />
          </div>

          <div className="text-center text-xs text-[var(--text-muted)] font-cyber tracking-wider">
            {password.length}/{PASSWORD_LEN}
          </div>

          {error && (
            <div
              className="text-sm text-center font-cyber tracking-wider"
              style={{ color: 'var(--red)', textShadow: '0 0 8px rgba(255, 77, 77, 0.5)' }}
            >
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={password.length !== PASSWORD_LEN}
            className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
            style={{
              borderColor: 'var(--purple)',
              color: 'var(--purple)',
              background: 'rgba(168, 85, 247, 0.1)',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.3)',
            }}
          >
            確認
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordModal;
