'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/home/Hero';
import HomeChatbot from '@/components/home/HomeChatbot';
import TypingEngine from '@/components/typing/TypingEngine';
import { TYPING_TEST_POOL, VEHICLE_SKINS } from '@/lib/constants';
import QUICK_TEST_POOL from '@/data/quickTestPool.json';
import { ALL_SKINS, SkinItem } from '@/lib/skins';
import AnimatedVehicleSkin from '@/components/race/AnimatedVehicleSkin';
import {
  Trophy,
  BookOpen,
  Keyboard,
  Zap,
  Award,
  ArrowLeft,
  Users,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Flame,
  Star,
  Film,
  Headphones,
  ScanLine,
  BookMarked,
  School,
  Car,
  ChevronLeft,
  Coins,
  Gem,
  DollarSign,
  TrendingUp,
  Server,
  Play,
  Briefcase,
  HelpCircle,
  ChevronDown,
  Check
} from 'lucide-react';

export default function HomePage() {
  const [quickTestIndex, setQuickTestIndex] = useState(0);

  // Initialize random attractive text safely on client mount
  useEffect(() => {
    if (QUICK_TEST_POOL && QUICK_TEST_POOL.length > 0) {
      const rand = Math.floor(Math.random() * QUICK_TEST_POOL.length);
      setQuickTestIndex(rand);
    }
  }, []);

  const currentQuickItem = QUICK_TEST_POOL[quickTestIndex] || QUICK_TEST_POOL[0];
  const quickTestText = currentQuickItem?.text || 'نظریه نسبیت عام انیشتین گرانش را حاصل انحنای فضا و زمان در حضور جرم می داند.';

  const handleNextQuickText = () => {
    setQuickTestIndex((prev) => {
      let next = Math.floor(Math.random() * QUICK_TEST_POOL.length);
      if (next === prev) next = (next + 1) % QUICK_TEST_POOL.length;
      return next;
    });
  };

  const [selectedSkinId, setSelectedSkinId] = useState('skin-porsche');
  const [skinCategoryFilter, setSkinCategoryFilter] = useState<'all' | 'supercars' | 'motorcycles'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [onlineCount, setOnlineCount] = useState<string>('۱');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOnline = () => {
      const saved = localStorage.getItem('typro_real_online_count');
      if (saved) {
        setOnlineCount(Number(saved).toLocaleString('fa-IR'));
      }
    };
    updateOnline();
    window.addEventListener('typro_online_count_updated', updateOnline);
    return () => window.removeEventListener('typro_online_count_updated', updateOnline);
  }, []);

  return (
    <div className="space-y-16 pb-20 font-sans" dir="rtl">
      {/* 1. Hero with Large Animated Typewriter & Live Duel Preview */}
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* 2. Triad Pathways: Learning, Competition, Earning */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              مرجع تخصصی تایپ و آموزش تایپ ده انگشتی
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              آموزش تایپ، تست تایپ آنلاین و رقابت زنده در تایپرو
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              تایپ ده انگشتی را با متد علمی حافظه عضلانی روی صفحه کلید بیاموزید، با تست تایپ سرعت خود را ارتقا دهید و در پیست‌های رقابت زنده هیجان مسابقه را تجربه کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Typing Academy */}
            <div className="interactive-card bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-5 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-600 block mb-1">آموزش گام‌به‌گام و علمی</span>
                  <h3 className="text-xl font-black text-slate-900">آکادمی هوشمند ده‌انگشتی</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    ۲۵۰+ درس استاندارد در ۳ سطح مقدماتی، مبتدی و پیشرفته برای کیبورد فارسی و انگلیسی. تقویت حافظه عضلانی انگشتان بدون نگاه به کلیدها.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">سطوح ۱ تا ۱۰ با ستاره</span>
                <Link
                  href="/lessons"
                  className="btn-spring px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  <span>شروع یادگیری</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Live Esports Racing */}
            <div className="interactive-card bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-5 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-600 block mb-1">ورزش الکترونیک و هیجان</span>
                  <h3 className="text-xl font-black text-slate-900">پیست‌های مسابقه زنده خودرویی</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    در پیست‌های آنلاین چندنفره گاز بده! هر کلمه صحیح شتاب خودروی شما را بیشتر می‌کند. اسکین ماشین‌ها را تغییر بده و در لیگ‌های هفتگی رتبه اول را بگیر.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">سرورهای هماهنگ زنده</span>
                <Link
                  href="/live-race"
                  className="btn-spring px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
                >
                  <span>ورود به پیست‌ها</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Freelance & Earn */}
            <div className="interactive-card bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between space-y-5 group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 block mb-1">کسب درآمد و بازار کار</span>
                  <h3 className="text-xl font-black text-slate-900">پروژه‌ها و بازار کار فریلنسری</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    مهارت سرعت تایپ خود را به درآمد نقدی تبدیل کن. انجام پروژه‌های تایپ صوتی، متون تخصصی و بازنویسی کتاب‌ها با گارانتی پرداخت امن پلتفرم.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">تسویه‌حساب روزانه و آنی</span>
                <Link
                  href="/freelancers"
                  className="btn-spring px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                >
                  <span>بازار کار تایپیست‌ها</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Quick Typing Test Engine (Immediate Action) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">سنجش زنده سرعت</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/60">
                  {currentQuickItem?.topic || 'شگفتی‌های علم و کیهان'}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  (بیش از ۳۶۰ متن جذاب و متنوع)
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
                تست سریع آنلاین مهارت تایپ (WPM)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تایپ کنید و سرعت لحظه‌ای، دقت و خطاهای خود را بسنجید (خطاها قرمز می‌شوند و با زدن کلید درست بلافاصله جلو می‌روید).
              </p>
            </div>
            <Link
              href="/typing-test"
              className="btn-spring px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/20"
            >
              صفحه اختصاصی آزمون ۱ تا ۵ دقیقه ←
            </Link>
          </div>

          <TypingEngine
            targetText={quickTestText}
            language="fa"
            allowChangeText={true}
            onTextChangeRequest={handleNextQuickText}
            title={`تست سریع: ${currentQuickItem?.topic || 'تایپ ده‌انگشتی'}`}
          />
        </section>

        {/* 4. Esports Garage Showcase (Authentic Cars & Heavy Bikes with Real Photos) */}
        <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Car className="w-4 h-4" />
                <span>گاراژ مسابقات آنلاین تایپرو (Esports Garage)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                اسکین‌های واقعی خودروها و موتورسیکلت‌های مسابقه
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                ماشین‌ها و موتورهای مسابقه با تصاویر واقعی، شتاب نیترو و جلوه‌های ویژه تک‌چرخ و آتش اگزوز!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/live-race?tab=skins"
                className="btn-spring px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <span>ورود به فروشگاه کامل اسکین‌ها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSkinCategoryFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition btn-spring ${
                skinCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🌟 همه مدل‌ها
            </button>
            <button
              onClick={() => setSkinCategoryFilter('supercars')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition btn-spring ${
                skinCategoryFilter === 'supercars'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🏎️ سوپراسپرت‌ها (پورشه، ب‌ام‌و، میتسوبیشی)
            </button>
            <button
              onClick={() => setSkinCategoryFilter('motorcycles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition btn-spring ${
                skinCategoryFilter === 'motorcycles'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🏍️ موتورسیکلت‌های سنگین (کاوازاکی، دوکاتی، هوندا)
            </button>
          </div>

          {/* Skins Grid with Real Photos & Animated Vehicles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ALL_SKINS
              .filter((s) => skinCategoryFilter === 'all' || s.category === skinCategoryFilter)
              .slice(0, 4)
              .map((skin) => {
                const isSelected = selectedSkinId === skin.id;
                return (
                  <div
                    key={skin.id}
                    onClick={() => setSelectedSkinId(skin.id)}
                    className={`interactive-card bg-white rounded-3xl border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all text-right ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {skin.visualType === 'car' ? '🏎️ اتومبیل' : '🏍️ موتور سنگین'}
                        </span>
                        <span className="text-xs font-bold text-amber-600 font-mono">
                          {skin.priceCoins.toLocaleString('fa-IR')} سکه
                        </span>
                      </div>

                      {/* Animated Real Photo Vehicle Showcase */}
                      <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                        <AnimatedVehicleSkin
                          skinId={skin.id}
                          size="preview"
                          isMoving={true}
                          showNitro={true}
                          showRoad={true}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-black text-sm text-slate-900 line-clamp-1">{skin.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{skin.emoji}</span>
                        </div>
                        <p className="text-[11px] text-blue-600 font-bold mt-0.5">{skin.tagline}</p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {skin.features.slice(0, 2).map((feat, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 line-clamp-1"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/live-race?tab=skins"
                      className="btn-spring w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold text-center transition flex items-center justify-center gap-1"
                    >
                      <span>تجهیز و مسابقه</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
          </div>
        </section>

        {/* 5. Multimedia Studios (Audio, Video, OCR, Typro Write) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              کارگاه‌های چندرسانه‌ای
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              فراتر از متن ساده: کارگاه‌های تخصصی تایپرو
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              تایپ صوتی پادکست‌ها، زیرنویس‌نویسی ویدیویی، اسکن هوشمند اسناد و تایپرو رایت با ویرایشگر هوشمند و دقیق.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Audio Typing */}
            <Link
              href="/audio-typing"
              className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-400 space-y-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition">
                  تایپ صوتی (Audio Typing)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  پیاده‌سازی همزمان صوت گوینده با تنظیم سرعت بازخوانی و اکولایزر امواج.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
                <span>ورود به کارگاه صوت</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>

            {/* Video Typing */}
            <Link
              href="/video-typing"
              className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 space-y-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 group-hover:text-indigo-600 transition">
                  تایپ ویدیویی (Video Typing)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  زیرنویس‌نویسی ویدیوها و محاسبه میلی‌ثانیه‌ای سرعت واکنش عصبی تایپیست.
                </p>
              </div>
              <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 pt-2">
                <span>ورود به کارگاه ویدیو</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>

            {/* OCR Studio */}
            <Link
              href="/image-to-text"
              className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-400 space-y-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 group-hover:text-emerald-600 transition">
                  تصویر به متن (OCR Studio)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  اسکن هوشمند اسناد تصویری و دست‌نوشته با دقت ۹۹.۴ درصدی هوش مصنوعی.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-2">
                <span>ورود به استودیوی OCR</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>

            {/* Typro Write */}
            <Link
              href="/write"
              className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-500 space-y-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition">
                  تایپرو رایت (Typro Write)
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  محیط هوشمند تایپ و نگارش متون، تایپ صوتی پیشرفته و غلط‌یابی خودکار فارسی و انگلیسی.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
                <span>ورود به تایپرو رایت</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </section>

        {/* 6. Schools & Student Olympiad Banner */}
        <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                ویژه مدارس، دانشگاه‌ها و المپیادهای ملی
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              سامانه مدارس هوشمند و المپیاد کشوری تایپ
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              معلمان و اساتید می‌توانند کلاس‌های آموزشی خود را تعریف کرده، تکالیف تایپ را با معیارهای حداقل WPM و دقت تنظیم نمایند و عملکرد دانش‌آموزان را به صورت خودکار با کارنامه تحلیلی ارزیابی کنند.
            </p>
          </div>

          <Link
            href="/schools"
            className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-black text-xs sm:text-sm hover:bg-blue-50 transition shadow-xl shrink-0 flex items-center gap-2"
          >
            <span>ورود به سامانه مدارس و المپیاد</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </section>

        {/* 7. Live Race Rooms Preview (Links to /live-race Rooms Lobby) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-600">سرورهای آنلاین فعال • {onlineCount} تایپیست آنلاین واقعی</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">اتاق‌های مسابقه زنده تایپرو</h2>
              <p className="text-xs text-slate-500 mt-0.5">اتاق دلخواه خود را انتخاب کنید و در کنار سایر رانندگان رقابت نمایید.</p>
            </div>
            <Link href="/live-race" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>مشاهده همه اتاق‌ها در لابی</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-400">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1">
                  <Server className="w-3 h-3 text-blue-600" />
                  <span>سرور ۱: متن کوتاه فارسی</span>
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  ۶ / ۸
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                مسابقه سرعت روی جملات پرکاربرد و متون فناوری و هوش مصنوعی.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">میانگین: ۵۸ WPM</span>
                <Link
                  href="/live-race"
                  className="btn-spring px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  مشاهده اتاق‌ها
                </Link>
              </div>
            </div>

            <div className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-purple-400">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200 flex items-center gap-1">
                  <Server className="w-3 h-3 text-purple-600" />
                  <span>سرور ۲: متون کهن و ادبیات پارسی</span>
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  ۵ / ۶
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                شاهکارهای ادب فارسی از بوستان و گلستان سعدی، شاهنامه و متون غنی ادبی با نگارش روان.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">میانگین: ۴۸ WPM</span>
                <Link
                  href="/live-race"
                  className="btn-spring px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  مشاهده اتاق‌ها
                </Link>
              </div>
            </div>

            <div className="interactive-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-amber-400">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200 flex items-center gap-1">
                  <Server className="w-3 h-3 text-amber-600" />
                  <span>سرور ۳: انگلیسی پیشرفته</span>
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  ۴ / ۶
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                Specialized software engineering paragraphs and fast coding typing.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">میانگین: ۶۸ WPM</span>
                <Link
                  href="/live-race"
                  className="btn-spring px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  مشاهده اتاق‌ها
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SEO Master Knowledge & Pillar Hub (آموزش تایپ ده انگشتی، دروس، تمرینات، تست، مسابقه زنده، مدرک) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              دایرة‌المعارف و راهنمای جامع یادگیری تایپ
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
              آموزش تایپ ده انگشتی و یادگیری تایپ سریع؛ اصول علمی تسلط بر صفحه کلید
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>تایپ ده انگشتی (Touch Typing)</strong> مهارتی کلیدی در دنیای دیجیتال است که با ایجاد <strong>حافظه عضلانی</strong> در نوک انگشتان، به شما امکان می‌دهد بدون نگاه به کیبورد و با سرعتی بالاتر از ۱۰۰ کلمه در دقیقه بنویسید. در تایپرو، <strong>آموزش تایپ</strong> به صورت گام‌به‌گام و کاملاً رایگان ارائه می‌شود.
            </p>
          </div>

          {/* Targeted Keyword Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
            {/* 1. آموزش تایپ ده انگشتی و یادگیری تایپ */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 transition-all space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Keyboard className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">آموزش تایپ ده انگشتی و یادگیری تایپ</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                آشنایی با ردیف پایگاه کیبورد (Home Row)، نحوه قرارگیری انگشتان اشاره روی کلیدهای شاخص برجسته <strong>ف</strong> و <strong>ت</strong> و اصول ارگونومی نشستن برای جلوگیری از خستگی دست‌ها و افزایش شتاب تایپ.
              </p>
              <Link href="/guide" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1">
                <span>راهنمای کامل آموزش تایپ ده انگشتی</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. دروس تایپ استاندارد */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">دروس تایپ گام‌به‌گام</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                بیش از ۲۵۰ درس استاندارد برای کیبورد فارسی و انگلیسی. طبقه‌بندی از حروف ردیف خانه، ردیف بالا و پایین تا کلیدهای ترکیبی، علائم نگارشی و اعداد با کارنامه دقیق عملکرد در پایان هر درس.
              </p>
              <Link href="/lessons" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline pt-1">
                <span>مشاهده کاتالوگ دروس تایپ</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. تمرینات تایپ تخصصی */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 transition-all space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Zap className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">تمرینات تایپ هوشمند</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                سامانه هوش مصنوعی با شناسایی کلیدهای ضعیف و کند انگشتان شما، تمرینات تایپ اختصاصی تولید می‌کند تا با تکرار هدفمند، خطاهای انگشت کوچک و حلقه را به صفر برسانید.
              </p>
              <Link href="/practice" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline pt-1">
                <span>شروع تمرینات تایپ تخصصی</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. تست تایپ آنلاین (WPM) */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-400 transition-all space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Flame className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">تست تایپ آنلاین و سرعت</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                سنجش استاندارد تعداد کلمات در دقیقه (WPM)، کاراکتر بر دقیقه (CPM) و درصد دقت در آزمون‌های ۱ تا ۵ دقیقه‌ای همراه با مقایسه لحظه‌ای با میانگین کشوری و جهانی.
              </p>
              <Link href="/typing-test" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1">
                <span>ورود به آزمون و تست تایپ</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. مسابقه زنده و مسابقه زنده تایپ */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-orange-400 transition-all space-y-3">
              <div className="flex items-center gap-2 text-orange-600">
                <Trophy className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">مسابقه زنده تایپ اتومبیل‌رانی</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                اولین پیست مسابقه زنده تایپ آنلاین خودرویی در ایران! با رانندگان واقعی همزمان رقابت کنید، سوپراسپرت‌های پورشه و ب‌ام‌و را برانید و در رنکینگ کشوری سکه و مدال کسب کنید.
              </p>
              <Link href="/live-race" className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline pt-1">
                <span>ورود به مسابقه زنده تایپ</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6. مدرک تایپ معتبر استخدامی */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-400 transition-all space-y-3">
              <div className="flex items-center gap-2 text-purple-600">
                <Award className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900">مدرک تایپ رسمی با استعلام</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                پس از گذراندن آزمون رسمی تایپرو، مدرک تایپ ده انگشتی دیجیتال با بارکد QR و شناسه پیگیری صادر می‌شود که در رزومه کاری و آزمون‌های استخدامی معتبر و قابل استعلام است.
              </p>
              <Link href="/certificates" className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline pt-1">
                <span>شرایط دریافت مدرک تایپ</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 7. Highlight Banner: اشتراک تایپرو (VIP Membership) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border border-blue-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>بهترین و بروز ترین سامانه آموزش تایپ ده انگشتی</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                خرید اشتراک تایپرو؛ دسترسی نامحدود به آکادمی حرفه‌ای و مسابقات اختصاصی
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                با تهیه اشتراک تایپرو به بیش از ۲۵۰ درس پیشرفته، اسکین‌های طلایی مسابقات، تورنمنت‌های هفتگی و آزمون‌های دارای مدرک معتبر دسترسی نامحدود داشته باشید و مهارت خود را سریع و دقیق ارتقا دهید.
              </p>
            </div>
            <Link
              href="/subscription"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-orange-500/25 shrink-0 flex items-center gap-2"
            >
              <span>مشاهده و خرید اشتراک تایپرو</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Comparison Table for Featured Snippets in Google */}
          <div className="border-t border-slate-200 pt-8 space-y-5">
            <div className="space-y-1.5 text-right">
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                مقایسه علمی مهارت تایپ
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900">
                چرا یادگیری تایپ ده انگشتی مهم است؟ (مقایسه تایپ سنتی با متد نوین تایپرو)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                بررسی تفاوت‌های تایپ غیرحرفه‌ای و سنتی با روش آموزش تایپ ده انگشتی مبتنی بر حافظه عضلانی:
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-right text-xs border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                    <th className="p-3.5 sm:p-4">شاخص ارزیابی</th>
                    <th className="p-3.5 sm:p-4 text-rose-600">تایپ سنتی (۲ انگشتی با نگاه به کیبورد)</th>
                    <th className="p-3.5 sm:p-4 text-emerald-600 bg-emerald-50/50">آموزش تایپ ده انگشتی در تایپرو</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 bg-slate-50/50">میانگین سرعت تایپ (WPM)</td>
                    <td className="p-3.5 sm:p-4 text-rose-700">۱۵ الی ۲۵ کلمه در دقیقه (کند و زمان‌بر)</td>
                    <td className="p-3.5 sm:p-4 text-emerald-700 bg-emerald-50/30 font-bold">۷۰ الی ۱۲۰ کلمه در دقیقه (سرعت گفتار انسان)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 bg-slate-50/50">تمرکز ذهنی و نگاه به مانیتور</td>
                    <td className="p-3.5 sm:p-4 text-rose-700">نگاه مداوم به کلیدها، خستگی چشم و گردن</td>
                    <td className="p-3.5 sm:p-4 text-emerald-700 bg-emerald-50/30 font-bold">تمرکز ۱۰۰٪ روی مانیتور و محتوا بدون نگاه به کیبورد</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 bg-slate-50/50">درصد خطا و نیاز به ویرایش</td>
                    <td className="p-3.5 sm:p-4 text-rose-700">بالای ۱۵٪ خطا به دلیل جستجوی تصادفی کلیدها</td>
                    <td className="p-3.5 sm:p-4 text-emerald-700 bg-emerald-50/30 font-bold">دقت ۹۸٪ الی ۱۰۰٪ به لطف هدایت انگشتان شاخص</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 bg-slate-50/50">فرصت‌های شغلی و درآمدی</td>
                    <td className="p-3.5 sm:p-4 text-rose-700">محدود، رد شدن در آزمون‌های استخدامی تایپ</td>
                    <td className="p-3.5 sm:p-4 text-emerald-700 bg-emerald-50/30 font-bold">اولویت قطعی در استخدام، پروژه‌های فریلنسری پردرآمد</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 bg-slate-50/50">مدت زمان لازم برای یادگیری</td>
                    <td className="p-3.5 sm:p-4 text-rose-700">بدون پیشرفت حتی پس از سال‌ها کار با کامپیوتر</td>
                    <td className="p-3.5 sm:p-4 text-emerald-700 bg-emerald-50/30 font-bold">تنها ۲ الی ۳ هفته با روزانه ۱۵ دقیقه تمرین در آکادمی</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive FAQ Accordion (For Google Rich Snippets & Instant User Answers) */}
          <div className="border-t border-slate-200 pt-8 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                سوالات متداول درباره آموزش، یادگیری، مسابقه زنده و اشتراک تایپرو
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'آموزش تایپ ده انگشتی رایگان را از کجا و چگونه شروع کنم؟',
                  a: 'برای شروع آموزش تایپ ده انگشتی، کافی است به بخش «دروس تایپ» در تایپرو بروید. آموزش از درس اول و کلیدهای شاخص برجسته ردیف میانی (ف و ت) آغاز می‌شود. با تمرین روزانه ۱۰ الی ۱۵ دقیقه بدون نگاه کردن به کیبورد، حافظه عضلانی دست‌های شما به سرعت شکل می‌گیرد.'
                },
                {
                  q: 'یادگیری تایپ ده انگشتی چقدر طول می‌کشد؟',
                  a: 'با متد علمی حافظه عضلانی تایپرو، اکثر کاربران در مدت ۲ الی ۳ هفته (حدود ۱۰ تا ۱۵ ساعت تمرین مفید) به تسلط کامل ده انگشتی بدون نگاه به کیبورد می‌رسند و سرعت تایپ خود را به بالای ۶۰ تا ۱۰۰ کلمه در دقیقه افزایش می‌دهند.'
                },
                {
                  q: 'آیا برای تایپ سریع انگلیسی و کدنویسی هم آموزش وجود دارد؟',
                  a: 'بله، تایپرو علاوه بر کیبورد استاندارد فارسی، دوره‌های کامل آموزش تایپ انگلیسی و متون کدنویسی برنامه‌نویسی (Clean Code) را ارائه می‌دهد تا تسلط شما بر کلیدهای ترکیبی، علائم نگارشی و اعداد کامل شود.'
                },
                {
                  q: 'تست سرعت تایپ آنلاین در تایپرو چگونه محاسبه می‌شود؟',
                  a: 'تست سرعت تایپ تایپرو مطابق استاندارد بین‌المللی تایپو و جهانی (۵ کاراکتر به ازای هر کلمه) محاسبه می‌شود. سرعت نهایی (Net WPM) با کسر تعداد خطاها و دقت ضربات به همراه نمودار پایداری ریتم تایپ به صورت آنی ارائه می‌شود.'
                },
                {
                  q: 'مسابقه زنده و رقابت آنلاین تایپ چیست؟',
                  a: 'در مسابقه زنده تایپرو، تایپیست‌ها در پیست‌های چندنفره آنلاین با اتومبیل‌های اختصاصی رقابت می‌کنند. شتاب و سرعت خودرو مستقیماً بر اساس سرعت تایپ دقیق شما در پیست تعیین می‌شود و نفرات برتر کاپ و مدال‌های کشوری دریافت می‌کنند.'
                },
                {
                  q: 'آیا مدرک رسمی تایپ صادر شده در تایپرو معتبر و قابل استعلام است؟',
                  a: 'بله، پس از موفقیت در آزمون رسمی تایپرو، مدرک الکترونیکی بین‌المللی با کد رهگیری اختصاصی و بارکد QR لحظه‌ای صادر می‌شود که در آزمون‌های استخدامی، شرکت‌های دولتی و خصوصی و رزومه کاری کاملاً معتبر است.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 text-right flex items-center justify-between font-bold text-sm text-slate-800 hover:text-blue-600 transition"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openFaqIndex === idx ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Vibrant Final CTA */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl shadow-blue-500/10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ثبت‌نام رایگان، بدون پیش‌نیاز، از همین امروز</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black">
            سرعت تایپت رو تا ۳ برابر بیشتر کن
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
            همین حالا بدون معطلی اولین تست تایپ خودت رو شروع کن، حافظه عضلانی انگشتات رو بسنج و به جمع قهرمانان تایپرو بپیوند.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/typing-test"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-black text-sm sm:text-base hover:bg-blue-50 transition shadow-xl transform hover:-translate-y-0.5"
            >
              <Keyboard className="w-5 h-5 text-blue-600" />
              <span>شروع رایگان تست سرعت</span>
            </Link>

            <Link
              href="/live-race"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 text-white font-black text-sm sm:text-base hover:bg-amber-600 transition shadow-xl transform hover:-translate-y-0.5"
            >
              <Trophy className="w-5 h-5 text-amber-200" />
              <span>ورود به رقابت‌های آنلاین</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Floating Smart Assistant Chatbot (Only for Homepage) */}
      <HomeChatbot />
    </div>
  );
}
