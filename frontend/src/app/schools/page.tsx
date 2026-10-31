'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  School,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  BookOpen,
  Keyboard,
  Award,
  Zap,
  Users,
  ShieldCheck,
  Trophy,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SchoolsPage() {
  const [notifyInput, setNotifyInput] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyInput.trim()) {
      setNotified(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-12" dir="rtl">
      {/* Coming Soon Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl text-center space-y-6">
        {/* Glow Ambient Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge: EXACT USER REQUEST TEXT */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-black shadow-inner z-10 relative animate-pulse">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>به زودی در آپدیت بعدی سایت</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-2xl mx-auto z-10 relative">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            سامانه مدارس و کلاس‌های هوشمند تایپ
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-lg sm:text-2xl mt-1">
              (Schools & Classrooms LMS)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            پلتفرم ویژه دبیران کاروفناوری، هنرستان‌ها، دانشگاه‌ها و آموزشگاه‌های آزاد جهت تشکیل کلاس درس آنلاین، تکلیف‌دهی و تصحیح خودکار با هوش مصنوعی در دست آماده‌سازی نهایی است و در آپدیت بعدی رونمایی خواهد شد.
          </p>
        </div>

        {/* Early Access Notification Form */}
        <div className="max-w-md mx-auto pt-4 z-10 relative">
          {notified ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>ایمیل یا شماره شما با موفقیت ثبت شد! به محض انتشار نسخه مدارس مطلع خواهید شد.</span>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={notifyInput}
                onChange={(e) => setNotifyInput(e.target.value)}
                placeholder="شماره موبایل یا ایمیل خود را وارد کنید..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-blue-400 font-sans"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 whitespace-nowrap active:scale-95"
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
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
            امکانات در حال توسعه برای آپدیت بعدی
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            امکانات ویژه مدارس در نسخه جدید تایپرو
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">تشکیل کلاس با کد اختصاصی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تعریف کلاس برای هر پایه تحصیلی، تولید کد کلاسی منحصربه‌فرد و عضویت آنی دانش‌آموزان.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">تصحیح خودکار با هوش مصنوعی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              سنجش بلادرنگ سرعت (WPM)، دقت و خطاهای تکالیف تایپ بدون نیاز به صرف وقت برای تصحیح دستی.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">المپیاد تایپ دانش‌آموزی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              برگزاری مسابقات رسمی بین مدارس و مناطق آموزشی جهت کشف و معرفی تایپیست‌های برتر کشور.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">صدور گواهی معتبر کلاسی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              صدور گواهی پایان دوره مهارت تایپ ده‌انگشتی با QR کد استعلام آنلاین برای کارنامه دانش‌آموزان.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h4 className="font-black text-sm text-slate-800">
            تا زمان آماده‌سازی سامانه مدارس، سایر بخش‌های فعال را تجربه کنید:
          </h4>
          <p className="text-xs text-slate-500">
            آکادمی دروس، تمرینات تطبیقی و رقابت زنده اتومبیل‌رانی هم‌اکنون به صورت کامل فعال است.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/lessons"
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition shadow-xs flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>آکادمی دروس</span>
          </Link>

          <Link
            href="/live-race"
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>رقابت زنده تایپ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
