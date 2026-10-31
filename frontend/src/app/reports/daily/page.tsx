'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, Zap, Target, ArrowRight, TrendingUp, 
  Sparkles, Award, ShieldCheck, Flame, AlertCircle, ArrowUpRight 
} from 'lucide-react';

export default function DailyReportPage() {
  const [selectedHour, setSelectedHour] = useState<string | null>('۱۸:۴۵');

  const hourlyBreakdown = [
    { time: '۰۹:۰۰', wpm: 58, acc: 97, keys: 'گرم کردن عضلات', fatigue: 'کم' },
    { time: '۱۱:۳۰', wpm: 66, acc: 98, keys: 'تایپ متون اداری', fatigue: 'پایین' },
    { time: '۱۴:۰۰', wpm: 72, acc: 99, keys: 'مسابقه زنده لابی', fatigue: 'متوسط' },
    { time: '۱۶:۱۵', wpm: 70, acc: 98, keys: 'تمرین کلیدهای ضعیف', fatigue: 'متوسط' },
    { time: '۱۸:۴۵', wpm: 76, acc: 99, keys: 'کاپ سرعتی عصرگاهی', fatigue: 'اوج عملکرد (Peak)' },
    { time: '۲۱:۰۰', wpm: 74, acc: 98, keys: 'مرور سوره مبارکه اخلاص', fatigue: 'خستگی ملایم' },
  ];

  const dailyWeakKeys = [
    { key: 'ژ', errors: 4, suggestion: 'جهش انگشت کوچک دست راست به ردیف بالا' },
    { key: 'ظ', errors: 3, suggestion: 'استقرار انگشت کوچک دست چپ روی ردیف پایین' },
    { key: 'ث', errors: 2, suggestion: 'تنظیم ارتفاع مچ دست' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
        <Link
          href="/reports"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              گزارش عملکرد ۲۴ ساعت گذشته
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            کارنامه روزانه تایپ (Daily Telemetry Report)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            سنجش خستگی عضلانی، قله‌های سرعتی و توزیع تمرینات شبانه‌روزی (بند ۳۷ و ۹۴).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">تعداد آزمون‌های امروز</span>
          <p className="text-2xl font-black text-slate-900 font-mono">۱۲</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+۴ نسبت به دیروز</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">بالاترین سرعت روز</span>
          <p className="text-2xl font-black text-blue-600 font-mono">۷۶ WPM</p>
          <span className="text-[10px] text-blue-600 font-bold">ثبت‌شده در ساعت ۱۸:۴۵</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">میانگین دقت ضربات</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">۹۸.۴٪</p>
          <span className="text-[10px] text-emerald-600 font-bold">پایداری استاندارد</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-bold">مدت کل تایپ فعال</span>
          <p className="text-2xl font-black text-purple-600 font-mono">۲۸ دقیقه</p>
          <span className="text-[10px] text-purple-600 font-bold">هدف روزانه محقق شد ✓</span>
        </div>
      </div>

      {/* Hourly Trend Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>روند تغییرات سرعت و خستگی در طول ساعات امروز</span>
          </h2>
          <span className="text-xs text-slate-400">روی هر بازه جهت مشاهده جزئیات کلیک کنید</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
          {hourlyBreakdown.map((h, i) => {
            const isSelected = selectedHour === h.time;
            return (
              <div
                key={i}
                onClick={() => setSelectedHour(h.time)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                <span className="text-slate-400 text-[11px] font-mono block">{h.time}</span>
                <p className="font-mono font-black text-slate-900 text-base">{h.wpm} WPM</p>
                <span className="text-emerald-600 font-bold text-[10px] block">{h.acc}٪ دقت</span>
                <span className="text-[10px] text-slate-500 block truncate" title={h.fatigue}>
                  {h.fatigue}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Weak Keys & Ergonomic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>کلیدهای با خطای تکراری در تمرینات امروز</span>
          </h3>
          <div className="space-y-3">
            {dailyWeakKeys.map((wk, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-mono font-black flex items-center justify-center text-sm shadow-xs">
                    {wk.key}
                  </span>
                  <div>
                    <span className="text-slate-800 font-bold block">{wk.suggestion}</span>
                    <span className="text-[10px] text-slate-400">تعداد خطا: {wk.errors} بار</span>
                  </div>
                </div>
                <Link
                  href="/practice"
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 font-bold text-[11px] hover:bg-blue-50"
                >
                  تمرین این کلید
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>ارزیابی هوش مصنوعی مربی تایپرو</span>
            </span>
            <h4 className="text-lg font-black">پایداری عصبی عضلانی عالی!</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ریتم ضربات شما در ساعت ۱۸:۴۵ به اوج هماهنگی رسیده و پایداری ضربات روی ۹۹٪ تثبیت شده است. جهت تثبیت این مهارت، روزانه حداقل یک مسابقه زنده در لیگ پلاتین پیشنهاد می‌شود.
            </p>
          </div>

          <div className="pt-2 border-t border-indigo-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">زنجیره استمرار فعال:</span>
            <span className="font-mono font-black text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>۱۴ روز متوالی</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
