'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import TypingEngine from '@/components/typing/TypingEngine';
import TypingGameArena from '@/components/games/TypingGameArena';
import SpeedometerGauge from '@/components/common/SpeedometerGauge';
import CurrencyHUD, { CoinBadge, DiamondBadge } from '@/components/common/CurrencyHUD';
import { ALL_LESSONS } from '@/data/lessonsData';
import { LessonItem, LessonLevel, LanguageMode, TypingMetrics } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award,
  Zap,
  RotateCcw,
  Search,
  Filter,
  ListOrdered,
  Layers,
  ArrowRight,
  Target,
  Keyboard,
  Play,
  X,
  Lock,
  Unlock,
  Crown,
  Gamepad2,
  Activity,
  Flame,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Compass,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MiniGameCheckpoint {
  id: string;
  afterLessonIndex: number;
  title: string;
  description: string;
  gameMode: string;
  icon: string;
  color: string;
  badge: string;
}

const MINI_GAME_CHECKPOINTS: MiniGameCheckpoint[] = [
  {
    id: 'game-1',
    afterLessonIndex: 3,
    title: 'چالش مهارتی ۱: باران کلمات و سقوط شهاب‌سنگ',
    description: 'تایپ سریع کلمات در حال سقوط قبل از برخورد به سطح پیست. آزمون بازتاب و تسلط بر کلیدهای پایه.',
    gameMode: 'wordfall',
    icon: '☄️',
    color: 'from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/40 text-amber-900',
    badge: 'چالش مهارتی ۳ درس اول',
  },
  {
    id: 'game-2',
    afterLessonIndex: 6,
    title: 'چالش مهارتی ۲: کورس شتاب موشک سرعتی',
    description: 'رقابت نفس‌گیر با حریف مجازی از طریق تایپ واژگان طلایی جهت سبقت گرفتن در پیست فضایی.',
    gameMode: 'chaser',
    icon: '🚀',
    color: 'from-blue-500/20 via-sky-500/20 to-indigo-500/20 border-blue-500/40 text-blue-900',
    badge: 'چالش مهارتی ۶ درس اول',
  },
  {
    id: 'game-3',
    afterLessonIndex: 9,
    title: 'چالش مهارتی ۳: پدافند و دفاع از پایگاه تایپ',
    description: 'شلیک به اهداف نزدیک‌شونده در ۳ لاین موازی با تایپ دقیق کلمات. تقویت تمرکز چندجهته.',
    gameMode: 'defense',
    icon: '🛡️',
    color: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/40 text-emerald-900',
    badge: 'چالش مهارتی ۹ درس اول',
  },
  {
    id: 'game-4',
    afterLessonIndex: 12,
    title: 'چالش مهارتی ۴: ترکاندن بالن‌های واژگان معلق',
    description: 'شناسایی و انهدام بالن‌های شناور با تایپ واژگان پربسامد قبل از پرواز به آسمان.',
    gameMode: 'balloon',
    icon: '🎈',
    color: 'from-purple-500/20 via-pink-500/20 to-rose-500/20 border-purple-500/40 text-purple-900',
    badge: 'چالش مهارتی ۱۲ درس اول',
  },
  {
    id: 'game-5',
    afterLessonIndex: 15,
    title: 'چالش مهارتی ۵: خنثی‌سازی بمب ساعتی C4',
    description: 'تایپ معکوس و برش سیم‌های انفجاری با تمرکز ۱۰۰٪ قبل از اتمام ثانیه‌شمار دیجیتال.',
    gameMode: 'bomb',
    icon: '💣',
    color: 'from-red-500/20 via-rose-500/20 to-pink-500/20 border-red-500/40 text-red-900',
    badge: 'چالش مهارتی ۱۵ درس اول',
  },
  {
    id: 'game-6',
    afterLessonIndex: 18,
    title: 'چالش مهارتی ۶: معدن‌کاوی و استخراج الماس',
    description: 'شکستن لایه‌های صخره با ضربات کلنگ تایپ برای استخراج طلا و الماس درخشان.',
    gameMode: 'mining',
    icon: '⛏️',
    color: 'from-cyan-500/20 via-blue-500/20 to-sky-500/20 border-cyan-500/40 text-cyan-900',
    badge: 'چالش مهارتی ۱۸ درس اول',
  },
];

export default function LessonsPage() {
  const { user, isAuthenticated } = useAuth();

  // Primary View Controller: DEFAULT IS 'catalog' as requested!
  const [currentView, setCurrentView] = useState<'catalog' | 'practice'>('catalog');

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageMode>('fa');
  const [activeLessonId, setActiveLessonId] = useState<string>('fa-f-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogLevelFilter, setCatalogLevelFilter] = useState<'all' | LessonLevel>('all');
  const [progressTab, setProgressTab] = useState<'today' | 'week' | 'month' | 'year'>('today');

  // Subscription modal state
  const [subscriptionModalLesson, setSubscriptionModalLesson] = useState<LessonItem | null>(null);

  // Active Mini-Game Checkpoint Modal state (No input box, starts with Space)
  const [activeMiniGameModal, setActiveMiniGameModal] = useState<MiniGameCheckpoint | null>(null);

  // User economy balance (starts at 0)
  const [userCoins, setUserCoins] = useState<number>(() => {
    if (!user) return 0;
    if (user.coins !== undefined) return user.coins;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_coins');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [userDiamonds, setUserDiamonds] = useState<number>(() => {
    if (!user) return 0;
    if (user.diamonds !== undefined) return user.diamonds;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_diamonds');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserCoins(0);
      setUserDiamonds(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_user_coins', '0');
        localStorage.setItem('typro_user_diamonds', '0');
      }
    } else {
      setUserCoins(user.coins ?? 0);
      setUserDiamonds(user.diamonds ?? 0);
    }
  }, [user, isAuthenticated]);

  // User subscription status
  const isSubscribed = useMemo(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return true;
    if (user?.isSubscribed || user?.isDirectAdmin) return true;
    if (user?.subscription && user.subscription !== 'رایگان' && user.subscription !== 'free') return true;
    if (user?.subscriptionPlan && user.subscriptionPlan !== 'رایگان' && user.subscriptionPlan !== 'free') return true;
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('typro_user_is_subscribed') === 'true' ||
        localStorage.getItem('typro_user_is_direct_admin') === 'true'
      );
    }
    return false;
  }, [user]);

  // 5-Star Ratings Persisted per lesson (100% real, empty by default)
  const [lessonStars, setLessonStars] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('typro_lesson_stars_v2');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Real Lesson Telemetry History Persisted
  interface LessonTelemetryRecord {
    id: number;
    date: string;
    lessonId: string;
    wpm: number;
    accuracy: number;
    elapsedSeconds: number;
    wordsTyped: number;
    xp: number;
    coins: number;
    stars: number;
  }

  const [telemetryRecords, setTelemetryRecords] = useState<LessonTelemetryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('typro_lesson_telemetry_history');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Lesson Completion State
  const [completedLesson, setCompletedLesson] = useState<{
    lessonId: string;
    stars: number;
    wpm: number;
    accuracy: number;
    rewardXp: number;
    rewardCoins: number;
  } | null>(null);

  // Live Metrics during active practice
  const [practiceLiveWpm, setPracticeLiveWpm] = useState<number>(0);
  const [practiceLiveAccuracy, setPracticeLiveAccuracy] = useState<number>(100);

  // Active Lesson lookup
  const activeLesson = useMemo(() => {
    return (
      ALL_LESSONS.find((l) => l.id === activeLessonId) ||
      ALL_LESSONS.find((l) => l.language === selectedLanguage) ||
      ALL_LESSONS[0]
    );
  }, [activeLessonId, selectedLanguage]);

  // Lessons divided by level for current language
  const foundationLessons = useMemo(() => {
    return ALL_LESSONS.filter((l) => l.language === selectedLanguage && l.level === 'foundation');
  }, [selectedLanguage]);

  const beginnerLessons = useMemo(() => {
    return ALL_LESSONS.filter((l) => l.language === selectedLanguage && l.level === 'beginner');
  }, [selectedLanguage]);

  const advancedLessons = useMemo(() => {
    return ALL_LESSONS.filter((l) => l.language === selectedLanguage && l.level === 'advanced');
  }, [selectedLanguage]);

  // Total stars calculated (100% real)
  const totalStarsEarned = useMemo(() => {
    return Object.values(lessonStars).reduce((sum, val) => sum + val, 0);
  }, [lessonStars]);

  // Dynamic Real Telemetry computation
  const filteredTelemetry = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = now.getTime() - 365 * 24 * 60 * 60 * 1000;

    return telemetryRecords.filter((r) => {
      const recordTime = new Date(r.date).getTime();
      if (progressTab === 'today') return recordTime >= startOfDay;
      if (progressTab === 'week') return recordTime >= oneWeekAgo;
      if (progressTab === 'month') return recordTime >= oneMonthAgo;
      if (progressTab === 'year') return recordTime >= oneYearAgo;
      return true;
    });
  }, [telemetryRecords, progressTab]);

  const telemetryStats = useMemo(() => {
    if (filteredTelemetry.length === 0) return null;
    const totalSeconds = filteredTelemetry.reduce((sum, r) => sum + r.elapsedSeconds, 0);
    const totalWords = filteredTelemetry.reduce((sum, r) => sum + r.wordsTyped, 0);
    const totalXp = filteredTelemetry.reduce((sum, r) => sum + r.xp, 0);
    const totalCoins = filteredTelemetry.reduce((sum, r) => sum + r.coins, 0);
    const totalStars = filteredTelemetry.reduce((sum, r) => sum + r.stars, 0);
    const avgWpm = Math.round(filteredTelemetry.reduce((sum, r) => sum + r.wpm, 0) / filteredTelemetry.length);
    const avgAccuracy = (filteredTelemetry.reduce((sum, r) => sum + r.accuracy, 0) / filteredTelemetry.length).toFixed(1);
    const peakWpm = Math.max(...filteredTelemetry.map((r) => r.wpm));
    const dates = Array.from(new Set(telemetryRecords.map((r) => new Date(r.date).toDateString())));
    const streakDays = dates.length;

    return {
      totalMinutes: Math.round(totalSeconds / 60) || (totalSeconds > 0 ? 1 : 0),
      totalHours: (totalSeconds / 3600).toFixed(1),
      lessonsCount: filteredTelemetry.length,
      totalWords,
      totalXp,
      totalCoins,
      totalStars,
      avgWpm,
      avgAccuracy,
      peakWpm,
      streakDays,
    };
  }, [filteredTelemetry, telemetryRecords]);

  // Calculate 5-star rating dynamically based on performance
  const calculate5Stars = (metrics: TypingMetrics, targetWpm: number, targetAcc: number): number => {
    let stars = 1; // Completed
    if (metrics.accuracy >= targetAcc) stars++; // Base accuracy target reached
    if (metrics.netWpm >= targetWpm) stars++; // Base speed target reached
    if (metrics.accuracy >= 98 && metrics.netWpm >= targetWpm * 1.1) stars++; // High accuracy & +10% speed
    if (metrics.accuracy === 100 && metrics.netWpm >= targetWpm * 1.25) stars++; // Perfect 100% accuracy & master speed
    return Math.min(5, Math.max(1, stars));
  };

  const handleLessonComplete = (metrics: TypingMetrics) => {
    const stars = calculate5Stars(metrics, activeLesson.targetWpm, activeLesson.targetAccuracy);

    const updatedStars = {
      ...lessonStars,
      [activeLesson.id]: Math.max(lessonStars[activeLesson.id] || 0, stars),
    };
    setLessonStars(updatedStars);

    const earnedCoins = stars * 15;
    const earnedXp = stars * 35;

    if (isAuthenticated) {
      const newCoins = userCoins + earnedCoins;
      setUserCoins(newCoins);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_user_coins', String(newCoins));
      }
    } else {
      setUserCoins(0);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('typro_user_coins');
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_lesson_stars_v2', JSON.stringify(updatedStars));
      try {
        const prevCompleted = JSON.parse(localStorage.getItem('typro_completed_lessons') || '[]');
        if (!prevCompleted.includes(activeLesson.id)) {
          prevCompleted.push(activeLesson.id);
          localStorage.setItem('typro_completed_lessons', JSON.stringify(prevCompleted));
        }
      } catch {}

      // Save real telemetry record
      try {
        const newRecord: LessonTelemetryRecord = {
          id: Date.now(),
          date: new Date().toISOString(),
          lessonId: activeLesson.id,
          wpm: Math.round(metrics.netWpm),
          accuracy: Math.round(metrics.accuracy),
          elapsedSeconds: Math.max(5, Math.round(metrics.elapsedSeconds || (metrics.charactersTyped / 5) * 2)),
          wordsTyped: Math.max(1, Math.round(metrics.charactersTyped / 5)),
          xp: earnedXp,
          coins: earnedCoins,
          stars,
        };
        const prevHistory = JSON.parse(localStorage.getItem('typro_lesson_telemetry_history') || '[]');
        const updatedHistory = [newRecord, ...prevHistory].slice(0, 500);
        localStorage.setItem('typro_lesson_telemetry_history', JSON.stringify(updatedHistory));
        setTelemetryRecords(updatedHistory);

        // Update local lifetime cumulative XP and level
        const curXp = Number(localStorage.getItem('typro_user_xp') || '0');
        const nextXp = curXp + earnedXp;
        const nextLvl = Math.max(1, Math.floor(nextXp / 100) + 1);
        localStorage.setItem('typro_user_xp', String(nextXp));
        localStorage.setItem('typro_user_level', String(nextLvl));
        window.dispatchEvent(new Event('typro_economy_updated'));
      } catch {}

      // Persist real lesson completion and progress to backend database
      try {
        const storedUserId = user?.id || localStorage.getItem('typro_user_id') || undefined;
        const storedUsername = user?.username || localStorage.getItem('typro_username') || undefined;
        const storedName = user?.displayName || localStorage.getItem('typro_profile_name') || undefined;

        fetch('/api/gamification/record-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: storedUserId,
            username: storedUsername,
            displayName: storedName,
            earnedXp,
            earnedCoins,
            lessonId: activeLesson.id,
            lessonTitle: activeLesson.title,
            stars,
            wpm: Math.round(metrics.netWpm),
            accuracy: Math.round(metrics.accuracy),
            currentPath: '/lessons',
          }),
        }).catch((e) => console.warn('Failed recording lesson progress to backend:', e));
      } catch {}
    }

    setCompletedLesson({
      lessonId: activeLesson.id,
      stars,
      wpm: metrics.netWpm,
      accuracy: metrics.accuracy,
      rewardXp: earnedXp,
      rewardCoins: earnedCoins,
    });

    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
  };

  // Next/Prev navigation
  const currentLanguageLessons = useMemo(() => {
    return ALL_LESSONS.filter((l) => l.language === selectedLanguage);
  }, [selectedLanguage]);

  const activeIndex = currentLanguageLessons.findIndex((l) => l.id === activeLesson.id);

  // Lesson Selection Handler with Subscription Check
  const handleSelectLesson = useCallback((lesson: LessonItem) => {
    const isVipLevel = lesson.level === 'beginner' || lesson.level === 'advanced';

    if (isVipLevel && !isSubscribed) {
      setSubscriptionModalLesson(lesson);
      return;
    }

    setActiveLessonId(lesson.id);
    setCompletedLesson(null);
    setCurrentView('practice');
  }, [isSubscribed]);

  const handleGoToNextLesson = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < currentLanguageLessons.length - 1) {
      const next = currentLanguageLessons[activeIndex + 1];
      handleSelectLesson(next);
    } else {
      setCompletedLesson(null);
      setCurrentView('catalog');
    }
  }, [activeIndex, currentLanguageLessons, handleSelectLesson]);

  const handleGoToPrevLesson = useCallback(() => {
    if (activeIndex > 0) {
      const prev = currentLanguageLessons[activeIndex - 1];
      handleSelectLesson(prev);
    }
  }, [activeIndex, currentLanguageLessons, handleSelectLesson]);

  // Keyboard shortcut: Press Space on lesson completion to proceed to next lesson
  useEffect(() => {
    if (!completedLesson) return;

    const handleSpaceNext = (e: KeyboardEvent) => {
      // Don't intercept if subscription modal or mini-game modal is open
      if (subscriptionModalLesson || activeMiniGameModal) return;

      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        handleGoToNextLesson();
      }
    };

    window.addEventListener('keydown', handleSpaceNext, true);
    return () => window.removeEventListener('keydown', handleSpaceNext, true);
  }, [completedLesson, subscriptionModalLesson, activeMiniGameModal, handleGoToNextLesson]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans" dir="rtl">
      {/* Prominent Registration Callout Banner */}
      {!isAuthenticated && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              📚
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
                برای ذخیره شدن دائم دروس گذرانده‌شده، ستاره‌های مهارت، نتایج تمرین هوشمند، تحلیل کلیدهای ضعیف و زنجیره روزانه (Streak)، باید در تایپرو ثبت‌نام کنید. در غیر این صورت با بستن مرورگر پیشرفت آموزشی شما پاک خواهد شد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/login?tab=register"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <span>ثبت‌نام رایگان و ذخیره دروس</span>
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

      {isAuthenticated && user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-slate-900">
                <span>همگام‌سازی دروس و کارنامه فعال است:</span>
                <span className="text-emerald-700 font-mono">@{user.username || user.displayName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                تمامی ستاره‌های دریافتی، روند تمرین هوشمند و تحلیل کلیدهای ضعیف مستقیماً در حساب کاربری شما ذخیره می‌شوند.
              </span>
            </div>
          </div>
          <div className="font-mono font-bold text-slate-700">
            مجموع ستاره‌ها: {totalStarsEarned.toLocaleString('fa-IR')} ⭐
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: PRACTICE ARENA (Only shown when a lesson is actively clicked)
          ========================================================================= */}
      {currentView === 'practice' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Control Bar with PROMINENT "Return to Lessons List" button */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              {/* PRIMARY RETURN BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setCompletedLesson(null);
                  setCurrentView('catalog');
                }}
                className="btn-spring flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به فهرست درس‌ها</span>
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    {activeLesson.level === 'foundation'
                      ? 'مقدماتی (پایه)'
                      : activeLesson.level === 'beginner'
                      ? 'مبتدی (اشتراکی VIP)'
                      : 'پیشرفته (اشتراکی VIP)'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    درس {activeIndex + 1} از {currentLanguageLessons.length}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 mt-0.5 line-clamp-1">
                  {activeLesson.titleFa}
                </h2>
              </div>
            </div>

            {/* Live Speedometer & Navigation in Practice Header */}
            <div className="flex items-center gap-4">
              <SpeedometerGauge
                wpm={completedLesson ? completedLesson.wpm : practiceLiveWpm}
                accuracy={completedLesson ? completedLesson.accuracy : practiceLiveAccuracy}
                size="sm"
                title="کیلومتر سرعت تایپ"
              />

              <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                <button
                  onClick={handleGoToPrevLesson}
                  disabled={activeIndex <= 0}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="درس قبلی"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGoToNextLesson}
                  disabled={activeIndex >= currentLanguageLessons.length - 1}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="درس بعدی"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Completion 5-Star Result Banner */}
          {completedLesson && (
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-blue-500/30 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-lg sm:text-2xl text-white">
                      آفرین! این درس با موفقیت به پایان رسید
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    امتیاز و ستاره‌های این درس با موفقیت در کارنامه و پروفایل شما ثبت گردید.
                  </p>
                </div>

                {/* 5-Star Visual Display */}
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                  <span className="text-xs font-bold text-slate-300 ml-1">کسب ستاره:</span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 transition-transform duration-300 ${
                        s <= completedLesson.stars
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono font-black text-amber-300 mr-1">
                    {completedLesson.stars} از ۵
                  </span>
                </div>
              </div>

              {/* Dynamic Tachometer Speedometer and Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center md:justify-start">
                  <SpeedometerGauge
                    wpm={completedLesson.wpm}
                    accuracy={completedLesson.accuracy}
                    size="md"
                    title="کیلومتر سرعت نهایی"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">دقت نهایی</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {completedLesson.accuracy}٪
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 font-bold">پاداش XP</span>
                    <div className="text-2xl font-black text-sky-400 font-mono">
                      +{completedLesson.rewardXp}
                    </div>
                  </div>
                  <div className="col-span-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-bold">پاداش سکه این درس:</span>
                    {isAuthenticated ? (
                      <CoinBadge amount={completedLesson.rewardCoins} size="sm" variant="solid" />
                    ) : (
                      <span className="text-xs text-amber-300 font-bold">نیازمند ثبت‌نام (۰ سکه ذخیره شد)</span>
                    )}
                  </div>
                  {!isAuthenticated && (
                    <div className="col-span-2 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center justify-between gap-3">
                      <span>⚠️ برای ذخیره سکه‌ها و پیشرفت‌های این درس، لطفاً ثبت‌نام کنید.</span>
                      <Link href="/login" className="px-3 py-1 rounded-xl bg-amber-400 text-slate-900 font-black text-[11px] hover:bg-amber-300 transition shrink-0">
                        ثبت‌نام سریع
                      </Link>
                    </div>
                  )}
                </div>

                {/* Next Steps Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleGoToNextLesson}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer ring-2 ring-emerald-400/30"
                  >
                    <span>شروع درس بعدی</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/25 text-[11px] font-mono border border-white/20 text-emerald-200">
                      [ کلید Space ␣ ]
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setCompletedLesson(null);
                      setCurrentView('catalog');
                    }}
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ListOrdered className="w-4 h-4 text-blue-400" />
                    <span>بازگشت به فهرست کامل درس‌ها</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Practice Typing Engine (Visible Text + Keyboard) */}
          <div className="space-y-4">
            <TypingEngine
              key={activeLesson.id}
              targetText={activeLesson.content}
              language={activeLesson.language}
              allowChangeText={false}
              title={activeLesson.titleFa}
              isLesson={true}
              onComplete={handleLessonComplete}
              onNextLesson={handleGoToNextLesson}
            />
          </div>
        </div>
      ) : (
        /* =========================================================================
           VIEW 2: LESSONS CATALOG & COURSE ROADMAP (SHOWN BY DEFAULT ON OPENING!)
           ========================================================================= */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black border border-blue-400/30">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    آکادمی جامع تایپ ده‌انگشتی
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                    سیستم ۵ ستاره‌ای تسلط بر کلیدها
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  آموزش تایپ ده انگشتی رایگان و دروس یادگیری تایپ سریع
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-2xl">
                  یادگیری گام‌به‌گام آموزش تایپ ده انگشتی از کلیدهای شاخص پایه (ف و ت) تا کلمات و متون پیشرفته در تایپرو. تقویت حافظه عضلانی انگشتان بدون نگاه به کیبورد با ۲۵۰ درس تعاملی و چالش‌های بازی مهارتی.
                </p>

                {/* Language Switcher Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-slate-400">زبان آموزش:</span>
                  <div className="inline-flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 text-xs font-black">
                    <button
                      onClick={() => setSelectedLanguage('fa')}
                      className={`px-4 py-1.5 rounded-xl transition ${
                        selectedLanguage === 'fa'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      فارسی (استاندارد ایران)
                    </button>
                    <button
                      onClick={() => setSelectedLanguage('en')}
                      className={`px-4 py-1.5 rounded-xl transition ${
                        selectedLanguage === 'en'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      English (QWERTY)
                    </button>
                  </div>
                </div>
              </div>

              {/* Currency HUD & Total Star Gauge */}
              <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
                <CurrencyHUD
                  coins={userCoins}
                  diamonds={userDiamonds}
                  size="md"
                  variant="glass"
                  className="bg-slate-900/60 border-slate-700/60 shadow-xl"
                />

                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">مجموع ستاره‌های کسب‌شده:</span>
                    <strong className="text-amber-300 font-mono text-base font-black">
                      {totalStarsEarned.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-slate-400 text-[10px] mr-1">ستاره</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PROGRESS ANALYTICS DASHBOARD (Today, Week, Month, Year)
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>داشبورد پیشرفت و ریتم یادگیری شما (Typing Progress Telemetry)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ارزیابی هوشمند بازدهی تمرین، سرعت میانگین، دقت و انگیزه روزانه
                </p>
              </div>

              {/* Progress Timeframe Tabs: امروز، هفته، ماهانه، سالانه */}
              <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-black text-slate-600">
                <button
                  onClick={() => setProgressTab('today')}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    progressTab === 'today' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  پیشرفت امروز
                </button>
                <button
                  onClick={() => setProgressTab('week')}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    progressTab === 'week' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  این هفته
                </button>
                <button
                  onClick={() => setProgressTab('month')}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    progressTab === 'month' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  ماهانه
                </button>
                <button
                  onClick={() => setProgressTab('year')}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    progressTab === 'year' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  سالانه
                </button>
              </div>
            </div>

            {/* Telemetry Data Display: Real Data or Clean Empty State */}
            {!telemetryStats ? (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 space-y-3 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-800 text-base">
                  هنوز داده‌ای برای این بازه ثبت نشده است
                </h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  «هنوز داده‌ای برای این بازه ثبت نشده است — برای تحلیل پیشرفت، یک درس یا آزمون را شروع کنید.»
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentView('practice');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>شروع تمرین و ثبت رکورد</span>
                  </button>
                  <Link
                    href="/speed-test"
                    className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                  >
                    آزمون سنجش سرعت
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* TAB 1: پیشرفت امروز */}
                {progressTab === 'today' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
                    <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100/80 space-y-1">
                      <span className="text-xs text-blue-700 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>زمان تمرین امروز:</span>
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                        {telemetryStats.totalMinutes} دقیقه
                      </div>
                      <span className="text-[11px] text-blue-600 font-semibold block pt-0.5">ثبت زنده از جلسات امروز</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 space-y-1">
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>دروس گذرانده امروز:</span>
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                        {telemetryStats.lessonsCount} درس
                      </div>
                      <span className="text-[11px] text-emerald-600 font-semibold block pt-0.5">میانگین دقت: {telemetryStats.avgAccuracy}٪</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100/80 space-y-1">
                      <span className="text-xs text-purple-700 font-bold flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5 text-purple-600" />
                        <span>کلمات تایپ شده امروز:</span>
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-purple-950 font-mono">
                        {telemetryStats.totalWords} کلمه
                      </div>
                      <span className="text-[11px] text-purple-600 font-semibold block pt-0.5">میانگین سرعت: {telemetryStats.avgWpm} WPM</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100/80 space-y-1">
                      <span className="text-xs text-amber-700 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>امتیاز روزانه (XP):</span>
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                        +{telemetryStats.totalXp} XP
                      </div>
                      <span className="text-[11px] text-amber-600 font-semibold block pt-0.5">+{telemetryStats.totalCoins} سکه کسب‌شده</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: پیشرفت این هفته */}
                {progressTab === 'week' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-xs text-slate-500 font-bold">زنجیره تمرین (Streak):</span>
                        <div className="text-2xl font-black text-amber-600 font-mono flex items-center gap-1">
                          <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                          <span>{telemetryStats.streakDays} روز</span>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-xs text-slate-500 font-bold">میانگین سرعت هفته:</span>
                        <div className="text-2xl font-black text-blue-600 font-mono">{telemetryStats.avgWpm} WPM</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-xs text-slate-500 font-bold">دقت هفتگی:</span>
                        <div className="text-2xl font-black text-emerald-600 font-mono">{telemetryStats.avgAccuracy}٪</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-xs text-slate-500 font-bold">کل دروس هفته:</span>
                        <div className="text-2xl font-black text-purple-600 font-mono">{telemetryStats.lessonsCount} درس</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: پیشرفت ماهانه */}
                {progressTab === 'month' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">دروس کامل ماه:</span>
                      <div className="text-2xl font-black text-blue-600 font-mono">{telemetryStats.lessonsCount} درس</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">اوج سرعت ثبت‌شده:</span>
                      <div className="text-2xl font-black text-indigo-600 font-mono">{telemetryStats.peakWpm} WPM</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">میانگین دقت ماهانه:</span>
                      <div className="text-2xl font-black text-emerald-600 font-mono">{telemetryStats.avgAccuracy}٪</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">ستاره‌های کسب‌شده ماه:</span>
                      <div className="text-2xl font-black text-amber-500 font-mono">{telemetryStats.totalStars} ⭐</div>
                    </div>
                  </div>
                )}

                {/* TAB 4: پیشرفت سالانه */}
                {progressTab === 'year' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">کل ساعات تمرین:</span>
                      <div className="text-2xl font-black text-blue-600 font-mono">{telemetryStats.totalHours} ساعت</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">مجموع کلمات تایپ شده:</span>
                      <div className="text-2xl font-black text-indigo-600 font-mono">{telemetryStats.totalWords}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">میانگین سرعت کلی:</span>
                      <div className="text-2xl font-black text-emerald-600 font-mono">{telemetryStats.avgWpm} WPM</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-xs text-slate-500 font-bold">مجموع دروس تکمیل‌شده:</span>
                      <div className="text-2xl font-black text-purple-600 font-mono">{telemetryStats.lessonsCount} درس</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Search & Level Filter Quick-Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-black text-slate-500 whitespace-nowrap ml-1">مشاهده:</span>
              <button
                onClick={() => setCatalogLevelFilter('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                  catalogLevelFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                همه سطوح (پیوسته در همین صفحه)
              </button>
              <button
                onClick={() => setCatalogLevelFilter('foundation')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                  catalogLevelFilter === 'foundation'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ۱. مقدماتی (رایگان)
              </button>
              <button
                onClick={() => setCatalogLevelFilter('beginner')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                  catalogLevelFilter === 'beginner'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ۲. مبتدی (اشتراکی VIP)
              </button>
              <button
                onClick={() => setCatalogLevelFilter('advanced')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                  catalogLevelFilter === 'advanced'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ۳. پیشرفته (اشتراکی VIP)
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجوی عنوان درس یا کلید شاخص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pr-9 pl-3 py-2 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          {/* =========================================================================
              SECTION 1: دروس مقدماتی (حروف و استقرار انگشتان) - ۱۰۰٪ رایگان
              ========================================================================= */}
          {(catalogLevelFilter === 'all' || catalogLevelFilter === 'foundation') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-3xl border border-blue-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                      ۱
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      سطح ۱: دروس مقدماتی (حروف و کلیدهای شاخص پایه)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                      رایگان و باز برای همه
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    آموزش اصولی استقرار انگشتان روی کلیدهای شاخص ت و ب (F و J) و تسلط بر ۳ ردیف اصلی کیبورد.
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-600 shrink-0">
                  <span>تعداد: </span>
                  <strong className="font-mono text-blue-700 font-black">{foundationLessons.length} درس</strong>
                </div>
              </div>

              {/* Grid with Mini-Game inserted every 3 lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {foundationLessons
                  .filter((l) => searchQuery.trim() === '' || l.titleFa.includes(searchQuery) || l.content.includes(searchQuery))
                  .map((lesson, idx) => {
                    const stars = lessonStars[lesson.id] || 0;
                    const gameCheckpoint = MINI_GAME_CHECKPOINTS.find((g) => g.afterLessonIndex === idx + 1);

                    return (
                      <React.Fragment key={lesson.id}>
                        {/* Lesson Card */}
                        <div
                          onClick={() => handleSelectLesson(lesson)}
                          className="interactive-card bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group cursor-pointer relative overflow-hidden"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-700 font-mono font-black text-xs flex items-center justify-center border border-blue-200">
                                  {idx + 1}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                                  مقدماتی
                                </span>
                              </div>

                              {/* 5-STAR RATING DISPLAY */}
                              <div className="flex items-center gap-0.5" title={`ستاره‌های کسب‌شده: ${stars} از ۵`}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= stars
                                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                                        : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                                {lesson.titleFa}
                              </h3>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 font-mono text-[11px] leading-relaxed">
                                {lesson.content}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                              <span>سرعت هدف: <strong className="font-mono text-slate-800">{lesson.targetWpm} WPM</strong></span>
                              <span>دقت: <strong className="font-mono text-slate-800">{lesson.targetAccuracy}٪</strong></span>
                            </div>

                            <button
                              type="button"
                              className="w-full py-2.5 rounded-2xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>ورود به تمرین درس {idx + 1}</span>
                            </button>
                          </div>
                        </div>

                        {/* MINI-GAME CHECKPOINT (Inserted every 3 lessons like Typo & EdClub) */}
                        {gameCheckpoint && (
                          <div
                            key={gameCheckpoint.id}
                            className={`col-span-1 md:col-span-2 lg:col-span-3 rounded-3xl p-5 border bg-gradient-to-r ${gameCheckpoint.color} flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}
                          >
                            <div className="flex items-center gap-3.5 text-right w-full md:w-auto">
                              <span className="text-3xl sm:text-4xl shrink-0 p-2 bg-white/70 rounded-2xl shadow-xs">
                                {gameCheckpoint.icon}
                              </span>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <Gamepad2 className="w-4 h-4 text-slate-700" />
                                  <h4 className="font-black text-sm sm:text-base text-slate-900">
                                    {gameCheckpoint.title}
                                  </h4>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white text-slate-800 shadow-2xs">
                                    {gameCheckpoint.badge}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 max-w-2xl font-medium">
                                  {gameCheckpoint.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                              <button
                                type="button"
                                onClick={() => setActiveMiniGameModal(gameCheckpoint)}
                                className="btn-spring px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-md whitespace-nowrap flex items-center gap-2"
                              >
                                <Play className="w-3.5 h-3.5 fill-current text-white" />
                                <span>شروع چالش مهارتی (با کلید Space)</span>
                              </button>
                              <Link
                                href={`/games?mode=${gameCheckpoint.gameMode}`}
                                className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 font-bold text-xs transition border border-slate-200 shadow-xs"
                                title="اجرا در تالار تمام‌صفحه بازی‌ها"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 2: دروس مبتدی (کلمات و واژگان پرکاربرد) - بخش اشتراکی VIP
              ========================================================================= */}
          {(catalogLevelFilter === 'all' || catalogLevelFilter === 'beginner') && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 rounded-3xl border border-amber-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shadow-xs">
                      ۲
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      سطح ۲: دروس مبتدی (کلمات و واژگان کاربردی)
                    </h2>
                    <span className="px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3" />
                      <span>اشتراکی (VIP)</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    تقویت سرعت حافظه عضلانی با تایپ کلمات چندحرفی و پربسامد. دسترسی ویژه مشترکین تایپرو پلاس.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>تعداد: </span>
                  <strong className="font-mono text-amber-800 font-black">{beginnerLessons.length} درس</strong>
                </div>
              </div>

              {/* Grid of Beginner Lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {beginnerLessons
                  .filter((l) => searchQuery.trim() === '' || l.titleFa.includes(searchQuery) || l.content.includes(searchQuery))
                  .map((lesson, idx) => {
                    const stars = lessonStars[lesson.id] || 0;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`interactive-card p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 group cursor-pointer relative overflow-hidden ${
                          isSubscribed
                            ? 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-lg'
                            : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-800 font-mono font-black text-xs flex items-center justify-center border border-amber-200">
                                {idx + 1}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 flex items-center gap-1">
                                {!isSubscribed && <Lock className="w-2.5 h-2.5 text-amber-700" />}
                                <span>مبتدی (VIP)</span>
                              </span>
                            </div>

                            {/* 5-STAR RATING DISPLAY */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition line-clamp-1">
                              {lesson.titleFa}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 font-mono text-[11px] leading-relaxed">
                              {lesson.content}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>سرعت هدف: <strong className="font-mono text-slate-800">{lesson.targetWpm} WPM</strong></span>
                            <span>دقت: <strong className="font-mono text-slate-800">{lesson.targetAccuracy}٪</strong></span>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2.5 rounded-2xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                              isSubscribed
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                                : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border border-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950'
                            }`}
                          >
                            {!isSubscribed ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            <span>{!isSubscribed ? 'درس اشتراکی ویژه (مشاهده)' : `ورود به درس ${idx + 1}`}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 3: دروس پیشرفته (جملات و متون کامل) - بخش اشتراکی VIP
              ========================================================================= */}
          {(catalogLevelFilter === 'all' || catalogLevelFilter === 'advanced') && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-5 rounded-3xl border border-purple-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                      ۳
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      سطح ۳: دروس پیشرفته (جملات کامل، اشعار و متون تخصصی)
                    </h2>
                    <span className="px-3 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3 text-amber-300" />
                      <span>اشتراکی (VIP)</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    تایپ متون پیوسته، مقالات و اشعار برای ارتقای ریتم ذهنی و دستیابی به سرعت‌های بالای ۷۰ کلمه در دقیقه.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>تعداد: </span>
                  <strong className="font-mono text-purple-800 font-black">{advancedLessons.length} درس</strong>
                </div>
              </div>

              {/* Grid of Advanced Lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {advancedLessons
                  .filter((l) => searchQuery.trim() === '' || l.titleFa.includes(searchQuery) || l.content.includes(searchQuery))
                  .map((lesson, idx) => {
                    const stars = lessonStars[lesson.id] || 0;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`interactive-card p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 group cursor-pointer relative overflow-hidden ${
                          isSubscribed
                            ? 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-lg'
                            : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-800 font-mono font-black text-xs flex items-center justify-center border border-purple-200">
                                {idx + 1}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 flex items-center gap-1">
                                {!isSubscribed && <Lock className="w-2.5 h-2.5 text-purple-700" />}
                                <span>پیشرفته (VIP)</span>
                              </span>
                            </div>

                            {/* 5-STAR RATING DISPLAY */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition line-clamp-1">
                              {lesson.titleFa}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 font-mono text-[11px] leading-relaxed">
                              {lesson.content}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>سرعت هدف: <strong className="font-mono text-slate-800">{lesson.targetWpm} WPM</strong></span>
                            <span>دقت: <strong className="font-mono text-slate-800">{lesson.targetAccuracy}٪</strong></span>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2.5 rounded-2xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                              isSubscribed
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-900 border border-purple-300 group-hover:bg-purple-600 group-hover:text-white'
                            }`}
                          >
                            {!isSubscribed ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            <span>{!isSubscribed ? 'درس اشتراکی ویژه (مشاهده)' : `ورود به درس ${idx + 1}`}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIP SUBSCRIPTION MODAL (When clicking on locked Beginner or Advanced lesson)
          ========================================================================= */}
      {subscriptionModalLesson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    محتوای اشتراکی VIP
                  </span>
                  <h3 className="font-black text-lg text-slate-900 mt-1">
                    دسترسی به {subscriptionModalLesson.titleFa}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSubscriptionModalLesson(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              این درس متعلق به سطوح <strong>{subscriptionModalLesson.level === 'beginner' ? 'مبتدی (کلمات)' : 'پیشرفته (متون کامل)'}</strong> است. با تهیه اشتراک تایپرو پلاس، به بیش از ۳۰۰ درس تخصصی و استاندارد، بازی‌های مهارتی، آزمون‌های استخدامی و تحلیل خطای هوش مصنوعی دسترسی نامحدود خواهید داشت.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
              <div className="font-bold text-amber-900">مزایای اشتراک ویژه تایپرو:</div>
              <ul className="space-y-1.5 text-amber-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>دسترسی به تمامی دروس مبتدی، واژگان و متون پیشرفته</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>آزمون‌های جامع استخدامی و صدور مدرک معتبر</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>تحلیل هوشمند و پیشرفته مربی مجازی (AI Coach)</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/subscription"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:brightness-105 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition"
              >
                <Crown className="w-4 h-4" />
                <span>مشاهده پلن‌ها و خرید اشتراک</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  const target = subscriptionModalLesson;
                  setSubscriptionModalLesson(null);
                  setActiveLessonId(target.id);
                  setCompletedLesson(null);
                  setCurrentView('practice');
                }}
                className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                پیش‌نمایش آزمایشی این درس
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini-Game Checkpoint Modal (Starts with Space, No input box!) */}
      {activeMiniGameModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
                  {activeMiniGameModal.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-black text-base sm:text-lg">
                      {activeMiniGameModal.title}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      شروع با Space • بدون کادر
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeMiniGameModal.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/games?mode=${activeMiniGameModal.gameMode}`}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition"
                  target="_blank"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>تالار کامل</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveMiniGameModal(null)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
                  title="بستن پنجره"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Game Arena */}
            <div className="p-2 sm:p-5">
              <TypingGameArena
                initialMode={activeMiniGameModal.gameMode as any}
                allowModeSwitch={false}
                isModal={true}
                onClose={() => setActiveMiniGameModal(null)}
                language={selectedLanguage}
                title={activeMiniGameModal.title}
                badge={activeMiniGameModal.badge}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
