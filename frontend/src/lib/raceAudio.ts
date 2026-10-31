// Typro.ir - Real-Time Sound Engine for Live Race
// High-performance Web Audio API: Zero latency, zero asset downloads, zero lag.

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

// Master Mute State Persistence
export function isRaceAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('typro_race_sound_muted') === 'true';
}

export function setRaceAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('typro_race_sound_muted', muted ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('typro_race_audio_toggled', { detail: { muted } }));
}

// ============================================================================
// 1. Mechanical Keyboard Typing Click (Local to user only)
// ============================================================================
let lastKeyClickTime = 0;

export function playKeyClickSound(isSpace: boolean = false): void {
  if (isRaceAudioMuted()) return;
  const now = Date.now();
  // Prevent audio stuttering on ultra-fast double-strokes
  if (now - lastKeyClickTime < 25) return;
  lastKeyClickTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    // Micro pitch variation for realistic tactile feel (±4%)
    const pitchMod = 0.96 + Math.random() * 0.08;

    // Transient click oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Body bottom-out tone (Linear switch thump)
    const baseFreq = isSpace ? 280 : 420;
    osc.type = isSpace ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq * pitchMod, t);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchMod, t + 0.035);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    // Subtle tactile high-frequency snap
    const bufferSize = ctx.sampleRate * 0.015;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isSpace ? 2400 : 3800 * pitchMod, t);
    noiseFilter.Q.setValueAtTime(3.0, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
    whiteNoise.start(t);
  } catch {}
}

// ============================================================================
// 2. Chat Message Notification Chime (Global to all users in room)
// ============================================================================
export function playChatNotificationSound(): void {
  if (isRaceAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;

    // Dual-tone crystalline notification chime (E5 -> B5)
    const playChimeTone = (freq: number, startOffset: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + startOffset);

      gain.gain.setValueAtTime(0, t + startOffset);
      gain.gain.linearRampToValueAtTime(vol, t + startOffset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + startOffset + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + startOffset);
      osc.stop(t + startOffset + 0.36);
    };

    playChimeTone(659.25, 0, 0.15);      // E5
    playChimeTone(987.77, 0.08, 0.18);   // B5
  } catch {}
}

// ============================================================================
// 3. Precision Room 2-Error Reset Sound (ملایم، نرم و آرام‌بخش بدون صدای تیز یا گوش‌خراش)
// ============================================================================
export function playPrecisionResetSound(): void {
  if (isRaceAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const t = ctx.currentTime;
    
    // Gentle mellow notification bell (E4 to C4 descent, warm sine wave, soft gain)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, t); // E4
    osc.frequency.exponentialRampToValueAtTime(261.63, t + 0.28); // C4

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  } catch {}
}
