'use client';

import React from 'react';
import GamingLevelBadge from '@/components/common/GamingLevelBadge';
import { getLevelTier } from '@/lib/levelTiers';
import { X, Trophy, Gauge, Target, Flag, Award, Sparkles, User, Flame } from 'lucide-react';

export interface PublicUserProfile {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  level: number;
  xp?: number;
  bio?: string;
  wpm?: number;
  accuracy?: number;
  totalRaces?: number;
  racesWon?: number;
  achievements?: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    isUnlocked: boolean;
  }[];
}

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PublicUserProfile | null;
}

export default function PublicProfileModal({
  isOpen,
  onClose,
  profile,
}: PublicProfileModalProps) {
  if (!isOpen || !profile) return null;

  const tier = getLevelTier(profile.level);
  const initials = (profile.displayName || profile.username || 'U').trim().charAt(0).toUpperCase();

  const achievementsList = profile.achievements || [
    {
      id: 'ach-first-blood',
      title: 'اولین نبرد پیست',
      description: 'شرکت در مسابقه زنده و عبور از خط پایان',
      isUnlocked: true,
    },
    {
      id: 'ach-speed-demon',
      title: 'دیو سرعت (۱۰۰+ WPM)',
      description: 'رسیدن به سرعت ۱۰۰ کلمه در دقیقه در آزمون رسمی',
      isUnlocked: (profile.wpm || 0) >= 100,
    },
    {
      id: 'ach-perfect-100',
      title: 'تمرکز مطلق (دقت ۱۰۰٪)',
      description: 'تایپ بی‌نقص یک متن کامل بدون خطا',
      isUnlocked: (profile.accuracy || 0) >= 99,
    },
    {
      id: 'ach-streak-30',
      title: 'تداوم پولادین',
      description: 'حفظ زنجیره تمرین روزانه در تایپرو',
      isUnlocked: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Tier Theme Gradient */}
        <div
          className={`h-24 bg-gradient-to-r ${tier.bgGradient} relative flex items-end px-6 pb-2`}
        >
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Header & Avatar */}
        <div className="px-6 pt-0 pb-4 relative">
          <div className="-mt-12 mb-3 flex items-end justify-between">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-black">
                  {initials}
                </div>
              )}
            </div>

            <GamingLevelBadge level={profile.level} size="md" showStars={true} showTierName={true} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">{profile.displayName}</h3>
              <span className="text-xs text-slate-400 font-mono">@{profile.username}</span>
            </div>
            {profile.bio ? (
              <p className="text-xs text-slate-600 leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-xs text-slate-400 italic">تایپیست فعال پیست رقابت‌های تایپرو</p>
            )}
          </div>
        </div>

        {/* Typing Statistics Grid */}
        <div className="px-6 py-3 bg-slate-50 border-y border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-bold mb-0.5">
              <Gauge className="w-3.5 h-3.5 text-blue-500" />
              <span>سرعت</span>
            </div>
            <div className="text-base font-black font-mono text-slate-900">
              {profile.wpm || '—'} <span className="text-[10px] font-sans text-slate-400">WPM</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-bold mb-0.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>دقت</span>
            </div>
            <div className="text-base font-black font-mono text-slate-900">
              {profile.accuracy ? `${profile.accuracy}٪` : '—'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-bold mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>پیروزی‌ها</span>
            </div>
            <div className="text-base font-black font-mono text-slate-900">
              {(profile.racesWon ?? 0).toLocaleString('fa-IR')}
            </div>
          </div>
        </div>

        {/* Achievements Section (Strictly Public) */}
        <div className="p-6 space-y-3 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>دستاوردهای ثبت شده:</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {achievementsList.filter((a) => a.isUnlocked).length} از {achievementsList.length} باز شده
            </span>
          </div>

          <div className="space-y-2">
            {achievementsList.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  ach.isUnlocked
                    ? 'bg-amber-50/60 border-amber-200/80'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                      ach.isUnlocked
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    🏆
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{ach.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{ach.description}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {ach.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      کسب شده
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-500 text-[10px] font-bold">
                      قفل
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
          >
            بستن پروفایل
          </button>
        </div>
      </div>
    </div>
  );
}
