'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TypingGameArena, { GameMode } from '@/components/games/TypingGameArena';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  Zap,
  Flame,
  Award,
  BookOpen,
  Crown,
  Lock,
  Unlock,
  Coins,
  Play,
  ArrowRight,
  ShieldCheck,
  Star,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Key
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  GameConfigItem,
  getGamesConfig,
  canUserPlayGame,
  recordUserGamePlay,
  getUserDailyPlays
} from '@/lib/gamesConfig';

function GamesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [gamesConfig, setGamesConfig] = useState<GameConfigItem[]>([]);
  const [activeGame, setActiveGame] = useState<GameConfigItem | null>(null);
  const [dailyPlays, setDailyPlays] = useState<Record<string, number>>({});
  const [accessDeniedModal, setAccessDeniedModal] = useState<{ isOpen: boolean; game: GameConfigItem | null; reason: string }>({
    isOpen: false,
    game: null,
    reason: ''
  });

  useEffect(() => {
    const list = getGamesConfig();
    setGamesConfig(list);
    setDailyPlays(getUserDailyPlays());

    // Check if mode param was passed directly
    const modeParam = searchParams.get('mode');
    if (modeParam) {
      const match = list.find((g) => g.key === modeParam);
      if (match) {
        handleSelectGame(match);
      }
    }

    const handleConfigChange = (e: any) => {
      const updated = e.detail || getGamesConfig();
      setGamesConfig(updated);
    };

    window.addEventListener('typro_games_config_changed', handleConfigChange);
    return () => window.removeEventListener('typro_games_config_changed', handleConfigChange);
  }, [searchParams]);

  const handleSelectGame = (game: GameConfigItem) => {
    const check = canUserPlayGame(game, user);
    if (!check.canPlay) {
      let reasonText = 'دسترسی به این بازی محدود است.';
      if (check.reason === 'vip_required') {
        reasonText = 'این بازی اختصاصی کاربران دارای اشتراک ویژه (VIP) است. با خرید اشتراک می‌توانید بدون محدودیت بازی کنید.';
      } else if (check.reason === 'daily_limit') {
        reasonText = `سقف بازی روزانه رایگان شما (${game.maxDailyPlaysFree} بازی در روز) به پایان رسیده است. جهت بازی نامحدود به اشتراک VIP ارتقا دهید.`;
      } else if (check.reason === 'disabled') {
        reasonText = 'این بازی موقتاً توسط مدیریت در حالت تعمیر و بروزرسانی قرار دارد.';
      }
      setAccessDeniedModal({ isOpen: true, game, reason: reasonText });
      return;
    }

    // Play allowed: record play and set active
    if (!isAdmin) {
      recordUserGamePlay(game.id);
      setDailyPlays(getUserDailyPlays());
    }
    setActiveGame(game);
  };

  const handleBackToLobby = () => {
    setActiveGame(null);
    router.push('/games');
  };

  // ══════════════════════════════════════════════════════════════════════════
  // وضعیت ۲: اجرای محیط زنده بازی انتخاب‌شده
  // ══════════════════════════════════════════════════════════════════════════
  if (activeGame) {
    const validModes: GameMode[] = [
      'wordfall',
      'defense',
      'chaser',
      'bomb',
      'balloon',
      'mining',
      'hacker',
      'parkour',
      'penalty',
      'boxing',
    ];
    const safeMode: GameMode = validModes.includes(activeGame.key as GameMode) ? (activeGame.key as GameMode) : 'wordfall';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans" dir="rtl">
        {/* Top Mini Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToLobby}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به تالار بازی‌ها</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeGame.icon}</span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">{activeGame.title}</h2>
                <span className="text-[10px] text-slate-500 font-mono">{activeGame.englishTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-black flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>دسترسی مدیر کل 👑</span>
              </span>
            )}
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              <Coins className="w-4 h-4" />
              <span>+{activeGame.coinReward} سکه در هر پیروزی</span>
            </div>
          </div>
        </div>

        {/* Main Game Arena */}
        <TypingGameArena
          initialMode={safeMode}
          allowModeSwitch={true}
          language="fa"
          title={activeGame.title}
          badge={activeGame.badge}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // وضعیت ۱: تالار اصلی بازی‌ها و کارت‌های شیک انتخاب (Lobby)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
              تالار اختصاصی بازی‌های مهارتی، اکشن و سرعتی تایپرو
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            گیمفیکیشن و بازی‌های سرعتی ده‌انگشتی
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            هیجان بقا، شلیک لیزری، سبقت با نیترو و خنثی‌سازی بمب ساعتی با ضربات سریع صفحه کلید. رکورد بزنید، سکه صید کنید و سطح مهارت خود را ارتقا دهید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          {isAdmin && (
            <Link
              href="/admin/games"
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/30 flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>پنل مدیریت و تنظیم بازی‌ها ⚙️</span>
            </Link>
          )}

          <Link
            href="/subscription"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>خرید اشتراک VIP و بازی نامحدود</span>
          </Link>
        </div>
      </div>

      {/* Admin Privilege Banner */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-bold">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>شما به عنوان مدیر کل وارد شده‌اید: دسترسی به تمامی بازی‌ها نامحدود و باز است.</span>
          </div>
          <Link href="/admin/games" className="text-amber-800 hover:underline">
            کنترل قفل و بازگشایی بازی برای کاربران عادی ←
          </Link>
        </div>
      )}

      {/* Games Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gamesConfig.map((game) => {
          const check = canUserPlayGame(game, user);
          const currentPlays = dailyPlays[game.id] || 0;
          const remainingPlays = Math.max(0, game.maxDailyPlaysFree - currentPlays);
          const isVipTier = game.accessTier === 'vip';
          const isSpecialUser = user && game.unlockedUserIds.includes(user.mobile || user.username || '');

          return (
            <div
              key={game.id}
              onClick={() => handleSelectGame(game)}
              className={`bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1.5 relative overflow-hidden group ${
                !check.canPlay
                  ? 'border-slate-200 opacity-90'
                  : isVipTier
                  ? 'border-amber-300 shadow-lg shadow-amber-500/10'
                  : 'border-slate-200 hover:border-blue-500'
              }`}
            >
              {/* 3D Visual Hero Poster Banner */}
              <div className="relative h-36 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 flex flex-col justify-between overflow-hidden border-b border-slate-800">
                {/* Tech grid texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                <div className="flex items-start justify-between z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>3D ENGINE</span>
                  </span>

                  {/* Status Badges */}
                  <div>
                    {isAdmin ? (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                        <Crown className="w-3 h-3" />
                        <span>مدیر کل</span>
                      </span>
                    ) : isSpecialUser ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                        <Key className="w-3 h-3" />
                        <span>اهدایی ادمین</span>
                      </span>
                    ) : isVipTier ? (
                      <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                        <Crown className="w-3 h-3" />
                        <span>VIP اختصاصی</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-600/90 text-white text-[10px] font-bold shadow-md">
                        رایگان
                      </span>
                    )}
                  </div>
                </div>

                {/* Floating 3D Icon & Title in Banner */}
                <div className="flex items-center gap-3 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white group-hover:text-cyan-300 transition-colors">
                      {game.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {game.englishTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 leading-relaxed min-h-[44px]">
                  {game.desc}
                </p>

              {/* Rewards and Plays Limit */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-600 font-black">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>+{game.coinReward} سکه</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 font-black">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>+{game.xpReward} XP</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    سختی: {game.difficulty === 'easy' ? 'آسان' : game.difficulty === 'hard' ? 'سخت' : 'متوسط'}
                  </span>
                </div>

                {/* Daily plays counter for free tier */}
                {!isAdmin && !isVipTier && !isSpecialUser && (
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-600">
                    <span>فرصت‌های روزانه باقی‌مانده:</span>
                    <span className="font-bold font-mono text-indigo-700">
                      {remainingPlays} از {game.maxDailyPlaysFree} بازی
                    </span>
                  </div>
                )}

                {/* Action button */}
                {check.canPlay ? (
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>شروع بازی 🚀</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>خرید اشتراک و بازگشایی 👑</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Access Denied Modal */}
      {accessDeniedModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-300 space-y-5 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                این بازی نیازمند اشتراک ویژه VIP است
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {accessDeniedModal.reason}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/subscription"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>مشاهده پلن‌ها و فعال‌سازی فوری اشتراک VIP</span>
              </Link>
              <button
                type="button"
                onClick={() => setAccessDeniedModal({ isOpen: false, game: null, reason: '' })}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                انصراف و بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center font-sans text-slate-500">
          در حال بارگذاری تالار بازی‌های آرکید...
        </div>
      }
    >
      <GamesContent />
    </Suspense>
  );
}
