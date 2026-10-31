'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Gift, Coins, Award, Sparkles, Save, CheckCircle2, 
  Flame, Dices, Percent, BarChart3, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface ChestDropTable {
  id: string;
  name: string;
  coinsMin: number;
  coinsMax: number;
  coinsChance: number;
  skinChance: number;
  boostChance: number;
  titleChance: number;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState({
    dailyStreakBonus: 20,
    dailyStarReward: 50,
    personalBestXp: 100,
    personalBestCoins: 50,
    streakMilestone7Days: 200,
    streakMilestone14Days: 500,
    streakMilestone30Days: 1500,
  });

  const [chests, setChests] = useState<ChestDropTable[]>([
    {
      id: 'wooden',
      name: 'صندوق چوبی (متداول)',
      coinsMin: 10,
      coinsMax: 50,
      coinsChance: 70,
      skinChance: 5,
      boostChance: 25,
      titleChance: 0,
    },
    {
      id: 'silver',
      name: 'صندوق نقره‌ای (کمیاب)',
      coinsMin: 50,
      coinsMax: 200,
      coinsChance: 50,
      skinChance: 15,
      boostChance: 30,
      titleChance: 5,
    },
    {
      id: 'gold',
      name: 'صندوق طلایی (حماسی)',
      coinsMin: 200,
      coinsMax: 1000,
      coinsChance: 30,
      skinChance: 35,
      boostChance: 25,
      titleChance: 10,
    },
    {
      id: 'obsidian',
      name: 'صندوق ابسیدین کیهانی (افسانه‌ای)',
      coinsMin: 1000,
      coinsMax: 5000,
      coinsChance: 20,
      skinChance: 50,
      boostChance: 15,
      titleChance: 15,
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [simulatedResults, setSimulatedResults] = useState<{ [key: string]: number } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✅ مقادیر جدید پاداش‌ها و جداول شانس (Drop Tables) با موفقیت در کلاستر بازی اعمال شد.');
  };

  const updateChestField = (chestId: string, field: keyof ChestDropTable, val: number) => {
    setChests(chests.map(c => c.id === chestId ? { ...c, [field]: val } : c));
  };

  const runSimulation = (chest: ChestDropTable) => {
    const totalRolls = 100;
    const results = { 'سکه': 0, 'پوسته خودرو': 0, 'بوست شتاب XP': 0, 'عنوان افتخاری': 0 };

    for (let i = 0; i < totalRolls; i++) {
      const rand = Math.random() * 100;
      if (rand < chest.coinsChance) {
        results['سکه']++;
      } else if (rand < chest.coinsChance + chest.skinChance) {
        results['پوسته خودرو']++;
      } else if (rand < chest.coinsChance + chest.skinChance + chest.boostChance) {
        results['بوست شتاب XP']++;
      } else {
        results['عنوان افتخاری']++;
      }
    }

    setSimulatedResults(results);
    showToast(`🎲 شبیه‌سازی ۱۰۰ بار بازگشایی «${chest.name}» با موفقیت انجام شد.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
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
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">← بازگشت به داشبورد ادمین</Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            کنترل مقادیر پاداش‌ها، شانس صندوق‌ها و استمرار (Reward & Drop Engine)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تنظیم ضرایب استمرار روزانه، جوایز رکوردهای فردی و جداول احتمالات RNG صندوق‌های شانس طبق بند ۱۳۴.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Streak & Personal Best Rewards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>پاداش‌های زنجیره استمرار روزانه (Daily Streak) و رکوردهای فردی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="font-bold text-slate-700 block">سکه روزانه استمرار (پایه)</label>
              <input
                type="number"
                value={rewards.dailyStreakBonus}
                onChange={(e) => setRewards({ ...rewards, dailyStreakBonus: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="font-bold text-slate-700 block">پاداش عطف ۷ روزه (سکه)</label>
              <input
                type="number"
                value={rewards.streakMilestone7Days}
                onChange={(e) => setRewards({ ...rewards, streakMilestone7Days: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="font-bold text-slate-700 block">پاداش عطف ۱۴ روزه (سکه)</label>
              <input
                type="number"
                value={rewards.streakMilestone14Days}
                onChange={(e) => setRewards({ ...rewards, streakMilestone14Days: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="font-bold text-slate-700 block">پاداش عطف ۳۰ روزه (سکه)</label>
              <input
                type="number"
                value={rewards.streakMilestone30Days}
                onChange={(e) => setRewards({ ...rewards, streakMilestone30Days: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Chests Drop Tables Configuration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-600" />
              <span>جداول شانس و توزیع جوایز صندوق‌های شانس (Loot Box RNG Probabilities)</span>
            </h3>

            {simulatedResults && (
              <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">نتیجه ۱۰۰ شبیه‌سازی:</span>
                {Object.entries(simulatedResults).map(([k, v]) => (
                  <span key={k} className="text-slate-600">
                    {k}: <strong className="font-mono text-slate-900">{v}٪</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chests.map((c) => {
              const sum = c.coinsChance + c.skinChance + c.boostChance + c.titleChance;
              const is100 = sum === 100;

              return (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => runSimulation(c)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                    >
                      <Dices className="w-3 h-3" />
                      <span>تست شبیه‌ساز (۱۰۰ بار)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">کف سکه</label>
                      <input
                        type="number"
                        value={c.coinsMin}
                        onChange={(e) => updateChestField(c.id, 'coinsMin', Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">سقف سکه</label>
                      <input
                        type="number"
                        value={c.coinsMax}
                        onChange={(e) => updateChestField(c.id, 'coinsMax', Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">شانس سکه</label>
                      <input
                        type="number"
                        value={c.coinsChance}
                        onChange={(e) => updateChestField(c.id, 'coinsChance', Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">شانس اسکین</label>
                      <input
                        type="number"
                        value={c.skinChance}
                        onChange={(e) => updateChestField(c.id, 'skinChance', Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">شانس بوست</label>
                      <input
                        type="number"
                        value={c.boostChance}
                        onChange={(e) => updateChestField(c.id, 'boostChance', Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">شانس لقب</label>
                      <input
                        type="number"
                        value={c.titleChance}
                        onChange={(e) => updateChestField(c.id, 'titleChance', Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">مجموع احتمالات:</span>
                    <span className={`font-mono font-black ${is100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {sum}٪ {is100 ? '✓ متعادل' : '⚠️ نامتعادل (باید ۱۰۰٪ باشد)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره کلیه مقادیر و اعمال در اقتصاد بازی</span>
          </button>
        </div>
      </form>
    </div>
  );
}
