import { useState } from 'react';
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { useAudio } from '@client/src/hooks/useAudio';

interface VolumeControlProps {
  className?: string;
  onFirstInteract?: () => void;
}

const VolumeControl = ({ className, onFirstInteract }: VolumeControlProps) => {
  const { sfxEnabled, musicEnabled, toggleSfx, toggleMusic, init, startBGM } = useAudio();
  const [showTip, setShowTip] = useState<string | null>(null);

  const handleSfxClick = () => {
    init();
    if (musicEnabled) {
      startBGM();
    }
    onFirstInteract?.();
    toggleSfx();
  };

  const handleMusicClick = () => {
    init();
    onFirstInteract?.();
    toggleMusic();
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* 音效按钮 */}
      <div
        className="relative"
        onMouseEnter={() => setShowTip('sfx')}
        onMouseLeave={() => setShowTip(null)}
      >
        <button
          type="button"
          onClick={handleSfxClick}
          className="cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all"
          style={{
            borderColor: sfxEnabled ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
            color: sfxEnabled ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
            boxShadow: sfxEnabled ? '0 0 8px rgba(0, 255, 255, 0.3)' : 'none',
          }}
          aria-label={sfxEnabled ? '音效开' : '音效关'}
        >
          {sfxEnabled ? (
            <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
        {showTip === 'sfx' && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-cyber tracking-wider whitespace-nowrap cyber-card z-50"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-neon-cyan)',
              fontSize: '11px',
            }}
          >
            音效{sfxEnabled ? '开' : '关'}
          </div>
        )}
      </div>

      {/* 音乐按钮 */}
      <div
        className="relative"
        onMouseEnter={() => setShowTip('music')}
        onMouseLeave={() => setShowTip(null)}
      >
        <button
          type="button"
          onClick={handleMusicClick}
          className="cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all"
          style={{
            borderColor: musicEnabled ? 'var(--pink)' : 'rgba(255,255,255,0.2)',
            color: musicEnabled ? 'var(--pink)' : 'rgba(255,255,255,0.4)',
            boxShadow: musicEnabled ? '0 0 8px rgba(255, 107, 157, 0.3)' : 'none',
          }}
          aria-label={musicEnabled ? '音乐开' : '音乐关'}
        >
          {musicEnabled ? (
            <Music className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <Music2 className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
        {showTip === 'music' && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-cyber tracking-wider whitespace-nowrap cyber-card z-50"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-neon-cyan)',
              fontSize: '11px',
            }}
          >
            音乐{musicEnabled ? '开' : '关'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolumeControl;
