'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Check,
  Shield,
  Zap,
  Sparkles,
  Award,
  Star,
  CreditCard,
  X,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  FileCheck,
  Copy,
  Ticket,
  Crown,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceAmount: number;
  period: string;
  features: string[];
  isPopular: boolean;
  btnText: string;
}

export default function SubscriptionPage() {
  const { user } = useAuth();

  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [activePlanTitle, setActivePlanTitle] = useState<string>('VIP طلایی');
  const [expiryDateText, setExpiryDateText] = useState<string>('');
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<Plan | null>(null);

  // Subscription verification status: 'none' | 'pending' | 'approved' | 'rejected'
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isDirectAdmin, setIsDirectAdmin] = useState<boolean>(false);

  // Discount code & Referral coupons
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Receipt transfer state
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderCard, setSenderCard] = useState('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'طرح پایه (رایگان)',
      price: '۰ تومان',
      priceAmount: 0,
      period: 'همیشگی',
      features: [
        'دسترسی به تمامی آزمون‌های تایپ ده‌انگشتی',
        'دسترسی به دروس سطح مقدماتی آکادمی',
        'شرکت در تمامی مسابقات عمومی Live Race',
        'محاسبه دقیق سرعت (WPM) و دقت واقعی',
        'پروفایل و دستاوردهای پایه',
      ],
      isPopular: false,
      btnText: 'طرح فعال فعلی شما',
    },
    {
      id: 'premium-monthly',
      name: 'اشتراک تایپرو پرو (یک‌ماهه)',
      price: '۱۵۰,۰۰۰ تومان',
      priceAmount: 150000,
      period: 'ماهانه',
      features: [
        'تمامی امکانات طرح پایه',
        'دسترسی نامحدود به ۲۶۰+ درس آکادمی',
        'تحلیل عمیق Typing DNA و نقشه حرارتی کیبورد',
        'تمرین‌های تطبیقی هوش مصنوعی برای کلیدهای ضعیف',
        'دریافت گواهینامه‌های رسمی با هولوگرام استعلام',
        'پوسته‌های انحصاری خودرو و تم‌های پیست',
        'پشتیبانی اولویت‌دار و بدون تبلیغات',
      ],
      isPopular: true,
      btnText: 'ارتقا به اشتراک پرو',
    },
    {
      id: 'premium-yearly',
      name: 'اشتراک حرفه‌ای سالانه (با تخفیف ویژه)',
      price: '۴۹۰,۰۰۰ تومان',
      priceAmount: 490000,
      period: 'سالانه (۴۰٪ تخفیف)',
      features: [
        'تمام مزایای اشتراک پرو برای ۱۲ ماه کامل',
        '۲,۰۰۰ سکه تایپرو هدیه فعال‌سازی',
        'نشان متمایز الماس در جدول مشاهیر',
        'صندوق افسانه‌ای طلایی (Legendary Grand Chest)',
        'دسترسی به حالت‌های ویژه آرکید و تالار بازی‌ها',
      ],
      isPopular: false,
      btnText: 'خرید سالانه با تخفیف',
    },
  ];

  // Auto read coupon from query param safely on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const couponParam = params.get('coupon');
    if (couponParam) {
      setDiscountCode(couponParam.toUpperCase().trim());
      applyCode(couponParam.toUpperCase().trim());
    }
  }, []);

  // Sync user status and check pending/approved/rejected requests
  const checkUserStatus = () => {
    if (typeof window === 'undefined') return;
    const savedPlan = localStorage.getItem('typro_user_subscription');
    const isSub = localStorage.getItem('typro_user_is_subscribed');
    const lastRejection = localStorage.getItem('typro_last_subscription_rejection');
    const expiresAt = user?.subscriptionExpiresAt || localStorage.getItem('typro_user_sub_expires_at');

    if (expiresAt) {
      try {
        const d = new Date(expiresAt);
        if (d.getFullYear() >= 2090) {
          setExpiryDateText('مادام‌العمر');
        } else {
          setExpiryDateText(d.toLocaleDateString('fa-IR'));
        }
      } catch {
        setExpiryDateText('فعال');
      }
    }

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const isDirect = Boolean(
      isAdmin ||
      user?.isDirectAdmin ||
      user?.subscriptionMethod === 'direct_admin' ||
      localStorage.getItem('typro_user_is_direct_admin') === 'true'
    );
    setIsDirectAdmin(isDirect);

    const isUserVip = Boolean(
      isAdmin ||
      user?.isSubscribed ||
      isSub === 'true' ||
      isDirect ||
      (user?.subscription && user.subscription !== 'رایگان') ||
      (user?.subscriptionPlan && user.subscriptionPlan !== 'رایگان')
    );

    const activeTitle =
      user?.subscriptionPlan ||
      user?.subscription ||
      savedPlan ||
      (isAdmin ? 'VIP طلایی (دسترسی نامحدود مدیریت)' : 'VIP طلایی');

    if (isUserVip && (activeTitle !== 'رایگان' || isAdmin || isDirect)) {
      const finalTitle = activeTitle === 'رایگان' ? (isAdmin ? 'VIP طلایی (دسترسی نامحدود مدیریت)' : 'VIP طلایی') : activeTitle;
      const isYearly = finalTitle.includes('سال') || finalTitle.includes('yearly') || finalTitle.includes('۳۶۵') || isAdmin;
      setCurrentPlanId(isYearly ? 'premium-yearly' : 'premium-monthly');
      setActivePlanTitle(finalTitle);
      setRequestStatus('approved');
      setRejectionReason(null);
      return;
    }

    const pending = localStorage.getItem('typro_pending_subscriptions');
    if (pending) {
      try {
        const list = JSON.parse(pending);
        if (Array.isArray(list) && list.length > 0) {
          const userRequests = list.filter(
            (item: any) =>
              !user?.id ||
              item.userId === user.id ||
              item.userName === (user.displayName || user.username)
          );
          const latestReq = userRequests.length > 0 ? userRequests[0] : list[0];
          if (latestReq.status === 'pending') {
            setRequestStatus('pending');
            setRejectionReason(null);
            return;
          } else if (latestReq.status === 'rejected') {
            setRequestStatus('rejected');
            setRejectionReason(
              latestReq.rejectionReason ||
                lastRejection ||
                'پرداختی صورت نگرفته به شماره کارت ۶۲۱۹۸۶۱۴۷۳۸۱۸۲۶۷'
            );
            return;
          } else if (latestReq.status === 'approved') {
            setRequestStatus('approved');
            const reqPlan = latestReq.planId || 'premium-monthly';
            setCurrentPlanId(reqPlan);
            setActivePlanTitle(latestReq.planName || 'VIP طلایی');
            setRejectionReason(null);
            return;
          }
        }
      } catch {}
    }

    if (lastRejection) {
      setRequestStatus('rejected');
      setRejectionReason(lastRejection);
    } else {
      setRequestStatus('none');
    }
  };

  useEffect(() => {
    checkUserStatus();
    window.addEventListener('storage', checkUserStatus);
    return () => window.removeEventListener('storage', checkUserStatus);
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenPurchase = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      showToast('این طرح هم‌اکنون برای حساب شما فعال است.');
      return;
    }
    setSelectedPlanForPurchase(plan);
    setReceiptImage(null);
    setTrackingCode('');
    setSenderName(user?.displayName || user?.username || '');
    setSenderCard('');
  };

  const applyCode = (codeToApply: string) => {
    const clean = codeToApply.toUpperCase().trim();
    if (clean === 'REF-CHAMP-50') {
      setDiscountApplied(true);
      setDiscountPercent(50);
      showToast('🎉 کد تخفیف ۵۰ درصدی (معرفی دوستان) با موفقیت اعمال شد!');
    } else if (clean === 'REF-INVITE-25') {
      setDiscountApplied(true);
      setDiscountPercent(25);
      showToast('🎉 کد تخفیف ۲۵ درصدی (معرفی دوستان) با موفقیت اعمال شد!');
    } else if (clean === 'TYPRO20' || clean === 'عیدانه') {
      setDiscountApplied(true);
      setDiscountPercent(20);
      showToast('کد تخفیف ۲۰ درصدی با موفقیت اعمال شد!');
    } else {
      setDiscountApplied(false);
      setDiscountPercent(0);
      showToast('کد تخفیف وارد شده نامعتبر یا منقضی است.');
    }
  };

  const handleApplyDiscount = () => {
    applyCode(discountCode);
  };

  // Image Upload handler for receipt
  const handleReceiptImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('لطفاً یک فایل تصویری (PNG یا JPG) انتخاب نمایید.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم تصویر فیش نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit card-to-card receipt for admin approval
  const handleSubmitReceiptForApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPurchase) return;

    if (!receiptImage) {
      showToast('لطفاً تصویر فیش واریزی را بارگذاری نمایید.');
      return;
    }

    if (!trackingCode.trim()) {
      showToast('لطفاً شماره پیگیری یا شماره ارجاع را وارد کنید.');
      return;
    }

    setIsSubmittingReceipt(true);

    const calculatedPrice = discountApplied
      ? Math.round(selectedPlanForPurchase.priceAmount * (1 - discountPercent / 100))
      : selectedPlanForPurchase.priceAmount;

    const newPendingRequest = {
      id: `req-${Date.now()}`,
      userId: user?.id || 'usr-guest-99',
      userName: senderName.trim() || user?.displayName || user?.username || 'کاربر تایپرو',
      userEmail: user?.email || 'user@typro.ir',
      planId: selectedPlanForPurchase.id,
      planName: selectedPlanForPurchase.name,
      amount: calculatedPrice,
      discountCode: discountApplied ? discountCode : null,
      trackingCode: trackingCode.trim(),
      senderCard: senderCard.trim() || 'نامشخص',
      receiptImage: receiptImage,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    // 1. Post to Backend API
    const apiBase = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');
    fetch(`${apiBase}/admin/subscriptions/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPendingRequest),
    }).catch((e) => console.warn('Backend receipt submit failed:', e));

    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('typro_pending_subscriptions') || '[]');
        existing.unshift(newPendingRequest);
        localStorage.setItem('typro_pending_subscriptions', JSON.stringify(existing));
        localStorage.removeItem('typro_last_subscription_rejection');

        // Add user notification
        const existingNotifs = JSON.parse(localStorage.getItem('typro_user_notifications') || '[]');
        existingNotifs.unshift({
          id: `notif-rcpt-${Date.now()}`,
          category: 'rewards',
          title: 'رسید پرداخت اشتراک ثبت شد',
          desc: `فیش واریزی شما برای طرح «${selectedPlanForPurchase.name}» ثبت شد و برای بررسی ادمین ارسال گردید. به محض تایید، اشتراک فعال خواهد شد.`,
          time: 'هم‌اکنون',
          read: false,
          actionLabel: 'پیگیری وضعیت',
          actionUrl: '/subscription',
        });
        localStorage.setItem('typro_user_notifications', JSON.stringify(existingNotifs));
        window.dispatchEvent(new Event('typro_notifications_updated'));
      } catch {}
    }

    setTimeout(() => {
      setIsSubmittingReceipt(false);
      setRequestStatus('pending');
      setSelectedPlanForPurchase(null);
      showToast('✅ درخواست فعال‌سازی اشتراک ثبت شد و جهت بررسی به ادمین ارسال گردید.');
    }, 600);
  };

  const finalPrice = selectedPlanForPurchase
    ? discountApplied
      ? Math.round(selectedPlanForPurchase.priceAmount * (1 - discountPercent / 100))
      : selectedPlanForPurchase.priceAmount
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Subscription Banner */}
      {requestStatus === 'approved' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/15 border-2 border-amber-400 shadow-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-6 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              <Crown className="w-8 h-8 fill-current" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[11px] flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDirectAdmin ? 'وضعیت اشتراک: مستقیم فعال شده ✓' : 'وضعیت اشتراک: فعال شده ✓'}</span>
                </span>
                {isDirectAdmin && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 border border-amber-400 font-extrabold text-[11px] flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>فعال‌سازی مستقیم توسط مدیریت سیستم</span>
                  </span>
                )}
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  طرح ویژه فعال شما: <span className="text-amber-600 font-extrabold">{activePlanTitle}</span>
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                تمامی امکانات اختصاصی تایپرو از جمله پیست‌های اتومبیل‌رانی VIP، ۲ برابر سکه، تحلیل عمیق Typing DNA، نقشه حرارتی کیبورد و پوسته‌های ویژه برای حساب شما فعال هستند.
                {expiryDateText && (
                  <span className="block mt-1 text-slate-800 font-bold">
                    اعتبار اشتراک: <span className="text-emerald-700">{expiryDateText}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/live-race"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>ورود به پیست مسابقات VIP</span>
            </Link>
          </div>
        </div>
      )}

      {/* Pending Status Banner */}
      {requestStatus === 'pending' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30 shrink-0">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px]">
                  در صف تایید
                </span>
                <h4 className="font-black text-base sm:text-xl text-slate-900">
                  درخواست شما برای فعال‌سازی اشتراک ارسال شده و در حال بررسی توسط ادمین است
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                فیش واریزی شما برای واریز به شماره کارت ۶۲۱۹۸۶۱۴۷۳۸۱۸۲۶۷ دریافت گردید. بلافاصله پس از بررسی و تایید توسط تیم مدیریت، اشتراک پرو و نقشه حرارتی کیبورد برای شما فعال خواهد شد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-xs font-bold">
            <span className="px-4 py-2.5 rounded-xl bg-amber-200/90 text-amber-950 border border-amber-300">
              وضعیت: در انتظار تایید ادمین ⏳
            </span>
          </div>
        </div>
      )}

      {/* Rejected Status Banner */}
      {requestStatus === 'rejected' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-rose-600/30 shrink-0">
              ✕
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[11px]">
                  نتیجه بررسی
                </span>
                <h4 className="font-black text-base sm:text-xl text-rose-900">
                  درخواست شما رد شد
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 font-extrabold leading-relaxed">
                دلیل: {rejectionReason || 'پرداختی صورت نگرفته به شماره کارت ۶۲۱۹۸۶۱۴۷۳۸۱۸۲۶۷'}
              </p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                چنانچه پرداخت را انجام داده‌اید، لطفاً از واریز به شماره کارت ۶۲۱۹۸۶۱۴۷۳۸۱۸۲۶۷ اطمینان حاصل کرده و فیش معتبر را مجدداً ارسال فرمایید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => handleOpenPurchase(plans[1])}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-600/25 transition cursor-pointer"
            >
              ارسال مجدد فیش واریزی
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          عضویت ویژه و ارتقای حساب تایپرو
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          ارتقای مهارت بدون مرز با اشتراک ویژه تایپرو
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          دسترسی کامل به ۲۶۰+ درس آکادمی، تحلیل‌های هوش مصنوعی، صدور گواهینامه معتبر، تالار بازی‌های متنوع و پوسته‌های اختصاصی.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>تضمین شفافیت: واریز مستقیم کارت به کارت با تایید و فعال‌سازی توسط ادمین</span>
        </div>
      </div>


      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isActive =
            requestStatus === 'approved'
              ? plan.id === currentPlanId && plan.id !== 'free'
              : plan.id === 'free';

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 border-2 transition-all flex flex-col justify-between space-y-6 ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-xl shadow-emerald-500/10 relative scale-102 ring-2 ring-emerald-400/30'
                  : plan.isPopular
                  ? 'border-blue-600 shadow-xl shadow-blue-500/10 relative scale-102'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {isActive ? (
                <span className="absolute -top-3 right-6 px-3.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-md shadow-emerald-600/30">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>طرح فعال حساب شما</span>
                </span>
              ) : plan.isPopular ? (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wide">
                  پیشنهاد ویژه تایپرو
                </span>
              ) : null}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-slate-900">{plan.name}</h3>
                    {isActive && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        فعال ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 font-mono">{plan.price}</span>
                    <span className="text-xs text-slate-400">/ {plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">امکانات شامل:</span>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleOpenPurchase(plan)}
                disabled={isActive}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition shadow-xs ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 cursor-default border-2 border-emerald-400 font-black'
                    : plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 cursor-pointer'
                    : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                }`}
              >
                {isActive ? 'طرح فعال فعلی شما ✓' : plan.id === 'free' ? 'طرح پایه' : plan.btnText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subscription Checkout & Receipt Modal */}
      {selectedPlanForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">
                  خرید و فعال‌سازی {selectedPlanForPurchase.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForPurchase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Discount Code Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">کد تخفیف (یا کد هدیه معرفی دوستان):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثال: REF-INVITE-25 یا TYPRO20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  اعمال کد
                </button>
              </div>
            </div>

            {/* Payment Method Switcher: Gateway vs Card-to-Card Receipt */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">انتخاب روش پرداخت:</label>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  پرداخت منحصراً از طریق <strong>کارت به کارت</strong> و آپلود تصویر فیش واریزی انجام می‌شود و پس از تایید توسط ادمین فعال می‌گردد.
                </span>
              </div>
            </div>

            {/* Card-to-Card Transfer & Receipt Image Upload */}
            <form onSubmit={handleSubmitReceiptForApproval} className="space-y-4 pt-1">
                {/* Bank Card Info */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3 text-xs border border-slate-800 shadow-md">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-bold">شماره کارت جهت واریز وجه:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('6219861473818267');
                        showToast('شماره کارت با موفقیت کپی شد ✓');
                      }}
                      className="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی شماره کارت</span>
                    </button>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-widest text-center py-1 select-all" dir="ltr">
                    6219 - 8614 - 7381 - 8267
                  </div>
                  <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1 border-t border-white/10">
                    <span>مبلغ قابل پرداخت (یک‌ماهه):</span>
                    <strong className="text-amber-300 font-mono text-sm">{finalPrice.toLocaleString('fa-IR')} تومان</strong>
                  </div>
                </div>

                {/* Upload Receipt Image */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    تصویر فیش یا اسکرین‌شات رسید پرداخت (الزامی):
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptImageUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      receiptImage
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20'
                    }`}
                  >
                    {receiptImage ? (
                      <div className="space-y-2">
                        <img
                          src={receiptImage}
                          alt="Receipt Preview"
                          className="max-h-32 rounded-xl object-contain mx-auto shadow-xs"
                        />
                        <span className="text-xs font-bold text-emerald-700 block">
                          تصویر فیش انتخاب شد ✓ (جهت تغییر کلیک کنید)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">کلیک جهت انتخاب و آپلود عکس فیش واریزی</span>
                        <span className="text-[10px] text-slate-400">فرمت‌های مجاز: PNG, JPG, WEBP (حداکثر ۵ مگابایت)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tracking Code & Sender Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">شماره پیگیری / ارجاع واریز:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ۱۸۲۷۳۶۴۵"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">نام یا ۴ رقم آخر کارت واریزکننده:</label>
                    <input
                      type="text"
                      placeholder="مثال: ۱۲۳۴ یا علیرضا"
                      value={senderCard}
                      onChange={(e) => setSenderCard(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>

                {/* Invoice Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>مبلغ طرح:</span>
                    <span className="font-mono font-bold">
                      {selectedPlanForPurchase.priceAmount.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>تخفیف اعمال‌شده ({discountPercent}٪):</span>
                      <span className="font-mono">
                        -{(selectedPlanForPurchase.priceAmount * (discountPercent / 100)).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black text-slate-900">
                    <span>مبلغ واریز شده:</span>
                    <span className="text-base text-blue-600 font-mono">
                      {finalPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForPurchase(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReceipt}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{isSubmittingReceipt ? 'در حال ارسال...' : 'درخواست برای فعال شدن اشتراک'}</span>
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
