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
import { useAuth } from '@/context/AuthContext';

export default function VipWelcomeModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user is already subscribed
    const isSubscribed =
      user?.isSubscribed ||
      localStorage.getItem('typro_user_is_subscribed') === 'true';

    if (isSubscribed) return;

    // Check if modal was already shown in this session
    const seen = sessionStorage.getItem('typro_vip_modal_seen');
    if (seen) return;

    // Display with a gentle 1.5s delay after page loads
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('typro_vip_modal_seen', 'true');

      // Also ensure VIP notification is present in notifications
      try {
        const notifs = JSON.parse(localStorage.getItem('typro_user_notifications') || '[]');
        if (!notifs.some((n: any) => n.id === 'notif-vip-welcome')) {
          notifs.unshift({
            id: 'notif-vip-welcome',
            category: 'rewards',
            title: '👑 دعوت‌نامه ویژه: دسترسی نامحدود به تایپرو VIP',
            desc: 'با فعال‌سازی اشتراک ویژه، تمام پیست‌ها و ماشین‌ها باز شده و در هر مسابقه ۲ برابر سکه دریافت کنید!',
            time: 'امروز',
            read: false,
            actionLabel: 'مشاهده پلن‌ها و ارتقا',
            actionUrl: '/subscription',
          });
          localStorage.setItem('typro_user_notifications', JSON.stringify(notifs));
          window.dispatchEvent(new Event('typro_notifications_updated'));
        }
      } catch {}
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  if (!isOpen) return null;

  const handleGoToSubscription = () => {
    setIsOpen(false);
    router.push('/subscription');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow lights */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer z-10"
          title="بستن"
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

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              پیشنهاد طلایی ویژه کاربران جدید تایپرو
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              قفل تمام قابلیت‌ها را باز کنید: نسخه <span className="text-amber-400">VIP تایپرو</span>
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
              با فعال‌سازی اشتراک ویژه، تمام محدودیت‌ها برداشته شده و با بالاترین سرعت و بیشترین پاداش پیشرفت کنید:
            </p>
          </div>

          {/* Feature Benefit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-right">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">تمام پیست‌ها و ماشین‌ها باز</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  دسترسی نامحدود به تمامی اسکین‌ها و ماشین‌های اسپرت مسابقه
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition">
              <div className="p-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">سکه و امتیاز ۲ برابری (2X)</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  در هر رقابت زنده و تست تایپ، ۲ برابر سریع‌تر لول‌آپ شوید
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition">
              <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">نشان و مدال طلایی VIP</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  تگ متمایز و درخشان در کنار نام شما در لیدربرد و مسابقات
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5 hover:bg-white/[0.08] transition">
              <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">هوش مصنوعی و ۲۶۰+ درس</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  تحلیل عمیق عملکرد و گواهینامه‌های رسمی معتبر
                </div>
              </div>
            </div>
          </div>

          {/* Prompt banner */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-amber-200 font-medium text-[11px]">
              💳 پرداخت آسان کارت به کارت و تایید سریع توسط مدیریت
            </span>
            <span className="text-amber-400 font-black text-[11px] whitespace-nowrap">
              فعال‌سازی با فیش
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={handleGoToSubscription}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>مشاهده پلن‌ها و فعال‌سازی اشتراک</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-white/15 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              بعداً یادآوری کن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
