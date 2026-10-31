'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Trophy, Play, Plus, Search, Filter, Gauge, Sparkles, 
  Lock, Unlock, Eye, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';

interface Room {
  id: string;
  title: string;
  topic: string;
  mode: string;
  language: 'fa' | 'en';
  capacity: number;
  onlineUsers: number;
  activeRacers: number;
  averageWpm: number;
  trackTheme: string;
  status: 'ACTIVE' | 'COUNTDOWN' | 'LOBBY';
  isPrivate: boolean;
  pinCode?: string;
  hasBots: boolean;
  hostName: string;
}

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'fa' | 'en' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [passwordModalRoom, setPasswordModalRoom] = useState<Room | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const initialRooms: Room[] = [
    {
      id: 'room-101',
      title: 'کورس سرعتی متون فناوری و هوش مصنوعی',
      topic: 'فناوری و مهارت',
      mode: '60Classic',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Cyber City',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور مرکزی تایپرو',
    },
    {
      id: 'room-102',
      title: 'رقابت متون ادبی و اشعار نغز فارسی',
      topic: 'ادبیات فارسی',
      mode: 'Perfect Race',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Persian-inspired',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور ادبیات پارسی',
    },
    {
      id: 'room-103',
      title: 'اتاق خصوصی کلوب عقاب‌های تهران (نیازمند رمز)',
      topic: 'کلوب و اسکواد',
      mode: '30Sprint',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Desert Sands',
      status: 'LOBBY',
      isPrivate: true,
      pinCode: '1234',
      hasBots: false,
      hostName: 'EagleMaster',
    },
    {
      id: 'room-104',
      title: 'Fullstack Devs English Typing Sprint',
      topic: 'Computer Science',
      mode: '15Sprint',
      language: 'en',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Space Odyssey',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'Global Node Server',
    },
    {
      id: 'room-105',
      title: 'دوئل استقامتی اشعار شاهنامه فردوسی',
      topic: 'ادبیات کهن فارسی',
      mode: 'Marathon',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Historic Persepolis',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'ادبیات کهن',
    },
    {
      id: 'room-scientific',
      title: 'کورس دانش و متون علمی و اکتشافات کیهان',
      topic: 'علمی و اکتشافات',
      mode: '60Classic',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Space Odyssey',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور دانش و علوم',
    },
    {
      id: 'room-historical',
      title: 'رقابت تاریخ کهن و تمدن‌های سرنوشت‌ساز',
      topic: 'تاریخ و تمدن',
      mode: '60Classic',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Historic Persepolis',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور تمدن و تاریخ',
    },
    {
      id: 'room-numbers',
      title: 'پد عددی و تایپ سرعتی ارقام (بدون نیاز به فاصله)',
      topic: 'تایپ اعداد',
      mode: 'Numbers',
      language: 'en',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Neon Precision Arena',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور پد عددی',
    },
  ];

  const [rooms] = useState<Room[]>(initialRooms);

  const filtered = rooms.filter((r) => {
    if (activeTab === 'fa' && r.language !== 'fa') return false;
    if (activeTab === 'en' && r.language !== 'en') return false;
    if (activeTab === 'private' && !r.isPrivate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.hostName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleJoinClick = (room: Room) => {
    if (room.isPrivate) {
      setPasswordModalRoom(room);
      setEnteredPin('');
      setPinError(null);
    } else {
      showToast(`🚗 در حال انتقال به لابی اتاق «${room.title}»...`);
      setTimeout(() => {
        window.location.href = '/live-race';
      }, 1000);
    }
  };

  const verifyPinAndEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalRoom) return;
    if (enteredPin === passwordModalRoom.pinCode) {
      setPasswordModalRoom(null);
      showToast('🔑 رمز عبور معتبر است. ورود به پیست اختصاصی...');
      setTimeout(() => {
        window.location.href = '/live-race';
      }, 1000);
    } else {
      setPinError('رمز عبور وارد شده نادرست است.');
    }
  };

  const handleQuickJoin = () => {
    const publicRoom = rooms.find((r) => !r.isPrivate && r.onlineUsers < r.capacity);
    if (publicRoom) {
      handleJoinClick(publicRoom);
    } else {
      showToast('در حال حاضر تمام اتاق‌ها پر هستند. می‌توانید اتاق جدید بسازید.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Password Verification Modal */}
      {passwordModalRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">اتاق دارای رمز عبور است</h3>
              <p className="text-xs text-slate-500">
                اتاق «{passwordModalRoom.title}» توسط میزبان خصوصی شده است.
              </p>
            </div>

            <form onSubmit={verifyPinAndEnter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  پین‌کد یا رمز اتاق:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="مثال: 1234"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-center font-mono text-base tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {pinError && (
                  <p className="text-xs font-bold text-rose-500 mt-1.5 flex items-center gap-1 justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  تایید و ورود به مسابقه
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordModalRoom(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            لابی رقابت‌های چندنفره زنده
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            اتاق‌های مسابقه زنده (Live Race Rooms)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            یک اتاق را انتخاب کنید و همزمان با سایر کاربران و ربات‌های ارزیابی در پیست اتومبیل‌رانی تایپ کنید.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickJoin}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-900 font-black text-xs hover:bg-amber-400 transition shadow-xs"
          >
            <Zap className="w-4 h-4 text-slate-900 fill-slate-900" />
            <span>پیوستن سریع (Matchmaking)</span>
          </button>
          <Link
            href="/rooms/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ساخت اتاق جدید</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی عنوان، میزبان یا موضوع..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            همه اتاق‌ها ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('fa')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'fa' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            فارسی
          </button>
          <button
            onClick={() => setActiveTab('en')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'en' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'private' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            اتاق‌های رمزدار
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((room) => {
          const occupancyPercent = (room.onlineUsers / room.capacity) * 100;
          return (
            <div
              key={room.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                {/* Status & Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      room.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                        : room.status === 'COUNTDOWN'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    {room.status === 'ACTIVE'
                      ? '● در حال مسابقه'
                      : room.status === 'COUNTDOWN'
                      ? 'آماده‌باش شمارش معکوس'
                      : 'در انتظار مسابقه‌دهندگان'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {room.isPrivate ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>خصوصی</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>عمومی</span>
                      </span>
                    )}

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                      {room.language === 'fa' ? 'فارسی' : 'English'}
                    </span>
                  </div>
                </div>

                {/* Title & Host */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2">
                    {room.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span>میزبان: <strong className="text-slate-700">{room.hostName}</strong></span>
                    <span>•</span>
                    <span>پیست: <strong className="text-slate-700">{room.trackTheme}</strong></span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>ظرفیت لاین‌ها:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {room.onlineUsers.toLocaleString('fa-IR')} از {room.capacity.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyPercent >= 100
                          ? 'bg-rose-500'
                          : occupancyPercent > 60
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 rounded-xl p-2 text-center">
                    <span className="text-slate-400 block text-[10px]">میانگین سرعت</span>
                    <span className="font-mono font-black text-slate-800">{room.averageWpm} WPM</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2 text-center">
                    <span className="text-slate-400 block text-[10px]">حالت بازی</span>
                    <span className="font-bold text-slate-800">{room.mode}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleJoinClick(room)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{room.isPrivate ? 'ورود با رمز' : 'ورود به پیست'}</span>
                </button>

                <Link
                  href="/live-race"
                  className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition flex items-center justify-center gap-1"
                  title="تماشای زنده (Spectate)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تماشا</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
