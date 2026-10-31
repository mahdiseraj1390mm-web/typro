'use client';

import GamingLevelBadge from '@/components/common/GamingLevelBadge';

import React from 'react';
import { Coins, Gem, Star, Sparkles } from 'lucide-react';

interface CurrencyHUDProps {
  coins: number;
  diamonds: number;
  xp?: number;
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'solid' | 'dark';
  className?: string;
}

export default function CurrencyHUD({
  coins,
  diamonds,
  xp,
  level,
  size = 'md',
  variant = 'glass',
  className = '',
}: CurrencyHUDProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const containerClasses = {
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl',
    solid: 'bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md',
    dark: 'bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl',
  }[variant];

  const coinBgClasses = {
    glass: 'bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/30 border border-amber-400/40 text-amber-200 hover:border-amber-300',
    solid: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/80 border border-amber-300/80 text-amber-800 hover:border-amber-400',
    dark: 'bg-gradient-to-r from-amber-950/40 via-yellow-900/30 to-amber-900/40 border border-amber-500/50 text-amber-300 hover:border-amber-400',
  }[variant];

  const diamondBgClasses = {
    glass: 'bg-gradient-to-r from-cyan-500/25 via-sky-400/20 to-blue-500/30 border border-cyan-400/40 text-cyan-200 hover:border-cyan-300',
    solid: 'bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-100/80 border border-cyan-300/80 text-cyan-800 hover:border-cyan-400',
    dark: 'bg-gradient-to-r from-cyan-950/40 via-sky-900/30 to-blue-900/40 border border-cyan-500/50 text-cyan-300 hover:border-cyan-400',
  }[variant];

  const xpBgClasses = {
    glass: 'bg-gradient-to-r from-purple-500/25 via-indigo-400/20 to-purple-500/30 border border-purple-400/40 text-purple-200 hover:border-purple-300',
    solid: 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100/80 border border-purple-300/80 text-purple-800 hover:border-purple-400',
    dark: 'bg-gradient-to-r from-purple-950/40 via-indigo-900/30 to-purple-900/40 border border-purple-500/50 text-purple-300 hover:border-purple-400',
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl transition-all duration-300 select-none ${containerClasses} ${className}`}
      dir="rtl"
    >
      {/* 1. Ultra-Luxurious Golden Coin Badge */}
      <div
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl font-black transition-all duration-300 overflow-hidden shadow-xs ${coinBgClasses} ${
          isSm ? 'text-[11px]' : isLg ? 'text-sm sm:text-base px-4 py-2' : 'text-xs sm:text-sm'
        }`}
        title="موجودی سکه‌های رقابتی شما"
      >
        {/* Golden Shimmer Sheen effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-500/50 group-hover:scale-110 transition-transform">
            <Coins className="w-3.5 h-3.5 text-amber-950 fill-amber-300 stroke-[2.5]" />
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping absolute -top-0.5 -right-0.5 pointer-events-none opacity-75" />
        </div>

        <div className="flex items-baseline gap-1">
          <span
            className="font-mono font-black tracking-tight"
            suppressHydrationWarning
          >
            {coins.toLocaleString('fa-IR')}
          </span>
          <span className="text-[10px] font-bold opacity-80">سکه</span>
        </div>
      </div>

      <div className="w-px h-4 bg-slate-300/40 dark:bg-white/15" />

      {/* 2. Ultra-Luxurious Crystal Diamond Badge */}
      <div
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl font-black transition-all duration-300 overflow-hidden shadow-xs ${diamondBgClasses} ${
          isSm ? 'text-[11px]' : isLg ? 'text-sm sm:text-base px-4 py-2' : 'text-xs sm:text-sm'
        }`}
        title="موجودی الماس‌های کریستالی شما"
      >
        {/* Crystal Refraction Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-300 to-blue-400 flex items-center justify-center text-slate-950 shadow-sm shadow-cyan-500/50 group-hover:scale-110 transition-transform">
            <Gem className="w-3.5 h-3.5 text-cyan-950 fill-cyan-200 stroke-[2.5]" />
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping absolute -top-0.5 -right-0.5 pointer-events-none opacity-75" />
        </div>

        <div className="flex items-baseline gap-1">
          <span
            className="font-mono font-black tracking-tight"
            suppressHydrationWarning
          >
            {diamonds.toLocaleString('fa-IR')}
          </span>
          <span className="text-[10px] font-bold opacity-80">الماس</span>
        </div>
      </div>

      {/* 3. XP Score Badge (نمایش عددی امتیاز کل کاربر در کنار لول) */}
      {xp !== undefined && (
        <>
          <div className="w-px h-4 bg-slate-300/40 dark:bg-white/15" />
          <div
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black transition-all duration-300 overflow-hidden shadow-xs ${xpBgClasses} ${
              isSm ? 'text-[11px]' : isLg ? 'text-sm sm:text-base px-3.5 py-2' : 'text-xs sm:text-sm'
            }`}
            title="مجموع امتیازات (XP) شما - هر ۱۰۰ امتیاز = ۱ لول ارتقا"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-purple-500/50 group-hover:scale-110 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-black tracking-tight" suppressHydrationWarning>
                {xp.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] font-bold opacity-80">امتیاز</span>
            </div>
          </div>
        </>
      )}

      {/* 4. Authentic 3D Gaming Level Badge */}
      {level !== undefined && (
        <>
          <div className="w-px h-4 bg-slate-300/40 dark:bg-white/15" />
          <GamingLevelBadge
            level={level}
            xp={xp}
            size={isSm ? 'xs' : isLg ? 'md' : 'sm'}
            showStars={true}
            interactive={true}
          />
        </>
      )}
    </div>
  );
}

export function CoinBadge({
  amount,
  size = 'md',
  variant = 'solid',
  className = '',
}: {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'solid' | 'dark';
  className?: string;
}) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const badgeStyle = {
    glass: 'bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-500/30 border border-amber-400/40 text-amber-200 shadow-sm',
    solid: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/90 border border-amber-300 text-amber-900 shadow-xs',
    dark: 'bg-gradient-to-r from-amber-950/60 via-yellow-900/40 to-amber-900/60 border border-amber-500/50 text-amber-300 shadow-md',
  }[variant];

  return (
    <div
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-black overflow-hidden transition-all duration-300 select-none ${badgeStyle} ${
        isSm ? 'text-[11px]' : isLg ? 'text-sm px-3.5 py-1.5' : 'text-xs'
      } ${className}`}
      dir="rtl"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-xs shadow-amber-500/50">
          <Coins className="w-2.5 h-2.5 text-amber-950 fill-amber-300 stroke-[2.5]" />
        </div>
      </div>
      <span className="font-mono font-black" suppressHydrationWarning>
        {amount.toLocaleString('fa-IR')}
      </span>
      <span className="text-[10px] font-bold opacity-75">سکه</span>
    </div>
  );
}

export function DiamondBadge({
  amount,
  size = 'md',
  variant = 'solid',
  className = '',
}: {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'solid' | 'dark';
  className?: string;
}) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const badgeStyle = {
    glass: 'bg-gradient-to-r from-cyan-500/25 via-sky-400/20 to-blue-500/30 border border-cyan-400/40 text-cyan-200 shadow-sm',
    solid: 'bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-100/90 border border-cyan-300 text-cyan-900 shadow-xs',
    dark: 'bg-gradient-to-r from-cyan-950/60 via-sky-900/40 to-blue-900/60 border border-cyan-500/50 text-cyan-300 shadow-md',
  }[variant];

  return (
    <div
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-black overflow-hidden transition-all duration-300 select-none ${badgeStyle} ${
        isSm ? 'text-[11px]' : isLg ? 'text-sm px-3.5 py-1.5' : 'text-xs'
      } ${className}`}
      dir="rtl"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-300 to-blue-400 flex items-center justify-center text-slate-950 shadow-xs shadow-cyan-500/50">
          <Gem className="w-2.5 h-2.5 text-cyan-950 fill-cyan-200 stroke-[2.5]" />
        </div>
      </div>
      <span className="font-mono font-black" suppressHydrationWarning>
        {amount.toLocaleString('fa-IR')}
      </span>
      <span className="text-[10px] font-bold opacity-75">الماس</span>
    </div>
  );
}
