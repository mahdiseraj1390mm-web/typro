'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  ArrowLeft,
  Shield,
  Sparkles,
  Crosshair,
  Hand,
  Keyboard,
  Info,
  HelpCircle,
  Zap,
  Check
} from 'lucide-react';
import VirtualKeyboard from '@/components/typing/VirtualKeyboard';

interface FingerMapping {
  hand: 'left' | 'right';
  finger: string;
  fingerFa: string;
  keys: string[];
  color: string;
}

const FINGER_MAPPINGS: FingerMapping[] = [
  {
    hand: 'left',
    finger: 'pinky',
    fingerFa: 'انگشت کوچک دست چپ',
    keys: ['ض', 'ش', 'ظ', '۱', '~', 'Tab', 'Caps', 'Shift'],
    color: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  {
    hand: 'left',
    finger: 'ring',
    fingerFa: 'انگشت حلقه دست چپ',
    keys: ['ص', 'س', 'ط', '۲'],
    color: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    hand: 'left',
    finger: 'middle',
    fingerFa: 'انگشت میانی دست چپ',
    keys: ['ث', 'ی', 'ز', '۳'],
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    hand: 'left',
    finger: 'index',
    fingerFa: 'انگشت اشاره دست چپ',
    keys: ['ق', 'ف', 'ب (برآمدگی شاخص)', 'ر', 'ل', '۴', '۵'],
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    hand: 'right',
    finger: 'index',
    fingerFa: 'انگشت اشاره دست راست',
    keys: ['غ', 'ع', 'ت (برآمدگی شاخص)', 'ا', 'د', '۶', '۷'],
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  },
  {
    hand: 'right',
    finger: 'middle',
    fingerFa: 'انگشت میانی دست راست',
    keys: ['ه', 'ن', 'ذ', '۸'],
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    hand: 'right',
    finger: 'ring',
    fingerFa: 'انگشت حلقه دست راست',
    keys: ['خ', 'م', 'و', '۹'],
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    hand: 'right',
    finger: 'pinky',
    fingerFa: 'انگشت کوچک دست راست',
    keys: ['ح', 'ج', 'چ', 'ک', 'گ', 'پ', 'ژ', '۰', '-', '=', 'Enter', 'Backspace'],
    color: 'bg-pink-50 border-pink-200 text-pink-700',
  },
];

const ISIRI_SHORTCUTS = [
  { action: 'نیم‌فاصله استاندارد (ZWNJ)', shortcut: 'Shift + Space  یا  Ctrl + Shift + 2', example: 'می‌روم، کتاب‌ها' },
  { action: 'حرکت فتحه (ــَـ)', shortcut: 'Shift + A', example: 'کَتَبَ' },
  { action: 'حرکت کسره (ــِـ)', shortcut: 'Shift + D', example: 'بِسْمِ' },
  { action: 'حرکت ضمه (ــُـ)', shortcut: 'Shift + S', example: 'مُسْلِم' },
  { action: 'تنوین نصب (ــًـ)', shortcut: 'Shift + Q', example: 'مَثَلاً' },
  { action: 'تنوین جر (ــٍـ)', shortcut: 'Shift + E', example: 'یَوْمٍ' },
  { action: 'تنوین رفع (ــٌـ)', shortcut: 'Shift + W', example: 'کِتَابٌ' },
  { action: 'تشدید (ــّـ)', shortcut: 'Shift + F', example: 'محمّد' },
  { action: 'سکون (ــْـ)', shortcut: 'Shift + R', example: 'قُمْ' },
  { action: 'ویرگول فارسی (،)', shortcut: 'Shift + 7', example: 'ایران، وطن من' },
  { action: 'نقطه ویرگول (؛)', shortcut: 'Shift + ; (ک)', example: 'تلاش کرد؛ پیروز شد' },
  { action: 'گیومه فارسی (« »)', shortcut: 'Shift + L و Shift + K', example: '«تایپرو»' },
  { action: 'علامت سوال فارسی (؟)', shortcut: 'Shift + /', example: 'چگونه تایپ کنیم؟' },
];

export default function GuidePage() {
  const [selectedChar, setSelectedChar] = useState<string>('ت');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            مرجع جامع آموزش تایپ ده انگشتی و یادگیری کار با صفحه کلید (استاندارد ISIRI 9147)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
          آموزش تایپ ده انگشتی رایگان؛ راهنمای جامع یادگیری تایپ سریع و اصولی
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          یادگیری تایپ ده انگشتی (Touch Typing) بر پایه حافظه عضلانی، بدون نگاه به صفحه کلید، استقرار دقیق ۱۰ انگشت روی ردیف پایگاه و رعایت استانداردهای ملی نگارش فارسی و انگلیسی در تایپرو.
        </p>
      </div>

      {/* Core Methodology (3 Principles) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
            ۱
          </div>
          <h3 className="font-extrabold text-base text-slate-900">کلیدهای شاخص فیزیکی (Anchors)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            کلیدهای <strong>«ت»</strong> و <strong>«ب»</strong> در چیدمان استاندارد فارسی (و <strong>F</strong> و <strong>J</strong> در انگلیسی) دارای برآمدگی‌های لمسی هستند تا انگشتان اشاره بدون نگاه کردن به کیبورد، همواره جایگاه اصلی خود در ردیف میانی را بازیابند.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
            ۲
          </div>
          <h3 className="font-extrabold text-base text-slate-900">انضباط وظایف ۱۰ انگشت دست</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            هر کلید متعلق به یک انگشت مشخص است. حتی اگر در گام‌های اولیه احساس کندی داشتید، هرگز وظیفه یک انگشت را به انگشت دیگر نسپارید تا مسیرهای عصبی مغز (Synaptic Pathways) تثبیت گردند.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
            ۳
          </div>
          <h3 className="font-extrabold text-base text-slate-900">اولویت دقت بر سرعت (Accuracy First)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            سرعت نتیجه خودکار و طبیعی دقت بالاست. همواره روی ثبت ضربه درست تمرکز کنید؛ در صورت خطا، با کلید Backspace آن را فوراً اصلاح نمایید تا عادت غلط در انگشتان شما ریشه ندواند.
          </p>
        </div>
      </div>

      {/* Interactive Virtual Keyboard Preview & Key Explorer */}
      <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-blue-600" />
              <span>شبیه‌ساز بصری صفحه‌کلید استاندارد فارسی و کلید هدف</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              کلید هدف جاری: <strong className="text-blue-600 font-mono text-sm">«{selectedChar}»</strong> (با کلیک روی حروف پایین، مکان کلید روی کیبورد هایلایت می‌شود)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['ت', 'ب', 'م', 'س', 'ر', 'ا', 'د', 'ک', 'و', 'ز'].map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChar(ch)}
                className={`w-8 h-8 rounded-xl font-bold transition ${
                  selectedChar === ch
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <VirtualKeyboard
          language="fa"
          currentExpectedChar={selectedChar}
          isError={false}
          showHandsGuide={true}
        />
      </div>

      {/* 10-Finger Mapping Matrix (ISIRI 9147) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Hand className="w-5 h-5 text-blue-600" />
            <span>ماتریس تخصیص حروف به ۱۰ انگشت دست (استاندارد ملی ۹۱۴۷)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تقسیم وظایف انگشتان دست چپ و راست طبق چیدمان رسمی کیبورد فارسی مصوب سازمان ملی استاندارد ایران.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FINGER_MAPPINGS.map((fm, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition space-y-3 ${fm.color}`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase block tracking-wider">
                  {fm.hand === 'left' ? 'دست چپ (Left)' : 'دست راست (Right)'}
                </span>
                <h4 className="font-black text-xs sm:text-sm mt-0.5">{fm.fingerFa}</h4>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {fm.keys.map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedChar(k[0])}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-bold text-xs hover:border-blue-500 transition"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ISIRI 9147 Shortcuts & Punctuation Cheat-Sheet */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>جدول کلیدهای میانبر علائم نگارشی، تنوین و نشانه‌های فارسی</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            کلیدهای ترکیبی استاندارد ISIRI 9147 جهت تایپ متون رسمی، نیم‌فاصله‌ها و نامه‌نگاری‌های اداری.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ISIRI_SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:bg-slate-100/60 transition"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block">{sc.action}</span>
                <span className="text-[11px] text-slate-500">مثال: {sc.example}</span>
              </div>
              <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                {sc.shortcut}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posture & Ergonomics Advice */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-amber-400">ارگونومی و وضعیت صحیح فیزیکی بدن هنگام تایپ:</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>پشت خود را کاملاً صاف نگه دارید و کف پاها را روی زمین قرار دهید.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>مچ دست‌ها نباید روی لبه میز خم شود؛ دست‌ها باید در حالت معلق و آزاد باشند.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>صفحه نمایش در امتداد سطح چشم با زاویه ۹۰ درجه آرنج و فاصله ۵۰ تا ۷۰ سانتی‌متر باشد.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>قانون ۲۰-۲۰-۲۰: هر ۲۰ دقیقه تایپ، ۲۰ ثانیه به فاصله‌ای در ۶ متری نگاه کنید.</span>
          </li>
        </ul>
      </div>

      {/* CTA to start learning */}
      <div className="flex justify-center pt-2">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition"
        >
          <span>ورود به اولین درس آکادمی تایپ</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
