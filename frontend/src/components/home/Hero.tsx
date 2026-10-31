'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Keyboard, Trophy, Flame, Play, Shield, Award, Users, CheckCircle2, 
  ArrowLeft, Sparkles, Gauge, Zap, Star, ChevronLeft, Rocket, Timer
} from 'lucide-react';
import AnimatedVehicleSkin from '@/components/race/AnimatedVehicleSkin';

const HERO_PHRASES = [
  { text: 'در مسابقات زنده اتومبیل‌رانی آنلاین گاز بده!', highlight: 'مسابقات زنده اتومبیل‌رانی', tag: 'ورزش الکترونیک' },
  { text: 'سرعت تایپت رو تا ۱۲۰ کلمه در دقیقه بالا ببر!', highlight: '۱۲۰ کلمه در دقیقه', tag: 'شتاب عضلانی' },
  { text: 'حافظه عضلانی ۱۰ انگشتت رو مثل حرفه‌ای‌ها بساز!', highlight: 'حافظه عضلانی ۱۰ انگشتت', tag: 'آکادمی هوشمند' },
  { text: 'با تایپ سریع، پروژه‌های فریلنسری پردرآمد بگیر!', highlight: 'پروژه‌های فریلنسری پردرآمد', tag: 'کسب درآمد' },
  { text: 'رکورد بزن، کاپ طلا ببر و در لیگ افسانه‌ها بدرخش!', highlight: 'لیگ افسانه‌ها', tag: 'رنکینگ کشوری' },
];

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('در مسابقات زنده اتومبیل‌رانی آنلاین گاز بده!');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState('در مسابقات زنده اتومبیل‌رانی آنلاین گاز بده!'.length);

  // Auto-scroll on initial arrival to open directly from this Hero section as shown in user's photo
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      const heroEl = document.getElementById('hero-section');
      if (heroEl) {
        const timer = setTimeout(() => {
          heroEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Live Platform Stats (Controlled by Admin Panel or Real System Computation)
  const [platformStats, setPlatformStats] = useState({
    onlineTypists: '۰',
    todayTests: '۰',
    avgGrowth: '+۰ WPM',
    issuedCerts: '۰',
    mode: 'real',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/platform-stats');
        if (res.ok) {
          const data = await res.json();
          setPlatformStats(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('typro_platform_stats', JSON.stringify(data));
          }
          return;
        }
      } catch {}

      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('typro_platform_stats');
          if (saved) {
            setPlatformStats(JSON.parse(saved));
          }
        } catch {}
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);

    const handleUpdate = () => {
      fetchStats();
    };

    window.addEventListener('typro_platform_stats_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('typro_platform_stats_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const currentPhrase = HERO_PHRASES[phraseIndex].text;

  // Real-time dynamic typewriter effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex <= currentPhrase.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentPhrase.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 70);
    } else if (!isDeleting && charIndex > currentPhrase.length) {
      // Pause at complete text
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && charIndex > 0) {
      // Smooth deleting
      timeout = setTimeout(() => {
        setDisplayedText(currentPhrase.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 35);
    } else if (isDeleting && charIndex === 0) {
      // Advance to next phrase
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentPhrase]);

  // Dynamic Live Race Simulation for Homepage Preview
  const [raceProgress, setRaceProgress] = useState({
    p1: 65,
    p2: 48,
    p3: 32,
    wpm1: 102,
    wpm2: 89,
    wpm3: 75
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setRaceProgress((prev) => {
        let nextP1 = prev.p1 + 0.6;
        let nextP2 = prev.p2 + 0.55;
        let nextP3 = prev.p3 + 0.5;

        // Loop smoothly when leading car approaches finish line
        if (nextP1 >= 88) {
          nextP1 = 10;
          nextP2 = 6;
          nextP3 = 3;
        }

        return {
          p1: nextP1,
          p2: nextP2,
          p3: nextP3,
          wpm1: Math.round(98 + Math.sin(nextP1 / 6) * 10),
          wpm2: Math.round(86 + Math.cos(nextP2 / 7) * 7),
          wpm3: Math.round(74 + Math.sin(nextP3 / 8) * 6)
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div id="hero-section" className="relative pt-4 sm:pt-6 pb-14 ambient-light-mesh scroll-mt-2">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Active Mode Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-blue-200 shadow-xs backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
              {HERO_PHRASES[phraseIndex].tag}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600 font-bold">پلتفرم شماره ۱ تایپ هوشمند و مسابقات آنلاین ایران</span>
          </div>

          {/* Main SEO H1 Heading with Dedicated Google-Bot Target */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-snug">
              <span className="block text-xs sm:text-sm font-black text-blue-600 mb-2 uppercase tracking-wider">
                سامانه جامع آموزش، تست سرعت و رقابت آنلاین صفحه کلید
              </span>
              <span className="block text-slate-900 mb-1">
                آموزش تایپ ده انگشتی و یادگیری تایپ سریع
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 inline-block text-xl sm:text-3xl lg:text-4xl mt-1 font-extrabold">
                {displayedText}
              </span>
              <span className="hero-caret mr-2" />
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            در <strong>تایپرو (Typro.ir)</strong>، مهارت <strong>آموزش تایپ ده انگشتی</strong> و <strong>یادگیری تایپ سریع</strong> را با متد علمی حافظه عضلانی بیاموزید. سرعت خود را در <strong>تست تایپ آنلاین</strong> بسنجید و با مسابقه در <strong>رقابت زنده</strong> به بالاترین سطح تسلط بر <strong>صفحه کلید</strong> برسید.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            {/* ورود به رقابت زنده */}
            <Link
              href="/live-race"
              className="btn-spring flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-sm sm:text-base hover:shadow-lg hover:shadow-orange-500/25 transition"
            >
              <Trophy className="w-5 h-5 text-yellow-200" />
              <span>ورود به رقابت زنده (اتاق‌ها و پیست)</span>
            </Link>

            {/* شروع تست تایپ */}
            <Link
              href="/typing-test"
              className="btn-spring flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/25 transition"
            >
              <Keyboard className="w-5 h-5 text-blue-200" />
              <span>شروع تست سریع سرعت (WPM)</span>
            </Link>

            {/* آکادمی آموزش */}
            <Link
              href="/lessons"
              className="btn-spring flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-emerald-400 font-black text-sm sm:text-base transition shadow-xs hover:shadow-sm"
            >
              <Play className="w-5 h-5 text-emerald-600 fill-current" />
              <span>آکادمی آموزش ده‌انگشتی</span>
            </Link>
          </div>
        </div>

        {/* Live Interactive Racing Preview with REAL VEHICLE SKINS */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl shadow-blue-500/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900">پیش‌نمایش زنده پیست اتومبیل‌رانی تایپرو (Live Race)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                پورشه ۹۱۱ توربو vs نینجا H2 vs ب‌ام‌و M6
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Timer className="w-4 h-4 text-blue-600" />
                <span>سرعت پیشتاز: <strong className="font-mono text-blue-600 text-sm font-black">{raceProgress.wpm1}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>دقت: <strong className="font-mono text-emerald-600 text-sm font-black">۹۹.۴٪</strong></span>
              </div>
            </div>
          </div>

          {/* Synchronized Real-time Typing Preview */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-blue-700 font-bold bg-blue-100/90 px-2 py-0.5 rounded-md">
                تایپ ده‌انگشتی پرسرعت با شتاب نیترو روی آسفالت داغ پیست...
              </span>
              <span className="w-2 h-4 bg-blue-600 animate-pulse inline-block align-middle" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline">
              پاسخ زنده به هر ضربه کلید
            </span>
          </div>

          {/* Physical Track: START on LEFT, FINISH on RIGHT (direction: LTR) */}
          <div className="relative bg-slate-950 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-3" dir="ltr">
            {/* Start Line Stripe on LEFT */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-emerald-500/90 z-10 shadow-[0_0_12px_#10b981]" />

            {/* Finish Line Checkered Pattern on RIGHT */}
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-[repeating-conic-gradient(#ffffff_0_90deg,#1e293b_0_180deg)] [background-size:10px_10px] opacity-35 z-10 border-l border-white/20" />

            {/* Asphalt subtle pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Lane 1: Porsche 911 Turbo (Player - White) */}
            <div className="relative h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex items-center px-4 overflow-hidden">
              <div className="absolute right-10 text-[10px] sm:text-xs font-bold text-slate-300 z-10 flex items-center gap-2" dir="rtl">
                <span className="text-white font-extrabold">شما: پورشه ۹۱۱ توربو اسپرت</span>
                <span className="bg-blue-600 text-white font-mono px-1.5 py-0.5 rounded text-[10px] shadow-xs">
                  {raceProgress.wpm1} WPM
                </span>
              </div>

              {/* Moving from Left to Right (facing Right) */}
              <div
                className="absolute transition-all duration-100 flex items-center z-20"
                style={{ left: `${raceProgress.p1 * 0.84}%` }}
              >
                <AnimatedVehicleSkin
                  skinId="skin-porsche"
                  wpm={raceProgress.wpm1}
                  isMoving={true}
                />
              </div>
            </div>

            {/* Lane 2: Kawasaki Ninja H2 Supercharged (Motorcycle with Wheelie & Fire) */}
            <div className="relative h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex items-center px-4 overflow-hidden">
              <div className="absolute right-10 text-[10px] sm:text-xs font-bold text-slate-300 z-10 flex items-center gap-2" dir="rtl">
                <span className="text-amber-300 font-extrabold">کاوازاکی نینجا H2 (تک‌چرخ)</span>
                <span className="bg-amber-500 text-slate-950 font-mono px-1.5 py-0.5 rounded text-[10px] font-black">
                  {raceProgress.wpm2} WPM
                </span>
              </div>

              {/* Moving from Left to Right */}
              <div
                className="absolute transition-all duration-100 flex items-center z-20"
                style={{ left: `${raceProgress.p2 * 0.84}%` }}
              >
                <AnimatedVehicleSkin
                  skinId="skin-kawasaki-h2"
                  wpm={raceProgress.wpm2}
                  isMoving={true}
                />
              </div>
            </div>

            {/* Lane 3: BMW M6 Gran Coupe (Competitor) */}
            <div className="relative h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex items-center px-4 overflow-hidden">
              <div className="absolute right-10 text-[10px] sm:text-xs font-bold text-slate-300 z-10 flex items-center gap-2" dir="rtl">
                <span className="text-slate-300 font-bold">ب‌ام‌و M6 گرن‌کوپه</span>
                <span className="bg-slate-700 text-white font-mono px-1.5 py-0.5 rounded text-[10px]">
                  {raceProgress.wpm3} WPM
                </span>
              </div>

              {/* Moving from Left to Right */}
              <div
                className="absolute transition-all duration-100 flex items-center z-20"
                style={{ left: `${raceProgress.p3 * 0.84}%` }}
              >
                <AnimatedVehicleSkin
                  skinId="skin-bmw-m6"
                  wpm={raceProgress.wpm3}
                  isMoving={true}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-2">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              🚦 شروع از خط چپ ⟵ خط پایان شطرنجی در سمت راست 🏁
            </span>
            <Link
              href="/live-race"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <span>ورود و گاز دادن در پیست زنده</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="interactive-card bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {platformStats.onlineTypists}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">تایپیست آنلاین در رقابت</div>
            </div>
          </div>

          <div className="interactive-card bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {platformStats.todayTests}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">تست انجام‌شده امروز</div>
            </div>
          </div>

          <div className="interactive-card bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {platformStats.avgGrowth}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">میانگین رشد مهارت کاربران</div>
            </div>
          </div>

          <div className="interactive-card bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {platformStats.issuedCerts}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">گواهینامه رسمی صادره</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
