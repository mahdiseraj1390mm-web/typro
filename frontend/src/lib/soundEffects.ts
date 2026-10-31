// Typro.ir - High-performance Web Audio Synthesizer for Mechanical Keyboard Sound effects
// Supports 5 Switch Sound Profiles: Blue, Brown, Red, Thocky Panda, and Vintage Typewriter

export type SwitchType = 'blue' | 'brown' | 'red' | 'thocky' | 'typewriter';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public currentSwitch: SwitchType = 'thocky';
  public volume: number = 0.6;

  public initFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('typro_switch_sound');
        if (saved && ['blue', 'brown', 'red', 'thocky', 'typewriter'].includes(saved)) {
          this.currentSwitch = saved as SwitchType;
        }
      } catch {
        // Ignore storage read errors
      }
    }
  }

  public setSwitch(type: SwitchType) {
    this.currentSwitch = type;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('typro_switch_sound', type);
      } catch {
        // Ignore storage write errors
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /** Pre-warm audio context so the first keystroke has 0ms sound driver latency */
  public initAudio() {
    if (typeof window === 'undefined') return;
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Plays switch click based on active profile
  playKeyClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (this.currentSwitch) {
        case 'blue': {
          // Sharp clicky high-pitch snap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);
          gain.gain.setValueAtTime(0.2 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'brown': {
          // Tactile bump with medium resonance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
          gain.gain.setValueAtTime(0.25 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'red': {
          // Soft linear muffled thud
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.035);
          gain.gain.setValueAtTime(0.18 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }

        case 'thocky': {
          // Deep satisfying hollow bottom-out "thock"
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(75, now + 0.05);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);

          gain.gain.setValueAtTime(0.3 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'typewriter': {
          // Vintage heavy mechanical typewriter strike
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(950, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);
          gain.gain.setValueAtTime(0.22 * this.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }
      }
    } catch {
      // Audio fallback
    }
  }

  // Soft buzzer on typing error
  playErrorBuzzer() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  }

  // Level up / victory fanfare
  playVictory() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2 * this.volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {
      // Audio fallback
    }
  }
}

export const soundEffects = new SoundSynthesizer();
