'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Award,
  Trophy,
  Shield,
  Zap,
  CheckCircle2,
  Calendar,
  Flame,
  Star,
  Activity,
  Lock,
  Camera,
  Edit3,
  Check,
  X,
  Upload,
  Sparkles,
  Car,
  Mail,
  Phone,
  Building2,
  MapPin,
  Trash2,
  Info,
  Crown
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, changePassword } = useAuth();

  const isSubscribed = Boolean(
    user?.isSubscribed ||
    (typeof window !== 'undefined' && localStorage.getItem('typro_user_is_subscribed') === 'true') ||
    (Boolean(user?.subscription) && user?.subscription !== 'رایگان') ||
    (Boolean(user?.subscriptionPlan) && user?.subscriptionPlan !== 'رایگان')
  );

  const subPlanName =
    user?.subscriptionPlan ||
    user?.subscription ||
    (typeof window !== 'undefined' ? localStorage.getItem('typro_user_subscription') : null) ||
    'VIP طلایی';

  // Profile data state
  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_name');
      if (saved && saved !== 'علیرضا رضایی' && saved !== 'علی رضایی' && !saved.includes('رضایی')) {
        return saved;
      }
    }
    return user?.displayName && !user.displayName.includes('رضایی') ? user.displayName : 'کاربر تایپرو';
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_avatar');
      if (saved !== null) return saved;
    }
    return user?.avatar || '';
  });

  const [bio, setBio] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_bio');
      if (saved !== null) return saved;
    }
    return user?.bio || 'توسعه‌دهنده وب و علاقمند به تایپ سرعتی و دقیق فارسی.';
  });

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_email');
      if (saved !== null) return saved;
    }
    return user?.email || '';
  });

  const [phone, setPhone] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_phone');
      if (saved !== null) return saved;
    }
    return user?.mobile || '';
  });

  const [workplace, setWorkplace] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_workplace');
      if (saved !== null) return saved;
    }
    return user?.workplace || '';
  });

  const [gender, setGender] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_gender');
      if (saved !== null) return saved;
    }
    return user?.gender || '';
  });

  const [workplaceAddress, setWorkplaceAddress] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_workplace_address');
      if (saved !== null) return saved;
    }
    return user?.workplaceAddress || '';
  });

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editAvatar, setEditAvatar] = useState(avatarUrl);
  const [editBio, setEditBio] = useState(bio);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const [editWorkplace, setEditWorkplace] = useState(workplace);
  const [editGender, setEditGender] = useState(gender);
  const [editWorkplaceAddress, setEditWorkplaceAddress] = useState(workplaceAddress);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Change password modal state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword) {
      setPwdError('لطفاً رمز عبور فعلی خود را وارد کنید.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('رمز عبور جدید با تکرار آن مطابقت ندارد.');
      return;
    }

    setIsSubmittingPwd(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsSubmittingPwd(false);

    if (res.success) {
      setPwdSuccess(res.message || 'رمز عبور با موفقیت تغییر یافت.');
      showToast('🔑 رمز عبور شما با موفقیت تغییر یافت.');
      setTimeout(() => {
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwdSuccess(null);
      }, 1500);
    } else {
      setPwdError(res.error || 'خطا در تغییر رمز عبور. لطفاً رمز عبور فعلی را بررسی فرمایید.');
    }
  };

  // Sync with AuthContext user & sanitize legacy names from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('typro_profile_name');
      if (savedName && (savedName === 'علیرضا رضایی' || savedName === 'علی رضایی' || savedName.includes('رضایی'))) {
        const fallback = user?.displayName && !user.displayName.includes('رضایی') ? user.displayName : 'کاربر تایپرو';
        localStorage.setItem('typro_profile_name', fallback);
        setDisplayName(fallback);
        setEditName(fallback);
      }
      const savedEmail = localStorage.getItem('typro_profile_email');
      if (savedEmail && (savedEmail.includes('rezaei') || savedEmail === 'name@gmail.com')) {
        localStorage.removeItem('typro_profile_email');
        setEmail('');
        setEditEmail('');
      }
    }

    if (user?.displayName && !localStorage.getItem('typro_profile_name')) {
      const sanitized = user.displayName.includes('رضایی') ? 'کاربر تایپرو' : user.displayName;
      setDisplayName(sanitized);
      setEditName(sanitized);
    }
    if (user?.avatar && !localStorage.getItem('typro_profile_avatar')) {
      setAvatarUrl(user.avatar);
      setEditAvatar(user.avatar);
    }
    if (user?.bio && !localStorage.getItem('typro_profile_bio')) {
      setBio(user.bio);
      setEditBio(user.bio);
    }
    if (user?.email && !localStorage.getItem('typro_profile_email')) {
      setEmail(user.email);
      setEditEmail(user.email);
    }
    if (user?.mobile && !localStorage.getItem('typro_profile_phone')) {
      setPhone(user.mobile);
      setEditPhone(user.mobile);
    }
    if (user?.workplace && !localStorage.getItem('typro_profile_workplace')) {
      setWorkplace(user.workplace);
      setEditWorkplace(user.workplace);
    }
    if (user?.gender && !localStorage.getItem('typro_profile_gender')) {
      setGender(user.gender);
      setEditGender(user.gender);
    }
    if (user?.workplaceAddress && !localStorage.getItem('typro_profile_workplace_address')) {
      setWorkplaceAddress(user.workplaceAddress);
      setEditWorkplaceAddress(user.workplaceAddress);
    }
  }, [user]);

  // Real User System Metrics
  const [userStats, setUserStats] = useState({
    bestWpm: 0,
    bestAccuracy: 0,
    consistency: 0,
    recordsBroken: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadStats = () => {
      const wpm = Number(localStorage.getItem('typro_best_wpm') || 0);
      const acc = Number(localStorage.getItem('typro_best_accuracy') || 0);
      const cons = Number(localStorage.getItem('typro_consistency_accuracy') || 0);
      const recs = Number(localStorage.getItem('typro_records_broken') || 0);
      setUserStats({
        bestWpm: wpm,
        bestAccuracy: acc,
        consistency: cons,
        recordsBroken: recs,
      });
    };
    loadStats();
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Direct upload from profile card
  const handleDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('⚠️ حجم تصویر نباید بیشتر از ۳ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setAvatarUrl(dataUrl);
        setEditAvatar(dataUrl);

        if (typeof window !== 'undefined') {
          localStorage.setItem('typro_profile_avatar', dataUrl);
          const savedUser = localStorage.getItem('typro_user');
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              parsed.avatar = dataUrl;
              localStorage.setItem('typro_user', JSON.stringify(parsed));
            } catch {}
          }
          window.dispatchEvent(new Event('typro_profile_avatar_updated'));
        }

        if (updateProfile) {
          updateProfile({ avatar: dataUrl });
        }

        showToast('📷 عکس پروفایل شما با موفقیت آپلود و ذخیره شد.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove avatar to completely empty state
  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setEditAvatar('');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('typro_profile_avatar');
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.avatar = '';
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        } catch {}
      }
      window.dispatchEvent(new Event('typro_profile_avatar_updated'));
    }

    if (updateProfile) {
      updateProfile({ avatar: '' });
    }

    showToast('تصویر پروفایل حذف شد و در وضعیت بدون عکس (خالی) قرار گرفت.');
  };

  // Handle image file upload in edit modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('⚠️ حجم تصویر نباید بیشتر از ۳ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
        showToast('📷 تصویر شما بارگذاری شد. جهت اعمال، دکمه ذخیره را بزنید.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Quick clear handlers for individual fields
  const handleClearEmail = () => {
    setEmail('');
    setEditEmail('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typro_profile_email');
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.email = '';
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        } catch {}
      }
    }
    if (updateProfile) {
      updateProfile({ email: '' });
    }
    showToast('جیمیل با موفقیت حذف شد.');
  };

  const handleClearPhone = () => {
    setPhone('');
    setEditPhone('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typro_profile_phone');
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.mobile = '';
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        } catch {}
      }
    }
    if (updateProfile) {
      updateProfile({ mobile: '' });
    }
    showToast('شماره تماس با موفقیت حذف شد.');
  };

  const handleClearWorkplace = () => {
    setWorkplace('');
    setEditWorkplace('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typro_profile_workplace');
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.workplace = '';
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        } catch {}
      }
    }
    if (updateProfile) {
      updateProfile({ workplace: '' });
    }
    showToast('نام محل کار با موفقیت حذف شد.');
  };

  const handleClearGender = () => {
    setGender('');
    setEditGender('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typro_profile_gender');
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.gender = '';
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        } catch {}
      }
    }
    if (updateProfile) {
      updateProfile({ gender: '' });
    }
    showToast('تعیین جنسیت به حالت نامشخص تغییر یافت.');
  };

  const handleClearWorkplaceAddress = () => {
    setWorkplaceAddress('');
    setEditWorkplaceAddress('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typro_profile_workplace_address');
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.workplaceAddress = '';
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        } catch {}
      }
    }
    if (updateProfile) {
      updateProfile({ workplaceAddress: '' });
    }
    showToast('آدرس محل کار با موفقیت حذف شد.');
  };

  // Open edit modal and load current states
  const openEditModal = () => {
    setEditName(displayName);
    setEditAvatar(avatarUrl);
    setEditBio(bio);
    setEditEmail(email);
    setEditPhone(phone);
    setEditWorkplace(workplace);
    setEditGender(gender);
    setEditWorkplaceAddress(workplaceAddress);
    setIsEditing(true);
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('⚠️ لطفاً نام نمایشی خود را وارد کنید.');
      return;
    }

    const finalName = editName.trim();
    const finalAvatar = editAvatar.trim();
    const finalBio = editBio.trim();
    const finalEmail = editEmail.trim();
    const finalPhone = editPhone.trim();
    const finalWorkplace = editWorkplace.trim();
    const finalGender = editGender.trim();
    const finalWorkplaceAddress = editWorkplaceAddress.trim();

    setDisplayName(finalName);
    setAvatarUrl(finalAvatar);
    setBio(finalBio);
    setEmail(finalEmail);
    setPhone(finalPhone);
    setWorkplace(finalWorkplace);
    setGender(finalGender);
    setWorkplaceAddress(finalWorkplaceAddress);

    // Save to localStorage for instant use across Rivals, Live Race, and entire app
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_profile_name', finalName);
      if (finalAvatar) {
        localStorage.setItem('typro_profile_avatar', finalAvatar);
      } else {
        localStorage.removeItem('typro_profile_avatar');
      }
      localStorage.setItem('typro_profile_bio', finalBio);

      if (finalEmail) {
        localStorage.setItem('typro_profile_email', finalEmail);
      } else {
        localStorage.removeItem('typro_profile_email');
      }

      if (finalPhone) {
        localStorage.setItem('typro_profile_phone', finalPhone);
      } else {
        localStorage.removeItem('typro_profile_phone');
      }

      if (finalWorkplace) {
        localStorage.setItem('typro_profile_workplace', finalWorkplace);
      } else {
        localStorage.removeItem('typro_profile_workplace');
      }

      if (finalGender) {
        localStorage.setItem('typro_profile_gender', finalGender);
      } else {
        localStorage.removeItem('typro_profile_gender');
      }

      if (finalWorkplaceAddress) {
        localStorage.setItem('typro_profile_workplace_address', finalWorkplaceAddress);
      } else {
        localStorage.removeItem('typro_profile_workplace_address');
      }

      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.displayName = finalName;
          parsed.avatar = finalAvatar;
          parsed.bio = finalBio;
          parsed.email = finalEmail;
          parsed.mobile = finalPhone;
          parsed.workplace = finalWorkplace;
          parsed.gender = finalGender;
          parsed.workplaceAddress = finalWorkplaceAddress;
          localStorage.setItem('typro_user', JSON.stringify(parsed));

          // Also update in registered users list for Admin Panel
          const rawReg = localStorage.getItem('typro_registered_users');
          const regList: any[] = rawReg ? JSON.parse(rawReg) : [];
          const idx = regList.findIndex(
            (u: any) => u.id === parsed.id || u.mobile === parsed.mobile || u.username === parsed.username
          );
          if (idx >= 0) {
            regList[idx] = { ...regList[idx], displayName: finalName, email: finalEmail, mobile: finalPhone, workplace: finalWorkplace, gender: finalGender, workplaceAddress: finalWorkplaceAddress, bio: finalBio };
            localStorage.setItem('typro_registered_users', JSON.stringify(regList));
          }
        } catch {}
      }
      window.dispatchEvent(new Event('typro_profile_avatar_updated'));
      window.dispatchEvent(new Event('typro_profile_updated'));
    }

    // Update AuthContext
    if (updateProfile) {
      updateProfile({
        displayName: finalName,
        avatar: finalAvatar,
        bio: finalBio,
        email: finalEmail,
        mobile: finalPhone,
        workplace: finalWorkplace,
        gender: finalGender,
        workplaceAddress: finalWorkplaceAddress,
      });
    }

    setIsEditing(false);
    showToast(`✅ تغییرات پروفایل و مشخصات شما با موفقیت ذخیره شد.`);
  };

  // Dynamic Profile Completion calculation
  const completionPercentage = Math.round(
    (displayName ? 20 : 0) +
    (avatarUrl ? 15 : 0) +
    (email ? 15 : 0) +
    (phone ? 15 : 0) +
    (workplace ? 10 : 0) +
    (gender ? 10 : 0) +
    (workplaceAddress ? 10 : 0) +
    (bio ? 5 : 0)
  );

  const medalsList = [
    {
      title: 'استاد خط پایه',
      desc: 'تایپ بدون خطا با دقت بالای ۹۵٪ و حداقل ۲۰ WPM',
      icon: '🏅',
      isEarned: Boolean(isAuthenticated && userStats.bestAccuracy >= 95 && userStats.bestWpm >= 20),
      requirement: 'دقت ۹۵٪ + ۲۰ WPM',
    },
    {
      title: 'سرعت نور ۱',
      desc: 'دستیابی به ۶۰ کلمه در دقیقه در آزمون رسمی',
      icon: '⚡',
      isEarned: Boolean(isAuthenticated && userStats.bestWpm >= 60),
      requirement: 'سرعت ۶۰ WPM',
    },
    {
      title: 'ادیب کلمات',
      desc: 'دستیابی به حداقل ۴۰ کلمه در دقیقه با دقت ۹۰٪+',
      icon: '📜',
      isEarned: Boolean(isAuthenticated && userStats.bestWpm >= 40 && userStats.bestAccuracy >= 90),
      requirement: 'سرعت ۴۰ WPM با دقت ۹۰٪',
    },
    {
      title: 'پایداری آهنین',
      desc: 'شاخص پایداری و ریتم ضربه‌زنی بالای ۹۵٪',
      icon: '🛡️',
      isEarned: Boolean(isAuthenticated && userStats.consistency >= 95),
      requirement: 'شاخص پایداری ۹۵٪',
    },
    {
      title: 'فاتح پیست',
      desc: 'شکستن حداقل ۱ رکورد سرعت در مسابقات و آزمون‌ها',
      icon: '🏆',
      isEarned: Boolean(isAuthenticated && userStats.recordsBroken >= 1),
      requirement: 'شکستن ۱ رکورد رسمی',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIP Subscription Status Banner */}
      {isSubscribed && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/15 p-5 sm:p-6 rounded-3xl border-2 border-amber-400/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">
                  وضعیت: فعال ✓
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  اشتراک ویژه {subPlanName} فعال است
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                حساب شما دارای دسترسی کامل و نامحدود به تمامی پیست‌های اتومبیل‌رانی VIP، ۲ برابر سکه و امکانات اختصاصی می‌باشد.
              </p>
            </div>
          </div>
          <Link
            href="/subscription"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs border border-slate-200 transition text-center shrink-0"
          >
            مشاهده جزییات اشتراک
          </Link>
        </div>
      )}

      {/* Top Profile Card with Name & Photo Display & Edit Button */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* User Photo / Avatar Frame with Direct Upload and Empty State */}
            <div className="flex flex-col items-center gap-2">
              <input
                ref={directFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDirectUpload}
                className="hidden"
              />
              <div
                onClick={() => directFileInputRef.current?.click()}
                className="relative group cursor-pointer"
                title="برای انتخاب و آپلود عکس جدید از دستگاه کلیک کنید"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shadow-md group-hover:border-blue-500 transition">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    /* اگر عکس پروفایل بدون عکس بود خالی باشد */
                    <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-50">
                      <User className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <span className="text-[10px] text-slate-400 font-bold mt-1">بدون عکس (خالی)</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px]">{avatarUrl ? 'تغییر عکس' : 'آپلود عکس'}</span>
                </div>
              </div>

              {/* Quick Upload / Remove Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => directFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition"
                  title="آپلود مستقیم عکس از حافظه دستگاه"
                >
                  <Upload className="w-3 h-3" />
                  <span>{avatarUrl ? 'تغییر عکس' : 'آپلود عکس'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition"
                    title="حذف عکس پروفایل و بازگشت به وضعیت خالی"
                  >
                    <X className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200 font-mono">
                  سطح {user?.level || 1}
                </span>
                {isSubscribed ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black shadow-xs flex items-center gap-1 border border-amber-400">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>اشتراک VIP فعال ({subPlanName})</span>
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                    طرح پایه (رایگان)
                  </span>
                )}
                {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    مدیر سیستم
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    تایپیست تایپرو
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-500 block font-mono">
                نام کاربری: @{user?.username || 'typro_user'}
              </span>

              <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                {bio}
              </p>

              {/* Live Race Identity Notice */}
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
                <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>با همین نام و تصویر در تمامی اتاق‌ها و چت‌های رقابت زنده حضور خواهید داشت.</span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Profile Completion */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <button
              onClick={openEditModal}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>ویرایش مشخصات</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(true);
                setPwdError(null);
                setPwdSuccess(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>تغییر رمز عبور</span>
            </button>

            {/* Progressive Profile Completion Bar */}
            <div className="w-full sm:w-56 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>تکمیل پروفایل</span>
                <span>{completionPercentage}٪</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                {completionPercentage === 100
                  ? 'تمامی اطلاعات هویتی و ارتباطی شما کامل است.'
                  : 'برای افزایش اعتبار در بین کارفرمایان، پروفایل را تکمیل کنید.'}
              </span>
            </div>
          </div>
        </div>

        {/* User Contact & Workplace Details Cards */}
        <div className="pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              اطلاعات ارتباطی، هویتی و شغلی
            </span>
            <button
              onClick={openEditModal}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>تغییر یا حذف مشخصات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Email / Gmail */}
            <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/90 transition flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  جیمیل (Gmail)
                </span>
                {email && (
                  <button
                    onClick={handleClearEmail}
                    className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition cursor-pointer"
                    title="حذف جیمیل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs font-bold text-slate-800 break-all dir-ltr text-right">
                {email || <span className="text-slate-400 font-normal">ثبت نشده (خالی)</span>}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/90 transition flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  شماره تماس
                </span>
                {phone && (
                  <button
                    onClick={handleClearPhone}
                    className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition cursor-pointer"
                    title="حذف شماره تماس"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs font-bold text-slate-800 font-mono">
                {phone || <span className="text-slate-400 font-normal font-sans">ثبت نشده (خالی)</span>}
              </div>
            </div>

            {/* Gender */}
            <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/90 transition flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  جنسیت
                </span>
                {gender && (
                  <button
                    onClick={handleClearGender}
                    className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition cursor-pointer"
                    title="حذف / بازنشانی به نامشخص"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs font-bold text-slate-800">
                {gender === 'male' ? '👨 مرد' : gender === 'female' ? '👩 زن' : <span className="text-slate-400 font-normal">مشخص نشده</span>}
              </div>
            </div>

            {/* Workplace */}
            <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/90 transition flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  محل کار
                </span>
                {workplace && (
                  <button
                    onClick={handleClearWorkplace}
                    className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition cursor-pointer"
                    title="حذف محل کار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs font-bold text-slate-800 truncate" title={workplace}>
                {workplace || <span className="text-slate-400 font-normal">ثبت نشده (خالی)</span>}
              </div>
            </div>

            {/* Workplace Address */}
            <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/90 transition flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  آدرس محل کار
                </span>
                {workplaceAddress && (
                  <button
                    onClick={handleClearWorkplaceAddress}
                    className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition cursor-pointer"
                    title="حذف آدرس محل کار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs font-bold text-slate-800 truncate" title={workplaceAddress}>
                {workplaceAddress || <span className="text-slate-400 font-normal">ثبت نشده (خالی)</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span>ویرایش اطلاعات، جیمیل، شماره و محل کار</span>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Photo Upload & Preview Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  عکس پروفایل / آواتار کاربری:
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-xs">
                    {editAvatar ? (
                      <img src={editAvatar} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-1 bg-slate-50">
                        <User className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <span className="text-[9px] text-slate-400 font-bold mt-0.5">بدون عکس</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{editAvatar ? 'تغییر عکس از دستگاه' : 'آپلود عکس از دستگاه'}</span>
                      </button>

                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar('')}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>حذف عکس (خالی کردن)</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      فرمت‌های مجاز: JPG، PNG، WEBP (حداکثر ۳ مگابایت)
                    </span>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>نام و نام خانوادگی / نام نمایشی:</span>
                  <span className="text-[10px] text-blue-600 font-normal">نمایش در جدول رقابت‌ها</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="نام خود را وارد کنید..."
                  required
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold text-slate-900"
                />
              </div>

              {/* Email / Gmail Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>جیمیل (Gmail / پست الکترونیکی):</span>
                  </label>
                  {editEmail && (
                    <button
                      type="button"
                      onClick={() => setEditEmail('')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف جیمیل</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-900 text-left placeholder:text-right"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  می‌توانید جیمیل خود را وارد، تغییر داده یا با دکمه حذف به کلی پاک کنید.
                </span>
              </div>

              {/* Phone Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>شماره تماس / موبایل:</span>
                  </label>
                  {editPhone && (
                    <button
                      type="button"
                      onClick={() => setEditPhone('')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف شماره تماس</span>
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-900 text-left font-mono placeholder:text-right placeholder:font-sans"
                />
                <span className="text-[10px] text-slate-400 block">
                  جهت دریافت اعلانات پیامکی و بازیابی حساب (امکان حذف یا تغییر در هر زمان).
                </span>
              </div>

              {/* Gender Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>تعیین جنسیت:</span>
                  </label>
                  {editGender && (
                    <button
                      type="button"
                      onClick={() => setEditGender('')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>بازنشانی به نامشخص</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditGender('male')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      editGender === 'male'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>👨</span>
                    <span>مرد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender('female')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      editGender === 'female'
                        ? 'border-pink-600 bg-pink-50 text-pink-700 ring-2 ring-pink-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>👩</span>
                    <span>زن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGender('')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      !editGender
                        ? 'border-slate-400 bg-slate-100 text-slate-800 ring-2 ring-slate-400/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span>⚪</span>
                    <span>نامشخص</span>
                  </button>
                </div>
              </div>

              {/* Workplace Name Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>محل کار (نام شرکت، سازمان یا دانشگاه):</span>
                  </label>
                  {editWorkplace && (
                    <button
                      type="button"
                      onClick={() => setEditWorkplace('')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف محل کار</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={editWorkplace}
                  onChange={(e) => setEditWorkplace(e.target.value)}
                  placeholder="مثال: شرکت داده‌پردازی، دانشگاه تهران، فریلنسر و..."
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-900"
                />
              </div>

              {/* Workplace Address Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>آدرس دقیق محل کار:</span>
                  </label>
                  {editWorkplaceAddress && (
                    <button
                      type="button"
                      onClick={() => setEditWorkplaceAddress('')}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف آدرس</span>
                    </button>
                  )}
                </div>
                <textarea
                  value={editWorkplaceAddress}
                  onChange={(e) => setEditWorkplaceAddress(e.target.value)}
                  rows={2}
                  placeholder="آدرس، استان، شهر، خیابان و پلاک محل کار..."
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-800 leading-relaxed"
                />
              </div>

              {/* Bio Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  درباره من (بیوگرافی کوتاه):
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="توضیح کوتاهی درباره خود بنویسید..."
                  className="w-full text-xs px-4 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-slate-700 leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره کلیه اطلاعات و مشخصات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-base text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span>تغییر رمز عبور حساب کاربری</span>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Info className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">رمز عبور فعلی</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="password"
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-xs font-mono text-left placeholder:text-right"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">رمز عبور جدید (حداقل ۶ نویسه)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="password"
                    required
                    dir="ltr"
                    placeholder="حداقل ۶ نویسه"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-xs font-mono text-left placeholder:text-right"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">تکرار رمز عبور جدید</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="password"
                    required
                    dir="ltr"
                    placeholder="تکرار دقیق رمز عبور جدید"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-xs font-mono text-left placeholder:text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPwd}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingPwd ? 'در حال ثبت...' : 'ثبت رمز عبور جدید'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verified Typing Skills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>مهارت‌های اعتبارسنجی‌شده (Verified System Metrics)</span>
          </h2>
          <span className="text-xs text-slate-500">
            {isAuthenticated
              ? userStats.bestWpm > 0
                ? 'استخراج‌شده از آخرین آزمون‌های واقعی ثبت‌شده شما در تایپرو'
                : 'بدون آزمون ثبت‌شده (رکوردی ثبت نشده)'
              : 'برای ثبت و ذخیره رکورد، ثبت‌نام الزامی است'}
          </span>
        </div>

        {/* Not authenticated callout */}
        {!isAuthenticated && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold">
              <span>⚠️ شما هنوز وارد سیستم نشده‌اید. رکوردهای تایپ فقط پس از ثبت‌نام یا ورود ذخیره و اعتبارسنجی می‌شوند.</span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shrink-0 text-center"
            >
              ورود یا ثبت‌نام در تایپرو
            </Link>
          </div>
        )}

        {/* Authenticated but no tests yet */}
        {isAuthenticated && userStats.bestWpm === 0 && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold">
              <span>💡 شما هنوز هیچ آزمون تستی انجام نداده‌اید. با اولین آزمون، سرعت و دقت شما محاسبه و در این بخش ثبت می‌شود.</span>
            </div>
            <Link
              href="/typing-test"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shrink-0 text-center"
            >
              شروع اولین تست تایپ
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs text-slate-500">سرعت تاییدشده (Verified WPM)</span>
            <span className="text-3xl font-black text-blue-600 font-mono mt-1">
              {isAuthenticated && userStats.bestWpm > 0 ? userStats.bestWpm : '۰'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              {isAuthenticated && userStats.bestWpm > 0 ? 'بر اساس آزمون‌های رسمی شما' : 'نیازمند انجام آزمون'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs text-slate-500">دقت تاییدشده</span>
            <span className="text-3xl font-black text-emerald-600 font-mono mt-1">
              {isAuthenticated && userStats.bestAccuracy > 0 ? `${userStats.bestAccuracy}٪` : '۰٪'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              {isAuthenticated && userStats.bestAccuracy > 0 ? 'تضمین حداقل خطا' : 'بدون تست ثبت‌شده'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs text-slate-500">شاخص پایداری</span>
            <span className="text-3xl font-black text-indigo-600 font-mono mt-1">
              {isAuthenticated && (userStats.consistency > 0 || userStats.bestAccuracy > 0)
                ? `${userStats.consistency || userStats.bestAccuracy}٪`
                : '۰٪'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              {isAuthenticated && userStats.bestWpm > 0 ? 'ریتم ثابت ضربه‌زنی' : 'بدون رکورد'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs text-slate-500">بهترین رکورد ثبت‌شده</span>
            <span className="text-3xl font-black text-amber-600 font-mono mt-1">
              {isAuthenticated && userStats.bestWpm > 0 ? userStats.bestWpm : '۰'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              {isAuthenticated && userStats.bestWpm > 0 ? 'WPM کلمات در دقیقه' : 'هنوز رکوردی ثبت نشده'}
            </span>
          </div>
        </div>
      </div>

      {/* Medals & Cups Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>تالار جوایز، کاپ‌ها و مدال‌ها</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {medalsList.filter((m) => m.isEarned).length} از {medalsList.length} مدال بازگشایی‌شده
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {medalsList.map((medal, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all text-center space-y-2 relative ${
                medal.isEarned
                  ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-slate-50/80 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <span className="text-3xl block">{medal.icon}</span>
              <h4 className="font-bold text-xs text-slate-900">{medal.title}</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">{medal.desc}</p>
              
              <div className="pt-1 border-t border-slate-100">
                {medal.isEarned ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                    کسب شده
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    قفل ({medal.requirement})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
