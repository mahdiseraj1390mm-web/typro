'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award, CheckCircle2, Coins, Check, Gem, Trophy, Flame } from 'lucide-react';
import { ALL_SKINS, SKIN_CATEGORIES, SkinItem, SkinCategoryType, getSkinById } from '@/lib/skins';
import AnimatedVehicleSkin from '@/components/race/AnimatedVehicleSkin';
import CurrencyHUD, { CoinBadge, DiamondBadge } from '@/components/common/CurrencyHUD';
import { useAuth } from '@/context/AuthContext';

export default function StoreSkinsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState<SkinCategoryType>('all');
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
  const [equippedSkinId, setEquippedSkinId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('typro_equipped_skin') || 'skin-vw-beetle';
    }
    return 'skin-vw-beetle';
  });
  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_owned_skins');
      const parsed = saved ? JSON.parse(saved) : [];
      // Always include the free default starter skin
      if (!parsed.includes('skin-vw-beetle')) {
        parsed.unshift('skin-vw-beetle');
        localStorage.setItem('typro_owned_skins', JSON.stringify(parsed));
      }
      return parsed;
    }
    return ['skin-vw-beetle'];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const skins = ALL_SKINS;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuyOrEquip = (skin: SkinItem) => {
    if (equippedSkinId === skin.id) {
      showToast(`پوسته «${skin.name}» هم‌اکنون روی خودروی مسابقه شما مجهز است.`);
      return;
    }

    // اگر اسکین رایگان است یا قبلاً خریداری شده، فقط equip کن
    if (ownedSkins.includes(skin.id) || skin.priceCoins === 0) {
      const newOwned = ownedSkins.includes(skin.id) ? ownedSkins : [...ownedSkins, skin.id];
      setOwnedSkins(newOwned);
      setEquippedSkinId(skin.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_owned_skins', JSON.stringify(newOwned));
        localStorage.setItem('typro_equipped_skin', skin.id);
      }
      if (skin.priceCoins === 0) {
        showToast(`✅ پوسته رایگان «${skin.name}» مجهز شد.`);
      } else {
        showToast(`✅ پوسته «${skin.name}» با موفقیت برای مسابقات مجهز شد.`);
      }
      return;
    }

    // Purchase check for paid skins
    if (userCoins < skin.priceCoins) {
      showToast(`⚠️ موجودی ناکافی! شما به ${skin.priceCoins - userCoins} سکه دیگر نیاز دارید.`);
      return;
    }

    const newCoins = userCoins - skin.priceCoins;
    const newDiamonds = Math.max(0, userDiamonds - skin.priceDiamonds);
    const newOwned = [...ownedSkins, skin.id];

    setUserCoins(newCoins);
    setUserDiamonds(newDiamonds);
    setOwnedSkins(newOwned);
    setEquippedSkinId(skin.id);

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_coins', String(newCoins));
      localStorage.setItem('typro_user_diamonds', String(newDiamonds));
      localStorage.setItem('typro_owned_skins', JSON.stringify(newOwned));
      localStorage.setItem('typro_equipped_skin', skin.id);
    }
    showToast(`🎉 تبریک! پوسته متحرک «${skin.name}» با موفقیت خریداری و مجهز شد.`);
  };


  const filtered = activeFilter === 'all' ? skins : skins.filter((s) => s.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400">
              <Link
                href="/live-race?tab=skins"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                title="بازگشت به رقابت زنده"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/live-race" className="text-blue-400 hover:underline">
                رقابت زنده
              </Link>
              <span>/</span>
              <span className="text-slate-300">شوروم اختصاصی اسکین‌های مسابقه</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              فروشگاه اسکین و گاراژ اتومبیل‌رانی <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">تایپرو</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              پوسته‌های متحرک و منحصربه‌فرد را انتخاب و تجهیز کنید. هر پوسته به صورت خودکار در پیست مسابقات زنده فعال شده و هویت و انگیزه بصری شما را در رقابت‌های تایپ ارتقا می‌دهد.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-bold text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تجهیز ۱۰۰٪ بلادرنگ در مسابقات آنلاین
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Trophy className="w-3.5 h-3.5" />
                پاداش‌های قابل تبدیل به سکه و الماس
              </span>
            </div>
          </div>

          {/* Luxury Currency HUD */}
          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              موجودی کیف پول شما:
            </span>
            <CurrencyHUD
              coins={userCoins}
              diamonds={userDiamonds}
              size="lg"
              variant="glass"
              className="bg-slate-900/60 border-slate-700/60 shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          {SKIN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                activeFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.nameFa}</span>
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
          <span>پوسته فعال شما:</span>
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-black">
            {getSkinById(equippedSkinId).emoji} {getSkinById(equippedSkinId).name}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((skin) => {
          const isOwned = ownedSkins.includes(skin.id);
          const isEquipped = equippedSkinId === skin.id;

          return (
            <div
              key={skin.id}
              className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 p-5 space-y-4 ${
                isEquipped
                  ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Clean Animated Vehicle Display (No fire) */}
                <div className="relative rounded-2xl overflow-hidden shadow-inner">
                  <AnimatedVehicleSkin
                    skinId={skin.id}
                    size="preview"
                    isMoving={true}
                    showNitro={false}
                    showRoad={true}
                  />
                  {isEquipped && (
                    <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full bg-blue-600 text-white shadow-md">
                      <Check className="w-3.5 h-3.5" />
                      <span>مجهز روی خودروی شما</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-base sm:text-lg text-slate-900">{skin.name}</h3>
                    <span className="text-[11px] font-mono font-bold text-slate-400">{skin.englishName}</span>
                  </div>
                  <p className="text-[11px] font-black text-blue-600 mt-0.5">{skin.tagline}</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{skin.description}</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skin.features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/60 flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Luxury Currency Badges */}
                <div className="flex items-center gap-2">
                  <CoinBadge amount={skin.priceCoins} size="sm" variant="solid" />
                  {skin.priceDiamonds > 0 && (
                    <DiamondBadge amount={skin.priceDiamonds} size="sm" variant="solid" />
                  )}
                </div>

                <button
                  onClick={() => handleBuyOrEquip(skin)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 shadow-sm active:scale-98 ${
                    isEquipped
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-default'
                      : isOwned
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {isEquipped ? 'مجهز است' : isOwned ? 'تجهیز برای مسابقه' : 'خرید پوسته'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
