'use client';

import React, { useEffect, useState } from 'react';
import { 
  Trophy, Sparkles, RotateCcw, ArrowRight, Award, 
  CheckCircle2, Gauge, Zap, Target, Clock, ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnimatedCompletionGaugeProps {
  wpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  elapsedSeconds: number;
  consistency: number;
  onRepeat: () => void;
  onNextText?: () => void;
  nextButtonText?: string;
}

export default function AnimatedCompletionGauge({
  wpm,
  netWpm,
  accuracy,
  errors,
  elapsedSeconds,
  consistency,
  onRepeat,
  onNextText,
  nextButtonText
}: AnimatedCompletionGaugeProps) {
  const [animatedWpm, setAnimatedWpm] = useState(0);
  const [animatedAcc, setAnimatedAcc] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(-120);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
      });
    } catch {}
  }, []);

  // Smooth animation of needle and numbers
  useEffect(() => {
    const duration = 1600; // ms
    const startTime = performance.now();
    const targetWpm = Math.max(0, wpm);
    const targetAcc = Math.max(0, Math.min(100, accuracy));

    // Gauge range: 0 WPM = -120 deg, 140 WPM = +120 deg
    const maxGaugeWpm = 140;
    const targetAngle = -120 + Math.min(1, targetWpm / maxGaugeWpm) * 240;

    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedWpm(Math.round(targetWpm * eased));
      setAnimatedAcc(Math.round(targetAcc * eased));
      setNeedleAngle(-120 + (targetAngle - (-120)) * eased);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setAnimatedWpm(targetWpm);
        setAnimatedAcc(targetAcc);
        setNeedleAngle(targetAngle);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [wpm, accuracy]);

  // Speed level evaluation
  const getRankInfo = (speed: number) => {
    if (speed >= 80) return { title: 'سرعت خارق‌العاده (Master Pro)', color: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🚀' };
    if (speed >= 60) return { title: 'تایپیست حرفه‌ای و ماهر', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🏎️' };
    if (speed >= 40) return { title: 'تایپیست استاندارد و سریع', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '⚡' };
    if (speed >= 25) return { title: 'تایپ خوب و رو به رشد', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: '✨' };
    return { title: 'مقدماتی • نیاز به تمرین بیشتر', color: 'text-slate-600', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🎯' };
  };

  const rank = getRankInfo(wpm);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto" dir="rtl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <span>تست تایپ به پایان رسید!</span>
              <span className="text-base">{rank.icon}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              محاسبه هوشمند و متحرک کیلومتر سرعت، دقت و ثبات عملکرد
            </p>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${rank.badge}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{rank.title}</span>
        </div>
      </div>

      {/* Main Animated Speedometer Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Speedometer Gauge Dial (SVG Vector) */}
        <div className="md:col-span-6 flex flex-col items-center justify-center p-3 relative">
          <div className="relative w-64 h-56 sm:w-72 sm:h-60 flex items-center justify-center">
            {/* SVG Speedometer Arc */}
            <svg viewBox="0 0 240 200" className="w-full h-full overflow-visible">
              <defs>
                {/* Arc gradient */}
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#2563eb" />
                  <stop offset="70%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Dial Track Arc (-120 to +120 deg = 240 deg arc) */}
              <circle
                cx="120"
                cy="120"
                r="88"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="16"
                strokeDasharray="368.5"
                strokeDashoffset="122.8"
                strokeLinecap="round"
                transform="rotate(150 120 120)"
              />

              {/* Active Color Gradient Arc */}
              <circle
                cx="120"
                cy="120"
                r="88"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeDasharray="368.5"
                strokeDashoffset="122.8"
                strokeLinecap="round"
                transform="rotate(150 120 120)"
              />

              {/* Minor Tick Marks */}
              {[0, 20, 40, 60, 80, 100, 120, 140].map((tick) => {
                const angle = -120 + (tick / 140) * 240;
                const rad = (angle - 90) * (Math.PI / 180);
                const x1 = 120 + Math.cos(rad) * 72;
                const y1 = 120 + Math.sin(rad) * 72;
                const x2 = 120 + Math.cos(rad) * 80;
                const y2 = 120 + Math.sin(rad) * 80;
                return (
                  <line
                    key={tick}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Animated Needle */}
              <g transform={`rotate(${needleAngle} 120 120)`} filter="url(#needleGlow)">
                {/* Needle bar */}
                <line
                  x1="120"
                  y1="120"
                  x2="120"
                  y2="34"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Center Hub */}
                <circle cx="120" cy="120" r="10" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
                <circle cx="120" cy="120" r="4" fill="#ef4444" />
              </g>

              {/* Min and Max labels */}
              <text x="44" y="156" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">۰</text>
              <text x="196" y="156" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">۱۴۰+</text>
            </svg>

            {/* Central Real-time Digital Odometer */}
            <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-slate-900 tabular-nums">
                {animatedWpm}
              </span>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-widest mt-0.5">
                WPM (کلمه در دقیقه)
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Key Metrics Grid */}
        <div className="md:col-span-6 grid grid-cols-2 gap-3">
          {/* Accuracy Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold mb-1">
              <Target className="w-4 h-4" />
              <span>دقت کل</span>
            </div>
            <span className="text-3xl font-black font-mono text-emerald-700 tabular-nums">
              {animatedAcc}٪
            </span>
            <span className="text-[10px] text-emerald-600 mt-1 font-medium">
              {errors === 0 ? 'بدون هیچ خطایی (عالی)' : `${errors} کاراکتر اشتباه`}
            </span>
          </div>

          {/* Net Speed Card */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-blue-700 text-xs font-bold mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>سرعت خالص (Net)</span>
            </div>
            <span className="text-3xl font-black font-mono text-blue-700 tabular-nums">
              {netWpm}
            </span>
            <span className="text-[10px] text-blue-600 mt-1 font-medium">
              با کسر جریمه خطاها
            </span>
          </div>

          {/* Time Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-slate-600 text-xs font-bold mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>زمان ثبت‌شده</span>
            </div>
            <span className="text-2xl font-black font-mono text-slate-800 tabular-nums">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">مدت زمان آزمون</span>
          </div>

          {/* Consistency Card */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/90 flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-purple-700 text-xs font-bold mb-1">
              <Gauge className="w-4 h-4 text-purple-600" />
              <span>پایداری سرعت</span>
            </div>
            <span className="text-2xl font-black font-mono text-purple-700 tabular-nums">
              {consistency}٪
            </span>
            <span className="text-[10px] text-purple-600 mt-1">ریتم یکنواخت تایپ</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onRepeat}
          className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>تکرار همین تست (↺)</span>
        </button>

        {onNextText && (
          <button
            type="button"
            onClick={onNextText}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
          >
            <span>{nextButtonText || 'متن بعدی و دست جدید'}</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/25 text-[11px] font-mono border border-white/20 text-blue-100">
              Space ␣
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
