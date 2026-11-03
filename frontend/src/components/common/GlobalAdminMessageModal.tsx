'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Sparkles, X, Bell, Check, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ActiveAdminMessage {
  id: string;
  sender: string;
  subject: string;
  content: string;
  createdAt?: number | string;
  actionUrl?: string;
}

export default function GlobalAdminMessageModal() {
  const { user } = useAuth();
  const [activeMessage, setActiveMessage] = useState<ActiveAdminMessage | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const checkForPendingMessages = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Check if dismissed in this browser session
    if (sessionStorage.getItem('typro_admin_modal_closed') === 'true') {
      return;
    }

    // 1. Check if user is logged in and has unseen notifications
    const effectiveUserId = user?.id || user?.username || user?.mobile;

    if (effectiveUserId) {
      try {
        const rawLocal = localStorage.getItem('typro_user_notifications');
        const notifs = rawLocal ? JSON.parse(rawLocal) : [];
        if (Array.isArray(notifs)) {
          // Look for any notification with popupShown === false or missing popupShown
          // Exclude VIP notifications which are handled exclusively by VipActivatedModal
          const pending = notifs.find(
            (n: any) =>
              (n.category === 'system' || n.sender) &&
              !n.title?.includes('VIP') &&
              !n.id?.includes('vip') &&
              n.popupShown === false &&
              !n.readOnceDismissed &&
              sessionStorage.getItem(`typro_admin_popup_dismissed_${n.id}`) !== 'true'
          );

          if (pending) {
            setActiveMessage({
              id: pending.id,
              sender: pending.sender || 'مدیر سامانه تایپرو',
              subject: pending.subject || pending.title || 'اطلاعیه رسمی مدیریت',
              content: pending.desc || pending.content || '',
              createdAt: pending.createdAt || Date.now(),
              actionUrl: pending.actionUrl || '/notifications',
            });
            setIsOpen(true);
            return;
          }
        }
      } catch {}
    }

    // 2. Also check for global broadcast message (for all users / guests who haven't seen it yet)
    try {
      const res = await fetch('/api/admin/active-broadcast');
      if (res.ok) {
        const broadcast = await res.json();
        if (broadcast && broadcast.id) {
          const seenBroadcastsRaw = localStorage.getItem('typro_seen_broadcasts');
          const seenBroadcasts: string[] = seenBroadcastsRaw ? JSON.parse(seenBroadcastsRaw) : [];

          if (
            !seenBroadcasts.includes(broadcast.id) &&
            sessionStorage.getItem(`typro_admin_popup_dismissed_${broadcast.id}`) !== 'true'
          ) {
            setActiveMessage({
              id: broadcast.id,
              sender: broadcast.sender || 'مدیر سامانه تایپرو',
              subject: broadcast.title || 'اطلاعیه سراسری مدیریت',
              content: broadcast.content || '',
              createdAt: broadcast.createdAt || Date.now(),
              actionUrl: '/notifications',
            });
            setIsOpen(true);
          }
        }
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    // Check shortly after component mount to ensure hydration completed
    const timer = setTimeout(checkForPendingMessages, 1200);

    const handleUpdate = () => {
      checkForPendingMessages();
    };

    window.addEventListener('typro_notifications_updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('typro_notifications_updated', handleUpdate);
    };
  }, [checkForPendingMessages]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('typro_admin_modal_closed', 'true');
    }

    if (!activeMessage) {
      setIsOpen(false);
      return;
    }

    const notifId = activeMessage.id;
    const effectiveUserId = user?.id || user?.username || user?.mobile;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`typro_admin_popup_dismissed_${notifId}`, 'true');
    }

    // 1. Mark in localStorage so it never pops up again
    try {
      const rawLocal = localStorage.getItem('typro_user_notifications');
      if (rawLocal) {
        const notifs = JSON.parse(rawLocal);
        const updated = notifs.map((n: any) => ({
          ...n,
          popupShown: true,
          readOnceDismissed: n.id === notifId ? true : n.readOnceDismissed,
        }));
        localStorage.setItem('typro_user_notifications', JSON.stringify(updated));
      }

      const seenBroadcastsRaw = localStorage.getItem('typro_seen_broadcasts');
      const seenBroadcasts: string[] = seenBroadcastsRaw ? JSON.parse(seenBroadcastsRaw) : [];
      if (!seenBroadcasts.includes(notifId)) {
        seenBroadcasts.push(notifId);
        localStorage.setItem('typro_seen_broadcasts', JSON.stringify(seenBroadcasts));
      }
    } catch {}

    // 2. Mark on backend so it syncs with user database
    if (effectiveUserId) {
      fetch(`/api/auth/notifications/${effectiveUserId}/${notifId}/seen`, {
        method: 'POST',
      }).catch(() => {});
    }

    setIsOpen(false);
    setActiveMessage(null);
  };

  if (!isOpen || !activeMessage) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-300">
        {/* Glowing Top Ambient Accent */}
        <div className="h-2.5 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-black text-indigo-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  پیام رسمی سامانه
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  پیام از طرف: {activeMessage.sender}
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subject Badge */}
          <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 shrink-0">موضوع پیام:</span>
            <span className="text-xs sm:text-sm font-black text-indigo-950">{activeMessage.subject}</span>
          </div>

          {/* Message Content */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/70 text-xs sm:text-sm text-slate-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-medium">
            {activeMessage.content}
          </div>

          {/* Notice info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>ارسال رسمی توسط مدیریت سامانه</span>
            </div>
            <span className="font-bold text-slate-500">این پیام در بخش اعلان‌ها ذخیره می‌گردد</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleDismiss}
              className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>متوجه شدم و بستن پیام</span>
            </button>

            <Link
              href="/notifications"
              onClick={handleDismiss}
              className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 text-center"
            >
              <Bell className="w-4 h-4 text-slate-500" />
              <span>مشاهده بخش اعلان‌ها</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
