'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Shield,
  Plus,
  Save,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Users,
  Percent,
  Check,
  X,
  FileCheck,
  Eye,
  Clock,
  AlertTriangle,
  Sparkles,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PendingReceipt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  discountCode: string | null;
  trackingCode: string;
  senderCard: string;
  receiptImage: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'receipts' | 'overview' | 'coupons'>('receipts');

  const [plans, setPlans] = useState([
    { id: 'monthly', name: 'اشتراک یک‌ماهه پرو', priceToman: 150000, discountPct: 0, active: true, subscribersCount: 1420 },
    { id: 'yearly', name: 'اشتراک سالانه پرو (محبوب)', priceToman: 490000, discountPct: 40, active: true, subscribersCount: 3840 },
  ]);

  const [coupons, setCoupons] = useState([
    { code: 'REF-CHAMP-50', discountPct: 50, usesLeft: 100, totalUsed: 42, active: true },
    { code: 'REF-INVITE-25', discountPct: 25, usesLeft: 250, totalUsed: 89, active: true },
    { code: 'NOROOZ1405', discountPct: 25, usesLeft: 140, totalUsed: 360, active: true },
    { code: 'STUDENT_50', discountPct: 50, usesLeft: 450, totalUsed: 1200, active: true },
  ]);

  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([]);
  const [selectedReceiptForPreview, setSelectedReceiptForPreview] = useState<PendingReceipt | null>(null);
  const [rejectingReceipt, setRejectingReceipt] = useState<PendingReceipt | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState('به دلیل اینکه پولی واریز نشده است.');
  
  // Direct Manual Activation State (Without Receipt)
  const [manualUserIdentifier, setManualUserIdentifier] = useState('typro_user');
  const [manualPlanDuration, setManualPlanDuration] = useState<'1month' | '3month' | '1year'>('1month');
  const [isActivatingManual, setIsActivatingManual] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(20);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load receipts from localStorage and Backend API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedReceipts = localStorage.getItem('typro_pending_subscriptions');
      if (savedReceipts) {
        setPendingReceipts(JSON.parse(savedReceipts));
      }
    } catch {}

    const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');
    fetch(`${apiBase}/admin/subscriptions/receipts`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PendingReceipt[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setPendingReceipts((prev) => {
            const map = new Map<string, PendingReceipt>();
            data.forEach((r) => map.set(r.id, r));
            prev.forEach((r) => {
              if (!map.has(r.id)) map.set(r.id, r);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Approve Receipt & Activate Subscription
  const handleApproveReceipt = async (receipt: PendingReceipt) => {
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });

    const updated = pendingReceipts.map((r) =>
      r.id === receipt.id ? { ...r, status: 'approved' as const, rejectionReason: undefined } : r
    );
    setPendingReceipts(updated);

    // 1. Call Backend API
    const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');
    try {
      await fetch(`${apiBase}/admin/subscriptions/receipts/${receipt.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
    } catch (e) {
      console.warn('Backend receipt approve failed:', e);
    }

    // 2. Persist in localStorage and update user perks
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_pending_subscriptions', JSON.stringify(updated));
      localStorage.setItem('typro_user_subscription', receipt.planId);
      localStorage.setItem('typro_user_is_subscribed', 'true');
      localStorage.removeItem('typro_last_subscription_rejection');

      // Bonus coins
      const prevCoins = Number(localStorage.getItem('typro_user_coins') || '0');
      const bonus = receipt.planId === 'premium-yearly' ? 2000 : 500;
      localStorage.setItem('typro_user_coins', String(prevCoins + bonus));

      // Push user notification
      try {
        const notifs = JSON.parse(localStorage.getItem('typro_user_notifications') || '[]');
        notifs.unshift({
          id: `notif-appr-${Date.now()}`,
          category: 'rewards',
          title: '🎉 اشتراک ویژه شما تایید و فعال شد!',
          desc: `فیش واریزی شما تایید گردید و دسترسی به تمام امکانات ${receipt.planName} فعال شد.`,
          time: 'هم‌اکنون',
          read: false,
          popupShown: true,
          actionLabel: 'ورود به مسابقه زنده',
          actionUrl: '/live-race',
        });
        localStorage.setItem('typro_user_notifications', JSON.stringify(notifs));
        window.dispatchEvent(new Event('typro_notifications_updated'));
      } catch {}

      window.dispatchEvent(new Event('typro_economy_updated'));
    }

    showToast(`✅ اشتراک ${receipt.planName} برای کاربر «${receipt.userName}» با موفقیت فعال شد.`);
    setSelectedReceiptForPreview(null);
  };

  // Trigger Rejection Modal
  const handleRejectReceipt = (receipt: PendingReceipt) => {
    setRejectingReceipt(receipt);
    setCustomRejectionReason('به دلیل عدم واریز وجه یا عدم تطابق شماره پیگیری.');
  };

  // Confirm Reject with custom reason written by Admin
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReceipt) return;

    const reason = customRejectionReason.trim() || 'به دلیل عدم واریز وجه یا عدم تطابق فیش.';
    const updated = pendingReceipts.map((r) =>
      r.id === rejectingReceipt.id
        ? { ...r, status: 'rejected' as const, rejectionReason: reason }
        : r
    );
    setPendingReceipts(updated);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');
    try {
      await fetch(`${apiBase}/admin/subscriptions/receipts/${rejectingReceipt.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionReason: reason }),
      });
    } catch (e) {
      console.warn('Backend receipt reject failed:', e);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_pending_subscriptions', JSON.stringify(updated));
      localStorage.setItem('typro_last_subscription_rejection', reason);
      localStorage.setItem('typro_user_is_subscribed', 'false');
      localStorage.removeItem('typro_user_subscription');

      try {
        const notifs = JSON.parse(localStorage.getItem('typro_user_notifications') || '[]');
        notifs.unshift({
          id: `notif-rej-${Date.now()}`,
          category: 'system',
          title: '❌ عدم تایید رسید پرداخت اشتراک',
          desc: `فیش واریزی شما به دلیل «${reason}» توسط مدیریت رد شد.`,
          time: 'هم‌اکنون',
          read: false,
          actionLabel: 'ارسال مجدد فیش',
          actionUrl: '/subscription',
        });
        localStorage.setItem('typro_user_notifications', JSON.stringify(notifs));
        window.dispatchEvent(new Event('typro_notifications_updated'));
      } catch {}
    }

    showToast(`❌ فیش واریزی کاربر «${rejectingReceipt.userName}» با دلیل «${reason}» رد شد.`);
    setRejectingReceipt(null);
    setSelectedReceiptForPreview(null);
  };

  // Direct Manual Subscription Activation by Admin (No receipt required!)
  const handleDirectActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserIdentifier.trim()) {
      showToast('⚠️ لطفاً نام کاربری یا شماره موبایل کاربر را وارد کنید.');
      return;
    }

    setIsActivatingManual(true);
    const planName =
      manualPlanDuration === '1month'
        ? 'VIP طلایی یک‌ماهه (۳۰ روز)'
        : manualPlanDuration === '3month'
        ? 'VIP طلایی سه‌ماهه (۹۰ روز)'
        : 'VIP طلایی یک‌ساله (۳۶۵ روز)';
    const planId = manualPlanDuration === '1year' ? 'premium-yearly' : 'premium-monthly';
    const days = manualPlanDuration === '1month' ? 30 : manualPlanDuration === '3month' ? 90 : 365;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    // 1. Call Backend API to update user subscription and create persistent VIP notification
    const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');
    try {
      await fetch(`${apiBase}/admin/users/${encodeURIComponent(manualUserIdentifier.trim())}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName, days, active: true }),
      });
    } catch (err) {
      console.warn('Backend manual subscription activation failed:', err);
    }

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    if (typeof window !== 'undefined') {
      const currentCurId = localStorage.getItem('typro_user_id');
      const currentCurUsername = localStorage.getItem('typro_username');
      const currentCurMobile = localStorage.getItem('typro_profile_phone');
      const isTargetingCurrent =
        manualUserIdentifier === currentCurId ||
        manualUserIdentifier === currentCurUsername ||
        manualUserIdentifier === currentCurMobile;

      if (isTargetingCurrent) {
        localStorage.setItem('typro_user_subscription', planName);
        localStorage.setItem('typro_user_is_subscribed', 'true');
        localStorage.removeItem('typro_last_subscription_rejection');
        localStorage.setItem('typro_user_sub_expires_at', expiresAt);

        // Award coins
        const prevCoins = Number(localStorage.getItem('typro_user_coins') || '0');
        const bonus = manualPlanDuration === '1year' ? 2000 : 600;
        localStorage.setItem('typro_user_coins', String(prevCoins + bonus));

        try {
          const notifs = JSON.parse(localStorage.getItem('typro_user_notifications') || '[]');
          notifs.unshift({
            id: `notif-vip-direct-${Date.now()}`,
            category: 'rewards',
            title: '👑 اشتراک ویژه VIP شما فعال شد!',
            desc: `طرح «${planName}» با موفقیت توسط مدیریت برای حساب شما فعال گردید. اکنون تمام مزایای ویژه در دسترس شماست.`,
            time: 'هم‌اکنون',
            read: false,
            popupShown: true,
            actionLabel: 'مشاهده جزییات اشتراک',
            actionUrl: '/subscription',
          });
          localStorage.setItem('typro_user_notifications', JSON.stringify(notifs));
          window.dispatchEvent(new Event('typro_notifications_updated'));
        } catch {}
      }

      // Update registered users cache if exists
      try {
        const regRaw = localStorage.getItem('typro_registered_users');
        if (regRaw) {
          const reg = JSON.parse(regRaw);
          const updated = reg.map((r: any) =>
            r.id === manualUserIdentifier || r.username === manualUserIdentifier || r.mobile === manualUserIdentifier
              ? { ...r, subscription: planName, isSubscribed: true, subscriptionPlan: planName, subscriptionExpiresAt: expiresAt }
              : r
          );
          localStorage.setItem('typro_registered_users', JSON.stringify(updated));
        }
      } catch {}

      // Also record in pending/active subscriptions as admin-granted
      const adminGrantedReceipt: PendingReceipt = {
        id: `admin-grant-${Date.now()}`,
        userId: manualUserIdentifier,
        userName: manualUserIdentifier,
        userEmail: `${manualUserIdentifier}@typro.ir`,
        planId: planId,
        planName: `${planName} (فعال‌سازی مستقیم مدیر)`,
        amount: 0,
        discountCode: 'ADMIN_DIRECT',
        trackingCode: 'ADMIN_MANUAL_PASS',
        senderCard: 'تایید مستقیم مدیریت',
        receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        submittedAt: new Date().toISOString(),
        status: 'approved',
      };

      const updated = [adminGrantedReceipt, ...pendingReceipts];
      setPendingReceipts(updated);
      localStorage.setItem('typro_pending_subscriptions', JSON.stringify(updated));
    }

    showToast(`👑 ${planName} برای کاربر «${manualUserIdentifier}» با موفقیت فعال گردید.`);
    setIsActivatingManual(false);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setCoupons([
      { code: newCode.toUpperCase().trim(), discountPct: newDiscount, usesLeft: 100, totalUsed: 0, active: true },
      ...coupons,
    ]);
    setNewCode('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c)));
  };

  const pendingCount = pendingReceipts.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">
              ← بازگشت به داشبورد ادمین
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            مدیریت اشتراک‌های پرو، فیش‌های واریزی و کدهای تخفیف
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            بررسی و تایید آنی فیش‌های بانکی کاربران، مدیریت کدهای تخفیف و آمار درآمد ماهانه تکرارشونده.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'receipts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>فیش‌های بانکی کاربران</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                {pendingCount} جدید
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>آمار و طرح‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'coupons'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>کدهای تخفیف</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>تغییرات با موفقیت در سیستم اعمال گردید.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PENDING BANK RECEIPTS REVIEW & APPROVAL */}
      {/* ========================================================================= */}
      {activeTab === 'receipts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Direct Manual Subscription Activation Card */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    فعال‌سازی مستقیم و دستی اشتراک پرو (بدون نیاز به آپلود فیش)
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">
                    مدیر می‌تواند مستقیماً برای هر کاربر (با وارد کردن نام کاربری یا شماره موبایل) اشتراک ۱ ماهه، ۳ ماهه یا ۱ ساله را فعال کند.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDirectActivate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  نام کاربری یا شماره موبایل کاربر:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: typro_user یا 09120000000"
                  value={manualUserIdentifier}
                  onChange={(e) => setManualUserIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold text-purple-200 block">
                  مدت زمان فعال‌سازی اشتراک:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setManualPlanDuration('1month')}
                    className={`py-2 rounded-lg transition text-center ${
                      manualPlanDuration === '1month'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-purple-200 hover:text-white'
                    }`}
                  >
                    ۱ ماهه (۳۰ روز)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPlanDuration('3month')}
                    className={`py-2 rounded-lg transition text-center ${
                      manualPlanDuration === '3month'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-purple-200 hover:text-white'
                    }`}
                  >
                    ۳ ماهه (۹۰ روز)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPlanDuration('1year')}
                    className={`py-2 rounded-lg transition text-center ${
                      manualPlanDuration === '1year'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-purple-200 hover:text-white'
                    }`}
                  >
                    ۱ ساله (۳۶۵ روز)
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isActivatingManual}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer h-10"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isActivatingManual ? 'در حال فعال‌سازی...' : 'فعال‌سازی فوری اشتراک'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-base text-slate-900">
                  درخواست‌های واریز کارت به کارت در انتظار تایید ({pendingCount} فیش جدید)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                با تایید هر فیش، اشتراک پرو کاربر بلافاصله فعال می‌شود.
              </span>
            </div>

            {pendingReceipts.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">هیچ فیش واریزی در انتظار بررسی نیست.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3">تصویر رسید</th>
                      <th className="p-3">کاربر</th>
                      <th className="p-3">طرح انتخابی</th>
                      <th className="p-3">مبلغ پرداختی</th>
                      <th className="p-3">کد پیگیری</th>
                      <th className="p-3">زمان ثبت</th>
                      <th className="p-3">وضعیت</th>
                      <th className="p-3 text-center">عملیات ادمین</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {pendingReceipts.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition">
                        {/* Receipt Thumbnail */}
                        <td className="p-3">
                          <div
                            onClick={() => setSelectedReceiptForPreview(r)}
                            className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 cursor-pointer relative group flex items-center justify-center shadow-xs"
                          >
                            <img
                              src={r.receiptImage}
                              alt="Receipt"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900">{r.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{r.userEmail}</div>
                        </td>

                        <td className="p-3 font-bold text-blue-700">{r.planName}</td>

                        <td className="p-3 font-mono font-black text-slate-900">
                          {r.amount.toLocaleString('fa-IR')} تومان
                          {r.discountCode && (
                            <span className="block text-[10px] text-emerald-600 font-mono">
                              با کد {r.discountCode}
                            </span>
                          )}
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-800">
                          {r.trackingCode}
                          <span className="block text-[10px] text-slate-400">کارت: {r.senderCard}</span>
                        </td>

                        <td className="p-3 text-slate-500 text-[11px] font-mono">
                          {new Date(r.submittedAt).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status === 'approved'
                              ? 'تایید و فعال شد'
                              : r.status === 'rejected'
                              ? 'رد شده'
                              : 'در انتظار بررسی'}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          {r.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleApproveReceipt(r)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>تایید و فعال‌سازی</span>
                              </button>
                              <button
                                onClick={() => handleRejectReceipt(r)}
                                className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] transition"
                              >
                                رد فیش
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">اقدام انجام شده</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLANS & MRR OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">مشترکین فعال پرو</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">۵,۲۶۰ کاربر</div>
              <span className="text-[11px] text-emerald-600 font-bold block">+۱۴٪ رشد نسبت به ماه قبل</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">درآمد ماهانه تکرارشونده (MRR)</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">۲۸۴,۰۰۰,۰۰۰ تومان</div>
              <span className="text-[11px] text-slate-400 font-mono block">میانگین خرید هر کاربر: ۵۴,۰۰۰ تومان</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">نرخ تمدید خودکار اشتراک</span>
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">۸۸.۴٪</div>
              <span className="text-[11px] text-purple-600 font-bold block">نرخ ریزش کم (Churn &lt; ۱۲٪)</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
              طرح‌های اشتراک پریمیوم تایپرو
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      فعال در درگاه
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div>تعرفه: <strong className="font-mono">{p.priceToman.toLocaleString('fa-IR')} تومان</strong></div>
                    <div>تخفیف پیش‌فرض: <strong className="font-mono text-emerald-600">{p.discountPct}٪</strong></div>
                    <div>مشترکین: <strong className="font-mono text-blue-600">{p.subscribersCount.toLocaleString('fa-IR')} نفر</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COUPONS GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            <span>کدهای تخفیف و بن‌های خرید فعال (Coupons)</span>
          </h3>

          <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">کد تخفیف جدید (حروف انگلیسی)</label>
              <input
                type="text"
                required
                placeholder="SUMMER1405"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">درصد تخفیف</label>
              <input
                type="number"
                min={5}
                max={90}
                required
                value={newDiscount}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm h-10"
            >
              تولید کد تخفیف جدید
            </button>
          </form>

          {/* Coupons Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">کد کوپن</th>
                  <th className="p-3">درصد تخفیف</th>
                  <th className="p-3">استفاده‌شده</th>
                  <th className="p-3">ظرفیت باقیمانده</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-blue-600">{c.code}</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">{c.discountPct}٪</td>
                    <td className="p-3 font-mono text-slate-600">{c.totalUsed} بار</td>
                    <td className="p-3 font-mono text-slate-600">{c.usesLeft} بار</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCoupon(c.code)}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-bold"
                      >
                        {c.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Receipt Image Preview Modal */}
      {selectedReceiptForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <span>تصویر فیش واریزی کاربر: {selectedReceiptForPreview.userName}</span>
              </h3>
              <button
                onClick={() => setSelectedReceiptForPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto flex items-center justify-center bg-slate-900 rounded-2xl p-2">
              <img
                src={selectedReceiptForPreview.receiptImage}
                alt="Full Receipt"
                className="max-h-[55vh] object-contain rounded-xl"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                طرح: <strong>{selectedReceiptForPreview.planName}</strong>
              </div>
              <div>
                مبلغ: <strong className="font-mono">{selectedReceiptForPreview.amount.toLocaleString('fa-IR')} تومان</strong>
              </div>
              <div>
                شماره پیگیری: <strong className="font-mono">{selectedReceiptForPreview.trackingCode}</strong>
              </div>
              <div>
                کارت واریزکننده: <strong className="font-mono">{selectedReceiptForPreview.senderCard}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceiptForPreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                بستن
              </button>
              {selectedReceiptForPreview.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleRejectReceipt(selectedReceiptForPreview)}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                  >
                    رد فیش (با ثبت دلیل)
                  </button>
                  <button
                    onClick={() => handleApproveReceipt(selectedReceiptForPreview)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>تایید فیش و فعال‌سازی فوری اشتراک</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Rejection Modal With Custom Reason */}
      {rejectingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>رد فیش واریزی کاربر: {rejectingReceipt.userName}</span>
              </div>
              <button
                onClick={() => setRejectingReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              لطفاً دلیل رد فیش را مشخص کنید. این پیام عیناً برای کاربر در صفحه اشتراک نمایش داده خواهد شد تا از علت عدم تایید مطلع گردد.
            </p>

            {/* Quick preset buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">دلایل آماده سریع:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'به دلیل اینکه پولی واریز نشده است.',
                  'تصویر فیش ناخوانا است؛ لطفاً تصویر واضح ارسال نمایید.',
                  'مبلغ واریزی کمتر از تعرفه طرح انتخابی است.',
                  'شماره پیگیری و شماره کارت تطابق ندارد.',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomRejectionReason(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  متن دلیل رد درخواست (قابل ویرایش توسط ادمین):
                </label>
                <textarea
                  required
                  rows={3}
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="دلیل رد فیش واریزی را بنویسید..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/25 transition cursor-pointer"
                >
                  ثبت رد فیش و ارسال دلیل به کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
