'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Plus,
  Settings,
  Shield,
  Gauge,
  Save,
  CheckCircle2,
  Radio,
  Users,
  Bot,
  AlertTriangle,
  RefreshCw,
  Play,
  Square,
  Activity,
  Zap,
  Eye
} from 'lucide-react';

interface LiveRoom {
  id: string;
  name: string;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  humans: number;
  bots: number;
  maxPlayers: number;
  textSnippet: string;
  avgLatencyMs: number;
  elapsedSec: number;
}

const MOCK_LIVE_ROOMS: LiveRoom[] = [
  {
    id: 'ROOM-801',
    name: 'پیست کویر لوت (سریع)',
    status: 'racing',
    humans: 4,
    bots: 1,
    maxPlayers: 8,
    textSnippet: 'ایران سرزمینی کهن با تاریخی پرافتخار...',
    avgLatencyMs: 24,
    elapsedSec: 18,
  },
  {
    id: 'ROOM-802',
    name: 'مسابقه سریع عمومی #۴۲',
    status: 'countdown',
    humans: 3,
    bots: 2,
    maxPlayers: 6,
    textSnippet: 'تایپ ده‌انگشتی یکی از مهارت‌های بنیادین...',
    avgLatencyMs: 31,
    elapsedSec: 4,
  },
  {
    id: 'ROOM-803',
    name: 'لیگ حرفه‌ای گرندپری تیر',
    status: 'racing',
    humans: 6,
    bots: 0,
    maxPlayers: 8,
    textSnippet: 'شکوه و عظمت دماوند استوار در البرز...',
    avgLatencyMs: 18,
    elapsedSec: 42,
  },
  {
    id: 'ROOM-804',
    name: 'لابی دوستانه #۱۵',
    status: 'waiting',
    humans: 2,
    bots: 0,
    maxPlayers: 5,
    textSnippet: 'سحرگاهان که نسیم ملایم در گلستان...',
    avgLatencyMs: 28,
    elapsedSec: 0,
  },
];

export default function AdminRacesCmsPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'live-rooms' | 'bot-ai' | 'anticheat'>('settings');

  const [raceSettings, setRaceSettings] = useState({
    defaultRoomCapacity: 8,
    inactivityGraceSeconds: 5,
    maxScorePerRace: 30,
    minAccuracyForScore: 90,
    fullScoreAccuracy: 100,
    speedWeightPct: 60,
    accuracyWeightPct: 40,
    unanimousChangeTextRequired: true,
  });

  const [botSettings, setBotSettings] = useState({
    autoFillEnabled: true,
    spawnWaitSeconds: 5,
    noviceWpm: 30,
    intermediateWpm: 60,
    masterWpm: 90,
    alienWpm: 130,
  });

  const [anticheatSettings, setAnticheatSettings] = useState({
    wpmCapAlert: 180,
    zeroVarianceThresholdMs: 8,
    disqualifyOnPaste: true,
    requireWebcamForOlympiad: false,
  });

  const [rooms, setRooms] = useState<LiveRoom[]>(MOCK_LIVE_ROOMS);
  const [saved, setSaved] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTerminateRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    setActionMessage("اتاق " + roomId + " با موفقیت توسط ناظر متوقف و بسته‌شد.");
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">← بازگشت به داشبورد مدیریت</Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            مرکز کنترل مسابقات زنده و مانیتورینگ وب‌سوکت (Race CMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مدیریت پارامترهای بازی، فرمول امتیازدهی، مانیتورینگ بی‌درنگ اتاق‌ها و ربات‌های هوشمند بر اساس بندهای ۱۳۰ و ۱۴۴ مستند فنی.
          </p>
        </div>

        {/* Live WebSocket Status Badge */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tournaments"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>مدیریت تورنمنت هفتگی و براکت‌ها</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>WebSocket سرور متصل</span>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>تنظیمات با موفقیت ذخیره شدند و بلافاصله به سوکت‌های فعال مخابره گردیدند.</span>
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none text-xs font-bold">
        {[
          { id: 'settings', label: 'تنظیمات و فرمول امتیازدهی', icon: Settings },
          { id: 'live-rooms', label: 'مانیتورینگ اتاق‌های فعال (' + rooms.length + ')', icon: Radio },
          { id: 'bot-ai', label: 'کانفیگ هوش‌مصنوعی ربات‌ها', icon: Bot },
          { id: 'anticheat', label: 'تنظیمات ضدتقلب و سنسورها', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={"flex items-center gap-2 px-4 py-2.5 rounded-2xl transition whitespace-nowrap " + (
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General Settings & Scoring Formulas */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
            پارامترهای اتاق و چرخه مسابقه (بند ۱۳۰)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ظرفیت پیش‌فرض هر اتاق مسابقه (نفر)</label>
              <input
                type="number"
                value={raceSettings.defaultRoomCapacity}
                onChange={(e) => setRaceSettings({ ...raceSettings, defaultRoomCapacity: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">حداکثر ۸ نفر همزمان روی خط پیست</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">مهلت عدم فعالیت قبل از اخراج (ثانیه)</label>
              <input
                type="number"
                value={raceSettings.inactivityGraceSeconds}
                onChange={(e) => setRaceSettings({ ...raceSettings, inactivityGraceSeconds: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">طبق بند ۵۴ و ۱۴۴: پیش‌فرض ۵ ثانیه</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">سقف امتیاز هر مسابقه (Max Score)</label>
              <input
                type="number"
                value={raceSettings.maxScorePerRace}
                onChange={(e) => setRaceSettings({ ...raceSettings, maxScorePerRace: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">امتیاز پایه پیروزی در مسابقه استاندارد</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">حداقل دقت برای کسب امتیاز (٪)</label>
              <input
                type="number"
                value={raceSettings.minAccuracyForScore}
                onChange={(e) => setRaceSettings({ ...raceSettings, minAccuracyForScore: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">دقت کمتر از این مقدار، امتیاز ۰ می‌گیرد (بند ۷۰)</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">وزن سرعت WPM در امتیاز نهایی (٪)</label>
              <input
                type="number"
                value={raceSettings.speedWeightPct}
                onChange={(e) => setRaceSettings({ ...raceSettings, speedWeightPct: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">پیش‌فرض: ۶۰٪ سرعت</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">وزن دقت Accuracy در امتیاز نهایی (٪)</label>
              <input
                type="number"
                value={raceSettings.accuracyWeightPct}
                onChange={(e) => setRaceSettings({ ...raceSettings, accuracyWeightPct: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">پیش‌فرض: ۴۰٪ دقت</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>اعمال تغییرات قوانین مسابقه</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Real-time Live Rooms Monitor */}
      {activeTab === 'live-rooms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">اتاق‌های در حال اجرا (WebSocket Active Rooms)</h3>
              <p className="text-xs text-slate-500">نظارت بر زمان واقعی وضعیت بازیکنان و پینگ سرور</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">اتاق‌های همزمان: {rooms.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">شناسه اتاق</th>
                  <th className="p-3">عنوان مسابقه</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3">ترکیب بازیکنان</th>
                  <th className="p-3">متن انتخابی</th>
                  <th className="p-3">پینگ میانگین</th>
                  <th className="p-3 text-center">عملیات ناظر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-mono font-bold text-blue-600">{r.id}</td>
                    <td className="p-3 font-bold text-slate-900">{r.name}</td>
                    <td className="p-3">
                      {r.status === 'racing' && (
                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          در حال رقابت ({r.elapsedSec}s)
                        </span>
                      )}
                      {r.status === 'countdown' && (
                        <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                          شمارش معکوس
                        </span>
                      )}
                      {r.status === 'waiting' && (
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          در انتظار بازیکن
                        </span>
                      )}
                      {r.status === 'finished' && (
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          پایان یافته
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-bold">{r.humans} انسان</span>
                        {r.bots > 0 && <span className="text-indigo-600 font-bold">/ {r.bots} ربات</span>}
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{r.textSnippet}</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">{r.avgLatencyMs}ms</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setActionMessage("در حال اتصال ناظر به اتاق " + r.id);
                            setTimeout(() => setActionMessage(null), 3000);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="مشاهده زنده"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTerminateRoom(r.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                          title="توقف اجباری اتاق"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Bot AI Configuration */}
      {activeTab === 'bot-ai' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span>تنظیمات ربات‌های شبیه‌ساز هوش‌مصنوعی (AI Ghost & Fill Bots)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">فعال‌سازی پرکردن خودکار لابی با ربات</label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={botSettings.autoFillEnabled}
                    onChange={(e) => setBotSettings({ ...botSettings, autoFillEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>تکمیل ظرفیت اتاق پس از مهلت انتظار</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">مهلت انتظار برای انسان قبل از اسپاون ربات (ثانیه)</label>
              <input
                type="number"
                value={botSettings.spawnWaitSeconds}
                onChange={(e) => setBotSettings({ ...botSettings, spawnWaitSeconds: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">پیش‌فرض ۵ ثانیه</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">سرعت ربات تازه‌کار (Novice WPM)</label>
              <input
                type="number"
                value={botSettings.noviceWpm}
                onChange={(e) => setBotSettings({ ...botSettings, noviceWpm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">سرعت ربات متوسط (Intermediate WPM)</label>
              <input
                type="number"
                value={botSettings.intermediateWpm}
                onChange={(e) => setBotSettings({ ...botSettings, intermediateWpm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">سرعت ربات استاد (Master WPM)</label>
              <input
                type="number"
                value={botSettings.masterWpm}
                onChange={(e) => setBotSettings({ ...botSettings, masterWpm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">سرعت ربات فوق‌پیشرفته (Alien WPM)</label>
              <input
                type="number"
                value={botSettings.alienWpm}
                onChange={(e) => setBotSettings({ ...botSettings, alienWpm: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره پارامترهای ربات‌ها</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Anticheat Settings */}
      {activeTab === 'anticheat' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-600" />
            <span>تنظیمات سامانه ضدتقلب و سنسورهای بیومتریک (Typing DNA Anticheat)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">سقف سرعت مجاز انسانی (WPM Cap Alert)</label>
              <input
                type="number"
                value={anticheatSettings.wpmCapAlert}
                onChange={(e) => setAnticheatSettings({ ...anticheatSettings, wpmCapAlert: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">سرعت‌های بالاتر از این سقف به صف بازبینی ضدتقلب می‌روند (پیش‌فرض: ۱۸۰ WPM)</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">حداقل واریانس فاصله ضربات کلید (میلی‌ثانیه)</label>
              <input
                type="number"
                value={anticheatSettings.zeroVarianceThresholdMs}
                onChange={(e) => setAnticheatSettings({ ...anticheatSettings, zeroVarianceThresholdMs: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">شناسایی ماکروها و نرم‌افزارهای خودکار تزریق متن (ربات‌های دسکتاپ)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
            <span className="font-bold block mb-1">هشدار امنیتی:</span>
            کلیه ضربات ارسالی بازیکنان در سرور بک‌اند با امضای رمزی WebSocket هش شده و زمان هر ضربه با دقت نانوثانیه در دیتابیس لاگ می‌گردد تا در اعتراضات داوری قابل استناد باشد.
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره سیاست‌های ضدتقلب</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
