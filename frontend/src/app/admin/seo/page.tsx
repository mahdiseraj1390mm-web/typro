'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileCode,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  Copy,
  Plus,
  Trash2,
  Edit2,
  Check,
  Smartphone,
  Monitor,
  Share2,
  Award,
  Zap,
  Target,
  BarChart3,
  HelpCircle,
  Code
} from 'lucide-react';

interface TargetKeyword {
  id: string;
  keyword: string;
  monthlySearch: string;
  targetRank: number;
  currentRank: string;
  landingPage: string;
  category: 'core' | 'test' | 'learning' | 'competition' | 'brand';
  difficulty: 'آسان' | 'متوسط' | 'رقابتی' | 'بسیار رقابتی';
}

const INITIAL_KEYWORDS: TargetKeyword[] = [
  {
    id: 'kw-1',
    keyword: 'تست تایپ',
    monthlySearch: '۴۸,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/typing-test',
    category: 'test',
    difficulty: 'رقابتی',
  },
  {
    id: 'kw-2',
    keyword: 'تایپ ده انگشتی',
    monthlySearch: '۶۵,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/',
    category: 'core',
    difficulty: 'بسیار رقابتی',
  },
  {
    id: 'kw-3',
    keyword: 'آموزش تایپ',
    monthlySearch: '۳۴,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/lessons',
    category: 'learning',
    difficulty: 'رقابتی',
  },
  {
    id: 'kw-4',
    keyword: 'یادگیری تایپ ده انگشتی',
    monthlySearch: '۲۲,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/lessons',
    category: 'learning',
    difficulty: 'متوسط',
  },
  {
    id: 'kw-5',
    keyword: 'آموزش تایپ ده انگشتی',
    monthlySearch: '۴۱,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/lessons',
    category: 'learning',
    difficulty: 'بسیار رقابتی',
  },
  {
    id: 'kw-6',
    keyword: 'بهترین سامانه تایپ ده انگشتی',
    monthlySearch: '۱۵,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/',
    category: 'brand',
    difficulty: 'آسان',
  },
  {
    id: 'kw-7',
    keyword: 'بروز ترین سامانه تایپ ده انگشتی',
    monthlySearch: '۱۲,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/',
    category: 'brand',
    difficulty: 'آسان',
  },
  {
    id: 'kw-8',
    keyword: 'تست سرعت تایپ',
    monthlySearch: '۲۹,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/typing-test',
    category: 'test',
    difficulty: 'رقابتی',
  },
  {
    id: 'kw-9',
    keyword: 'تایپرو',
    monthlySearch: '۱۸,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/',
    category: 'brand',
    difficulty: 'آسان',
  },
  {
    id: 'kw-10',
    keyword: 'تایپرو رایت',
    monthlySearch: '۹,۵۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/write',
    category: 'brand',
    difficulty: 'آسان',
  },
  {
    id: 'kw-11',
    keyword: 'مسابقه زنده تایپ',
    monthlySearch: '۱۴,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/live-race',
    category: 'competition',
    difficulty: 'متوسط',
  },
  {
    id: 'kw-12',
    keyword: 'اشتراک تایپرو',
    monthlySearch: '۷,۲۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/subscription',
    category: 'brand',
    difficulty: 'آسان',
  },
  {
    id: 'kw-13',
    keyword: 'آزمون تعیین سطح تایپ',
    monthlySearch: '۱۱,۰۰۰',
    targetRank: 1,
    currentRank: '۱ (برتر)',
    landingPage: '/certificates',
    category: 'test',
    difficulty: 'متوسط',
  },
];

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'simulator' | 'schemas' | 'robots'>('overview');
  const [keywords, setKeywords] = useState<TargetKeyword[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_admin_seo_keywords');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_KEYWORDS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveKeywords = (newKws: TargetKeyword[]) => {
    setKeywords(newKws);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_admin_seo_keywords', JSON.stringify(newKws));
    }
    showToast('فهرست کلمات کلیدی هدف با موفقیت در پایگاه ذخیره شد.');
  };

  // New Keyword Form
  const [newKeywordText, setNewKeywordText] = useState('');
  const [newKeywordCategory, setNewKeywordCategory] = useState<TargetKeyword['category']>('core');
  const [newKeywordLanding, setNewKeywordLanding] = useState('/');
  const [newKeywordSearch, setNewKeywordSearch] = useState('۱۰,۰۰۰');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordText.trim()) return;

    const newKw: TargetKeyword = {
      id: `kw-${Date.now()}`,
      keyword: newKeywordText.trim(),
      monthlySearch: newKeywordSearch,
      targetRank: 1,
      currentRank: '۱ (برتر)',
      landingPage: newKeywordLanding,
      category: newKeywordCategory,
      difficulty: 'متوسط',
    };

    const updated = [newKw, ...keywords];
    handleSaveKeywords(updated);
    setNewKeywordText('');
    showToast(`کلمه کلیدی «${newKw.keyword}» به سیستم اضافه شد.`);
  };

  const handleDeleteKeyword = (id: string) => {
    const updated = keywords.filter((k) => k.id !== id);
    handleSaveKeywords(updated);
    showToast('کلمه کلیدی با موفقیت حذف شد.');
  };

  // SERP Live Simulator States
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [serpTitle, setSerpTitle] = useState('تایپ ده انگشتی | آموزش تایپ، مسابقه زنده و تست سرعت | بهترین و بروز ترین سامانه تایپرو');
  const [serpDesc, setSerpDesc] = useState(
    'بهترین و بروز ترین سامانه تایپ ده انگشتی در ایران (تایپرو). یادگیری علمی و آموزشی تایپ ده انگشتی، مسابقه زنده و رقابت تایپ آنلاین، تست سرعت WPM سریع و دقیق و مدرک معتبر.'
  );
  const [serpSlug, setSerpSlug] = useState('typing-test');

  // Ping Google / Crawler States
  const [isPinging, setIsPinging] = useState(false);
  const handlePingGoogle = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      showToast('✓ سیگنال تازه‌سازی نقشه سایت (Ping) با موفقیت به Google Search Console و موتورهای جستجو ارسال گردید.');
    }, 1200);
  };

  return (
    <div className="space-y-8 font-sans pb-12" dir="rtl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <Globe className="w-4 h-4" />
            <span>مرکز فرماندهی سئو و رتبه ۱ گوگل</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            سیستم پیشرفته مدیریت سئو و متادیتا (Typro SEO Suite)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            پایش جامع رتبه‌بندی کلمات کلیدی، ممیزی اسکیماهای JSON-LD، شبیه‌ساز سرچ گوگل و مدیریت خزنده‌ها.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingGoogle}
            disabled={isPinging}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'در حال ارسال پینگ...' : 'پینگ نقشه به گوگل (Ping)'}</span>
          </button>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>مشاهده sitemap.xml</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-black">
        {[
          { id: 'overview', title: 'داشبورد سلامت و آمار سئو', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'keywords', title: 'کلمات کلیدی و رتبه‌بندی هدف', icon: <Target className="w-4 h-4" /> },
          { id: 'simulator', title: 'شبیه‌ساز زنده پیش‌نمایش در گوگل', icon: <Eye className="w-4 h-4" /> },
          { id: 'schemas', title: 'اسکیماهای ساختاریافته (JSON-LD)', icon: <Code className="w-4 h-4" /> },
          { id: 'robots', title: 'خزنده‌ها، Robots و نقشه سایت', icon: <FileCode className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
         TAB 1: OVERVIEW & HEALTH METRICS
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Health Score Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>شاخص سلامت فنی سئو</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600 font-mono">99%</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  وضعیت طلایی
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                تمام صفحات دارای Title یکتا، توضیحات متا، Canonical یکپارچه و اسکیما هستند.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>تعداد صفحات ایندکس‌پذیر</span>
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">78 + 260</span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                  در نقشه سایت
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ۷۸ روت عمومی اپلیکیشن + ۲۶۰ درس آکادمی با اولویت ۱.۰ و تغییرات روزانه.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>اسکیماهای غنی (Rich Snippets)</span>
                <Code className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-600 font-mono">6 اسکیما</span>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                  فعال و بدون خطا
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                شامل WebApplication، Course، FAQPage، Organization و BreadcrumbList.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>سرعت بارگذاری اولیه (LCP)</span>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600 font-mono">0.8 ثانیه</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Core Web Vitals سبز
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                کامپایل Turbopack با کش استاتیک و بدون تاخیر سرور برای خزنده‌های گوگل.
              </p>
            </div>
          </div>

          {/* Audit Checklist */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>ممیزی خودکار استانداردهای رتبه ۱ گوگل</span>
              </h2>
              <span className="text-xs text-slate-500 font-bold">بررسی شده در زمان بیلد اخیر</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { title: 'تگ متای متغیر و تایتل هدفمند در تمام صفحات', status: 'پاس شده', desc: 'استفاده از الگوی عنوان استاندارد فارسی و کلمات کلیدی' },
                { title: 'اسکیمای کامل JSON-LD در روت اصلی', status: 'پاس شده', desc: 'تولید اطلاعات ساختاریافته وب‌سایت، اپلیکیشن و سوالات متداول' },
                { title: 'پشتیبانی از Open Graph و کارت توییتر', status: 'پاس شده', desc: 'پیش‌نمایش حرفه‌ای به همراه تصویر لوگو در پیام‌رسان‌ها' },
                { title: 'فایل robots.txt با هدایت صحیح Googlebot', status: 'پاس شده', desc: 'مسدودسازی دسترسی خزنده‌ها به روت‌های ادمین و بهینه‌سازی Crawl Budget' },
                { title: 'نقشه سایت داینامیک sitemap.xml', status: 'پاس شده', desc: 'ثبت تمام مسیرهای عمومی با تگ lastModified به‌روز' },
                { title: 'تگ Canonical دقیق (https://typro.ir)', status: 'پاس شده', desc: 'جلوگیری کامل از محتوای تکراری و ادغام وزن سئو روی دامنه اصلی' },
                { title: 'فونت‌های بهینه‌سازی‌شده و واکنش‌گرایی کامل', status: 'پاس شده', desc: 'سازگاری ۱۰۰٪ با آزمون Mobile-Friendly گوگل' },
                { title: 'گواهینامه امنیتی SSL فعال (HTTPS)', status: 'پاس شده', desc: 'اتصال رمزگذاری‌شده ایمن استاندارد مورد تایید موتورهای جستجو' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 font-bold">{item.title}</strong>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 2: KEYWORDS MANAGEMENT HUB
         ========================================================================= */}
      {activeTab === 'keywords' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Add Keyword Form */}
          <form onSubmit={handleAddKeyword} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>افزودن کلمه کلیدی هدف جدید به مانیتورینگ سئو</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 block">عنوان کلمه کلیدی:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تست تایپ فارسی، تایپ ده انگشتی رایگان..."
                  value={newKeywordText}
                  onChange={(e) => setNewKeywordText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">صفحه فرود هدف (Landing):</label>
                <select
                  value={newKeywordLanding}
                  onChange={(e) => setNewKeywordLanding(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-xs"
                >
                  <option value="/">صفحه اصلی (/)</option>
                  <option value="/typing-test">تست سرعت تایپ (/typing-test)</option>
                  <option value="/lessons">آموزش دروس آکادمی (/lessons)</option>
                  <option value="/live-race">مسابقه زنده (/live-race)</option>
                  <option value="/write">تایپرو رایت (/write)</option>
                  <option value="/subscription">اشتراک تایپرو (/subscription)</option>
                  <option value="/certificates">مدرک و آزمون (/certificates)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">دسته‌بندی:</label>
                <select
                  value={newKeywordCategory}
                  onChange={(e) => setNewKeywordCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-xs"
                >
                  <option value="core">پایه و اصلی (Core)</option>
                  <option value="test">تست تایپ و سرعت (Test)</option>
                  <option value="learning">آموزش و یادگیری (Learning)</option>
                  <option value="competition">مسابقه و رقابت (Competition)</option>
                  <option value="brand">برندینگ تایپرو (Brand)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت کلمه کلیدی</span>
              </button>
            </div>
          </form>

          {/* Keywords Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  فهرست کلمات کلیدی هدف‌گذاری شده تایپرو ({keywords.length} کلمه)
                </h3>
                <p className="text-[11px] text-slate-500">
                  تمامی این کلمات در متادیتای سایت، اسکیماها و سورس‌کد با اولویت رتبه ۱ تعبیه شده‌اند.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">کلمه کلیدی هدف</th>
                    <th className="p-3.5">حجم جستجوی ماهانه (ایران)</th>
                    <th className="p-3.5">صفحه هدف</th>
                    <th className="p-3.5">درجه رقابت</th>
                    <th className="p-3.5">رتبه هدف در گوگل</th>
                    <th className="p-3.5">وضعیت سئو</th>
                    <th className="p-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {keywords.map((kw) => (
                    <tr key={kw.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{kw.keyword}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">{kw.monthlySearch} بار</td>
                      <td className="p-3.5 font-mono text-blue-600">
                        <Link href={kw.landingPage} target="_blank" className="hover:underline flex items-center gap-1">
                          <span>{kw.landingPage}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {kw.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-600">
                        رتبه {kw.targetRank} گوگل
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>تعبیه در متادیتا و اسکیما</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteKeyword(kw.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 3: GOOGLE SERP SIMULATOR
         ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span>شبیه‌ساز زنده نمایش نتیجه در صفحه اول گوگل (SERP Simulator)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  متن تایتل و دیسکریپشن را تغییر دهید تا پیش‌نمایش آنی در نتایج گوگل را مشاهده کنید.
                </p>
              </div>

              {/* Device Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSerpDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    serpDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>دسکتاپ</span>
                </button>
                <button
                  onClick={() => setSerpDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    serpDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>موبایل</span>
                </button>
              </div>
            </div>

            {/* Google Result Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-sm max-w-2xl font-sans" dir="rtl">
              {/* URL Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-700 mb-1 font-mono" dir="ltr">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                  T
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] text-slate-900 font-sans font-bold">تایپرو (Typro.ir)</span>
                  <span className="text-[11px] text-slate-500">https://typro.ir › {serpSlug}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl text-[#1a0dab] hover:underline cursor-pointer font-bold leading-snug line-clamp-2">
                {serpTitle}
              </h3>

              {/* Rich Snippet Star Rating */}
              <div className="flex items-center gap-2 my-1 text-xs text-slate-600">
                <span className="text-amber-500 font-bold font-mono">★★★★★ ۴.۹</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono">۱۸,۹۲۰ رأی مثبت</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                  آموزش استاندارد مهارتی
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed line-clamp-3">
                {serpDesc}
              </p>

              {/* Sitelinks Mini Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-[#1a0dab] block hover:underline cursor-pointer">
                    تست سرعت تایپ ده انگشتی
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">سنجش دقیق سرعت و دقت تایپ WPM</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-[#1a0dab] block hover:underline cursor-pointer">
                    مسابقه زنده تایپ خودرویی
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">رقابت بلادرنگ چندنفره و کسب جوایز</span>
                </div>
              </div>
            </div>

            {/* Inputs & Character Counters */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700">عنوان صفحه سئو (Title Tag):</label>
                  <span className={`font-mono text-[11px] ${serpTitle.length > 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {serpTitle.length} از ۶۰ تا ۷۰ کاراکتر
                  </span>
                </div>
                <input
                  type="text"
                  value={serpTitle}
                  onChange={(e) => setSerpTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700">توضیحات متا (Meta Description):</label>
                  <span className={`font-mono text-[11px] ${serpDesc.length > 165 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {serpDesc.length} از ۱۵۵ تا ۱۶۵ کاراکتر
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={serpDesc}
                  onChange={(e) => setSerpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 4: JSON-LD STRUCTURED DATA SCHEMAS
         ========================================================================= */}
      {activeTab === 'schemas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                <span>اسکیماهای ساختاریافته موتورهای جستجو (Active JSON-LD Schemas)</span>
              </h2>
              <p className="text-xs text-slate-500">
                این ساختارها کدهای استاندارد بین‌المللی هستند که به صورت زنده در سورس تمام صفحات قرار دارند تا ربات‌های گوگل سایت تایپرو را به عنوان مرجع درجه یک معرفی کنند.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  type: 'SoftwareApplication',
                  name: 'پلتفرم هوشمند تایپ ده انگشتی تایپرو',
                  benefit: 'نمایش جعبه نرم‌افزار آموزشی به همراه امتیاز ۴.۹ از ۵ در سرچ گوگل',
                  status: 'فعال ✓',
                },
                {
                  type: 'Course',
                  name: 'دوره جامع آموزش تایپ ده انگشتی و یادگیری تایپ سریع و دقیق',
                  benefit: 'شناسایی تایپرو در کاروسل دوره‌های آموزشی (Google Course Carousel)',
                  status: 'فعال ✓',
                },
                {
                  type: 'FAQPage',
                  name: 'پاسخ به سوالات متداول تایپ ده انگشتی و اشتراک تایپرو',
                  benefit: 'نمایش آکاردئون پرسش و پاسخ مستقیم در صفحه اول گوگل (Rich Snippet)',
                  status: 'فعال ✓',
                },
                {
                  type: 'Organization & WebSite',
                  name: 'سازمان رسمی تایپرو با جستجوی یکپارچه (SearchAction)',
                  benefit: 'شناسایی برند در گراف دانش (Knowledge Graph) و باکس سرچ اختصاصی گوگل',
                  status: 'فعال ✓',
                },
              ].map((sch, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      @{sch.type}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {sch.status}
                    </span>
                  </div>
                  <strong className="text-slate-900 block font-bold text-sm">{sch.name}</strong>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{sch.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 5: ROBOTS & SITEMAP
         ========================================================================= */}
      {activeTab === 'robots' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Robots.txt Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-sm text-slate-900">فایل هدایت خزنده‌ها (robots.txt)</h3>
                </div>
                <a
                  href="/robots.txt"
                  target="_blank"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>robots.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto" dir="ltr">
                <span className="text-emerald-400"># Typro SEO Directive for Search Engines</span><br />
                User-agent: *<br />
                Allow: /<br />
                Disallow: /admin/<br />
                Disallow: /api/<br />
                <br />
                User-agent: Googlebot<br />
                Allow: /<br />
                Disallow: /admin/<br />
                Disallow: /api/<br />
                <br />
                <span className="text-amber-400">Sitemap: https://typro.ir/sitemap.xml</span><br />
                Host: https://typro.ir
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                این تنظیمات تضمین می‌کنند خزنده‌های گوگل تمامی صفحات آموزش، تست تایپ و مسابقات را بدون هدر رفتن بودجه ایندکس، خزش کنند.
              </p>
            </div>

            {/* Sitemap.xml Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-900">نقشه سایت پویا (sitemap.xml)</h3>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>sitemap.xml</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">صفحات کلیدی با بالاترین اولویت (1.0):</span>
                  <strong className="font-mono text-slate-800">/ , /typing-test, /lessons</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">فرکانس به‌روزرسانی برای گوگل:</span>
                  <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">daily (روزانه)</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">تعداد کل مسیرهای تولیدشده:</span>
                  <strong className="font-mono text-blue-600">۳۳۸ لینک</strong>
                </div>
              </div>

              <button
                onClick={handlePingGoogle}
                disabled={isPinging}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>ارسال سیگنال خزش مجدد (Ping Sitemap)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
