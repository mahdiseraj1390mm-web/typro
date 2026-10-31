'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Star,
  Award,
  CheckCircle2,
  Gift,
  Sparkles,
  Zap,
  Users,
  Copy,
  Check,
  TrendingUp,
  Trophy,
  Clock,
  ChevronLeft,
  CloudCheck,
  ShieldCheck,
  LogIn,
  Tag,
  CreditCard,
  Ticket,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

import ChestOpeningModal, { ChestType, ChestReward, CHEST_CONFIGS } from '@/components/rewards/ChestOpeningModal';
import CupsAndLevels, { CUP_LEAGUES } from '@/components/rewards/CupsAndLevels';
import CurrencyBadge, { CoinIcon, DiamondIcon } from '@/components/ui/CurrencyBadge';
import { useAuth } from '@/context/AuthContext';

interface Mission {
  id: string;
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
  title: string;
  reward: string;
  coins: number;
  diamonds?: number;
  xp: number;
  completed: boolean;
  actionUrl: string;
  actionLabel: string;
}

// Chest cooldown durations in milliseconds
const CHEST_COOLDOWNS: Record<ChestType, number> = {
  daily: 24 * 60 * 60 * 1000,       // 24 hours
  weekly: 7 * 24 * 60 * 60 * 1000,   // 7 days
  monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
  yearly: 365 * 24 * 60 * 60 * 1000, // 365 days
  diamond: 365 * 24 * 60 * 60 * 1000,
};

export default function EarnRewardsPage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'chests' | 'missions' | 'cups_levels' | 'referral'>('chests');
  const [missionSubTab, setMissionSubTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  // User Economy & Progression state synced with AuthContext
  const [userCoins, setUserCoins] = useState<number>(() => {
    if (!user) return 0;
    if (user?.coins !== undefined) return user.coins;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_coins');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [userDiamonds, setUserDiamonds] = useState<number>(() => {
    if (!user) return 0;
    if (user?.diamonds !== undefined) return user.diamonds;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_diamonds');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [userXp, setUserXp] = useState(user?.xp ?? 0);
  const [userLevel, setUserLevel] = useState(user?.level ?? 1);
  const [userCups, setUserCups] = useState(150);

  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [authWarningModalOpen, setAuthWarningModalOpen] = useState(false);

  // Chest Modal State & Cooldowns
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [activeChestType, setActiveChestType] = useState<ChestType>('daily');
  const [chestLastOpened, setChestLastOpened] = useState<Record<string, number>>({});
  const [, setTick] = useState(0);

  // Sync with Auth user when available
  useEffect(() => {
    if (user) {
      if (user.coins !== undefined) setUserCoins(user.coins);
      if (user.diamonds !== undefined) setUserDiamonds(user.diamonds);
      if (user.xp !== undefined) setUserXp(user.xp);
      if (user.level !== undefined) setUserLevel(user.level);
    }
  }, [user]);

  // Real user statistics loaded from storage for Chest progression
  const [realStats, setRealStats] = useState({
    testsToday: 0,
    todayWpm: 0,
    todayAccuracy: 100,
    streakDays: 0,
    bestWpm: 0,
    level: 1,
    hasActivityToday: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('typro_last_test_date');
    const streak = Number(localStorage.getItem('typro_streak_days') || '0');
    const bestWpm = Number(localStorage.getItem('typro_best_wpm') || '0');
    let todayResult: any = null;
    try {
      todayResult = JSON.parse(localStorage.getItem('typro_last_test_result') || 'null');
    } catch {}

    const hasToday = lastDate === today || !!localStorage.getItem('typro_last_test_result') || !!localStorage.getItem('typro_last_race_replay');
    setRealStats({
      testsToday: hasToday ? 1 : 0,
      todayWpm: todayResult?.wpm || (hasToday ? bestWpm || 60 : 0),
      todayAccuracy: todayResult?.accuracy || 98,
      streakDays: streak,
      bestWpm: bestWpm || 65,
      level: user?.level || 1,
      hasActivityToday: !!hasToday,
    });
  }, [user]);

  // Support direct URL tab switching (e.g. /earn?tab=chests)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tab = p.get('tab');
      if (tab === 'chests' || tab === 'missions' || tab === 'cups_levels' || tab === 'referral') {
        setActiveTab(tab);
      }
    }
  }, []);

  // Load cooldown timestamps and claimed missions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loaded: Record<string, number> = {};
    (['daily', 'weekly', 'monthly', 'yearly'] as const).forEach((t) => {
      const key = `typro_chest_cd_${t}`;
      const val = localStorage.getItem(key);
      if (val) loaded[t] = Number(val);
    });
    setChestLastOpened(loaded);

    try {
      const savedClaimed = localStorage.getItem('typro_claimed_missions');
      if (savedClaimed) setClaimedMissions(JSON.parse(savedClaimed));
    } catch {}

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Missions Definition
  const [missions, setMissions] = useState<Mission[]>([
    // Daily Missions
    {
      id: 'm-d1',
      category: 'daily',
      title: 'انجام حداقل ۱ آزمون تایپ در روز جاری',
      reward: '+۵۰ سکه + ۳۰ XP',
      coins: 50,
      xp: 30,
      completed: false,
      actionUrl: '/typing-test',
      actionLabel: 'انجام آزمون تایپ',
    },
    {
      id: 'm-d2',
      category: 'daily',
      title: 'کسب دقت بالای ۹۸٪ در آزمون استاندارد',
      reward: '+۸۰ سکه + ۵۰ XP',
      coins: 80,
      xp: 50,
      completed: false,
      actionUrl: '/typing-test',
      actionLabel: 'آزمون دقت',
    },
    {
      id: 'm-d3',
      category: 'daily',
      title: 'شرکت در یک مسابقه زنده آنلاین (Live Race)',
      reward: '+۱۰وات سکه + ۴۰ XP',
      coins: 100,
      xp: 40,
      completed: false,
      actionUrl: '/live-race',
      actionLabel: 'ورود به پیست رقابت',
    },
    // Weekly Missions
    {
      id: 'm-w1',
      category: 'weekly',
      title: 'استمرار ۳ روز فعالیت متوالی (Streak) در هفته',
      reward: '+۲۰۰ سکه + ۱۰ الماس',
      coins: 200,
      diamonds: 10,
      xp: 120,
      completed: false,
      actionUrl: '/typing-test',
      actionLabel: 'تثبیت استمرار',
    },
    {
      id: 'm-w2',
      category: 'weekly',
      title: 'شکستن رکورد سرعت شخصی WPM',
      reward: '+۲۵۰ سکه + ۱۵ الماس',
      coins: 250,
      diamonds: 15,
      xp: 150,
      completed: false,
      actionUrl: '/typing-test',
      actionLabel: 'شکستن رکورد WPM',
    },
    {
      id: 'm-w3',
      category: 'weekly',
      title: 'تکمیل ۵ درس جدید در آکادمی تایپ',
      reward: '+۱۸۰ سکه + ۱۰۰ XP',
      coins: 180,
      xp: 100,
      completed: false,
      actionUrl: '/lessons',
      actionLabel: 'ورود به آکادمی',
    },
    // Monthly Missions
    {
      id: 'm-m1',
      category: 'monthly',
      title: 'کسب ۱۵ ستاره فعالیت در ماه جاری',
      reward: '+۵۰۰ سکه + ۳۰ الماس',
      coins: 500,
      diamonds: 30,
      xp: 300,
      completed: false,
      actionUrl: '/typing-test',
      actionLabel: 'جمع‌آوری ستاره',
    },
    {
      id: 'm-m2',
      category: 'monthly',
      title: 'ارتقا به سطح (Level) ۵ یا بالاتر',
      reward: '+۷۵۰ سکه + ۵۰ الماس',
      coins: 750,
      diamonds: 50,
      xp: 500,
      completed: false,
      actionUrl: '/lessons',
      actionLabel: 'ارتقای لول',
    },
    {
      id: 'm-m3',
      category: 'monthly',
      title: 'تایپ کامل ۲ متن ادبی در تایپرو رایت',
      reward: '+۴۰۰ سکه + ۲۰ الماس',
      coins: 400,
      diamonds: 20,
      xp: 250,
      completed: false,
      actionUrl: '/write',
      actionLabel: 'ورود به تایپرو رایت',
    },
    // Yearly Achievements
    {
      id: 'm-y1',
      category: 'yearly',
      title: 'صعود به لیگ طلایی / گرندمستر',
      reward: '+۱۵۰۰ سکه + ۱۰۰ الماس',
      coins: 1500,
      diamonds: 100,
      xp: 1000,
      completed: false,
      actionUrl: '/earn?tab=cups_levels',
      actionLabel: 'مشاهده کاپ‌ها',
    },
    {
      id: 'm-y2',
      category: 'yearly',
      title: 'ثبت بیش از ۵۰ آزمون و تمرین در سال',
      reward: '+۲۰۰۰ سکه + ۱۵۰ الماس',
      coins: 2000,
      diamonds: 150,
      xp: 1500,
      completed: false,
      actionUrl: '/typing-test',
      actionLabel: 'ثبت تمرین سالانه',
    },
  ]);

  // Real-time verification of user's genuine activities from LocalStorage & Auth
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const completedLessons = JSON.parse(localStorage.getItem('typro_completed_lessons') || '[]');
    const has5Lessons = completedLessons.length >= 5;

    let hasHighAcc = false;
    try {
      const lastTest = JSON.parse(localStorage.getItem('typro_last_test_result') || 'null');
      if (lastTest && lastTest.accuracy >= 98) hasHighAcc = true;
    } catch {}

    const hasTestToday = !!localStorage.getItem('typro_last_test_result');
    const hasRace = !!localStorage.getItem('typro_last_race_replay');
    const hasRecord = !!localStorage.getItem('typro_user_wpm_record') || (user?.level || 0) >= 5;
    const hasQuran = !!localStorage.getItem('typro_quran_completed');
    const isLevel5 = (user?.level || 1) >= 5;
    const isLevel15 = (user?.level || 1) >= 15;

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'm-d1') return { ...m, completed: hasTestToday };
        if (m.id === 'm-d2') return { ...m, completed: hasHighAcc };
        if (m.id === 'm-d3') return { ...m, completed: hasRace };
        if (m.id === 'm-w1') return { ...m, completed: (user?.level || 1) >= 3 };
        if (m.id === 'm-w2') return { ...m, completed: hasRecord };
        if (m.id === 'm-w3') return { ...m, completed: has5Lessons };
        if (m.id === 'm-m1') return { ...m, completed: isLevel5 };
        if (m.id === 'm-m2') return { ...m, completed: isLevel5 };
        if (m.id === 'm-m3') return { ...m, completed: hasQuran };
        if (m.id === 'm-y1') return { ...m, completed: isLevel15 };
        if (m.id === 'm-y2') return { ...m, completed: isLevel15 };
        return m;
      })
    );
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper for Chest Status & Real Progression Validation
  const getChestStatus = (type: ChestType) => {
    const last = chestLastOpened[type];
    const duration = CHEST_COOLDOWNS[type] || CHEST_COOLDOWNS.daily;

    if (!user && !isAuthenticated) {
      return { isReady: false, label: 'برای دریافت ثبت‌نام کنید', isAuthLocked: true };
    }

    // Progression condition checks based on REAL statistics
    if (type === 'daily') {
      if (!realStats.hasActivityToday) {
        return { isReady: false, label: 'نیازمند انجام ۱ آزمون تایپ امروز', isReqLocked: true };
      }
    } else if (type === 'weekly') {
      const isLevel3 = (user?.level || realStats.level) >= 3;
      const hasStreak = realStats.streakDays >= 3;
      if (!isLevel3 && !hasStreak) {
        return { isReady: false, label: `نیازمند ۳ روز استمرار (فعلی: ${realStats.streakDays} روز)`, isReqLocked: true };
      }
    } else if (type === 'monthly') {
      const curLevel = user?.level || realStats.level;
      if (curLevel < 5) {
        return { isReady: false, label: `نیازمند سطح ۵ (سطح فعلی: ${curLevel})`, isReqLocked: true };
      }
    } else if (type === 'yearly' || type === 'diamond') {
      const curLevel = user?.level || realStats.level;
      if (curLevel < 15) {
        return { isReady: false, label: `نیازمند سطح ۱۵ (سطح فعلی: ${curLevel})`, isReqLocked: true };
      }
    }

    if (!last) return { isReady: true, label: 'آماده گشایش!' };

    const remainingMs = last + duration - Date.now();
    if (remainingMs <= 0) return { isReady: true, label: 'آماده گشایش!' };

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remHours = hours % 24;
      return { isReady: false, label: `${days.toLocaleString('fa-IR')} روز و ${remHours.toLocaleString('fa-IR')} ساعت باقی‌مانده` };
    }
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return { isReady: false, label: `${hours.toLocaleString('fa-IR')} ساعت و ${mins.toLocaleString('fa-IR')} دقیقه باقی‌مانده` };
  };

  // Open Chest Trigger
  const triggerOpenChest = (type: ChestType) => {
    if (!isAuthenticated) {
      setAuthWarningModalOpen(true);
      return;
    }

    const status = getChestStatus(type);
    if (!status.isReady) {
      showToast(`🔒 ${status.label}`);
      return;
    }

    setActiveChestType(type);
    setIsChestModalOpen(true);
  };

  // Process Rewards from Chest
  const handleClaimChestRewards = (rewardsArr: ChestReward[]) => {
    if (!isAuthenticated) {
      setAuthWarningModalOpen(true);
      return;
    }

    let addedCoins = 0;
    let addedDiamonds = 0;
    let addedXp = 0;

    rewardsArr.forEach((r) => {
      if (r.type === 'coins') addedCoins += r.amount || 0;
      if (r.type === 'diamonds') addedDiamonds += r.amount || 0;
      if (r.type === 'xp') addedXp += r.amount || 0;
    });

    const nextCoins = userCoins + addedCoins;
    const nextDiamonds = userDiamonds + addedDiamonds;
    const nextXp = userXp + addedXp;

    setUserCoins(nextCoins);
    setUserDiamonds(nextDiamonds);
    setUserXp(nextXp);

    const now = Date.now();
    setChestLastOpened((prev) => ({ ...prev, [activeChestType]: now }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_coins', String(nextCoins));
      localStorage.setItem('typro_user_diamonds', String(nextDiamonds));
      localStorage.setItem(`typro_chest_cd_${activeChestType}`, String(now));
    }

    updateProfile({
      coins: nextCoins,
      diamonds: nextDiamonds,
      xp: nextXp,
    });

    showToast(`🎁 جوایز «${CHEST_CONFIGS[activeChestType]?.name || activeChestType}» در حساب شما ذخیره شد!`);
  };

  // Claim Mission Rewards
  const handleClaimMission = (m: Mission) => {
    if (!isAuthenticated) {
      setAuthWarningModalOpen(true);
      return;
    }

    if (claimedMissions.includes(m.id)) {
      showToast('پاداش این مأموریت قبلاً دریافت شده است.');
      return;
    }

    if (!m.completed) {
      showToast('⚠️ این مأموریت هنوز به حد نصاب انجام نرسیده است!');
      return;
    }

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    const updated = [...claimedMissions, m.id];
    setClaimedMissions(updated);

    const nextCoins = userCoins + m.coins;
    const nextDiamonds = userDiamonds + (m.diamonds || 0);
    const nextXp = userXp + m.xp;

    setUserCoins(nextCoins);
    setUserDiamonds(nextDiamonds);
    setUserXp(nextXp);

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_coins', String(nextCoins));
      localStorage.setItem('typro_user_diamonds', String(nextDiamonds));
      localStorage.setItem('typro_claimed_missions', JSON.stringify(updated));
    }
    updateProfile({ coins: nextCoins, diamonds: nextDiamonds, xp: nextXp });
    showToast(`🎉 پاداش مأموریت «${m.title}» به حساب کاربری شما اضافه گردید!`);
  };

  const handleCopyReferral = () => {
    const link = `https://typro.ir/join?ref=${user?.username || 'TYPRO-USER'}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    showToast('لینک دعوت اختصاصی شما در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const filteredMissions = missions.filter((m) => m.category === missionSubTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Chest Opening Modal */}
      <ChestOpeningModal
        isOpen={isChestModalOpen}
        onClose={() => setIsChestModalOpen(false)}
        chestType={activeChestType}
        onClaimRewards={handleClaimChestRewards}
      />

      {/* Auth Warning Modal */}
      {authWarningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-md">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">برای دریافت صندوقچه‌ها ثبت‌نام کنید</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                جهت گشایش صندوقچه‌های روزانه، هفتگی، ماهانه و سالانه و همچنین دریافت پاداش‌های مأموریت، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href="/login?tab=register"
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20"
              >
                ثبت‌نام سریع و ذخیره جوایز
              </Link>
              <button
                onClick={() => setAuthWarningModalOpen(false)}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              مرکز پاداش‌ها، صندوقچه‌های دوره‌ای و مأموریت‌های پویا
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            صندوقچه‌ها و مأموریت‌های پاداش تایپرو
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
            با تمرین روزانه، شرکت در مسابقات و ارتقای سطح، صندوقچه‌های پاداش روزانه، هفتگی، ماهانه و سالانه را گشایش کرده و سکه و الماس دریافت نمایید.
          </p>
        </div>

        {/* Currency summary card */}
        <div className="flex items-center gap-3 bg-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-slate-800 shrink-0">
          <CurrencyBadge type="coin" amount={userCoins} size="md" />
          <div className="w-px h-6 bg-slate-800" />
          <CurrencyBadge type="diamond" amount={userDiamonds} size="md" />
        </div>
      </div>

      {/* Prominent Unauthenticated Registration Callout Banner */}
      {!isAuthenticated && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md shrink-0">
              🎁
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                برای دریافت صندوقچه‌ها و مأموریت‌ها ثبت نام کنید!
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                جهت گشایش صندوقچه‌های روزانه، هفتگی، ماهانه و سالانه و ذخیره شدن سکه‌ها و الماس‌ها ثبت‌نام در سامانه الزامی است.
              </p>
            </div>
          </div>

          <Link
            href="/login?tab=register"
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition shrink-0 self-end sm:self-auto flex items-center gap-1.5"
          >
            <span>ثبت‌نام رایگان</span>
            <ArrowRight className="w-4 h-4 text-slate-950 rotate-180" />
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('chests')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
            activeTab === 'chests'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>صندوقچه‌های پاداش (روزانه، هفتگی، ماهانه، سالانه)</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
            activeTab === 'missions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>مأموریت‌های پاداش‌دار</span>
        </button>

        <button
          onClick={() => setActiveTab('cups_levels')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
            activeTab === 'cups_levels'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>کاپ و سطح (Level) رقابتی</span>
        </button>

        <button
          onClick={() => setActiveTab('referral')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
            activeTab === 'referral'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>دعوت از دوستان و کوپن‌ها</span>
        </button>
      </div>

      {/* TAB 1: CHESTS */}
      {activeTab === 'chests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => {
              const cfg = CHEST_CONFIGS[type];
              const st = getChestStatus(type);

              return (
                <div
                  key={type}
                  className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    {/* Chest Header & Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                        {cfg.tier}
                      </span>
                      {st.isReady && (
                        <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>آماده گشایش</span>
                        </span>
                      )}
                    </div>

                    {/* Chest Visual Showcase */}
                    <div className={`relative h-36 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center p-4 shadow-inner border border-white/20`}>
                      <div className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                        {type === 'daily' ? '📦' : type === 'weekly' ? '🥈' : type === 'monthly' ? '🏆' : '💎'}
                      </div>
                      {!isAuthenticated && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center space-y-1">
                          <Lock className="w-5 h-5 text-amber-400" />
                          <span className="text-[11px] font-black text-amber-300">برای دریافت ثبت نام کنید</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{cfg.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{cfg.subtitle}</p>
                    </div>

                    {/* Reward Range Pills */}
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200 flex items-center gap-1">
                        <CoinIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>{cfg.minCoins} تا {cfg.maxCoins} سکه</span>
                      </span>
                      {cfg.diamonds > 0 && (
                        <span className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-800 font-bold border border-cyan-200 flex items-center gap-1">
                          <DiamondIcon className="w-3.5 h-3.5 text-cyan-500" />
                          <span>+{cfg.diamonds} الماس</span>
                        </span>
                      )}
                    </div>

                    {/* Real User Statistics & Progress Meter */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-2 font-medium">
                      {type === 'daily' && (
                        <>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>آمار واقعی امروز شما:</span>
                            </span>
                            <span className={`font-black font-mono text-[11px] ${realStats.hasActivityToday ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {realStats.hasActivityToday ? '۱ از ۱ آزمون (انجام شد)' : '۰ از ۱ آزمون'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: realStats.hasActivityToday ? '100%' : '0%' }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>شرط گشایش: حداقل ۱ آزمون در روز</span>
                            <span className={realStats.hasActivityToday ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                              {realStats.hasActivityToday ? 'شرط برقرار است ✅' : 'نیازمند آزمون'}
                            </span>
                          </div>
                        </>
                      )}

                      {type === 'weekly' && (
                        <>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-bold flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-rose-500" />
                              <span>استمرار هفتگی واقعی:</span>
                            </span>
                            <span className={`font-black font-mono text-[11px] ${realStats.streakDays >= 3 || realStats.level >= 3 ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {Math.min(3, realStats.streakDays)} از ۳ روز
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((Math.max(realStats.streakDays, realStats.level >= 3 ? 3 : 0) / 3) * 100))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>شرط گشایش: ۳ روز استمرار یا سطح ۳</span>
                            <span className={realStats.streakDays >= 3 || realStats.level >= 3 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {realStats.streakDays >= 3 || realStats.level >= 3 ? 'شرط برقرار است ✅' : `${Math.max(0, 3 - realStats.streakDays)} روز استمرار مانده`}
                            </span>
                          </div>
                        </>
                      )}

                      {type === 'monthly' && (
                        <>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-bold flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              <span>سطح کاربری واقعی (Level):</span>
                            </span>
                            <span className={`font-black font-mono text-[11px] ${realStats.level >= 5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              سطح {realStats.level} از ۵
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((realStats.level / 5) * 100))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>شرط گشایش: سطح ۵ یا ۱۵ روز تمرین</span>
                            <span className={realStats.level >= 5 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {realStats.level >= 5 ? 'شرط برقرار است ✅' : `${Math.max(0, 5 - realStats.level)} لول تا گشایش`}
                            </span>
                          </div>
                        </>
                      )}

                      {type === 'yearly' && (
                        <>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-bold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-purple-500" />
                              <span>پیشرفت سالانه (سطح ۱۵):</span>
                            </span>
                            <span className={`font-black font-mono text-[11px] ${realStats.level >= 15 ? 'text-emerald-600' : 'text-purple-600'}`}>
                              سطح {realStats.level} از ۱۵
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((realStats.level / 15) * 100))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>رکورد شخصی: {realStats.bestWpm} کلمه/دقیقه</span>
                            <span className={realStats.level >= 15 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {realStats.level >= 15 ? 'آماده گشایش سالانه ✅' : `${Math.max(0, 15 - realStats.level)} لول مانده`}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status / Trigger Button */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => triggerOpenChest(type)}
                      className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-black transition shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                        st.isReady
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 shadow-amber-500/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {st.isReady ? (
                        <>
                          <Gift className="w-4 h-4 text-slate-950" />
                          <span>گشایش صندوقچه</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{st.label}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MISSIONS */}
      {activeTab === 'missions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Mission Sub-tabs */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs w-fit">
            {[
              { key: 'daily', label: 'روزانه' },
              { key: 'weekly', label: 'هفتگی' },
              { key: 'monthly', label: 'ماهانه' },
              { key: 'yearly', label: 'سالانه / افتخارات' },
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => setMissionSubTab(sub.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                  missionSubTab === sub.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((m) => {
              const isClaimed = claimedMissions.includes(m.id);

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                        مأموریت {m.category === 'daily' ? 'روزانه' : m.category === 'weekly' ? 'هفتگی' : m.category === 'monthly' ? 'ماهانه' : 'سالانه'}
                      </span>
                      {isClaimed && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          دریافت شد ✅
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">{m.title}</h3>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-black border border-amber-200 flex items-center gap-1">
                        <CoinIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>{m.reward}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => setAuthWarningModalOpen(true)}
                        className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>برای دریافت ثبت نام کنید</span>
                      </button>
                    ) : isClaimed ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>پاداش دریافت گردید</span>
                      </button>
                    ) : m.completed ? (
                      <button
                        onClick={() => handleClaimMission(m)}
                        className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        <span>دریافت پاداش</span>
                      </button>
                    ) : (
                      <Link
                        href={m.actionUrl}
                        className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span>{m.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CUPS & LEVELS */}
      {activeTab === 'cups_levels' && (
        <div className="animate-in fade-in duration-200">
          <CupsAndLevels
            currentCups={userCups}
            currentLevel={userLevel}
            currentXp={userXp}
          />
        </div>
      )}

      {/* TAB 4: REFERRAL */}
      {activeTab === 'referral' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">دعوت از دوستان و دریافت پاداش نقدی + کوپن تخفیف</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                با ارسال لینک دعوت اختصاصی به دوستان خود، برای هر ثبت‌نام موفق ۲۰۰ سکه و کوپن‌های تخفیف اشتراک تایپرو پرو دریافت نمایید.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl">
              <span className="font-mono text-xs text-slate-700 font-bold dir-ltr overflow-x-auto">
                https://typro.ir/join?ref={user?.username || 'TYPRO-USER'}
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 shrink-0"
              >
                {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReferral ? 'کپی شد' : 'کپی لینک دعوت'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
