// Typro.ir - High-Fidelity Procedural Vehicle Sound Engine
// Real-time Web Audio API Engine: Zero external asset downloads, zero latency, zero lag.
// Distinct acoustic physics for Supercars, Sportbikes, Muscle V8, Kawasaki H2, Ducati, & Classics.
// Features: Model-Specific Starters, Dynamic RPM, Rev Limiter (کاتاف), & Deceleration Backfires (بک‌فایر و تقه).

import { isRaceAudioMuted } from './raceAudio';

export type VehicleAcousticFamily =
  | 'v8_muscle'         // BMW M6, BMW X6 (Twin-Turbo V8, deep guttural roar)
  | 'porsche_flat6'     // Porsche 911 Turbo (Flat-6 boxer, metallic rasp, turbo spool)
  | 'supercharged_h2'   // Kawasaki Ninja H2 (Supercharged I4, screaming revs + supercharger flutter)
  | 'ducati_v4'         // Ducati Panigale Pramac (Desmosedici V4, dry clutch, aggressive bark)
  | 'superbike_inline4' // Suzuki GSX-R, Suzuki B-King, Kawasaki Z1000, GSX-S (Inline-4 14,000 RPM screamer)
  | 'sportbike_twin'    // Honda CBR300R, CB300, CB1300 (Punchy, mechanical street racer)
  | 'beetle_classic'    // Volkswagen Beetle (Air-cooled boxer-4, classic chugging putt-putt)
  | 'modern_suv_i4';    // Mitsubishi ASX, Kia Sportage (Modern smooth turbo I4)

export interface VehicleAcousticProfile {
  id: VehicleAcousticFamily;
  nameFa: string;
  idleFreq: number;          // Base combustion pulse frequency at idle (Hz)
  redlineFreq: number;       // Base combustion pulse frequency at redline (Hz)
  primaryWave: OscillatorType;
  secondaryWave: OscillatorType;
  secondaryDetune: number;   // Cents detune for chorus/richness
  hasSubBass: boolean;       // Extra sub-bass body (for V8 and muscle)
  filterIdle: number;        // Exhaust lowpass cutoff at idle (Hz)
  filterRedline: number;     // Exhaust lowpass cutoff at redline (Hz)
  filterQ: number;           // Resonance peak
  driveGain: number;         // Overdrive saturation
  limiterCycleMs: number;    // Cycle time between cuts in ms (e.g. 68ms = 14.7 cuts/sec)
  limiterCutMs: number;      // Duration of silent spark cut (ms)
  limiterFreqBoost: number;  // Micro pitch shift during cut-off
  backfirePopCount: [number, number]; // [min, max] pops on decel
  backfireBassTone: number;  // Freq of pop concussion thump (Hz)
  backfireBrightness: number;// Filter freq of pop crackle (Hz)
  hasSuperchargerWhine?: boolean;
  hasDryClutchChatter?: boolean;
  starterCrankMs: number;    // Cranking pulse duration
  starterCrankCount: number; // Number of crank struggles before catch
  starterCatchPitch: number; // Flare pitch multiplier on engine start catch
}

export const ACOUSTIC_PROFILES: Record<VehicleAcousticFamily, VehicleAcousticProfile> = {
  v8_muscle: {
    id: 'v8_muscle',
    nameFa: '۸ سیلندر توئین توربو V8 ام‌پاور (ب‌ام‌و)',
    idleFreq: 34,
    redlineFreq: 260,
    primaryWave: 'sawtooth',
    secondaryWave: 'triangle',
    secondaryDetune: 8,
    hasSubBass: true,
    filterIdle: 280,
    filterRedline: 2200,
    filterQ: 2.2,
    driveGain: 1.4,
    limiterCycleMs: 82,
    limiterCutMs: 38,
    limiterFreqBoost: 1.05,
    backfirePopCount: [3, 6],
    backfireBassTone: 65,
    backfireBrightness: 1800,
    starterCrankMs: 140,
    starterCrankCount: 3,
    starterCatchPitch: 2.2,
  },
  porsche_flat6: {
    id: 'porsche_flat6',
    nameFa: '۶ سیلندر تخت باکسر توئین‌توربو (پورشه ۹۱۱)',
    idleFreq: 42,
    redlineFreq: 370,
    primaryWave: 'sawtooth',
    secondaryWave: 'sawtooth',
    secondaryDetune: 12,
    hasSubBass: false,
    filterIdle: 380,
    filterRedline: 3200,
    filterQ: 3.5,
    driveGain: 1.6,
    limiterCycleMs: 72,
    limiterCutMs: 32,
    limiterFreqBoost: 1.08,
    backfirePopCount: [3, 7],
    backfireBassTone: 85,
    backfireBrightness: 2800,
    starterCrankMs: 110,
    starterCrankCount: 2,
    starterCatchPitch: 2.5,
  },
  supercharged_h2: {
    id: 'supercharged_h2',
    nameFa: '۴ سیلندر سوپرشارژر مافوق‌صوت (کاوازاکی نینجا H2)',
    idleFreq: 48,
    redlineFreq: 520,
    primaryWave: 'sawtooth',
    secondaryWave: 'triangle',
    secondaryDetune: 15,
    hasSubBass: false,
    filterIdle: 450,
    filterRedline: 4800,
    filterQ: 4.0,
    driveGain: 1.8,
    limiterCycleMs: 58,
    limiterCutMs: 26,
    limiterFreqBoost: 1.12,
    backfirePopCount: [4, 8],
    backfireBassTone: 95,
    backfireBrightness: 3600,
    hasSuperchargerWhine: true,
    starterCrankMs: 90,
    starterCrankCount: 2,
    starterCatchPitch: 2.8,
  },
  ducati_v4: {
    id: 'ducati_v4',
    nameFa: 'دزموسدیچی V4 موتو‌جی‌پی (دوکاتی پراماک)',
    idleFreq: 40,
    redlineFreq: 470,
    primaryWave: 'sawtooth',
    secondaryWave: 'sawtooth',
    secondaryDetune: 18,
    hasSubBass: true,
    filterIdle: 400,
    filterRedline: 4200,
    filterQ: 3.8,
    driveGain: 1.7,
    limiterCycleMs: 65,
    limiterCutMs: 28,
    limiterFreqBoost: 1.10,
    backfirePopCount: [3, 6],
    backfireBassTone: 90,
    backfireBrightness: 3200,
    hasDryClutchChatter: true,
    starterCrankMs: 100,
    starterCrankCount: 3,
    starterCatchPitch: 2.6,
  },
  superbike_inline4: {
    id: 'superbike_inline4',
    nameFa: '۴ سیلندر خطی سنگین ریسینگ (سوزوکی GSX-R، بی‌کینگ، Z1000)',
    idleFreq: 44,
    redlineFreq: 460,
    primaryWave: 'sawtooth',
    secondaryWave: 'triangle',
    secondaryDetune: 10,
    hasSubBass: false,
    filterIdle: 420,
    filterRedline: 4000,
    filterQ: 3.2,
    driveGain: 1.5,
    limiterCycleMs: 66,
    limiterCutMs: 30,
    limiterFreqBoost: 1.09,
    backfirePopCount: [3, 6],
    backfireBassTone: 90,
    backfireBrightness: 3000,
    starterCrankMs: 95,
    starterCrankCount: 2,
    starterCatchPitch: 2.4,
  },
  sportbike_twin: {
    id: 'sportbike_twin',
    nameFa: 'انجین اسپرت خیابانی و قدرتی (هوندا CBR و CB1300)',
    idleFreq: 38,
    redlineFreq: 360,
    primaryWave: 'sawtooth',
    secondaryWave: 'triangle',
    secondaryDetune: 6,
    hasSubBass: false,
    filterIdle: 350,
    filterRedline: 3000,
    filterQ: 2.5,
    driveGain: 1.3,
    limiterCycleMs: 78,
    limiterCutMs: 34,
    limiterFreqBoost: 1.06,
    backfirePopCount: [2, 5],
    backfireBassTone: 80,
    backfireBrightness: 2400,
    starterCrankMs: 115,
    starterCrankCount: 2,
    starterCatchPitch: 2.2,
  },
  beetle_classic: {
    id: 'beetle_classic',
    nameFa: '۴ سیلندر باکسر هواخنک کلاسیک (فولکس‌واگن بیتل)',
    idleFreq: 28,
    redlineFreq: 175,
    primaryWave: 'triangle',
    secondaryWave: 'sawtooth',
    secondaryDetune: 4,
    hasSubBass: false,
    filterIdle: 240,
    filterRedline: 1200,
    filterQ: 1.6,
    driveGain: 1.1,
    limiterCycleMs: 110,
    limiterCutMs: 48,
    limiterFreqBoost: 1.03,
    backfirePopCount: [2, 4],
    backfireBassTone: 55,
    backfireBrightness: 1100,
    starterCrankMs: 180,
    starterCrankCount: 4,
    starterCatchPitch: 1.7,
  },
  modern_suv_i4: {
    id: 'modern_suv_i4',
    nameFa: '۴ سیلندر توربوشارژ کراس‌اوور (میتسوبیشی و کیا اسپورتیج)',
    idleFreq: 32,
    redlineFreq: 240,
    primaryWave: 'sawtooth',
    secondaryWave: 'sine',
    secondaryDetune: 5,
    hasSubBass: false,
    filterIdle: 300,
    filterRedline: 2000,
    filterQ: 2.0,
    driveGain: 1.2,
    limiterCycleMs: 90,
    limiterCutMs: 40,
    limiterFreqBoost: 1.04,
    backfirePopCount: [2, 4],
    backfireBassTone: 70,
    backfireBrightness: 1600,
    starterCrankMs: 130,
    starterCrankCount: 2,
    starterCatchPitch: 2.0,
  },
};

// Map Skin IDs to their authentic acoustic profile
export function getAcousticProfileForSkin(skinId?: string | null): VehicleAcousticProfile {
  if (!skinId) return ACOUSTIC_PROFILES.beetle_classic;
  
  switch (skinId) {
    case 'skin-porsche':
      return ACOUSTIC_PROFILES.porsche_flat6;
    case 'skin-bmw-m6':
    case 'skin-bmw-x6':
      return ACOUSTIC_PROFILES.v8_muscle;
    case 'skin-kawasaki-h2':
      return ACOUSTIC_PROFILES.supercharged_h2;
    case 'skin-ducati-pramac':
      return ACOUSTIC_PROFILES.ducati_v4;
    case 'skin-suzuki-gsxr':
    case 'skin-suzuki-bking':
    case 'skin-kawasaki-z1000':
    case 'skin-suzuki-gsx-blue':
      return ACOUSTIC_PROFILES.superbike_inline4;
    case 'skin-honda-cbr-red':
    case 'skin-honda-cb-black':
    case 'skin-honda-cb-white':
    case 'skin-honda-cb1300':
      return ACOUSTIC_PROFILES.sportbike_twin;
    case 'skin-vw-beetle':
      return ACOUSTIC_PROFILES.beetle_classic;
    case 'skin-mitsubishi':
    case 'skin-kia-sportage':
      return ACOUSTIC_PROFILES.modern_suv_i4;
    default:
      if (skinId.includes('motorcycle') || skinId.includes('bike') || skinId.includes('honda') || skinId.includes('suzuki') || skinId.includes('ducati') || skinId.includes('kawasaki')) {
        return ACOUSTIC_PROFILES.superbike_inline4;
      }
      return ACOUSTIC_PROFILES.v8_muscle;
  }
}

// ============================================================================
// Core Procedural Engine State Machine
// ============================================================================
class VehicleSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isRunning: boolean = false;
  private currentSkinId: string = 'skin-vw-beetle';
  private currentProfile: VehicleAcousticProfile = ACOUSTIC_PROFILES.beetle_classic;

  // Audio Nodes
  private oscPrimary: OscillatorNode | null = null;
  private oscSecondary: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private oscWhine: OscillatorNode | null = null; // Supercharger whine
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Dynamics & State
  private targetRpmNorm: number = 0; // 0.0 (idle) to 1.0 (redline)
  private currentRpmNorm: number = 0;
  private isLimiterActive: boolean = false;
  private limiterInterval: NodeJS.Timeout | null = null;
  private lastStrokeTimestamp: number = 0;
  private decelTimer: NodeJS.Timeout | null = null;
  private isDecelerating: boolean = false;
  private backfireTimeoutList: NodeJS.Timeout[] = [];
  private engineRpmLoop: NodeJS.Timeout | null = null;

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (!this.compressor && this.ctx) {
        // Broadcast-quality limiter/compressor to eliminate any distortion or clipping
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(14, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
      return true;
    } catch {
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // 1. Ignition & Engine Starter (استارت خوردن واقعی خودرو و موتور)
  // --------------------------------------------------------------------------
  public startEngine(skinId: string): void {
    if (isRaceAudioMuted()) return;
    if (!this.initContext() || !this.ctx || !this.compressor) return;

    this.stopEngine(); // Clean any previous instance
    this.currentSkinId = skinId;
    this.currentProfile = getAcousticProfileForSkin(skinId);
    this.isRunning = true;
    this.targetRpmNorm = 0;
    this.currentRpmNorm = 0;

    const ctx = this.ctx;
    const p = this.currentProfile;
    const now = ctx.currentTime;

    // --- PHASE 1: Starter Motor Cranking (سفت چرخیدن استارت و درگیری دنده فلایویل) ---
    const crankPulses = p.starterCrankCount;
    const crankInterval = p.starterCrankMs / 1000;

    for (let i = 0; i < crankPulses; i++) {
      const crankTime = now + (i * crankInterval);

      // Starter mechanical compression grunt
      const crankOsc = ctx.createOscillator();
      const crankGain = ctx.createGain();
      crankOsc.type = 'triangle';
      crankOsc.frequency.setValueAtTime(p.idleFreq * 0.75, crankTime);
      crankOsc.frequency.exponentialRampToValueAtTime(p.idleFreq * 0.4, crankTime + crankInterval * 0.7);

      crankGain.gain.setValueAtTime(0.12, crankTime);
      crankGain.gain.exponentialRampToValueAtTime(0.001, crankTime + crankInterval * 0.85);

      crankOsc.connect(crankGain);
      crankGain.connect(this.compressor);
      crankOsc.start(crankTime);
      crankOsc.stop(crankTime + crankInterval * 0.9);

      // Starter electric motor high whir
      const whirOsc = ctx.createOscillator();
      const whirGain = ctx.createGain();
      whirOsc.type = 'sine';
      whirOsc.frequency.setValueAtTime(320 + i * 40, crankTime);
      whirOsc.frequency.exponentialRampToValueAtTime(260 + i * 40, crankTime + crankInterval * 0.7);

      whirGain.gain.setValueAtTime(0.04, crankTime);
      whirGain.gain.exponentialRampToValueAtTime(0.001, crankTime + crankInterval * 0.75);

      whirOsc.connect(whirGain);
      whirGain.connect(this.compressor);
      whirOsc.start(crankTime);
      whirOsc.stop(crankTime + crankInterval * 0.8);
    }

    // --- PHASE 2: Combustion Fire-Up & Catch (گرفتن موتور و زوزه اولیه روشن شدن) ---
    const catchTime = now + (crankPulses * crankInterval);
    const flareRpm = p.idleFreq * p.starterCatchPitch;

    // Start continuous engine loops right at catch point
    this.setupContinuousEngine(catchTime, flareRpm);
  }

  // --------------------------------------------------------------------------
  // Setup continuous running engine oscillators (Dual Harmonic Bank)
  // --------------------------------------------------------------------------
  private setupContinuousEngine(startTime: number, initialPitch: number): void {
    if (!this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const p = this.currentProfile;

    // 1. Engine Filter Node (shapes exhaust tone from warm rumble to open-header roar)
    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.Q.setValueAtTime(p.filterQ, startTime);
    this.engineFilter.frequency.setValueAtTime(p.filterIdle * 2.2, startTime);
    this.engineFilter.frequency.exponentialRampToValueAtTime(p.filterIdle, startTime + 0.6);

    // 2. Engine Master Gain
    this.engineGain = ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, startTime);
    this.engineGain.gain.linearRampToValueAtTime(0.18, startTime + 0.08); // Initial burst
    this.engineGain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.65); // Settle to idle

    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.compressor);

    // 3. Primary Engine Oscillator
    this.oscPrimary = ctx.createOscillator();
    this.oscPrimary.type = p.primaryWave;
    this.oscPrimary.frequency.setValueAtTime(initialPitch, startTime);
    this.oscPrimary.frequency.exponentialRampToValueAtTime(p.idleFreq, startTime + 0.65);
    this.oscPrimary.connect(this.engineFilter);
    this.oscPrimary.start(startTime);

    // 4. Secondary Harmonic Oscillator (Gives fullness and mechanical body)
    this.oscSecondary = ctx.createOscillator();
    this.oscSecondary.type = p.secondaryWave;
    this.oscSecondary.detune.setValueAtTime(p.secondaryDetune, startTime);
    this.oscSecondary.frequency.setValueAtTime(initialPitch * 1.5, startTime);
    this.oscSecondary.frequency.exponentialRampToValueAtTime(p.idleFreq * 1.5, startTime + 0.65);
    this.oscSecondary.connect(this.engineFilter);
    this.oscSecondary.start(startTime);

    // 5. Sub-Bass Oscillator (For V8 Muscle and Heavy Supercars)
    if (p.hasSubBass) {
      this.oscSub = ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(initialPitch * 0.5, startTime);
      this.oscSub.frequency.exponentialRampToValueAtTime(p.idleFreq * 0.5, startTime + 0.65);
      
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.08, startTime);
      this.oscSub.connect(subGain);
      subGain.connect(this.engineFilter);
      this.oscSub.start(startTime);
    }

    // 6. Supercharger Turbine Whine (Exclusively for Kawasaki Ninja H2)
    if (p.hasSuperchargerWhine) {
      this.oscWhine = ctx.createOscillator();
      this.oscWhine.type = 'triangle';
      this.oscWhine.frequency.setValueAtTime(2400, startTime);
      
      const whineGain = ctx.createGain();
      whineGain.gain.setValueAtTime(0.015, startTime);
      this.oscWhine.connect(whineGain);
      whineGain.connect(this.compressor);
      this.oscWhine.start(startTime);
    }

    // Start RPM tracking loop
    this.startRpmLoop();
  }

  // --------------------------------------------------------------------------
  // 2. Dynamic RPM & Throttle Control (گاز خوردن هماهنگ با سرعت تایپ WPM)
  // --------------------------------------------------------------------------
  public handleKeystroke(skinId?: string): void {
    if (isRaceAudioMuted()) return;
    if (!this.isRunning) {
      this.startEngine(skinId || this.currentSkinId);
    }
    this.lastStrokeTimestamp = Date.now();

    // If currently decelerating or popping, instantly resume throttle!
    if (this.isDecelerating) {
      this.cancelBackfires();
      this.isDecelerating = false;
    }

    // Instant responsive throttle blip (+0.12 normalized RPM)
    this.targetRpmNorm = Math.min(1.0, this.targetRpmNorm + 0.12);
  }

  public updateTypingState(wpm: number, isFinished: boolean = false): void {
    if (!this.isRunning || isRaceAudioMuted() || isFinished) {
      if (isFinished) this.stopEngine();
      return;
    }

    const now = Date.now();
    const idleElapsed = now - this.lastStrokeTimestamp;

    // Check for pause / idle after typing -> Trigger deceleration & Backfire (بک‌فایر)!
    if (idleElapsed > 380 && this.lastStrokeTimestamp > 0 && !this.isDecelerating) {
      if (this.currentRpmNorm > 0.28 || wpm > 24) {
        this.triggerDecelBackfire();
      }
      this.targetRpmNorm = 0; // Return smoothly to idle
    }

    // If active typing: map WPM directly to Target RPM (0 WPM = idle, 85+ WPM = Redline / Limiter)
    if (idleElapsed <= 380) {
      // 0 to 80 WPM maps from 0.1 to 0.95 RPM. Above 80 WPM enters Redline / Cut-off.
      const normalizedWpm = Math.max(0, Math.min(1.0, (wpm - 8) / 72));
      this.targetRpmNorm = Math.max(normalizedWpm, this.targetRpmNorm * 0.96);

      // Check for Rev Limiter (کاتاف)!
      if (wpm >= 80 && !this.isLimiterActive) {
        this.startRevLimiter();
      } else if (wpm < 76 && this.isLimiterActive) {
        this.stopRevLimiter();
      }
    } else {
      if (this.isLimiterActive) {
        this.stopRevLimiter();
      }
    }
  }

  // Smooth continuous RPM audio update loop (60 FPS interpolation)
  private startRpmLoop(): void {
    if (this.engineRpmLoop) clearInterval(this.engineRpmLoop);
    this.engineRpmLoop = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.oscPrimary || !this.engineFilter || !this.engineGain) return;

      // Exponential smoothing towards target RPM (Fast attack, natural decay)
      const smoothingFactor = this.targetRpmNorm > this.currentRpmNorm ? 0.22 : 0.08;
      this.currentRpmNorm += (this.targetRpmNorm - this.currentRpmNorm) * smoothingFactor;

      const p = this.currentProfile;
      const t = this.ctx.currentTime;
      const currentPitch = p.idleFreq + (p.redlineFreq - p.idleFreq) * Math.pow(this.currentRpmNorm, 1.25);
      const currentFilter = p.filterIdle + (p.filterRedline - p.filterIdle) * Math.pow(this.currentRpmNorm, 1.4);
      const currentVolume = 0.08 + (0.16 * this.currentRpmNorm);

      if (!this.isLimiterActive) {
        this.oscPrimary.frequency.setTargetAtTime(currentPitch, t, 0.04);
        if (this.oscSecondary) {
          this.oscSecondary.frequency.setTargetAtTime(currentPitch * 1.5, t, 0.04);
        }
        if (this.oscSub) {
          this.oscSub.frequency.setTargetAtTime(currentPitch * 0.5, t, 0.04);
        }
        if (this.oscWhine) {
          // Supercharger pitch climbs dynamically to 4200 Hz at high revs
          const whinePitch = 2400 + (this.currentRpmNorm * 1800);
          this.oscWhine.frequency.setTargetAtTime(whinePitch, t, 0.03);
        }
        this.engineFilter.frequency.setTargetAtTime(currentFilter, t, 0.05);
        this.engineGain.gain.setTargetAtTime(currentVolume, t, 0.04);
      }
    }, 16);
  }

  // --------------------------------------------------------------------------
  // 3. Realistic Rev Limiter / Cut-Off (کاتاف رگباری بدون تداخل و بدون باگ صوتی)
  // --------------------------------------------------------------------------
  private startRevLimiter(): void {
    if (this.isLimiterActive || !this.ctx || !this.engineGain || !this.oscPrimary) return;
    this.isLimiterActive = true;
    const p = this.currentProfile;

    if (this.limiterInterval) clearInterval(this.limiterInterval);

    this.limiterInterval = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.engineGain || !this.oscPrimary || isRaceAudioMuted()) return;
      const t = this.ctx.currentTime;
      const cutSec = p.limiterCutMs / 1000;

      // 1. Ignition Cut (Spark dropped: sudden momentary silence)
      this.engineGain.gain.cancelScheduledValues(t);
      this.engineGain.gain.setValueAtTime(0.01, t);

      // 2. Instant Explosive Return (Spark re-engages with a sharp crackle bark)
      this.engineGain.gain.setValueAtTime(0.24, t + cutSec);
      this.engineGain.gain.exponentialRampToValueAtTime(0.18, t + cutSec + 0.025);

      // Limiter Micro Flame Crackle (شلیک ترقه ریز در لحظه کاتاف)
      this.playLimiterFlameSnap(t + cutSec);

    }, p.limiterCycleMs);
  }

  private stopRevLimiter(): void {
    if (!this.isLimiterActive) return;
    this.isLimiterActive = false;
    if (this.limiterInterval) {
      clearInterval(this.limiterInterval);
      this.limiterInterval = null;
    }
  }

  // Sharp transient snap on each limiter spark recovery
  private playLimiterFlameSnap(startTime: number): void {
    if (!this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const p = this.currentProfile;

    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(p.backfireBrightness, startTime);
    filter.Q.setValueAtTime(4.0, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(startTime);
  }

  // --------------------------------------------------------------------------
  // 4. Deceleration Backfires & Exhaust Pops (بک‌فایر و تقه‌های واقعی اگزوز در مکس)
  // --------------------------------------------------------------------------
  private triggerDecelBackfire(): void {
    this.isDecelerating = true;
    this.cancelBackfires();

    const p = this.currentProfile;
    // Determine random number of pops within profile range (e.g. 3 to 6 pops)
    const count = p.backfirePopCount[0] + Math.floor(Math.random() * (p.backfirePopCount[1] - p.backfirePopCount[0] + 1));
    let cumulativeDelay = 60; // First pop starts quickly after throttle let-off

    for (let i = 0; i < count; i++) {
      // Natural non-linear timing between pops
      cumulativeDelay += 80 + Math.floor(Math.random() * 140);
      const intensity = Math.max(0.3, 1.0 - (i / count) * 0.6); // Decreasing intensity as exhaust cools

      const timer = setTimeout(() => {
        if (!this.isDecelerating || !this.isRunning || isRaceAudioMuted()) return;
        this.playSingleExhaustPop(intensity);
      }, cumulativeDelay);

      this.backfireTimeoutList.push(timer);
    }

    // Kawasaki H2 Supercharger Blow-Off Valve Flutter (صدای چه‌چه سوپرشارژر)
    if (p.hasSuperchargerWhine) {
      const flutterTimer = setTimeout(() => {
        if (!this.isDecelerating || !this.isRunning || isRaceAudioMuted()) return;
        this.playSuperchargerFlutter();
      }, 100);
      this.backfireTimeoutList.push(flutterTimer);
    }

    // End decel state after sequence completes
    const endTimer = setTimeout(() => {
      this.isDecelerating = false;
    }, cumulativeDelay + 250);
    this.backfireTimeoutList.push(endTimer);
  }

  private playSingleExhaustPop(intensity: number): void {
    if (!this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const p = this.currentProfile;
    const t = ctx.currentTime;

    // 1. Concussion Sub-Bass Thump (صدای بم انفجار در لوله اگزوز)
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(p.backfireBassTone * (0.9 + Math.random() * 0.2), t);
    thumpOsc.frequency.exponentialRampToValueAtTime(28, t + 0.055);

    thumpGain.gain.setValueAtTime(0.18 * intensity, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.compressor);
    thumpOsc.start(t);
    thumpOsc.stop(t + 0.06);

    // 2. Metallic Chamber Crackle (صدای ترق و تقه سر اگزوز)
    const bufferLen = Math.floor(ctx.sampleRate * 0.04);
    const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferLen; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferLen * 0.2));
    }

    const crackle = ctx.createBufferSource();
    crackle.buffer = noiseBuffer;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.setValueAtTime(p.backfireBrightness * (0.85 + Math.random() * 0.3), t);
    crackleFilter.Q.setValueAtTime(3.5, t);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.14 * intensity, t);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.compressor);
    crackle.start(t);
  }

  // Kawasaki Ninja H2 Supercharger Blow-Off Valve Flutter (صدای نمادین تخلیه هوای چرخنده)
  private playSuperchargerFlutter(): void {
    if (!this.ctx || !this.compressor) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Series of 3-4 micro chirps (tsu-tsu-tsu)
    for (let i = 0; i < 4; i++) {
      const chirpTime = t + (i * 0.06);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(3400 - (i * 250), chirpTime);
      osc.frequency.exponentialRampToValueAtTime(1800, chirpTime + 0.045);

      gain.gain.setValueAtTime(0.05 / (i + 1), chirpTime);
      gain.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.045);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(chirpTime);
      osc.stop(chirpTime + 0.05);
    }
  }

  private cancelBackfires(): void {
    this.backfireTimeoutList.forEach(clearTimeout);
    this.backfireTimeoutList = [];
  }

  // --------------------------------------------------------------------------
  // 5. Cleanup & Power Off (خاموش شدن آرام و قطع کامل در خروج یا پایان مسابقه)
  // --------------------------------------------------------------------------
  public stopEngine(): void {
    this.isRunning = false;
    this.stopRevLimiter();
    this.cancelBackfires();

    if (this.engineRpmLoop) {
      clearInterval(this.engineRpmLoop);
      this.engineRpmLoop = null;
    }

    if (this.ctx && this.engineGain) {
      try {
        const t = this.ctx.currentTime;
        this.engineGain.gain.cancelScheduledValues(t);
        this.engineGain.gain.linearRampToValueAtTime(0.0001, t + 0.15);
      } catch {}
    }

    setTimeout(() => {
      try {
        this.oscPrimary?.stop();
        this.oscPrimary?.disconnect();
        this.oscSecondary?.stop();
        this.oscSecondary?.disconnect();
        this.oscSub?.stop();
        this.oscSub?.disconnect();
        this.oscWhine?.stop();
        this.oscWhine?.disconnect();
      } catch {}
      this.oscPrimary = null;
      this.oscSecondary = null;
      this.oscSub = null;
      this.oscWhine = null;
    }, 180);
  }
}

// Global Singleton (Strictly local to user browser - zero network broadcast)
export const vehicleAudioEngine = new VehicleSoundEngine();
