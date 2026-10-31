'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Trophy,
  Award,
  Flame,
  Gift,
  Sparkles,
  CheckCheck,
  Swords,
  Trash2,
  Check,
  ChevronLeft,
  Crown
} from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  category: 'esports' | 'rewards' | 'clubs' | 'system';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
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
    id: 'notif-1',
    category: 'rewards',
    title: 'شکستن رکورد سرعت! (New Personal Best)',
    desc: 'شما در آزمون متون ادبی به سرعت ۶۴ کلمه در دقیقه رسیدید. ۵۰ سکه پاداش به حساب شما واریز شد.',
    time: '۱۰ دقیقه پیش',
    read: false,
    actionLabel: 'مشاهده کیف پول',
    actionUrl: '/wallet',
  },
  {
    id: 'notif-2',
    category: 'rewards',
    title: 'صندوق جایزه آماده بازگشایی است! (Chest Ready)',
    desc: 'صندوق نقره‌ای هفتگی شما آماده بازگشایی است. برای دریافت پوسته‌ها کلیک کنید.',
    time: '۱ ساعت پیش',
    read: false,
    actionLabel: 'بازگشایی صندوق',
    actionUrl: '/earn',
  },
  {
    id: 'notif-3',
    category: 'clubs',
    title: 'جنگ کلوب‌ها: نبرد هفتگی آغاز شد!',
    desc: 'کلوب شما (Speed Demons) در برابر نویسندگان پارسی وارد میدان نبرد ۴۸ ساعته شد.',
    time: '۳ ساعت پیش',
    read: false,
    actionLabel: 'ورود به میدان نبرد',
    actionUrl: '/clubs',
  },
  {
    id: 'notif-4',
    category: 'esports',
    title: 'ثبت‌نام در تورنمنت بزرگ فصل اول',
    desc: 'مهلت ثبت‌نام در جدول براکت‌های حذفی مسابقات بهار آغاز گردید.',
    time: 'دیروز',
    read: true,
    actionLabel: 'مشاهده جدول تورنمنت',
    actionUrl: '/tournaments',
  },
  {
    id: 'notif-5',
    category: 'system',
    title: 'ارتقای سطح به Level 28',
    desc: 'تبریک! با کسب ۲۸,۰۰۰ امتیاز XP به سطح بیست و هشتم ارتقا یافتید.',
    time: '۲ روز پیش',
    read: true,
  },
];

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  const loadNotifications = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('typro_user_notifications');
      let list: NotificationItem[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list) || list.length === 0) {
        list = [...DEFAULT_NOTIFICATIONS];
      }

      // If user has active VIP subscription, ensure the VIP activation notification is present
      const isSub = localStorage.getItem('typro_user_is_subscribed') === 'true';
      const subPlan = localStorage.getItem('typro_user_subscription') || 'VIP طلایی';
      if (isSub && subPlan !== 'رایگان') {
        const hasVipNotif = list.some((n) => n.id?.includes('vip-active') || n.title?.includes('VIP شما فعال شد'));
        if (!hasVipNotif) {
          list.unshift({
            id: `notif-vip-active-cached`,
            category: 'rewards',
            title: '👑 اشتراک ویژه VIP شما فعال شد!',
            desc: `طرح «${subPlan}» توسط مدیریت برای حساب کاربری شما با موفقیت فعال گردید. اکنون به تمام امکانات پیشرفته و مزایای ویژه دسترسی دارید.`,
            time: 'هم‌اکنون',
            read: false,
            actionLabel: 'مشاهده جزییات اشتراک',
            actionUrl: '/subscription',
          });
          localStorage.setItem('typro_user_notifications', JSON.stringify(list));
        }
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

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_notifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('typro_notifications_updated'));
    }
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_notifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('typro_notifications_updated'));
    }
  };

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              بخش ۱۲۶ مستند فنی: مرکز اعلان‌های هوشمند و رویدادهای زنده
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            اعلان‌های هوشمند و پیام‌ها (Notifications)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            شما {unreadCount} اعلان خوانده‌نشده دارید.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>علامت‌گذاری همه به عنوان خوانده‌شده</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: 'همه اعلان‌ها' },
          { id: 'esports', label: 'مسابقات و رتبه‌بندی' },
          { id: 'clubs', label: 'کلوب و نبرد تیمی' },
          { id: 'rewards', label: 'جوایز و سکه‌ها' },
          { id: 'system', label: 'سیستم و امنیت' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={"px-4 py-2 rounded-2xl border transition whitespace-nowrap " + (
              activeCategory === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={"p-5 rounded-3xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 " + (
              notif.read
                ? 'bg-white border-slate-200/80 shadow-xs'
                : 'bg-blue-50/50 border-blue-200 shadow-xs ring-1 ring-blue-500/10'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs text-lg">
                {notif.category === 'rewards' ? '🎁' : notif.category === 'clubs' ? '⚔️' : notif.category === 'esports' ? '🏎️' : '🔔'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">{notif.title}</h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.desc}</p>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">{notif.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {notif.actionLabel && notif.actionUrl && (
                <Link
                  href={notif.actionUrl}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  {notif.actionLabel}
                </Link>
              )}
              <button
                onClick={() => deleteNotification(notif.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="حذف اعلان"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400">
            هیچ اعلانی در این دسته‌بندی وجود ندارد.
          </div>
        )}
      </div>
    </div>
  );
}
