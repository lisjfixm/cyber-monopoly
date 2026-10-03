import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { X, LayoutGrid } from 'lucide-react';

export interface SystemMenuItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** 霓虹邊框/文字色（CSS color） */
  color: string;
  onClick: () => void;
  disabled?: boolean;
  /** 右上角小徽章（如技能點數、任務可領） */
  badge?: string | number;
}

export interface SystemMenuSection {
  key: string;
  label: string;
  items: SystemMenuItem[];
}

interface SystemMenuSheetProps {
  open: boolean;
  onClose: () => void;
  sections: SystemMenuSection[];
  title?: string;
}

/**
 * 遊戲內次級系統分組抽屜（Sheet）。
 * 把銀行/貸款/債券、股票、技能樹、任務、道具、世界觀等眾多次級系統收納進來，
 * 主畫面只保留擲骰 / 交易 / 地產管理等主流程按鈕，避免操作面雜亂。
 */
const SystemMenuSheet = ({ open, onClose, sections, title = '系統選單' }: SystemMenuSheetProps) => {
  const [activeSection, setActiveSection] = useState(0);

  // 開啟時重設到第一個分頁，並鎖定 Escape 關閉
  useEffect(() => {
    if (!open) return;
    setActiveSection(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const section = sections[activeSection] ?? sections[0];
  const visibleItems = section?.items ?? [];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(5, 8, 20, 0.78)',
          backdropFilter: 'blur(3px)',
          animation: 'fade-in 0.18s ease-out',
        }}
        onClick={onClose}
      />
      {/* 抽屜本體：手機從底部升起，桌面置中 */}
      <div
        className="relative w-full sm:max-w-lg max-h-[82vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(16,20,40,0.98) 0%, rgba(8,10,24,0.98) 100%)',
          border: '1px solid rgba(0,255,255,0.25)',
          boxShadow: '0 0 30px rgba(0,255,255,0.18), inset 0 0 24px rgba(0,255,255,0.04)',
          animation: 'float-up 0.24s ease-out',
        }}
      >
        {/* 把手（手機）+ 標題 */}
        <div className="pt-2 sm:pt-0 flex flex-shrink-0 justify-center">
          <div className="sm:hidden w-10 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div className="flex items-center justify-between px-4 pt-2 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" style={{ color: 'var(--cyan)', filter: 'drop-shadow(0 0 4px var(--cyan))' }} />
            <h2 className="font-cyber text-base tracking-widest" style={{ color: 'var(--cyan)', textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉選單"
            className="w-9 h-9 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 分類頁籤 */}
        <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {sections.map((s, idx) => {
            const isActive = idx === activeSection;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveSection(idx)}
                className="px-3 py-2 rounded-lg text-xs font-cyber tracking-wide whitespace-nowrap transition-all"
                style={{
                  minHeight: '40px',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: isActive ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                  boxShadow: isActive ? '0 0 10px rgba(0,255,255,0.3)' : 'none',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* 功能格狀區 */}
        <div className="px-4 pb-5 overflow-y-auto flex-1">
          {visibleItems.length === 0 ? (
            <div className="text-center text-sm py-10" style={{ color: 'var(--text-secondary)' }}>
              此分類暫無可用功能
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const disabled = !!item.disabled;
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      item.onClick();
                      onClose();
                    }}
                    className="relative rounded-xl flex flex-col items-center justify-center gap-1.5 py-3 transition-all"
                    style={{
                      minHeight: '64px',
                      border: `1px solid ${disabled ? 'rgba(255,255,255,0.08)' : item.color}`,
                      color: disabled ? 'rgba(160,160,180,0.5)' : item.color,
                      backgroundColor: disabled ? 'rgba(255,255,255,0.02)' : `${item.color}12`,
                      boxShadow: disabled ? 'none' : `0 0 10px ${item.color}30`,
                      opacity: disabled ? 0.5 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[11px] font-cyber tracking-wide text-center leading-tight">{item.label}</span>
                    {item.badge !== undefined && item.badge !== '' && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-cyber flex items-center justify-center"
                        style={{ backgroundColor: '#facc15', color: '#000', boxShadow: '0 0 8px #facc15' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemMenuSheet;
