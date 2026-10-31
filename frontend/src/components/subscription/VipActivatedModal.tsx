'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  ArrowLeft,
  Flame,
  Award,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

export default function VipActivatedModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [planName, setPlanName] = useState<string>('VIP طلایی');
  const [expiryText, setExpiryText] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkActivation = () => {
      const isSub =
        Boolean(user?.isSubscribed) ||
        localStorage.getItem('typro_user_is_subscribed') === 'true';

      if (!isSub) return;

      const activePlan =
        user?.subscriptionPlan ||
        user?.subscription ||
        localStorage.getItem('typro_user_subscription') ||
        'VIP طلایی';

      if (activePlan === 'رایگان' || activePlan === 'FREE') return;

      const userIdKey = user?.id || user?.username || 'me';
      const storageKey = `typro_vip_act_seen_${userIdKey}_${activePlan}`;

      // Show ONLY once per plan activation!
      if (localStorage.getItem(storageKey) === 'true') {
        return;
      }

      setPlanName(activePlan);

      const expiresAt =
        user?.subscriptionExpiresAt ||
        localStorage.getItem('typro_user_sub_expires_at');

      if (expiresAt) {
        try {
          const d = new Date(expiresAt);
          if (d.getFullYear() >= 2090) {
            setExpiryText('مادام‌العمر');
          } else {
            setExpiryText(d.toLocaleDateString('fa-IR'));
          }
        } catch {
          setExpiryText('فعال');
        }
      }

      // Gentle delay so UI finishes rendering
      const timer = setTimeout(() => {
        setIsOpen(true);
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.5 },
          });
        } catch {}

        // Ensure persistent notification exists in Notifications list
        try {
          const rawNotifs = localStorage.getItem('typro_user_notifications');
          const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
          const notifId = `notif-vip-active-${userIdKey}`;
          if (!notifs.some((n: any) => n.id === notifId || (n.category === 'rewards' && n.title?.includes('VIP شما فعال شد')))) {
            notifs.unshift({
              id: notifId,
              category: 'rewards',
              title: '👑 اشتراک ویژه VIP شما فعال شد!',
              desc: `طرح «${activePlan}» توسط مدیریت برای حساب کاربری شما با موفقیت فعال گردید. تمامی امکانات اختصاصی اکنون برای شما در دسترس است.`,
              time: 'هم‌اکنون',
              read: false,
              popupShown: true,
              actionLabel: 'مشاهده جزییات اشتراک',
              actionUrl: '/subscription',
            });
            localStorage.setItem('typro_user_notifications', JSON.stringify(notifs));
            window.dispatchEvent(new Event('typro_notifications_updated'));
          }
        } catch {}
      }, 1000);

      return () => clearTimeout(timer);
    };

    checkActivation();
    window.addEventListener('typro_subscription_updated', checkActivation);
    return () => window.removeEventListener('typro_subscription_updated', checkActivation);
  }, [user]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    const userIdKey = user?.id || user?.username || 'me';
    const storageKey = `typro_vip_act_seen_${userIdKey}_${planName}`;
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  const handleGoToSubscription = () => {
    handleDismiss();
    router.push('/subscription');
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow ambient background lights */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer z-10"
          title="بستن پیام"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Header Crown Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-amber-200">
            <Crown className="w-9 h-9 text-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400"></span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>وضعیت اشتراک: فعال شد ✓</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              تبریک! اشتراک ویژه VIP شما فعال گردید
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              طرح «<span className="text-amber-400 font-bold">{planName}</span>» {Boolean(user?.isDirectAdmin || user?.subscriptionMethod === 'direct_admin' || (typeof window !== 'undefined' && localStorage.getItem('typro_user_is_direct_admin') === 'true')) ? 'توسط مدیریت سیستم به صورت مستقیم' : 'توسط مدیریت'} برای حساب کاربری شما فعال شد.
              {expiryText && (
                <span className="block mt-1 text-slate-400 text-xs">
                  اعتبار طرح: <strong className="text-white">{expiryText}</strong>
                </span>
              )}
            </p>
          </div>

          {/* Unlocked Features List */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-right space-y-2.5 text-xs text-slate-200">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مزایای اختصاصی اکنون در دسترس شماست:</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>دسترسی به تمام پیست‌ها و اتاق‌های ویژه اتومبیل‌رانی</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>پوسته‌ها و اسکین‌های انحصاری خودرو و آواتار VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>۲ برابر سکه و جوایز بالاتر در تمام مسابقات و صندوق‌ها</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تحلیل عمیق هوش مصنوعی و آزمون‌های بدون محدودیت</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            این اعلان در بخش <Link href="/notifications" onClick={handleDismiss} className="text-amber-400 underline font-bold">اعلان‌های حساب شما</Link> نیز ذخیره شد تا در هر زمان بتوانید آن را مشاهده کنید.
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleGoToSubscription}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>مشاهده جزییات در صفحه اشتراک</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
