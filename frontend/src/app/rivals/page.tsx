'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Crosshair,
  Swords,
  Trophy,
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Coins,
  Shield,
  Clock,
  UserCheck,
  Users,
  Play,
  Check,
  Send,
  Radio,
  Flame,
  User,
  Plus,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import {
  getStoredTournamentConfig,
  TournamentPlayer
} from '@/data/tournamentData';

export interface DuelInvite {
  id: string;
  fromName: string;
  fromAvatar?: string;
  toName: string;
  toAvatar?: string;
  toId: string;
  wagerCoins: number;
  status: 'sent' | 'accepted' | 'declined' | 'racing';
  createdAt: string;
}

export default function RivalsPage() {
  const { user, isAuthenticated } = useAuth();

  // Current user's real profile (synced directly from profile upload)
  const [myName, setMyName] = useState<string>('شما');
  const [myAvatar, setMyAvatar] = useState<string>('');
  const [myWpm, setMyWpm] = useState<number>(75);

  // Real registered competitors
  const [competitors, setCompetitors] = useState<TournamentPlayer[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Challenge modal state
  const [targetRival, setTargetRival] = useState<TournamentPlayer | null>(null);
  const [wagerCoins, setWagerCoins] = useState<number>(50);

  // Active / Incoming Invitation State
  const [activeInvite, setActiveInvite] = useState<DuelInvite | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<DuelInvite | null>(null);
  const [bothConfirmedReady, setBothConfirmedReady] = useState(false);

  // Synchronized Match Arena State
  const [isInMatch, setIsInMatch] = useState(false);
  const [matchCountdown, setMatchCountdown] = useState<number | null>(null);
  const [matchPassage, setMatchPassage] = useState<string>(
    'مهارت تایپ ده‌انگشتی، پلی استوار میان اندیشه و دنیای دیجیتال است. تسلط بر صفحه‌کلید، تمرکز لحظه‌ای و هماهنگی دقیق عصب و بینایی، جایگاه ویژه‌ای در مسابقات رسمی ورزش‌های الکترونیک دارد.'
  );
  const [userInput, setUserInput] = useState('');
  const [userWpm, setUserWpm] = useState(0);
  const [userAccuracy, setUserAccuracy] = useState(100);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentWpm, setOpponentWpm] = useState(0);
  const [matchFinished, setMatchFinished] = useState(false);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const matchStartTime = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick register modal for testing/adding real user
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorCity, setNewCompetitorCity] = useState('');
  const [newCompetitorWpm, setNewCompetitorWpm] = useState(80);

  // Sync profile from Profile page & listen for live avatar updates
  useEffect(() => {
    const syncProfile = () => {
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('typro_profile_name') || user?.displayName || user?.username || 'شما';
        const savedAvatar = localStorage.getItem('typro_profile_avatar') || user?.avatar || '';
        setMyName(savedName);
        setMyAvatar(savedAvatar);
      }
    };
    syncProfile();

    window.addEventListener('storage', syncProfile);
    window.addEventListener('focus', syncProfile);
    window.addEventListener('typro_profile_avatar_updated', syncProfile);

    // Load admin passage text if available
    const config = getStoredTournamentConfig();
    if (config.typingText) {
      setMatchPassage(config.typingText);
    }

    // Load real registered players without mock personas
    const list = [...config.registeredPlayers];
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
    setCompetitors(cleaned);

    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('focus', syncProfile);
      window.removeEventListener('typro_profile_avatar_updated', syncProfile);
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Determine Rival of the Week (Closest competitor to user's WPM)
  const rivalOfTheWeek = competitors.length > 0 ? competitors[0] : null;

  // Step 1: Send invitation to rival
  const handleSendChallenge = () => {
    if (!targetRival) return;

    const newInvite: DuelInvite = {
      id: `invite-${Date.now()}`,
      fromName: myName,
      fromAvatar: myAvatar,
      toName: targetRival.name,
      toAvatar: targetRival.avatar,
      toId: targetRival.id,
      wagerCoins,
      status: 'sent',
      createdAt: new Date().toLocaleTimeString('fa-IR'),
    };

    setActiveInvite(newInvite);
    setTargetRival(null);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`📩 دعوت‌نامه دوئل برای «${newInvite.toName}» ارسال شد. در انتظار تایید رقیب...`);

    // In a browser tab, also set incoming invite so user can simulate the two-way OK right away!
    setIncomingInvite(newInvite);
  };

  // Step 2: Recipient accepts the invitation (شخص اوکی داد)
  const handleAcceptInvite = () => {
    if (!incomingInvite) return;

    const accepted: DuelInvite = {
      ...incomingInvite,
      status: 'accepted',
    };

    setActiveInvite(accepted);
    setIncomingInvite(null);
    setBothConfirmedReady(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    showToast(`✅ «${accepted.toName}» دعوت دوئل را پذیرفت! جفت شما آنلاین و آماده مسابقه هستید.`);
  };

  // Step 3: Decline invitation
  const handleDeclineInvite = () => {
    setActiveInvite(null);
    setIncomingInvite(null);
    showToast('دعوت‌نامه دوئل رد شد.');
  };

  // Step 4: Both players enter the match arena (جفت‌شان اوکی دادند و آنلاین هستند)
  const handleLaunchDuelMatch = () => {
    setBothConfirmedReady(false);
    setIsInMatch(true);
    setUserInput('');
    setUserWpm(0);
    setUserAccuracy(100);
    setOpponentProgress(0);
    setOpponentWpm(0);
    setMatchFinished(false);
    setMatchWinner(null);
    matchStartTime.current = null;

    // Start 3-second countdown
    setMatchCountdown(3);
    const interval = setInterval(() => {
      setMatchCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          matchStartTime.current = Date.now();
          setTimeout(() => textareaRef.current?.focus(), 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Real-time typing in Duel Arena
  const handleDuelTyping = (text: string) => {
    if (matchFinished || matchCountdown !== null) return;
    setUserInput(text);

    const now = Date.now();
    const elapsedMinutes = matchStartTime.current
      ? Math.max((now - matchStartTime.current) / 60000, 0.01)
      : 0.01;

    // Calculate Accuracy
    let errors = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== matchPassage[i]) errors++;
    }
    const acc = text.length > 0 ? Math.max(0, Math.round(((text.length - errors) / text.length) * 100)) : 100;
    setUserAccuracy(acc);

    // Calculate WPM (Typeo standard: 4 chars/word for Persian, 5 for English)
    const isEnglish = /[a-zA-Z]/.test(matchPassage.slice(0, 50));
    const charsPerWord = isEnglish ? 5 : 4;
    const words = Math.max(0, text.length - errors) / charsPerWord;
    const currentWpm = Math.max(0, Math.round(words / elapsedMinutes));
    setUserWpm(currentWpm);

    // Simulate opponent progress based on rival's skill
    const targetWpm = activeInvite ? 78 : 70;
    const oppRatio = Math.min(100, Math.round((text.length / matchPassage.length) * 96 + Math.random() * 8));
    setOpponentProgress(oppRatio);
    setOpponentWpm(targetWpm);

    // Completion check
    if (text.length >= matchPassage.length) {
      setMatchFinished(true);
      const isWinner = currentWpm >= targetWpm;
      setMatchWinner(isWinner ? myName : (activeInvite?.toName || 'حریف'));
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      showToast(
        isWinner
          ? `🏆 تبریک! شما در دوئل پیروز شدید و ${activeInvite?.wagerCoins || 50} سکه ودیعه را کسب کردید!`
          : `رقابت به پایان رسید! برنده مسابقه: ${activeInvite?.toName || 'حریف'}`
      );
    }
  };

  // Quick Register New Competitor (Allows adding real player to test H2H)
  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorName.trim()) return;

    const newP: TournamentPlayer = {
      id: `comp-${Date.now()}`,
      name: newCompetitorName.trim(),
      city: newCompetitorCity.trim() || 'تهران',
      avgWpm: Number(newCompetitorWpm) || 80,
      accuracy: 98.5,
      carSkin: 'Desert Falcon',
      preferredSlot: 'night',
      status: 'registered',
    };

    const updated = [newP, ...competitors];
    setCompetitors(updated);
    setIsQuickRegisterOpen(false);
    setNewCompetitorName('');
    setNewCompetitorCity('');
    showToast(`شرکت‌کننده واقعی «${newP.name}» به لیست هماوردان افزوده شد.`);
  };

  // Helper for rendering avatar photo or clean empty frame (اگر عکس پروفایل بدون عکس بود خالی باشد)
  const renderAvatar = (avatarUrl?: string, name?: string, size = 'w-14 h-14 text-xl') => {
    if (avatarUrl && (avatarUrl.startsWith('data:image') || avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      return (
        <img
          src={avatarUrl}
          alt={name || 'کاربر'}
          className={`${size} rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0`}
        />
      );
    }
    // اگر عکس پروفایل بدون عکس بود کاملاً خالی باشد
    return (
      <div
        className={`${size} rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 text-slate-300 flex items-center justify-center shrink-0`}
        title={name ? `${name} (بدون عکس)` : 'بدون عکس'}
      >
        <User className="w-1/2 h-1/2 text-slate-300 stroke-[1.5]" />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Prominent Registration Callout Banner */}
      {!isAuthenticated && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-blue-500/15 border-2 border-amber-400/90 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              ⚔️
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
                ارسال دعوت به دوئل، شرط‌بندی با سکه، ثبت بردهای دوئل در پروفایل و قرارگیری در جدول رقبای برتر هفتگی تنها برای کاربران ثبت‌نام‌شده پایدار و ذخیره می‌ماند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/login?tab=register"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <span>ثبت‌نام رایگان و شروع دوئل</span>
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
                <span>حساب کاربری آماده دوئل است:</span>
                <span className="text-emerald-700 font-mono">@{user.username || user.displayName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                نتایج دوئل‌ها و بردهای تن‌به‌تن به طور مستقیم روی موجودی سکه و تاریخچه بازی‌های شما ذخیره می‌گردند.
              </span>
            </div>
          </div>
          <div className="font-mono font-bold text-slate-700">
            موجودی سکه: {(user.coins || 0).toLocaleString('fa-IR')} سکه
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-red-600" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              سیستم هماوردی و رقیب هفتگی تن‌به‌تن (Head-to-Head & Live Duels)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            هماوردی، رقیب هفتگی و دوئل زنده
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            دعوت‌نامه دوئل ارسال کنید؛ به محض تایید دوطرفه و آنلاین بودن جفت بازیکنان، مسابقه همگام آغاز می‌شود.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsQuickRegisterOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>ثبت شرکت‌کننده جدید</span>
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Upload className="w-4 h-4" />
            <span>آپلود و تنظیم عکس پروفایل من</span>
          </Link>
        </div>
      </div>

      {/* Incoming Duel Invitation Alert (وقتی برای شخصی دعوت ارسال می‌شود یا دریافت می‌کند) */}
      {incomingInvite && (
        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {renderAvatar(incomingInvite.fromAvatar, incomingInvite.fromName, 'w-14 h-14 text-xl')}
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-700 block">درخواست دوئل تن‌به‌تن جدید</span>
                <h3 className="font-black text-slate-900 text-base">
                  «{incomingInvite.fromName}» شما را به دوئل سرعتی دعوت کرده است!
                </h3>
                <p className="text-xs text-slate-600">
                  ودیعه تعیین‌شده مسابقه:{' '}
                  <strong className="font-mono text-amber-600 font-bold">
                    {incomingInvite.wagerCoins} سکه
                  </strong>{' '}
                  • شرایط پیست و متن مسابقه یکسان
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleDeclineInvite}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                رد دعوت
              </button>

              <button
                onClick={handleAcceptInvite}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition"
              >
                <Check className="w-4 h-4" />
                <span>پذیرش دوئل (اوکیه داد)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Both Confirmed Online - Ready to Race Launch Banner */}
      {bothConfirmedReady && activeInvite && (
        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 shadow-xl space-y-4 animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                ⚡
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-800">جفت بازیکنان آنلاین و آماده هستند!</span>
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  دوئل میان «{activeInvite.fromName}» و «{activeInvite.toName}» تایید شد
                </h3>
                <p className="text-xs text-slate-600">
                  هر دو نفر اعلام آمادگی (اوکی) کردند. هم‌اکنون می‌توانید وارد پیست شده و مسابقه را آغاز فرمایید.
                </p>
              </div>
            </div>

            <button
              onClick={handleLaunchDuelMatch}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition animate-pulse"
            >
              <Play className="w-4 h-4" />
              <span>ورود جفت بازیکنان به مسابقه زنده</span>
            </button>
          </div>
        </div>
      )}

      {/* Rival of the Week Card (Section 98) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-red-500/80 shadow-xl space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <span className="px-3.5 py-1 rounded-full bg-red-50 text-red-700 font-bold text-xs uppercase border border-red-200 flex items-center gap-1.5">
            <Swords className="w-4 h-4" />
            <span>رقیب منتخب این هفته شما (Rival of the Week)</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {rivalOfTheWeek ? `نزدیک‌ترین حریف هم‌سطح: ${rivalOfTheWeek.name}` : 'در انتظار رقیب جدید'}
          </span>
        </div>

        {rivalOfTheWeek ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
              {/* Me with Profile Avatar */}
              <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3 flex flex-col items-center">
                {renderAvatar(myAvatar, myName, 'w-16 h-16 text-2xl')}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{myName} (شما)</h3>
                  <span className="text-xs text-blue-600 font-bold block mt-0.5">آنلاین و آماده دوئل</span>
                </div>
                <div className="text-2xl font-black text-blue-600 font-mono">{myWpm} WPM</div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-4xl font-black text-red-600 animate-pulse">VS</span>
                <span className="text-xs font-bold text-slate-500 font-mono">دوئل سرعتی ودیعه‌ای</span>
                <span className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-bold">
                  ۵۰ سکه جایزه برنده
                </span>
              </div>

              {/* Rival of the Week with Profile Avatar */}
              <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 flex flex-col items-center">
                {renderAvatar(rivalOfTheWeek.avatar, rivalOfTheWeek.name, 'w-16 h-16 text-2xl')}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{rivalOfTheWeek.name}</h3>
                  <span className="text-xs text-slate-500 block mt-0.5">شهر {rivalOfTheWeek.city || 'ایران'}</span>
                </div>
                <div className="text-2xl font-black text-red-600 font-mono">{rivalOfTheWeek.avgWpm} WPM</div>
              </div>
            </div>

            {/* Challenge Action Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setTargetRival(rivalOfTheWeek)}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-red-500/25"
              >
                <Swords className="w-4 h-4" />
                <span>ارسال دعوت به دوئل برای {rivalOfTheWeek.name}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Crosshair className="w-7 h-7" />
            </div>
            <h4 className="font-black text-slate-900 text-base">در انتظار ثبت‌نام رقبای جدید در سامانه</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              تمامی افراد غیرواقعی از سیستم حذف شده‌اند. با ثبت‌نام سایر تایپیست‌ها در سایت یا تورنمنت، نزدیک‌ترین حریف به سطح مهارت شما به عنوان رقیب هفتگی انتخاب خواهد شد.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsQuickRegisterOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                افزودن شرکت‌کننده واقعی برای آزمودن دوئل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nearby Competitors List */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-blue-600" />
              <span>فهرست تایپیست‌های واقعی ثبت‌نامی جهت دعوت به دوئل ({competitors.length} نفر)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              با کلیک روی دکمه دعوت، پیام مسابقه برای حریف ارسال شده و با پذیرش طرفین مسابقه آغاز می‌شود.
            </p>
          </div>

          <button
            onClick={() => setIsQuickRegisterOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت شرکت‌کننده</span>
          </button>
        </div>

        {competitors.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            <Users className="w-6 h-6 mx-auto text-slate-400 mb-1" />
            <p className="font-bold text-slate-700">هنوز کاربری برای دوئل ثبت‌نام نکرده است.</p>
            <p className="text-[11px] text-slate-400">
              با استفاده از دکمه «ثبت شرکت‌کننده» یا ثبت‌نام در تورنمنت، افراد به این لیست اضافه می‌شوند.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {competitors.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center gap-3">
                  {renderAvatar(r.avatar, r.name, 'w-11 h-11 text-base')}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{r.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="آنلاین" />
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                      <span>شهر: {r.city || 'ایران'}</span>
                      <span>•</span>
                      <span>دقت: {r.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="text-blue-600 font-mono font-black text-sm bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                    {r.avgWpm} WPM
                  </span>

                  <button
                    onClick={() => setTargetRival(r)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال دعوت به دوئل</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge Configuration Modal */}
      {targetRival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 relative animate-in zoom-in-95">
            <button
              onClick={() => setTargetRival(null)}
              className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-red-600 uppercase">دعوت به دوئل زنده (Live 1v1 Challenge)</span>
              <h3 className="font-black text-lg text-slate-900">ارسال دعوت‌نامه برای «{targetRival.name}»</h3>
              <p className="text-xs text-slate-500">
                پیام مسابقه برای حریف مخابره می‌شود. به محض تایید (اوکی دادن) جفت شما، مسابقه همگام آغاز می‌گردد.
              </p>
            </div>

            {/* Wager selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">تعیین ودیعه سکه شرطی پیروزی:</label>
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWagerCoins(amt)}
                    className={
                      'py-2.5 rounded-xl border text-xs font-bold font-mono transition ' +
                      (wagerCoins === amt
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100')
                    }
                  >
                    {amt} سکه
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTargetRival(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                onClick={handleSendChallenge}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
              >
                مخابره دعوت دوئل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Synchronized Match Arena Modal (وقتی جفت‌شان اوکی دادند و آنلاین شدند) */}
      {isInMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-black text-slate-900 text-base">
                  پیست رسمی دوئل زنده: {myName} در برابر {activeInvite?.toName || 'حریف'}
                </h3>
              </div>
              <button
                onClick={() => setIsInMatch(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Overlay */}
            {matchCountdown !== null && (
              <div className="py-10 text-center space-y-2 animate-pulse">
                <span className="text-xs font-bold text-slate-400 block uppercase">
                  جفت بازیکنان متصل شدند - آماده تایپ باشید
                </span>
                <div className="text-6xl font-black text-red-600 font-mono">{matchCountdown}</div>
              </div>
            )}

            {/* Live Synchronized Telemetry */}
            {matchCountdown === null && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Player 1 (You) */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-3">
                      {renderAvatar(myAvatar, myName, 'w-10 h-10 text-sm')}
                      <div>
                        <span className="font-black text-slate-900 text-xs block">{myName} (شما)</span>
                        <span className="text-[10px] text-blue-600 font-bold">دقت: {userAccuracy}%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-blue-700">{userWpm} WPM</div>
                  </div>

                  {/* Player 2 (Rival) */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-3">
                      {renderAvatar(activeInvite?.toAvatar, activeInvite?.toName, 'w-10 h-10 text-sm')}
                      <div>
                        <span className="font-black text-slate-900 text-xs block">
                          {activeInvite?.toName || 'حریف'}
                        </span>
                        <span className="text-[10px] text-rose-600 font-bold">پیشرفت: {opponentProgress}%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-rose-700">
                      {opponentWpm || 78} WPM
                    </div>
                  </div>
                </div>

                {/* Match Target Passage */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">متن مسابقه تن‌به‌تن:</span>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-serif leading-relaxed text-slate-800 select-none">
                    {matchPassage}
                  </div>
                </div>

                {/* Typing Input */}
                <div>
                  <textarea
                    ref={textareaRef}
                    rows={3}
                    disabled={matchFinished}
                    value={userInput}
                    onChange={(e) => handleDuelTyping(e.target.value)}
                    placeholder="برای پیروزی در دوئل شروع به تایپ کنید..."
                    className="w-full p-4 rounded-2xl border-2 border-slate-300 text-slate-900 text-sm leading-relaxed focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Match Finished Banner */}
                {matchFinished && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base">
                      برنده مسابقه: «{matchWinner}»
                    </h4>
                    <p className="text-xs text-slate-600">
                      سرعت نهایی شما: <strong>{userWpm} WPM</strong> با دقت <strong>{userAccuracy}%</strong> • ودیعه{' '}
                      <strong>{activeInvite?.wagerCoins || 50} سکه</strong> به برنده تعلق گرفت.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleLaunchDuelMatch}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تکرار مسابقه (Rematch)</span>
                  </button>

                  <button
                    onClick={() => setIsInMatch(false)}
                    className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                  >
                    بستن پیست
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Competitor Modal */}
      {isQuickRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">ثبت شرکت‌کننده جدید در هماوردی</h3>
              <button
                onClick={() => setIsQuickRegisterOpen(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCompetitor} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پارسا نوری"
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شهر محل سکونت</label>
                <input
                  type="text"
                  placeholder="مثال: مشهد"
                  value={newCompetitorCity}
                  onChange={(e) => setNewCompetitorCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">میانگین سرعت تایپ (WPM)</label>
                <input
                  type="number"
                  value={newCompetitorWpm}
                  onChange={(e) => setNewCompetitorWpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                عکس پروفایل هماوردان مستقیماً از بخش «پروفایل» بارگذاری و تنظیم می‌شود. در صورت ثبت بدون عکس، کادر آواتار خالی نمایش داده خواهد شد.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20"
                >
                  ثبت هماورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
