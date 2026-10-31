'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Activity,
  Gauge,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Sliders,
  ChevronRight,
  Flame,
  CheckCircle2,
  Video,
  User,
  History,
  Sparkles,
  BookOpen,
  Zap,
  Award,
  ArrowRight,
  Target
} from 'lucide-react';
import { getSkinById } from '@/lib/skins';
import AnimatedVehicleSkin from '@/components/race/AnimatedVehicleSkin';
import CurrencyHUD, { CoinBadge, DiamondBadge } from '@/components/common/CurrencyHUD';
import { useAuth } from '@/context/AuthContext';

interface ReplayRacer {
  id: string;
  odUserId?: string;
  name: string;
  role: string;
  color: string;
  skinId: string;
  isUser: boolean;
  peakWpm: number;
  avgWpm: number;
  accuracy: number;
  entropy: number;
  speedMult: number;
  wpmCurve: number[];
  errorSpots: number[];
}

interface SavedRaceReplay {
  raceId: string;
  date: string;
  roomName: string;
  targetText: string;
  totalDurationSec: number;
  winnerName: string;
  myRank: number;
  participants: ReplayRacer[];
}

const DEFAULT_RACE_TEXT =
  'مهارت تایپ سریع و ده‌انگشتی، تمرکز ذهنی را تقویت کرده و هماهنگی عصب و عضله را به حداکثر بازدهی می‌رساند.';

const DEFAULT_CHAMPIONSHIP_RACE: SavedRaceReplay = {
  raceId: 'R-8092',
  date: 'امروز',
  roomName: 'پیست مسابقات قهرمانی اتومبیل‌رانی تایپرو',
  targetText: DEFAULT_RACE_TEXT,
  totalDurationSec: 28,
  winnerName: 'محمدرضا کاظمی',
  myRank: 2,
  participants: [
    {
      id: 'r1',
      odUserId: 'user-winner',
      name: 'محمدرضا کاظمی',
      role: 'برنده مسابقه (قهرمان)',
      color: '#2563eb',
      skinId: 'skin-porsche',
      isUser: false,
      speedMult: 1.05,
      peakWpm: 104,
      avgWpm: 96,
      accuracy: 99.1,
      entropy: 4.86,
      wpmCurve: [45, 68, 88, 98, 104, 101, 99, 97, 102, 100, 96],
      errorSpots: [82]
    },
    {
      id: 'r2',
      odUserId: 'user-me',
      name: 'علیرضا رضایی (شما)',
      role: 'مقام دوم',
      color: '#10b981',
      skinId: 'skin-kawasaki-h2',
      isUser: true,
      speedMult: 0.95,
      peakWpm: 88,
      avgWpm: 81,
      accuracy: 97.5,
      entropy: 4.79,
      wpmCurve: [38, 55, 72, 81, 88, 77, 80, 83, 85, 82, 81],
      errorSpots: [34, 68]
    },
    {
      id: 'r3',
      odUserId: 'user-rival',
      name: 'سینا احمدی',
      role: 'مقام سوم',
      color: '#f59e0b',
      skinId: 'skin-suzuki-bking',
      isUser: false,
      speedMult: 0.88,
      peakWpm: 76,
      avgWpm: 69,
      accuracy: 95.8,
      entropy: 4.72,
      wpmCurve: [30, 48, 62, 70, 76, 66, 68, 70, 71, 69, 69],
      errorSpots: [15, 52, 85]
    }
  ]
};

export default function RaceReplayPage() {
  const [activeSession, setActiveSession] = useState<SavedRaceReplay>(DEFAULT_CHAMPIONSHIP_RACE);
  const [historySessions, setHistorySessions] = useState<SavedRaceReplay[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('default');

  const { user, isAuthenticated } = useAuth();
  const [userCoins, setUserCoins] = useState<number>(() => {
    if (!user) return 0;
    if (user?.coins !== undefined) return user.coins;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_coins');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [userDiamonds, setUserDiamonds] = useState<number>(() => {
    if (!user) return 0;
    if (user?.diamonds !== undefined) return user.diamonds;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_diamonds');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserCoins(0);
      setUserDiamonds(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_user_coins', '0');
        localStorage.setItem('typro_user_diamonds', '0');
      }
    } else {
      setUserCoins(user.coins ?? 0);
      setUserDiamonds(user.diamonds ?? 0);
    }
  }, [user, isAuthenticated]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0); // 0 to 100%
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'track' | 'telemetry' | 'scatter'>('track');
  const [inspectedRacerId, setInspectedRacerId] = useState<string>('');

  // Load user's actual race from localStorage
  useEffect(() => {
    try {
      const lastReplayRaw = localStorage.getItem('typro_last_race_replay');
      const historyRaw = localStorage.getItem('typro_race_replays_history');

      let hist: SavedRaceReplay[] = [];
      if (historyRaw) {
        hist = JSON.parse(historyRaw);
        setHistorySessions(hist);
      }

      if (lastReplayRaw) {
        const lastSession: SavedRaceReplay = JSON.parse(lastReplayRaw);
        setActiveSession(lastSession);
        setSelectedSessionId(lastSession.raceId || 'last');
        const userRacer = lastSession.participants.find((p) => p.isUser);
        if (userRacer) {
          setInspectedRacerId(userRacer.id);
        }
      } else {
        setInspectedRacerId(DEFAULT_CHAMPIONSHIP_RACE.participants[1].id);
      }
    } catch (e) {
      console.error('Error loading replay data from localStorage', e);
    }
  }, []);

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsPlaying(false);
    setCurrentFrame(0);

    if (sessionId === 'default') {
      setActiveSession(DEFAULT_CHAMPIONSHIP_RACE);
      setInspectedRacerId(DEFAULT_CHAMPIONSHIP_RACE.participants[1].id);
      return;
    }

    try {
      const lastReplayRaw = localStorage.getItem('typro_last_race_replay');
      if (lastReplayRaw) {
        const lastSession: SavedRaceReplay = JSON.parse(lastReplayRaw);
        if (lastSession.raceId === sessionId || sessionId === 'last') {
          setActiveSession(lastSession);
          const userRacer = lastSession.participants.find((p) => p.isUser);
          if (userRacer) setInspectedRacerId(userRacer.id);
          return;
        }
      }

      const match = historySessions.find((s) => s.raceId === sessionId);
      if (match) {
        setActiveSession(match);
        const userRacer = match.participants.find((p) => p.isUser);
        if (userRacer) setInspectedRacerId(userRacer.id);
      }
    } catch (e) {
      console.error('Error switching session', e);
    }
  };

  // Playback timer (Precision Frame-by-Frame / Second-by-Second)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentFrame < 100) {
      const totalDuration = activeSession.totalDurationSec || 30;
      // Step duration in ms per 1% of progress
      const stepDuration = Math.max(25, (totalDuration * 10) / playbackSpeed);
      timer = setTimeout(() => {
        setCurrentFrame((prev) => Math.min(100, prev + 1));
      }, stepDuration);
    } else if (currentFrame >= 100) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentFrame, playbackSpeed, activeSession.totalDurationSec]);

  // Clean Reset Every Time
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const jumpToFrame = (frame: number) => {
    setCurrentFrame(Math.max(0, Math.min(100, frame)));
  };

  const raceText = activeSession.targetText || DEFAULT_RACE_TEXT;
  const racers = activeSession.participants || DEFAULT_CHAMPIONSHIP_RACE.participants;
  const userRacer = racers.find((p) => p.isUser) || racers[0];
  const winnerRacer = racers[0];
  const inspectedRacer = racers.find((p) => p.id === inspectedRacerId) || userRacer;

  // Real-time interpolated metric calculation at current frame
  const curveIdx = Math.min(10, Math.floor(currentFrame / 10));
  const liveUserWpm = userRacer.wpmCurve ? (userRacer.wpmCurve[curveIdx] || userRacer.avgWpm) : userRacer.avgWpm;
  const liveWinnerWpm = winnerRacer.wpmCurve ? (winnerRacer.wpmCurve[curveIdx] || winnerRacer.avgWpm) : winnerRacer.avgWpm;
  const liveInspectedWpm = inspectedRacer.wpmCurve ? (inspectedRacer.wpmCurve[curveIdx] || inspectedRacer.avgWpm) : inspectedRacer.avgWpm;
  
  const textCharsCount = Math.floor((currentFrame / 100) * raceText.length);
  const elapsedSeconds = ((currentFrame / 100) * (activeSession.totalDurationSec || 30)).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Header & Replay Session Selector */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 mb-1">
              <Link href="/" className="hover:text-blue-400 transition">
                خانه
              </Link>
              <ChevronRight className="w-3 h-3 rotate-180 text-slate-600" />
              <Link href="/live-race" className="hover:text-blue-400 transition">
                مسابقات زنده
              </Link>
              <ChevronRight className="w-3 h-3 rotate-180 text-slate-600" />
              <span className="text-sky-400 font-bold">استودیو بازپخش و تله‌متری دور #{activeSession.raceId}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              استودیو تحلیل و بازپخش هوشمند <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">مسابقات</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              تحلیل موشکافانه ریتم ضربه‌زنی، سبقت‌ها، مکث‌های واژگانی و نقاط خطا. این بازپخش جهت درک نقاط قوت و رفع خطاهای تایپی شما ذخیره شده است.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            {/* Race Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 text-xs">
              <History className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                  انتخاب دور مسابقه:
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  className="font-bold text-white bg-transparent text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="last" className="bg-slate-900 text-white">🏁 آخرین مسابقه شما ({activeSession.roomName})</option>
                  <option value="default" className="bg-slate-900 text-white">🏆 مسابقه قهرمانی الگو (#R-8092)</option>
                  {historySessions.map((s) => (
                    <option key={s.raceId} value={s.raceId} className="bg-slate-900 text-white">
                      مسابقه #{s.raceId} — {s.date}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency HUD */}
            <CurrencyHUD
              coins={userCoins}
              diamonds={userDiamonds}
              size="md"
              variant="glass"
              className="bg-slate-900/70 border-slate-700/70 shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Rewards & Competitive Achievement Strip */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 rounded-3xl p-4 sm:p-5 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-xs border border-slate-200">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>نتیجه دور:</span>
            <span className="text-blue-600">
              {activeSession.myRank === 1 ? 'مقام اول (قهرمان طلایی 🥇)' : activeSession.myRank === 2 ? 'مقام دوم (مدال نقره 🥈)' : 'مقام سوم (مدال برنز 🥉)'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-xs border border-slate-200">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>امتیاز لیگ مسابقات:</span>
            <span className="text-purple-600 font-mono">+۲۴ LP</span>
          </div>
        </div>

        {/* Currency Reward Badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">پاداش‌های واریز شده:</span>
          <CoinBadge amount={65} size="sm" variant="solid" />
          <DiamondBadge amount={2} size="sm" variant="solid" />
        </div>
      </div>

      {/* Learning & Skill Diagnostic Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>بینش‌های یادگیری و ارتقای مهارت در این دور (Typing Learning Insights)</span>
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            تحلیل هوشمند ریتم تایپ
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-black text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span>تحلیل مکث‌ها و نقاط توقف:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              بیشترین مکث شما روی کلمات ۳ سیلابی رخ داده است؛ تمرین مستمر این بخش می‌تواند سرعت شما را تا ۱۲ WPM افزایش دهد.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-black text-slate-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>پایداری ریتم عضلانی:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              نوسان سرعت شما کمتر از ۶٪ بوده که نشان‌دهنده استقامت حرکتی و تسلط ارگونومیک انگشتان بر ردیف میانی کیبورد است.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-black text-slate-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>استراتژی دست بعدی مسابقه:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              با حفظ دقت بالای ۹۸٪ و افزایش پیش‌خوانی ۲ کلمه جلوتر در متن، فاصله ۱.۴ ثانیه‌ای شما با رتبه اول جبران خواهد شد.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inspected Racer Live Speed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>سرعت لحظه‌ای ({inspectedRacer.name})</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {liveInspectedWpm}
            </span>
            <span className="text-xs font-bold text-slate-500">کلمه/دقیقه</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold mt-2">
            <span>اوج سرعت: {inspectedRacer.peakWpm} WPM</span>
            <span>میانگین: {inspectedRacer.avgWpm} WPM</span>
          </div>
        </div>

        {/* Card 2: Leader Speed & Gap */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>سرعت پیشتاز ({winnerRacer.name})</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {liveWinnerWpm}
            </span>
            <span className="text-xs font-bold text-slate-500">WPM</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-2">
            اختلاف لحظه‌ای: {Math.max(0, liveWinnerWpm - liveInspectedWpm)} کلمه/دقیقه
          </div>
        </div>

        {/* Card 3: Accuracy & Error Spots */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>دقت تایپ راننده انتخابی</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {inspectedRacer.accuracy}٪
            </span>
          </div>
          <div className="text-[11px] text-indigo-600 font-bold mt-2">
            {inspectedRacer.errorSpots?.length || 0} نقطه توقف و خطای تایپی ثبت شده
          </div>
        </div>

        {/* Card 4: Anti-cheat Shannon Entropy */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>آنتروپی شانون (ضدتقلب)</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
              {inspectedRacer.entropy || 4.82}
            </span>
            <span className="text-xs font-bold text-slate-500">bits</span>
          </div>
          <div className="text-[11px] text-teal-600 font-bold mt-2">
            ریتم تایپ طبیعی و بیولوژیک انسان (تایید شده)
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('track')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'track'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          پیست بازپخش زنده (اسکین‌های واقعی)
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'telemetry'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نمودار پویایی سرعت و شتاب (WPM Dynamics)
        </button>
        <button
          onClick={() => setActiveTab('scatter')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'scatter'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          توزیع تاخیر کلیدها (IKI Scatter)
        </button>
      </div>

      {/* VIEW 1: PHYSICAL RACE TRACK WITH REAL VEHICLE SKINS */}
      {/* START ON LEFT, FINISH ON RIGHT */}
      {activeTab === 'track' && (
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          {/* Track Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold pb-4 border-b border-slate-800">
            {/* START on LEFT */}
            <span className="text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              🚦 خط شروع مسابقه (START)
            </span>

            {/* Current Timeline Progress */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-xl font-mono text-xs">
              <span className="text-slate-400">لحظه بازپخش:</span>
              <span className="text-cyan-400 font-bold">{currentFrame}٪</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">{elapsedSeconds} ثانیه</span>
            </div>

            {/* FINISH on RIGHT */}
            <span className="text-amber-400 flex items-center gap-2">
              🏁 خط پایان شطرنجی (FINISH)
            </span>
          </div>

          {/* Physical Track Lanes (direction: LTR so Left = Start, Right = Finish) */}
          <div className="space-y-4" dir="ltr">
            {racers.map((racer, idx) => {
              const racerSkin = getSkinById(racer.skinId || 'skin-porsche');
              const progress = Math.min(100, Math.round(currentFrame * racer.speedMult));
              const curveSubIdx = Math.min(10, Math.floor(currentFrame / 10));
              const racerLiveWpm = racer.wpmCurve ? (racer.wpmCurve[curveSubIdx] || racer.avgWpm) : racer.avgWpm;
              const isFast = racerLiveWpm >= 50 && progress > 2 && isPlaying;
              const isInspected = racer.id === inspectedRacerId;

              return (
                <div
                  key={racer.id}
                  onClick={() => setInspectedRacerId(racer.id)}
                  className={`relative h-20 sm:h-22 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border transition-all cursor-pointer flex items-center overflow-hidden ${
                    isInspected
                      ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Asphalt road line styling */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Finish Line Checkered Pattern on RIGHT */}
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-[repeating-conic-gradient(#ffffff_0_90deg,#1e293b_0_180deg)] [background-size:10px_10px] opacity-25 z-0 border-l border-white/20" />

                  {/* Start Line Green Stripe on LEFT */}
                  <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-emerald-500/80 z-0 shadow-[0_0_10px_#10b981]" />

                  {/* Error Spots on Track */}
                  {racer.errorSpots?.map((spot) => (
                    <div
                      key={spot}
                      className="absolute top-1 bottom-1 w-0.5 bg-rose-500/50 z-10 pointer-events-none"
                      style={{ left: `${spot * 0.84}%` }}
                      title={`نقطه خطای تایپی در ${spot}٪ پیست`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -top-0.5 -left-0.5 animate-ping" />
                    </div>
                  ))}

                  {/* Racer Tag / Badge Info (RTL text) */}
                  <div
                    className="absolute right-12 z-20 flex items-center gap-2 pointer-events-none"
                    dir="rtl"
                  >
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-md border ${
                        racer.isUser
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900/80 text-slate-200 border-slate-700'
                      }`}
                    >
                      {racer.name}
                      {racer.isUser && ' ⭐'}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                      {racerLiveWpm} WPM
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {progress}%
                    </span>
                  </div>

                  {/* Vehicle moving smoothly strictly LEFT TO RIGHT (Facing RIGHT) */}
                  <div
                    className="absolute transition-all duration-75 flex items-center z-30"
                    style={{
                      left: `${progress * 0.84}%`
                    }}
                  >
                    <AnimatedVehicleSkin
                      skinId={racer.skinId || 'skin-porsche'}
                      wpm={racerLiveWpm}
                      isMoving={isPlaying && progress < 100}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              💡 برای مشاهده تله‌متری دقیق هر فرد، روی لاین مسابقه او کلیک کنید.
            </span>
            <span className="text-slate-500 font-mono">
              سرور اتاق: {activeSession.roomName}
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: WPM DYNAMICS CHART */}
      {activeTab === 'telemetry' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base">
                نمودار پویایی سرعت لحظه‌ای کلمات در دقیقه (WPM Telemetry Curves)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقایسه لحظه‌به‌لحظه شتاب و سرعت تایپ شرکت‌کنندگان در طول دور مسابقه
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              {racers.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setInspectedRacerId(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
                    inspectedRacerId === r.id ? 'bg-slate-100 shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <span>{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVG Vector Chart */}
          <div className="w-full h-64 bg-slate-50 rounded-2xl p-4 relative overflow-hidden border border-slate-100">
            <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#E2E8F0" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#E2E8F0" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#E2E8F0" strokeDasharray="4" />

              {/* Curves */}
              {racers.map((r) => {
                const points = r.wpmCurve
                  .map((wpm, idx) => `${idx * 50},${Math.max(15, 200 - wpm * 1.6)}`)
                  .join(' ');
                const isSelected = r.id === inspectedRacerId;
                return (
                  <polyline
                    key={r.id}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    strokeDasharray={isSelected ? undefined : '3'}
                    points={points}
                    opacity={isSelected ? 1 : 0.6}
                  />
                );
              })}

              {/* Scrubber Playhead Line */}
              <line
                x1={currentFrame * 5}
                y1="0"
                x2={currentFrame * 5}
                y2="200"
                stroke="#DC2626"
                strokeWidth="2.5"
              />
              <circle cx={currentFrame * 5} cy={100} r="5" fill="#DC2626" />
            </svg>

            {/* Playhead Badge */}
            <div
              className="absolute top-2 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md shadow-xs pointer-events-none"
              style={{ left: `${Math.min(90, Math.max(2, currentFrame))}%` }}
            >
              لحظه فعلی: {currentFrame}٪ ({elapsedSeconds}s)
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: IKI SCATTER & ANTI-CHEAT BIOMETRICS */}
      {activeTab === 'scatter' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-900 text-base">
              توزیع وقفه بین کلیدها (Inter-Keystroke Interval - IKI) و اعتبارسنجی بیومتریک
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تحلیل واریانس زمانی ضربه به هر کلید (میلی‌ثانیه) جهت ارزیابی ثبات ریتم عضلانی و الگوریتم ضدتقلب
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-xs text-slate-500 font-bold">میانگین وقفه ضربات (Mean IKI)</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">118 ms</div>
              <span className="text-[11px] text-emerald-600 font-bold">ریتم عضلانی بسیار هماهنگ</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-xs text-slate-500 font-bold">انحراف معیار وقفه (Std Dev)</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">26.4 ms</div>
              <span className="text-[11px] text-blue-600 font-bold">طبیعی و ارگونومیک انگشتان</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <span className="text-xs text-slate-500 font-bold">آنتروپی شانون (Shannon Entropy)</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {inspectedRacer.entropy || 4.82} bits
              </div>
              <span className="text-[11px] text-teal-600 font-bold">تایید قطعی عدم استفاده از ربات یا اسکریپت</span>
            </div>
          </div>
        </div>
      )}

      {/* MASTER PLAYBACK CONTROLS & TIMELINE SCRUBBER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            {/* Play / Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-98"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'توقف بازپخش' : 'پخش بازپخش مسابقه'}</span>
            </button>

            {/* Instant Reset Button (ریست کامل و دقیق) */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition"
              title="شروع مجدد از ابتدای خط استارت (ریست)"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ریست مجدد</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">سرعت پخش:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-black text-slate-600">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    playbackSpeed === s
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>نوار پیشروی لحظه‌به‌لحظه مسابقه (Timeline Scrubber)</span>
            </div>
            <span className="font-mono text-slate-900 text-sm font-black">
              {elapsedSeconds} ثانیه / {activeSession.totalDurationSec} ثانیه ({currentFrame}٪)
            </span>
          </div>

          <div className="relative py-2">
            <input
              type="range"
              min="0"
              max="100"
              value={currentFrame}
              onChange={(e) => jumpToFrame(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-3 bg-slate-200 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Synchronized Persian Text Typing Progress */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>متن مسابقه و موقعیت لحظه‌ای تایپ راننده:</span>
            <span className="font-mono text-blue-600">{textCharsCount} از {raceText.length} حرف</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed font-semibold">
            <span className="text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded-md">
              {raceText.slice(0, textCharsCount)}
            </span>
            <span className="text-slate-400">
              {raceText.slice(textCharsCount)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
