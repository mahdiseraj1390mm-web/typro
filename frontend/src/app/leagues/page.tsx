'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Shield, Trophy, Award, ChevronLeft, ArrowUpRight, Crown, 
  Sparkles, TrendingUp, Info, Zap, X, Flame, CheckCircle2, ShieldAlert, Swords, Lock, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LeagueTier {
  id: string;
  name: string;
  faName: string;
  minWpm: number;
  maxWpm: number;
  color: string;
  badge: string;
  perk: string;
  skinReward: string;
  coinBonus: string;
  isCurrent?: boolean;
  activePlayers: number;
}

export default function LeaguesPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedTier, setSelectedTier] = useState<LeagueTier | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userWpm, setUserWpm] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = Number(localStorage.getItem('typro_best_wpm') || 0);
    setUserWpm(saved);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const userLeague = useMemo(() => {
    if (!isAuthenticated) {
      return {
        isRanked: false,
        reason: 'not_logged_in',
        currentLeague: 'نامشخص (نیاز به ثبت‌نام)',
        badge: '🔒',
        currentWpm: 0,
        currentElo: 0,
        seasonWins: 0,
        seasonLosses: 0,
        percentProgress: 0,
        wpmRemaining: 0,
        nextLeague: 'برنز',
        demotionShield: 0,
        tierId: '',
      };
    }
    if (userWpm <= 0) {
      return {
        isRanked: false,
        reason: 'no_tests_yet',
        currentLeague: 'در انتظار تعیین سطح (بدون رکورد)',
        badge: '⏳',
        currentWpm: 0,
        currentElo: 1000,
        seasonWins: 0,
        seasonLosses: 0,
        percentProgress: 0,
        wpmRemaining: 20,
        nextLeague: 'برنز',
        demotionShield: 3,
        tierId: '',
      };
    }

    // Determine real tier
    let tierId = 'bronze';
    let leagueName = 'Bronze (برنز)';
    let badge = '🥉';
    let minW = 20;
    let maxW = 35;
    let nextL = 'نقره';

    if (userWpm >= 130) {
      tierId = 'legend';
      leagueName = 'Legend (افسانه)';
      badge = '👑';
      minW = 130;
      maxW = 200;
      nextL = 'بالاترین سطح';
    } else if (userWpm >= 110) {
      tierId = 'grandmaster';
      leagueName = 'Grandmaster (گرند مستر)';
      badge = '🔮';
      minW = 110;
      maxW = 130;
      nextL = 'افسانه';
    } else if (userWpm >= 95) {
      tierId = 'master';
      leagueName = 'Master (مستر)';
      badge = '⚡';
      minW = 95;
      maxW = 110;
      nextL = 'گرند مستر';
    } else if (userWpm >= 80) {
      tierId = 'diamond';
      leagueName = 'Diamond (الماس)';
      badge = '💠';
      minW = 80;
      maxW = 95;
      nextL = 'مستر';
    } else if (userWpm >= 65) {
      tierId = 'platinum';
      leagueName = 'Platinum (پلاتینیوم)';
      badge = '💎';
      minW = 65;
      maxW = 80;
      nextL = 'الماس';
    } else if (userWpm >= 50) {
      tierId = 'gold';
      leagueName = 'Gold (طلا)';
      badge = '🥇';
      minW = 50;
      maxW = 65;
      nextL = 'پلاتینیوم';
    } else if (userWpm >= 35) {
      tierId = 'silver';
      leagueName = 'Silver (نقره)';
      badge = '🥈';
      minW = 35;
      maxW = 50;
      nextL = 'طلا';
    }

    const wpmRemaining = Math.max(1, maxW - userWpm);
    const progress = Math.min(100, Math.max(5, Math.round(((userWpm - minW) / (maxW - minW)) * 100)));
    const elo = 1000 + Math.round(userWpm * 12);

    return {
      isRanked: true,
      tierId,
      currentLeague: leagueName,
      badge,
      currentWpm: userWpm,
      currentElo: elo,
      seasonWins: Math.max(1, Math.floor(userWpm / 5)),
      seasonLosses: Math.max(0, Math.floor(userWpm / 15)),
      percentProgress: progress,
      wpmRemaining,
      nextLeague: nextL,
      demotionShield: 3,
      minW,
      maxW,
    };
  }, [isAuthenticated, userWpm]);

  const leagues: LeagueTier[] = [
    { 
      id: 'bronze', 
      name: 'Bronze', 
      faName: 'برنز', 
      minWpm: 20, 
      maxWpm: 35, 
      color: 'from-amber-800 to-amber-950', 
      badge: '🥉', 
      perk: 'ورود به مسابقات لابی عمومی', 
      skinReward: 'پوسته برنزی استارتر', 
      coinBonus: '۵۰ سکه روزانه',
      activePlayers: 4200 
    },
    { 
      id: 'silver', 
      name: 'Silver', 
      faName: 'نقره', 
      minWpm: 35, 
      maxWpm: 50, 
      color: 'from-slate-400 to-slate-600', 
      badge: '🥈', 
      perk: 'بازگشایی پیست‌های بارانی و شهری', 
      skinReward: 'پوسته نقره‌ای توربو', 
      coinBonus: '۱۰۰ سکه روزانه',
      activePlayers: 6800 
    },
    { 
      id: 'gold', 
      name: 'Gold', 
      faName: 'طلا', 
      minWpm: 50, 
      maxWpm: 65, 
      color: 'from-amber-400 to-amber-600', 
      badge: '🥇', 
      perk: 'مجوز حضور در مسابقات و رالی‌های هفتگی', 
      skinReward: 'پوسته طلایی شوماخر', 
      coinBonus: '۲۰۰ سکه روزانه',
      activePlayers: 5100 
    },
    { 
      id: 'platinum', 
      name: 'Platinum', 
      faName: 'پلاتینیوم', 
      minWpm: 65, 
      maxWpm: 80, 
      color: 'from-cyan-500 to-blue-700', 
      badge: '💎', 
      perk: 'پوسته اختصاصی سایبر فانتوم و نشان پلاتین', 
      skinReward: 'سایبر فانتوم نئونی', 
      coinBonus: '۴۰۰ سکه روزانه',
      activePlayers: 2800 
    },
    { 
      id: 'diamond', 
      name: 'Diamond', 
      faName: 'الماس', 
      minWpm: 80, 
      maxWpm: 95, 
      color: 'from-indigo-500 to-purple-700', 
      badge: '💠', 
      perk: 'ضریب ۱.۵ برابری کسب XP و پاداش رنکد', 
      skinReward: 'الماس بنفش کریستالی', 
      coinBonus: '۸۰۰ سکه روزانه',
      activePlayers: 1250 
    },
    { 
      id: 'master', 
      name: 'Master', 
      faName: 'استاد', 
      minWpm: 95, 
      maxWpm: 110, 
      color: 'from-rose-500 to-red-700', 
      badge: '⚡', 
      perk: 'دعوت به تورنمنت‌های فصلی با جوایز نقدی', 
      skinReward: 'صاعقه سرخ مسترز', 
      coinBonus: '۱,۵۰۰ سکه روزانه',
      activePlayers: 480 
    },
    { 
      id: 'grandmaster', 
      name: 'Grandmaster', 
      faName: 'گرند مستر', 
      minWpm: 110, 
      maxWpm: 130, 
      color: 'from-violet-600 to-purple-900', 
      badge: '🔮', 
      perk: 'تندیس دیجیتال در تالار مشاهیر و نشان ویژه', 
      skinReward: 'سفینه کیهانی ابسیدین', 
      coinBonus: '۳,۰۰۰ سکه روزانه',
      activePlayers: 120 
    },
    { 
      id: 'legend', 
      name: 'Legend', 
      faName: 'افسانه', 
      minWpm: 130, 
      maxWpm: 200, 
      color: 'from-amber-300 via-yellow-400 to-amber-600', 
      badge: '👑', 
      perk: 'تخفیف ۱۰۰٪ تجهیزات و ثبت ابدی نام در تاریخ تایپ کشور', 
      skinReward: 'تاج شاهنشاهی پارسی زرین', 
      coinBonus: '۱۰,۰۰۰ سکه روزانه',
      activePlayers: 25 
    },
  ];

  const handleEnterRanked = () => {
    showToast('🚗 در حال اتصال به صف رقابتی رنکد لیگ پلاتین (Ranked Matchmaking)...');
    setTimeout(() => {
      window.location.href = '/live-race';
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Prominent Registration Callout Banner */}
      {!isAuthenticated && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              🏆
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px]">
                  توجه مهم
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  برای ورود به لیگ‌ها و ذخیره رتبه باید ثبت‌نام کنید!
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium max-w-2xl">
                جایگاه در رده‌بندی لیگ‌های هشت‌گانه تایپ کشور و محاسبه پاداش‌های فصلی تنها برای کاربران عضو که دارای رکوردهای رسمی آزمون هستند ذخیره و ثبت می‌شود.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/login?tab=register"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition"
            >
              ثبت‌نام رایگان و ورود به لیگ
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

      {/* Tier Details Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedTier.badge}</span>
                <h3 className="font-black text-slate-900 text-base">
                  لیگ {selectedTier.faName} ({selectedTier.name})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTier(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">محدوده سرعت</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {selectedTier.minWpm} الی {selectedTier.maxWpm} WPM
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">تایپیست‌های فعال</span>
                  <span className="font-mono font-black text-blue-600 text-sm">
                    {selectedTier.activePlayers.toLocaleString('fa-IR')} نفر
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                <span className="font-bold text-blue-900 block text-xs">مزیت اختصاصی رده:</span>
                <p className="text-blue-700 text-xs leading-relaxed">{selectedTier.perk}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">پوسته خودرو پایان فصل</span>
                  <span className="font-bold text-slate-800">{selectedTier.skinReward}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">پاداش استمرار روزانه</span>
                  <span className="font-bold text-amber-600">{selectedTier.coinBonus}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                قانون بازنشانی فصل: در پایان هر فصل ۲ ماهه، امتیاز Elo تا ۱ پله متعادل‌سازی می‌شود تا رقابت همواره پویا بماند.
              </div>
            </div>

            <button
              onClick={() => setSelectedTier(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سیستم رده‌بندی رقابتی ورزش‌های الکترونیک (Esports Competitive Ranking)</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            لیگ‌های هشت‌گانه تایپرو (Leagues & Tiers)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            رتبه‌بندی ورزشکاران بر اساس سرعت واکنش عضلانی، پایداری دقت و پیروزی در مسابقات رنکد زنده (بند ۱۰۳ الی ۱۰۵).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleEnterRanked}
            className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>ورود به صف مسابقه رنکد</span>
          </button>
        </div>
      </div>

      {/* Current User League Card */}
      {!isAuthenticated ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-md">
                🔒
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300">وضعیت رتبه کاربری</span>
                <h2 className="text-xl sm:text-2xl font-black">هنوز وارد سیستم نشده‌اید (نامشخص)</h2>
                <p className="text-xs text-slate-300 mt-1">
                  جهت محاسبه رتبه، ثبت در لیگ متناسب و ذخیره امتیازهای مسابقه، لطفاً ابتدا حساب کاربری خود را ایجاد نمایید.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shrink-0 self-start sm:self-center"
            >
              ورود به حساب کاربری
            </Link>
          </div>
        </div>
      ) : userLeague.reason === 'no_tests_yet' ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-md">
                ⏳
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300">لیگ در انتظار آزمون تعیین سطح</span>
                <h2 className="text-xl sm:text-2xl font-black">هنوز در هیچ آزمون تایپی شرکت نکرده‌اید!</h2>
                <p className="text-xs text-slate-300 mt-1">
                  حساب شما فعال است (@{user?.username || 'کاربر'})؛ با اولین تست تایپ، سرعت شما سنجیده شده و در لیگ متناسب قرار می‌گیرید.
                </p>
              </div>
            </div>
            <Link
              href="/typing-test"
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition shadow-md shrink-0 self-start sm:self-center"
            >
              شرکت در اولین تست تایپ
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/40 border border-cyan-400/40 flex items-center justify-center text-3xl shadow-md">
                {userLeague.badge}
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-300">لیگ فعال شما در فصل جاری</span>
                <h2 className="text-xl sm:text-2xl font-black">{userLeague.currentLeague}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                  <span>امتیاز ریتینگ: <strong className="text-white font-mono">{userLeague.currentElo} Elo</strong></span>
                  <span>•</span>
                  <span>برد/باخت: <strong className="text-emerald-400 font-mono">{userLeague.seasonWins}W</strong> / <strong className="text-rose-400 font-mono">{userLeague.seasonLosses}L</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right sm:text-left space-y-1">
              <span className="text-xs text-slate-300">فاصله تا ارتقا به {userLeague.nextLeague}:</span>
              <div className="text-lg font-black text-emerald-400 font-mono">فقط {userLeague.wpmRemaining} کلمه در دقیقه!</div>
              <span className="text-[11px] text-cyan-200 block">
                سپر محافظت از سقوط: {userLeague.demotionShield} بازی مصونیت
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>حد نصاب ورود: {userLeague.minW} WPM</span>
              <span className="font-bold text-cyan-300">سرعت تاییدشده شما: {userLeague.currentWpm} WPM</span>
              <span>سقف رده: {userLeague.maxW} WPM</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${userLeague.percentProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Leagues Tier Grid (Section 103) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leagues.map((league) => {
          const isCurrentTier = Boolean(userLeague.isRanked && userLeague.tierId === league.id);
          return (
            <div
              key={league.id}
              className={`bg-white rounded-3xl p-6 border-2 transition-all space-y-4 flex flex-col justify-between ${
                isCurrentTier
                  ? 'border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 relative'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{league.badge}</span>
                  {isCurrentTier && (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                      لیگ شما
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {league.faName} ({league.name})
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                    {league.minWpm} الی {league.maxWpm} WPM
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">پاداش ویژه:</span>
                  <p className="line-clamp-2">{league.perk}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTier(league)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>مشاهده جزئیات رده</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
