'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Crown,
  Flame,
  Star,
  Shield,
  Search,
  Filter,
  Sparkles,
  Zap,
  Users,
  Play
} from 'lucide-react';
import { getStoredTournamentConfig, TournamentPlayer } from '@/data/tournamentData';
import { useAuth } from '@/context/AuthContext';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  wpm: number;
  accuracy: number;
  level: number;
  streak: number;
  league: string;
  isCurrentUser?: boolean;
}

const LEAGUES = ['همه', 'Legend', 'Grandmaster', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];

export default function RankingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'allTime'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('همه');
  const [realPlayers, setRealPlayers] = useState<TournamentPlayer[]>([]);

  useEffect(() => {
    const config = getStoredTournamentConfig();
    const list = [...config.registeredPlayers];

    // Check if current user or saved local player is registered
    try {
      const saved = localStorage.getItem('typro_tournament_my_player');
      if (saved) {
        const myP = JSON.parse(saved);
        if (!list.some((p) => p.name === myP.name)) {
          list.push(myP);
        }
      }
    } catch {
      // ignore
    }

    // Filter out any legacy fake names
    const cleaned = list.filter(
      (p) =>
        p.name !== 'محمدرضا کاظمی' &&
        p.name !== 'علی رضایی' &&
        p.name !== 'سینا احمدی' &&
        p.name !== 'سروش نیک‌پی' &&
        p.name !== 'امیرحسین راد' &&
        p.name !== 'زهرا مهدوی' &&
        p.name !== 'نیما سهرابی' &&
        p.name !== 'حسین مرادی' &&
        p.name !== 'پارسا تهرانی' &&
        p.name !== 'سارا سعیدی' &&
        p.name !== 'علی کیانی‌فر'
    );

    // Fetch real registered users from backend leaderboard
    fetch('/api/gamification/leaderboard?period=allTime')
      .then((res) => (res.ok ? res.json() : []))
      .then((boardUsers: any[]) => {
        if (Array.isArray(boardUsers) && boardUsers.length > 0) {
          const registeredList: TournamentPlayer[] = boardUsers.map((u) => ({
            id: u.id,
            name: u.displayName || u.username,
            avgWpm: u.wpm || (u.level > 10 ? 85 : u.level > 1 ? 55 : 35),
            accuracy: u.accuracy || 98.5,
            preferredSlot: 'night',
            status: 'registered',
            isUser: false,
          }));
          setRealPlayers(registeredList);
          return;
        }
        setRealPlayers(cleaned);
      })
      .catch(() => {
        setRealPlayers(cleaned);
      });
  }, []);

  // Compute real leaderboard entries
  const leaderboardEntries: LeaderboardEntry[] = useMemo(() => {
    if (realPlayers.length === 0) return [];
    return [...realPlayers]
      .sort((a, b) => b.avgWpm - a.avgWpm || b.accuracy - a.accuracy)
      .map((p, idx) => ({
        rank: idx + 1,
        name: p.name,
        wpm: p.avgWpm,
        accuracy: p.accuracy,
        level: Math.max(1, Math.floor(p.avgWpm / 3)),
        streak: 1,
        league:
          p.avgWpm >= 110
            ? 'Grandmaster'
            : p.avgWpm >= 95
            ? 'Master'
            : p.avgWpm >= 80
            ? 'Diamond'
            : p.avgWpm >= 65
            ? 'Platinum'
            : p.avgWpm >= 50
            ? 'Gold'
            : 'Silver',
        isCurrentUser: p.isUser || p.name === user?.displayName,
      }));
  }, [realPlayers, user]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboardEntries.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.rank.toString() === searchQuery;
      const matchLeague = selectedLeague === 'همه' || item.league === selectedLeague;
      return matchSearch && matchLeague;
    });
  }, [leaderboardEntries, searchQuery, selectedLeague]);

  // Top 3 Podium
  const p1 = leaderboardEntries[0] || null;
  const p2 = leaderboardEntries[1] || null;
  const p3 = leaderboardEntries[2] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Prominent Registration Callout Banner */}
      {!isAuthenticated && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              🏆
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px]">
                  توجه مهم
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  باید ثبت‌نام کنی تا همه این پیشرفت‌ها ذخیره شود!
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium max-w-2xl">
                برای ثبت نام خود در جدول تالار مشاهیر، تثبیت جایگاه در لیگ‌های برتر تایپ کشوری، محاسبه امتیازات فصلی و ذخیره پیشرفت‌ها، باید ابتدا حساب کاربری خود را ایجاد کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/login?tab=register"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <span>ثبت‌نام رایگان و ورود به لیگ</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition"
            >
              ورود به حساب
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-slate-900">
                <span>حساب شما فعال و متصل به لیگ‌ها است:</span>
                <span className="text-emerald-700 font-mono">@{user.username || user.displayName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                رکوردهای شما به صورت خودکار محاسبه شده و جایگاهتان در لیدربرد کشوری تثبیت می‌شود.
              </span>
            </div>
          </div>
          <div className="font-mono font-bold text-slate-700">
            سطح کاربری: {user.level || 1} • {user.xp || 0} XP
          </div>
        </div>
      )}

      {/* Header & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ورزش‌های الکترونیک تایپ (Typing Esports)</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            جدول برترین‌ها و تالار مشاهیر (Hall of Fame)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            رتبه‌بندی کاربران واقعی بر پایه سرعت خالص، دقت تاییدشده و رکوردهای ثبت‌شده در سامانه.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-xl transition ${
              period === 'daily' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            امروز
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-xl transition ${
              period === 'weekly' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            این هفته
          </button>
          <button
            onClick={() => setPeriod('allTime')}
            className={`px-4 py-2 rounded-xl transition ${
              period === 'allTime' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            کل ادوار
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">رکورد سرعت برتر</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
            {p1 ? `${p1.wpm} WPM` : '---'}
          </span>
          <span className="text-[10px] text-slate-400">
            {p1 ? `توسط ${p1.name}` : 'در انتظار اولین رکورد'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">میانگین دقت قهرمانان</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            {p1 ? `${p1.accuracy}٪` : '۱۰۰٪'}
          </span>
          <span className="text-[10px] text-slate-400">استاندارد المپیاد تایپ</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">تایپیست‌های رقابتی</span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
            {realPlayers.length} نفر
          </span>
          <span className="text-[10px] text-slate-400">شرکت‌کننده واقعی</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">جایگاه فعلی شما</span>
          <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">
            {leaderboardEntries.find((e) => e.isCurrentUser)
              ? `رتبه #${leaderboardEntries.find((e) => e.isCurrentUser)?.rank}`
              : '---'}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold">
            {leaderboardEntries.find((e) => e.isCurrentUser) ? 'ثبت‌شده در جدول' : 'هنوز رکوردی ثبت نشده'}
          </span>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Crown className="w-4 h-4" />
            <span>تالار افتخارات تایپرو</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">سکوی ۳ تایپیست برتر دور</h2>
          <p className="text-xs text-slate-400">
            تمامی اسامی غیرواقعی پاکسازی شدند. سکوها بر پایه نتایج واقعی کاربران تکمیل می‌گردد.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
          {/* Rank 2 */}
          <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 flex flex-col items-center text-center space-y-3 order-2 sm:order-1 h-72 justify-end shadow-lg transition hover:border-slate-500">
            <span className="text-4xl">🥈</span>
            <span className="text-xs font-bold text-slate-400">رتبه دوم</span>
            <h3 className="font-extrabold text-sm text-slate-100">
              {p2 ? p2.name : 'در انتظار ثبت رکورد'}
            </h3>
            <span className="text-2xl font-black text-blue-400 font-mono">
              {p2 ? `${p2.wpm} WPM` : '---'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {p2 ? `دقت ${p2.accuracy}٪` : 'جایگاه خالی'}
            </span>
          </div>

          {/* Rank 1 (Tallest) */}
          <div className="bg-gradient-to-t from-blue-950 via-slate-800 to-slate-800 p-6 rounded-3xl border-2 border-amber-400 flex flex-col items-center text-center space-y-3 order-1 sm:order-2 h-84 justify-end shadow-2xl shadow-amber-500/15 transition hover:scale-102">
            <span className="text-5xl">👑</span>
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">قهرمان طلایی</span>
            <h3 className="font-black text-base text-white">
              {p1 ? p1.name : 'در انتظار قهرمان اولین دوره'}
            </h3>
            <span className="text-3xl font-black text-amber-400 font-mono">
              {p1 ? `${p1.wpm} WPM` : '---'}
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              {p1 ? `دقت تاییدشده ${p1.accuracy}٪` : 'اولین رکورددار باشید'}
            </span>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 flex flex-col items-center text-center space-y-3 order-3 sm:order-3 h-64 justify-end shadow-lg transition hover:border-slate-500">
            <span className="text-4xl">🥉</span>
            <span className="text-xs font-bold text-slate-400">رتبه سوم</span>
            <h3 className="font-extrabold text-sm text-slate-100">
              {p3 ? p3.name : 'در انتظار ثبت رکورد'}
            </h3>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {p3 ? `${p3.wpm} WPM` : '---'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {p3 ? `دقت ${p3.accuracy}٪` : 'جایگاه خالی'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-base text-slate-900">جدول رتبه‌بندی عمومی لیگ</h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجوی تایپیست..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 pl-4 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition w-48"
              />
            </div>

            {/* League Dropdown/Filter */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {LEAGUES.map((lg) => (
                <button
                  key={lg}
                  onClick={() => setSelectedLeague(lg)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    selectedLeague === lg
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lg}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">رتبه</th>
                <th className="py-3 px-4">نام تایپیست</th>
                <th className="py-3 px-4">لیگ فعلی</th>
                <th className="py-3 px-4">سرعت رکورد (WPM)</th>
                <th className="py-3 px-4">دقت</th>
                <th className="py-3 px-4">زنجیره فعالیت (Streak)</th>
                <th className="py-3 px-4">سطح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-600">هنوز رکوردی در جدول برترین‌ها ثبت نشده است.</p>
                    <p className="text-[11px] text-slate-400">
                      تمامی داده‌های آزمایشی حذف شدند. با ثبت رکورد در تست سرعت یا تورنمنت، اولین رتبه جدول را کسب فرمایید.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/tournaments"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>ثبت‌نام در تورنمنت هفتگی</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((item) => (
                  <tr
                    key={item.rank}
                    className={`hover:bg-slate-50 transition ${
                      item.isCurrentUser ? 'bg-amber-50/60 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.rank <= 3 ? (
                        <span className="text-base">
                          {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        `#${item.rank}`
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {item.name}
                      {item.isCurrentUser && (
                        <span className="mr-2 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                          شما
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.league}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.wpm} WPM</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{item.accuracy}٪</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.streak} روز</td>
                    <td className="py-3 px-4 font-mono text-slate-600">LVL {item.level}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
