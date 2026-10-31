'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Award, ArrowRight, Trophy, Flame, Star, Sparkles, CheckCircle2, 
  Printer, Share2, Crown, Zap, Heart, ShieldCheck 
} from 'lucide-react';

export default function YearlyReportPage() {
  const milestones = [
    { month: 'فروردین', title: 'آغاز سفر ده‌انگشتی', desc: 'تکمیل دروس ردیف میانی آکادمی با سرعت ۲۲ WPM' },
    { month: 'تیر', title: 'شکستن مرز ۶۰ WPM', desc: 'دریافت گواهینامه مهارت نقره‌ای و ورود به لیگ طلا' },
    { month: 'مهر', title: 'صعود به لیگ الماس', desc: 'رسیدن به سرعت ۸۰ WPM و پیروزی در ۱۰ مسابقه زنده پیاپی' },
    { month: 'دی', title: 'فینالیست جام قهرمانی', desc: 'کسب مقام سوم در تورنمنت بزرگ زمستانه ورزش‌های الکترونیک' },
    { month: 'اسفند', title: 'حضور در جمع ۱٪ برتر کشور', desc: 'ثبت رکورد شخصی ۸۴ WPM با دقت ۹۹.۲٪' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                مرور کارنامه جامع سالانه (Year in Review)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              کارنامه سالانه تایپرو (Year in Review ۱۴۰۵)
            </h1>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>چاپ کارنامه سالانه</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden border border-indigo-900/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black inline-flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>جزو ۱٪ برتر تایپیست‌های سراسر کشور (Top 1% Typist)</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              یک سال تلاش، تحول و درخشش در تایپرو! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              شما با بیش از ۲۴۰ ساعت تمرین پیوسته، سرعت واکنش عضلانی خود را از ۲۲ کلمه به ۸۴ کلمه در دقیقه رساندید و نام خود را در تالار مشاهیر ثبت نمودید.
            </p>
          </div>

          <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10 shrink-0 space-y-1">
            <span className="text-xs text-slate-400 block">رتبه نهایی کشوری:</span>
            <div className="text-3xl font-black text-amber-400 font-mono">#۴۲</div>
            <span className="text-[11px] text-emerald-400 font-bold block">از میان ۵۸,۰۰۰ کاربر فعال</span>
          </div>
        </div>

        {/* 4 Big Annual Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 text-xs font-bold block">کل مسابقات زنده</span>
            <p className="text-2xl sm:text-3xl font-black font-mono text-white">۳۵۲</p>
            <span className="text-[10px] text-slate-500">مسابقه آنلاین</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 text-xs font-bold block">پیروزی‌های رتبه اول</span>
            <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400">۱۴۸</p>
            <span className="text-[10px] text-amber-400/70">۴۲٪ نرخ پیروزی</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 text-xs font-bold block">زنجیره استمرار رکورد</span>
            <p className="text-2xl sm:text-3xl font-black font-mono text-rose-400">۱۸۰ روز</p>
            <span className="text-[10px] text-rose-400/70">تمرین روزانه بدون وقفه</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 text-xs font-bold block">مدال‌های کسب‌شده</span>
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">۲۸ مدال</p>
            <span className="text-[10px] text-emerald-400/70">افتخارات آکادمی و کاپ</span>
          </div>
        </div>
      </div>

      {/* Annual Journey Milestones Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>نقاط عطف سفر یک‌ساله شما در تایپرو</span>
        </h3>

        <div className="relative border-r-2 border-slate-200 pr-6 space-y-6 mr-3">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600">{m.month}:</span>
                  <h4 className="font-extrabold text-sm text-slate-900">{m.title}</h4>
                </div>
                <p className="text-xs text-slate-500">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
