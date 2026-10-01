import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Megaphone,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Gift,
  Clock,
  Tag,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  getAnnouncements,
  isAnnouncementRead,
  markAsRead,
  markAllAsRead,
  isCompensationClaimed,
  markCompensationClaimed,
  type Announcement,
  type AnnouncementType,
} from '@client/src/utils/announcements';

const TYPE_STYLES: Record<AnnouncementType, { color: string; label: string; icon: string }> = {
  maintenance: { color: 'var(--blue)', label: '維護', icon: 'maintenance' },
  event: { color: 'var(--pink)', label: '活動', icon: 'event' },
  update: { color: 'var(--green)', label: '更新', icon: 'update' },
  compensation: { color: '#facc15', label: '補償', icon: 'compensation' },
};

const CAROUSEL_INTERVAL = 4000;

const AnnouncementCenterPage = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const carouselRef = useRef<number | null>(null);

  const announcements: Announcement[] = getAnnouncements();
  const topAnnouncements: Announcement[] = announcements.slice(0, 3);

  const tickCarousel = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % topAnnouncements.length);
  }, [topAnnouncements.length]);

  useEffect(() => {
    if (isPaused || topAnnouncements.length <= 1) return;
    carouselRef.current = window.setInterval(tickCarousel, CAROUSEL_INTERVAL);
    return () => {
      if (carouselRef.current !== null) {
        clearInterval(carouselRef.current);
      }
    };
  }, [tickCarousel, isPaused, topAnnouncements.length]);

  const handleToggle = (id: string): void => {
    const isExpanded = expandedId === id;
    if (!isExpanded && !isAnnouncementRead(id)) {
      markAsRead(id);
      setRefreshKey((prev) => prev + 1);
    }
    setExpandedId(isExpanded ? null : id);
  };

  const handleMarkAll = (): void => {
    markAllAsRead();
    setRefreshKey((prev) => prev + 1);
  };

  const handleCarouselClick = (id: string): void => {
    if (!isAnnouncementRead(id)) {
      markAsRead(id);
      setRefreshKey((prev) => prev + 1);
    }
    setExpandedId(id);
    const element = document.getElementById(`announcement-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevSlide = (): void => {
    setCarouselIndex(
      (prev) => (prev - 1 + topAnnouncements.length) % topAnnouncements.length,
    );
  };

  const handleNextSlide = (): void => {
    setCarouselIndex((prev) => (prev + 1) % topAnnouncements.length);
  };

  const handleClaim = (a: Announcement, e: React.MouseEvent): void => {
    e.stopPropagation();
    if (isCompensationClaimed(a.id)) return;
    markCompensationClaimed(a.id);
    setRefreshKey((prev) => prev + 1);
    const reward = a.compensationReward;
    if (reward) {
      toast.success(`已領取！獲得 ${reward.name} × ${reward.amount}`);
    } else {
      toast.success('已領取補償');
    }
  };

  const unreadCount = announcements.filter((a) => !isAnnouncementRead(a.id)).length;

  const getSummary = (a: Announcement): string => {
    if (a.summary) return a.summary;
    const firstLine = a.content.split('\n')[0];
    return firstLine.length > 50 ? firstLine.slice(0, 50) + '…' : firstLine;
  };

  const getPreviewLines = (content: string, lines: number = 2): string => {
    const allLines = content.split('\n').filter((line) => line.trim().length > 0);
    const selected = allLines.slice(0, lines).join(' ');
    return selected.length > 80 ? selected.slice(0, 80) + '…' : selected;
  };

  return (
    <div className="min-h-screen w-full flex flex-col scanlines bg-[var(--bg-deep)] relative">
      {/* 背景裝飾 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(0, 255, 255, 0.08), transparent 60%), radial-gradient(ellipse at bottom right, rgba(255, 0, 150, 0.06), transparent 50%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b relative z-10"
        style={{
          borderColor: 'var(--border-neon)',
          background: 'rgba(10, 10, 20, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ChevronLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <div className="flex-1">
          <h1
            className="font-cyber text-2xl md:text-3xl tracking-wider"
            style={{
              color: 'var(--cyan)',
              textShadow: '0 0 8px var(--cyan), 0 0 20px rgba(0, 255, 255, 0.3)',
            }}
          >
            <Megaphone size={22} className="inline mr-2" />
            公告中心
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="cyber-btn px-3 py-2 text-xs font-cyber tracking-wide flex items-center gap-1"
            style={{
              borderColor: 'var(--pink)',
              color: 'var(--pink)',
              boxShadow: '0 0 6px rgba(255, 0, 255, 0.2)',
            }}
          >
            <Check size={12} />
            全部已讀
          </button>
        )}
      </div>

      {/* Carousel - 重要公告輪播 */}
      {topAnnouncements.length > 0 && (
        <div
          className="relative z-10 px-4 pt-4 max-w-3xl w-full mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} style={{ color: 'var(--pink)' }} />
            <span
              className="text-xs font-cyber tracking-wider"
              style={{ color: 'var(--pink)', textShadow: '0 0 6px var(--pink-glow)' }}
            >
              最新公告
            </span>
          </div>
          <div
            className="relative overflow-hidden cyber-card"
            style={{
              borderColor: 'var(--pink)',
              boxShadow: '0 0 20px rgba(255, 0, 150, 0.15), inset 0 0 20px rgba(255, 0, 150, 0.03)',
              background: 'linear-gradient(135deg, rgba(20, 10, 30, 0.9), rgba(10, 10, 25, 0.95))',
            }}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {topAnnouncements.map((a) => {
                const style = TYPE_STYLES[a.type];
                return (
                  <div
                    key={a.id}
                    className="w-full flex-shrink-0 p-4 cursor-pointer"
                    onClick={() => handleCarouselClick(a.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                        style={{
                          border: `1px solid ${style.color}`,
                          color: style.color,
                          boxShadow: `0 0 10px ${style.color}40`,
                        }}
                      >
                        {a.type === 'compensation' ? (
                          <Gift size={18} />
                        ) : a.type === 'maintenance' ? (
                          <RefreshCw size={18} />
                        ) : a.type === 'event' ? (
                          <Megaphone size={18} />
                        ) : (
                          <Tag size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="inline-block px-2 py-0.5 text-[10px] font-cyber tracking-wider"
                            style={{
                              backgroundColor: `${style.color}20`,
                              color: style.color,
                              border: `1px solid ${style.color}50`,
                              textShadow: `0 0 4px ${style.color}`,
                            }}
                          >
                            {style.label}
                          </span>
                          {!isAnnouncementRead(a.id) && (
                            <span
                              className="inline-block w-2 h-2 rounded-full animate-pulse"
                              style={{
                                background: 'var(--red)',
                                boxShadow: '0 0 6px var(--red)',
                              }}
                            />
                          )}
                        </div>
                        <h3
                          className="font-cyber text-base md:text-lg tracking-wide mb-1"
                          style={{
                            color: 'var(--text-primary)',
                            textShadow: '0 0 1px rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          {a.title}
                        </h3>
                        <p
                          className="text-xs md:text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {getSummary(a)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 左右箭頭 */}
            <button
              type="button"
              onClick={handlePrevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--cyan)',
                color: 'var(--cyan)',
                boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
              }}
              aria-label="上一則"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--cyan)',
                color: 'var(--cyan)',
                boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
              }}
              aria-label="下一則"
            >
              <ChevronRight size={16} />
            </button>

            {/* 指示點 */}
            <div className="flex justify-center gap-2 pb-3">
              {topAnnouncements.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCarouselIndex(index)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: index === carouselIndex ? 'var(--cyan)' : 'var(--text-muted)',
                    boxShadow:
                      index === carouselIndex ? '0 0 6px var(--cyan-glow)' : 'none',
                    transform: index === carouselIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={`第 ${index + 1} 則`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 p-4 md:p-6 max-w-3xl w-full mx-auto relative z-10">
        {/* 列表標題 */}
        <div className="flex items-center gap-2 mb-3 mt-2">
          <Tag size={14} style={{ color: 'var(--cyan)' }} />
          <span
            className="text-xs font-cyber tracking-wider"
            style={{ color: 'var(--cyan)', textShadow: '0 0 4px var(--cyan-glow)' }}
          >
            全部公告
          </span>
          <span
            className="text-xs ml-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            共 {announcements.length} 則
          </span>
        </div>

        {announcements.length === 0 ? (
          <div
            className="cyber-card p-12 text-center"
            style={{ borderColor: 'var(--border-neon)' }}
          >
            <div className="text-xl font-cyber mb-4 tracking-wider" style={{ color: 'var(--text-secondary)' }}>無訊息</div>
            <div
              className="font-cyber text-lg tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              暫無公告
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => {
              const style = TYPE_STYLES[a.type];
              const read = isAnnouncementRead(a.id);
              const expanded = expandedId === a.id;
              const claimed = a.compensationReward
                ? isCompensationClaimed(a.id)
                : false;

              return (
                <div
                  id={`announcement-${a.id}`}
                  key={a.id}
                  className="cyber-card p-4 cursor-pointer transition-all duration-300"
                  style={{
                    borderColor: read ? 'var(--border-neon)' : style.color,
                    boxShadow: read ? 'none' : `0 0 12px ${style.color}30`,
                    opacity: read ? 0.7 : 1,
                  }}
                  onClick={() => handleToggle(a.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center mt-0.5"
                      style={{
                        border: `1px solid ${read ? 'var(--text-muted)' : style.color}`,
                        color: read ? 'var(--text-muted)' : style.color,
                        boxShadow: read ? 'none' : `0 0 8px ${style.color}30`,
                        opacity: read ? 0.5 : 1,
                      }}
                    >
                      {a.type === 'compensation' ? (
                        <Gift size={16} />
                      ) : a.type === 'maintenance' ? (
                        <RefreshCw size={16} />
                      ) : a.type === 'event' ? (
                        <Megaphone size={16} />
                      ) : (
                        <Tag size={16} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="inline-block px-2 py-0.5 text-[10px] font-cyber tracking-wider"
                          style={{
                            backgroundColor: `${style.color}20`,
                            color: style.color,
                            border: `1px solid ${style.color}40`,
                            textShadow: read ? 'none' : `0 0 4px ${style.color}`,
                          }}
                        >
                          {style.label}
                        </span>
                        {!read && (
                          <span
                            className="inline-block w-2 h-2 rounded-full animate-pulse"
                            style={{
                              background: 'var(--red)',
                              boxShadow: '0 0 6px var(--red)',
                            }}
                          />
                        )}
                        {a.compensationReward && (
                          <span
                            className="inline-block px-2 py-0.5 text-[10px] font-cyber tracking-wider flex items-center gap-1"
                            style={{
                              backgroundColor: 'rgba(250, 204, 21, 0.15)',
                              color: '#facc15',
                              border: '1px solid rgba(250, 204, 21, 0.4)',
                              textShadow: '0 0 4px rgba(250, 204, 21, 0.5)',
                            }}
                          >
                            <Gift size={10} />
                            有獎勵
                          </span>
                        )}
                      </div>
                      <h3
                        className="font-cyber text-base tracking-wide mb-1"
                        style={{
                          color: 'var(--text-primary)',
                          textShadow: read ? 'none' : '0 0 1px rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {a.title}
                      </h3>
                      <div
                        className="text-xs flex items-center gap-1 mb-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Clock size={11} />
                        {new Date(a.createdAt).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>

                      {/* 摘要（未展開時顯示前2行） */}
                      {!expanded && (
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {getPreviewLines(a.content)}
                        </p>
                      )}

                      {/* 展開全文 */}
                      <div
                        className="overflow-hidden transition-all duration-300"
                        style={{
                          maxHeight: expanded ? '1000px' : '0',
                          opacity: expanded ? 1 : 0,
                        }}
                      >
                        <div
                          className="pt-3 mt-2 text-sm whitespace-pre-line leading-relaxed border-t"
                          style={{
                            color: 'var(--text-secondary)',
                            borderColor: 'rgba(255,255,255,0.08)',
                          }}
                        >
                          {a.content}
                        </div>

                        {/* 補償領取按鈕 */}
                        {a.compensationReward && (
                          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(250, 204, 21, 0.2)' }}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Gift size={16} style={{ color: '#facc15' }} />
                                <span className="text-sm" style={{ color: '#facc15' }}>
                                  補償：{a.compensationReward.name} × {a.compensationReward.amount}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleClaim(a, e)}
                                disabled={claimed}
                                className="px-4 py-1.5 text-xs font-cyber tracking-wider transition-all flex items-center gap-1"
                                style={{
                                  border: `1px solid ${claimed ? 'var(--text-muted)' : '#facc15'}`,
                                  color: claimed ? 'var(--text-muted)' : '#facc15',
                                  background: claimed
                                    ? 'rgba(100, 100, 100, 0.1)'
                                    : 'rgba(250, 204, 21, 0.1)',
                                  boxShadow: claimed
                                    ? 'none'
                                    : '0 0 10px rgba(250, 204, 21, 0.3), inset 0 0 8px rgba(250, 204, 21, 0.1)',
                                  textShadow: claimed
                                    ? 'none'
                                    : '0 0 4px rgba(250, 204, 21, 0.5)',
                                  cursor: claimed ? 'default' : 'pointer',
                                }}
                              >
                                {claimed ? (
                                  <>
                                    <Check size={12} />
                                    已領取
                                  </>
                                ) : (
                                  <>
                                    <Gift size={12} />
                                    領取補償
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 flex-shrink-0 transition-transform duration-300"
                      style={{
                        color: 'var(--text-secondary)',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCenterPage;
