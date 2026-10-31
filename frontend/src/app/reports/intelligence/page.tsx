'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Zap,
  Target,
  Gauge,
  Shield,
  Award,
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Crown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TypingDnaPage() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [heatmapLang, setHeatmapLang] = useState<'fa' | 'en'>('fa');

  useEffect(() => {
    const checkSub = () => {
      if (typeof window === 'undefined') return;
      const plan = localStorage.getItem('typro_user_subscription');
      const isSub = localStorage.getItem('typro_user_is_subscribed');
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      setIsSubscribed(isAdmin || plan === 'premium-monthly' || plan === 'premium-yearly' || isSub === 'true');
    };
    checkSub();
    window.addEventListener('storage', checkSub);
    return () => window.removeEventListener('storage', checkSub);
  }, [user]);

  // Dimensions per Section 94: speed, accuracy, consistency, reaction, endurance, Persian, English
  const dnaDimensions = [
    { label: 'سرعت واکنش عضلانی (Reaction)', score: 92, status: 'فوق‌العاده', color: 'bg-blue-600' },
    { label: 'دقت ضربه‌زنی (Accuracy)', score: 98, status: 'بی‌نقص', color: 'bg-emerald-600' },
    { label: 'پایداری ریتم (Consistency)', score: 88, status: 'بسیار خوب', color: 'bg-indigo-600' },
    { label: 'استقامت تایپ طولانی (Endurance)', score: 85, status: 'خوب', color: 'bg-amber-600' },
    { label: 'تسلط زبان فارسی (Persian Mastery)', score: 96, status: 'پیشرفته', color: 'bg-purple-600' },
    { label: 'تسلط زبان انگلیسی (English Mastery)', score: 80, status: 'متوسط به بالا', color: 'bg-cyan-600' },
  ];

  // Section 95: Keyboard Heatmap keys data
  const heatmapDataFa = [
    { key: 'ت', status: 'strong', freq: 420, errorRate: '1%' },
    { key: 'ب', status: 'strong', freq: 380, errorRate: '1%' },
    { key: 'م', status: 'strong', freq: 310, errorRate: '2%' },
    { key: 'ن', status: 'weak', freq: 190, errorRate: '14%' },
    { key: 'ک', status: 'strong', freq: 240, errorRate: '2%' },
    { key: 'ظ', status: 'weak', freq: 45, errorRate: '22%' },
    { key: 'ژ', status: 'weak', freq: 20, errorRate: '35%' },
    { key: 'پ', status: 'medium', freq: 80, errorRate: '8%' },
    { key: 'Shift', status: 'medium', freq: 150, errorRate: '6%' },
  ];

  const heatmapDataEn = [
    { key: 'E', status: 'strong', freq: 650, errorRate: '0.8%' },
    { key: 'T', status: 'strong', freq: 520, errorRate: '1.2%' },
    { key: 'A', status: 'strong', freq: 490, errorRate: '1.5%' },
    { key: 'O', status: 'strong', freq: 460, errorRate: '1.4%' },
    { key: 'B', status: 'weak', freq: 120, errorRate: '16%' },
    { key: 'Z', status: 'weak', freq: 35, errorRate: '28%' },
    { key: 'Q', status: 'weak', freq: 25, errorRate: '31%' },
    { key: 'P', status: 'medium', freq: 180, errorRate: '7%' },
    { key: 'Space', status: 'strong', freq: 720, errorRate: '0.2%' },
  ];

  const activeHeatmap = heatmapLang === 'fa' ? heatmapDataFa : heatmapDataEn;

  // Finger Workload Balance (Left Hand vs Right Hand)
  const fingerWorkload = [
    { finger: 'انگشت کوچک (Pinky)', left: '۹٪', right: '۱۲٪', status: 'نیاز به تقویت' },
    { finger: 'انگشت حلقه (Ring)', left: '۱۴٪', right: '۱۵٪', status: 'متعادل' },
    { finger: 'انگشت میانی (Middle)', left: '۱۸٪', right: '۱۹٪', status: 'قدرتمند' },
    { finger: 'انگشت اشاره (Index)', left: '۲۸٪', right: '۲۶٪', status: 'فوق‌العاده' },
    { finger: 'شست‌ها (Space)', left: '۱۵٪', right: '۱۸٪', status: 'پیوسته' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" dir="rtl">
      {/* Active Subscription Banner */}
      {isSubscribed && (
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 border-2 border-emerald-400 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <span>اشتراک تایپرو پرو برای شما فعال است</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                  VIP PRO
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                تمامی ابزارهای عصب‌شناختی Typing DNA، بالانس عضلانی انگشتان و نقشه حرارتی زنده کیبورد آنلاک بوده و فعال می‌باشند.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-bold">
            <Link
              href="/subscription"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              مدیریت اشتراک
            </Link>
          </div>
        </div>
      )}

      {/* Regular User Callout Banner (اگر کاربر اشتراک ندارد: اشتراک تایپرو را تهیه کن) */}
      {!isSubscribed && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              🔒
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px]">
                  ویژه مشترکین پرو
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  اشتراک تایپرو را تهیه کن
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium max-w-2xl">
                تحلیل عمیق ژنتیک تایپ (Typing DNA)، نقشه حرارتی کیبورد (Heatmap)، شناسایی خطای تک‌تک کلیدها و توزیع بار عضلانی انگشتان برای کاربران عادی قفل است. با تهیه اشتراک تایپرو پرو به این بخش دسترسی نامحدود خواهید داشت.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/subscription"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4" />
              <span>ارتقاء به اشتراک پرو (۱۵۰,۰۰۰ تومان)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            سیستم تحلیل هوشمند Typro Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Typing DNA و نقشه حرارتی صفحه‌کلید (Heatmap)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          تحلیل عصب‌شناختی الگوی ضربه‌زنی، توزیع بار انگشتان و کشف دقیق کلیدهای ضعیف جهت ارتقای هوشمندانه سرعت و رفع خستگی عضلانی.
        </p>
      </div>

      {/* Typing DNA Radar / Dimension Meters (Section 94) */}
      <div className="relative">
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 transition-all ${
          !isSubscribed ? 'filter blur-[2px] opacity-60 pointer-events-none select-none' : ''
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>ابعاد ۶ گانه ژنتیک تایپ (Typing DNA)</span>
            </h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              شاخص کل: ۹۰ / ۱۰۰
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dnaDimensions.map((dim, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{dim.label}</span>
                  <span className="text-slate-900 font-mono">{dim.score}٪ ({dim.status})</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${dim.color} rounded-full transition-all duration-700`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lock Overlay for DNA */}
        {!isSubscribed && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-3 z-10 border border-slate-700/50">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/30">
              🔒
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base sm:text-lg font-black text-white">اشتراک تایپرو را تهیه کن</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                تحلیل عمیق ژنتیک تایپ (Typing DNA) و سنجش تعادل عضلانی تنها با اشتراک پرو در دسترس است.
              </p>
            </div>
            <Link
              href="/subscription"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition"
            >
              ارتقاء به اشتراک پرو (۱۵۰ تومن)
            </Link>
          </div>
        )}
      </div>

      {/* Finger Workload Balance (Section 96) */}
      <div className="relative">
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 transition-all ${
          !isSubscribed ? 'filter blur-[2px] opacity-60 pointer-events-none select-none' : ''
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-600" />
                <span>توزیع بار عضلانی دست‌ها (Finger Workload Balance)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">تعادل مطلوب میان فشار دست چپ و راست برای جلوگیری از خستگی دست</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">دست چپ: ۴۹٪</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">دست راست: ۵۱٪</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {fingerWorkload.map((fw, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-800 block truncate">{fw.finger}</span>
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-black">
                  <span className="text-blue-600">{fw.left}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-indigo-600">{fw.right}</span>
                </div>
                <span className="text-[10px] text-slate-400 block">{fw.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard Heatmap (Section 95) */}
      <div className="relative">
        <div className={`bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 transition-all ${
          !isSubscribed ? 'filter blur-[2px] opacity-60 pointer-events-none select-none' : ''
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>نقشه حرارتی کلیدها (Keyboard Heatmap)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">توزیع خطا و فراوانی استفاده بر مبنای ضربات ثبت‌شده در کیبورد</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  onClick={() => setHeatmapLang('fa')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    heatmapLang === 'fa' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  فارسی (ISIRI 9147)
                </button>
                <button
                  onClick={() => setHeatmapLang('en')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    heatmapLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  انگلیسی (QWERTY)
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">قدرتمند</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300">متوسط</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-300">نیازمند تمرین</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
            {activeHeatmap.map((item, idx) => {
              let bgClr = 'bg-slate-800 border-slate-700';
              if (item.status === 'strong') bgClr = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300';
              else if (item.status === 'weak') bgClr = 'bg-red-950/60 border-red-500/60 text-red-300 animate-pulse';
              else bgClr = 'bg-amber-950/60 border-amber-500/60 text-amber-300';

              return (
                <div key={idx} className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 ${bgClr}`}>
                  <span className="text-xl font-bold font-mono">{item.key}</span>
                  <span className="text-[10px] text-slate-400">خطا: {item.errorRate}</span>
                </div>
              );
            })}
          </div>

          {/* AI Smart Coaching Advice (Section 92 & 93) */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                <span>توصیه اختصاصی مربی هوشمند:</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                بیشترین خطای انگشتان شما در کیبورد {heatmapLang === 'fa' ? 'فارسی مربوط به کلیدهای «ژ» و «ظ»' : 'انگلیسی مربوط به کلیدهای «B» و «Z»'} است. انجام تمرینات متمرکز می‌تواند نرخ خطای شما را زیر ۲ درصد کاهش دهد.
              </p>
            </div>

            <Link
              href="/practice"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition shadow-xs"
            >
              <span>آغاز تمرین جبرانی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Lock Overlay for Keyboard Heatmap */}
        {!isSubscribed && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center text-center p-6 space-y-4 z-10 border border-slate-700">
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-xl shadow-amber-500/30">
              🔒
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-xl sm:text-2xl font-black text-white">اشتراک تایپرو را تهیه کن</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                نقشه حرارتی کلیدها، میزان خطای تفکیک‌شده هر دکمه و تمرینات تطبیقی مربی هوشمند برای حساب شما قفل است. با تهیه اشتراک تایپرو پرو، نقشه حرارتی کیبورد برای شما فعال می‌شود.
              </p>
            </div>
            <Link
              href="/subscription"
              className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition transform hover:scale-105 flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>ارتقاء به اشتراک پرو (۱۵۰,۰۰۰ تومان)</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
