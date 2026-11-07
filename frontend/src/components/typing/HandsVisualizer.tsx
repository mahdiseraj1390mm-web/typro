'use client';

import React from 'react';
import { FINGER_MAP } from '@/lib/constants';

interface HandsVisualizerProps {
  currentExpectedChar: string;
  isError?: boolean;
  language?: 'fa' | 'en';
}

function HandsVisualizer({
  currentExpectedChar,
  isError = false,
  language = 'fa'
}: HandsVisualizerProps) {
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
  const normChar = normalizeDigit(currentExpectedChar).toLowerCase();
  const currentFinger = FINGER_MAP[currentExpectedChar.toLowerCase()] || FINGER_MAP[normChar] || null;

  const isFingerActive = (hand: 'left' | 'right', finger: string) => {
    if (!currentFinger) return false;
    return currentFinger.hand === hand && currentFinger.finger === finger;
  };

  // Color profiles
  const getSkinTone = (hand: 'left' | 'right', finger: string) => {
    if (isFingerActive(hand, finger)) {
      return isError ? 'url(#errorGlow)' : 'url(#activeGlow)';
    }
    return 'url(#skinGradient)';
  };

  const getNailTone = (hand: 'left' | 'right', finger: string) => {
    if (isFingerActive(hand, finger)) {
      return isError ? '#FEF2F2' : '#EFF6FF';
    }
    return 'url(#nailGradient)';
  };

  const getFingerStroke = (hand: 'left' | 'right', finger: string) => {
    if (isFingerActive(hand, finger)) {
      return isError ? '#DC2626' : '#2563EB';
    }
    return '#E0AB89';
  };

  const getFingerClass = (hand: 'left' | 'right', finger: string) => {
    if (isFingerActive(hand, finger)) {
      return 'cursor-pointer transition-all duration-150 transform translate-y-2 scale-[1.02] filter drop-shadow(0 6px 8px rgba(37,99,235,0.4))';
    }
    return 'transition-all duration-200 hover:opacity-95';
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-b from-white to-slate-50 rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm">شبیه‌ساز ارگونومیک ده‌انگشتی طبیعی</span>
            <span className="text-[11px] text-slate-400 block">آناتومی طبیعی دست، مفاصل سه‌گانه و هدایت‌گر حسی ردیف پایه</span>
          </div>
        </div>

        {currentFinger ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">انگشت فعال:</span>
            <span
              className={`px-3 py-1 rounded-xl font-bold text-xs shadow-xs transition-all ${
                isError
                  ? 'bg-red-500 text-white shadow-red-500/30'
                  : 'bg-blue-600 text-white shadow-blue-500/30 animate-bounce'
              }`}
            >
              {currentFinger.nameFa}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">دست‌ها در حالت استراحت روی ردیف خانه</span>
        )}
      </div>

      {/* SVG Canvas for Realistic Hands */}
      <div className="relative w-full max-w-2xl mx-auto py-2">
        <svg
          viewBox="0 0 680 340"
          className="w-full h-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Realistic Natural Skin Gradient */}
            <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F9D4BE" />
              <stop offset="60%" stopColor="#F5C2A5" />
              <stop offset="100%" stopColor="#EAB191" />
            </linearGradient>

            {/* Darker Palm / Joint Crease Shade */}
            <linearGradient id="palmShade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E6A885" />
              <stop offset="100%" stopColor="#D99772" />
            </linearGradient>

            {/* Active Finger Glow (Brand Blue) */}
            <linearGradient id="activeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Error Finger Glow (Red) */}
            <linearGradient id="errorGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="70%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>

            {/* Natural Fingernail Gradient */}
            <linearGradient id="nailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF5F0" />
              <stop offset="70%" stopColor="#FCE4D6" />
              <stop offset="100%" stopColor="#F8CEBA" />
            </linearGradient>

            {/* Wrist Shadow */}
            <linearGradient id="wristFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAB191" />
              <stop offset="100%" stopColor="#D99772" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* LEFT HAND (Anatomical Natural Curve, Rotated ~6° Inward) */}
          {/* ======================================================== */}
          <g transform="translate(18, 10)">
            {/* Wrist & Forearm base */}
            <path
              d="M 80 290 C 80 260, 75 230, 70 205 C 100 215, 140 215, 175 205 C 170 230, 165 260, 165 290 Z"
              fill="url(#wristFade)"
              stroke="#D99772"
              strokeWidth="1.5"
            />

            {/* Palm Anatomy with Thenar and Hypothenar contours */}
            <path
              d="M 50 165 
                 C 45 190, 60 225, 75 235
                 C 105 245, 150 245, 175 230
                 C 195 210, 205 180, 195 145
                 C 175 140, 155 145, 140 148
                 C 115 145, 95 145, 75 148
                 C 60 152, 52 158, 50 165 Z"
              fill="url(#skinGradient)"
              stroke="#D99772"
              strokeWidth="1.5"
            />

            {/* Anatomical Palm Creases */}
            <path
              d="M 70 185 C 95 195, 125 185, 155 165"
              stroke="#D99772"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 90 220 C 115 210, 145 195, 160 170"
              stroke="#D99772"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />

            {/* Left Pinky (انگشت کوچک چپ - A / ش) */}
            <g className={getFingerClass('left', 'pinky')}>
              {/* Natural Curved Finger Contour */}
              <path
                d="M 45 165 
                   C 42 140, 40 115, 42 85 
                   C 43 72, 54 72, 57 85 
                   C 59 110, 61 135, 63 160 
                   Z"
                fill={getSkinTone('left', 'pinky')}
                stroke={getFingerStroke('left', 'pinky')}
                strokeWidth="1.8"
              />
              {/* Joints / Knuckle Creases */}
              <path d="M 43 130 C 49 132, 55 132, 60 130" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 43 105 C 48 107, 53 107, 57 105" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Fingernail */}
              <path
                d="M 45 78 C 45 74, 54 74, 54 78 C 54 84, 45 84, 45 78 Z"
                fill={getNailTone('left', 'pinky')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="49" cy="56" r="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
              <text x="49" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E293B">
                {language === 'fa' ? 'ش' : 'A'}
              </text>
            </g>

            {/* Left Ring (انگشت حلقه چپ - S / س) */}
            <g className={getFingerClass('left', 'ring')}>
              {/* Natural Curved Finger Contour */}
              <path
                d="M 68 152 
                   C 66 125, 65 95, 68 55 
                   C 70 42, 85 42, 87 55 
                   C 89 95, 90 125, 89 150 
                   Z"
                fill={getSkinTone('left', 'ring')}
                stroke={getFingerStroke('left', 'ring')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 68 120 C 76 122, 83 122, 88 120" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 68 85 C 75 87, 82 87, 87 85" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Fingernail */}
              <path
                d="M 71 49 C 71 44, 84 44, 84 49 C 84 56, 71 56, 71 49 Z"
                fill={getNailTone('left', 'ring')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="77" cy="26" r="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
              <text x="77" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E293B">
                {language === 'fa' ? 'س' : 'S'}
              </text>
            </g>

            {/* Left Middle (انگشت میانی چپ - D / ی) */}
            <g className={getFingerClass('left', 'middle')}>
              {/* Longest Finger with subtle organic curvature */}
              <path
                d="M 94 148 
                   C 93 115, 93 80, 96 38 
                   C 98 24, 114 24, 116 38 
                   C 118 80, 118 115, 116 148 
                   Z"
                fill={getSkinTone('left', 'middle')}
                stroke={getFingerStroke('left', 'middle')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 95 110 C 104 112, 111 112, 116 110" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 96 75 C 104 77, 110 77, 115 75" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Fingernail */}
              <path
                d="M 99 32 C 99 26, 113 26, 113 32 C 113 40, 99 40, 99 32 Z"
                fill={getNailTone('left', 'middle')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="106" cy="12" r="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
              <text x="106" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E293B">
                {language === 'fa' ? 'ی' : 'D'}
              </text>
            </g>

            {/* Left Index (انگشت اشاره چپ - F / ب - با شاخص حسی لمسی) */}
            <g className={getFingerClass('left', 'index')}>
              {/* Natural Index Finger Contour */}
              <path
                d="M 122 148 
                   C 123 120, 124 90, 126 55 
                   C 128 42, 144 42, 146 55 
                   C 146 90, 144 120, 142 152 
                   Z"
                fill={getSkinTone('left', 'index')}
                stroke={getFingerStroke('left', 'index')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 125 115 C 132 117, 140 117, 145 115" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 126 80 C 133 82, 140 82, 145 80" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Tactile Anchor Bump on F / ب */}
              <circle cx="136" cy="100" r="3" fill="#2563EB" />
              <circle cx="136" cy="100" r="6" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2" opacity="0.8" />
              {/* Fingernail */}
              <path
                d="M 129 48 C 129 43, 142 43, 142 48 C 142 55, 129 55, 129 48 Z"
                fill={getNailTone('left', 'index')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="136" cy="26" r="13" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" className="shadow-sm" />
              <text x="136" y="30" textAnchor="middle" fontSize="12" fontWeight="black" fill="#1D4ED8">
                {language === 'fa' ? 'ب•' : 'F•'}
              </text>
            </g>

            {/* Left Thumb (شست چپ - Space) */}
            <g className={getFingerClass('left', 'thumb')}>
              {/* Natural Lateral Thumb extending toward keyboard spacebar */}
              <path
                d="M 175 180 
                   C 195 175, 220 160, 238 175 
                   C 248 185, 235 205, 215 212 
                   C 190 220, 175 210, 168 198 
                   Z"
                fill={getSkinTone('left', 'thumb')}
                stroke={getFingerStroke('left', 'thumb')}
                strokeWidth="1.8"
              />
              {/* Thumb Joint Crease */}
              <path d="M 195 185 C 198 195, 202 205, 208 210" stroke="#D99772" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
              {/* Thumb nail */}
              <path
                d="M 226 173 C 235 176, 238 188, 230 190 C 224 186, 222 178, 226 173 Z"
                fill={getNailTone('left', 'thumb')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Space Badge */}
              <rect x="200" y="222" width="46" height="18" rx="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
              <text x="223" y="235" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#64748B">
                فاصله
              </text>
            </g>
          </g>

          {/* ======================================================== */}
          {/* RIGHT HAND (Anatomical Natural Curve, Symmetrical ~6°)  */}
          {/* ======================================================== */}
          <g transform="translate(370, 10)">
            {/* Wrist & Forearm base */}
            <path
              d="M 105 290 C 105 260, 110 230, 115 205 C 150 215, 190 215, 220 205 C 215 230, 210 260, 210 290 Z"
              fill="url(#wristFade)"
              stroke="#D99772"
              strokeWidth="1.5"
            />

            {/* Palm Anatomy */}
            <path
              d="M 80 145 
                 C 70 180, 80 210, 100 230 
                 C 125 245, 170 245, 200 235 
                 C 215 225, 230 190, 225 165 
                 C 223 158, 215 152, 200 148 
                 C 180 145, 160 145, 135 148 
                 C 120 145, 100 140, 80 145 Z"
              fill="url(#skinGradient)"
              stroke="#D99772"
              strokeWidth="1.5"
            />

            {/* Anatomical Palm Creases */}
            <path
              d="M 120 165 C 150 185, 180 195, 205 185"
              stroke="#D99772"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 115 170 C 130 195, 160 210, 185 220"
              stroke="#D99772"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />

            {/* Right Thumb (شست راست - Space) */}
            <g className={getFingerClass('right', 'thumb')}>
              {/* Natural Lateral Thumb extending toward spacebar */}
              <path
                d="M 100 180 
                   C 80 175, 55 160, 37 175 
                   C 27 185, 40 205, 60 212 
                   C 85 220, 100 210, 107 198 
                   Z"
                fill={getSkinTone('right', 'thumb')}
                stroke={getFingerStroke('right', 'thumb')}
                strokeWidth="1.8"
              />
              {/* Thumb Joint Crease */}
              <path d="M 80 185 C 77 195, 73 205, 67 210" stroke="#D99772" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
              {/* Thumb nail */}
              <path
                d="M 49 173 C 40 176, 37 188, 45 190 C 51 186, 53 178, 49 173 Z"
                fill={getNailTone('right', 'thumb')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Space Badge */}
              <rect x="28" y="222" width="46" height="18" rx="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
              <text x="51" y="235" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#64748B">
                فاصله
              </text>
            </g>

            {/* Right Index (انگشت اشاره راست - J / ت - با شاخص حسی لمسی) */}
            <g className={getFingerClass('right', 'index')}>
              {/* Natural Index Finger Contour */}
              <path
                d="M 133 152 
                   C 131 120, 129 90, 129 55 
                   C 131 42, 147 42, 149 55 
                   C 151 90, 152 120, 153 148 
                   Z"
                fill={getSkinTone('right', 'index')}
                stroke={getFingerStroke('right', 'index')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 130 115 C 136 117, 144 117, 151 115" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 130 80 C 137 82, 144 82, 150 80" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Tactile Anchor Bump on J / ت */}
              <circle cx="139" cy="100" r="3" fill="#2563EB" />
              <circle cx="139" cy="100" r="6" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2" opacity="0.8" />
              {/* Fingernail */}
              <path
                d="M 133 48 C 133 43, 146 43, 146 48 C 146 55, 133 55, 133 48 Z"
                fill={getNailTone('right', 'index')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="139" cy="26" r="13" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" className="shadow-sm" />
              <text x="139" y="30" textAnchor="middle" fontSize="12" fontWeight="black" fill="#1D4ED8">
                {language === 'fa' ? '•ت' : '•J'}
              </text>
            </g>

            {/* Right Middle (انگشت میانی راست - K / ن) */}
            <g className={getFingerClass('right', 'middle')}>
              {/* Longest Finger */}
              <path
                d="M 159 148 
                   C 157 115, 157 80, 159 38 
                   C 161 24, 177 24, 179 38 
                   C 182 80, 182 115, 181 148 
                   Z"
                fill={getSkinTone('right', 'middle')}
                stroke={getFingerStroke('right', 'middle')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 159 110 C 166 112, 173 112, 181 110" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 160 75 C 167 77, 173 77, 180 75" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Fingernail */}
              <path
                d="M 163 32 C 163 26, 177 26, 177 32 C 177 40, 163 40, 163 32 Z"
                fill={getNailTone('right', 'middle')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="170" cy="12" r="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
              <text x="170" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E293B">
                {language === 'fa' ? 'ن' : 'K'}
              </text>
            </g>

            {/* Right Ring (انگشت حلقه راست - L / م) */}
            <g className={getFingerClass('right', 'ring')}>
              <path
                d="M 186 150 
                   C 185 125, 186 95, 188 55 
                   C 190 42, 205 42, 207 55 
                   C 210 95, 209 125, 207 152 
                   Z"
                fill={getSkinTone('right', 'ring')}
                stroke={getFingerStroke('right', 'ring')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 187 120 C 193 122, 200 122, 207 120" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 188 85 C 194 87, 201 87, 207 85" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Fingernail */}
              <path
                d="M 191 49 C 191 44, 204 44, 204 49 C 204 56, 191 56, 191 49 Z"
                fill={getNailTone('right', 'ring')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="198" cy="26" r="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
              <text x="198" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E293B">
                {language === 'fa' ? 'م' : 'L'}
              </text>
            </g>

            {/* Right Pinky (انگشت کوچک راست - ; / ک) */}
            <g className={getFingerClass('right', 'pinky')}>
              <path
                d="M 212 160 
                   C 214 135, 216 110, 218 85 
                   C 221 72, 232 72, 233 85 
                   C 235 115, 233 140, 230 165 
                   Z"
                fill={getSkinTone('right', 'pinky')}
                stroke={getFingerStroke('right', 'pinky')}
                strokeWidth="1.8"
              />
              {/* Joint Creases */}
              <path d="M 215 130 C 220 132, 226 132, 232 130" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M 218 105 C 222 107, 227 107, 232 105" stroke="#D99772" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              {/* Fingernail */}
              <path
                d="M 221 78 C 221 74, 230 74, 230 78 C 230 84, 221 84, 221 78 Z"
                fill={getNailTone('right', 'pinky')}
                stroke="#D99772"
                strokeWidth="1"
              />
              {/* Key badge */}
              <circle cx="226" cy="56" r="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" className="shadow-xs" />
              <text x="226" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E293B">
                {language === 'fa' ? 'ک' : ';'}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Natural Home Row Legend Footer */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>انگشتان اشاره با نقاط شاخص برجسته لمسی (ت و ب / F و J) هدایت‌گر جایگیری بدون نگاه هستند.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <span>دست چپ: ش - س - ی - ب</span>
          <span>|</span>
          <span>دست راست: ت - ن - م - ک</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(HandsVisualizer);
