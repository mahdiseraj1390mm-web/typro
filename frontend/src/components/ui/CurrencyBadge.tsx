'use client';

import React from 'react';

interface CurrencyBadgeProps {
  type: 'coin' | 'diamond';
  amount?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export function CoinIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)] ${className}`}
    >
      <circle cx="12" cy="12" r="10" fill="url(#coinGoldGradOuter)" stroke="#b45309" strokeWidth="1" />
      <circle cx="12" cy="12" r="7.5" fill="url(#coinGoldGradInner)" stroke="#fef08a" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="5.5" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      {/* 3D Star / Sheen in Center */}
      <path
        d="M12 8L13.1 10.7L16 11.2L13.8 13.1L14.5 16L12 14.5L9.5 16L10.2 13.1L8 11.2L10.9 10.7L12 8Z"
        fill="#fef08a"
      />
      <circle cx="9" cy="9" r="1" fill="#ffffff" opacity="0.8" />
      <defs>
        <linearGradient id="coinGoldGradOuter" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="coinGoldGradInner" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef08a" />
          <stop offset="0.4" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DiamondIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_6px_rgba(14,165,233,0.5)] ${className}`}
    >
      {/* Top crown facet */}
      <polygon points="6,3 18,3 22,9 12,22 2,9" fill="url(#gemGradMain)" stroke="#0284c7" strokeWidth="0.8" />
      {/* Top light facets */}
      <polygon points="6,3 18,3 15,9 9,9" fill="#e0f2fe" opacity="0.9" />
      <polygon points="6,3 9,9 2,9" fill="#bae6fd" opacity="0.8" />
      <polygon points="18,3 22,9 15,9" fill="#7dd3fc" opacity="0.8" />
      {/* Pavilion facets down to culet */}
      <polygon points="9,9 15,9 12,22" fill="#0284c7" opacity="0.9" />
      <polygon points="2,9 9,9 12,22" fill="#0369a1" opacity="0.85" />
      <polygon points="22,9 15,9 12,22" fill="#075985" opacity="0.85" />
      {/* Center sparkle gleam */}
      <circle cx="10" cy="6" r="1" fill="#ffffff" />
      <defs>
        <linearGradient id="gemGradMain" x1="2" y1="3" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.5" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function CurrencyBadge({
  type,
  amount,
  size = 'md',
  showLabel = false,
  className = '',
}: CurrencyBadgeProps) {
  const isCoin = type === 'coin';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2',
    xl: 'text-lg sm:text-xl px-4 py-2 gap-2.5',
  };

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 22,
    xl: 28,
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl font-bold select-none border transition-all ${
        isCoin
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-500/10 text-amber-700 border-amber-300/80 shadow-xs'
          : 'bg-gradient-to-r from-cyan-500/10 via-sky-400/15 to-blue-500/10 text-cyan-700 border-cyan-300/80 shadow-xs'
      } ${sizeClasses[size]} ${className}`}
    >
      {isCoin ? (
        <CoinIcon size={iconSizes[size]} />
      ) : (
        <DiamondIcon size={iconSizes[size]} />
      )}

      {amount !== undefined && (
        <span className="font-mono font-black">
          {typeof amount === 'number' ? amount.toLocaleString('fa-IR') : amount}
        </span>
      )}

      {showLabel && (
        <span className="text-[10px] font-bold opacity-80 mr-0.5">
          {isCoin ? 'سکه' : 'الماس'}
        </span>
      )}
    </div>
  );
}
