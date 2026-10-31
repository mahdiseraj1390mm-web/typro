'use client';

import React from 'react';
import { getBadgeStageForLevel, getSubTierStars, calculateLevelFromXp, BadgeStage } from '@/lib/levelTiers';
import { Sparkles } from 'lucide-react';

interface GamingLevelBadgeProps {
  level?: number;
  xp?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStars?: boolean;
  showTierName?: boolean;
  showXp?: boolean;
  showLevelNumber?: boolean;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export default function GamingLevelBadge({
  level,
  xp,
  size = 'sm',
  showStars = true,
  showTierName = false,
  showXp = false,
  showLevelNumber = true,
  onClick,
  className = '',
  interactive = false,
}: GamingLevelBadgeProps) {
  const resolvedLevel = level !== undefined ? level : (xp !== undefined ? calculateLevelFromXp(xp) : 1);
  const resolvedXp = xp !== undefined ? xp : (resolvedLevel - 1) * 100;
  const stage = getBadgeStageForLevel(resolvedLevel);
  const stars = getSubTierStars(resolvedLevel, stage);

  // Size specifications
  const sizeConfig = {
    xs: { svgSize: 18, textClass: 'text-[9px] font-black', gapClass: 'gap-1', starClass: 'text-[7px]' },
    sm: { svgSize: 24, textClass: 'text-[10px] font-black', gapClass: 'gap-1.5', starClass: 'text-[8px]' },
    md: { svgSize: 34, textClass: 'text-xs font-black', gapClass: 'gap-2', starClass: 'text-[9px]' },
    lg: { svgSize: 48, textClass: 'text-sm font-black', gapClass: 'gap-2.5', starClass: 'text-[10px]' },
    xl: { svgSize: 64, textClass: 'text-base font-black', gapClass: 'gap-3', starClass: 'text-xs' },
  }[size];

  // Procedural 3D SVG Crest generator (Strictly maps to the 10 Grand Realms)
  const renderCrestSvg = () => {
    const visualTier = Math.min(9, Math.max(0, stage.realmIdx));
    const sub = stage.tierTierInRealm || 1; // 1 to 50
    // Wings and armor flourish gradually expand across the 50 stages in this realm
    const wingSpread = Math.min(26, Math.floor(((sub - 1) / 49) * 26));

    switch (visualTier) {
      case 0: // Bronze & Iron Shields (Stages 1-50)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_8px_rgba(205,127,50,0.5)]">
            <defs>
              <linearGradient id={`bGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffbe76" />
                <stop offset="45%" stopColor="#d35400" />
                <stop offset="85%" stopColor="#873600" />
                <stop offset="100%" stopColor="#4e2105" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${15 - wingSpread} 35 L30 45 L20 65 L40 55 L50 75 L60 55 L80 65 L70 45 L${85 + wingSpread} 35 L50 48 Z`} fill="#d35400" stroke="#f39c12" strokeWidth="1.5" />
            )}
            <path d="M50 8 L88 24 L78 72 L50 94 L22 72 L12 24 Z" fill={`url(#bGrad_${stage.id})`} stroke="#f39c12" strokeWidth="2.5" />
            <path d="M50 20 L76 32 L68 66 L50 82 L32 66 L24 32 Z" fill="#2d170b" stroke="#e67e22" strokeWidth="1.5" />
            <path d="M50 36 L66 48 L60 55 L50 46 L40 55 L34 48 Z" fill="#fbbf24" />
            <circle cx="50" cy="30" r="3.5" fill="#fef08a" />
          </svg>
        );

      case 1: // Steel Chevrons & Military Plates (Stages 51-100)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_8px_rgba(148,163,184,0.5)]">
            <defs>
              <linearGradient id={`sGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${10 - wingSpread} 25 L40 40 L30 65 L50 55 L70 65 L60 40 L${90 + wingSpread} 25 L50 38 Z`} fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
            )}
            <polygon points="50,12 85,26 75,76 50,92 25,76 15,26" fill={`url(#sGrad_${stage.id})`} stroke="#e2e8f0" strokeWidth="2" />
            <polygon points="50,24 74,35 66,70 50,82 34,70 26,35" fill="#0f172a" />
            <path d="M50 35 L68 50 L60 56 L50 48 L40 56 L32 50 Z" fill="#38bdf8" />
            <circle cx="50" cy="65" r="4" fill="#38bdf8" />
          </svg>
        );

      case 2: // Silver Knight & Winged Blades (Stages 101-150)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_10px_rgba(203,213,225,0.6)]">
            <defs>
              <linearGradient id={`skGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${6 - wingSpread} 30 L36 42 L24 66 L48 54 L38 80 L50 64 L62 80 L52 54 L76 66 L64 42 L${94 + wingSpread} 30 L50 40 Z`} fill={`url(#skGrad_${stage.id})`} stroke="#ffffff" strokeWidth="1.8" />
            )}
            <polygon points="50,15 72,28 66,72 50,86 34,72 28,28" fill="#091428" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="50,38 60,50 50,62 40,50" fill="#00ffff" />
            <circle cx="50" cy="50" r="3" fill="#ffffff" />
          </svg>
        );

      case 3: // 24K Solar Gold Champion (Stages 151-200)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]">
            <defs>
              <linearGradient id={`gGold_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="25%" stopColor="#fde047" />
                <stop offset="60%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="46" r="34" fill="none" stroke="#fde047" strokeWidth="1.5" strokeDasharray="3,3" />
            {wingSpread > 2 && (
              <path d={`M${4 - wingSpread} 40 L34 48 L22 72 L46 60 L50 86 L54 60 L78 72 L66 48 L${96 + wingSpread} 40 L66 54 L50 44 L34 54 Z`} fill={`url(#gGold_${stage.id})`} stroke="#fef08a" strokeWidth="1.8" />
            )}
            <path d="M30 26 L40 33 L50 16 L60 33 L70 26 L65 39 L35 39 Z" fill={`url(#gGold_${stage.id})`} stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="50,44 60,54 50,66 40,54" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );

      case 4: // Royal Platinum Crowns (Stages 201-250)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_12px_rgba(56,189,248,0.6)]">
            <defs>
              <linearGradient id={`platGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="80%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${5 - wingSpread} 32 L35 44 L25 70 L50 58 L75 70 L65 44 L${95 + wingSpread} 32 L50 42 Z`} fill={`url(#platGrad_${stage.id})`} stroke="#7dd3fc" strokeWidth="1.8" />
            )}
            <path d="M22 28 L34 36 L50 14 L66 36 L78 28 L72 44 L28 44 Z" fill={`url(#platGrad_${stage.id})`} stroke="#ffffff" strokeWidth="1.8" />
            <circle cx="50" cy="56" r="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
            <polygon points="50,49 55,54 55,61 50,64 45,61 45,54" fill="#7dd3fc" />
          </svg>
        );

      case 5: // Emerald Master (Stages 251-300)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_12px_rgba(16,185,129,0.6)]">
            <defs>
              <linearGradient id={`emGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="35%" stopColor="#34d399" />
                <stop offset="70%" stopColor="#059669" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${8 - wingSpread} 35 L35 45 L25 70 L50 58 L75 70 L65 45 L${92 + wingSpread} 35 L50 45 Z`} fill="#059669" stroke="#34d399" strokeWidth="1.5" />
            )}
            <polygon points="50,5 90,26 90,74 50,95 10,74 10,26" fill={`url(#emGrad_${stage.id})`} stroke="#6ee7b7" strokeWidth="2.5" />
            <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="#064e3b" stroke="#34d399" strokeWidth="1.8" />
            <polygon points="50,30 68,42 68,58 50,70 32,58 32,42" fill="#10b981" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
        );

      case 6: // Sapphire Legend (Stages 301-350)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_14px_rgba(37,99,235,0.65)]">
            <defs>
              <linearGradient id={`saphGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="30%" stopColor="#60a5fa" />
                <stop offset="70%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${6 - wingSpread} 30 L36 42 L24 66 L48 54 L38 80 L50 64 L62 80 L52 54 L76 66 L64 42 L${94 + wingSpread} 30 L50 40 Z`} fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
            )}
            <polygon points="50,8 88,28 88,72 50,92 12,72 12,28" fill={`url(#saphGrad_${stage.id})`} stroke="#93c5fd" strokeWidth="2.5" />
            <polygon points="50,22 76,38 76,62 50,78 24,62 24,38" fill="#0b1329" stroke="#60a5fa" strokeWidth="2" />
            <polygon points="50,32 66,44 66,56 50,68 34,56 34,44" fill="#2563eb" />
            <polygon points="50,40 58,47 58,53 50,60 42,53 42,47" fill="#ffffff" />
          </svg>
        );

      case 7: // Amethyst Monarch & Ruby Sovereign (Stages 351-400)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_14px_rgba(225,29,72,0.7)]">
            <defs>
              <linearGradient id={`rubyGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="30%" stopColor="#fb7185" />
                <stop offset="70%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <path d={`M${8 - wingSpread} 38 L36 46 L24 72 L48 60 L50 86 L52 60 L76 72 L64 46 L${92 + wingSpread} 38 L65 52 L50 42 L35 52 Z`} fill="#be123c" stroke="#f43f5e" strokeWidth="1.8" />
            )}
            <path d="M30 24 L40 32 L50 14 L60 32 L70 24 L65 38 L35 38 Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
            <polygon points="50,38 65,52 50,68 35,52" fill={`url(#rubyGrad_${stage.id})`} stroke="#ffffff" strokeWidth="2" />
            <polygon points="50,44 59,52 50,62 41,52" fill="#ff4d6d" />
          </svg>
        );

      case 8: // Quantum Cyber Prism (Stages 401-450)
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_4px_16px_rgba(6,182,212,0.75)]">
            <defs>
              <linearGradient id={`qGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cffafe" />
                <stop offset="30%" stopColor="#22d3ee" />
                <stop offset="70%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#164e63" />
              </linearGradient>
            </defs>
            {wingSpread > 2 && (
              <polygon points={`50,10 ${90 + wingSpread},50 50,90 ${10 - wingSpread},50`} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4,4" />
            )}
            <rect x="25" y="25" width="50" height="50" rx="8" transform="rotate(45 50 50)" fill={`url(#qGrad_${stage.id})`} stroke="#67e8f9" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="16" fill="#082f49" stroke="#22d3ee" strokeWidth="2" />
            <polygon points="50,38 60,54 40,54" fill="#ffffff" />
            <circle cx="50" cy="50" r="3" fill="#a5f3fc" />
          </svg>
        );

      case 9: // Celestial Cosmic Deity (Stages 451-500)
      default:
        return (
          <svg viewBox="0 0 100 100" width={sizeConfig.svgSize} height={sizeConfig.svgSize} className="shrink-0 drop-shadow-[0_6px_20px_rgba(236,72,153,0.85)] animate-pulse">
            <defs>
              <linearGradient id={`cosmGrad_${stage.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="25%" stopColor="#f472b6" />
                <stop offset="60%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="50" rx={40 + wingSpread / 3} ry="16" fill="none" stroke="#fde047" strokeWidth="2" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx={40 + wingSpread / 3} ry="16" fill="none" stroke="#ec4899" strokeWidth="2" transform="rotate(30 50 50)" />
            <polygon points="50,6 57,36 88,33 63,50 82,78 50,62 18,78 37,50 12,33 43,36" fill={`url(#cosmGrad_${stage.id})`} stroke="#ffffff" strokeWidth="2" />
            <polygon points="50,40 57,50 50,60 43,50" fill="#ffffff" />
            <circle cx="50" cy="50" r="2.5" fill="#fde047" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none transition-all duration-200 ${sizeConfig.gapClass} ${
        interactive || onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      dir="ltr"
      title={`${stage.nameFa} • لول ${resolvedLevel.toLocaleString('fa-IR')} از ۱,۰۰۰,۰۰۰`}
    >
      {/* Pure Floating 3D Procedural Crest */}
      <div className="relative shrink-0 flex items-center justify-center">
        {renderCrestSvg()}
      </div>

      {/* Level Number (Clear, High-Contrast Typography) */}
      {showLevelNumber && (
        <div className="flex items-center gap-1">
          <span
            style={{ color: stage.color, textShadow: `0 0 8px ${stage.glowColor}` }}
            className={`font-mono tracking-tight drop-shadow-sm ${sizeConfig.textClass}`}
          >
            Lv.{resolvedLevel.toLocaleString('fa-IR')}
          </span>

          {/* Sub-Tier Stars */}
          {showStars && (
            <div className="flex items-center gap-0.5 ml-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < stars ? stage.color : 'rgba(148, 163, 184, 0.4)',
                    textShadow: i < stars ? `0 0 4px ${stage.color}` : 'none',
                  }}
                  className={`leading-none ${sizeConfig.starClass}`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Optional Realm Category Name */}
      {showTierName && (
        <span
          style={{ color: stage.color }}
          className="text-[10px] font-black mr-1 hidden sm:inline truncate max-w-[140px]"
        >
          {stage.realmNameFa}
        </span>
      )}

      {/* Explicit XP Score Display (هر ۱۰۰ امتیاز = ۱ لول) */}
      {showXp && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-600 font-mono font-black text-[10px] shadow-2xs mr-1"
          title={`${resolvedXp.toLocaleString('fa-IR')} امتیاز کل (هر ۱۰۰ امتیاز = ۱ لول)`}
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
          <span>{resolvedXp.toLocaleString('fa-IR')}</span>
          <span className="text-[9px] font-sans font-bold text-amber-600/90">امتیاز</span>
        </span>
      )}
    </div>
  );
}
