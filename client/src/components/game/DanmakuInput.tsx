import React, { useRef, useState } from 'react';
import { Send, Zap, Palette } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { DANMAKU_MAX_LENGTH } from '@shared/game-config';

export interface DanmakuInputProps {
  onSend: (content: string, color?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedColor?: string;
  onColorChange?: (c: string) => void;
}

const NEON_COLORS: string[] = [
  '#ff4d6d', // 紅
  '#ff9500', // 橙
  '#ffd60a', // 黃
  '#06ffa5', // 綠
  '#00f5ff', // 青
  '#4dabf7', // 藍
  '#b197fc', // 紫
  '#ff6b9d', // 粉
];

const DanmakuInput: React.FC<DanmakuInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '發送彈幕...',
  selectedColor,
  onColorChange,
}) => {
  const [value, setValue] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const internalColor = selectedColor ?? NEON_COLORS[4];

  const handleSend = (): void => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.length > DANMAKU_MAX_LENGTH) return;
    try {
      onSend(trimmed, selectedColor);
      setValue('');
      setShowColorPicker(false);
    } catch (err) {
      logger.error('發送彈幕失敗', { error: String(err) });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleColorClick = (color: string): void => {
    onColorChange?.(color);
    setShowColorPicker(false);
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 cyber-card border-neon-cyan"
      style={{
        background: 'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
      }}
    >
      <div className="flex items-center gap-1" style={{ color: 'var(--pink)' }}>
        <Zap className="w-4 h-4" fill="currentColor" />
        <span className="text-xs font-cyber tracking-wide hidden sm:inline">彈幕</span>
      </div>

      {/* 顏色選擇按鈕 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowColorPicker((v) => !v)}
          disabled={disabled}
          className="cyber-btn w-8 h-8 flex items-center justify-center p-0 flex-shrink-0 transition-all"
          style={{
            borderColor: disabled ? 'rgba(255,255,255,0.1)' : internalColor,
            color: disabled ? 'rgba(255,255,255,0.3)' : internalColor,
            boxShadow: disabled ? 'none' : `0 0 6px ${internalColor}60`,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          aria-label="選擇彈幕顏色"
          title="選擇彈幕顏色"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {/* 顏色選擇器 */}
        {showColorPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 cyber-card border-neon-pink p-2"
            style={{
              background: 'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 -2px 12px rgba(255, 107, 157, 0.2)',
            }}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {NEON_COLORS.map((color: string) => {
                const isSelected = color === internalColor;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorClick(color)}
                    className="w-6 h-6 rounded-full transition-all flex items-center justify-center"
                    style={{
                      backgroundColor: color,
                      boxShadow: isSelected
                        ? `0 0 8px ${color}, 0 0 16px ${color}80`
                        : `0 0 4px ${color}40`,
                      border: isSelected ? '2px solid #fff' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                    aria-label={`顏色 ${color}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        onKeyDown={handleKeyDown}
        maxLength={DANMAKU_MAX_LENGTH}
        placeholder={disabled ? '無法發送彈幕' : placeholder}
        disabled={disabled}
        className="cyber-input flex-1 text-sm"
        style={{ height: '32px' }}
      />
      <span
        className="text-xs font-cyber hidden md:inline"
        style={{ color: 'var(--text-muted)' }}
      >
        {value.length}/{DANMAKU_MAX_LENGTH}
      </span>
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="cyber-btn w-8 h-8 flex items-center justify-center p-0 flex-shrink-0 transition-all"
        style={{
          borderColor: !disabled && value.trim()
            ? 'var(--pink)'
            : 'rgba(255,255,255,0.1)',
          color: !disabled && value.trim()
            ? 'var(--pink)'
            : 'rgba(255,255,255,0.3)',
          boxShadow: !disabled && value.trim()
            ? '0 0 8px rgba(255, 107, 157, 0.3)'
            : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        aria-label="發送彈幕"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default DanmakuInput;
