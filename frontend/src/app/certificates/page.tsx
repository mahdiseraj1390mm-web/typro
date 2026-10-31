'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  QrCode,
  FileCheck,
  Sparkles,
  Printer,
  Globe2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CertificatesPage() {
  const [notifyInput, setNotifyInput] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyInput.trim()) {
      setNotified(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const certificateFeatures = [
    {
      icon: <QrCode className="w-6 h-6 text-blue-500" />,
      title: 'استعلام آنلاین با کد رهگیری اختصاصی و QR Code',
      desc: 'هر مدرک دارای صفحه اختصاصی راستی‌آزمایی در دامنه typro.ir/verify است که کارفرمایان و سازمان‌ها می‌توانند اصالت آن را فوراً تایید کنند.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: 'امضای دیجیتال و هش رمزنگاری‌شده (SHA-256)',
      desc: 'تضمین امنیت و عدم امکان جعل اطلاعات، شامل ثبت دقیق سرعت خالص (WPM)، درصد خطا و ریتم پایداری ضربات در آزمون رسمی.',
    },
    {
      icon: <Globe2 className="w-6 h-6 text-purple-500" />,
      title: 'صدور دو زبانه (فارسی و انگلیسی) بین‌المللی',
      desc: 'قابلیت استفاده در رزومه‌های کاری، پلتفرم‌های فریلنسری بین‌المللی (Upwork و Freelancer) و پرونده‌های مهاجرت کاری.',
    },
    {
      icon: <FileCheck className="w-6 h-6 text-amber-500" />,
      title: 'انطباق کامل با استاندارد ملی ایران (ISIRI 9147)',
      desc: 'ارزیابی مهارتی مطابق با استانداردهای مصوب سازمان اداری و استخدامی و دبیرخانه شورای عالی انفورماتیک.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-12" dir="rtl">
      {/* Coming Soon Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl text-center space-y-6">
        {/* Glow Ambient Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge: به زودی در آپدیت بعدی سایت */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-black shadow-inner z-10 relative animate-pulse">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>به زودی در آپدیت بعدی سایت</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-2xl mx-auto z-10 relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            سامانه صدور گواهینامه معتبر مهارت تایپ
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-200 text-lg sm:text-2xl mt-1">
              (Official Typing Proficiency Certificate)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            سامانه آزمون جامع، ثبت مدارک رسمی دوزبانه با کد رهگیری و بارکد هوشمند جهت ارائه به شرکت‌ها، سازمان‌ها و نهادهای بین‌المللی در آپدیت بعدی سایت به طور رسمی فعال خواهد شد.
          </p>
        </div>

        {/* Early Access Notification Form */}
        <div className="max-w-md mx-auto pt-4 z-10 relative">
          {notified ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>ایمیل یا شماره شما ثبت شد! به محض آغاز صدور رسمی مدارک، لینک شرکت در آزمون برای شما ارسال می‌گردد.</span>
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
                <span>اطلاع از فعال‌سازی گواهینامه</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            ویژگی‌ها و استانداردهای مدرک معتبر تایپرو
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            طراحی‌شده طبق ضوابط فنی استاندارد ملی ایران و معادل بین‌المللی تایپ سرعتی ده‌انگشتی
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificateFeatures.map((feat, idx) => (
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
          <h4 className="font-bold text-sm text-slate-800">آمادگی برای آزمون گواهینامه:</h4>
          <p className="text-xs text-slate-500">مهارت خود را در آزمون‌های سرعت و دقت محک بزنید تا هنگام فعال‌سازی بالاترین رتبه را کسب کنید.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/typing-test"
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition"
          >
            تمرین آزمون استاندارد
          </Link>
          <Link
            href="/lessons"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1"
          >
            <span>مشاهده دروس آموزشی</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
