import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export interface VoiceControlProps {
  currentPlayerIndex: number;
  voiceParticipants: number[];
  playerNames: string[];
  playerColors: string[];
  isMuted: boolean;
  volume: number;
  onToggleMute: (muted: boolean) => void;
  onVolumeChange: (v: number) => void;
  // 語音轉文字
  sttEnabled?: boolean;
  isListening?: boolean;
  sttSupported?: boolean;
  onToggleStt?: (enabled: boolean) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  currentPlayerIndex,
  voiceParticipants,
  playerNames,
  playerColors,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  sttEnabled = false,
  isListening = false,
  sttSupported = false,
  onToggleStt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleMute = (): void => {
    onToggleMute(!isMuted);
  };

  const handleVolumeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onVolumeChange(val);
    }
  };

  const handleToggleStt = (): void => {
    if (!sttSupported || !onToggleStt) return;
    onToggleStt(!sttEnabled);
  };

  return (
    <div className="relative">
      {/* 主按钮 + 展开触发器 */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={handleToggleMute}
          className={`cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all relative`}
          style={{
            borderColor: !isMuted ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
            color: !isMuted ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
            boxShadow: !isMuted ? '0 0 8px rgba(0, 255, 255, 0.4)' : 'none',
          }}
          aria-label={isMuted ? '開啟麥克風' : '關閉麥克風'}
          title={isMuted ? '開啟麥克風' : '關閉麥克風'}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Mic className="w-4 h-4 md:w-5 md:h-5" />
          )}
          {!isMuted && (
            <span
              className="absolute inset-0 rounded animate-ping opacity-30"
              style={{
                backgroundColor: 'var(--cyan)',
                animationDuration: '2s',
              }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="cyber-btn w-6 h-9 md:h-10 flex items-center justify-center p-0 ml-0.5"
          style={{
            borderColor: 'rgba(0, 255, 255, 0.2)',
            color: 'rgba(0, 255, 255, 0.6)',
            fontSize: '10px',
          }}
          aria-label={isExpanded ? '收起語音面板' : '展開語音面板'}
        >
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* 展开面板 */}
      {isExpanded && (
        <div
          className="absolute top-full right-0 mt-2 w-64 z-50 cyber-card border-neon-cyan p-3 space-y-3"
          style={{
            background: 'linear-gradient(180deg, hsl(240, 20%, 10%) 0%, hsl(240, 25%, 6%) 100%)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0, 255, 255, 0.2)',
          }}
        >
          {/* WebRTC 提示 */}
          <div
            className="flex items-start gap-2 text-xs p-2 rounded"
            style={{
              backgroundColor: 'rgba(255, 200, 0, 0.08)',
              border: '1px solid rgba(255, 200, 0, 0.2)',
              color: 'hsl(45, 80%, 70%)',
            }}
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>需要 WebRTC 伺服器支援才能傳輸語音</span>
          </div>

          {/* 音量控制 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--cyan)' }}>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="font-cyber tracking-wide">音量</span>
              </div>
              <span
                className="font-cyber"
                style={{ color: 'var(--text-secondary)' }}
              >
                {volume}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeInput}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--cyan) 0%, var(--cyan) ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`,
                accentColor: 'var(--cyan)',
              }}
              aria-label="語音音量"
            />
          </div>

          {/* 語音轉文字 */}
          <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'rgba(0, 255, 255, 0.15)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cyan)' }}>
                <Mic className="w-3.5 h-3.5" />
                <span className="font-cyber tracking-wide">語音轉文字</span>
              </div>
              {!sttSupported && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  瀏覽器不支援
                </span>
              )}
              {sttSupported && isListening && (
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: 'var(--red)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'hsl(0, 100%, 60%)', boxShadow: '0 0 6px hsl(0, 100%, 60%)' }}
                  />
                  正在聆聽...
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggleStt}
              disabled={!sttSupported}
              className="w-full py-1.5 text-xs font-cyber transition-all rounded"
              style={{
                border: `1px solid ${sttSupported
                  ? (sttEnabled ? 'var(--pink)' : 'rgba(255,255,255,0.15)')
                  : 'rgba(255,255,255,0.08)'}`,
                color: sttSupported
                  ? (sttEnabled ? 'var(--pink)' : 'var(--text-secondary)')
                  : 'rgba(255,255,255,0.2)',
                background: sttEnabled ? 'rgba(255, 107, 157, 0.1)' : 'transparent',
                boxShadow: sttEnabled ? '0 0 6px rgba(255, 107, 157, 0.3)' : 'none',
                cursor: sttSupported ? 'pointer' : 'not-allowed',
              }}
            >
              {sttEnabled ? '關閉語音轉文字' : '開啟語音轉文字'}
            </button>
          </div>

          {/* 語音參與者列表 */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'rgba(0, 255, 255, 0.15)' }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cyan)' }}>
              <Users className="w-3.5 h-3.5" />
              <span className="font-cyber tracking-wide">
                語音成員 ({voiceParticipants.length}/{playerNames.length})
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {playerNames.map((name: string, idx: number) => {
                const isSpeaking = voiceParticipants.includes(idx);
                const isMe = idx === currentPlayerIndex;
                const color = playerColors[idx] || 'var(--cyan)';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded"
                    style={{
                      backgroundColor: isMe ? 'rgba(0, 255, 255, 0.06)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: color,
                          boxShadow: isSpeaking ? `0 0 6px ${color}` : 'none',
                        }}
                      />
                      <span
                        className="truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {name}
                        {isMe && (
                          <span style={{ color: 'var(--text-muted)' }}>（我）</span>
                        )}
                      </span>
                    </div>
                    {isSpeaking ? (
                      <Mic
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color }}
                      />
                    ) : (
                      <MicOff
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;
