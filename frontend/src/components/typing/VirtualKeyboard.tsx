'use client';

import React, { useState, useEffect } from 'react';
import { Settings2, Sparkles, Palette, Check, X, Zap } from 'lucide-react';

interface VirtualKeyboardProps {
  language: 'fa' | 'en';
  currentExpectedChar: string;
  isError: boolean;
  pressedKey?: string;
  showHandsGuide?: boolean;
}

export interface KeyboardTheme {
  id: string;
  nameFa: string;
  chassisColor: string;
  keycapColor: string;
  textColor: string;
  modifierColor: string;
  activeColor: string;
  rgbGlow: boolean;
}

export const PRESET_THEMES: KeyboardTheme[] = [
  {
    id: 'apple',
    nameFa: 'کلاسیک استاندارد',
    chassisColor: '#E2E8F0',
    keycapColor: '#FFFFFF',
    textColor: '#334155',
    modifierColor: '#F1F5F9',
    activeColor: '#2563EB', // Blue
    rgbGlow: false
  },
  {
    id: 'cyberpunk',
    nameFa: 'سایبرپانک گیمینگ (Neon RGB)',
    chassisColor: '#0F172A',
    keycapColor: '#1E293B',
    textColor: '#38BDF8',
    modifierColor: '#090D16',
    activeColor: '#A855F7', // Neon Purple
    rgbGlow: true
  },
  {
    id: 'rog',
    nameFa: 'آتشفشان گیمینگ (ROG Crimson)',
    chassisColor: '#18181B',
    keycapColor: '#27272A',
    textColor: '#FAFAFA',
    modifierColor: '#09090B',
    activeColor: '#DC2626', // Crimson Red
    rgbGlow: true
  },
  {
    id: 'matrix',
    nameFa: 'ماتریس هکری (Cyber Green)',
    chassisColor: '#022C22',
    keycapColor: '#064E3B',
    textColor: '#34D399',
    modifierColor: '#021B15',
    activeColor: '#10B981', // Emerald
    rgbGlow: true
  },
  {
    id: 'cosmic',
    nameFa: 'کهکشان رویایی (Cosmic Violet)',
    chassisColor: '#2E1065',
    keycapColor: '#3B0764',
    textColor: '#E9D5FF',
    modifierColor: '#1E0B3B',
    activeColor: '#EC4899', // Hot Pink
    rgbGlow: true
  },
  {
    id: 'retro',
    nameFa: 'مکانیکال رترو (IBM 1984)',
    chassisColor: '#D6C8B4',
    keycapColor: '#F5EFEB',
    textColor: '#4A4238',
    modifierColor: '#C9BBA5',
    activeColor: '#EA580C', // Orange
    rgbGlow: false
  }
];

function VirtualKeyboard({
  language,
  currentExpectedChar,
  isError,
  pressedKey,
  showHandsGuide = true
}: VirtualKeyboardProps) {
  // Theme state persisted in localStorage
  const [theme, setTheme] = useState<KeyboardTheme>(PRESET_THEMES[0]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('typro_keyboard_theme');
      if (saved) {
        setTheme(JSON.parse(saved));
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const handleApplyTheme = (newTheme: KeyboardTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('typro_keyboard_theme', JSON.stringify(newTheme));
    } catch {
      // Ignore
    }
  };

  const handleUpdateCustomColor = (key: keyof KeyboardTheme, value: any) => {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    try {
      localStorage.setItem('typro_keyboard_theme', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Key normalization for matching
  const normalize = (c: string) => {
    if (!c) return '';
    if (c === 'ي') return 'ی';
    if (c === 'ك') return 'ک';
    return c.toLowerCase();
  };

  const targetCharNormalized = normalize(currentExpectedChar);

  const normalizeDigit = (c: string): string => {
    if (!c) return '';
    const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    const arDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    const fIdx = faDigits.indexOf(c);
    if (fIdx !== -1) return String(fIdx);
    const aIdx = arDigits.indexOf(c);
    if (aIdx !== -1) return String(aIdx);
    return c;
  };

  const isKeyActive = (keyFa: string, keyEn: string) => {
    if (currentExpectedChar === ' ' && (keyFa === 'Space' || keyEn === 'Space')) return true;

    // Number matching (supports English, Persian, and Arabic digits)
    const normExp = normalizeDigit(currentExpectedChar);
    if (/\d/.test(normExp)) {
      return normalizeDigit(keyFa) === normExp || normalizeDigit(keyEn) === normExp;
    }

    // Letter 'پ' multi-position matching (top row ` or above enter \)
    if (currentExpectedChar === 'پ') {
      if (keyFa.includes('پ') || keyEn === '`' || keyEn === '\\') {
        return true;
      }
    }

    return (
      normalize(keyFa) === targetCharNormalized ||
      normalize(keyEn) === targetCharNormalized
    );
  };

  interface KeyDef {
    fa: string;
    en: string;
    x: number;
    w: number;
    isMod?: boolean;
    isSpace?: boolean;
    bump?: boolean;
  }

  // SVG Keyboard Key Definitions
  // Row 1: Numbers (y: 24)
  const row1Keys: KeyDef[] = [
    { fa: 'پ / ÷', en: '`', x: 25, w: 55 },
    { fa: '۱', en: '1', x: 86, w: 55 },
    { fa: '۲', en: '2', x: 147, w: 55 },
    { fa: '۳', en: '3', x: 208, w: 55 },
    { fa: '۴', en: '4', x: 269, w: 55 },
    { fa: '۵', en: '5', x: 330, w: 55 },
    { fa: '۶', en: '6', x: 391, w: 55 },
    { fa: '۷', en: '7', x: 452, w: 55 },
    { fa: '۸', en: '8', x: 513, w: 55 },
    { fa: '۹', en: '9', x: 574, w: 55 },
    { fa: '۰', en: '0', x: 635, w: 55 },
    { fa: '-', en: '-', x: 696, w: 55 },
    { fa: '=', en: '=', x: 757, w: 55 },
    { fa: 'Backspace', en: 'backspace', isMod: true, x: 818, w: 77 }
  ];

  // Row 2: Tab row (y: 80)
  const row2Keys: KeyDef[] = [
    { fa: 'Tab', en: 'tab', isMod: true, x: 25, w: 82 },
    { fa: 'ض', en: 'q', x: 113, w: 55 },
    { fa: 'ص', en: 'w', x: 174, w: 55 },
    { fa: 'ث', en: 'e', x: 235, w: 55 },
    { fa: 'ق', en: 'r', x: 296, w: 55 },
    { fa: 'ف', en: 't', x: 357, w: 55 },
    { fa: 'غ', en: 'y', x: 418, w: 55 },
    { fa: 'ع', en: 'u', x: 479, w: 55 },
    { fa: 'ه', en: 'i', x: 540, w: 55 },
    { fa: 'خ', en: 'o', x: 601, w: 55 },
    { fa: 'ح', en: 'p', x: 662, w: 55 },
    { fa: 'ج', en: '[', x: 723, w: 55 },
    { fa: 'چ', en: ']', x: 784, w: 55 },
    { fa: 'پ / \\', en: '\\', x: 845, w: 50 }
  ];

  // Row 3: Home row (y: 136)
  const row3Keys: KeyDef[] = [
    { fa: 'Caps Lock', en: 'caps lock', isMod: true, x: 25, w: 98 },
    { fa: 'ش', en: 'a', x: 129, w: 55 }, // Left pinky
    { fa: 'س', en: 's', x: 190, w: 55 }, // Left ring
    { fa: 'ی', en: 'd', x: 251, w: 55 }, // Left middle
    { fa: 'ب', en: 'f', x: 312, w: 55, bump: true }, // Left index anchor
    { fa: 'ل', en: 'g', x: 373, w: 55 },
    { fa: 'ا', en: 'h', x: 434, w: 55 },
    { fa: 'ت', en: 'j', x: 495, w: 55, bump: true }, // Right index anchor
    { fa: 'ن', en: 'k', x: 556, w: 55 }, // Right middle
    { fa: 'م', en: 'l', x: 617, w: 55 }, // Right ring
    { fa: 'ک', en: ';', x: 678, w: 55 }, // Right pinky
    { fa: 'گ', en: "'", x: 739, w: 55 },
    { fa: 'Enter', en: 'enter', isMod: true, x: 800, w: 95 }
  ];

  // Row 4: Shift row (y: 192)
  const row4Keys: KeyDef[] = [
    { fa: 'Shift', en: 'shift', isMod: true, x: 25, w: 120 },
    { fa: 'ظ', en: 'z', x: 151, w: 55 },
    { fa: 'ط', en: 'x', x: 212, w: 55 },
    { fa: 'ز', en: 'c', x: 273, w: 55 },
    { fa: 'ر', en: 'v', x: 334, w: 55 },
    { fa: 'ذ', en: 'b', x: 395, w: 55 },
    { fa: 'د', en: 'n', x: 456, w: 55 },
    { fa: 'پ', en: 'm', x: 517, w: 55 },
    { fa: 'و', en: ',', x: 578, w: 55 },
    { fa: '.', en: '.', x: 639, w: 55 },
    { fa: '؟', en: '/', x: 700, w: 55 },
    { fa: 'Shift', en: 'shift', isMod: true, x: 761, w: 134 }
  ];

  // Row 5: Space row (y: 248)
  const row5Keys: KeyDef[] = [
    { fa: 'Control', en: 'control', isMod: true, x: 25, w: 75 },
    { fa: 'Option', en: 'option', isMod: true, x: 106, w: 68 },
    { fa: 'Cmd', en: 'cmd', isMod: true, x: 180, w: 68 },
    { fa: 'Space', en: 'Space', isSpace: true, x: 254, w: 380 },
    { fa: 'Cmd', en: 'cmd', isMod: true, x: 640, w: 68 },
    { fa: 'Option', en: 'option', isMod: true, x: 714, w: 68 },
    { fa: 'Ctrl', en: 'control', isMod: true, x: 788, w: 107 }
  ];

  // Active Highlight Color (Red on error, theme active color otherwise)
  const highlightColor = isError ? '#DC2626' : theme.activeColor;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 select-none">
      {/* Top Toolbar: Active key hint & Gaming Settings Toggle */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs">
          {currentExpectedChar ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">کلید هدف:</span>
              <span
                className="px-3 py-1 rounded-lg font-bold text-white text-xs shadow-xs"
                style={{ backgroundColor: highlightColor }}
              >
                {currentExpectedChar === ' ' ? 'فاصله (Space)' : currentExpectedChar}
              </span>
            </div>
          ) : (
            <span className="text-slate-400">آماده تایپ...</span>
          )}
        </div>

        {/* Gaming Theme Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 shadow-xs"
        >
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span>تنظیمات رنگ و پوسته گیمینگ</span>
          {showSettings ? <X className="w-3.5 h-3.5 ml-1" /> : <Settings2 className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>

      {/* Gaming Theme Customizer Panel */}
      {showSettings && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-extrabold text-sm text-slate-900">
                شخصی‌سازی و رنگ‌آمیزی کیبورد گیمینگ (Custom Gaming Keyboard)
              </h4>
            </div>
            <span className="text-xs text-slate-400">ذخیره خودکار در مرورگر</span>
          </div>

          {/* Preset Theme Cards */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">
              پوسته‌های آماده گیمینگ و کلاسیک:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PRESET_THEMES.map((p) => {
                const isSelected = theme.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleApplyTheme(p)}
                    className={`p-2.5 rounded-2xl border text-right transition flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: p.chassisColor }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: p.activeColor }}
                        />
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      {p.nameFa}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Zone Color Pickers */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">رنگ بدنه کیبورد:</span>
              <input
                type="color"
                value={theme.chassisColor}
                onChange={(e) => handleUpdateCustomColor('chassisColor', e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-1">رنگ کلیدهای عادی:</span>
              <input
                type="color"
                value={theme.keycapColor}
                onChange={(e) => handleUpdateCustomColor('keycapColor', e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-1">رنگ کلیدهای کنترل:</span>
              <input
                type="color"
                value={theme.modifierColor}
                onChange={(e) => handleUpdateCustomColor('modifierColor', e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-1">رنگ کلید فعال:</span>
              <input
                type="color"
                value={theme.activeColor}
                onChange={(e) => handleUpdateCustomColor('activeColor', e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
            </div>
          </div>

          {/* RGB Gaming Wave Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-700">افکت نورپردازی RGB تنفسی (Glow Wave)</span>
            </div>
            <button
              onClick={() => handleUpdateCustomColor('rgbGlow', !theme.rgbGlow)}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                theme.rgbGlow
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {theme.rgbGlow ? 'فعال است' : 'غیرفعال'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE VIRTUAL KEYBOARD CANVAS (Standalone Clean Chiclet Keyboard)            */}
      {/* ========================================================================= */}
      <div
        className={`w-full relative rounded-3xl p-2 sm:p-4 border transition-all duration-300 overflow-hidden ${
          theme.rgbGlow
            ? 'shadow-[0_0_25px_rgba(168,85,247,0.35)] border-purple-500/40'
            : 'shadow-xl border-slate-300'
        }`}
        style={{
          backgroundColor: theme.chassisColor
        }}
        dir="ltr"
      >
        <svg
          viewBox="0 0 920 312"
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft keycap drop shadow */}
            <filter id="keyShadow" x="-5%" y="-5%" width="110%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
            </filter>

            {/* Active Finger/Key Neon Glow */}
            <filter id="activeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={highlightColor} floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Keyboard Inner Frame Chassis */}
          <rect
            x="12"
            y="12"
            width="896"
            height="288"
            rx="16"
            fill={theme.chassisColor}
            stroke="#00000015"
            strokeWidth="1.5"
          />

          {/* ------------------------------------------------------------- */}
          {/* LAYER 1: KEYBOARD KEYS (All 5 Rows)                           */}
          {/* ------------------------------------------------------------- */}
          {[
            { row: row1Keys, y: 24, h: 48 },
            { row: row2Keys, y: 78, h: 48 },
            { row: row3Keys, y: 132, h: 48 },
            { row: row4Keys, y: 186, h: 48 },
            { row: row5Keys, y: 240, h: 48 }
          ].map(({ row, y, h }, rIdx) => (
            <g key={rIdx}>
              {row.map((k, kIdx) => {
                const active = isKeyActive(k.fa, k.en);
                const isSpace = 'isSpace' in k && k.isSpace;
                const isMod = 'isMod' in k && k.isMod;

                const isHomeAnchor = 
                  ['ش', 'س', 'ی', 'ب', 'ت', 'ن', 'م', 'ک', 'Space'].includes(k.fa) ||
                  ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', 'space'].includes(k.en.toLowerCase());

                // Color calculation
                let keyBg = isMod ? theme.modifierColor : theme.keycapColor;
                let textColor = theme.textColor;
                let strokeColor = '#00000015';

                // Soft pastel mint green tint for home row anchor keys in classic theme (matching co74.jpg)
                if (isHomeAnchor && (theme.id === 'apple' || !theme.id) && !active) {
                  keyBg = '#D9F2DC';
                  strokeColor = '#A3D9AA';
                }

                if (active) {
                  keyBg = highlightColor;
                  textColor = '#FFFFFF';
                  strokeColor = highlightColor;
                }

                return (
                  <g key={kIdx} className="transition-all duration-100">
                    <rect
                      x={k.x}
                      y={y}
                      width={k.w}
                      height={h}
                      rx="8"
                      fill={keyBg}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      filter={active ? 'url(#activeGlowFilter)' : 'url(#keyShadow)'}
                    />

                    {/* Persian and English character text */}
                    {isSpace ? (
                      <text
                        x={k.x + k.w / 2}
                        y={y + 30}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill={textColor}
                        opacity={active ? 1 : 0.6}
                      >
                        space
                      </text>
                    ) : isMod ? (
                      <text
                        x={k.x + k.w / 2}
                        y={y + 29}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={textColor}
                      >
                        {k.en}
                      </text>
                    ) : (
                      <>
                        {/* Persian Letter (Prominent / Center-Right) */}
                        <text
                          x={k.x + k.w / 2}
                          y={y + 32}
                          textAnchor="middle"
                          fontSize="18"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                          fill={textColor}
                        >
                          {k.fa}
                        </text>
                        {/* English Small Subscript (Top-Left) */}
                        <text
                          x={k.x + 8}
                          y={y + 16}
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          fill={textColor}
                          opacity={active ? 0.9 : 0.45}
                        >
                          {k.en}
                        </text>
                      </>
                    )}

                    {/* Tactile Anchor Bump on 'ب' (F) and 'ت' (J) */}
                    {'bump' in k && k.bump && (
                      <rect
                        x={k.x + k.w / 2 - 6}
                        y={y + h - 7}
                        width="12"
                        height="2.5"
                        rx="1.2"
                        fill={active ? '#FFFFFF' : theme.textColor}
                        opacity={active ? 0.9 : 0.4}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          ))}

        </svg>
      </div>
    </div>
  );
}

export default React.memo(VirtualKeyboard);
