'use client';

import React from 'react';

interface VehicleCutoutProps {
  skinId: string;
  isMoving?: boolean;
  className?: string;
}

export default function VehicleCutout({
  skinId,
  isMoving = false,
  className = '',
}: VehicleCutoutProps) {
  const wheelAnimClass = isMoving ? 'animate-spin' : '';

  // Wheel subcomponent (spins when vehicle is moving)
  const Wheel = ({
    cx,
    cy,
    r = 11,
    rimColor = '#94a3b8',
    tireColor = '#0f172a',
    spokes = 5,
  }: {
    cx: number | string;
    cy: number | string;
    r?: number | string;
    rimColor?: string;
    tireColor?: string;
    spokes?: number;
  }) => {
    const numR = Number(r);
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        {/* Rubber Tire */}
        <circle r={numR} fill={tireColor} stroke="#334155" strokeWidth="1.5" />
        <circle r={numR - 3} fill="#1e293b" />
        {/* Inner Rim & Spokes */}
        <g className={wheelAnimClass} style={{ transformOrigin: '0 0', animationDuration: '0.4s' }}>
          <circle r={numR - 4.5} fill="none" stroke={rimColor} strokeWidth="1.8" />
          <circle r={2.2} fill={rimColor} />
          {Array.from({ length: spokes }).map((_, i) => {
            const angle = (i * 360) / spokes;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={(numR - 5) * Math.cos(rad)}
                y2={(numR - 5) * Math.sin(rad)}
                stroke={rimColor}
                strokeWidth="1.4"
              />
            );
          })}
        </g>
      </g>
    );
  };

  // 1. فراری F8 مسابقه‌ای (Ferrari F8 Tributo) - Rosso Corsa Red Supercar
  if (skinId === 'skin-ferrari') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        {/* Aerodynamic Shadow */}
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Body Low-Slung Supercar */}
        <path
          d="M10,48 L18,36 L38,32 L60,20 L105,18 L132,32 L152,42 L155,50 L140,51 L132,48 L108,48 L98,51 L48,51 L38,48 L18,48 Z"
          fill="url(#ferrariGrad)"
        />
        {/* Cockpit Roof & Tinted Glass */}
        <path d="M62,21 L85,14 L112,18 L128,30 L66,30 Z" fill="#0f172a" opacity="0.9" />
        <path d="M72,21 L86,16 L108,19 L100,28 L70,28 Z" fill="#38bdf8" opacity="0.35" />
        {/* Yellow Ferrari Shield Badge */}
        <polygon points="104,28 107,31 104,34 101,31" fill="#facc15" />
        {/* Side Air Scoop */}
        <path d="M45,36 L68,34 L58,42 Z" fill="#7f1d1d" opacity="0.8" />
        {/* Headlight on Right (Front) */}
        <path d="M142,37 L152,42 L146,44 Z" fill="#fef08a" filter="drop-shadow(0 0 4px #38bdf8)" />
        {/* Rear Wing on Left */}
        <path d="M10,34 L25,32 L20,36 Z" fill="#1e293b" />
        {/* Dual Exhaust on Left */}
        <rect x="7" y="45" width="5" height="3.5" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Wheels */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#facc15" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#facc15" spokes={5} />
        <defs>
          <linearGradient id="ferrariGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="80%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 2. پیکان جوانان گوجه‌ای ۵۷ (Paykan Javanan 57 Sport) - Iconic Iranian Classic Sedan
  if (skinId === 'skin-paykan') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        {/* Ground Shadow */}
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Chrome Exhaust on Left */}
        <rect x="5" y="46" width="7" height="3" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
        {/* Main Body - Classic Boxy Sedan */}
        <path
          d="M12,47 L12,34 L32,34 L52,18 L114,18 L130,34 L150,34 L152,47 L140,48 L130,46 L106,46 L96,48 L46,48 L36,46 L18,48 Z"
          fill="url(#paykanGrad)"
        />
        {/* Chrome Front & Rear Bumpers (سپرهای استیل) */}
        <rect x="7" y="42" width="7" height="6" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
        <rect x="148" y="42" width="7" height="6" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
        {/* Classic Windows with Chrome Trim */}
        <path d="M55,21 L80,21 L80,33 L38,33 Z" fill="#0f172a" opacity="0.85" stroke="#cbd5e1" strokeWidth="1.2" />
        <path d="M84,21 L110,21 L124,33 L84,33 Z" fill="#0f172a" opacity="0.85" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Side Body Chrome Strip */}
        <line x1="15" y1="39" x2="148" y2="39" stroke="#f1f5f9" strokeWidth="1.5" />
        {/* Door Lines */}
        <line x1="82" y1="21" x2="82" y2="46" stroke="#881337" strokeWidth="1.2" />
        {/* Paykan Classic Door Handles */}
        <rect x="68" y="37" width="5" height="1.8" rx="0.8" fill="#f1f5f9" />
        <rect x="94" y="37" width="5" height="1.8" rx="0.8" fill="#f1f5f9" />
        {/* Front Headlight (چراغ گرد جلو) */}
        <circle cx="147" cy="38" r="3.5" fill="#fef08a" stroke="#cbd5e1" strokeWidth="1" />
        {/* Rear Tail Light */}
        <rect x="12" y="36" width="3" height="6" rx="1" fill="#ef4444" />
        {/* Solar Sunburst Wheels (قالپاق خورشیدی) */}
        <Wheel cx="30" cy="47" r="10" rimColor="#f8fafc" tireColor="#1e293b" spokes={8} />
        <Wheel cx="120" cy="47" r="10" rimColor="#f8fafc" tireColor="#1e293b" spokes={8} />
        <defs>
          <linearGradient id="paykanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 3. شورولت کامارو SS (Chevrolet Camaro SS) - Deep Blue Muscle Car
  if (skinId === 'skin-camaro' || skinId === 'skin-peugeot') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Body Muscular Stance */}
        <path
          d="M10,48 L14,35 L34,34 L56,22 L110,22 L134,34 L152,38 L154,49 L142,50 L132,47 L108,47 L98,50 L48,50 L38,47 L18,48 Z"
          fill="url(#camaroGrad)"
        />
        {/* Black Carbon Hood & Roof */}
        <path d="M57,22 L109,22 L132,34 L150,37 L148,39 L130,36 L55,36 Z" fill="#0f172a" opacity="0.85" />
        {/* Windows */}
        <path d="M59,24 L106,24 L126,33 L52,33 Z" fill="#0f172a" opacity="0.9" />
        <path d="M68,25 L102,25 L118,32 L60,32 Z" fill="#38bdf8" opacity="0.3" />
        {/* Muscular Rear Haunch */}
        <path d="M22,34 Q38,28 54,34" stroke="#1e3a8a" strokeWidth="2.5" fill="none" />
        {/* Aggressive Front Headlights on Right */}
        <path d="M144,38 L152,39 L148,43 Z" fill="#38bdf8" filter="drop-shadow(0 0 4px #0284c7)" />
        {/* Rear Lip Spoiler on Left */}
        <path d="M10,33 L22,32 L20,35 Z" fill="#0f172a" />
        {/* Dual Exhaust on Left */}
        <rect x="7" y="46" width="6" height="3" rx="1" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Black 5-Spoke Wheels */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#94a3b8" tireColor="#090d16" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#94a3b8" tireColor="#090d16" spokes={5} />
        <defs>
          <linearGradient id="camaroGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 4. فورد موستانگ ماک‌وان اصیل (Ford Mustang Mach 1) - Classic Muscle Fastback
  if (skinId === 'skin-mustang') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Fastback Muscle Body */}
        <path
          d="M8,47 L12,32 L35,32 L54,19 L105,19 L132,32 L154,36 L154,48 L142,49 L132,46 L108,46 L98,49 L48,49 L38,46 L18,48 Z"
          fill="url(#mustangGrad)"
        />
        {/* Black Hockey-Stick Side Stripe */}
        <path d="M18,37 L140,37 L144,40 L20,40 Z" fill="#18181b" />
        {/* Windows Fastback */}
        <path d="M57,21 L102,21 L124,31 L44,31 Z" fill="#0f172a" opacity="0.9" />
        {/* Hood Scoop on Right */}
        <polygon points="126,29 140,29 138,32 124,32" fill="#18181b" />
        {/* Chrome Front Headlight on Right */}
        <circle cx="149" cy="36" r="3.2" fill="#fef08a" stroke="#cbd5e1" strokeWidth="1" />
        {/* Rear Wing Lip on Left */}
        <path d="M8,30 L20,29 L16,33 Z" fill="#18181b" />
        {/* Exhaust on Left */}
        <rect x="5" y="45" width="6" height="3" rx="1.5" fill="#94a3b8" />
        {/* Classic Mag Wheels */}
        <Wheel cx="32" cy="47" r="10.5" rimColor="#e2e8f0" tireColor="#18181b" spokes={5} />
        <Wheel cx="122" cy="47" r="10.5" rimColor="#e2e8f0" tireColor="#18181b" spokes={5} />
        <defs>
          <linearGradient id="mustangGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 5. ب‌ام‌و M5 سوپراسپرت (BMW M5 Competition) - Metallic Sport Sedan
  if (skinId === 'skin-bmw-m5' || skinId === 'skin-dena') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Sport Sedan Body */}
        <path
          d="M12,48 L14,35 L36,34 L56,20 L112,20 L130,34 L152,40 L154,49 L142,50 L132,47 L108,47 L98,50 L48,50 L38,47 L18,48 Z"
          fill="url(#bmwGrad)"
        />
        {/* Windows with Hofmeister Kink on Left */}
        <path d="M58,22 L82,22 L82,33 L42,33 Z" fill="#0f172a" opacity="0.88" />
        <path d="M85,22 L110,22 L124,33 L85,33 Z" fill="#0f172a" opacity="0.88" />
        {/* M Side Badge */}
        <polygon points="42,37 45,35 48,37" fill="#38bdf8" />
        {/* BMW Angel Eye Headlight on Right */}
        <path d="M142,38 L152,40 L146,44 Z" fill="#38bdf8" filter="drop-shadow(0 0 4px #bae6fd)" />
        {/* M Quad Exhaust on Left */}
        <rect x="8" y="46" width="6" height="3" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Bronze Metallic M Wheels */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#d97706" tireColor="#0f172a" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#d97706" tireColor="#0f172a" spokes={5} />
        <defs>
          <linearGradient id="bmwGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 6. پورشه ۹۱۱ GT3 (Porsche 911 GT3 RS) - White GT Supercar with Swan-Neck Wing
  if (skinId === 'skin-porsche') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Iconic Porsche Flyline Curve Body */}
        <path
          d="M12,48 L18,36 L36,33 L62,18 L104,18 L130,33 L152,42 L154,50 L142,50 L132,48 L108,48 L98,51 L48,51 L38,48 L18,48 Z"
          fill="url(#porscheGrad)"
        />
        {/* Curved Teardrop Windows */}
        <path d="M64,20 Q84,15 106,20 L122,32 L50,32 Z" fill="#0f172a" opacity="0.9" />
        {/* Massive Swan-Neck GT3 Rear Wing on Left */}
        <path d="M10,26 L28,24 L24,28 Z" fill="#0f172a" />
        <line x1="16" y1="27" x2="22" y2="35" stroke="#0f172a" strokeWidth="2" />
        {/* Iconic Oval Headlights on Right */}
        <ellipse cx="144" cy="38" rx="4.5" ry="3.5" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.2" />
        {/* Central Dual Exhaust on Left */}
        <rect x="8" y="47" width="5" height="3" rx="1.5" fill="#334155" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Black Satin GT3 Wheels */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#94a3b8" tireColor="#090d16" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#94a3b8" tireColor="#090d16" spokes={5} />
        <defs>
          <linearGradient id="porscheGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 7. لامبورگینی هوراکان پرفورمانته (Lamborghini Huracán) - White Angular Supercar
  if (skinId === 'skin-lamborghini') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        {/* Wedge Shaped Angular Body */}
        <path
          d="M8,48 L16,36 L38,32 L64,18 L108,18 L134,32 L154,44 L156,50 L140,51 L132,48 L108,48 L98,51 L48,51 L38,48 L18,48 Z"
          fill="url(#lamboGrad)"
        />
        {/* Low Cockpit Glass */}
        <path d="M66,19 L88,14 L114,18 L130,30 L68,30 Z" fill="#0f172a" opacity="0.9" />
        {/* Angular Side Air Intake */}
        <polygon points="45,36 68,33 58,42" fill="#0f172a" />
        {/* High-Mounted ALA Carbon Rear Wing on Left */}
        <path d="M8,26 L26,24 L22,28 Z" fill="#0f172a" />
        <line x1="14" y1="27" x2="20" y2="35" stroke="#0f172a" strokeWidth="2" />
        {/* Sharp Arrow Headlight on Right */}
        <path d="M144,39 L154,43 L146,45 Z" fill="#facc15" filter="drop-shadow(0 0 4px #fbbf24)" />
        {/* Exhaust on Left */}
        <rect x="5" y="44" width="5" height="4" rx="1.5" fill="#334155" stroke="#facc15" strokeWidth="0.8" />
        {/* Gold Alloy Wheels */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#eab308" tireColor="#0f172a" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#eab308" tireColor="#0f172a" spokes={5} />
        <defs>
          <linearGradient id="lamboGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 8. آئودی R8 گرندتوریسمو (Audi R8 V10) - Dark Matte Supercar
  if (skinId === 'skin-audi-r8' || skinId === 'skin-samand') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        <path
          d="M10,48 L16,36 L36,33 L62,19 L106,19 L132,32 L152,42 L154,50 L140,51 L132,48 L108,48 L98,51 L48,51 L38,48 L18,48 Z"
          fill="url(#audiGrad)"
        />
        {/* Signature Black Carbon Side Blade */}
        <path d="M44,28 L56,22 L52,44 L40,44 Z" fill="#18181b" />
        {/* Cockpit Window */}
        <path d="M64,20 L86,15 L112,19 L128,31 L66,31 Z" fill="#0f172a" opacity="0.9" />
        {/* Headlight on Right */}
        <path d="M142,37 L152,42 L146,44 Z" fill="#38bdf8" />
        {/* Exhaust on Left */}
        <rect x="6" y="45" width="6" height="3" rx="1.5" fill="#27272a" stroke="#d97706" strokeWidth="0.8" />
        {/* Bronze Gold Rims */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#d97706" tireColor="#18181b" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#d97706" tireColor="#18181b" spokes={5} />
        <defs>
          <linearGradient id="audiGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="50%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 9. مک‌لارن مسابقه‌ای P1 (McLaren P1 Hypercar) - Crimson Aerodynamic Hypercar
  if (skinId === 'skin-mclaren' || skinId === 'skin-cyber-phantom') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
        <path
          d="M8,48 L16,35 L38,30 L60,16 L104,16 L130,30 L152,42 L154,50 L140,51 L132,48 L108,48 L98,51 L48,51 L38,48 L18,48 Z"
          fill="url(#mclarenGrad)"
        />
        {/* Roof Snorkel Air Intake */}
        <path d="M64,15 L78,12 L84,16 Z" fill="#0f172a" />
        {/* Active Raised Rear Wing on Left */}
        <path d="M6,22 L24,20 L20,24 Z" fill="#0f172a" />
        <line x1="12" y1="23" x2="18" y2="34" stroke="#0f172a" strokeWidth="2" />
        {/* Cockpit Window */}
        <path d="M62,17 L85,13 L110,16 L126,29 L64,29 Z" fill="#0f172a" opacity="0.9" />
        {/* Headlight on Right */}
        <path d="M140,36 L152,41 L144,43 Z" fill="#38bdf8" />
        {/* Center Exit Exhaust on Left */}
        <rect x="5" y="43" width="5" height="3" rx="1.5" fill="#334155" stroke="#38bdf8" strokeWidth="0.8" />
        {/* Wheels */}
        <Wheel cx="32" cy="48" r="10.5" rimColor="#38bdf8" tireColor="#0f172a" spokes={5} />
        <Wheel cx="122" cy="48" r="10.5" rimColor="#38bdf8" tireColor="#0f172a" spokes={5} />
        <defs>
          <linearGradient id="mclarenGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 10. موتورسیکلت سنگین یاماها R1 ریسینگ (Yamaha YZF-R1) - Racing Blue Superbike
  if (skinId === 'skin-yamaha-r1') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="60" ry="3.5" fill="rgba(0,0,0,0.5)" />
        {/* Bike Frame & Fairing facing RIGHT */}
        <path
          d="M32,47 L50,30 L75,22 L98,22 L116,28 L124,35 L126,47 L114,47 L100,34 L66,35 L42,47 Z"
          fill="url(#yamahaGrad)"
        />
        {/* Windshield on Right */}
        <path d="M110,24 L126,20 L128,30 L114,29 Z" fill="#0f172a" opacity="0.85" />
        {/* Handlebars on Right */}
        <line x1="116" y1="25" x2="124" y2="22" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        {/* Gold Inverted Fork */}
        <line x1="116" y1="28" x2="122" y2="47" stroke="#eab308" strokeWidth="2.5" />
        {/* Rider Seat on Left */}
        <path d="M60,26 L78,24 L74,31 L58,31 Z" fill="#0f172a" />
        {/* Akrapovic Titanium Exhaust on Left */}
        <polygon points="34,42 54,34 56,38 36,46" fill="#64748b" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Blue Alloy Superbike Wheels */}
        <Wheel cx="32" cy="47" r="11" rimColor="#38bdf8" tireColor="#0f172a" spokes={6} />
        <Wheel cx="122" cy="47" r="11" rimColor="#38bdf8" tireColor="#0f172a" spokes={6} />
        <defs>
          <linearGradient id="yamahaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 11. موتورسیکلت دوکاتی سوپراسپرت قرمز (Ducati SuperSport) - Racing Red Italian Superbike
  if (skinId === 'skin-ducati' || skinId === 'skin-ninja-h2') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="60" ry="3.5" fill="rgba(0,0,0,0.5)" />
        {/* Red Fairing */}
        <path
          d="M32,47 L48,30 L72,20 L96,20 L118,26 L126,34 L126,47 L114,47 L98,34 L66,35 L42,47 Z"
          fill="url(#ducatiGrad)"
        />
        {/* Exposed Red Trellis Frame */}
        <line x1="68" y1="28" x2="90" y2="38" stroke="#991b1b" strokeWidth="2.5" />
        <line x1="78" y1="25" x2="82" y2="40" stroke="#991b1b" strokeWidth="2.5" />
        {/* Windshield & Headlight on Right */}
        <path d="M112,23 L126,18 L128,28 L114,27 Z" fill="#0f172a" opacity="0.85" />
        <path d="M124,30 L128,34 L122,36 Z" fill="#fef08a" />
        {/* Handlebars */}
        <line x1="116" y1="22" x2="124" y2="20" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        {/* Front Fork */}
        <line x1="116" y1="26" x2="122" y2="47" stroke="#eab308" strokeWidth="2.5" />
        {/* Stacked Exhaust on Left */}
        <polygon points="36,44 56,36 58,40 38,48" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Wheels */}
        <Wheel cx="32" cy="47" r="11" rimColor="#ef4444" tireColor="#0f172a" spokes={6} />
        <Wheel cx="122" cy="47" r="11" rimColor="#ef4444" tireColor="#0f172a" spokes={6} />
        <defs>
          <linearGradient id="ducatiGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 12. موتورسیکلت هارلی دیویدسون لایووایر (Harley-Davidson LiveWire) - Orange Muscle Bike
  if (skinId === 'skin-harley' || skinId === 'skin-cg125') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="60" ry="3.5" fill="rgba(0,0,0,0.5)" />
        {/* Muscular Orange Teardrop Tank & Frame */}
        <path
          d="M32,47 L46,36 L68,24 L94,22 L112,28 L122,34 L124,47 L114,47 L98,38 L68,39 L42,47 Z"
          fill="url(#harleyGrad)"
        />
        {/* Exposed Cast Engine Block */}
        <rect x="65" y="32" width="28" height="14" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
        {/* Inverted Front Fork on Right */}
        <line x1="110" y1="25" x2="122" y2="47" stroke="#94a3b8" strokeWidth="3" />
        {/* Handlebars */}
        <line x1="108" y1="22" x2="116" y2="18" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        {/* Round Headlight on Right */}
        <circle cx="120" cy="29" r="3.5" fill="#fef08a" stroke="#cbd5e1" strokeWidth="1" />
        {/* Fat Rear Wheel & Front Wheel */}
        <Wheel cx="32" cy="47" r="11.5" rimColor="#94a3b8" tireColor="#0f172a" spokes={7} />
        <Wheel cx="122" cy="47" r="11" rimColor="#94a3b8" tireColor="#0f172a" spokes={7} />
        <defs>
          <linearGradient id="harleyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 13. استیو ماینکرفت سوار بر ماین‌کارت (Minecraft Steve in Minecart) - 100% Authentic Voxel Cutout
  if (skinId === 'skin-steve-minecart') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="55" ry="3.5" fill="rgba(0,0,0,0.5)" />
        {/* Minecart Rails underneath */}
        <line x1="20" y1="52" x2="140" y2="52" stroke="#64748b" strokeWidth="2" />
        <rect x="35" y="50" width="4" height="4" fill="#78350f" />
        <rect x="75" y="50" width="4" height="4" fill="#78350f" />
        <rect x="115" y="50" width="4" height="4" fill="#78350f" />

        {/* --- STEVE INSIDE THE MINECART --- */}
        {/* Steve Head (Blocky Voxel facing right) */}
        <rect x="76" y="8" width="16" height="16" fill="#d49b73" stroke="#26180b" strokeWidth="0.8" />
        {/* Steve Hair (Brown Voxel) */}
        <polygon points="76,8 92,8 92,13 88,13 88,10 76,10" fill="#4a2e18" />
        {/* Steve Eye facing right */}
        <rect x="88" y="14" width="3" height="3" fill="#ffffff" />
        <rect x="89" y="14" width="2" height="3" fill="#2563eb" />
        {/* Steve Nose & Mouth */}
        <rect x="89" y="19" width="3" height="1.5" fill="#884422" />
        {/* Steve Torso (Cyan T-shirt) */}
        <rect x="74" y="24" width="20" height="15" fill="#00aaaa" stroke="#006666" strokeWidth="0.8" />
        {/* Steve Arm holding minecart rim */}
        <rect x="86" y="25" width="8" height="12" fill="#d49b73" stroke="#006666" strokeWidth="0.8" />

        {/* --- MINECART (Iron Voxel Cart) --- */}
        <path
          d="M45,46 L40,32 L116,32 L111,46 Z"
          fill="#858585"
          stroke="#383838"
          strokeWidth="1.5"
        />
        {/* Cart Interior & Rim */}
        <rect x="40" y="31" width="76" height="4" fill="#555555" />
        <rect x="44" y="37" width="68" height="3" fill="#a0a0a0" opacity="0.6" />
        {/* Flanged Minecart Wheels */}
        <g className={wheelAnimClass} style={{ transformOrigin: '55px 48px', animationDuration: '0.4s' }}>
          <circle cx="55" cy="48" r="7" fill="#383838" stroke="#707070" strokeWidth="2" />
          <circle cx="55" cy="48" r="2.5" fill="#a0a0a0" />
        </g>
        <g className={wheelAnimClass} style={{ transformOrigin: '101px 48px', animationDuration: '0.4s' }}>
          <circle cx="101" cy="48" r="7" fill="#383838" stroke="#707070" strokeWidth="2" />
          <circle cx="101" cy="48" r="2.5" fill="#a0a0a0" />
        </g>
      </svg>
    );
  }

  // 14. کارتینگ کریپر پیکسلی (Minecraft Creeper TNT Kart) - Authentic Pixel Creeper
  if (skinId === 'skin-creeper-kart') {
    return (
      <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
        <ellipse cx="80" cy="55" rx="58" ry="3.5" fill="rgba(0,0,0,0.5)" />
        {/* --- CREEPER HEAD (Blocky Pixel Texture facing right) --- */}
        <rect x="74" y="8" width="18" height="18" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        {/* Creeper Mosaic Green Pixels */}
        <rect x="76" y="10" width="4" height="4" fill="#16a34a" />
        <rect x="84" y="9" width="4" height="4" fill="#4ade80" />
        <rect x="75" y="18" width="4" height="4" fill="#15803d" />
        {/* Creeper Eye & Frown on Right */}
        <rect x="85" y="13" width="5" height="4" fill="#090d16" />
        <polygon points="85,18 90,18 90,24 87,24 87,21 85,21" fill="#090d16" />

        {/* --- TNT BLOCK KART CHASSIS --- */}
        {/* Red TNT Block behind Creeper */}
        <rect x="36" y="22" width="28" height="20" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
        {/* TNT White Band */}
        <rect x="36" y="29" width="28" height="7" fill="#ffffff" />
        <text x="50" y="35" fontSize="6" fontWeight="bold" fill="#000000" textAnchor="middle" fontFamily="monospace">TNT</text>
        {/* Kart Front Bumper on Right */}
        <path d="M64,36 L124,36 L120,46 L60,46 Z" fill="#15803d" stroke="#14532d" strokeWidth="1" />
        <rect x="115" y="38" width="12" height="6" rx="2" fill="#ef4444" />
        {/* Obsidian Black Kart Wheels */}
        <Wheel cx="48" cy="48" r="9" rimColor="#22c55e" tireColor="#0f172a" spokes={4} />
        <Wheel cx="110" cy="48" r="9" rimColor="#22c55e" tireColor="#0f172a" spokes={4} />
      </svg>
    );
  }

  // Fallback: Default Sleek Supercar (Faces Right)
  return (
    <svg viewBox="0 0 160 60" className={`w-28 sm:w-32 h-11 sm:h-12 drop-shadow-md select-none ${className}`}>
      <ellipse cx="80" cy="55" rx="72" ry="4" fill="rgba(0,0,0,0.5)" />
      <path
        d="M10,48 L18,36 L38,32 L60,20 L105,18 L132,32 L152,42 L155,50 L140,51 L132,48 L108,48 L98,51 L48,51 L38,48 L18,48 Z"
        fill="#dc2626"
      />
      <path d="M62,21 L85,14 L112,18 L128,30 L66,30 Z" fill="#0f172a" opacity="0.9" />
      <Wheel cx="32" cy="48" r="10.5" rimColor="#facc15" spokes={5} />
      <Wheel cx="122" cy="48" r="10.5" rimColor="#facc15" spokes={5} />
    </svg>
  );
}
