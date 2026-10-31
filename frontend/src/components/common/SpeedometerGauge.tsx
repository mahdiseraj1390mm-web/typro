'use client';

import React from 'react';

interface SpeedometerGaugeProps {
  wpm: number;
  accuracy?: number;
  size?: 'sm' | 'md' | 'lg';
  maxWpm?: number;
  title?: string;
  showAccuracyRing?: boolean;
  className?: string;
}

export default function SpeedometerGauge({
  wpm,
  accuracy = 100,
  size = 'md',
  maxWpm = 120,
  title = 'سرعت تایپ (کیلومتر/دقیقه)',
  showAccuracyRing = true,
  className = '',
}: SpeedometerGaugeProps) {
  // Clamp values
  const clampedWpm = Math.max(0, Math.min(wpm, maxWpm));
  const clampedAcc = Math.max(0, Math.min(accuracy, 100));

  // Tachometer angle from -120 deg to +120 deg (total 240 deg sweep)
  const sweepAngle = 240;
  const startAngle = -120;
  const normalized = clampedWpm / maxWpm;
  const needleAngle = startAngle + normalized * sweepAngle;

  const dimensions = {
    sm: { width: 140, height: 110, r: 50, stroke: 8, fontVal: 'text-xl', fontLabel: 'text-[9px]' },
    md: { width: 200, height: 155, r: 72, stroke: 10, fontVal: 'text-3xl', fontLabel: 'text-[11px]' },
    lg: { width: 260, height: 200, r: 96, stroke: 12, fontVal: 'text-4xl', fontLabel: 'text-xs' },
  }[size];

  const cx = dimensions.width / 2;
  const cy = dimensions.height - 25;
  const r = dimensions.r;

  // Arc path generator
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, radius, end);
    const endPoint = polarToCartesian(x, y, radius, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return ['M', startPoint.x, startPoint.y, 'A', radius, radius, 0, largeArcFlag, 0, endPoint.x, endPoint.y].join(' ');
  };

  // Background track & active speed track
  const bgPath = describeArc(cx, cy, r, -120, 120);
  const activePath = describeArc(cx, cy, r, -120, needleAngle);

  // Speed Zone color
  const getSpeedColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Emerald
    if (val >= 50) return '#3b82f6'; // Blue
    if (val >= 30) return '#f59e0b'; // Amber
    return '#64748b'; // Slate
  };

  const activeColor = getSpeedColor(clampedWpm);

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      dir="rtl"
    >
      <div className="relative">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="overflow-visible"
        >
          <defs>
            {/* Speed Gradient */}
            <linearGradient id="speedTachGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="75%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
          />

          {/* Active Speed Arc */}
          {clampedWpm > 0 && (
            <path
              d={activePath}
              fill="none"
              stroke="url(#speedTachGradient)"
              strokeWidth={dimensions.stroke}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Speed Scale Hash Marks (Ticks) */}
          {[0, 20, 40, 60, 80, 100, 120].map((tickVal) => {
            const tickAngle = startAngle + (tickVal / maxWpm) * sweepAngle;
            const outer = polarToCartesian(cx, cy, r + 4, tickAngle);
            const inner = polarToCartesian(cx, cy, r - 5, tickAngle);
            const isMajor = tickVal % 40 === 0;

            return (
              <line
                key={tickVal}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={tickVal <= clampedWpm ? '#3b82f6' : '#cbd5e1'}
                strokeWidth={isMajor ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle Center Pivot Cap */}
          <circle cx={cx} cy={cy} r="8" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="3" fill="#f59e0b" />

          {/* Dynamic Tachometer Needle */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Needle Line */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - r + 8}
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#needleGlow)"
            />
            {/* Needle Counterbalance */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy + 10}
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Digital Readout Center Display */}
        <div
          className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono font-black tracking-tight text-slate-900 ${dimensions.fontVal}`}
              style={{ color: activeColor }}
              suppressHydrationWarning
            >
              {Math.round(wpm).toLocaleString('fa-IR')}
            </span>
            <span className={`font-bold text-slate-500 ${dimensions.fontLabel}`}>
              WPM
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {clampedWpm >= 80
              ? '⚡ فوق‌سریع (مسابقه‌ای)'
              : clampedWpm >= 50
              ? '🚀 سرعت حرفه‌ای'
              : clampedWpm >= 30
              ? '✨ نرمال و استاندارد'
              : 'تمرینی'}
          </span>
        </div>
      </div>

      {/* Accuracy Mini Badge Pill */}
      {showAccuracyRing && (
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs">
          <span>دقت ضربات:</span>
          <span
            className="font-mono font-black"
            style={{
              color: clampedAcc >= 95 ? '#10b981' : clampedAcc >= 85 ? '#3b82f6' : '#ef4444',
            }}
          >
            {Math.round(clampedAcc)}٪
          </span>
        </div>
      )}
    </div>
  );
}
