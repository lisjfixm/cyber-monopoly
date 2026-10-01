import { useState, type FC } from 'react';
import { X, Download, Share2, Image as ImageIcon } from 'lucide-react';
import { downloadCanvasAsPng, shareImage } from '@client/src/utils/achievement-card';
import { Image } from '@client/src/components/ui/image';

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  canvas?: HTMLCanvasElement | null;
}

const ShareCardModal: FC<ShareCardModalProps> = ({
  open,
  onClose,
  imageUrl,
  title = '成就分享卡',
  canvas = null,
}) => {
  const [sharing, setSharing] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string>('');

  if (!open) return null;

  const handleDownload = (): void => {
    if (canvas) {
      downloadCanvasAsPng(canvas, 'cyber-monopoly-achievement.png');
    } else {
      // 從 dataUrl 下載
      const link = document.createElement('a');
      link.download = 'cyber-monopoly-achievement.png';
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async (): Promise<void> => {
    setSharing(true);
    setShareError('');
    try {
      const success = await shareImage(imageUrl, '賽博大富翁成就', '我在賽博大富翁解鎖了新成就！');
      if (!success) {
        setShareError('您的瀏覽器不支援分享，請長按圖片保存後分享');
      }
    } catch {
      setShareError('分享失敗，請長按圖片保存後分享');
    } finally {
      setSharing(false);
    }
  };

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div
        className="cyber-card w-full max-w-md overflow-hidden flex flex-col"
        style={{
          borderColor: 'hsl(45, 100%, 60%)',
          boxShadow: '0 0 30px hsla(45, 100%, 60%, 0.3), inset 0 0 20px hsla(45, 100%, 60%, 0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'hsla(45, 100%, 60%, 0.3)' }}
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5" style={{ color: 'hsl(45, 100%, 60%)' }} />
            <h2
              className="font-cyber text-lg tracking-wider"
              style={{
                color: 'hsl(45, 100%, 60%)',
                textShadow: '0 0 8px hsla(45, 100%, 60%, 0.6)',
              }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4 flex justify-center">
          <div
            className="w-full max-w-[320px] aspect-square overflow-hidden rounded"
            style={{
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.15)',
            }}
          >
            <Image
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain bg-black"
            />
          </div>
        </div>

        {/* Hint */}
        {!canShare && (
          <div
            className="text-center text-xs px-4 py-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            請長按圖片保存後分享
          </div>
        )}

        {shareError && (
          <div
            className="text-center text-xs px-4 py-2"
            style={{ color: 'var(--yellow)' }}
          >
            {shareError}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="cyber-btn flex-1 py-2.5 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <Download size={16} />
            下載圖片
          </button>
          {canShare && (
            <button
              type="button"
              onClick={() => void handleShare()}
              disabled={sharing}
              className="cyber-btn flex-1 py-2.5 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
              style={{
                borderColor: 'hsl(45, 100%, 60%)',
                color: 'hsl(45, 100%, 60%)',
                opacity: sharing ? 0.6 : 1,
              }}
            >
              <Share2 size={16} />
              {sharing ? '分享中...' : '分享'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareCardModal;
