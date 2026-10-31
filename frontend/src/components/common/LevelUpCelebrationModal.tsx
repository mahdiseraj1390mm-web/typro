'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import GamingLevelBadge from '@/components/common/GamingLevelBadge';
import { getBadgeStageForLevel, getFullLevelProgress } from '@/lib/levelTiers';
import { Sparkles, Trophy, Star, ArrowRight, X } from 'lucide-react';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  oldLevel?: number;
  earnedXp?: number;
}

export default function LevelUpCelebrationModal({
  isOpen,
  onClose,
  newLevel,
  oldLevel,
  earnedXp,
}: LevelUpCelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#38BDF8', '#10B981', '#EC4899', '#8B5CF6'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 250);
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stage = getBadgeStageForLevel(newLevel);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)] max-w-sm w-full p-6 text-center space-y-5 animate-in zoom-in-90 duration-300 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black shadow-inner animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ارتقای سطح و لول جدید!</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Big 3D Badge with Pulse */}
        <div className="relative py-4 flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full border-2 border-amber-400/40 animate-ping pointer-events-none" />
          <GamingLevelBadge level={newLevel} size="xl" showStars={true} interactive={false} />
        </div>

        {/* Level Heading */}
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            لول {newLevel.toLocaleString('fa-IR')}
          </h3>
          <p className="text-xs font-bold text-slate-300" style={{ color: stage.color }}>
            {stage.nameFa}
          </p>
          {earnedXp && (
            <p className="text-[11px] font-mono text-emerald-400 font-bold">
              +{earnedXp.toLocaleString('fa-IR')} XP کسب شد
            </p>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          تبریک! با پیشرفت در تایپرو، نشان سه‌بعدی و قدرت رتبه شما ارتقا یافت.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/30 cursor-pointer"
        >
          فوق‌العاده است، ادامه بده!
        </button>
      </div>
    </div>
  );
}
