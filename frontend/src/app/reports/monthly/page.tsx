'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, ArrowRight, TrendingUp, ShieldCheck, Trophy, Zap, 
  Calendar, BookOpen, Sparkles, CheckCircle2, Flame, ArrowUpRight 
} from 'lucide-react';

export default function MonthlyReportPage() {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // 30 days activity heatmap data (intensity 0-4)
  const heatmapDays = [
    { day: 1, intensity: 2, words: 1200, wpm: 60 },
    { day: 2, intensity: 3, words: 1850, wpm: 64 },
    { day: 3, intensity: 1, words: 600, wpm: 62 },
    { day: 4, intensity: 4, words: 2400, wpm: 68 },
    { day: 5, intensity: 3, words: 1900, wpm: 66 },
    { day: 6, intensity: 0, words: 0, wpm: 0 },
    { day: 7, intensity: 2, words: 1400, wpm: 65 },
    { day: 8, intensity: 4, words: 2600, wpm: 70 },
    { day: 9, intensity: 3, words: 1750, wpm: 69 },
    { day: 10, intensity: 2, words: 1100, wpm: 67 },
    { day: 11, intensity: 4, words: 2800, wpm: 72 },
    { day: 12, intensity: 3, words: 2100, wpm: 71 },
    { day: 13, intensity: 1, words: 800, wpm: 70 },
    { day: 14, intensity: 4, words: 2500, wpm: 74 },
    { day: 15, intensity: 4, words: 2700, wpm: 75 },
    { day: 16, intensity: 3, words: 1950, wpm: 73 },
    { day: 17, intensity: 2, words: 1300, wpm: 72 },
    { day: 18, intensity: 4, words: 3100, wpm: 76 },
    { day: 19, intensity: 3, words: 2200, wpm: 75 },
    { day: 20, intensity: 0, words: 0, wpm: 0 },
    { day: 21, intensity: 4, words: 2900, wpm: 77 },
    { day: 22, intensity: 4, words: 3200, wpm: 78 },
    { day: 23, intensity: 3, words: 1800, wpm: 76 },
    { day: 24, intensity: 2, words: 1400, wpm: 75 },
    { day: 25, intensity: 4, words: 3000, wpm: 78 },
    { day: 26, intensity: 3, words: 1900, wpm: 77 },
    { day: 27, intensity: 4, words: 3400, wpm: 80 },
    { day: 28, intensity: 3, words: 2100, wpm: 79 },
    { day: 29, intensity: 2, words: 1200, wpm: 78 },
    { day: 30, intensity: 4, words: 2900, wpm: 81 },
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
            <Trophy className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              کارنامه جامع ماه جاری
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            گزارش ماهانه تایپ (Monthly Performance Review)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            تقویم تعاملی فعالیت ۳۰ روزه، صعود به لیگ الماس و حجم کلمات تولیدشده (بند ۳۷ و ۹۶).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs text-slate-500 font-bold">صعود رسمی به رده بالاتر</span>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl shadow-xs">
              💠
            </div>
            <div>
              <p className="font-extrabold text-base text-slate-900">لیگ الماس (Diamond)</p>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>ارتقا از لیگ پلاتین (+۱۵ WPM)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold">مجموع کل کلمات تایپ‌شده</span>
          <p className="text-3xl font-black text-slate-900 font-mono">۴۲,۸۵۰</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>معادل نگارش یک جلد کتاب ۲۰۰ صفحه‌ای</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-bold">نرخ پایداری ریتم ضربه‌زنی</span>
          <p className="text-3xl font-black text-blue-600 font-mono">۹۲٪</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>توزیع بهینه و یکنواخت تایم اینتروال</span>
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              نقشه حرارتی فعالیت ۳۰ روز اخیر (Monthly Typing Heatmap)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>کمتر</span>
            <span className="w-3 h-3 rounded bg-slate-100" />
            <span className="w-3 h-3 rounded bg-emerald-200" />
            <span className="w-3 h-3 rounded bg-emerald-400" />
            <span className="w-3 h-3 rounded bg-emerald-600" />
            <span className="w-3 h-3 rounded bg-emerald-800" />
            <span>بیشتر</span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-3">
          {heatmapDays.map((d, idx) => {
            const colors = [
              'bg-slate-100 border-slate-200 text-slate-400',
              'bg-emerald-100 border-emerald-200 text-emerald-800',
              'bg-emerald-300 border-emerald-400 text-emerald-950',
              'bg-emerald-500 border-emerald-600 text-white',
              'bg-emerald-700 border-emerald-800 text-white font-black',
            ];
            const isSelected = selectedDayIndex === idx;

            return (
              <div
                key={d.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer space-y-0.5 ${colors[d.intensity]} ${
                  isSelected ? 'ring-2 ring-blue-500 scale-105 shadow-md' : 'hover:scale-102'
                }`}
              >
                <span className="text-[10px] block opacity-80">روز {d.day}</span>
                <span className="font-mono text-xs block">{d.wpm > 0 ? `${d.wpm}` : '-'}</span>
                <span className="text-[9px] block opacity-75">{d.words > 0 ? `${d.words} کلمه` : 'استراحت'}</span>
              </div>
            );
          })}
        </div>

        {selectedDayIndex !== null && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700 animate-in fade-in">
            <span>
              اطلاعات روز {heatmapDays[selectedDayIndex].day}: تایپ <strong>{heatmapDays[selectedDayIndex].words} کلمه</strong> با سرعت میانگین <strong>{heatmapDays[selectedDayIndex].wpm} WPM</strong>
            </span>
            <button
              onClick={() => setSelectedDayIndex(null)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              بستن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
