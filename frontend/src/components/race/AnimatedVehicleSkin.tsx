'use client';

import React from 'react';
import { getSkinById, SkinItem } from '@/lib/skins';
import VehicleCutout from './VehicleCutout';

interface AnimatedVehicleSkinProps {
  skinId: string;
  size?: 'sm' | 'md' | 'lg' | 'race' | 'preview';
  isMoving?: boolean;
  wpm?: number;
  showNitro?: boolean;
  showRoad?: boolean;
  className?: string;
}

export default function AnimatedVehicleSkin({
  skinId,
  size = 'race',
  isMoving = true,
  wpm = 0,
  showNitro = true,
  showRoad = false,
  className = '',
}: AnimatedVehicleSkinProps) {
  const skin: SkinItem = getSkinById(skinId);
  const visualType = skin.visualType;
  const isMotorcycle = visualType === 'motorcycle';
  // Fire and wheelie ONLY when moving and speed > 50 (تا شروع نکرده و حرکت نکرده آتیش ندهد)
  const isFast = isMoving && (wpm || 0) > 50;

  // ==========================================
  // 1. LIVE RACE TRACK MODE (لاین مسابقه زنده)
  // جهت پیست: از چپ به راست به سمت خط پایان (راست)
  // تمامی خودروها، موتورها و اسکین‌های ماینکرفت به سمت راست (خط پایان) نگاه می‌کنند
  // در سرعت بالای ۵۰ آتیش از اگزوز عقب (سمت چپ) زبانه می‌کشد و موتور تک‌چرخ می‌زند
  // بدون کادر یا پس‌زمینه (کاملاً Transparent Cutout)
  // ==========================================
  if (size === 'race' || size === 'sm') {
    return (
      <div
        className={`relative inline-flex items-center select-none transition-transform duration-300 ${
          isFast && isMotorcycle ? 'animate-wheelie-right' : ''
        } ${className}`}
        style={{
          transformOrigin: '20% 85%', // تکیه‌گاه چرخ عقب در سمت چپ
        }}
      >
        {/* Blazing Fire Exhaust for Vehicles from Rear (Left) when speed > 50 & isMoving */}
        {isFast && (
          <div className="absolute -left-6 bottom-1 sm:bottom-1.5 z-30 flex items-center pointer-events-none">
            <svg
              className="animate-speed-fire-left w-6 sm:w-8 h-3 sm:h-4 text-amber-500 drop-shadow-[0_0_8px_#f97316]"
              viewBox="0 0 28 14"
              fill="currentColor"
            >
              <path
                d="M28,7 Q18,0 0,3 Q12,7 0,11 Q18,14 28,7 Z"
                fill="url(#blazingFireGradRaceLeft)"
              />
              <defs>
                <linearGradient id="blazingFireGradRaceLeft" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="35%" stopColor="#f97316" />
                  <stop offset="70%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            {/* Fire sparks trailing to the left */}
            <span className="w-1 h-1 rounded-full bg-amber-300 animate-ping absolute -left-1 top-0" />
            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse absolute -left-2 bottom-0" />
          </div>
        )}

        {/* Real Vehicle Horizontal Photo Facing RIGHT towards Finish Line (بدون پس‌زمینه با کنتراست عالی برای ماشین‌های مشکی) */}
        <div className="relative flex items-center justify-center">
          {skin.raceImage ? (
            <div className="relative w-20 sm:w-26 h-9 sm:h-11 flex items-center justify-center">
              <img
                src={skin.raceImage}
                alt={skin.name}
                className="w-full h-full object-contain select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                loading="eager"
              />
            </div>
          ) : (
            <div className="relative w-20 sm:w-26 h-9 sm:h-11 rounded-lg overflow-hidden select-none">
              <img
                src={skin.realImage || '/images/skins/ferrari_f8.jpg'}
                alt={skin.name}
                className="w-full h-full object-contain select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] drop-shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                loading="eager"
              />
            </div>
          )}

          {/* Speed Status Badge */}
          {isFast && isMotorcycle && (
            <div className="absolute -top-3.5 left-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
              تک‌چرخ!
            </div>
          )}
          {isFast && !isMotorcycle && (
            <div className="absolute -top-3.5 left-1 bg-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
              آتش ۵۰+!
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. SKINS STORE SHOWCASE MODE (فروشگاه اسکین‌ها)
  // ادیت گیف چندزاویه از تمام جهات مانند کلیپ‌های ویدیویی ادیت خودرو
  // ==========================================
  if (size === 'preview') {
    return (
      <div className={`relative w-full h-44 rounded-2xl overflow-hidden shadow-inner group ${className}`}>
        {/* Multi-Angle Showcase Edit Canvas */}
        <div className="relative w-full h-full overflow-hidden bg-slate-950">
          {/* Real Photo with Multi-Angle Edit Camera Zoom & Pan */}
          <div className="w-full h-full overflow-hidden">
            <img
              src={skin.realImage || '/images/skins/ferrari_f8.jpg'}
              alt={skin.name}
              className="w-full h-full object-cover select-none animate-car-edit"
            />
          </div>

          {/* Cinematic Vignette & Ambient Color Aura */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-color"
            style={{ backgroundColor: skin.primaryColor }}
          />

          {/* Camera Flash Cut / Neon Light Sweep across vehicle */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-white to-transparent animate-rgb-laser"
          />

          {/* Clean Studio Showcase (No fire in store, fire is strictly for live race) */}

          {/* Forward Xenon Headlight Beam on Road */}
          {isMoving && (
            <div
              className="absolute top-1/2 left-3 -translate-y-1/2 w-32 h-20 pointer-events-none opacity-80 z-10"
              style={{
                background: 'radial-gradient(ellipse at 15% 50%, rgba(254, 240, 138, 0.85) 0%, rgba(56, 189, 248, 0.35) 45%, transparent 70%)',
                filter: 'blur(3px)',
              }}
            />
          )}

          {/* Moving Asphalt Speed Strip at bottom */}
          {showRoad && (
            <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-slate-950/80 backdrop-blur-xs flex items-center overflow-hidden border-t border-white/20 z-10">
              <div className="w-[200%] flex items-center gap-6 animate-road-move">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-1 bg-amber-400/90 rounded-full shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Multi-Angle Edit GIF Badge */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] text-emerald-300 font-black border border-emerald-500/40 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ادیت چندزاویه (360° Edit GIF)</span>
          </div>

          {/* Tier Badge */}
          <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] text-white font-black border border-white/25 shadow-md">
            {skin.tier}
          </div>
        </div>
      </div>
    );
  }

  // Fallback default
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={skin.realImage || '/images/skins/ferrari_f8.jpg'}
        alt={skin.name}
        className="w-20 h-10 object-cover rounded-md"
      />
    </div>
  );
}
