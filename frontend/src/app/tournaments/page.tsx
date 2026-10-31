'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Swords,
  Sparkles,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  Vote,
  Calendar,
  Award,
  Zap,
  ShieldCheck,
  Crown,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TournamentsPage() {
  const [notifyInput, setNotifyInput] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyInput.trim()) {
      setNotified(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const upcomingFeatures = [
    {
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      title: 'جوایز نقدی ۵۰ میلیون تومانی و تندیس زرین',
      desc: 'اهدای جوایز ارزنده نقدی و پوسته‌های نایاب اختصاصی به نفرات اول تا سوم هر هفته به همراه ثبت ابدی در تالار مشاهیر تایپ ایران.',
    },
    {
      icon: <Swords className="w-6 h-6 text-blue-500" />,
      title: 'جدول حذفی دوگانه استاندارد (Double Elimination)',
      desc: 'فرمت دوطرفه شامل براکت برندگان و شانس مجدد (بازندگان)؛ هر شرکت‌کننده برای حذف نهایی نیاز به ۲ باخت دارد.',
    },
    {
      icon: <Vote className="w-6 h-6 text-emerald-500" />,
      title: 'نظرسنجی ساعت مسابقه شنبه (بعدازظهر یا شب)',
      desc: 'ثبت‌نام پنج‌شنبه و جمعه هر هفته، با امکان رأی‌دهی به ساعت مسابقه شنبه (فقط بعدازظهر ساعت ۱۷:۰۰ یا شب ساعت ۲۱:۰۰ و نفی نوبت صبح).',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      title: 'داوری با آنتی‌چیت عصبی TyproGuard',
      desc: 'مانیتورینگ بی‌درنگ فرکانس ضربات کلیدها با تله‌متری در مقیاس میلی‌ثانیه جهت تایید اصالت مهارت دست‌های تایپیست‌ها.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-12" dir="rtl">
      {/* Coming Soon Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl text-center space-y-6">
        {/* Glow Ambient Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge: به زودی در آپدیت بعدی سایت */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-black shadow-inner z-10 relative animate-pulse">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>به زودی در آپدیت بعدی سایت</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-2xl mx-auto z-10 relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            تورنمنت‌ها و براکت‌های حذفی دوتایی
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 text-lg sm:text-2xl mt-1">
              (Tournaments & Double-Elimination Brackets)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            سامانه مسابقات رسمی هفتگی کشوری با جدول دوطرفه حذفی، جوایز نقدی ۵۰ میلیون تومانی، نظرسنجی ساعت برگزاری شنبه (بعدازظهر یا شب) و داوری هوش مصنوعی در دست آماده‌سازی نهایی است و در آپدیت بعدی رونمایی خواهد شد.
          </p>
        </div>

        {/* Early Access Notification Form */}
        <div className="max-w-md mx-auto pt-4 z-10 relative">
          {notified ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>شماره یا ایمیل شما با موفقیت ثبت شد! به محض آغاز مسابقات دوره اول مطلع خواهید شد.</span>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={notifyInput}
                onChange={(e) => setNotifyInput(e.target.value)}
                placeholder="شماره موبایل یا ایمیل خود را وارد کنید..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-amber-400 font-sans"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 whitespace-nowrap active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>مرا مطلع کن</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Roadmap Features Preview */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
            ویژگی‌های رسمی تورنمنت هفتگی برای آپدیت بعدی
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            استاندارد ورزش‌های الکترونیک تایپ ایران
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingFeatures.map((feat, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-amber-300 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-black text-slate-900 text-sm">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <Link
          href="/live-race"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <Zap className="w-4 h-4" />
          <span>تمرین در مسابقه سریع زنده</span>
        </Link>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <Link
          href="/rivals"
          className="text-red-600 hover:underline flex items-center gap-1"
        >
          <Swords className="w-4 h-4" />
          <span>دوئل‌های تن‌به‌تن و هماوردی</span>
        </Link>
      </div>
    </div>
  );
}
