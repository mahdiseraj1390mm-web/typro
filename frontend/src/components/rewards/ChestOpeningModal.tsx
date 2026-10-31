'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, Gift, Check, X, Coins, Gem, Zap, Award, Star, 
  Flame, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { ALL_SKINS } from '@/lib/skins';

export type ChestType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'diamond';

export interface ChestReward {
  id: string;
  type: 'coins' | 'diamonds' | 'xp' | 'skin' | 'booster' | 'cup_shield';
  title: string;
  amount?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  badge?: string;
}

interface ChestConfig {
  name: string;
  subtitle: string;
  tier: string;
  gradient: string;
  glowColor: string;
  accentColor: string;
  minCoins: number;
  maxCoins: number;
  diamonds: number;
  xp: number;
}

export const CHEST_CONFIGS: Record<ChestType, ChestConfig> = {
  daily: {
    name: 'صندوقچه چوبی روزانه',
    subtitle: 'پاداش ۲۴ ساعته سبک و منظم وفاداری',
    tier: 'روزانه (عادی)',
    gradient: 'from-amber-800 via-amber-700 to-yellow-900',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    accentColor: '#d97706',
    minCoins: 15,
    maxCoins: 35,
    diamonds: 1,
    xp: 30,
  },
  weekly: {
    name: 'صندوقچه نقره‌ای هفتگی',
    subtitle: 'پاداش ۷ روز استمرار تمرین و رقابت',
    tier: 'هفتگی (کمیاب)',
    gradient: 'from-slate-400 via-slate-300 to-cyan-700',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    accentColor: '#38bdf8',
    minCoins: 120,
    maxCoins: 250,
    diamonds: 5,
    xp: 150,
  },
  monthly: {
    name: 'صندوقچه طلایی ماهانه',
    subtitle: 'پاداش ۳۰ روزه باارزش برای اعضای پیوسته',
    tier: 'ماهانه (حماسی)',
    gradient: 'from-amber-400 via-yellow-500 to-amber-700',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    accentColor: '#eab308',
    minCoins: 600,
    maxCoins: 1200,
    diamonds: 25,
    xp: 600,
  },
  yearly: {
    name: 'صندوقچه الماس سالانه (گرند لوت)',
    subtitle: 'سوپرپاداش سالانه با بیشترین و چشمگیرترین مقدار سکه و الماس',
    tier: 'سالانه (افسانه‌ای)',
    gradient: 'from-cyan-400 via-indigo-500 to-fuchsia-600',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    accentColor: '#a855f7',
    minCoins: 5000,
    maxCoins: 12000,
    diamonds: 150,
    xp: 3500,
  },
  diamond: {
    name: 'صندوقچه الماس سالانه (گرند لوت)',
    subtitle: 'سوپرپاداش سالانه با بیشترین و چشمگیرترین مقدار سکه و الماس',
    tier: 'سالانه (افسانه‌ای)',
    gradient: 'from-cyan-400 via-indigo-500 to-fuchsia-600',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    accentColor: '#a855f7',
    minCoins: 5000,
    maxCoins: 12000,
    diamonds: 150,
    xp: 3500,
  },
};

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: ChestType;
  onClaimRewards: (rewards: ChestReward[]) => void;
}

export default function ChestOpeningModal({
  isOpen,
  onClose,
  chestType,
  onClaimRewards,
}: ChestOpeningModalProps) {
  const [stage, setStage] = useState<'idle' | 'opening' | 'opened'>('idle');
  const [rewards, setRewards] = useState<ChestReward[]>([]);
  const config = CHEST_CONFIGS[chestType];

  // Sound generator using Web Audio API (smooth, velvety, warm acoustic game audio)
  const playSound = (type: 'rumble' | 'pop' | 'fanfare' | 'chime') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // Master lowpass filter to completely eliminate harsh high-frequency buzzes
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(800, ctx.currentTime);
      masterFilter.connect(ctx.destination);

      if (type === 'rumble') {
        // Warm, deep wooden chest resonance (pleasant bass thrum)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(masterFilter);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === 'pop') {
        // Soft rounded wooden unlock tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(masterFilter);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'fanfare') {
        // Melodic, warm, sweet chime progression (C4, E4, G4, C5) with gentle sine tones
        const notes = [261.63, 329.63, 392.00, 523.25]; // Warm C-Major chord, lower octave
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const startTime = ctx.currentTime + idx * 0.14;
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);
          osc.connect(gain);
          gain.connect(masterFilter);
          osc.start(startTime);
          osc.stop(startTime + 0.7);
        });
      } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(masterFilter);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // AudioContext muted or not permitted
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('idle');
      setRewards([]);
    }
  }, [isOpen, chestType]);

  if (!isOpen) return null;

  const handleOpenChest = () => {
    if (stage !== 'idle') return;

    setStage('opening');
    playSound('rumble');

    // Simulate chest opening sequence
    setTimeout(() => {
      playSound('pop');
      playSound('fanfare');

      // Generate rewards according to chest tier
      const coinsWon = Math.floor(
        Math.random() * (config.maxCoins - config.minCoins) + config.minCoins
      );

      const generated: ChestReward[] = [
        {
          id: 'rew-coins',
          type: 'coins',
          title: `${coinsWon.toLocaleString('fa-IR')} سکه طلا`,
          amount: coinsWon,
          rarity: chestType === 'daily' ? 'common' : 'rare',
          icon: '🪙',
        },
        {
          id: 'rew-diamonds',
          type: 'diamonds',
          title: `${config.diamonds.toLocaleString('fa-IR')} الماس آبی`,
          amount: config.diamonds,
          rarity: chestType === 'daily' ? 'rare' : 'epic',
          icon: '💎',
        },
        {
          id: 'rew-xp',
          type: 'xp',
          title: `+${config.xp.toLocaleString('fa-IR')} امتیاز تجربه (XP)`,
          amount: config.xp,
          rarity: 'common',
          icon: '⚡',
        },
      ];

      // Bonus rewards for Weekly / Monthly / Diamond chests
      if (chestType === 'weekly') {
        generated.push({
          id: 'rew-shield',
          type: 'cup_shield',
          title: 'محافظ کاپ رقابتی (۱ مسابقه بدون کسر کاپ)',
          rarity: 'rare',
          icon: '🛡️',
        });
      } else if (chestType === 'monthly') {
        generated.push({
          id: 'rew-booster',
          type: 'booster',
          title: 'کارت بوست ۲ برابری XP برای ۷ روز',
          rarity: 'epic',
          icon: '🚀',
        });
      } else if (chestType === 'yearly' || chestType === 'diamond') {
        // Truly random vehicle skin prize for the yearly grand loot chest
        const randomSkin = ALL_SKINS[Math.floor(Math.random() * ALL_SKINS.length)];

        generated.push({
          id: `rew-skin-${randomSkin.id}`,
          type: 'skin',
          title: `پوسته افسانه‌ای «${randomSkin.name}» (${randomSkin.tagline})`,
          rarity: 'legendary',
          icon: randomSkin.emoji || '🏎️',
          badge: randomSkin.id,
        });
      }

      setRewards(generated);
      setStage('opened');

      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#a855f7', '#10b981'],
      });
    }, 1400);
  };

  const handleClaim = () => {
    onClaimRewards(rewards);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl overflow-hidden">
        {/* Background Aura Rays */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${config.accentColor} 0%, transparent 70%)`
          }}
        />

        {stage === 'opened' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-ray-spin" />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          title="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            {config.tier}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {config.name}
          </h2>
          <p className="text-xs text-slate-400">
            {config.subtitle}
          </p>
        </div>

        {/* 3D Chest Container & Animation */}
        <div className="py-8 relative z-10 flex flex-col items-center justify-center min-h-[220px]">
          {/* Animated 3D Graphic of Chest */}
          <div
            onClick={stage === 'idle' ? handleOpenChest : undefined}
            className={`relative cursor-pointer transition-transform select-none ${
              stage === 'idle' ? 'animate-chest-float hover:scale-105' : ''
            } ${stage === 'opening' ? 'animate-chest-rumble scale-110' : ''}`}
          >
            {/* Chest Glow */}
            <div 
              className="absolute -inset-4 rounded-full blur-2xl opacity-60 animate-pulse pointer-events-none"
              style={{ backgroundColor: config.glowColor }}
            />

            {/* SVG Chest Graphic */}
            <svg
              className="w-40 h-40 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
              viewBox="0 0 160 160"
              fill="none"
            >
              {/* Chest Shadow */}
              <ellipse cx="80" cy="142" rx="55" ry="12" fill="rgba(0,0,0,0.5)" />

              {/* Chest Base Body */}
              <path
                d="M30 75 L130 75 L125 135 L35 135 Z"
                fill={(chestType === 'yearly' || chestType === 'diamond') ? '#1e1b4b' : chestType === 'monthly' ? '#78350f' : chestType === 'weekly' ? '#334155' : '#451a03'}
                stroke="#d97706"
                strokeWidth="3"
              />

              {/* Chest Body Reinforcements */}
              <rect x="42" y="75" width="10" height="60" fill="#f59e0b" opacity="0.85" />
              <rect x="108" y="75" width="10" height="60" fill="#f59e0b" opacity="0.85" />
              <rect x="35" y="100" width="90" height="6" fill="#f59e0b" opacity="0.75" />

              {/* Chest Lid - Closed or Opened */}
              {stage !== 'opened' ? (
                <g>
                  {/* Closed Lid */}
                  <path
                    d="M25 75 Q80 40 135 75 L130 80 L30 80 Z"
                    fill={(chestType === 'yearly' || chestType === 'diamond') ? '#312e81' : chestType === 'monthly' ? '#92400e' : chestType === 'weekly' ? '#475569' : '#581c87'}
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                  {/* Lock Clasp */}
                  <rect x="72" y="70" width="16" height="20" rx="3" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
                  <circle cx="80" cy="78" r="3" fill="#78350f" />
                  {/* Keyhole Sparkle */}
                  <circle cx="80" cy="78" r="1.5" fill="#fef08a" className="animate-ping" />
                </g>
              ) : (
                <g className="animate-in fade-in zoom-in-75">
                  {/* Opened Lid Flipped Back */}
                  <path
                    d="M25 65 Q80 15 135 65 L130 55 Q80 5 30 55 Z"
                    fill="#92400e"
                    stroke="#fbbf24"
                    strokeWidth="3"
                  />
                  {/* Internal Golden Light Blast */}
                  <polygon points="40,75 80,10 120,75" fill="url(#chestLootGlow)" opacity="0.9" />
                  <ellipse cx="80" cy="75" rx="45" ry="10" fill="#fef08a" />
                </g>
              )}

              <defs>
                <linearGradient id="chestLootGlow" x1="0.5" y1="1" x2="0.5" y2="0">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Idle prompt */}
          {stage === 'idle' && (
            <p className="mt-3 text-xs font-bold text-amber-300 animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>برای باز کردن صندوقچه لمس کنید!</span>
            </p>
          )}

          {stage === 'opening' && (
            <p className="mt-3 text-xs font-black text-amber-400 animate-bounce flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>در حال شکستن قفل صندوقچه...</span>
            </p>
          )}
        </div>

        {/* Revealed Rewards Grid */}
        {stage === 'opened' && (
          <div className="space-y-4 relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="border-t border-slate-700/80 pt-4">
              <h3 className="text-xs font-black text-amber-400 mb-3 flex items-center justify-center gap-1.5">
                <Gift className="w-4 h-4" />
                <span>جوایز به‌دست‌آمده:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rewards.map((rew, idx) => (
                  <div
                    key={rew.id}
                    className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3 animate-loot-rise shadow-md text-right"
                    style={{ animationDelay: `${idx * 120}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-700/80 border border-slate-600 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {rew.icon}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">
                        {rew.title}
                      </div>
                      <div className="text-[10px] text-amber-400 font-medium">
                        {rew.rarity === 'legendary' ? '★ افسانه‌ای' : rew.rarity === 'epic' ? '★ حماسی' : rew.rarity === 'rare' ? 'کمیاب' : 'عادی'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              className="w-full mt-4 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>دریافت و انتقال به کیف پول</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
