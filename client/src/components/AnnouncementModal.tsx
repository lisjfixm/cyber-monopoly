import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { useTranslation } from '@client/src/i18n';
import {
  getUnreadAnnouncements,
  markAsRead,
  markAllAsRead,
  type Announcement,
  type AnnouncementType,
} from '@client/src/utils/announcements';

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_STYLES: Record<AnnouncementType, { color: string; labelKey: string }> = {
  update: { color: 'var(--cyan)', labelKey: 'announcement.typeUpdate' },
  event: { color: 'var(--yellow)', labelKey: 'announcement.typeEvent' },
  maintenance: { color: 'var(--orange)', labelKey: 'announcement.typeMaintenance' },
  compensation: { color: '#facc15', labelKey: 'announcement.typeCompensation' },
};

const AnnouncementModal = ({ open, onClose }: AnnouncementModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open) return null;

  const unread = getUnreadAnnouncements();
  const announcements: Announcement[] = unread.length > 0 ? unread : [];

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const style = TYPE_STYLES[current.type];

  const handleClose = (): void => {
    // 關閉時標記當前公告為已讀
    markAsRead(current.id);
    onClose();
  };

  const handleMarkAll = (): void => {
    markAllAsRead();
    onClose();
  };

  const handleViewAll = (): void => {
    markAsRead(current.id);
    onClose();
    navigate('/announcements');
  };

  const handlePrev = (): void => {
    markAsRead(current.id);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (): void => {
    markAsRead(current.id);
    setCurrentIndex((prev) => Math.min(announcements.length - 1, prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fade-in 0.2s ease-out' }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="cyber-card relative w-full max-w-lg p-5 md:p-6 overflow-hidden"
        style={{
          borderColor: 'var(--cyan)',
          boxShadow:
            '0 0 30px rgba(0, 255, 255, 0.25), inset 0 0 20px rgba(0, 255, 255, 0.05)',
          animation: 'fade-in 0.25s ease-out',
        }}
      >
        {/* 頂部裝飾 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />

        {/* 標題 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone
              size={18}
              style={{
                color: 'var(--cyan)',
                filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.5))',
              }}
            />
            <h2
              className="font-cyber text-lg md:text-xl tracking-wider"
              style={{
                color: 'var(--cyan)',
                textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
              }}
            >
              {t('announcement.newAnnouncement')}
            </h2>
            {announcements.length > 1 && (
              <span
                className="text-xs font-cyber px-2 py-0.5 rounded"
                style={{
                  background: 'var(--bg-mid)',
                  color: 'var(--text-secondary)',
                }}
              >
                {currentIndex + 1} / {announcements.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
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

        {/* 類型標籤 */}
        <div className="mb-3">
          <span
            className="inline-block px-2 py-0.5 text-xs font-cyber tracking-wider rounded"
            style={{
              backgroundColor: `${style.color}20`,
              color: style.color,
              border: `1px solid ${style.color}40`,
              boxShadow: `0 0 6px ${style.color}30`,
            }}
          >
            {t(style.labelKey)}
          </span>
        </div>

        {/* 標題 */}
        <h3
          className="font-cyber text-base md:text-lg mb-2 leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {current.title}
        </h3>

        {/* 內容 */}
        <div
          className="text-sm whitespace-pre-line mb-5 max-h-60 overflow-y-auto leading-relaxed pr-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {current.content}
        </div>

        {/* 翻頁按鈕 */}
        {announcements.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="cyber-btn px-3 py-1.5 text-xs flex items-center gap-1"
              style={{
                borderColor: currentIndex === 0 ? 'rgba(255,255,255,0.1)' : 'var(--cyan)',
                color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--cyan)',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} />
              {t('announcement.prev')}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === announcements.length - 1}
              className="cyber-btn px-3 py-1.5 text-xs flex items-center gap-1"
              style={{
                borderColor:
                  currentIndex === announcements.length - 1
                    ? 'rgba(255,255,255,0.1)'
                    : 'var(--cyan)',
                color:
                  currentIndex === announcements.length - 1
                    ? 'var(--text-muted)'
                    : 'var(--cyan)',
                cursor: currentIndex === announcements.length - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {t('announcement.next')}
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* 底部操作 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleMarkAll}
            className="cyber-btn flex-1 py-2 text-xs font-cyber tracking-wide"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              color: 'var(--text-secondary)',
            }}
          >
            <Check size={12} className="inline mr-1" />
            {t('announcement.markAllRead')}
          </button>
          <button
            type="button"
            onClick={handleViewAll}
            className="cyber-btn flex-1 py-2 text-xs font-cyber tracking-wide"
            style={{
              borderColor: 'var(--pink)',
              color: 'var(--pink)',
              boxShadow: '0 0 6px rgba(255, 0, 255, 0.2)',
            }}
          >
            {t('announcement.viewAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
