import { useState } from 'react';
import { X, Copy, Check, Share2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@client/src/i18n';
import { generateShareUrl } from '@client/src/utils/replay-share';

interface ReplayShareModalProps {
  open: boolean;
  onClose: () => void;
  shareId: string;
}

const ReplayShareModal = ({ open, onClose, shareId }: ReplayShareModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const shareUrl = generateShareUrl(shareId);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReplay = (): void => {
    onClose();
    navigate(`/replay?share=${shareId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fade-in 0.2s ease-out' }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="cyber-card relative w-full max-w-md p-5 md:p-6 overflow-hidden"
        style={{
          borderColor: 'var(--pink)',
          boxShadow:
            '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.05)',
          animation: 'fade-in 0.25s ease-out',
        }}
      >
        {/* 頂部霓虹裝飾線 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--pink)] to-transparent" />
        <div
          className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(255,0,255,0.3), transparent 70%)',
          }}
        />

        {/* 標題欄 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Share2
              size={20}
              style={{
                color: 'var(--pink)',
                filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.6))',
              }}
            />
            <h2
              className="font-cyber text-xl tracking-wider"
              style={{
                color: 'var(--pink)',
                textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
              }}
            >
              {t('replay.shareTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cyber-btn w-8 h-8 flex items-center justify-center p-0"
            style={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'var(--text-secondary)',
            }}
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('replay.shareDesc')}
        </p>

        {/* 分享連結顯示 */}
        <div
          className="p-3 rounded-lg mb-4 font-mono text-xs break-all"
          style={{
            background: 'var(--bg-mid)',
            border: '1px solid var(--border-neon-pink)',
            color: 'var(--text-primary)',
          }}
        >
          {shareUrl}
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="cyber-btn flex-1 py-2.5 flex items-center justify-center gap-2 transition-all"
            style={{
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              boxShadow: '0 0 8px rgba(0, 255, 255, 0.2)',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="font-cyber tracking-wide text-sm">
              {copied ? t('common.copied') : t('common.copyLink')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenReplay}
            className="cyber-btn flex-1 py-2.5 flex items-center justify-center gap-2 transition-all"
            style={{
              borderColor: 'var(--pink)',
              color: 'var(--pink)',
              boxShadow: '0 0 8px rgba(255, 0, 255, 0.25)',
            }}
          >
            <Play size={16} />
            <span className="font-cyber tracking-wide text-sm">
              {t('common.openReplay')}
            </span>
          </button>
        </div>

        {/* 底部裝飾 */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at bottom right, rgba(0,255,255,0.2), transparent 70%)',
          }}
        />
      </div>
    </div>
  );
};

export default ReplayShareModal;
