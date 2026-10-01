import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { useTranslation } from '@client/src/i18n';
import { getUnreadAnnouncements, getAnnouncements } from '@client/src/utils/announcements';
import GameAnnouncementModal from './GameAnnouncementModal';

interface AnnouncementButtonProps {
  className?: string;
}

const AnnouncementButton = ({ className }: AnnouncementButtonProps) => {
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const unreadCount = getUnreadAnnouncements().length;
  const totalCount = getAnnouncements().length;

  const handleClick = () => {
    if (totalCount > 0) {
      setOpen(true);
    } else {
      navigate('/announcements');
    }
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
          className="cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all relative"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
            boxShadow: '0 0 8px rgba(0, 255, 255, 0.25)',
            background: 'rgba(0, 255, 255, 0.08)',
          }}
          aria-label={t('common.announcement')}
        >
          <Megaphone className="w-4 h-4 md:w-5 md:h-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full"
              style={{
                background: 'var(--red)',
                color: '#fff',
                boxShadow: '0 0 6px rgba(255, 0, 0, 0.6)',
                animation: 'pulse-red 2s ease-in-out infinite',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
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
            {t('common.announcement')}
          </div>
        )}
      </div>
      <GameAnnouncementModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default AnnouncementButton;
