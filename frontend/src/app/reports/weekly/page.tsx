'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CalendarRange, ArrowRight, Award, TrendingUp, Zap, Target, 
  Sparkles, CheckCircle2, ArrowUpRight, BarChart3, Activity 
} from 'lucide-react';

export default function WeeklyReportPage() {
  const days = [
    { day: 'شنبه', wpm: 62, tests: 8, acc: 97 },
    { day: 'یکشنبه', wpm: 65, tests: 10, acc: 98 },
    { day: 'دوشنبه', wpm: 68, tests: 12, acc: 98 },
    { day: 'سه‌شنبه', wpm: 72, tests: 14, acc: 99 },
    { day: 'چهارشنبه', wpm: 70, tests: 9, acc: 98 },
    { day: 'پنجشنبه', wpm: 75, tests: 16, acc: 99 },
    { day: 'جمعه', wpm: 78, tests: 15, acc: 99 },
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
            <CalendarRange className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              روند رشد و تثبیت هفتگی مهارت
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            کارنامه هفتگی تایپ (Weekly Progress Report)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            پایش تغییرات سرعت، تعادل کارکرد دستان و دستیابی به اهداف تمرینی هفتگی (بند ۳۷ و ۹۶).
          </p>
        </div>
      </div>

      {/* Growth Summary Box */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>شاخص جهش عصبی-عضلانی این هفته</span>
        </span>
        <h2 className="text-xl sm:text-3xl font-black">
          شما این هفته سرعت خود را ۱۶ کلمه در دقیقه ارتقا داده‌اید! 🚀
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          میزان خطاهای بازگشتی کلیدهای شاخص «ت» و «ن» به زیر ۱٪ کاهش یافته و پایداری ریتم ضربه‌زنی دستان شما در مسابقات زنده به ۹۸٪ رسیده است.
        </p>
      </div>

      {/* 7 Days Bar Chart Simulation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>نمودار تغییرات سرعت میانگین روزهای هفته (WPM)</span>
          </h3>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>+۲۵.۸٪ رشد نسبت به ابتدای هفته</span>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 border-b border-slate-100 pb-2">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="font-mono text-xs font-black text-slate-800">{d.wpm}</span>
              <div
                className="w-full max-w-[44px] bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-2xl transition-all duration-500 group-hover:from-blue-700 group-hover:to-cyan-400 shadow-xs"
                style={{ height: `${(d.wpm / 100) * 100}%` }}
              />
              <span className="text-[11px] font-bold text-slate-600">{d.day}</span>
              <span className="text-[10px] text-slate-400 font-mono">{d.tests} آزمون</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bilateral Hand Load & Weekly Target Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Hand Load Balance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>توازن بار کاری دستان (Hand Load Balance)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              بسیار متعادل
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>دست چپ: ۴۸٪</span>
              <span>دست راست: ۵۲٪</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div className="h-full bg-blue-600" style={{ width: '48%' }} />
              <div className="h-full bg-cyan-500" style={{ width: '52%' }} />
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            انطباق ارگونومیک تایپ شما با استاندارد ISIRI 9147 از عدم فشار مضاعف بر مچ دست چپ یا راست حکایت دارد.
          </p>
        </div>

        {/* Weekly Goal Progress */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>هدف تمرینی هفتگی (Weekly Goal)</span>
            </h3>
            <span className="text-xs font-bold text-blue-600 font-mono">۸۴ / ۱۰۰ دقیقه</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>۱۶ دقیقه تا تکمیل هدف و دریافت صندوق هفتگی</span>
              <span className="font-bold text-emerald-600">۸۴٪ محقق شد</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            تنها ۱ مسابقه دیگر تا بازگشایی صندوق نقره‌ای هفتگی و کسب ۲۰۰ سکه جایزه باقی مانده است.
          </p>
        </div>
      </div>
    </div>
  );
}
