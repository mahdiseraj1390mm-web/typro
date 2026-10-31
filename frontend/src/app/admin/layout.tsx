'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Trophy,
  BookOpen,
  FileText,
  DollarSign,
  Gift,
  CreditCard,
  MessageSquare,
  Sliders,
  History,
  HardDrive,
  LogOut,
  LayoutDashboard,
  Lock,
  ChevronLeft,
  Sparkles,
  Car,
  Swords,
  Package,
  Gamepad2,
  Globe,
  Search,
  ArrowRight,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Do not guard the admin login page itself
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4" dir="rtl">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-600">در حال بررسی سطح دسترسی امنیتی مدیر...</p>
      </div>
    );
  }

  // Access Denied / Not Admin Guard
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-red-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">دسترسی به پنل مدیریت محدود است</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              این بخش صرفاً در اختیار مدیران ارشد، ناظران و کارشناسان محتوای تایپرو قرار دارد.
              جهت ورود لطفاً ابتدا با حساب مدیریت احراز هویت نمایید.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              href="/admin/login"
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-md shadow-red-600/20"
            >
              ورود به حساب مدیریت
            </Link>
            <Link
              href="/"
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', title: 'پیشخوان کلان', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/admin/users', title: 'کاربران و امنیت', icon: <Users className="w-4 h-4" /> },
    { href: '/admin/orders', title: 'مدیریت سفارش‌های تایپ و امانی', icon: <Package className="w-4 h-4 text-sky-500" /> },
    { href: '/admin/roles', title: 'ادمین‌های فرعی و سطوح دسترسی (RBAC)', icon: <ShieldAlert className="w-4 h-4 text-red-600" /> },
    { href: '/admin/lessons', title: 'مدیریت دروس و آکادمی', icon: <BookOpen className="w-4 h-4" /> },
    { href: '/admin/content', title: 'محتوای متنی و قرآن CMS', icon: <FileText className="w-4 h-4" /> },
    { href: '/admin/texts', title: 'متون مسابقه و تست تایپ', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
    { href: '/admin/messages', title: 'ارسال پیام و اعلان به کاربران', icon: <Bell className="w-4 h-4 text-indigo-500" /> },
    { href: '/admin/races', title: 'مسابقات و اتاق‌های زنده', icon: <Trophy className="w-4 h-4" /> },
    { href: '/admin/games', title: 'مدیریت بازی‌ها و دسترسی کاربران', icon: <Gamepad2 className="w-4 h-4 text-purple-600" /> },
    { href: '/admin/tournaments', title: 'تورنمنت هفتگی و براکت‌ها', icon: <Swords className="w-4 h-4 text-amber-500" /> },
    { href: '/admin/economy', title: 'اقتصاد، سکه و اسکین‌ها', icon: <DollarSign className="w-4 h-4" /> },
    { href: '/admin/rewards', title: 'جوایز، مأموریت و صندوق‌ها', icon: <Gift className="w-4 h-4" /> },
    { href: '/admin/subscriptions', title: 'اشتراک‌ها و تخفیف‌ها', icon: <CreditCard className="w-4 h-4" /> },
    { href: '/admin/seo', title: 'مرکز فرماندهی سئو و رتبه گوگل', icon: <Globe className="w-4 h-4 text-emerald-500" /> },
    { href: '/admin/chat', title: 'نظارت بر چت و گزارش‌ها', icon: <MessageSquare className="w-4 h-4" /> },
    { href: '/admin/feature-flags', title: 'تنظیمات مستر و پرچم‌ها', icon: <Sliders className="w-4 h-4" /> },
    { href: '/admin/audit', title: 'لاگ‌های ممیزی (Audit Log)', icon: <History className="w-4 h-4" /> },
    { href: '/admin/backup', title: 'پشتیبان‌گیری و بازیابی', icon: <HardDrive className="w-4 h-4" /> },
  ];

  const ROUTE_PERMISSIONS: { [key: string]: string } = {
    '/admin': 'dashboard.view',
    '/admin/users': 'users.view',
    '/admin/orders': 'orders.view',
    '/admin/roles': 'roles.view',
    '/admin/lessons': 'lessons.view',
    '/admin/content': 'content.view',
    '/admin/texts': 'content.texts.race',
    '/admin/messages': 'messages.manage',
    '/admin/races': 'races.view',
    '/admin/games': 'games.view',
    '/admin/tournaments': 'tournaments.view',
    '/admin/economy': 'economy.view',
    '/admin/rewards': 'rewards.view',
    '/admin/subscriptions': 'subscriptions.view',
    '/admin/seo': 'seo.view',
    '/admin/chat': 'chat.view',
    '/admin/audit': 'audit.view',
    '/admin/backup': 'backup.manage',
    '/admin/feature-flags': 'dashboard.view',
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userPermissions = user?.permissions || [];

  const hasAccessTo = (permKey: string) => {
    if (isSuperAdmin) return true;
    if (permKey === 'content.texts.race') {
      return userPermissions.includes('content.texts.race') || userPermissions.includes('content.texts.typing');
    }
    return userPermissions.includes(permKey);
  };

  const visibleNavItems = navItems.filter((item) => {
    const required = ROUTE_PERMISSIONS[item.href];
    return !required || hasAccessTo(required);
  });

  const currentRoutePerm = ROUTE_PERMISSIONS[pathname];
  const isPageForbidden = currentRoutePerm && !hasAccessTo(currentRoutePerm);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/70" dir="rtl">
      {/* Top Admin Security Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/20">
              TP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  مرکز مدیریت مستر Typro.ir
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] text-red-700 font-bold">
                  RBAC Secure
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                کنترل متغیرها، پایگاه محتوا، اقتصاد، اتاق‌های مسابقه و کاربران
              </p>
            </div>
          </div>

          {/* Admin User Info & Logout Button */}
          <div className="flex items-center gap-3">
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800">
                {user?.displayName || user?.username}
              </div>
              <div className="text-[10px] text-red-600 font-mono font-bold">
                {user?.adminTitle || user?.role || 'SUPER_ADMIN'}
              </div>
            </div>

            {/* Logout Admin Button */}
            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition shadow-sm shadow-red-600/20"
              title="خروج امن از پنل مدیریت"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از پنل</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Modules Navigation Ribbon (Filtered by Sub-Admin Granular Permissions) */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none text-xs font-bold">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 transition ${
                    isActive
                      ? 'bg-red-50 text-red-700 border border-red-200 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Confirmation Modal for Logout */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">آیا مطمئن هستید؟</h3>
              <p className="text-xs text-slate-500">
                با خروج، نشست کاربری مدیر پایان یافته و دسترسی به پنل قطع خواهد شد.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-sm shadow-red-600/20"
              >
                بله، خروج از مدیریت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View with Granular Access Guard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPageForbidden ? (
          <div className="min-h-[55vh] flex items-center justify-center p-4 select-none" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-lg text-slate-900">دسترسی شما به این بخش محدود است</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  حساب شما به عنوان <strong className="text-slate-800">{user?.adminTitle || 'ادمین فرعی'}</strong> فاقد مجوز دسترسی به بخش «{navItems.find((n) => n.href === pathname)?.title || pathname}» است. دسترسی به این ماژول باید توسط مدیر ارشد سامانه فعال گردد.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت به پیشخوان مجاز</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
