'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Trophy,
  Flame,
  Plus,
  Award,
  ArrowLeft,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Coins,
  MessageSquare,
  Send,
  Zap,
  Swords,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

export interface Club {
  id: string;
  name: string;
  level: number;
  membersCount: number;
  totalWins: number;
  averageWpm: number;
  leader: string;
  badge: string;
  rank: number;
  description?: string;
  minWpm?: number;
  isPrivate?: boolean;
  treasury: number;
  perks: string[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  time: string;
  text: string;
  wpm: number;
}

const STORAGE_KEY = 'typro_registered_clubs';
const STORAGE_CHAT_KEY = 'typro_club_chat_messages';

export default function ClubsPage() {
  const { user, isAuthenticated } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<Record<string, 'member' | 'pending'>>({});
  const [filterQuery, setFilterQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Treasury donation state
  const [donationAmount, setDonationAmount] = useState<number>(500);

  // Clan Chat State - Clean without fake personas
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatInput, setNewChatInput] = useState('');

  // New club form state
  const [newClubName, setNewClubName] = useState('');
  const [newClubBadge, setNewClubBadge] = useState('🚀');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubMinWpm, setNewClubMinWpm] = useState(50);
  const [isClubPrivate, setIsClubPrivate] = useState(false);

  const availableBadges = ['⚡', '✒️', '💻', '🚀', '🏆', '🦁', '🦅', '🔥', '🛡️', '🎯'];

  // Load registered clubs & chat from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out any legacy fake names
          const filtered = parsed.filter(
            (c: Club) =>
              c.leader !== 'محمدرضا کاظمی' &&
              c.leader !== 'سارا کاویانی' &&
              c.leader !== 'امیرحسین نوری' &&
              c.leader !== 'نیما سهرابی'
          );
          setClubs(filtered);
        }
      }
      const storedChat = localStorage.getItem(STORAGE_CHAT_KEY);
      if (storedChat) {
        const parsedChat = JSON.parse(storedChat);
        if (Array.isArray(parsedChat)) {
          setChatMessages(parsedChat);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleJoinRequest = (club: Club) => {
    if (joinedClubs[club.id] === 'member') {
      showToast(`شما در حال حاضر عضو فعال کلوب «${club.name}» هستید.`);
      return;
    }
    if (joinedClubs[club.id] === 'pending') {
      showToast(`درخواست عضویت شما برای کلوب «${club.name}» در انتظار تأیید سرپرست است.`);
      return;
    }

    setJoinedClubs((prev) => ({ ...prev, [club.id]: 'pending' }));
    showToast(`✅ درخواست عضویت شما در کلوب «${club.name}» برای ${club.leader} ارسال شد.`);
  };

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    const myName = user?.displayName || user?.username || 'شما (سرپرست)';

    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      level: 1,
      membersCount: 1,
      totalWins: 0,
      averageWpm: newClubMinWpm,
      leader: myName,
      badge: newClubBadge,
      rank: clubs.length + 1,
      description: newClubDesc.trim() || 'کلوب تازه‌تاسیس قهرمانان تایپ ایران.',
      minWpm: newClubMinWpm,
      isPrivate: isClubPrivate,
      treasury: 1000,
      perks: ['تاسیس اولیه انجمن'],
    };

    const updated = [newClub, ...clubs];
    setClubs(updated);
    setJoinedClubs((prev) => ({ ...prev, [newClub.id]: 'member' }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setIsCreateModalOpen(false);
    setNewClubName('');
    setNewClubDesc('');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast(`🎉 تبریک! کلوب رسمی «${newClub.name}» با سرپرستی ${myName} با موفقیت تاسیس شد.`);
  };

  const handleDonateToTreasury = () => {
    if (clubs.length === 0) return;
    const targetClub = clubs[0];
    const updated = clubs.map((c) =>
      c.id === targetClub.id ? { ...c, treasury: c.treasury + donationAmount } : c
    );
    setClubs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setIsTreasuryModalOpen(false);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    showToast(`🪙 با سپاس! مبلغ ${donationAmount.toLocaleString('fa-IR')} سکه به خزانه کلوب افزوده گردید.`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;

    const myName = user?.displayName || user?.username || 'کاربر رسمی';
    const msg: ChatMessage = {
      id: String(Date.now()),
      sender: myName,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      text: newChatInput.trim(),
      wpm: 80,
    };

    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(updated));
    setNewChatInput('');
  };

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.leader.toLowerCase().includes(filterQuery.toLowerCase())
  );

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
              🛡️
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
                تاسیس کلوب اختصاصی، عضویت در تیم‌های مسابقات، شرکت در نبردهای تیمی ۴۸ ساعته، اهدای سکه به خزانه و گفتگو در چت تیمی تنها با داشتن حساب کاربری فعال امکان‌پذیر و قابل ذخیره‌سازی است.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/login?tab=register"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <span>ثبت‌نام رایگان و ایجاد کلوب</span>
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
                <span>حساب کاربری شما فعال است:</span>
                <span className="text-emerald-700 font-mono">@{user.username || user.displayName}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                شما می‌توانید به کلوب‌ها ملحق شده یا به عنوان سرپرست تیم اختصاصی خود را پایه‌گذاری نمایید.
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
          <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>سیستم انجمن‌ها و نبردهای تیمی کلوب‌ها (Clubs & Team Battles)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            کلوب‌های تایپ و لیگ تیمی (Club vs Club & Treasury)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            پایگاه رسمی انجمن‌ها و تیم‌های تایپ: تیم خود را بسازید، در جنگ‌های تیمی ۴۸ ساعته رقابت کنید و خزانه مشترک را ارتقا دهید.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsChatDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>چت اختصاصی کلوب ({chatMessages.length})</span>
          </button>

          <button
            onClick={() => setIsTreasuryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs hover:bg-amber-100 transition shadow-xs"
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span>خزانه کلوب</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>تاسیس کلوب جدید</span>
          </button>
        </div>
      </div>

      {/* What can users do in this page - Educational Feature Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-slate-900 text-base sm:text-lg">
              راهنمای کلوب‌ها و لیگ تیمی: در این بخش چه کارهایی می‌توانید انجام دهید؟
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            کلوب‌ها بستر مسابقات گروهی، پیشرفت تیمی و دریافت پاداش‌های ارزنده‌تر در پلتفرم تایپرو هستند:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Create or Join */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:border-blue-300 hover:bg-blue-50/30 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
              🛡️
            </div>
            <h3 className="font-black text-slate-900 text-sm">۱. تاسیس یا عضویت در کلوب</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              می‌توانید با انتخاب نام، نشان گرافیکی و حداقل سرعت ورودی (WPM)، سرپرست تیم اختصاصی خود شوید یا به کلوب‌های موجود درخواست عضویت دهید.
            </p>
          </div>

          {/* Card 2: Club Wars */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:border-amber-300 hover:bg-amber-50/30 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-lg">
              ⚔️
            </div>
            <h3 className="font-black text-slate-900 text-sm">۲. نبردهای تیمی ۴۸ ساعته</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              با شرکت در مسابقات زنده پیست و کسب رکوردهای سرعتی، برای کلوب خود امتیاز تیمی ثبت کنید تا جایزه ۲۰,۰۰۰ سکه‌ای و تندیس لیگ هفتگی را ببرید.
            </p>
          </div>

          {/* Card 3: Treasury & Perks */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:border-emerald-300 hover:bg-emerald-50/30 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
              🪙
            </div>
            <h3 className="font-black text-slate-900 text-sm">۳. ارتقای خزانه و بوست‌ها</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              اعضا می‌توانند سکه‌های مازاد خود را به خزانه مشترک واریز کنند تا پرک‌های ویژه مانند بوست ۱۵٪ XP، ظرفیت اعضا و بنر طلایی پیست فعال گردد.
            </p>
          </div>

          {/* Card 4: Team Chat */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:border-purple-300 hover:bg-purple-50/30 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
              💬
            </div>
            <h3 className="font-black text-slate-900 text-sm">۴. چت و هماهنگی تیمی</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              از طریق پنجره چت اختصاصی، با هم‌تیمی‌های خود گفتگو کنید، رکوردهای تایپ را تحلیل کرده و برای ساعت برگزاری تورنمنت‌ها هماهنگ شوید.
            </p>
          </div>
        </div>
      </div>

      {/* Club vs Club War Arena Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black text-amber-400 tracking-wider">
              میدان جنگ کلوب‌ها (Club Wars): نبرد تیمی هفتگی
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono">
              وضعیت: {clubs.length >= 2 ? 'نبرد فعال' : 'در انتظار ثبت‌نام حداقل ۲ تیم'}
            </span>
          </div>
        </div>

        {clubs.length >= 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center relative z-10">
            <div className="p-6 rounded-2xl bg-slate-800/80 border-2 border-blue-500/50 space-y-2 shadow-lg shadow-blue-500/10">
              <span className="text-4xl block">{clubs[0].badge}</span>
              <h3 className="font-extrabold text-base text-slate-100">{clubs[0].name}</h3>
              <div className="text-2xl font-black text-blue-400 font-mono">{clubs[0].treasury} سکه خزانه</div>
              <span className="text-[11px] text-slate-400 block">
                سرپرست: {clubs[0].leader} • {clubs[0].membersCount} عضو
              </span>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-2xl font-black text-amber-400 animate-pulse">
                VS
              </div>
              <span className="text-xs text-amber-300 font-bold bg-amber-950/40 border border-amber-900/60 px-3 py-1 rounded-xl">
                جایزه فاتح: ۲۰,۰۰۰ سکه + تندیس لیگ
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2 hover:border-purple-500/50 transition">
              <span className="text-4xl block">{clubs[1].badge}</span>
              <h3 className="font-extrabold text-base text-slate-100">{clubs[1].name}</h3>
              <div className="text-2xl font-black text-purple-400 font-mono">{clubs[1].treasury} سکه خزانه</div>
              <span className="text-[11px] text-slate-400 block">
                سرپرست: {clubs[1].leader} • {clubs[1].membersCount} عضو
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/10 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⚔️
            </div>
            <h3 className="text-base font-black text-white">در انتظار آغاز اولین نبرد تیمی کلوب‌ها</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              برای آغاز مسابقات نبرد تیمی ۴۸ ساعته، حضور حداقل ۲ کلوب ثبت‌نامی در سامانه نیاز است.
              با تاسیس کلوب، تیم خود را برای رقابت بر سر تندیس قهرمانی و جایزه ۲۰,۰۰۰ سکه‌ای آماده کنید!
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition shadow-md"
              >
                تاسیس اولین کلوب رسمی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Clubs Directory & Leaderboard */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>فهرست و رده‌بندی ملی کلوب‌های ثبت‌نامی ({clubs.length} کلوب)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              رتبه‌بندی تیم‌های رسمی بر اساس پیروزی‌ها، سرعت اعضا و خزانه
            </p>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="جستجوی کلوب یا نام سرپرست..."
              className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {clubs.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-base">اولین کلوب رسمی تایپ را شما تاسیس کنید!</h4>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              هنوز تیمی در فصل جاری ثبت نشده است. با ساخت کلوب، سرپرست اولین تیم رسمی کشور شوید، نشان اختصاصی خود را برگزینید و دوستانتان را برای آغاز نبردهای تیمی دعوت نمایید.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition mt-2 shadow-sm"
            >
              تاسیس اولین کلوب رسمی
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClubs.map((c) => {
              const userState = joinedClubs[c.id];
              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-xs">
                      {c.badge}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-xs text-slate-400">#{c.rank}</span>
                        <h3 className="font-extrabold text-sm text-slate-900">{c.name}</h3>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                          سطح {c.level}
                        </span>
                        {c.isPrivate && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                            خصوصی
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl">{c.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-600">
                        <span>سرپرست: <strong className="text-slate-900">{c.leader}</strong></span>
                        <span>•</span>
                        <span>اعضا: <strong>{c.membersCount} نفر</strong></span>
                        <span>•</span>
                        <span>میانگین سرعت: <strong className="font-mono text-blue-600">{c.averageWpm} WPM</strong></span>
                        <span>•</span>
                        <span>خزانه: <strong className="font-mono text-amber-600">{c.treasury.toLocaleString('fa-IR')} سکه</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {userState === 'member' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        عضو فعال
                      </span>
                    ) : userState === 'pending' ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                        در انتظار تایید
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(c)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                      >
                        درخواست عضویت
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Club Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-sm">چت هماهنگی اعضای کلوب</h3>
              </div>
              <button
                onClick={() => setIsChatDrawerOpen(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  هنوز پیامی در چت ارسال نشده است. اولین پیام را شما ارسال کنید!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{msg.sender}</span>
                      <span className="text-slate-400 font-mono">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-700">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ارسال</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Treasury Modal */}
      {isTreasuryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-base">واریز به خزانه کلوب</h3>
              </div>
              <button
                onClick={() => setIsTreasuryModalOpen(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              با واریز سکه به خزانه کلوب، امتیاز تیمی شما در نبردهای تیمی افزایش یافته و پرک‌های اختصاصی آزاد می‌گردد.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">انتخاب مبلغ واریزی:</label>
              <div className="grid grid-cols-3 gap-2">
                {[200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition ${
                      donationAmount === amt
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {amt.toLocaleString('fa-IR')} سکه
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsTreasuryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                onClick={handleDonateToTreasury}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20"
              >
                تایید واریز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Club Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">تاسیس کلوب رسمی تایپ</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نام کلوب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شاهین‌های تیزپا"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نشان یا آیکون کلوب</label>
                <div className="flex flex-wrap gap-2">
                  {availableBadges.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setNewClubBadge(b)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition ${
                        newClubBadge === b ? 'border-blue-600 bg-blue-50 shadow-xs' : 'border-slate-200 bg-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات و اهداف کلوب</label>
                <textarea
                  rows={2}
                  value={newClubDesc}
                  onChange={(e) => setNewClubDesc(e.target.value)}
                  placeholder="توضیح کوتاه درباره اهداف تیم و شرایط عضویت..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">حداقل سرعت ورودی (WPM)</label>
                <input
                  type="number"
                  value={newClubMinWpm}
                  onChange={(e) => setNewClubMinWpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20"
                >
                  ثبت و تاسیس کلوب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
