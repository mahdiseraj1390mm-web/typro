'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Medal,
  Trophy,
  Star,
  ShieldCheck,
  Flame,
  Zap,
  Crown,
  Sparkles,
  Gift,
  CheckCircle2,
  Lock,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

export interface EliteBadge {
  id: string;
  title: string;
  titleFa: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  rewardXp: number;
  rewardCoins: number;
  progress: number;
  maxProgress: number;
  category: 'speed' | 'accuracy' | 'streak' | 'learning' | 'esports';
  targetHref: string;
  targetLabel: string;
}

export interface TrophyItem {
  id: string;
  title: string;
  season: string;
  rank: 'gold' | 'silver' | 'bronze';
  icon: string;
  date: string;
  description: string;
}

// Initial badges starting completely from 0 without fake progress
export const INITIAL_ELITE_BADGES: EliteBadge[] = [
  {
    id: 'b-1',
    title: 'Speed Journey',
    titleFa: 'سفر سرعت',
    desc: 'شروع مسیر تایپ سرعتی و عبور از مرز ۴۰ کلمه در دقیقه',
    icon: '🚀',
    unlocked: false,
    rewardXp: 50,
    rewardCoins: 20,
    progress: 0,
    maxProgress: 40,
    category: 'speed',
    targetHref: '/typing-test',
    targetLabel: 'آزمون سرعت',
  },
  {
    id: 'b-2',
    title: 'Accuracy Master',
    titleFa: 'استاد دقت',
    desc: 'ثبت دقت ۱۰۰٪ کامل در آزمون استاندارد ده‌انگشتی',
    icon: '🎯',
    unlocked: false,
    rewardXp: 80,
    rewardCoins: 40,
    progress: 0,
    maxProgress: 100,
    category: 'accuracy',
    targetHref: '/typing-test',
    targetLabel: 'آزمون دقت',
  },
  {
    id: 'b-3',
    title: 'Daily Grinder',
    titleFa: 'استمرار بی‌پایان',
    desc: 'تمرین مداوم و روزانه برای ۳۰ روز متوالی بدون وقفه',
    icon: '⚡',
    unlocked: false,
    rewardXp: 150,
    rewardCoins: 100,
    progress: 0,
    maxProgress: 30,
    category: 'streak',
    targetHref: '/lessons',
    targetLabel: 'تمرین روزانه',
  },
  {
    id: 'b-4',
    title: 'Consistency Master',
    titleFa: 'ریتم آهنین',
    desc: 'حفظ دقت و پایداری بالای ۹۵٪ در متون تخصصی',
    icon: '🛡️',
    unlocked: false,
    rewardXp: 90,
    rewardCoins: 50,
    progress: 0,
    maxProgress: 95,
    category: 'accuracy',
    targetHref: '/typing-test',
    targetLabel: 'آزمون استاندارد',
  },
  {
    id: 'b-5',
    title: 'Record Breaker',
    titleFa: 'رکوردشکن',
    desc: 'ارتقا و شکستن ۵ بار رکورد شخصی بالاترین سرعت',
    icon: '💥',
    unlocked: false,
    rewardXp: 120,
    rewardCoins: 80,
    progress: 0,
    maxProgress: 5,
    category: 'speed',
    targetHref: '/typing-test',
    targetLabel: 'شکستن رکورد',
  },
  {
    id: 'b-6',
    title: 'Literary Scribe',
    titleFa: 'ادیب پارسی',
    desc: 'تایپ بی‌نقص ۵ قطعه نثر کهن و اشعار نغز فارسی با دقت ۱۰۰٪',
    icon: '📜',
    unlocked: false,
    rewardXp: 200,
    rewardCoins: 150,
    progress: 0,
    maxProgress: 5,
    category: 'learning',
    targetHref: '/lessons',
    targetLabel: 'تمرین ادبیات',
  },
  {
    id: 'b-7',
    title: 'Esports Champion',
    titleFa: 'فاتح پیست الکترونیک',
    desc: 'کسب ۱۰ پیروزی در مسابقات آنلاین و پیست زنده اتومبیل‌رانی',
    icon: '🏎️',
    unlocked: false,
    rewardXp: 250,
    rewardCoins: 200,
    progress: 0,
    maxProgress: 10,
    category: 'esports',
    targetHref: '/live-race',
    targetLabel: 'ورود به پیست زنده',
  },
  {
    id: 'b-8',
    title: 'Persian Standard',
    titleFa: 'استاد استاندارد ۹۱۴۷',
    desc: 'تسلط کامل بر کلیدهای پرچالش، نیم‌فاصله و نگارش رسمی فارسی',
    icon: '📜',
    unlocked: false,
    rewardXp: 100,
    rewardCoins: 60,
    progress: 0,
    maxProgress: 100,
    category: 'learning',
    targetHref: '/lessons',
    targetLabel: 'دروس استاندارد',
  },
  {
    id: 'b-9',
    title: 'Grandmaster 150',
    titleFa: 'استاد بزرگ ۱۵۰',
    desc: 'رسیدن به سرعت خارق‌العاده ۱۵۰ کلمه در دقیقه در آزمون رسمی',
    icon: '👑',
    unlocked: false,
    rewardXp: 500,
    rewardCoins: 500,
    progress: 0,
    maxProgress: 150,
    category: 'speed',
    targetHref: '/typing-test',
    targetLabel: 'ثبت رکورد ۱۵۰',
  },
];

export default function AchievementsPage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [claimedBadges, setClaimedBadges] = useState<string[]>([]);
  const [badges, setBadges] = useState<EliteBadge[]>(INITIAL_ELITE_BADGES);
  const [trophies, setTrophies] = useState<TrophyItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync and calculate real progress from scratch (starts from 0)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load real trophies if any exist, default to empty
    try {
      const savedTrophies = localStorage.getItem('typro_user_trophies');
      if (savedTrophies) {
        setTrophies(JSON.parse(savedTrophies));
      } else {
        setTrophies([]);
      }
    } catch {
      setTrophies([]);
    }

    // For non-authenticated guests, start strictly at 0 with no claimed badges
    if (!isAuthenticated || !user) {
      setBadges(INITIAL_ELITE_BADGES.map((b) => ({ ...b, progress: 0, unlocked: false })));
      setClaimedBadges([]);
      return;
    }

    // For registered users, read persistent claimed badges
    const userId = user.id || 'usr-reg';
    const claimedKey = `typro_claimed_badges_${userId}`;
    const savedClaimed: string[] = JSON.parse(localStorage.getItem(claimedKey) || '[]');
    setClaimedBadges(savedClaimed);

    // Read real system metrics (no fake numbers)
    const bestWpm = Number(localStorage.getItem('typro_best_wpm') || 0);
    const bestAcc = Number(localStorage.getItem('typro_best_accuracy') || 0);
    const streakDays = Number(localStorage.getItem('typro_streak_days') || 0);
    const consistencyAcc = Number(localStorage.getItem('typro_consistency_accuracy') || 0);
    const recordsBroken = Number(localStorage.getItem('typro_records_broken') || 0);
    const quranLessons = Number(localStorage.getItem('typro_quran_completed') || 0);
    const racesWon = Number(localStorage.getItem('typro_races_won') || 0);
    const persianStandardScore = Number(localStorage.getItem('typro_persian_standard_score') || 0);

    const calculated = INITIAL_ELITE_BADGES.map((b) => {
      let realVal = 0;
      if (b.id === 'b-1') realVal = bestWpm;
      else if (b.id === 'b-2') realVal = bestAcc;
      else if (b.id === 'b-3') realVal = streakDays;
      else if (b.id === 'b-4') realVal = consistencyAcc;
      else if (b.id === 'b-5') realVal = recordsBroken;
      else if (b.id === 'b-6') realVal = quranLessons;
      else if (b.id === 'b-7') realVal = racesWon;
      else if (b.id === 'b-8') realVal = persianStandardScore;
      else if (b.id === 'b-9') realVal = bestWpm;

      const progress = Math.min(b.maxProgress, Math.max(0, realVal));
      const unlocked = progress >= b.maxProgress;

      return {
        ...b,
        progress,
        unlocked,
      };
    });

    setBadges(calculated);
  }, [user, isAuthenticated]);

  // Real reward claim handler
  const handleClaimReward = (badge: EliteBadge) => {
    if (!isAuthenticated || !user) {
      showToast('⚠️ برای دریافت و ذخیره پاداش‌ها در حساب کاربری خود، لطفاً ابتدا ثبت‌نام کنید.');
      return;
    }

    if (claimedBadges.includes(badge.id)) return;

    const userId = user.id || 'usr-reg';
    const claimedKey = `typro_claimed_badges_${userId}`;
    const updated = [...claimedBadges, badge.id];
    setClaimedBadges(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(claimedKey, JSON.stringify(updated));
    }

    // Award coins and XP directly to real account
    const newCoins = (user.coins || 0) + badge.rewardCoins;
    const newXp = (user.xp || 0) + badge.rewardXp;
    if (updateProfile) {
      updateProfile({ coins: newCoins, xp: newXp });
    }

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast(
      `🎉 تبریک! پاداش «${badge.titleFa}» (+${badge.rewardXp} XP و +${badge.rewardCoins} سکه) به حساب شما واریز گردید.`
    );
  };

  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.category === selectedCategory);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Prominent Registration Callout Banner (برای ذخیره این‌ها ثبت‌نام کن) */}
      {!isAuthenticated && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              ⚡
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px]">
                  توجه مهم
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  باید ثبت‌نام کنی تا همه این پیشرفت‌ها ذخیره شود!
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium max-w-2xl">
                پیشرفت در نشان‌های شایستگی نخبگان، شکستن رکوردها و دریافت پاداش‌های سکه و XP تنها با داشتن حساب کاربری ذخیره می‌شوند. بدون ثبت‌نام با بستن مرورگر پیشرفت شما بازنشانی خواهد شد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/login?tab=register"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <span>ثبت‌نام رایگان و ذخیره نشان‌ها</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition"
            >
              ورود به حساب
            </Link>
          </div>
        </div>
      )}

      {/* When user is registered & authenticated */}
      {isAuthenticated && user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-slate-900">
                <span>سیستم نشان‌ها برای شما فعال است:</span>
                <span className="text-emerald-700 font-mono">@{user.username || user.displayName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                تمامی نشان‌ها از صفر آغاز شده و پیشرفت واقعی شما با هر آزمون و مسابقه به صورت خودکار در حسابتان ذخیره می‌شود.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono font-bold text-slate-700 self-end sm:self-auto">
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-amber-600 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>{user.coins.toLocaleString('fa-IR')} سکه</span>
            </span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-blue-600">
              ⭐ {user.xp.toLocaleString('fa-IR')} XP
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            سیستم پاداش و گیمیفیکیشن: تالار افتخارات و نشان‌های نخبگان
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          نشان‌های شایستگی نخبگان (Elite Badges) و تالار افتخارات
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          پیشرفت‌های واقعی خود را از صفر آغاز کنید؛ با ارتقای سرعت، تسلط بر متون استاندارد، استمرار تمرین و مسابقات زنده، نشان‌ها را بازگشایی کرده و پاداش سکه و XP دریافت نمایید.
        </p>
      </div>

      {/* Trophy Cabinet (ویترین جام‌های قهرمانی - بدون داده‌های ساختگی) */}
      <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-slate-100">ویترین تندیس‌ها و جام‌های قهرمانی</h2>
              <span className="text-xs text-slate-400">کاپ‌های اختصاصی تورنمنت‌های ملی و رویدادهای فصلی رسمی</span>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {trophies.length === 0 ? 'در انتظار اولین جام قهرمانی' : `${trophies.length} کاپ قهرمانی`}
          </span>
        </div>

        {trophies.length === 0 ? (
          <div className="p-8 text-center space-y-3 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-amber-400/60 flex items-center justify-center mx-auto text-2xl">
              🏆
            </div>
            <h3 className="font-extrabold text-sm text-slate-200">ویترین جام‌ها در انتظار فتح اولین کاپ شماست</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              تمامی موارد ساختگی قبلی پاکسازی شدند. با پیروزی در تورنمنت‌های رسمی و فینال مسابقات زنده، اولین کاپ و تندیس قهرمانی در این تالار جاودانه خواهد شد.
            </p>
            <div className="pt-2">
              <Link
                href="/live-race"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition"
              >
                <span>ورود به پیست رقابت زنده</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trophies.map((tr) => (
              <div
                key={tr.id}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/40 transition space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <span className="text-5xl block animate-bounce duration-1000">{tr.icon}</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-700/80 text-amber-300 font-mono">
                    {tr.date}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">{tr.title}</h3>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{tr.season}</span>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{tr.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Elite Badges Grid with Filter Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>نشان‌های شایستگی نخبگان (Elite Badges)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              از صفر شروع کنید و با دستیابی به سقف هر نشان، پاداش آنی XP و سکه دریافت نمایید.
            </p>
          </div>

          <span className="text-xs text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-2xl font-bold border border-blue-200">
            {unlockedCount} از {badges.length} نشان کسب‌شده
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: 'همه نشان‌ها' },
            { id: 'speed', label: 'سرعت و شتاب' },
            { id: 'accuracy', label: 'دقت و تمرکز' },
            { id: 'streak', label: 'استمرار روزانه' },
            { id: 'learning', label: 'کتابت و آموزش' },
            { id: 'esports', label: 'مسابقات آنلاین' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={
                'px-4 py-2 rounded-2xl border transition whitespace-nowrap ' +
                (selectedCategory === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const isClaimed = claimedBadges.includes(badge.id);
            const progressPct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

            return (
              <div
                key={badge.id}
                className={
                  'p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ' +
                  (badge.unlocked
                    ? 'bg-linear-to-b from-blue-50/40 via-white to-white border-blue-500/60 shadow-md shadow-blue-500/10'
                    : 'bg-slate-50/70 border-slate-200 opacity-90')
                }
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-4xl block">{badge.icon}</span>
                    <span
                      className={
                        'text-[10px] font-bold px-2.5 py-1 rounded-full ' +
                        (badge.unlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600 flex items-center gap-1')
                      }
                    >
                      {badge.unlocked ? (
                        '✓ بازگشایی شد'
                      ) : (
                        <>
                          <Lock className="w-3 h-3 inline" /> قفل است (از صفر)
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-900">{badge.titleFa}</h3>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold block">
                      {badge.title}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>

                {/* Progress Bar & Real Metric */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>پیشرفت واقعی:</span>
                    <span className="font-mono">
                      {badge.progress} / {badge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={
                        'h-full rounded-full transition-all duration-500 ' +
                        (badge.unlocked ? 'bg-emerald-500' : 'bg-blue-600')
                      }
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Reward Claim Button or Practice Shortcut */}
                <div className="pt-2 space-y-2">
                  {badge.unlocked ? (
                    isClaimed ? (
                      <span className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        پاداش دریافت شد
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimReward(badge)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>دریافت +{badge.rewardXp} XP و +{badge.rewardCoins} سکه</span>
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-center py-2 rounded-xl bg-slate-200/60 text-slate-600 text-xs font-bold font-mono">
                        {progressPct}% تکمیل
                      </span>
                      <Link
                        href={badge.targetHref}
                        className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition flex items-center gap-1"
                        title={badge.targetLabel}
                      >
                        <span>{badge.targetLabel}</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </Link>
                    </div>
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
