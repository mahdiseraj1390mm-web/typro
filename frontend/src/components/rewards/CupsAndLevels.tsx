'use client';

import React from 'react';
import { 
  Trophy, Award, Star, Zap, ShieldCheck, ChevronLeft, 
  Crown, Sparkles, Flame, CheckCircle2, Lock 
} from 'lucide-react';

export interface CupLeague {
  id: string;
  nameFa: string;
  nameEn: string;
  minCups: number;
  maxCups: number;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  perks: string[];
}

export const CUP_LEAGUES: CupLeague[] = [
  {
    id: 'bronze',
    nameFa: 'لیگ برنز',
    nameEn: 'Bronze League',
    minCups: 0,
    maxCups: 399,
    icon: '🥉',
    color: '#b45309',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    perks: ['دسترسی به اتاق‌های تمرینی', 'صندوقچه چوبی روزانه', 'پوسته‌های پایه'],
  },
  {
    id: 'silver',
    nameFa: 'لیگ نقره‌ای',
    nameEn: 'Silver League',
    minCups: 400,
    maxCups: 799,
    icon: '🥈',
    color: '#64748b',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    perks: ['باز شدن مسابقات رنک‌دار', '+۱۰٪ سکه بیشتر در پیروزی‌ها', 'صندوقچه نقره‌ای هفتگی'],
  },
  {
    id: 'gold',
    nameFa: 'لیگ طلایی',
    nameEn: 'Gold League',
    minCups: 800,
    maxCups: 1199,
    icon: '🥇',
    color: '#d97706',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    perks: ['دسترسی به سوپراسپرت‌های توربو', '+۲۵٪ امتیاز تجربه XP', 'نشان طلایی در پروفایل'],
  },
  {
    id: 'platinum',
    nameFa: 'لیگ پلاتینیوم',
    nameEn: 'Platinum League',
    minCups: 1200,
    maxCups: 1599,
    icon: '💠',
    color: '#0284c7',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    perks: ['ورود به تورنمنت‌های هفتگی با جایزه نقدی', 'آتش اگزوز اختصاصی', 'محافظت کاپ خودکار'],
  },
  {
    id: 'diamond',
    nameFa: 'لیگ الماس',
    nameEn: 'Diamond League',
    minCups: 1600,
    maxCups: 1999,
    icon: '💎',
    color: '#9333ea',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    perks: ['صندوقچه الماس قهرمانان', 'پوسته‌های متحرک افسانه‌ای', 'دعوت به لیگ برتر کشوری'],
  },
  {
    id: 'master',
    nameFa: 'لیگ اسطوره‌ها (Master)',
    nameEn: 'Grandmaster League',
    minCups: 2000,
    maxCups: 9999,
    icon: '👑',
    color: '#e11d48',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    perks: ['تالار افتخارات دائمی تایپرو', 'کاپ طلایی اختصاصی ۳ بعدی', 'بدون محدودیت سرعت'],
  },
];

interface CupsAndLevelsProps {
  currentCups?: number;
  currentLevel?: number;
  currentXp?: number;
  seasonDaysLeft?: number;
}

export default function CupsAndLevels({
  currentCups = 950,
  currentLevel = 28,
  currentXp = 3820,
  seasonDaysLeft = 11,
}: CupsAndLevelsProps) {
  // Current Cup League
  const activeLeague =
    CUP_LEAGUES.find((l) => currentCups >= l.minCups && currentCups <= l.maxCups) ||
    CUP_LEAGUES[2];

  // Next League
  const nextLeagueIndex = CUP_LEAGUES.findIndex((l) => l.id === activeLeague.id) + 1;
  const nextLeague = nextLeagueIndex < CUP_LEAGUES.length ? CUP_LEAGUES[nextLeagueIndex] : null;

  const cupsToNext = nextLeague ? nextLeague.minCups - currentCups : 0;
  const leagueProgress = nextLeague
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((currentCups - activeLeague.minCups) /
              (nextLeague.minCups - activeLeague.minCups)) *
              100
          )
        )
      )
    : 100;

  // Level Math: 1000 XP per level
  const xpInCurrentLevel = currentXp % 1000;
  const xpNeeded = 1000;
  const levelProgress = Math.round((xpInCurrentLevel / xpNeeded) * 100);

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* 1. Top Showcase: Level Bar & Cup Tier Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Level Progression Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {currentLevel}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">سطح کاربری (LEVEL)</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  تایپیست حرفه‌ای پیست مسابقه
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{currentXp.toLocaleString('fa-IR')} XP مجموع</span>
            </span>
          </div>

          {/* XP Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">پیشرفت به لول {currentLevel + 1}:</span>
              <span className="font-mono font-bold text-slate-800">
                {xpInCurrentLevel} / {xpNeeded} XP ({levelProgress}٪)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Next Level Unlock Feature */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>جایزه لول {currentLevel + 1}:</span>
              <strong className="text-slate-900">+۲۵۰ سکه و نشان شتاب توربو</strong>
            </div>
            <span className="text-[10px] text-blue-600 font-bold">{xpNeeded - xpInCurrentLevel} XP تا ارتقا</span>
          </div>
        </div>

        {/* Competitive Cup League Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl filter drop-shadow-md">{activeLeague.icon}</span>
              <div>
                <span className="text-[10px] text-amber-600 font-bold block">جام و کاپ رقابتی (CUP)</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeLeague.nameFa}
                </h3>
              </div>
            </div>

            <div className="text-left">
              <div className="text-2xl font-black font-mono text-amber-600 flex items-center gap-1 justify-end">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{currentCups.toLocaleString('fa-IR')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">کاپ قهرمانی فصل</span>
            </div>
          </div>

          {/* Cup Progress to next League */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {nextLeague ? `تا صعود به ${nextLeague.nameFa}:` : 'رسیدن به بالاترین لیگ!'}
              </span>
              <span className="font-mono font-bold text-slate-800">
                {nextLeague ? `${cupsToNext} کاپ باقی‌مانده` : 'اسطوره مسابقات'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${leagueProgress}%` }}
              />
            </div>
          </div>

          {/* Season Countdown */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>پایان فصل جاری رقابت‌ها:</span>
              <strong className="font-mono">{seasonDaysLeft} روز</strong>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">جوایز فصل در پایان اهدا می‌شود</span>
          </div>
        </div>
      </div>

      {/* 2. Cup League Ladder (پلکان لیگ‌ها و جوایز) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-sm text-slate-900">پلکان لیگ‌های رقابتی کاپ تایپرو</h3>
          </div>
          <span className="text-xs text-slate-400">کاپ با پیروزی در مسابقه زنده افزایش می‌یابد</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CUP_LEAGUES.map((league) => {
            const isCurrent = league.id === activeLeague.id;
            const isPassed = currentCups > league.maxCups;

            return (
              <div
                key={league.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? `${league.bgColor} ${league.borderColor} ring-2 ring-amber-400 shadow-sm`
                    : isPassed
                    ? 'bg-slate-50 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{league.icon}</span>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{league.nameFa}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {league.minCups} تا {league.maxCups === 9999 ? '+۲۰۰۰' : league.maxCups} کاپ
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black animate-pulse">
                      لیگ شما
                    </span>
                  )}
                  {isPassed && (
                    <span className="text-xs text-emerald-600 font-bold">✓ فتح‌شده</span>
                  )}
                  {!isCurrent && !isPassed && (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                {/* League Perks */}
                <ul className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-200/50 pt-2">
                  {league.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
