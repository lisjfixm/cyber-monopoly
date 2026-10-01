import { useState } from 'react';
import { Palette } from 'lucide-react';
import SettingsModal from './SettingsModal';

interface SettingsButtonProps {
  className?: string;
  onFirstInteract?: () => void;
}

const SettingsButton = ({ className, onFirstInteract }: SettingsButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [showTip, setShowTip] = useState<boolean>(false);

  const handleClick = () => {
    onFirstInteract?.();
    setOpen(true);
  };

  return (
    <>
      <div
        className={`relative ${className || ''}`}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        <button
          type="button"
          onClick={handleClick}
          className="cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all"
          style={{
            borderColor: 'var(--purple)',
            color: 'var(--purple)',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.25)',
            background: 'rgba(168, 85, 247, 0.08)',
          }}
          aria-label="開啟設定"
        >
          <Palette className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        {showTip && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-cyber tracking-wider whitespace-nowrap cyber-card z-50"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-neon-cyan)',
              fontSize: '11px',
            }}
          >
            設定
          </div>
        )}
      </div>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default SettingsButton;
