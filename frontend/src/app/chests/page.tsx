'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Sparkles, Gift, Clock, Lock, CheckCircle2, Coins, Gem, Zap, 
  ArrowRight, ShieldCheck, Trophy, LogIn, UserPlus, Flame 
} from 'lucide-react';
import ChestOpeningModal, { ChestType, ChestReward, CHEST_CONFIGS } from '@/components/rewards/ChestOpeningModal';
import CurrencyHUD from '@/components/common/CurrencyHUD';

const COOLDOWNS_MS: Record<ChestType, number> = {
  daily: 24 * 60 * 60 * 1000,          // 24 hours
  weekly: 7 * 24 * 60 * 60 * 1000,      // 7 days
  monthly: 30 * 24 * 60 * 60 * 1000,    // 30 days
  yearly: 365 * 24 * 60 * 60 * 1000,    // 365 days
  diamond: 365 * 24 * 60 * 60 * 1000,
};

const CHEST_CARDS: {
  type: ChestType;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  borderHover: string;
  iconBg: string;
  coinRange: string;
  diamondRange: string;
  xpValue: string;
  specialPerk?: string;
}[] = [
  {
    type: 'daily',
    title: 'صندوقچه روزانه',
    subtitle: 'پاداش ۲۴ ساعته سبک و منظم وفاداری',
    badge: 'سطح ۱ • روزانه',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    gradient: 'from-amber-900/40 via-amber-800/20 to-slate-900',
    borderHover: 'hover:border-amber-500/60',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
    coinRange: '۱۵ تا ۳۵ سکه',
    diamondRange: '۱ الماس',
    xpValue: '+۳۰ XP',
  },
  {
    type: 'weekly',
    title: 'صندوقچه هفتگی',
    subtitle: 'پاداش ۷ روز استمرار در تمرین و رقابت',
    badge: 'سطح ۲ • هفتگی',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    gradient: 'from-cyan-900/40 via-slate-800/20 to-slate-900',
    borderHover: 'hover:border-cyan-400/60',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    coinRange: '۱۲۰ تا ۲۵۰ سکه',
    diamondRange: '۵ الماس',
    xpValue: '+۱۵۰ XP',
    specialPerk: 'شانس دریافت بوستر شتاب',
  },
  {
    type: 'monthly',
    title: 'صندوقچه ماهانه',
    subtitle: 'پاداش ۳۰ روزه باارزش برای اعضای پیوسته',
    badge: 'سطح ۳ • ماهانه',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gradient: 'from-yellow-900/40 via-amber-800/20 to-slate-900',
    borderHover: 'hover:border-yellow-400/60',
    iconBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    coinRange: '۶۰۰ تا ۱,۲۰۰ سکه',
    diamondRange: '۲۵ الماس',
    xpValue: '+۶۰۰ XP',
    specialPerk: 'شانس دریافت اسکین‌های کمیاب',
  },
  {
    type: 'yearly',
    title: 'صندوقچه سالانه و ویژه',
    subtitle: 'سوپرپاداش سالانه با بیشترین و چشمگیرترین مقدار جوایز',
    badge: 'سطح ۴ • افسانه‌ای',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    gradient: 'from-fuchsia-900/40 via-indigo-900/20 to-slate-900',
    borderHover: 'hover:border-fuchsia-400/60',
    iconBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30',
    coinRange: '۵,۰۰۰ تا ۱۲,۰۰۰ سکه',
    diamondRange: '۱۵۰ الماس',
    xpValue: '+۳,۵۰۰ XP',
    specialPerk: 'گارانتی اسکین متحرک افسانه‌ای',
  },
];

export default function ChestsPage() {
  const { user, isAuthenticated } = useAuth();
  const [chestLastOpened, setChestLastOpened] = useState<Record<string, number>>({});
  const [activeModalChest, setActiveModalChest] = useState<ChestType | null>(null);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  const [userCoins, setUserCoins] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('typro_user_coins');
      if (stored !== null) return Number(stored);
      if (user?.coins !== undefined) return user.coins;
    }
    return user?.coins || 0;
  });

  const [userDiamonds, setUserDiamonds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('typro_user_diamonds');
      if (stored !== null) return Number(stored);
      if (user?.diamonds !== undefined) return user.diamonds;
    }
    return user?.diamonds || 0;
  });

  useEffect(() => {
    const syncCurrency = () => {
      if (typeof window === 'undefined') return;
      const c = Number(localStorage.getItem('typro_user_coins') ?? (user?.coins || 0));
      const d = Number(localStorage.getItem('typro_user_diamonds') ?? (user?.diamonds || 0));
      setUserCoins(c);
      setUserDiamonds(d);
    };
    syncCurrency();
    window.addEventListener('typro_economy_updated', syncCurrency);
    window.addEventListener('typro_currency_updated', syncCurrency);
    window.addEventListener('storage', syncCurrency);
    return () => {
      window.removeEventListener('typro_economy_updated', syncCurrency);
      window.removeEventListener('typro_currency_updated', syncCurrency);
      window.removeEventListener('storage', syncCurrency);
    };
  }, [user]);

  // Load cooldowns
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loaded: Record<string, number> = {};
    (['daily', 'weekly', 'monthly', 'yearly'] as const).forEach((t) => {
      const key = `typro_chest_cd_${t}`;
      const val = localStorage.getItem(key);
      if (val) loaded[t] = Number(val);
    });
    setChestLastOpened(loaded);

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const getCooldownRemainingMs = (type: ChestType): number => {
    const lastOpened = chestLastOpened[type] || 0;
    const cooldown = COOLDOWNS_MS[type];
    const diff = now - lastOpened;
    return Math.max(0, cooldown - diff);
  };

  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return 'آماده بازگشایی';
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (days > 0) {
      return `${days} روز و ${hours} ساعت دیگر`;
    }
    if (hours > 0) {
      return `${hours} ساعت و ${mins} دقیقه دیگر`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenChest = (type: ChestType) => {
    if (!isAuthenticated) return;
    const remaining = getCooldownRemainingMs(type);
    if (remaining > 0) {
      showToast(`این صندوقچه هنوز آماده نیست. زمان باقی‌مانده: ${formatCountdown(remaining)}`);
      return;
    }
    setActiveModalChest(type);
  };

  const handleClaimRewards = (rewards: ChestReward[]) => {
    if (!activeModalChest) return;
    const openedAt = Date.now();
    const updated = { ...chestLastOpened, [activeModalChest]: openedAt };
    setChestLastOpened(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`typro_chest_cd_${activeModalChest}`, String(openedAt));
    }

    let addedCoins = 0;
    let addedDiamonds = 0;
    let addedXp = 0;
    const addedSkins: string[] = [];

    rewards.forEach((r) => {
      if (r.type === 'coins') addedCoins += r.amount || 0;
      if (r.type === 'diamonds') addedDiamonds += r.amount || 0;
      if (r.type === 'xp') addedXp += r.amount || 0;
      if (r.type === 'skin' && r.badge) addedSkins.push(r.badge);
    });

    if (typeof window !== 'undefined') {
      const currentCoins = Number(localStorage.getItem('typro_user_coins') ?? (user?.coins || 0));
      const currentDiamonds = Number(localStorage.getItem('typro_user_diamonds') ?? (user?.diamonds || 0));
      const currentXp = Number(localStorage.getItem('typro_user_xp') ?? (user?.xp || 0));
      const currentLevel = Number(localStorage.getItem('typro_user_level') ?? (user?.level || 1));

      const nextCoins = currentCoins + addedCoins;
      const nextDiamonds = currentDiamonds + addedDiamonds;
      const nextXp = currentXp + addedXp;
      const nextLevel = Math.max(currentLevel, Math.floor(nextXp / 100) + 1);

      localStorage.setItem('typro_user_coins', String(nextCoins));
      localStorage.setItem('typro_user_diamonds', String(nextDiamonds));
      localStorage.setItem('typro_user_xp', String(nextXp));
      localStorage.setItem('typro_user_level', String(nextLevel));

      setUserCoins(nextCoins);
      setUserDiamonds(nextDiamonds);

      // Save unlocked skins to collection
      if (addedSkins.length > 0) {
        try {
          const rawOwned = localStorage.getItem('typro_owned_skins');
          const owned: string[] = rawOwned ? JSON.parse(rawOwned) : [];
          addedSkins.forEach((s) => {
            if (!owned.includes(s)) owned.push(s);
          });
          localStorage.setItem('typro_owned_skins', JSON.stringify(owned));
        } catch {}
      }

      // Update typro_user in localStorage so AuthContext and Header immediately have the updated numbers
      try {
        const rawUser = localStorage.getItem('typro_user');
        if (rawUser) {
          const userObj = JSON.parse(rawUser);
          userObj.coins = nextCoins;
          userObj.diamonds = nextDiamonds;
          userObj.xp = nextXp;
          userObj.level = nextLevel;
          localStorage.setItem('typro_user', JSON.stringify(userObj));
        }
      } catch {}

      // Dispatch synchronized global events
      window.dispatchEvent(new Event('typro_economy_updated'));
      window.dispatchEvent(new Event('typro_currency_updated'));
      window.dispatchEvent(new Event('typro_skins_updated'));

      // Persist to backend gamification endpoint if available
      const effectiveUserId = user?.id || localStorage.getItem('typro_user_id');
      if (effectiveUserId) {
        fetch('/api/gamification/record-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: effectiveUserId,
            username: user?.username || localStorage.getItem('typro_username'),
            displayName: user?.displayName || localStorage.getItem('typro_profile_name'),
            earnedXp: addedXp,
            earnedCoins: addedCoins,
            earnedDiamonds: addedDiamonds,
          }),
        }).catch(() => {});
      }
    }

    showToast(`🎉 تبریک! ${addedCoins > 0 ? `${addedCoins.toLocaleString('fa-IR')} سکه` : ''} ${addedDiamonds > 0 ? `و ${addedDiamonds} الماس` : ''} با موفقیت به کیف پول شما اضافه شد.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-amber-500/50 text-white font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  سامانه پاداش‌های دوره‌ای تایپرو
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  ویژه اعضای رسمی
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                تالار صندوقچه‌های جایزه <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-300">تایپرو</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                هر روز، هفته، ماه و سال با ورود به تایپرو صندوقچه‌های اختصاصی خود را باز کنید و سکه، الماس، XP و اسکین‌های نایاب دریافت نمایید.
              </p>
            </div>

            {/* Wallet Status */}
            {isAuthenticated && (
              <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  موجودی فعلی کیف پول شما:
                </span>
                <CurrencyHUD
                  coins={userCoins}
                  diamonds={userDiamonds}
                  size="lg"
                  variant="glass"
                  className="bg-slate-900/70 border-slate-700/70 shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Auth Gate Check: If User is Not Registered / Logged In */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 text-center space-y-6 shadow-2xl backdrop-blur-md max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                صندوقچه‌های جایزه مخصوص کاربران ثبت‌نام‌شده است
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                برای باز کردن صندوقچه‌ها و ذخیره دائمی سکه‌ها، الماس‌ها و اسکین‌ها در حساب کاربری خود، وارد شوید یا ثبت‌نام کنید.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login?tab=register"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>ثبت نام سریع در ۱۰ ثانیه</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>ورود به حساب کاربری</span>
              </Link>
            </div>
          </div>
        ) : (
          /* 4 Tiered Chests Grid (Ordered from Low to High) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHEST_CARDS.map((chest) => {
              const remaining = getCooldownRemainingMs(chest.type);
              const isReady = remaining <= 0;

              return (
                <div
                  key={chest.type}
                  className={`relative flex flex-col justify-between rounded-3xl p-6 bg-gradient-to-b ${chest.gradient} border border-slate-800 ${chest.borderHover} transition-all duration-300 shadow-xl group`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${chest.badgeColor}`}>
                      {chest.badge}
                    </span>
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        آماده!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
                        <Clock className="w-3 h-3 text-slate-500" />
                        در انتظار
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-3 mb-6 text-center">
                    <div className={`w-20 h-20 rounded-3xl ${chest.iconBg} mx-auto flex items-center justify-center border shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      <Gift className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{chest.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{chest.subtitle}</p>
                    </div>
                  </div>

                  {/* Rewards Breakdown (Scaling Low to High) */}
                  <div className="space-y-2 py-3 px-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6 text-xs">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        سکه طلایی:
                      </span>
                      <span>{chest.coinRange}</span>
                    </div>

                    <div className="flex items-center justify-between text-cyan-300 font-bold">
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        الماس نفیس:
                      </span>
                      <span>{chest.diamondRange}</span>
                    </div>

                    <div className="flex items-center justify-between text-purple-300 font-bold">
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        تجربه (XP):
                      </span>
                      <span>{chest.xpValue}</span>
                    </div>

                    {chest.specialPerk && (
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] font-bold text-fuchsia-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-fuchsia-400 shrink-0" />
                        <span>{chest.specialPerk}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenChest(chest.type)}
                    disabled={!isReady}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      isReady
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                        : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isReady ? (
                      <>
                        <Gift className="w-4 h-4 fill-current" />
                        <span>بازگشایی صندوقچه</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatCountdown(remaining)}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for opening chest */}
        {activeModalChest && (
          <ChestOpeningModal
            isOpen={true}
            chestType={activeModalChest}
            onClose={() => setActiveModalChest(null)}
            onClaimRewards={handleClaimRewards}
          />
        )}
      </div>
    </div>
  );
}
