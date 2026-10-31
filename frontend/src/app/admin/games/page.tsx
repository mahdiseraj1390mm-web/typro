'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  ShieldCheck,
  Crown,
  Key,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Coins,
  Zap,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  Search,
  Users,
  Settings
} from 'lucide-react';
import {
  GameConfigItem,
  getGamesConfig,
  saveGamesConfig,
  DEFAULT_GAMES_CONFIG,
  GameAccessTier,
  GameDifficulty
} from '@/lib/gamesConfig';
import { useAuth } from '@/context/AuthContext';

export default function AdminGamesManagementPage() {
  const { user } = useAuth();
  const [gamesList, setGamesList] = useState<GameConfigItem[]>([]);
  const [editingGame, setEditingGame] = useState<GameConfigItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-user permission granting state
  const [targetUserIdentifier, setTargetUserIdentifier] = useState('');
  const [selectedGameForUser, setSelectedGameForUser] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const list = getGamesConfig();
    setGamesList(list);
    if (list.length > 0) {
      setSelectedGameForUser(list[0].id);
    }
  }, []);

  const handleSaveAll = (updated: GameConfigItem[]) => {
    setGamesList(updated);
    saveGamesConfig(updated);
    showToast('✅ تنظیمات بازی‌ها با موفقیت ذخیره و در سرور اعمال شد.');
  };

  const handleToggleActive = (id: string) => {
    const updated = gamesList.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g));
    handleSaveAll(updated);
  };

  const handleTierChange = (id: string, tier: GameAccessTier) => {
    const updated = gamesList.map((g) => (g.id === id ? { ...g, accessTier: tier } : g));
    handleSaveAll(updated);
  };

  const handleResetToDefaults = () => {
    handleSaveAll(DEFAULT_GAMES_CONFIG);
    showToast('↺ کلیه تنظیمات بازی‌ها به حالت پیش‌فرض کارخانه بازنشانی شد.');
  };

  // Grant game access to specific user
  const handleGrantAccessToUser = (e: React.FormEvent) => {
    e.preventDefault();
    const ident = targetUserIdentifier.trim();
    if (!ident) {
      showToast('⚠️ لطفاً شماره موبایل یا نام کاربری کاربر مورد نظر را وارد نمایید.');
      return;
    }

    const game = gamesList.find((g) => g.id === selectedGameForUser);
    if (!game) return;

    if (game.unlockedUserIds.includes(ident)) {
      showToast(`⚠️ کاربر «${ident}» از قبل به بازی «${game.title}» دسترسی ویژه دارد.`);
      return;
    }

    const updated = gamesList.map((g) =>
      g.id === selectedGameForUser ? { ...g, unlockedUserIds: [...g.unlockedUserIds, ident] } : g
    );

    handleSaveAll(updated);
    setTargetUserIdentifier('');
    showToast(`👑 دسترسی نامحدود به بازی «${game.title}» برای کاربر «${ident}» با موفقیت فعال شد.`);
  };

  // Revoke game access from user
  const handleRevokeUserAccess = (gameId: string, userIdent: string) => {
    const updated = gamesList.map((g) =>
      g.id === gameId ? { ...g, unlockedUserIds: g.unlockedUserIds.filter((u) => u !== userIdent) } : g
    );
    handleSaveAll(updated);
    showToast(`دسترسی کاربر «${userIdent}» به این بازی لغو شد.`);
  };

  const filteredGames = gamesList.filter(
    (g) => g.title.includes(searchFilter) || g.englishTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans" dir="rtl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">
              ← بازگشت به داشبورد ادمین
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2.5">
            <Gamepad2 className="w-8 h-8 text-indigo-600" />
            <span>مدیریت جامع بازی‌ها و سطوح دسترسی کاربران</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            کنترل سطح دسترسی (رایگان / ویژه VIP)، سقف بازی روزانه، جوایز و بازگشایی بازی‌ها برای کاربران اختصاصی توسط مدیر کل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/games"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition border border-indigo-200 shadow-2xs"
          >
            <Play className="w-4 h-4" />
            <span>ورود مستقیم به تالار بازی‌ها (مدیر کل 👑)</span>
          </Link>
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition border border-slate-200"
            title="بازنشانی به حالت کارخانه"
          >
            بازنشانی پیش‌فرض
          </button>
        </div>
      </div>

      {/* Super Admin Privileges Status Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 p-5 rounded-3xl border-2 border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900">
              اختیارات کامل مدیر کل بر کلیه بازی‌ها (Super Admin Override Active)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              مدیر کل به صورت پیش‌فرض در تمامی بازی‌ها دسترسی نامحدود (بدون کسر انرژی و بدون نیاز به خرید اشتراک) دارد و می‌تواند قفل هر بازی را برای هر کاربر دلخواه باز کند.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-black self-start sm:self-auto shadow-2xs">
          سطح دسترسی شما: مدیر کل سامانه 👑
        </div>
      </div>

      {/* Section 1: Per-User Custom Unlock Grant Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <Key className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-black text-slate-900">
              بازگشایی اختصاصی بازی برای کاربر مشخص (Grant Special Game Access)
            </h2>
            <p className="text-xs text-slate-500">
              شماره موبایل یا نام کاربری کاربر مورد نظر را وارد کرده و بازی انتخابی را برای او فعال کنید (کاربر بدون داشتن اشتراک VIP به این بازی دسترسی پیدا می‌کند):
            </p>
          </div>
        </div>

        <form onSubmit={handleGrantAccessToUser} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700">شماره موبایل یا نام کاربری کاربر:</label>
            <input
              type="text"
              required
              value={targetUserIdentifier}
              onChange={(e) => setTargetUserIdentifier(e.target.value)}
              placeholder="مثال: 09123456789 یا ali_reza"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-bold text-slate-700">انتخاب بازی جهت بازگشایی:</label>
            <select
              value={selectedGameForUser}
              onChange={(e) => setSelectedGameForUser(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
            >
              {gamesList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.title} ({g.accessTier === 'vip' ? 'اشتراک VIP' : 'رایگان'})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>اعطای دسترسی به کاربر</span>
            </button>
          </div>
        </form>

        {/* List of currently granted users */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            کاربران دارای دسترسی ویژه در بازی‌ها:
          </span>
          <div className="flex flex-wrap gap-2">
            {gamesList.flatMap((g) =>
              g.unlockedUserIds.map((u) => (
                <span
                  key={g.id + '-' + u}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800"
                >
                  <span className="font-bold text-indigo-700 font-sans">{g.icon} {g.title}:</span>
                  <span>{u}</span>
                  <button
                    type="button"
                    onClick={() => handleRevokeUserAccess(g.id, u)}
                    className="p-0.5 rounded-md text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
                    title="لغو دسترسی کاربر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
            {gamesList.every((g) => g.unlockedUserIds.length === 0) && (
              <span className="text-xs text-slate-400 italic">
                هنوز کاربری به صورت دستی بازگشایی نشده است.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Games List and Configurations */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900">
              تنظیمات عمومی، جوایز و قوانین هر بازی ({gamesList.length} بازی)
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="جستجو در بازی‌ها..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className={`bg-white rounded-3xl border-2 transition shadow-md flex flex-col justify-between overflow-hidden ${
                !game.isActive
                  ? 'border-slate-200 opacity-60'
                  : game.accessTier === 'vip'
                  ? 'border-amber-300'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100">{game.icon}</span>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{game.title}</h3>
                      <span className="text-[10px] text-slate-400 font-mono block">{game.englishTitle}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(game.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                      game.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {game.isActive ? 'فعال ✓' : 'غیرفعال ✕'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {game.desc}
                </p>

                {/* Badges / Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">پاداش سکه</span>
                    <span className="font-black text-amber-600 flex items-center justify-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{game.coinReward} سکه</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">پاداش تجربه (XP)</span>
                    <span className="font-black text-indigo-600 flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{game.xpReward} XP</span>
                    </span>
                  </div>
                </div>

                {/* Access Tier Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>سطح دسترسی بازی:</span>
                    <span className="font-mono text-indigo-600 font-bold">
                      {game.accessTier === 'free'
                        ? 'رایگان برای همه'
                        : game.accessTier === 'vip'
                        ? 'نیازمند اشتراک VIP 👑'
                        : 'فقط مدیر کل'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'free', label: 'رایگان' },
                        { id: 'vip', label: 'ویژه VIP 👑' },
                        { id: 'admin_only', label: 'فقط ادمین' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleTierChange(game.id, t.id)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold border transition ${
                          game.accessTier === t.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free Daily Limit */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 font-medium">سقف بازی روزانه کاربر عادی:</span>
                  <div className="flex items-center gap-1">
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          const updated = gamesList.map((g) =>
                            g.id === game.id ? { ...g, maxDailyPlaysFree: num } : g
                          );
                          handleSaveAll(updated);
                        }}
                        className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                          game.maxDailyPlaysFree === num
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {num} بار
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {game.unlockedUserIds.length > 0
                    ? `${game.unlockedUserIds.length} کاربر با دسترسی ویژه`
                    : 'بدون استثنای دستی'}
                </span>

                <Link
                  href={`/games?mode=${game.key}`}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>تست بازی</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
