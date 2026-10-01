import { useCallback, useEffect, useRef, useState } from 'react';
import { VOICE_PACKS, type VoicePackType } from '@shared/game-config';

const SFX_KEY = 'monopoly_sfx_enabled';
const MUSIC_KEY = 'monopoly_music_enabled';
const VOICE_KEY = 'monopoly_voice_enabled';
const VOICE_PACK_KEY = 'monopoly_voice_pack';
const DEFAULT_BGM_VOLUME = 0.15;
const DEFAULT_SFX_VOLUME = 0.4;
const SPEECH_DEDUPE_MS = 1500;

// A minor progression: i - VI - III - VII (Am - F - C - G)
const BASS_PROGRESSION = [110.0, 87.31, 65.41, 98.0]; // A2, F2, C2, G2
// Arpeggio notes per chord (triad + octave)
const CHORD_ARPEGGIOS: number[][] = [
  [220.0, 261.63, 329.63, 440.0], // Am
  [174.61, 220.0, 261.63, 349.23], // F
  [130.81, 164.81, 196.0, 261.63], // C
  [98.0, 123.47, 146.83, 196.0], // G
];

const BPM = 120;
const EIGHTH_NOTE_MS = (60 / BPM) * 1000 / 2; // 250ms

export type SfxType =
  | 'dice'
  | 'buy'
  | 'pay'
  | 'fate'
  | 'detention'
  | 'release'
  | 'event'
  | 'victory'
  | 'click'
  | 'button_click'
  | 'property_buy'
  | 'jump'
  | 'thunder';

export type AmbientType = 'rain' | 'wind' | 'space' | 'none';

// ---------- Module-level singleton engine ----------

type Subscriber = () => void;

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let ambientGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let bgmTimer: ReturnType<typeof setInterval> | null = null;
let bgmStep = 0;
let bgmPlaying = false;

// 環境音狀態
let currentAmbient: AmbientType = 'none';
let ambientSource: AudioBufferSourceNode | null = null;
let ambientFilter: BiquadFilterNode | null = null;
let ambientFadeGain: GainNode | null = null;
let ambientLfo: OscillatorNode | null = null;
let ambientLfoGain: GainNode | null = null;
const DEFAULT_AMBIENT_VOLUME = 0.1;

let sfxEnabledState: boolean = loadBool(SFX_KEY, true);
let musicEnabledState: boolean = loadBool(MUSIC_KEY, true);
let voiceEnabledState: boolean = loadBool(VOICE_KEY, true);
let voicePackState: VoicePackType = loadVoicePack();
let lastSpeechText: string = '';
let lastSpeechTime: number = 0;

function loadVoicePack(): VoicePackType {
  try {
    const raw = localStorage.getItem(VOICE_PACK_KEY);
    if (raw && raw in VOICE_PACKS) return raw as VoicePackType;
  } catch {
    // ignore
  }
  return 'mature';
}

function saveVoicePack(pack: VoicePackType): void {
  try {
    localStorage.setItem(VOICE_PACK_KEY, pack);
  } catch {
    // ignore
  }
}

function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

const subscribers: Set<Subscriber> = new Set();

function loadBool(key: string, defaultValue: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === '1';
  } catch {
    return defaultValue;
  }
}

function saveBool(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // ignore
  }
}

function notifySubscribers(): void {
  subscribers.forEach((sub) => sub());
}

function subscribe(sub: Subscriber): () => void {
  subscribers.add(sub);
  return () => {
    subscribers.delete(sub);
  };
}

function initEngine(): void {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return;
  }

  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextCtor();
  audioCtx = ctx;

  masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(ctx.destination);

  bgmGain = ctx.createGain();
  bgmGain.gain.value = musicEnabledState ? DEFAULT_BGM_VOLUME : 0;
  bgmGain.connect(masterGain);

  sfxGain = ctx.createGain();
  sfxGain.gain.value = sfxEnabledState ? DEFAULT_SFX_VOLUME : 0;
  sfxGain.connect(masterGain);

  ambientGain = ctx.createGain();
  ambientGain.gain.value = musicEnabledState ? DEFAULT_AMBIENT_VOLUME : 0;
  ambientGain.connect(masterGain);

  // 1 second white noise buffer
  const bufferSize = ctx.sampleRate;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buf;
}

function applySfxGain(): void {
  if (!sfxGain || !audioCtx) return;
  const target = sfxEnabledState ? DEFAULT_SFX_VOLUME : 0;
  sfxGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.02);
}

function applyBgmGain(): void {
  if (!bgmGain || !audioCtx) return;
  const target = musicEnabledState ? DEFAULT_BGM_VOLUME : 0;
  bgmGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.05);
}

// ---------- BGM ----------

function playBassNote(freq: number, startTime: number, duration: number): void {
  if (!audioCtx || !bgmGain) return;
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 2;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(bgmGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playLeadNote(freq: number, startTime: number, duration: number): void {
  if (!audioCtx || !bgmGain) return;
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(bgmGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playKick(startTime: number): void {
  if (!audioCtx || !bgmGain) return;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, startTime);
  osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.15);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.8, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
  osc.connect(gain);
  gain.connect(bgmGain);
  osc.start(startTime);
  osc.stop(startTime + 0.25);
}

function playHihat(startTime: number): void {
  if (!audioCtx || !bgmGain || !noiseBuffer) return;
  const source = audioCtx.createBufferSource();
  source.buffer = noiseBuffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.15, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(bgmGain);
  source.start(startTime);
  source.stop(startTime + 0.06);
}

function bgmTick(): void {
  if (!audioCtx || !bgmPlaying) return;
  const now = audioCtx.currentTime + 0.05;
  const step = bgmStep;
  const chordIndex = Math.floor(step / 8) % 4;
  const stepInChord = step % 8;

  // Bass: on each beat (every 2 eighth notes)
  if (stepInChord % 2 === 0) {
    playBassNote(BASS_PROGRESSION[chordIndex], now, (EIGHTH_NOTE_MS * 1.8) / 1000);
  }
  // Lead: arpeggio on off-beats
  if (stepInChord % 2 === 1) {
    const arp = CHORD_ARPEGGIOS[chordIndex];
    const noteIdx = Math.floor(step / 2) % arp.length;
    playLeadNote(arp[noteIdx] * 2, now, (EIGHTH_NOTE_MS * 1.5) / 1000);
  }
  // Kick: on beat 1 and 3 of each bar
  if (stepInChord % 4 === 0) {
    playKick(now);
  }
  // Hi-hat: every eighth note
  playHihat(now);

  bgmStep = step + 1;
}

function startBGMEngine(): void {
  initEngine();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  if (bgmPlaying) return;
  bgmPlaying = true;
  bgmStep = 0;
  applyBgmGain();
  bgmTimer = setInterval(bgmTick, EIGHTH_NOTE_MS);
}

function stopBGMEngine(): void {
  bgmPlaying = false;
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

// ---------- SFX engine helpers ----------

function playOscTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain: number = 0.5,
  filterFreq?: number,
  filterType: BiquadFilterType = 'lowpass',
): void {
  if (!audioCtx || !sfxGain) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  if (filterFreq) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playSweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain: number = 0.5,
  filterFreq?: number,
): void {
  if (!audioCtx || !sfxGain) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  if (filterFreq) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playNoiseBurst(
  duration: number,
  peakGain: number = 0.4,
  filterType: BiquadFilterType = 'highpass',
  filterFreq: number = 2000,
): void {
  if (!audioCtx || !sfxGain || !noiseBuffer) return;
  const now = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  source.buffer = noiseBuffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  source.start(now);
  source.stop(now + duration + 0.02);
}

// ---------- SFX sounds ----------

function sfxDice(): void {
  if (!audioCtx) return;
  // 白噪声 burst + 频率下降的落定音
  playNoiseBurst(0.3, 0.25, 'bandpass', 2500);
  // 落定音：两个下降咔嗒
  setTimeout(() => playOscTone(500, 0.06, 'square', 0.25, 1500), 200);
  setTimeout(() => playOscTone(350, 0.08, 'square', 0.3, 1200), 280);
}

function sfxBuy(): void {
  // C5 → E5 → G5 上升琶音，方波+低通滤波
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    setTimeout(() => playOscTone(freq, 0.1, 'square', 0.3, 1500), i * 60);
  });
}

function sfxPay(): void {
  // G4 → E4 → C4 下降音调，三角波+低通
  const notes = [392.0, 329.63, 261.63];
  notes.forEach((freq, i) => {
    setTimeout(() => playOscTone(freq, 0.12, 'triangle', 0.35, 800), i * 90);
  });
}

function sfxFate(): void {
  // A minor 七和弦分解，正弦波+延迟感
  if (!audioCtx || !sfxGain) return;
  const notes = [220.0, 261.63, 329.63, 440.0, 523.25];
  const now = audioCtx.currentTime;
  notes.forEach((freq, i) => {
    const t = now + i * 0.1;
    const osc = audioCtx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const delay = audioCtx!.createDelay(0.3);
    delay.delayTime.value = 0.18;
    const feedback = audioCtx!.createGain();
    feedback.gain.value = 0.25;
    const gain = audioCtx!.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(sfxGain!);
    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(sfxGain!);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

function sfxDetention(): void {
  // 低频警报：两个交替低音 80Hz / 100Hz，锯齿波失真感
  for (let i = 0; i < 5; i += 1) {
    const freq = i % 2 === 0 ? 80 : 100;
    setTimeout(() => playOscTone(freq, 0.12, 'sawtooth', 0.35, 300), i * 100);
  }
}

function sfxRelease(): void {
  // 快速上升音阶：C4 → G4 → C5，方波
  const notes = [261.63, 392.0, 523.25];
  notes.forEach((freq, i) => {
    setTimeout(() => playOscTone(freq, 0.1, 'square', 0.3, 1200), i * 70);
  });
  // 尾音
  setTimeout(() => playOscTone(783.99, 0.2, 'triangle', 0.35), 220);
}

function sfxEvent(): void {
  // 警报脉冲：快速上升下降扫频，锯齿波+高通
  if (!audioCtx) return;
  playSweep(100, 800, 0.3, 'sawtooth', 0.3);
  setTimeout(() => playSweep(800, 100, 0.3, 'sawtooth', 0.3), 300);
  playNoiseBurst(0.6, 0.15, 'highpass', 1000);
}

function sfxVictory(): void {
  // C 大调胜利旋律：C5 E5 G5 C6，方波+叠加衰减
  const notes = [523.25, 659.25, 783.99, 1046.5];
  // 主旋律
  notes.forEach((freq, i) => {
    setTimeout(() => playOscTone(freq, 0.2, 'square', 0.35, 2000), i * 120);
  });
  // 第二层叠加（混响感）
  setTimeout(() => {
    notes.forEach((freq, i) => {
      setTimeout(() => playOscTone(freq * 0.5, 0.25, 'triangle', 0.15, 1500), i * 120 + 60);
    });
  }, 80);
  // 结束长音
  setTimeout(() => {
    playOscTone(1046.5, 0.4, 'square', 0.3, 2000);
    playOscTone(1318.51, 0.4, 'triangle', 0.2, 2000);
  }, notes.length * 120);
}

function sfxClick(): void {
  // 非常短的高频点击音，正弦波 1200Hz，0.05s
  playOscTone(1200, 0.04, 'sine', 0.15);
}

function sfxButtonClick(): void {
  // 更清脆的按鈕點擊：方波高頻 + 快速衰減
  playOscTone(1800, 0.03, 'square', 0.12, 3000);
  playOscTone(900, 0.02, 'sine', 0.08);
}

function sfxPropertyBuy(): void {
  // 買地成交：上升琶音 + 金幣聲（多個正弦疊加）
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => playOscTone(freq, 0.12, 'triangle', 0.3, 2000), i * 50);
  });
  // 金幣碰撞聲
  setTimeout(() => playOscTone(1567.98, 0.08, 'sine', 0.2), 100);
  setTimeout(() => playOscTone(2093, 0.06, 'sine', 0.15), 160);
}

function sfxJump(): void {
  // 棋子跳躍落地聲：頻率快速上升然後下降
  if (!audioCtx || !sfxGain) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.2);
}

function sfxThunder(): void {
  // 雷聲：低頻隆隆聲 + 高頻閃光（噪聲 + 低通 + 包絡）
  if (!audioCtx || !sfxGain || !noiseBuffer) return;
  const now = audioCtx.currentTime;
  // 低頻隆隆
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  src.start(now);
  src.stop(now + 1.3);
  // 高頻劈裂
  setTimeout(() => playNoiseBurst(0.15, 0.2, 'highpass', 3000), 0);
}

// 向后兼容的旧名称别名
const sfxDiceRoll = sfxDice;
const sfxMoveStep = (): void => {
  playOscTone(800, 0.06, 'sine', 0.2, 4000);
};
const sfxToll = sfxPay;
const sfxFateCard = sfxFate;

function sfxChanceCard(): void {
  playSweep(200, 1500, 0.15, 'square', 0.25);
  setTimeout(() => playSweep(1500, 200, 0.15, 'square', 0.2), 160);
}

function sfxBuild(): void {
  playOscTone(150, 0.08, 'square', 0.35, 800);
  playNoiseBurst(0.06, 0.2, 'lowpass', 1000);
}

function sfxMortgage(): void {
  playOscTone(880, 0.1, 'sine', 0.25);
  setTimeout(() => {
    playOscTone(660, 0.15, 'sine', 0.25);
    playOscTone(1100, 0.15, 'sine', 0.15);
  }, 80);
}

function sfxTrade(): void {
  playOscTone(660, 0.1, 'sine', 0.3);
  setTimeout(() => playOscTone(880, 0.15, 'sine', 0.3), 120);
}

function sfxAuction(): void {
  playOscTone(1200, 0.06, 'square', 0.2, 3000);
}

function sfxGlobalEvent(): void {
  sfxEvent();
}

function sfxAchievement(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, i) => {
    setTimeout(() => playOscTone(freq, 0.2, 'triangle', 0.35), i * 80);
  });
  setTimeout(() => {
    playOscTone(1046.5, 0.4, 'triangle', 0.3);
    playOscTone(1318.51, 0.4, 'triangle', 0.25);
    playOscTone(1567.98, 0.4, 'triangle', 0.2);
  }, 400);
}

function sfxBankruptcy(): void {
  playSweep(800, 80, 0.6, 'sawtooth', 0.35);
  setTimeout(() => playNoiseBurst(0.4, 0.3, 'lowpass', 500), 400);
}

// ---------- SFX dispatch by type ----------

const sfxMap: Record<SfxType, () => void> = {
  dice: sfxDice,
  buy: sfxBuy,
  pay: sfxPay,
  fate: sfxFate,
  detention: sfxDetention,
  release: sfxRelease,
  event: sfxEvent,
  victory: sfxVictory,
  click: sfxClick,
  button_click: sfxButtonClick,
  property_buy: sfxPropertyBuy,
  jump: sfxJump,
  thunder: sfxThunder,
};

// ---------- Ambient sounds ----------

function stopAmbientSound(): void {
  if (!audioCtx || !ambientGain) return;
  const now = audioCtx.currentTime;
  if (ambientFadeGain) {
    ambientFadeGain.gain.setTargetAtTime(0, now, 0.3);
  }
  const oldSource = ambientSource;
  const oldFilter = ambientFilter;
  const oldLfo = ambientLfo;
  const oldLfoGain = ambientLfoGain;
  setTimeout(() => {
    try { oldSource?.stop(); } catch { /* ignore */ }
    try { oldSource?.disconnect(); } catch { /* ignore */ }
    try { oldFilter?.disconnect(); } catch { /* ignore */ }
    try { oldLfo?.stop(); } catch { /* ignore */ }
    try { oldLfo?.disconnect(); } catch { /* ignore */ }
    try { oldLfoGain?.disconnect(); } catch { /* ignore */ }
  }, 500);
  ambientSource = null;
  ambientFilter = null;
  ambientLfo = null;
  ambientLfoGain = null;
  currentAmbient = 'none';
}

function startAmbientSound(type: AmbientType): void {
  if (!audioCtx || !ambientGain || !noiseBuffer) return;
  if (type === 'none') {
    stopAmbientSound();
    return;
  }
  if (currentAmbient === type) return;

  // 先停止舊的
  if (currentAmbient !== 'none') {
    stopAmbientSound();
  }

  const now = audioCtx.currentTime;
  const ctx = audioCtx;

  // 創建淡入增益
  const fadeGain = ctx.createGain();
  fadeGain.gain.setValueAtTime(0, now);
  fadeGain.gain.setTargetAtTime(DEFAULT_AMBIENT_VOLUME, now, 0.5);
  fadeGain.connect(ambientGain);
  ambientFadeGain = fadeGain;

  if (type === 'rain') {
    // 雨聲：白噪聲 + 低通濾波（截止頻率 1000Hz）+ 輕微調製
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;
    src.connect(filter);
    filter.connect(fadeGain);
    src.start(now);
    ambientSource = src;
    ambientFilter = filter;
  } else if (type === 'wind') {
    // 風聲：噪聲 + 帶通濾波 + LFO 調製
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 1.5;
    // LFO 調製截止頻率
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    src.connect(filter);
    filter.connect(fadeGain);
    src.start(now);
    ambientSource = src;
    ambientFilter = filter;
    ambientLfo = lfo;
    ambientLfoGain = lfoGain;
  } else if (type === 'space') {
    // 太空：緩慢的正弦波 drone + 偶爾高音粒子
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 110;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 164.81;
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(fadeGain);
    osc.start(now);
    osc2.start(now);
    // 用 buffer source 複用 ambientSource 不太合適，這裡用 osc 當標記
    ambientFilter = null;
    // 建立一個假的 source 對象用於停止管理
    const fakeSrc = ctx.createBufferSource();
    fakeSrc.buffer = noiseBuffer;
    fakeSrc.onended = () => {
      try { osc.stop(); } catch { /* ignore */ }
      try { osc2.stop(); } catch { /* ignore */ }
    };
    ambientSource = fakeSrc;
  }

  currentAmbient = type;
}

function applyAmbientGain(): void {
  if (!ambientGain || !audioCtx) return;
  const target = musicEnabledState ? DEFAULT_AMBIENT_VOLUME : 0;
  ambientGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.1);
}

function playSfxByType(type: SfxType): void {
  if (!sfxEnabledState) return;
  initEngine();
  const fn = sfxMap[type];
  if (fn) fn();
}

// ---------- Public state setters ----------

function setSfxEnabledState(enabled: boolean): void {
  sfxEnabledState = enabled;
  saveBool(SFX_KEY, enabled);
  applySfxGain();
  notifySubscribers();
}

function setMusicEnabledState(enabled: boolean): void {
  musicEnabledState = enabled;
  saveBool(MUSIC_KEY, enabled);
  applyBgmGain();
  applyAmbientGain();
  notifySubscribers();
}

// ---------- Speech synthesis (voice pack) ----------

function speakByText(text: string): void {
  if (!voiceEnabledState) return;
  if (!isSpeechSynthesisSupported()) return;

  // 去重：短时间内相同内容不重复播报
  const now = Date.now();
  if (text === lastSpeechText && now - lastSpeechTime < SPEECH_DEDUPE_MS) return;
  lastSpeechText = text;
  lastSpeechTime = now;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const pack = VOICE_PACKS[voicePackState];
    utterance.pitch = pack.pitch;
    utterance.rate = pack.rate;
    utterance.volume = pack.volume;
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  } catch {
    // 浏览器不支持或调用失败，静默降级
  }
}

function stopSpeakEngine(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

function setVoiceEnabledState(enabled: boolean): void {
  voiceEnabledState = enabled;
  saveBool(VOICE_KEY, enabled);
  if (!enabled) {
    stopSpeakEngine();
  }
  notifySubscribers();
}

function setVoicePackState(pack: VoicePackType): void {
  voicePackState = pack;
  saveVoicePack(pack);
  notifySubscribers();
}

// ---------- Hook ----------

export interface UseAudioReturn {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  voicePack: VoicePackType;
  toggleSfx: () => void;
  toggleMusic: () => void;
  toggleVoice: () => void;
  setVoicePack: (pack: VoicePackType) => void;
  playSfx: (type: SfxType) => void;
  speak: (text: string) => void;
  stopSpeak: () => void;
  init: () => void;
  startBGM: () => void;
  stopBGM: () => void;
  startAmbient: (type: AmbientType) => void;
  stopAmbient: () => void;
  // 向后兼容
  isMuted: boolean;
  toggleMute: () => void;
  playDiceRoll: () => void;
  playMoveStep: () => void;
  playBuy: () => void;
  playToll: () => void;
  playFateCard: () => void;
  playChanceCard: () => void;
  playDetention: () => void;
  playRelease: () => void;
  playBuild: () => void;
  playMortgage: () => void;
  playTrade: () => void;
  playAuction: () => void;
  playGlobalEvent: () => void;
  playAchievement: () => void;
  playBankruptcy: () => void;
}

export function useAudio(): UseAudioReturn {
  const [sfxEnabled, setSfxEnabledReact] = useState<boolean>(sfxEnabledState);
  const [musicEnabled, setMusicEnabledReact] = useState<boolean>(musicEnabledState);
  const [voiceEnabled, setVoiceEnabledReact] = useState<boolean>(voiceEnabledState);
  const [voicePack, setVoicePackReact] = useState<VoicePackType>(voicePackState);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = subscribe(() => {
      if (!mountedRef.current) return;
      setSfxEnabledReact(sfxEnabledState);
      setMusicEnabledReact(musicEnabledState);
      setVoiceEnabledReact(voiceEnabledState);
      setVoicePackReact(voicePackState);
    });
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const init = useCallback(() => {
    initEngine();
  }, []);

  const startBGM = useCallback(() => {
    startBGMEngine();
  }, []);

  const stopBGM = useCallback(() => {
    stopBGMEngine();
  }, []);

  const startAmbient = useCallback((type: AmbientType) => {
    startAmbientSound(type);
  }, []);

  const stopAmbient = useCallback(() => {
    stopAmbientSound();
  }, []);

  const toggleSfx = useCallback(() => {
    setSfxEnabledState(!sfxEnabledState);
  }, []);

  const toggleMusic = useCallback(() => {
    if (!musicEnabledState) {
      // 打开音乐：需要先 init 再启动
      startBGMEngine();
    } else {
      setMusicEnabledState(false);
    }
    // startBGMEngine 内部会 applyBgmGain（基于 musicEnabledState）
    // 所以打开时我们再设一次 true 以触发 gain
    if (!musicEnabledState) {
      setMusicEnabledState(true);
    }
  }, []);

  const playSfx = useCallback((type: SfxType) => {
    playSfxByType(type);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabledState(!voiceEnabledState);
  }, []);

  const setVoicePack = useCallback((pack: VoicePackType) => {
    setVoicePackState(pack);
  }, []);

  const speak = useCallback((text: string) => {
    speakByText(text);
  }, []);

  const stopSpeak = useCallback(() => {
    stopSpeakEngine();
  }, []);

  // 向后兼容：isMuted = 两者都关
  const isMuted = !sfxEnabled && !musicEnabled;
  const toggleMute = useCallback(() => {
    const newVal = !isMuted;
    // toggleMute 同时切换两者（保持原 VolumeControl 行为）
    setSfxEnabledState(newVal);
    setMusicEnabledState(newVal);
    if (newVal) {
      startBGMEngine();
    }
  }, [isMuted]);

  return {
    sfxEnabled,
    musicEnabled,
    voiceEnabled,
    voicePack,
    toggleSfx,
    toggleMusic,
    toggleVoice,
    setVoicePack,
    playSfx,
    speak,
    stopSpeak,
    init,
    startBGM,
    stopBGM,
    startAmbient,
    stopAmbient,
    // 向后兼容
    isMuted,
    toggleMute,
    playDiceRoll: sfxDiceRoll,
    playMoveStep: sfxMoveStep,
    playBuy: sfxBuy,
    playToll: sfxToll,
    playFateCard: sfxFateCard,
    playChanceCard: sfxChanceCard,
    playDetention: sfxDetention,
    playRelease: sfxRelease,
    playBuild: sfxBuild,
    playMortgage: sfxMortgage,
    playTrade: sfxTrade,
    playAuction: sfxAuction,
    playGlobalEvent: sfxGlobalEvent,
    playAchievement: sfxAchievement,
    playBankruptcy: sfxBankruptcy,
  };
}
