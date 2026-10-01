import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

export interface UseVoiceOptions {
  roomCode?: string;
  playerIndex?: number;
  /** 由 roomState 同步的开麦玩家索引列表 */
  serverVoiceParticipants?: number[];
  /** 切换静音的 API 调用（可选，没有时仅本地状态） */
  toggleApi?: (muted: boolean) => Promise<unknown>;
  /** 語音轉文字識別完成後發送消息的回調 */
  onSendMessage?: (text: string) => void;
}

export interface UseVoiceReturn {
  muted: boolean;
  volume: number;
  voiceParticipants: number[];
  toggleMute: () => void;
  setVolume: (v: number) => void;
  // 語音轉文字
  sttEnabled: boolean;
  isListening: boolean;
  transcript: string;
  sttSupported: boolean;
  toggleStt: (enabled: boolean) => void;
}

const DEFAULT_VOLUME = 70;

// SpeechRecognition 類型聲明
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

function checkSttSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function createRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { serverVoiceParticipants = [], toggleApi, onSendMessage } = options;

  const [muted, setMuted] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(DEFAULT_VOLUME);

  // 語音轉文字狀態
  const [sttEnabled, setSttEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [sttSupported] = useState<boolean>(() => checkSttSupported());

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldRestartRef = useRef<boolean>(false);

  const toggleMute = useCallback((): void => {
    const nextMuted = !muted;
    setMuted(nextMuted);

    if (toggleApi) {
      toggleApi(nextMuted).catch((err: unknown) => {
        logger.error('語音切換失敗', { error: String(err) });
        // 回滾狀態
        setMuted(muted);
      });
    }
  }, [muted, toggleApi]);

  const setVolume = useCallback((v: number): void => {
    const clamped = Math.max(0, Math.min(100, v));
    setVolumeState(clamped);
  }, []);

  // 語音轉文字開關
  const toggleStt = useCallback((enabled: boolean): void => {
    if (!sttSupported && enabled) {
      logger.warn({ message: '瀏覽器不支援語音識別' });
      return;
    }
    setSttEnabled(enabled);
    if (!enabled) {
      shouldRestartRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    }
  }, [sttSupported]);

  // 初始化與清理語音識別
  useEffect(() => {
    if (!sttSupported) return;
    if (!sttEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-HK';

    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcriptText = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalText += transcriptText;
        } else {
          interimText += transcriptText;
        }
      }

      setTranscript(interimText || finalText);

      if (finalText.trim()) {
        const trimmed = finalText.trim();
        logger.info({ message: `語音識別完成: ${trimmed}` });
        if (onSendMessage) {
          try {
            onSendMessage(trimmed);
          } catch (err) {
            logger.error('語音消息發送失敗', { error: String(err) });
          }
        }
        setTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent): void => {
      logger.error('語音識別錯誤', { error: event.error, message: event.message });
      // not-allowed / service-not-allowed 是權限問題，不再重啟
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldRestartRef.current = false;
        setSttEnabled(false);
        setIsListening(false);
      }
    };

    recognition.onend = (): void => {
      setIsListening(false);
      // 連續模式下，瀏覽器可能自動停止，需要重啟
      if (shouldRestartRef.current && sttEnabled) {
        try {
          setTimeout(() => {
            if (shouldRestartRef.current) {
              try {
                recognitionRef.current?.start();
              } catch {
                // ignore
              }
            }
          }, 100);
        } catch {
          // ignore
        }
      }
    };

    recognition.onstart = (): void => {
      setIsListening(true);
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    try {
      recognition.start();
    } catch (err) {
      logger.error('語音識別啟動失敗', { error: String(err) });
      setSttEnabled(false);
    }

    return () => {
      shouldRestartRef.current = false;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
      setIsListening(false);
    };
  }, [sttEnabled, sttSupported, onSendMessage]);

  return {
    muted,
    volume,
    voiceParticipants: serverVoiceParticipants,
    toggleMute,
    setVolume,
    sttEnabled,
    isListening,
    transcript,
    sttSupported,
    toggleStt,
  };
}

export default useVoice;
