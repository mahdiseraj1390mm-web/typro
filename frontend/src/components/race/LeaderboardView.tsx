'use client';

import React, { useState, useEffect } from 'react';
import GamingLevelBadge from '@/components/common/GamingLevelBadge';
import { PublicUserProfile } from '@/components/race/PublicProfileModal';
import { 
  Trophy, Medal, Crown, Flame, Calendar, Clock, Sparkles, 
  Search, ArrowUpDown, ChevronRight, User, Gauge, Target, Award
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  wpm: number;
  accuracy: number;
  racesWon: number;
  bio?: string;
}

interface LeaderboardViewProps {
  onSelectUser: (user: PublicUserProfile) => void;
  currentUserXp?: number;
  currentUserId?: string;
}

// ── Official 3D Championship Trophy Cup (Vector rendered, zero pixelation/cutoffs) ──
function ChampionshipCup({ rank, size = 'lg' }: { rank: 1 | 2 | 3; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 64 : size === 'md' ? 44 : 28;

  if (rank === 1) {
    // 24K Gold Grand Prix Cup
    return (
      <svg
        viewBox="0 0 100 100"
        width={dim}
        height={dim}
        className="shrink-0 drop-shadow-[0_6px_16px_rgba(245,158,11,0.65)] animate-in zoom-in-75 duration-300"
      >
        <defs>
          <linearGradient id="goldCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="goldPedestal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="goldShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Halo */}
        <circle cx="50" cy="45" r="38" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

        {/* Cup Left Handle */}
        <path
          d="M 28 26 C 12 26 10 48 27 52 C 29 48 31 46 31 43 C 20 40 20 32 29 31 Z"
          fill="url(#goldCupGrad)"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* Cup Right Handle */}
        <path
          d="M 72 26 C 88 26 90 48 73 52 C 71 48 69 46 69 43 C 80 40 80 32 71 31 Z"
          fill="url(#goldCupGrad)"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* Main Trophy Chalice Bowl */}
        <path
          d="M 26 22 L 74 22 C 74 22 76 48 50 60 C 24 48 26 22 26 22 Z"
          fill="url(#goldCupGrad)"
          stroke="#92400e"
          strokeWidth="1.8"
        />

        {/* Top Rim */}
        <ellipse cx="50" cy="22" rx="24" ry="4" fill="#fef08a" stroke="#b45309" strokeWidth="1.5" />
        <ellipse cx="50" cy="22" rx="20" ry="2.5" fill="#f59e0b" />

        {/* Cup Highlight Shading */}
        <path
          d="M 32 25 Q 50 28 68 25 C 67 40 54 48 50 50 C 46 48 33 40 32 25 Z"
          fill="url(#goldShine)"
          opacity="0.35"
        />

        {/* Laurel Wreath Engraving */}
        <path
          d="M 38 36 Q 42 43 50 45 Q 58 43 62 36"
          fill="none"
          stroke="#78350f"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Stem / Neck */}
        <path d="M 45 59 L 55 59 L 53 72 L 47 72 Z" fill="url(#goldCupGrad)" stroke="#92400e" strokeWidth="1.2" />
        <ellipse cx="50" cy="72" rx="9" ry="2.5" fill="#b45309" />

        {/* Heavy Pedestal Base */}
        <polygon points="34,74 66,74 70,87 30,87" fill="url(#goldPedestal)" stroke="#475569" strokeWidth="1.2" />
        <rect x="27" y="87" width="46" height="5" rx="1.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

        {/* Rank #1 Golden Emblem Plate */}
        <rect x="40" y="77" width="20" height="8" rx="1.5" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
        <text x="50" y="84" textAnchor="middle" fill="#78350f" fontSize="7" fontWeight="900" fontFamily="sans-serif">#1</text>

        {/* Champion Star Above */}
        <path
          d="M 50 9 L 52 14 L 57 14 L 53 17 L 55 22 L 50 19 L 45 22 L 47 17 L 43 14 L 48 14 Z"
          fill="#fffbeb"
          stroke="#eab308"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (rank === 2) {
    // 925 Sterling Silver Grand Prix Cup
    return (
      <svg
        viewBox="0 0 100 100"
        width={dim}
        height={dim}
        className="shrink-0 drop-shadow-[0_6px_14px_rgba(203,213,225,0.6)] animate-in zoom-in-75 duration-300"
      >
        <defs>
          <linearGradient id="silverCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="65%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="silverPedestal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="45" r="36" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

        {/* Handles */}
        <path d="M 30 28 C 16 28 14 47 29 50 C 31 46 32 44 32 41 C 23 39 23 32 30 32 Z" fill="url(#silverCupGrad)" stroke="#475569" strokeWidth="1.2" />
        <path d="M 70 28 C 84 28 86 47 71 50 C 69 46 68 44 68 41 C 77 39 77 32 70 32 Z" fill="url(#silverCupGrad)" stroke="#475569" strokeWidth="1.2" />

        {/* Chalice */}
        <path d="M 28 25 L 72 25 C 72 25 74 48 50 59 C 26 48 28 25 28 25 Z" fill="url(#silverCupGrad)" stroke="#334155" strokeWidth="1.5" />
        <ellipse cx="50" cy="25" rx="22" ry="3.5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
        <ellipse cx="50" cy="25" rx="18" ry="2" fill="#cbd5e1" />

        {/* Stem & Base */}
        <path d="M 46 58 L 54 58 L 52 72 L 48 72 Z" fill="url(#silverCupGrad)" stroke="#334155" strokeWidth="1" />
        <ellipse cx="50" cy="72" rx="8" ry="2.2" fill="#64748b" />
        <polygon points="35,74 65,74 68,87 32,87" fill="url(#silverPedestal)" stroke="#64748b" strokeWidth="1" />
        <rect x="29" y="87" width="42" height="4.5" rx="1.2" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />

        {/* Plate #2 */}
        <rect x="41" y="77" width="18" height="8" rx="1.2" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
        <text x="50" y="83.5" textAnchor="middle" fill="#1e293b" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">#2</text>
      </svg>
    );
  }

  // Rank 3: Polished Bronze & Warm Copper Grand Prix Cup
  return (
    <svg
      viewBox="0 0 100 100"
      width={dim}
      height={dim}
      className="shrink-0 drop-shadow-[0_6px_14px_rgba(205,127,50,0.55)] animate-in zoom-in-75 duration-300"
    >
      <defs>
        <linearGradient id="bronzeCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="35%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
        <linearGradient id="bronzePedestal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="45" r="35" fill="none" stroke="#ea580c" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />

      {/* Handles */}
      <path d="M 30 29 C 17 29 15 47 29 50 C 31 46 32 44 32 41 C 24 39 24 33 30 33 Z" fill="url(#bronzeCupGrad)" stroke="#7c2d12" strokeWidth="1.2" />
      <path d="M 70 29 C 83 29 85 47 71 50 C 69 46 68 44 68 41 C 76 39 76 33 70 33 Z" fill="url(#bronzeCupGrad)" stroke="#7c2d12" strokeWidth="1.2" />

      {/* Chalice */}
      <path d="M 28 26 L 72 26 C 72 26 73 47 50 58 C 27 47 28 26 28 26 Z" fill="url(#bronzeCupGrad)" stroke="#7c2d12" strokeWidth="1.5" />
      <ellipse cx="50" cy="26" rx="22" ry="3.5" fill="#ffedd5" stroke="#9a3412" strokeWidth="1.2" />
      <ellipse cx="50" cy="26" rx="18" ry="2" fill="#c2410c" />

      {/* Stem & Base */}
      <path d="M 46 57 L 54 57 L 52 72 L 48 72 Z" fill="url(#bronzeCupGrad)" stroke="#7c2d12" strokeWidth="1" />
      <ellipse cx="50" cy="72" rx="8" ry="2.2" fill="#9a3412" />
      <polygon points="35,74 65,74 68,87 32,87" fill="url(#bronzePedestal)" stroke="#7c2d12" strokeWidth="1" />
      <rect x="29" y="87" width="42" height="4.5" rx="1.2" fill="#0f172a" stroke="#c2410c" strokeWidth="0.8" />

      {/* Plate #3 */}
      <rect x="41" y="77" width="18" height="8" rx="1.2" fill="#fdba74" stroke="#7c2d12" strokeWidth="0.8" />
      <text x="50" y="83.5" textAnchor="middle" fill="#431407" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">#3</text>
    </svg>
  );
}

export default function LeaderboardView({
  onSelectUser,
  currentUserXp = 0,
  currentUserId = 'user-me-01',
}: LeaderboardViewProps) {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // STRICTLY REGULAR REGISTERED USERS ONLY - ZERO ADMINS - REAL STATS ONLY
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([
    {
      id: 'usr-1792821758198',
      rank: 1,
      displayName: 'masih',
      username: 'masih',
      level: 502,
      xp: 50110,
      wpm: 0,
      accuracy: 0,
      racesWon: 2,
    },
    {
      id: 'usr-regular',
      rank: 2,
      displayName: 'کاربر تایپرو',
      username: 'typro_user',
      level: 502,
      xp: 50110,
      wpm: 0,
      accuracy: 0,
      racesWon: 0,
    },
    {
      id: 'usr-1792521806971',
      rank: 3,
      displayName: 'taha',
      username: 'taha',
      level: 3,
      xp: 220,
      wpm: 0,
      accuracy: 0,
      racesWon: 1,
    },
    {
      id: 'usr-1792434996508',
      rank: 4,
      displayName: 'Ali',
      username: 'Ali',
      level: 2,
      xp: 180,
      wpm: 0,
      accuracy: 0,
      racesWon: 1,
    },
    {
      id: 'usr-1792900000001',
      rank: 5,
      displayName: 'mahdi',
      username: 'mahdi',
      level: 1,
      xp: 0,
      wpm: 0,
      accuracy: 0,
      racesWon: 0,
    },
    {
      id: 'usr-1792900000002',
      rank: 6,
      displayName: 'alireza',
      username: 'alireza',
      level: 1,
      xp: 0,
      wpm: 0,
      accuracy: 0,
      racesWon: 0,
    },
    {
      id: 'usr-1792900000003',
      rank: 7,
      displayName: 'Younes',
      username: 'Younes',
      level: 1,
      xp: 0,
      wpm: 0,
      accuracy: 0,
      racesWon: 0,
    },
  ]);

  // Dynamic leaderboard from server API (with admin exclusion filter & live XP sync)
  useEffect(() => {
    let isMounted = true;

    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/gamification/leaderboard?period=${period}`);
        let serverUsers: any[] = [];
        if (res.ok) {
          serverUsers = await res.json();
        }

        // Also check localStorage registered users to ensure immediate visibility of new registrations
        let localUsers: any[] = [];
        if (typeof window !== 'undefined') {
          try {
            const reg = JSON.parse(localStorage.getItem('typro_registered_users') || '[]');
            const adm = JSON.parse(localStorage.getItem('typro_admin_users') || '[]');
            localUsers = [...reg, ...adm];
          } catch {}
        }

        const combinedMap = new Map<string, any>();

        // 1. Add server users
        if (Array.isArray(serverUsers)) {
          for (const u of serverUsers) {
            if (!u) continue;
            const key = u.id || u.username || u.mobile;
            if (key) combinedMap.set(key, u);
          }
        }

        // 2. Add local users if not present
        for (const lu of localUsers) {
          if (!lu) continue;
          const key = lu.id || lu.username || lu.mobile;
          if (key && !combinedMap.has(key)) {
            combinedMap.set(key, {
              id: lu.id || `loc-${Date.now()}`,
              username: lu.username || 'user',
              displayName: lu.displayName || lu.name || lu.username || 'کاربر جدید',
              level: lu.level || 1,
              xp: lu.xp || 0,
              coins: lu.coins || 0,
              wpm: lu.wpm || 0,
              accuracy: lu.accuracy || 0,
              racesWon: lu.racesWon || 0,
              role: lu.role || 'USER',
            });
          }
        }

        const rawList = Array.from(combinedMap.values());
        if (isMounted && rawList.length > 0) {
          // All registered players eligible for leaderboard
          const allEligibleUsers = rawList.filter((u: any) => u && (u.displayName || u.username || u.mobile));

          if (allEligibleUsers.length > 0) {
            const localBestWpm = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_best_wpm') || '0') : 0;
            const localBestAcc = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_best_accuracy') || '0') : 0;
            const localRacesWon = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_races_won') || '0') : 0;
            const localCoins = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_coins') || '0') : 0;
            const localXp = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_xp') || '0') : 0;

            const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('typro_user_id') : null;
            const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('typro_username') : null;

            const enriched = allEligibleUsers.map((u: any) => {
              const isMe =
                (currentUserId && u.id === currentUserId) ||
                (storedUserId && u.id === storedUserId) ||
                (storedUsername && u.username === storedUsername);

              const uXp = (u.xp !== undefined && u.xp !== null && !isNaN(Number(u.xp)))
                ? Number(u.xp)
                : (isMe && localXp > 0 ? localXp : (Number(u.coins) || 0));

              const uLevel = (u.level !== undefined && u.level !== null && !isNaN(Number(u.level)) && Number(u.level) > 0)
                ? Number(u.level)
                : Math.max(1, Math.floor(uXp / 100) + 1);

              return {
                ...u,
                xp: uXp,
                level: uLevel,
                wpm: Number(u.wpm) > 0 ? Number(u.wpm) : (isMe && localBestWpm > 0 ? localBestWpm : (u.bestWpm ? Number(u.bestWpm) : 0)),
                accuracy: Number(u.accuracy) > 0 ? Number(u.accuracy) : (isMe && localBestAcc > 0 ? localBestAcc : (u.bestAccuracy ? Number(u.bestAccuracy) : 0)),
                racesWon: Number(u.racesWon) > 0 ? Number(u.racesWon) : (isMe && localRacesWon > 0 ? localRacesWon : 0),
              };
            });

            // Re-sort descending by XP, then Level
            enriched.sort((a: any, b: any) => (Number(b.xp) || 0) - (Number(a.xp) || 0) || (Number(b.level) || 0) - (Number(a.level) || 0));
            enriched.forEach((u: any, idx: number) => {
              u.rank = idx + 1;
            });

            setLeaderboardData(enriched);
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    fetchLeaderboard();

    // Auto-refresh every 5 seconds so new registrations and race finishes update in real-time
    const autoInterval = setInterval(fetchLeaderboard, 5000);

    const handleSync = () => {
      fetchLeaderboard();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('typro_economy_updated', handleSync);
      window.addEventListener('typro_user_registered', handleSync);
      window.addEventListener('storage', handleSync);
    }

    return () => {
      isMounted = false;
      clearInterval(autoInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('typro_economy_updated', handleSync);
        window.removeEventListener('typro_user_registered', handleSync);
        window.removeEventListener('storage', handleSync);
      }
    };
  }, [period, currentUserXp, currentUserId]);

  // Clean filter for search & admin exclusion
  const filteredUsers = leaderboardData
    .filter((u) => {
      if (!u) return false;
      if (
        u.id === 'usr-admin' ||
        u.username === 'typro_admin' ||
        (u.displayName && (u.displayName.includes('مدیر کل') || u.displayName.includes('ادمین')))
      ) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    })
    .map((u, idx) => ({ ...u, rank: idx + 1 }));

  const top3 = filteredUsers.slice(0, 3);
  const remaining = filteredUsers.slice(3);

  const handleRowClick = (user: LeaderboardUser) => {
    onSelectUser({
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      bio: user.bio,
      wpm: user.wpm,
      accuracy: user.accuracy,
      totalRaces: user.racesWon + 12,
      racesWon: user.racesWon,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner & Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>تالار افتخارات و رتبه‌بندی نخبگان تایپ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            برترین تایپیست‌های تایپرو بر اساس لول و امتیاز (XP)
          </h2>
          <p className="text-xs text-slate-400">
            رتبه‌بندی دقیق کاربران عادی با کاپ‌های رسمی و نشان‌های سه‌بعدی • روی نام هر بازیکن کلیک کنید تا پروفایل اختصاصی‌اش باز شود.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              period === 'day'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>امروز (روزانه)</span>
          </button>

          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              period === 'month'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>این ماه (ماهانه)</span>
          </button>

          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              period === 'year'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>سالانه و کل دوران</span>
          </button>
        </div>
      </div>

      {/* Top 3 Official Podium (سکوی ۳ نفر اول با کاپ‌های رسمی مسابقات) */}
      {top3.length >= 3 && !searchQuery.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 items-end">
          {/* Rank 2 (Silver Cup) */}
          <div
            onClick={() => handleRowClick(top3[1])}
            className="order-2 md:order-1 p-5 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-lg text-center space-y-3 cursor-pointer hover:scale-[1.02] transition-all group"
          >
            <div className="relative flex items-center justify-center -mt-8 mb-2">
              <ChampionshipCup rank={2} size="lg" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md ring-2 ring-slate-300">
              {top3[1].displayName.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition">
                {top3[1].displayName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">@{top3[1].username}</p>
            </div>
            <div className="flex justify-center">
              <GamingLevelBadge level={top3[1].level} size="sm" showStars={true} showTierName={true} />
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1">
              <span className="text-slate-500 text-[11px] font-bold">مجموع امتیازات (XP):</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 font-mono font-black text-sm shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{top3[1].xp.toLocaleString('fa-IR')} امتیاز</span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                لول {top3[1].level.toLocaleString('fa-IR')} • هر ۱۰۰ امتیاز = ۱ لول
              </span>
            </div>
          </div>

          {/* Rank 1 (Gold Cup / Champion) */}
          <div
            onClick={() => handleRowClick(top3[0])}
            className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100/90 dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-400 shadow-2xl text-center space-y-3.5 cursor-pointer hover:scale-[1.03] transition-all relative group -translate-y-3"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1 border border-amber-300">
              <Crown className="w-3.5 h-3.5" />
              <span>قهرمان بلامنازع</span>
            </div>
            <div className="relative flex items-center justify-center -mt-8 mb-2">
              <ChampionshipCup rank={1} size="lg" />
            </div>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-3xl font-black flex items-center justify-center mx-auto shadow-lg ring-4 ring-amber-300/50">
              {top3[0].displayName.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg group-hover:text-amber-500 transition">
                {top3[0].displayName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">@{top3[0].username}</p>
            </div>
            <div className="flex justify-center">
              <GamingLevelBadge level={top3[0].level} size="md" showStars={true} showTierName={true} />
            </div>
            <div className="pt-3 border-t border-amber-200 dark:border-amber-900/50 flex flex-col items-center justify-center gap-1.5">
              <span className="text-amber-800 dark:text-amber-300 text-[11px] font-bold">مجموع امتیازات قهرمان (XP):</span>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-mono font-black text-base shadow-sm">
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>{top3[0].xp.toLocaleString('fa-IR')} امتیاز</span>
              </div>
              <span className="text-[10px] text-amber-800 font-sans font-bold">
                لول {top3[0].level.toLocaleString('fa-IR')} • هر ۱۰۰ امتیاز = ۱ لول
              </span>
            </div>
          </div>

          {/* Rank 3 (Bronze Cup) */}
          <div
            onClick={() => handleRowClick(top3[2])}
            className="order-3 md:order-3 p-5 rounded-3xl bg-gradient-to-b from-amber-100/50 to-orange-100/70 dark:from-slate-800 dark:to-slate-900 border-2 border-amber-700/40 shadow-lg text-center space-y-3 cursor-pointer hover:scale-[1.02] transition-all group"
          >
            <div className="relative flex items-center justify-center -mt-8 mb-2">
              <ChampionshipCup rank={3} size="lg" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md ring-2 ring-amber-600/40">
              {top3[2].displayName.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-amber-600 transition">
                {top3[2].displayName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">@{top3[2].username}</p>
            </div>
            <div className="flex justify-center">
              <GamingLevelBadge level={top3[2].level} size="sm" showStars={true} showTierName={true} />
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1">
              <span className="text-slate-500 text-[11px] font-bold">مجموع امتیازات (XP):</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 font-mono font-black text-sm shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{top3[2].xp.toLocaleString('fa-IR')} امتیاز</span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">
                لول {top3[2].level.toLocaleString('fa-IR')} • هر ۱۰۰ امتیاز = ۱ لول
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Full Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Search header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-black text-slate-800 flex items-center gap-2">
            <span>لیست کامل رتبه‌بندی کاربران</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredUsers.length} شرکت‌کننده عادی
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام یا نام‌کاربری..."
              className="w-full text-xs pr-9 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4 text-center">رتبه</th>
                <th className="py-3 px-4">تایپیست</th>
                <th className="py-3 px-4">نشان و لول گیمینگ</th>
                <th className="py-3 px-4 text-center">امتیاز کل (XP)</th>
                <th className="py-3 px-4 text-center">پروفایل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user)}
                  className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-center font-black">
                    {user.rank === 1 ? (
                      <span className="inline-flex items-center justify-center" title="مقام اول - کاپ طلا">
                        <ChampionshipCup rank={1} size="sm" />
                      </span>
                    ) : user.rank === 2 ? (
                      <span className="inline-flex items-center justify-center" title="مقام دوم - کاپ نقره">
                        <ChampionshipCup rank={2} size="sm" />
                      </span>
                    ) : user.rank === 3 ? (
                      <span className="inline-flex items-center justify-center" title="مقام سوم - کاپ برنز">
                        <ChampionshipCup rank={3} size="sm" />
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono font-black text-sm">
                        #{user.rank}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover:text-blue-600 transition">
                          {user.displayName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <GamingLevelBadge
                      level={user.level}
                      size="xs"
                      showStars={true}
                      showTierName={true}
                    />
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-mono font-black text-xs shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{user.xp.toLocaleString('fa-IR')} امتیاز</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(user);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-[11px] font-bold transition cursor-pointer"
                    >
                      مشاهده
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
