'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  Users,
  Swords,
  Sparkles,
  AlertCircle,
  Vote,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Award,
  ChevronRight,
  Eye,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WeeklyTournamentConfig,
  TournamentPlayer,
  BracketMatch,
  INITIAL_WEEKLY_TOURNAMENT,
  getStoredTournamentConfig,
  saveStoredTournamentConfig,
  getCalculatedWeeklyPhase,
  getWinningSlot,
  generateDynamicBracket,
  MIN_TOURNAMENT_PARTICIPANTS,
} from '@/data/tournamentData';

export default function AdminTournamentsCmsPage() {
  const [config, setConfig] = useState<WeeklyTournamentConfig>(INITIAL_WEEKLY_TOURNAMENT);
  const [activeTab, setActiveTab] = useState<'text_settings' | 'voting' | 'bracket' | 'players'>('text_settings');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerCity, setNewPlayerCity] = useState('');
  const [newPlayerWpm, setNewPlayerWpm] = useState(95);
  const [newPlayerSlot, setNewPlayerSlot] = useState<'afternoon' | 'night'>('night');

  useEffect(() => {
    const loaded = getStoredTournamentConfig();
    setConfig(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveConfig = () => {
    saveStoredTournamentConfig(config);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    showToast('تنظیمات و متن رسمی تورنمنت با موفقیت در سیستم ذخیره و منتشر شد.');
  };

  const handleResetToDefault = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمامی داده‌ها و متن مسابقه را به تنظیمات اولیه بازنشانی کنید؟')) {
      setConfig(INITIAL_WEEKLY_TOURNAMENT);
      saveStoredTournamentConfig(INITIAL_WEEKLY_TOURNAMENT);
      showToast('داده‌های تورنمنت به حالت پیش‌فرض بازنشانی شدند.');
    }
  };

  const activePhase = getCalculatedWeeklyPhase(config.forcedPhase);
  const winningSlotInfo = getWinningSlot(config);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newP: TournamentPlayer = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      city: newPlayerCity.trim() || 'تهران',
      avgWpm: Number(newPlayerWpm) || 90,
      accuracy: 98.5,
      carSkin: 'Desert Falcon',
      preferredSlot: newPlayerSlot,
      status: 'registered',
    };

    const updatedPlayers = [...config.registeredPlayers, newP];
    const updatedMatches = generateDynamicBracket(updatedPlayers);
    const updated = {
      ...config,
      registeredPlayers: updatedPlayers,
      matches: updatedMatches,
      votesAfternoon: newPlayerSlot === 'afternoon' ? config.votesAfternoon + 1 : config.votesAfternoon,
      votesNight: newPlayerSlot === 'night' ? config.votesNight + 1 : config.votesNight,
    };
    setConfig(updated);
    saveStoredTournamentConfig(updated);
    setNewPlayerName('');
    setNewPlayerCity('');
    showToast(`شرکت‌کننده «${newP.name}» با موفقیت افزوده شد.`);
  };

  const handleRemovePlayer = (id: string) => {
    const p = config.registeredPlayers.find((x) => x.id === id);
    if (!p) return;
    const updatedPlayers = config.registeredPlayers.filter((x) => x.id !== id);
    const updatedMatches = generateDynamicBracket(updatedPlayers);
    const updated = {
      ...config,
      registeredPlayers: updatedPlayers,
      matches: updatedMatches,
      votesAfternoon: p.preferredSlot === 'afternoon' ? Math.max(0, config.votesAfternoon - 1) : config.votesAfternoon,
      votesNight: p.preferredSlot === 'night' ? Math.max(0, config.votesNight - 1) : config.votesNight,
    };
    setConfig(updated);
    saveStoredTournamentConfig(updated);
    showToast(`شرکت‌کننده «${p.name}» حذف شد.`);
  };

  const handleSetWinner = (matchId: string, winnerId: string) => {
    const updatedMatches = config.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          winnerId,
          status: 'completed' as const,
        };
      }
      return m;
    });

    let champion = config.champion;
    if (matchId === 'gf-1') {
      champion = config.registeredPlayers.find((p) => p.id === winnerId) || champion;
    }

    const updated = {
      ...config,
      matches: updatedMatches,
      champion,
    };
    setConfig(updated);
    saveStoredTournamentConfig(updated);
    showToast('نتیجه مسابقه با موفقیت ثبت شد.');
  };

  return (
    <div className="space-y-8 font-sans" dir="rtl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                مدیریت تورنمنت هفتگی و براکت‌های حذفی دوتایی
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                کنترل متن رقابت تایپ، زمان‌بندی هفتگی (ثبت‌نام پنجشنبه/جمعه، مسابقه شنبه بعدازظهر یا شب) و درخت مسابقات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>بازنشانی پیش‌فرض</span>
          </button>

          <Link
            href="/tournaments"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition"
          >
            <Eye className="w-4 h-4" />
            <span>مشاهده صفحه عمومی</span>
          </Link>

          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تغییرات</span>
          </button>
        </div>
      </div>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Phase */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block">فاز فعلی تورنمنت در سامانه</span>
          <div className="flex items-center justify-between">
            <span
              className={`font-black text-sm px-3 py-1 rounded-xl ${
                activePhase === 'registration'
                  ? 'bg-blue-100 text-blue-800'
                  : activePhase === 'live'
                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activePhase === 'registration'
                ? 'ثبت‌نام و نظرسنجی (پنج‌شنبه و جمعه)'
                : activePhase === 'live'
                ? 'مسابقه زنده (شنبه)'
                : 'پایان‌یافته / نتایج قهرمان'}
            </span>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-500 block">
            حالت تنظیم: {config.forcedPhase === 'auto' ? 'خودکار بر اساس تقویم واقعی' : 'اجبار دستی ادمین'}
          </span>
        </div>

        {/* Card 2: Time Slot Winner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block">زمان مسابقه شنبه (بر اساس آرا)</span>
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-slate-900">{winningSlotInfo.label}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between">
            <span>اکثریت آرا ({winningSlotInfo.percentage}٪)</span>
            <span className="text-rose-600 font-bold">صبح ممنوع است</span>
          </div>
        </div>

        {/* Card 3: Total Votes */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block">مشارکت در نظرسنجی ساعت</span>
          <div className="flex items-center justify-between">
            <span className="font-black text-lg text-slate-900 font-mono">
              {winningSlotInfo.totalVotes} رأی
            </span>
            <Vote className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span>بعدازظهر: {config.votesAfternoon}</span>
            <span>•</span>
            <span>شب: {config.votesNight}</span>
          </div>
        </div>

        {/* Card 4: Registered Contestants */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block">ورزشکاران براکت</span>
          <div className="flex items-center justify-between">
            <span className="font-black text-lg text-slate-900 font-mono">
              {config.registeredPlayers.length} نفر
            </span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-500 block">
            قهرمان فعلی: {config.champion ? config.champion.name : 'در حال رقابت'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('text_settings')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'text_settings'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>متن رسمی مسابقه و مشخصات اصلی</span>
        </button>

        <button
          onClick={() => setActiveTab('voting')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'voting'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>نظرسنجی ساعت برگزاری (بعدازظهر / شب)</span>
        </button>

        <button
          onClick={() => setActiveTab('bracket')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'bracket'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>مدیریت براکت حذفی دوگانه (Double Elimination)</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'players'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>لیست شرکت‌کنندگان ({config.registeredPlayers.length})</span>
        </button>
      </div>

      {/* TAB 1: Text & Core Settings */}
      {activeTab === 'text_settings' && (
        <div className="space-y-6">
          {/* Official Tournament Text Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>متن رسمی مسابقه تایپ این هفته (Passage Text)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  این متن برای تمامی شرکت‌کنندگان در براکت‌های مسابقه اعمال شده و سرعت و دقت افراد با آن سنجیده می‌شود.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-600">
                <span>تعداد کلمات: {config.typingText.trim().split(/\s+/).filter(Boolean).length}</span>
                <span>•</span>
                <span>تعداد حروف: {config.typingText.length}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1.5">
                محتوای متن مسابقه (امکان ویرایش آزاد ادمین):
              </label>
              <textarea
                rows={5}
                value={config.typingText}
                onChange={(e) => setConfig({ ...config, typingText: e.target.value })}
                className="w-full p-4 rounded-2xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
                placeholder="متن مسابقه هفتگی را اینجا بنویسید یا ویرایش کنید..."
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>نکته مهم داوری:</strong> رعایت فاصله‌ها، نیم‌فاصله‌ها و علائم نگارشی در این متن، مستقیماً به عنوان الگوی طلایی تصحیح خودکار موتور تایپ در سرور و کلاینت قرار می‌گیرد.
              </span>
            </div>
          </div>

          {/* Tournament Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>اطلاعات عنوان و دوره‌های هفتگی</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان تورنمنت هفتگی</label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">شماره هفته</label>
                    <input
                      type="number"
                      value={config.weekNumber}
                      onChange={(e) => setConfig({ ...config, weekNumber: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">فصل برگزاری</label>
                    <input
                      type="text"
                      value={config.seasonFa}
                      onChange={(e) => setConfig({ ...config, seasonFa: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    کنترل وضعیت هفتگی مسابقه (چرخه هفتگی)
                  </label>
                  <select
                    value={config.forcedPhase}
                    onChange={(e) =>
                      setConfig({ ...config, forcedPhase: e.target.value as WeeklyTournamentConfig['forcedPhase'] })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    <option value="auto">
                      ⚡ خودکار بر اساس تقویم واقعی (پنج‌شنبه و جمعه: ثبت‌نام | شنبه: مسابقه | مابقی: آرشیو و نتایج)
                    </option>
                    <option value="registration">
                      📝 اجبار فاز ثبت‌نام و رأی‌گیری ساعت مسابقه (شبیه‌ساز پنج‌شنبه و جمعه)
                    </option>
                    <option value="live">
                      🔥 اجبار فاز مسابقه زنده و اجرای براکت‌ها (شبیه‌ساز روز شنبه)
                    </option>
                    <option value="completed">
                      🏆 اجبار فاز نتایج نهایی و قهرمان هفته (شبیه‌ساز یکشنبه تا چهارشنبه)
                    </option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    در حالت «خودکار»، سیستم به صورت هوشمند بر اساس روز جاری هفته عمل می‌کند. در حالت اجبار می‌توانید هر فاز را فوراً بررسی فرمایید.
                  </p>
                </div>
              </div>
            </div>

            {/* Prize Pool Configuration */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>جوایز نقدی و امتیازات هفتگی</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مجموع جوایز نقدی هفتگی</label>
                  <input
                    type="text"
                    value={config.prizePool}
                    onChange={(e) => setConfig({ ...config, prizePool: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">جایزه نفر اول (قهرمان هفته)</label>
                  <input
                    type="text"
                    value={config.firstPrize}
                    onChange={(e) => setConfig({ ...config, firstPrize: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">جایزه نفر دوم (نایب قهرمان)</label>
                  <input
                    type="text"
                    value={config.secondPrize}
                    onChange={(e) => setConfig({ ...config, secondPrize: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">جایزه مقام سوم مشترک</label>
                  <input
                    type="text"
                    value={config.thirdPrize}
                    onChange={(e) => setConfig({ ...config, thirdPrize: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Voting & Slot Controls */}
      {activeTab === 'voting' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Vote className="w-4 h-4 text-blue-600" />
                <span>تنظیمات و نتایج نظرسنجی ساعت برگزاری مسابقه شنبه</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                بر اساس دستورالعمل رسمی، مسابقه شنبه به هیچ وجه در نوبت صبح برگزار نمی‌شود و زمان نهایی صرفاً بین دو گزینه «بعدازظهر» و «شب» با رأی شرکت‌کنندگان مشخص می‌گردد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Afternoon Box */}
              <div
                className={`p-5 rounded-2xl border-2 transition ${
                  winningSlotInfo.slot === 'afternoon'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">گزینه اول: بعدازظهر</span>
                  {winningSlotInfo.slot === 'afternoon' && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      برنده فعلی آرا
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">بازه زمانی: {config.afternoonTimeLabel}</p>

                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">تعداد آرا:</label>
                  <input
                    type="number"
                    value={config.votesAfternoon}
                    onChange={(e) =>
                      setConfig({ ...config, votesAfternoon: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-24 p-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setConfig({ ...config, votesAfternoon: config.votesAfternoon + 10 })}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100"
                    >
                      +۱۰
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, votesAfternoon: Math.max(0, config.votesAfternoon - 10) })}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100"
                    >
                      -۱۰
                    </button>
                  </div>
                </div>
              </div>

              {/* Night Box */}
              <div
                className={`p-5 rounded-2xl border-2 transition ${
                  winningSlotInfo.slot === 'night'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">گزینه دوم: شب</span>
                  {winningSlotInfo.slot === 'night' && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      برنده فعلی آرا
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">بازه زمانی: {config.nightTimeLabel}</p>

                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">تعداد آرا:</label>
                  <input
                    type="number"
                    value={config.votesNight}
                    onChange={(e) =>
                      setConfig({ ...config, votesNight: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-24 p-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setConfig({ ...config, votesNight: config.votesNight + 10 })}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100"
                    >
                      +۱۰
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, votesNight: Math.max(0, config.votesNight - 10) })}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold hover:bg-slate-100"
                    >
                      -۱۰
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Bar preview */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>بعدازظهر ({Math.round((config.votesAfternoon / (winningSlotInfo.totalVotes || 1)) * 100)}٪)</span>
                <span>شب ({Math.round((config.votesNight / (winningSlotInfo.totalVotes || 1)) * 100)}٪)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                <div
                  style={{
                    width: `${Math.round((config.votesAfternoon / (winningSlotInfo.totalVotes || 1)) * 100)}%`,
                  }}
                  className="bg-amber-500 h-full transition-all duration-500"
                />
                <div
                  style={{
                    width: `${Math.round((config.votesNight / (winningSlotInfo.totalVotes || 1)) * 100)}%`,
                  }}
                  className="bg-blue-600 h-full transition-all duration-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <strong>وضعیت قطعی زمان مسابقه شنبه:</strong>{' '}
                <span className="text-slate-900 font-black">{winningSlotInfo.label}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                بر اساس رأی شرکت‌کنندگان ثبت‌نامی روزهای پنج‌شنبه و جمعه
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Double-Elimination Bracket CMS */}
      {activeTab === 'bracket' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-600" />
                  <span>مدیریت و داوری بازی‌های براکت دوگانه (Winners / Losers / Grand Final)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ثبت برنده، تعیین وضعیت (در حال برگزاری / پایان‌یافته) و پایش تله‌متری هر مسابقه.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Quick randomize / simulate realistic matches
                    const simMatches = config.matches.map((m) => {
                      const p1wpm = Math.floor(95 + Math.random() * 25);
                      const p2wpm = Math.floor(95 + Math.random() * 25);
                      const win = p1wpm >= p2wpm ? m.p1.id : m.p2.id;
                      return {
                        ...m,
                        p1Score: p1wpm,
                        p2Score: p2wpm,
                        winnerId: win,
                        status: 'completed' as const,
                      };
                    });
                    const finalMatch = simMatches.find((m) => m.id === 'gf-1');
                    const champ = config.registeredPlayers.find((p) => p.id === finalMatch?.winnerId) || config.champion;
                    const updated = { ...config, matches: simMatches, champion: champ };
                    setConfig(updated);
                    saveStoredTournamentConfig(updated);
                    showToast('شبیه‌سازی کامل نتایج براکت با موفقیت انجام شد.');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  🎲 شبیه‌سازی هوشمند راندها
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {config.matches.map((m) => {
                const winnerPlayer = config.registeredPlayers.find((p) => p.id === m.winnerId);
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {m.id.toUpperCase()}
                        </span>
                        <span className="font-black text-slate-900">{m.roundNameFa}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">{m.scheduledTime}</span>
                    </div>

                    {/* Players & Scores */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`flex-1 p-2.5 rounded-xl border text-center transition ${
                          m.winnerId === m.p1.id
                            ? 'bg-emerald-50 border-emerald-300 font-black text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="font-bold">{m.p1.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {m.p1Score ? `${m.p1Score} WPM` : '---'}
                        </div>
                      </div>

                      <span className="font-black text-slate-400">VS</span>

                      <div
                        className={`flex-1 p-2.5 rounded-xl border text-center transition ${
                          m.winnerId === m.p2.id
                            ? 'bg-emerald-50 border-emerald-300 font-black text-emerald-950'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="font-bold">{m.p2.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {m.p2Score ? `${m.p2Score} WPM` : '---'}
                        </div>
                      </div>
                    </div>

                    {/* Winner Selection Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSetWinner(m.id, m.p1.id)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] transition ${
                          m.winnerId === m.p1.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        برد {m.p1.name.split(' ')[0]}
                      </button>

                      <button
                        onClick={() => handleSetWinner(m.id, m.p2.id)}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] transition ${
                          m.winnerId === m.p2.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        برد {m.p2.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Registered Players */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          {/* Add New Player Form */}
          <form
            onSubmit={handleAddPlayer}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs"
          >
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>ثبت شرکت‌کننده جدید در براکت این هفته</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پارسا نوری"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شهر</label>
                <input
                  type="text"
                  placeholder="مثال: تهران"
                  value={newPlayerCity}
                  onChange={(e) => setNewPlayerCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">میانگین سرعت (WPM)</label>
                <input
                  type="number"
                  value={newPlayerWpm}
                  onChange={(e) => setNewPlayerWpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رأی زمان مسابقه شنبه</label>
                <select
                  value={newPlayerSlot}
                  onChange={(e) => setNewPlayerSlot(e.target.value as 'afternoon' | 'night')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                >
                  <option value="afternoon">بعدازظهر (۱۷ الی ۱۹)</option>
                  <option value="night">شب (۲۱ الی ۲۳)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black transition shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن به براکت مسابقات</span>
              </button>
            </div>
          </form>

          {/* Players Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>لیست شرکت‌کنندگان تأییدشده ({config.registeredPlayers.length})</span>
              <span className="text-xs text-slate-400 font-normal">
                ثبت‌نام پنج‌شنبه و جمعه انجام می‌شود
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="py-3 px-2">نام مسابقه‌دهنده</th>
                    <th className="py-3 px-2">شهر</th>
                    <th className="py-3 px-2">سرعت ریتینگ</th>
                    <th className="py-3 px-2">دقت</th>
                    <th className="py-3 px-2">رأی زمان شنبه</th>
                    <th className="py-3 px-2">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.registeredPlayers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-2 font-black text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{p.city || 'ایران'}</td>
                      <td className="py-3 px-2 font-mono font-bold text-blue-600">{p.avgWpm} WPM</td>
                      <td className="py-3 px-2 font-mono text-emerald-600">{p.accuracy}%</td>
                      <td className="py-3 px-2 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${
                            p.preferredSlot === 'night'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.preferredSlot === 'night' ? 'شب (۲۱:۰۰)' : 'بعدازظهر (۱۷:۰۰)'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleRemovePlayer(p.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="حذف شرکت‌کننده"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
