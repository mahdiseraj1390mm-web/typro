'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Trophy,
  Sparkles,
  Award,
  Shield,
  ArrowLeft,
  Crown,
  Lock,
  CheckCircle2,
  Gift,
  Coins,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface BattlePassTier {
  level: number;
  freeReward: string;
  freeRewardIcon: string;
  isFreeClaimed: boolean;
  premiumReward: string;
  premiumRewardIcon: string;
  isPremiumClaimed: boolean;
  requiredXp: number;
}

export default function SeasonsPage() {
  const [hasPremiumPass, setHasPremiumPass] = useState(true);
  const [currentSeasonXp, setCurrentSeasonXp] = useState(4850);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentSeason = {
    number: 1,
    title: 'فصل نخست: شکوه کهن پارسی (Persian Glory)',
    theme: 'ادبیات حماسی، شاهنامه فردوسی و پیست‌های باستانی',
    track: 'پیست میدان نقش جهان و کویر یزد',
    daysRemaining: 42,
    exclusiveSkin: 'سیمرغ کهن (Persian Simurgh)',
    totalRewards: 'صندوق‌های طلایی + ۲۰,۰۰۰ سکه + کاپ فصل',
  };

  const [tiers, setTiers] = useState<BattlePassTier[]>([
    { level: 1, freeReward: '۱۰۰ سکه', freeRewardIcon: '🪙', isFreeClaimed: true, premiumReward: 'پوسته نئون رخش', premiumRewardIcon: '🏎️', isPremiumClaimed: true, requiredXp: 500 },
    { level: 2, freeReward: '۵۰ XP بوست', freeRewardIcon: '⚡', isFreeClaimed: true, premiumReward: 'تایتل «پهلوان سرعت»', premiumRewardIcon: '🎖️', isPremiumClaimed: true, requiredXp: 1200 },
    { level: 3, freeReward: 'جعبه شانس نقره‌ای', freeRewardIcon: '🎁', isFreeClaimed: true, premiumReward: '۵۰۰ سکه طلایی', premiumRewardIcon: '💰', isPremiumClaimed: false, requiredXp: 2000 },
    { level: 4, freeReward: '۲۰۰ سکه', freeRewardIcon: '🪙', isFreeClaimed: false, premiumReward: 'افکت نیترو فیروزه‌ای', premiumRewardIcon: '✨', isPremiumClaimed: false, requiredXp: 3200 },
    { level: 5, freeReward: 'نشان برنزی رزم‌آور', freeRewardIcon: '🥉', isFreeClaimed: false, premiumReward: 'پیست شبانه نقش جهان', premiumRewardIcon: '🏁', isPremiumClaimed: false, requiredXp: 4500 },
    { level: 6, freeReward: '۳۰۰ سکه', freeRewardIcon: '🪙', isFreeClaimed: false, premiumReward: 'پوسته متالیک سیمرغ طلایی', premiumRewardIcon: '👑', isPremiumClaimed: false, requiredXp: 6000 },
  ]);

  const handleClaimTier = (level: number, type: 'free' | 'premium') => {
    setTiers(prev => prev.map(t => {
      if (t.level === level) {
        if (type === 'free') return { ...t, isFreeClaimed: true };
        if (type === 'premium') return { ...t, isPremiumClaimed: true };
      }
      return t;
    }));
    confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    showToast("🎉 پاداش مرحله " + level + " بتل‌پس فصلی با موفقیت به حساب شما اضافه شد!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            بخش‌های ۱۰۴ و ۱۰۵ مستند فنی: فصل‌های مسابقاتی و بتل‌پس فصلی (Season Battle Pass)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          فصل‌های مسابقاتی و بتل‌پس (Season Battle Pass)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          هر ۳ ماه یک فصل مسابقاتی با تم روایی، پیست‌های ویژه، پوسته‌های خودرو و جوایز میلیونی آغاز می‌شود.
        </p>
      </div>

      {/* Active Season Highlight Banner (Section 104) */}
      <div className="bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
            فصل اول در حال برگزاری
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>زمان باقیمانده تا پایان فصل: <strong className="text-white font-mono">{currentSeason.daysRemaining} روز</strong></span>
          </div>
        </div>

        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-black">{currentSeason.title}</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            در این فصل، رقابت‌ها با جملات حماسی شاهنامه فردوسی و متون فاخر پارسی انجام می‌شود. با ارتقای XP فصلی، جوایز مسیر بتل‌پس را درو کنید!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">تم پیست و فضاسازی:</span>
            <span className="font-bold text-white mt-1 block">{currentSeason.track}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">پوسته انحصاری فصل:</span>
            <span className="font-bold text-amber-400 mt-1 block">{currentSeason.exclusiveSkin}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 block">پاداش‌های رتبه‌بندی نهایی:</span>
            <span className="font-bold text-emerald-400 mt-1 block">{currentSeason.totalRewards}</span>
          </div>
        </div>
      </div>

      {/* Battle Pass Progression Track (Section 105) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-base sm:text-lg text-slate-900">مسیر جوایز بتل‌پس فصل (Battle Pass Track)</h3>
            </div>
            <p className="text-xs text-slate-500">امتیاز تجربه فصلی شما: <strong className="text-purple-600 font-mono">{currentSeasonXp.toLocaleString('fa-IR')} XP</strong> (سطح ۵ فعال)</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              پاس طلایی پریمیوم فعال است ✓
            </span>
          </div>
        </div>

        {/* Tiers List */}
        <div className="space-y-4">
          {tiers.map((t) => {
            const isUnlocked = currentSeasonXp >= t.requiredXp;

            return (
              <div
                key={t.level}
                className={"p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition " + (
                  isUnlocked ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-100/50 border-slate-200/60 opacity-70'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={"w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-sm " + (
                    isUnlocked ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  )}>
                    L{t.level}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-700 block">سطح {t.level} بتل‌پس</span>
                    <span className="text-[10px] text-slate-400 font-mono">نیاز به {t.requiredXp} XP فصلی</span>
                  </div>
                </div>

                {/* Free Reward */}
                <div className="flex items-center justify-between md:justify-start gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.freeRewardIcon}</span>
                    <div>
                      <span className="text-[10px] text-slate-400 block">جایزه رایگان</span>
                      <span className="font-bold text-slate-800">{t.freeReward}</span>
                    </div>
                  </div>
                  {isUnlocked ? (
                    t.isFreeClaimed ? (
                      <span className="text-[10px] text-emerald-600 font-bold">دریافت شد ✓</span>
                    ) : (
                      <button
                        onClick={() => handleClaimTier(t.level, 'free')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                      >
                        دریافت
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Lock className="w-3 h-3" /> قفل</span>
                  )}
                </div>

                {/* Premium Reward */}
                <div className="flex items-center justify-between md:justify-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.premiumRewardIcon}</span>
                    <div>
                      <span className="text-[10px] text-amber-700 block font-bold">جایزه پریمیوم</span>
                      <span className="font-bold text-slate-900">{t.premiumReward}</span>
                    </div>
                  </div>
                  {isUnlocked ? (
                    t.isPremiumClaimed ? (
                      <span className="text-[10px] text-emerald-600 font-bold">دریافت شد ✓</span>
                    ) : (
                      <button
                        onClick={() => handleClaimTier(t.level, 'premium')}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs"
                      >
                        دریافت طلایی
                      </button>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Lock className="w-3 h-3" /> قفل</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
