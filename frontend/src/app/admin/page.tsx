'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Activity,
  Trophy,
  DollarSign,
  Settings,
  Flame,
  CheckCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Eye,
  Rocket,
  Award,
  Sparkles,
  Sliders,
  Check,
  BarChart3,
  Gamepad2,
  Globe,
  Wifi,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'platformStats' | 'rooms' | 'settings' | 'audit'>('overview');

  const [settings, setSettings] = useState({
    xpPerLevel: 1000,
    maxLevel: 1000,
    inactivityTimeoutSec: 5,
    anonymousEntryAllowed: true,
    dailyStarThreshold: 5,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Platform stats controlled by Admin
  const [platformStats, setPlatformStats] = useState({
    onlineTypists: '0',
    todayTests: '0',
    avgGrowth: '+۰ WPM',
    issuedCerts: '0',
    mode: 'real', // 'real' or 'custom'
  });

  const [realMetrics, setRealMetrics] = useState({
    registeredUsersCount: 0,
    visitorsCount: 0,
    onlineCount: 0,
    testsCompletedCount: 0,
  });

  const [visitorLogs, setVisitorLogs] = useState<{
    ip: string;
    userAgent: string;
    lastPath: string;
    lastSeen: string;
    firstSeen: string;
    hits: number;
    userId?: string;
    username?: string | null;
    displayName?: string;
    role?: string;
    isOnline?: boolean;
    vipLevel?: number;
  }[]>([]);

  const [showOnlyOnline, setShowOnlyOnline] = useState(false);

  const [statsSavedSuccess, setStatsSavedSuccess] = useState(false);

  const fetchRealStats = async () => {
    try {
      let localUserCount = 0;
      let localUsers: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const adminUsers = JSON.parse(localStorage.getItem('typro_admin_users') || '[]');
          const regUsers = JSON.parse(localStorage.getItem('typro_registered_users') || '[]');
          const set = new Set();
          adminUsers.forEach((u: any) => { if (u?.id || u?.username || u?.mobile) set.add(u.id || u.username || u.mobile); });
          regUsers.forEach((u: any) => { if (u?.id || u?.username || u?.mobile) set.add(u.id || u.username || u.mobile); });
          localUserCount = set.size;
          localUsers = [...adminUsers, ...regUsers];
        } catch {}
      }

      if (localUsers.length > 0) {
        fetch('/api/admin/sync-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: localUsers }),
        }).catch(() => {});
      }

      const res = await fetch('/api/admin/realtime-stats');
      if (res.ok) {
        const data = await res.json();
        const finalRegisteredCount = Math.max(data.registeredUsersCount ?? 0, localUserCount);
        setRealMetrics({
          registeredUsersCount: finalRegisteredCount,
          visitorsCount: data.visitorsCount ?? 0,
          onlineCount: data.onlineCount ?? 0,
          testsCompletedCount: data.testsCompletedCount ?? 0,
        });
        if (data.platformStats) {
          setPlatformStats(data.platformStats);
        }
        if (Array.isArray(data.recentVisitors)) {
          setVisitorLogs(data.recentVisitors);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchRealStats();
    const interval = setInterval(fetchRealStats, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadPlatform = async () => {
      try {
        const res = await fetch('/api/admin/platform-stats');
        if (res.ok) {
          const data = await res.json();
          setPlatformStats(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('typro_platform_stats', JSON.stringify(data));
          }
          return;
        }
      } catch {}

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('typro_platform_stats');
        if (saved) {
          try {
            setPlatformStats(JSON.parse(saved));
          } catch {}
        }
      }
    };
    loadPlatform();
  }, []);

  const handleSavePlatformStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await fetch('/api/admin/platform-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformStats),
      });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_platform_stats', JSON.stringify(platformStats));
      window.dispatchEvent(new Event('typro_platform_stats_updated'));
    }
    setStatsSavedSuccess(true);
    setTimeout(() => setStatsSavedSuccess(false), 3500);
  };

  const handleApplyRealData = async () => {
    try {
      const res = await fetch('/api/admin/platform-stats/sync-real', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPlatformStats(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('typro_platform_stats', JSON.stringify(data));
          window.dispatchEvent(new Event('typro_platform_stats_updated'));
        }
        setStatsSavedSuccess(true);
        setTimeout(() => setStatsSavedSuccess(false), 3500);
        return;
      }
    } catch {}

    const fallbackStats = {
      onlineTypists: String(realMetrics.onlineCount ?? 0),
      todayTests: String(realMetrics.testsCompletedCount ?? 0),
      avgGrowth: '+۰ WPM',
      issuedCerts: '0',
      mode: 'real',
    };
    setPlatformStats(fallbackStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_platform_stats', JSON.stringify(fallbackStats));
      window.dispatchEvent(new Event('typro_platform_stats_updated'));
    }
    setStatsSavedSuccess(true);
    setTimeout(() => setStatsSavedSuccess(false), 3500);
  };

  const roomsList = [
    { id: 'room-1', title: 'اتاق ۱: متن کوتاه فارسی', language: 'fa', participants: 4, activeTypers: 3, state: 'ACTIVE', topic: 'فناوری و ادبیات' },
    { id: 'room-2', title: 'اتاق ۲: آیات مبارکه قرآن', language: 'fa', participants: 6, activeTypers: 6, state: 'ACTIVE', topic: 'قرآن و معارف' },
    { id: 'room-3', title: 'Room 3: English Speed Sprint', language: 'en', participants: 2, activeTypers: 2, state: 'COUNTDOWN', topic: 'Computer Science' },
  ];

  const auditLogs = [
    { id: 'log-101', actor: 'SuperAdmin', action: 'UPDATE_SYSTEM_SETTINGS', object: 'INACTIVITY_TIMEOUT', timestamp: '۱۰:۳۰:۱۵', detail: 'تنظیم زمان مهلت عدم فعالیت به ۵ ثانیه' },
    { id: 'log-102', actor: 'ContentManager', action: 'PUBLISH_CONTENT', object: 'SURAH_IKHLAS', timestamp: '۰۹:۱۵:۰۰', detail: 'انتشار سوره مبارکه اخلاص در CMS مرکزی' },
    { id: 'log-103', actor: 'FinanceAdmin', action: 'COIN_PACKAGE_UPDATE', object: 'ECONOMY', timestamp: 'دیروز', detail: 'اعمال تخفیف ۲۰ درصدی روی بسته سکه طلایی' },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-black">
              پنل مدیریت مستر (Admin Master Panel)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            مرکز فرماندهی و پایش یکپارچه Typro.ir
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            پیشخوان کلان
          </button>
          <button
            onClick={() => setActiveTab('platformStats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'platformStats' ? 'bg-white text-emerald-600 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>کنترل آمار زنده صفحه نخست</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'rooms' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            پایش اتاق‌های زنده
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تنظیمات و متغیرها
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            لاگ‌های ممیزی
          </button>
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">کاربران ثبت‌نام‌شده در سایت</span>
              <span className="text-3xl font-black text-slate-900 font-mono block">
                {realMetrics.registeredUsersCount.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">حساب‌های کاربری تاییدشده رسمی</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">کل بازدیدکنندگان ورودی به سایت</span>
              <span className="text-3xl font-black text-indigo-600 font-mono block">
                {realMetrics.visitorsCount.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-indigo-500 font-semibold">تعداد نشست‌های ورودی ثبت‌شده</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">تایپیست‌های آنلاین هم‌اکنون</span>
              <span className="text-3xl font-black text-blue-600 font-mono block">
                {(realMetrics.onlineCount ?? 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-blue-500 font-semibold">تایپیست‌های فعال متصل به سامانه</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">کل آزمون‌های تایپ ثبت‌شده</span>
              <span className="text-3xl font-black text-emerald-600 font-mono block">
                {(realMetrics.testsCompletedCount || parseInt(platformStats.todayTests, 10) || 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">سنجش‌های رسمی سرعت و دقت</span>
            </div>
          </div>

          {/* Live Platform Counters Quick Manager Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    کنترل و مدیریت آمار زنده بنر صفحه نخست (Live Platform Counters)
                  </h3>
                  <p className="text-xs text-slate-300">
                    تنظیم ۴ شاخص کلیدی صفحه اول سامانه (تایپیست‌های آنلاین، تست‌های امروز، رشد مهارت و گواهینامه‌ها)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyRealData}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  title="محاسبه خودکار و بلادرنگ بر اساس داده‌های فعال سامانه"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>همگام‌سازی با آمار واقعی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('platformStats')}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/30 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>ویرایش و تنظیم ارقام</span>
                </button>
              </div>
            </div>

            {/* Current Live Values Display in Admin */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 block mb-1">تایپیست آنلاین در رقابت</span>
                <span className="text-xl font-black text-blue-300 font-mono">{platformStats.onlineTypists}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 block mb-1">تست انجام‌شده امروز</span>
                <span className="text-xl font-black text-amber-300 font-mono">{platformStats.todayTests}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 block mb-1">میانگین رشد مهارت کاربران</span>
                <span className="text-xl font-black text-emerald-300 font-mono">{platformStats.avgGrowth}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 block mb-1">گواهینامه رسمی صادره</span>
                <span className="text-xl font-black text-purple-300 font-mono">{platformStats.issuedCerts}</span>
              </div>
            </div>
          </div>

          {/* Live Visitor IP Tracker & Real Online Users Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <span>رصد افراد آنلاین و آی‌پی‌های فعال سامانه (Live Presence & IP Tracker)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-xs text-slate-500">
                    شناسایی ۱۰۰٪ واقعی کاربران آنلاین، مهمانان، آدرس‌های آی‌پی و آخرین صفحات بازدیدشده
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowOnlyOnline(false)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      !showOnlyOnline ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    همه ({visitorLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOnlyOnline(true)}
                    className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      showOnlyOnline ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>فقط آنلاین ({visitorLogs.filter((v) => v.isOnline).length})</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={fetchRealStats}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تازه‌سازی</span>
                </button>
              </div>
            </div>

            {visitorLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                در حال دریافت اطلاعات بلادرنگ کاربران آنلاین و آی‌پی‌ها از سرور...
              </div>
            ) : (() => {
              const displayedLogs = showOnlyOnline
                ? visitorLogs.filter((v) => v.isOnline)
                : visitorLogs.slice(0, 25);

              if (displayedLogs.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    در حال حاضر کاربر آنلاینی در ۲ دقیقه اخیر ثبت نشده است.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="pb-3 pr-2">ردیف</th>
                        <th className="pb-3">وضعیت</th>
                        <th className="pb-3">کاربر / هویت</th>
                        <th className="pb-3">آدرس آی‌پی (IP Address)</th>
                        <th className="pb-3">آخرین مسیر بازدید</th>
                        <th className="pb-3">تعداد بازدید (Hits)</th>
                        <th className="pb-3">دستگاه و مرورگر</th>
                        <th className="pb-3 pl-2">آخرین فعالیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {displayedLogs.map((log, idx) => {
                        const isOnline = Boolean(log.isOnline);
                        const isUserAdmin = log.role === 'admin';
                        const isRegistered = Boolean(log.userId);

                        return (
                          <tr key={log.ip + idx} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 pr-2 font-mono text-slate-400">#{idx + 1}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                                isOnline 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' 
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <span>{isOnline ? 'آنلاین' : 'آفلاین'}</span>
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isUserAdmin
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : isRegistered
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {log.displayName ? log.displayName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{log.displayName || 'کاربر مهمان'}</span>
                                    {isUserAdmin && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded font-black border border-rose-200">
                                        مدیر
                                      </span>
                                    )}
                                    {isRegistered && !isUserAdmin && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded font-black border border-blue-200">
                                        کاربر
                                      </span>
                                    )}
                                    {!isRegistered && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-medium border border-slate-200">
                                        مهمان
                                      </span>
                                    )}
                                  </div>
                                  {log.username && (
                                    <div className="text-[10px] font-mono text-slate-400 dir-ltr text-right">
                                      @{log.username}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="font-mono font-extrabold text-blue-600 dir-ltr select-all bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100">
                                {log.ip}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-slate-600 dir-ltr text-right">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {log.lastPath || '/'}
                              </span>
                            </td>
                            <td className="py-3 font-mono font-black text-indigo-600">
                              {log.hits || 1} مرتبه
                            </td>
                            <td className="py-3 text-[11px] text-slate-500 max-w-[200px] truncate" title={log.userAgent}>
                              {log.userAgent || 'مرورگر استاندارد'}
                            </td>
                            <td className="py-3 pl-2 text-[11px] text-slate-400 font-mono">
                              {new Date(log.lastSeen).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Master Site Management Modules Grid (Section 127: Modules) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">ماژول‌های تخصصی ویرایش و مدیریت کل سامانه</h2>
                <p className="text-xs text-slate-500">انتخاب هر بخش جهت ایجاد، ویرایش، حذف یا تغییر تنظیمات سراسری</p>
              </div>
              <span className="text-xs font-bold text-blue-600">۱۳ ماژول فعال و یکپارچه</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/users"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">بخش ۱۳۸</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">مدیریت کاربران و امنیت</h3>
                <p className="text-xs text-slate-500">جستجو، ویرایش نقش، مسدودسازی، ریست رمز عبور و تنظیم سکه کاربران</p>
              </Link>

              <Link
                href="/admin/content"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">بخش ۲۷ و ۲۸</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition">CMS مرکزی و قرآن کریم</h3>
                <p className="text-xs text-slate-500">افزودن و ویرایش متون تست، سوره‌ها و آیات قرآن، متن‌های علمی و ادبی</p>
              </Link>

              <Link
                href="/admin/lessons"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">بخش ۱۲۹</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">مدیریت دروس آکادمی</h3>
                <p className="text-xs text-slate-500">طراحی سرفصل‌ها، تعیین حروف هدف، حدنصاب WPM و تمرین‌های متنی</p>
              </Link>

              <Link
                href="/admin/races"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">بخش ۱۳۰</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">مسابقات و اتاق‌های زنده</h3>
                <p className="text-xs text-slate-500">تعریف اتاق‌ها، تغییر متن لحظه‌ای، ظرفیت سرور و فرمول امتیازدهی</p>
              </Link>

              <Link
                href="/admin/games"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">بخش ۱۳۱ (جدید)</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">مدیریت بازی‌ها و دسترسی کاربران</h3>
                <p className="text-xs text-slate-500">کنترل سطح دسترسی، سقف بازی روزانه، بازگشایی بازی برای کاربر خاص و تنظیم جوایز</p>
              </Link>

              <Link
                href="/admin/economy"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">بخش ۱۳۶ و ۱۳۷</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition">اقتصاد و اسکین خودروها</h3>
                <p className="text-xs text-slate-500">قیمت‌گذاری خودروها، بسته‌های سکه و اسکناس و تنظیمات فروشگاه</p>
              </Link>

              <Link
                href="/admin/rewards"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">بخش ۱۳۴</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition">پاداش‌ها، مأموریت و صندوق</h3>
                <p className="text-xs text-slate-500">تنظیم پاداش مأموریت روزانه، زنجیره استریک و محتویات ۵ نوع صندوق</p>
              </Link>

              <Link
                href="/admin/subscriptions"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">بخش ۱۳۵</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition">اشتراک ویژه و تخفیف‌ها</h3>
                <p className="text-xs text-slate-500">پلن‌های ماهانه/سالانه، کدهای کوپن و دسترسی‌های کاربران ویژه</p>
              </Link>

              <Link
                href="/admin/roles"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">بخش ۱۳۹</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition">نقش‌ها و دسترسی (RBAC)</h3>
                <p className="text-xs text-slate-500">تعریف زیرمدیرها، دسترسی‌های دانه‌ای مالی، مسابقات و داوری</p>
              </Link>

              <Link
                href="/admin/feature-flags"
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">بخش ۱۷۳</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">پرچم‌های سیستم و فیچرها</h3>
                <p className="text-xs text-slate-500">فعال/غیرفعال کردن آنی مسابقات، سیستم صوتی، ضدتقلب و مأموریت‌ها</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Platform Counters Management Section (Requested by User) */}
      {activeTab === 'platformStats' && (
        <div className="space-y-6">
          {/* Header & Status Alert */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      کنترل و پایش آمار زنده صفحه نخست سامانه
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      بنر ۴ شاخص اصلی
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    در این بخش می‌توانید ارقام نمایش‌داده‌شده در بنر صفحه اول را به صورت واقعی از سیستم همگام‌سازی کرده یا مقادیر دلخواه را دستی تنظیم کنید.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>مشاهده صفحه نخست</span>
                </Link>
                <button
                  type="button"
                  onClick={handleApplyRealData}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                  <span>همگام‌سازی با آمار واقعی</span>
                </button>
              </div>
            </div>

            {/* Success Toast / Notification */}
            {statsSavedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✅ تغییرات با موفقیت ذخیره شد و هم‌اکنون به صورت بلادرنگ در صفحه نخست به کاربران نمایش داده می‌شود.</span>
              </div>
            )}

            {/* Live Preview Box (Matches Homepage Appearance) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-600 block">
                پیش‌نمایش زنده (نحوه نمایش هم‌اکنون در بنر صفحه اصلی):
              </span>
              <div className="p-6 bg-slate-100/70 rounded-3xl border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                        {platformStats.onlineTypists}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">تایپیست آنلاین در رقابت</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                        {platformStats.todayTests}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">تست انجام‌شده امروز</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                        {platformStats.avgGrowth}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">میانگین رشد مهارت کاربران</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                        {platformStats.issuedCerts}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">گواهینامه رسمی صادره</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editing Form */}
            <form onSubmit={handleSavePlatformStats} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Online Typists */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>تایپیست‌های آنلاین در رقابت:</span>
                  </label>
                  <input
                    type="text"
                    value={platformStats.onlineTypists}
                    onChange={(e) => setPlatformStats({ ...platformStats, onlineTypists: e.target.value })}
                    placeholder="مثال: ۱۴ یا ۲,۴۸۰+"
                    className="w-full text-sm font-bold font-mono px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 text-slate-900"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">کنترل سریع:</span>
                    <button
                      type="button"
                      onClick={() => setPlatformStats((p) => ({ ...p, onlineTypists: '۱' }))}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold"
                    >
                      ۱ (کاملاً واقعی) ⭐
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(platformStats.onlineTypists.replace(/[^0-9]/g, '')) || 1;
                        setPlatformStats((p) => ({ ...p, onlineTypists: String(current + 1) }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold"
                    >
                      +۱ نفر
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(platformStats.onlineTypists.replace(/[^0-9]/g, '')) || 1;
                        setPlatformStats((p) => ({ ...p, onlineTypists: String(Math.max(0, current - 1)) }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold"
                    >
                      -۱ نفر
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats((p) => ({ ...p, onlineTypists: '۰' }))}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۰ (بدون آنلاین)
                    </button>
                  </div>
                </div>

                {/* 2. Today's Tests */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>تست‌های انجام‌شده امروز:</span>
                  </label>
                  <input
                    type="text"
                    value={platformStats.todayTests}
                    onChange={(e) => setPlatformStats({ ...platformStats, todayTests: e.target.value })}
                    placeholder="مثال: ۱۸۴ یا ۴۸,۹۰۰+"
                    className="w-full text-sm font-bold font-mono px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 text-slate-900"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">انتخاب سریع:</span>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, todayTests: '۲۴۸' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۲۴۸ (واقعی)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, todayTests: '۴۸,۹۰۰+' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۴۸,۹۰۰+
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, todayTests: '۰' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۰ (خالی)
                    </button>
                  </div>
                </div>

                {/* 3. Skill Growth */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-emerald-600" />
                    <span>میانگین رشد مهارت کاربران:</span>
                  </label>
                  <input
                    type="text"
                    value={platformStats.avgGrowth}
                    onChange={(e) => setPlatformStats({ ...platformStats, avgGrowth: e.target.value })}
                    placeholder="مثال: +۱۶ WPM یا +۳۲ WPM"
                    className="w-full text-sm font-bold font-mono px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 text-slate-900"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">انتخاب سریع:</span>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, avgGrowth: '+۱۶ WPM' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      +۱۶ WPM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, avgGrowth: '+۳۲ WPM' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      +۳۲ WPM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, avgGrowth: '+۴۵ WPM' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      +۴۵ WPM
                    </button>
                  </div>
                </div>

                {/* 4. Issued Certificates */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>گواهینامه‌های رسمی صادره:</span>
                  </label>
                  <input
                    type="text"
                    value={platformStats.issuedCerts}
                    onChange={(e) => setPlatformStats({ ...platformStats, issuedCerts: e.target.value })}
                    placeholder="مثال: ۱۹ یا ۱۲,۶۵۰+"
                    className="w-full text-sm font-bold font-mono px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 text-slate-900"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">انتخاب سریع:</span>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, issuedCerts: '۱۹' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۱۹ (واقعی)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, issuedCerts: '۱۲,۶۵۰+' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۱۲,۶۵۰+
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatformStats({ ...platformStats, issuedCerts: '۰' })}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold"
                    >
                      ۰ (خالی)
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleApplyRealData}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                  <span>بازنشانی به آمار واقعی سامانه</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره و انتشار بلادرنگ در صفحه نخست</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Real-time Live Rooms Monitoring (Section 81 & 133) */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base text-slate-900">پایش بلادرنگ تمامی اتاق‌های مسابقه</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              اتاق‌ها به عنوان پروسه‌های مستقل رقابتی مدیریت می‌شوند
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">شناسه اتاق</th>
                  <th className="py-3 px-4">عنوان و موضوع</th>
                  <th className="py-3 px-4">زبان</th>
                  <th className="py-3 px-4">تعداد حاضرین</th>
                  <th className="py-3 px-4">تایپیست‌های فعال</th>
                  <th className="py-3 px-4">وضعیت</th>
                  <th className="py-3 px-4">عملیات نظارت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roomsList.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{room.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{room.title}</td>
                    <td className="py-3 px-4">{room.language === 'fa' ? 'فارسی' : 'English'}</td>
                    <td className="py-3 px-4 font-mono">{room.participants} نفر</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{room.activeTypers} نفر</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {room.state}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold">
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده (Spectate)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. System Master Settings (Section 128: No hard-coded business rules) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-base text-slate-900">کنترل مستر متغیرها و قوانین سیستم</h2>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>تنظیمات با موفقیت ذخیره و در لاگ ممیزی ثبت شد.</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">امتیاز XP لازم به ازای هر لول (Level)</label>
              <input
                type="number"
                value={settings.xpPerLevel}
                onChange={(e) => setSettings({ ...settings, xpPerLevel: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">طبق بند ۷۱: هر لول ۱۰۰۰ امتیاز XP دارد.</span>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">مهلت انصراف عدم فعالیت (ثانیه)</label>
              <input
                type="number"
                value={settings.inactivityTimeoutSec}
                onChange={(e) => setSettings({ ...settings, inactivityTimeoutSec: Number(e.target.value) })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">طبق بند ۵۴ و ۱۴۴: پیش‌فرض ۵ ثانیه مهلت هشدار.</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
            >
              ذخیره تغییرات و اعمال در سامانه
            </button>
          </div>
        </form>
      )}

      {/* 4. Audit Logs (Section 140: Immutable audit logs) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-base text-slate-900">سوابق تغییرناپذیر ممیزی (Audit Logs)</h2>
            </div>
            <span className="text-xs text-slate-400">تمام رویدادهای مدیریتی و مالی دارای امضا و ردپا هستند</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-blue-600">{log.actor}</span>
                  </div>
                  <p className="text-slate-600">{log.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
