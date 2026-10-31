'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Keyboard,
  Trophy,
  BookOpen,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Coins,
  Award,
  Zap,
  Briefcase,
  LogIn,
  LogOut,
  ShieldCheck,
  Settings as SettingsIcon,
  Bell,
  Crown,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VipWelcomeModal from '@/components/subscription/VipWelcomeModal';
import VipActivatedModal from '@/components/subscription/VipActivatedModal';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string>('۱');
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();

  // Load and sync notifications
  const loadNotifications = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('typro_user_notifications');
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list) || list.length === 0) {
        list = [
          {
            id: 'notif-vip-welcome',
            category: 'rewards',
            title: '👑 دعوت‌نامه اختصاصی VIP تایپرو',
            desc: 'با فعال‌سازی اشتراک ویژه، تمام پیست‌ها و ماشین‌ها باز شده و در هر مسابقه ۲ برابر سکه دریافت کنید!',
            time: 'هم‌اکنون',
            read: false,
            actionLabel: 'مشاهده پلن‌ها و ارتقا',
            actionUrl: '/subscription',
          },
          {
            id: 'notif-default-record',
            category: 'esports',
            title: '🏁 مسابقات زنده سرعت تایپ',
            desc: 'در اتاق‌های رقابت زنده شرکت کنید و با تایپ دقیق جوایز و سکه‌های بیشتر کسب نمایید.',
            time: 'امروز',
            read: true,
            actionLabel: 'ورود به مسابقه',
            actionUrl: '/live-race',
          },
        ];
        localStorage.setItem('typro_user_notifications', JSON.stringify(list));
      }
      setNotifications(list);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('typro_notifications_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    return () => {
      window.removeEventListener('typro_notifications_updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_notifications', JSON.stringify(updated));
    }
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_notifications', JSON.stringify(updated));
    }
  };

  // Real-time Presence Tracking & Heartbeat with Backend
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let presenceId = localStorage.getItem('typro_presence_id');
    if (!presenceId) {
      presenceId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('typro_presence_id', presenceId);
    }

    const sendHeartbeat = async () => {
      try {
        const activeUid = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('typro_user_id') : undefined) || undefined;
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
        const res = await fetch('/auth/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: presenceId, userId: activeUid, path: currentPath }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.onlineCount) {
            setOnlineUsers(Number(data.onlineCount).toLocaleString('fa-IR'));
            localStorage.setItem('typro_real_online_count', String(data.onlineCount));
            window.dispatchEvent(new Event('typro_online_count_updated'));
          }
        }
      } catch {
        try {
          const r = await fetch('/auth/online-count');
          if (r.ok) {
            const d = await r.json();
            if (d?.onlineCount) {
              setOnlineUsers(Number(d.onlineCount).toLocaleString('fa-IR'));
              localStorage.setItem('typro_real_online_count', String(d.onlineCount));
              window.dispatchEvent(new Event('typro_online_count_updated'));
            }
          }
        } catch {}
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 25000);
    return () => clearInterval(interval);
  }, []);

  const navCategories = [
    {
      id: 'main',
      title: 'صفحات اصلی',
      icon: <BookOpen className="w-4 h-4" />,
      items: [
        { title: 'صفحه اصلی', href: '/' },
        { title: 'درباره تایپرو', href: '/about' },
        { title: 'راهنمای جامع', href: '/guide' },
        { title: 'تجربیات کاربران', href: '/experiences' },
        { title: 'سوالات متداول', href: '/faq' },
        { title: 'پشتیبانی', href: '/support' }
      ]
    },
    {
      id: 'learn',
      title: 'تایپ و آموزش',
      icon: <Keyboard className="w-4 h-4" />,
      items: [
        { title: 'تست تایپ ده‌انگشتی', href: '/typing-test', badge: 'اصلی' },
        { title: 'آکادمی دروس تایپ', href: '/lessons?lang=fa' },
        { title: 'تمرین هوشمند و کلیدهای ضعیف', href: '/practice' },
        { title: 'بازی‌های مهارتی آرکید', href: '/games' },
        { title: 'تایپ صوتی و پیاده‌سازی', href: '/audio-typing' },
        { title: 'تایپ ویدیویی و زیرنویس', href: '/video-typing', badge: 'جدید' },
        { title: 'اسکن تصویر به متن (OCR)', href: '/image-to-text', badge: 'هوشمند' },
        { title: 'قرآن‌تایپ با اعراب دقیق', href: '/quran' },
        { title: 'ویرایشگر تایپرو رایت', href: '/write' },
        { title: 'سامانه مدارس و کلاس‌ها', href: '/schools', badge: 'فاز ۱۱' }
      ]
    },
    {
      id: 'competition',
      title: 'رقابت زنده',
      icon: <Trophy className="w-4 h-4" />,
      items: [
        { title: 'اتاق‌های مسابقه زنده', href: '/live-race', badge: 'زنده' },
        { title: 'فروشگاه اسکین خودرو', href: '/store/skins', badge: 'جدید' },
        { title: 'بازپخش مسابقات و تله‌متری', href: '/replay' },
        { title: 'تورنمنت‌ها و براکت‌ها', href: '/tournaments' },
        { title: 'لیگ‌ها و رتبه‌بندی', href: '/leagues' },
        { title: 'کلوب‌ها و نبرد تیمی', href: '/clubs' },
        { title: 'هماوردی و رقیب هفتگی', href: '/rivals' },
        { title: 'تالار مشاهیر (Hall of Fame)', href: '/rankings' }
      ]
    },
    {
      id: 'progress',
      title: 'پیشرفت و تحلیل',
      icon: <Zap className="w-4 h-4" />,
      items: [
        { title: 'پروفایل من', href: '/profile' },
        { title: 'گزارش‌های آماری جامع', href: '/reports' },
        { title: 'Typing DNA و هیت‌مپ کیبورد', href: '/reports/intelligence' },
        { title: 'مدال‌ها و دستاوردها (+۲۰۰)', href: '/achievements' },
        { title: 'گواهینامه‌های معتبر', href: '/certificates' }
      ]
    },
    {
      id: 'economy',
      title: 'اقتصاد و فروشگاه',
      icon: <ShoppingBag className="w-4 h-4" />,
      items: [
        { title: 'صندوقچه‌های جایزه (روزانه، هفتگی، ماهانه، سالانه)', href: '/chests', badge: 'جوایز' },
        { title: 'فروشگاه اسکین خودرو', href: '/store/skins' },
        { title: 'فروشگاه کیبورد مکانیکی', href: '/store/keyboards' },
        { title: 'اشتراک ویژه (Premium)', href: '/subscription' }
      ]
    },
    {
      id: 'marketplace',
      title: 'بازار کار',
      icon: <Briefcase className="w-4 h-4" />,
      items: [
        { title: 'تایپیست‌های فریلنسر', href: '/freelancers' },
        { title: 'سفارش‌ها و ضمانت امانی', href: '/orders', badge: 'امانی' }
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Live Activity Indicator */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
                <img
                  src="/images/typro-logo.png"
                  alt="لوگوی تایپرو Typro.ir"
                  className="w-full h-full object-contain select-none drop-shadow-xs"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  تایپرو<span className="text-blue-600 font-mono text-base mr-0.5">.ir</span>
                </span>
                <span className="text-[10px] text-slate-500 -mt-1 font-medium whitespace-nowrap">
                  سامانه پیشرفته تایپ ده‌انگشتی
                </span>
              </div>
            </Link>

            {/* Live active room pulse (دقیق و واقعی) */}
            <div
              className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/60 text-xs text-emerald-700 font-medium whitespace-nowrap"
              title="تعداد کاربران آنلاین لحظه‌ای در سامانه تایپرو"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{onlineUsers} آنلاین واقعی</span>
            </div>
          </div>

          {/* Desktop Mega Navigation (منوی کشویی استاندارد و هدر ثابت در تمام صفحات) */}
          <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center px-4">
            {navCategories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveMenu(cat.id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeMenu === cat.id
                      ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/80'
                  }`}
                >
                  {cat.icon}
                  <span className="whitespace-nowrap">{cat.title}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {activeMenu === cat.id && (
                  <div className="absolute top-full right-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-400 mb-1">
                      {cat.title}
                    </div>
                    {cat.items.map((item) => (
                      <Link
                        key={`${cat.id}-${item.href}`}
                        href={item.href}
                        onClick={() => setActiveMenu(null)}
                        className={`flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors ${
                          pathname === item.href ? 'text-blue-600 bg-blue-50/50 font-semibold' : ''
                        }`}
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Bar & Dynamic Auth State */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Coins & Banknotes status */}
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1 text-amber-600" title="موجودی سکه">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{(user.coins ?? 0).toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-300" />
                  <div className="flex items-center gap-1 text-blue-600" title="سطح کاربری">
                    <Award className="w-3.5 h-3.5" />
                    <span>سطح {user.level}</span>
                  </div>
                </div>

                {/* User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.displayName || 'کاربر'} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden md:inline">
                      {user.displayName || user.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {user.displayName || user.username}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {isAdmin ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-black">
                              مدیر ارشد سامانه
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                              تایپیست سطح {user.level}
                            </span>
                          )}
                          {(user.isSubscribed || (user.subscription && user.subscription !== 'رایگان')) && (
                            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black flex items-center gap-0.5 shadow-xs">
                              <Crown className="w-2.5 h-2.5 fill-current" />
                              <span>VIP فعال</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>پروفایل و ویرایش اطلاعات</span>
                        </Link>
                        <Link
                          href="/reports"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>گزارش‌های آماری من</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition font-bold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>مرکز مدیریت مستر (Admin)</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition font-bold text-right cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/25"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>ورود / ثبت‌نام</span>
                </Link>
              </div>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className={`relative p-2 rounded-xl transition cursor-pointer border ${
                  notifMenuOpen
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="اعلان‌ها و رویدادهای تایپرو"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '+۹' : unreadCount}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 text-right"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="font-black text-xs text-slate-900">مرکز اعلان‌ها</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {unreadCount} جدید
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        خوانده‌شدن همه
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-1 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        هیچ اعلانی وجود ندارد.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl transition hover:bg-slate-50 ${
                            !n.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                              <span>{n.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                            {n.desc}
                          </p>
                          {n.actionUrl && (
                            <div className="mt-2 flex justify-end">
                              <Link
                                href={n.actionUrl}
                                onClick={() => {
                                  markNotificationAsRead(n.id);
                                  setNotifMenuOpen(false);
                                }}
                                className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-100/60 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                              >
                                {n.actionLabel || 'مشاهده'}
                              </Link>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifMenuOpen(false)}
                      className="text-xs font-black text-blue-600 hover:text-blue-800 transition block py-1"
                    >
                      مشاهده تمامی اعلان‌ها و تاریخچه ←
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {navCategories.map((cat) => (
            <div key={cat.id} className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
                {cat.icon}
                <span>{cat.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cat.items.map((item) => (
                  <Link
                    key={`mob-${cat.id}-${item.href}`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-slate-600 hover:text-blue-600 py-1"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* First-visit VIP Announcement Modal for un-subscribed users */}
      <VipWelcomeModal />
      {/* One-time Celebration Modal when Admin Activates VIP */}
      <VipActivatedModal />
    </header>
  );
}
