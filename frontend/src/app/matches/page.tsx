'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Trophy,
  Play,
  ArrowUpRight,
  Gauge,
  Clock,
  Award,
  ChevronLeft,
  Activity,
  Zap,
  Eye,
  X,
  Sparkles
} from 'lucide-react';

export interface MatchRacer {
  rank: number;
  name: string;
  wpm: number;
  accuracy: number;
  car: string;
  isUser: boolean;
}

export interface MatchRecord {
  id: string;
  date: string;
  roomTitle: string;
  myRank: number;
  totalParticipants: number;
  myWpm: number;
  myAccuracy: number;
  winnerName: string;
  earnedCoins: number;
  earnedXp: number;
  racers: MatchRacer[];
}

const STORAGE_KEY = 'typro_user_race_matches';

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Clean out any legacy mock items with fake personas
          const filtered = parsed.filter(
            (m: MatchRecord) =>
              m.winnerName !== 'محمدرضا کاظمی' &&
              !m.racers?.some((r) => r.name === 'محمدرضا کاظمی' || r.name === 'سینا احمدی')
          );
          setMatches(filtered);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              تاریخچه نبردهای پیست اتومبیل‌رانی و تله‌متری (Match History)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            سوابق مسابقات و نتایج زنده (Match History & Telemetry)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تمامی افراد غیرواقعی از سوابق حذف شدند. مسابقات و رکوردهای واقعی ثبت‌شده شما در این جدول نمایش داده می‌شوند.
          </p>
        </div>

        <Link
          href="/live-race"
          className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Play className="w-4 h-4" />
          <span>ورود به مسابقه زنده جدید</span>
        </Link>
      </div>

      {/* Matches List or Empty State */}
      {matches.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h3 className="font-black text-slate-900 text-base">هنوز مسابقه‌ای ثبت نشده است</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            تمامی رکوردهای آزمایشی و افراد غیرواقعی پاکسازی شدند. با ورود به پیست زنده و تکمیل مسابقه، کارنامه و تله‌متری شما ذخیره خواهد شد.
          </p>
          <div className="pt-2">
            <Link
              href="/live-race"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>شروع اولین مسابقه پیست</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-4">
                <div
                  className={
                    'w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs ' +
                    (m.myRank === 1
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200')
                  }
                >
                  {m.myRank === 1 ? '🥇' : m.myRank === 2 ? '🥈' : '🥉'}
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900">{m.roomTitle}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-mono">{m.date}</span>
                    <span>•</span>
                    <span>{m.totalParticipants} شرکت‌کننده</span>
                    <span>•</span>
                    <span>
                      برنده: <strong className="text-slate-800">{m.winnerName}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs flex-wrap justify-between md:justify-end">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">سرعت شما</span>
                  <span className="font-black text-blue-600 font-mono text-base">{m.myWpm} WPM</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">دقت شما</span>
                  <span className="font-black text-emerald-600 font-mono text-base">{m.myAccuracy}٪</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">پاداش مسابقه</span>
                  <span className="font-bold text-amber-600 font-mono">
                    +{m.earnedCoins} سکه / +{m.earnedXp} XP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMatch(m)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>تله‌متری</span>
                  </button>

                  <Link
                    href="/replay"
                    className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition border border-blue-200 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>بازپخش پیست</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Telemetry Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase">آنالیز جزئیات تله‌متری مسابقه</span>
              <h3 className="font-black text-lg text-slate-900">{selectedMatch.roomTitle}</h3>
              <p className="text-xs text-slate-500">تاریخ: {selectedMatch.date}</p>
            </div>

            {/* Competitors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">رتبه</th>
                    <th className="py-2.5 px-3">راننده / تایپیست</th>
                    <th className="py-2.5 px-3">خودرو</th>
                    <th className="py-2.5 px-3">سرعت نهایی</th>
                    <th className="py-2.5 px-3">دقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedMatch.racers.map((r) => (
                    <tr key={r.rank} className={r.isUser ? 'bg-blue-50/60 font-bold' : ''}>
                      <td className="py-2.5 px-3 font-mono">{r.rank}</td>
                      <td className="py-2.5 px-3 text-slate-900">{r.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.car}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-600">{r.wpm} WPM</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">{r.accuracy}٪</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Link
                href="/replay"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                مشاهده انیمیشن کامل بازپخش مسابقه
              </Link>
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
