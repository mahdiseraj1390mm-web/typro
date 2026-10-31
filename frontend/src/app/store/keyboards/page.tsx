'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Keyboard,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Truck,
  Cpu,
  Star,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KeyboardStorePage() {
  const [notifyInput, setNotifyInput] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyInput.trim()) {
      setNotified(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const keyboardFeatures = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'سوئیچ‌های مکانیکی خطی و بی‌صدا (Silent Linear)',
      desc: 'انتخاب اختصاصی سوئیچ‌های Cherry MX Red و Gateron Yellow با نرمی فوق‌العاده برای جلوگیری از خستگی تاندون دست در تایپ طولانی.',
    },
    {
      icon: <Keyboard className="w-6 h-6 text-blue-500" />,
      title: 'چیدمان استاندارد ملی ۹۱۴۷ با نیم‌فاصله سخت‌افزاری',
      desc: 'حک لیزری فابریک حروف فارسی و نمادها بر اساس استاندارد ملی ایران و کلید اختصاصی نیم‌فاصله در دسترس آسان انگشت شست.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: 'تست تخصصی با نرم‌افزار آزمایشگاهی تایپرو',
      desc: 'تک‌تک کیبوردها پیش از ارسال در لابراتوار تایپرو از نظر تاخیر پاسخ‌دهی (Latency زیر ۱ میلی‌ثانیه) و Anti-Ghosting کالیبره می‌شوند.',
    },
    {
      icon: <Truck className="w-6 h-6 text-purple-500" />,
      title: 'گارانتی طلایی تعویض ۲۴ ماهه و ارسال ایمن',
      desc: 'ضمانت تعویض بی‌قیدوشرط قطعات و سوئیچ‌ها، همراه با بسته‌بندی ضدضربه و ارسال پیشتاز به سراسر کشور.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-12" dir="rtl">
      {/* Coming Soon Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl text-center space-y-6">
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
            <Keyboard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            فروشگاه تخصصی کیبوردهای مکانیکی استاندارد
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-200 text-lg sm:text-2xl mt-1">
              (Mechanical Keyboards Hardware Store)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            مجموعه برگزیده کیبوردهای مکانیکی کاستوم، سوئیچ‌های بی‌صدا، کلیدهای PBT و ابزارهای ارگونومیک بهینه‌شده برای تایپیست‌های حرفه‌ای و شرکت‌کنندگان مسابقات زنده، در آپدیت بعدی سایت رونمایی خواهد شد.
          </p>
        </div>

        {/* Early Access Notification Form */}
        <div className="max-w-md mx-auto pt-4 z-10 relative">
          {notified ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>ایمیل یا شماره شما ثبت شد! به محض افتتاح فروشگاه، کد تخفیف ۲۰٪ افتتاحیه برای شما ارسال می‌شود.</span>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={notifyInput}
                onChange={(e) => setNotifyInput(e.target.value)}
                placeholder="شماره موبایل یا ایمیل خود را وارد کنید..."
                className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-amber-400 font-sans"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Bell className="w-4 h-4" />
                <span>اطلاع‌رسانی افتتاح فروشگاه</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Hardware Features Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            استانداردهای سخت‌افزاری فروشگاه کیبوردهای تایپرو
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            تجهیزاتی که با هماهنگی اساتید تایپ ده‌انگشتی و فیزیوتراپیست‌های ارگونومی انتخاب شده‌اند.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyboardFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-right">
          <h4 className="font-bold text-sm text-slate-800">تا زمان افتتاح فروشگاه، مهارت خود را بسنجید:</h4>
          <p className="text-xs text-slate-500">در پیست مسابقه زنده با سایر رقبا رقابت کنید یا تایپ خود را در آزمون رسمی محک بزنید.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/typing-test"
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
          >
            آزمون سرعت
          </Link>
          <Link
            href="/live-race"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1"
          >
            <span>ورود به پیست زنده</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
