// Typro.ir - High-Fidelity Sample-Based Vehicle Sound Engine
// Real recorded acoustics for Supercars, Sportbikes, Muscle V8, Kawasaki H2, Ducati, & Classics.
// Features: Real Starters, Real Acceleration Loops, Real Rev Limiter (کاتاف), & Real Decel Backfires (بک‌فایر).
// 100% Local to player, zero overlap, zero distortion, broadcast-grade compressor.

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

// Map Skin IDs to their authentic acoustic profile
export function getAcousticProfileForSkin(skinId?: string | null): VehicleAcousticFamily {
  if (!skinId) return 'beetle_classic';
  
  switch (skinId) {
    case 'skin-porsche':
      return 'porsche_flat6';
    case 'skin-bmw-m6':
    case 'skin-bmw-x6':
      return 'v8_muscle';
    case 'skin-kawasaki-h2':
      return 'supercharged_h2';
    case 'skin-ducati-pramac':
      return 'ducati_v4';
    case 'skin-suzuki-gsxr':
    case 'skin-suzuki-bking':
    case 'skin-kawasaki-z1000':
    case 'skin-suzuki-gsx-blue':
      return 'superbike_inline4';
    case 'skin-honda-cbr-red':
    case 'skin-honda-cb-black':
    case 'skin-honda-cb-white':
    case 'skin-honda-cb1300':
      return 'sportbike_twin';
    case 'skin-vw-beetle':
      return 'beetle_classic';
    case 'skin-mitsubishi':
    case 'skin-kia-sportage':
      return 'modern_suv_i4';
    default:
      if (skinId.includes('motorcycle') || skinId.includes('bike') || skinId.includes('honda') || skinId.includes('suzuki') || skinId.includes('ducati') || skinId.includes('kawasaki')) {
        return 'superbike_inline4';
      }
      return 'v8_muscle';
  }
}

class VehicleSampleSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isRunning: boolean = false;
  private currentSkinId: string = 'skin-vw-beetle';
  private currentFamily: VehicleAcousticFamily = 'beetle_classic';

  // Sample Buffer Cache (Memory Cached AudioBuffers for instant playback)
  private bufferCache = new Map<string, AudioBuffer>();
  private preloadedFamilies = new Set<string>();

  // Continuous Sound Nodes
  private idleSource: AudioBufferSourceNode | null = null;
  private idleGain: GainNode | null = null;

  private revSource: AudioBufferSourceNode | null = null;
  private revGain: GainNode | null = null;

  private cutoffSource: AudioBufferSourceNode | null = null;
  private cutoffGain: GainNode | null = null;
  private isLimiterActive: boolean = false;

  private backfireSource: AudioBufferSourceNode | null = null;
  private isDecelerating: boolean = false;

  // Dynamics & State
  private targetRpmNorm: number = 0; // 0.0 to 1.0
  private currentRpmNorm: number = 0;
  private lastStrokeTimestamp: number = 0;
  private rpmLoopInterval: NodeJS.Timeout | null = null;

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
        this.masterGain.gain.setValueAtTime(0.32, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
      return true;
    } catch {
      return false;
    }
  }

  // Preload and decode a WAV audio asset into buffer cache
  private async loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }
    if (!this.initContext() || !this.ctx) return null;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  // Preload all 5 sound files for a specific vehicle family
  public async preloadFamily(family: VehicleAcousticFamily): Promise<void> {
    if (this.preloadedFamilies.has(family)) return;
    this.preloadedFamilies.add(family);

    const files = ['start.wav', 'idle.wav', 'rev.wav', 'cutoff.wav', 'backfire.wav'];
    await Promise.all(
      files.map((file) => this.loadAudioBuffer(`/sounds/vehicles/${family}/${file}`))
    );
  }

  // --------------------------------------------------------------------------
  // 1. Ignition & Starter (استارت واقعی ماشین و موتور)
  // --------------------------------------------------------------------------
  public async startEngine(skinId: string): Promise<void> {
    if (isRaceAudioMuted()) return;
    if (!this.initContext() || !this.ctx || !this.compressor) return;

    this.stopEngine();
    this.currentSkinId = skinId;
    this.currentFamily = getAcousticProfileForSkin(skinId);
    this.isRunning = true;
    this.targetRpmNorm = 0;
    this.currentRpmNorm = 0;

    const family = this.currentFamily;
    await this.preloadFamily(family);
    if (!this.isRunning || isRaceAudioMuted()) return;

    // 1. Play real starter ignition sound
    const startBuf = this.bufferCache.get(`/sounds/vehicles/${family}/start.wav`);
    if (startBuf && this.ctx && this.compressor) {
      const startSrc = this.ctx.createBufferSource();
      startSrc.buffer = startBuf;
      const startGain = this.ctx.createGain();
      startGain.gain.setValueAtTime(0.40, this.ctx.currentTime);
      startSrc.connect(startGain);
      startGain.connect(this.compressor);
      startSrc.start();
    }

    // 2. Setup continuous loops (idle + rev) after starter catch
    setTimeout(() => {
      if (this.isRunning && !isRaceAudioMuted()) {
        this.setupContinuousLoops();
      }
    }, 700);
  }

  // --------------------------------------------------------------------------
  // Setup seamless looping idle & rev layers with crossfade
  // --------------------------------------------------------------------------
  private setupContinuousLoops(): void {
    if (!this.ctx || !this.compressor || !this.isRunning) return;
    const family = this.currentFamily;

    const idleBuf = this.bufferCache.get(`/sounds/vehicles/${family}/idle.wav`);
    const revBuf = this.bufferCache.get(`/sounds/vehicles/${family}/rev.wav`);

    if (!idleBuf || !revBuf) return;

    const t = this.ctx.currentTime;

    // Idle Loop
    this.idleSource = this.ctx.createBufferSource();
    this.idleSource.buffer = idleBuf;
    this.idleSource.loop = true;

    this.idleGain = this.ctx.createGain();
    this.idleGain.gain.setValueAtTime(0.35, t);

    this.idleSource.connect(this.idleGain);
    this.idleGain.connect(this.compressor);
    this.idleSource.start(t);

    // Rev Loop
    this.revSource = this.ctx.createBufferSource();
    this.revSource.buffer = revBuf;
    this.revSource.loop = true;
    this.revSource.playbackRate.setValueAtTime(0.9, t);

    this.revGain = this.ctx.createGain();
    this.revGain.gain.setValueAtTime(0.001, t); // Starts silent at idle

    this.revSource.connect(this.revGain);
    this.revGain.connect(this.compressor);
    this.revSource.start(t);

    this.startRpmLoop();
  }

  // --------------------------------------------------------------------------
  // 2. Dynamic RPM & Keystroke Throttle (گاز خوردن هماهنگ با تایپ)
  // --------------------------------------------------------------------------
  public handleKeystroke(skinId?: string): void {
    if (isRaceAudioMuted()) return;
    if (!this.isRunning) {
      this.startEngine(skinId || this.currentSkinId);
    }
    this.lastStrokeTimestamp = Date.now();

    // Cancel any active deceleration backfire instantly when user continues typing!
    if (this.isDecelerating) {
      this.stopBackfire();
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

    // Deceleration & Backfire check:
    // If user stops typing for > 380ms after having revved up:
    if (idleElapsed > 380 && this.lastStrokeTimestamp > 0 && !this.isDecelerating) {
      if (this.currentRpmNorm > 0.25 || wpm > 24) {
        this.triggerBackfire();
      }
      this.targetRpmNorm = 0; // Return smoothly to idle
    }

    // Active typing: map WPM smoothly to Target RPM
    if (idleElapsed <= 380) {
      const normalizedWpm = Math.max(0, Math.min(1.0, (wpm - 10) / 70));
      this.targetRpmNorm = Math.max(normalizedWpm, this.targetRpmNorm * 0.96);

      // Rev Limiter / Cut-Off (کاتاف واقعی در سرعت بالا بالای ۸۰ WPM)
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

  // 60 FPS audio interpolation loop
  private startRpmLoop(): void {
    if (this.rpmLoopInterval) clearInterval(this.rpmLoopInterval);
    this.rpmLoopInterval = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.idleGain || !this.revGain || !this.revSource) return;

      const smoothing = this.targetRpmNorm > this.currentRpmNorm ? 0.20 : 0.08;
      this.currentRpmNorm += (this.targetRpmNorm - this.currentRpmNorm) * smoothing;

      const t = this.ctx.currentTime;
      const rpm = this.currentRpmNorm;

      if (!this.isLimiterActive) {
        // Crossfade between idle and rev layers
        const idleVol = Math.max(0.04, 0.35 * (1.0 - rpm * 0.8));
        const revVol = Math.max(0.001, 0.40 * Math.pow(rpm, 1.2));

        this.idleGain.gain.setTargetAtTime(idleVol, t, 0.04);
        this.revGain.gain.setTargetAtTime(revVol, t, 0.04);

        // Scale playbackRate for realistic acoustic pitch rise with revs
        const pitch = 0.88 + (rpm * 0.45);
        this.revSource.playbackRate.setTargetAtTime(pitch, t, 0.04);
      }
    }, 16);
  }

  // --------------------------------------------------------------------------
  // 3. Real Rev Limiter / Cut-Off (کاتاف واقعی رگباری بدون تداخل)
  // --------------------------------------------------------------------------
  private startRevLimiter(): void {
    if (this.isLimiterActive || !this.ctx || !this.compressor) return;
    this.isLimiterActive = true;

    const family = this.currentFamily;
    const cutoffBuf = this.bufferCache.get(`/sounds/vehicles/${family}/cutoff.wav`);
    if (!cutoffBuf) return;

    const t = this.ctx.currentTime;

    // Soften the continuous rev loop so the violent cutoff takes full focus
    if (this.revGain) {
      this.revGain.gain.setTargetAtTime(0.05, t, 0.02);
    }

    // Play real cutoff loop
    this.stopRevLimiterSource();
    this.cutoffSource = this.ctx.createBufferSource();
    this.cutoffSource.buffer = cutoffBuf;
    this.cutoffSource.loop = true;

    this.cutoffGain = this.ctx.createGain();
    this.cutoffGain.gain.setValueAtTime(0.48, t);

    this.cutoffSource.connect(this.cutoffGain);
    this.cutoffGain.connect(this.compressor);
    this.cutoffSource.start(t);
  }

  private stopRevLimiter(): void {
    if (!this.isLimiterActive) return;
    this.isLimiterActive = false;
    this.stopRevLimiterSource();
  }

  private stopRevLimiterSource(): void {
    if (this.cutoffSource) {
      try {
        this.cutoffSource.stop();
        this.cutoffSource.disconnect();
      } catch {}
      this.cutoffSource = null;
    }
    if (this.cutoffGain) {
      try {
        this.cutoffGain.disconnect();
      } catch {}
      this.cutoffGain = null;
    }
  }

  // --------------------------------------------------------------------------
  // 4. Real Deceleration Backfire / Exhaust Pops (بک‌فایر و تقه واقعی اگزوز)
  // --------------------------------------------------------------------------
  private triggerBackfire(): void {
    this.isDecelerating = true;
    this.stopBackfire();

    if (!this.ctx || !this.compressor) return;
    const family = this.currentFamily;
    const backfireBuf = this.bufferCache.get(`/sounds/vehicles/${family}/backfire.wav`);
    if (!backfireBuf) return;

    const t = this.ctx.currentTime;
    this.backfireSource = this.ctx.createBufferSource();
    this.backfireSource.buffer = backfireBuf;

    const popGain = this.ctx.createGain();
    popGain.gain.setValueAtTime(0.42, t);

    this.backfireSource.connect(popGain);
    popGain.connect(this.compressor);
    this.backfireSource.start(t);

    this.backfireSource.onended = () => {
      this.isDecelerating = false;
    };
  }

  private stopBackfire(): void {
    if (this.backfireSource) {
      try {
        this.backfireSource.stop();
        this.backfireSource.disconnect();
      } catch {}
      this.backfireSource = null;
    }
  }

  // --------------------------------------------------------------------------
  // 5. Clean Shutdown (قطع کامل در پایان مسابقه یا بستن پنجره)
  // --------------------------------------------------------------------------
  public stopEngine(): void {
    this.isRunning = false;
    this.isLimiterActive = false;
    this.isDecelerating = false;

    if (this.rpmLoopInterval) {
      clearInterval(this.rpmLoopInterval);
      this.rpmLoopInterval = null;
    }

    this.stopRevLimiterSource();
    this.stopBackfire();

    if (this.idleSource) {
      try {
        this.idleSource.stop();
        this.idleSource.disconnect();
      } catch {}
      this.idleSource = null;
    }
    if (this.idleGain) {
      try {
        this.idleGain.disconnect();
      } catch {}
      this.idleGain = null;
    }

    if (this.revSource) {
      try {
        this.revSource.stop();
        this.revSource.disconnect();
      } catch {}
      this.revSource = null;
    }
    if (this.revGain) {
      try {
        this.revGain.disconnect();
      } catch {}
      this.revGain = null;
    }
  }
}

// Global Singleton (Strictly local to user browser - zero network broadcast)
export const vehicleAudioEngine = new VehicleSampleSoundEngine();
