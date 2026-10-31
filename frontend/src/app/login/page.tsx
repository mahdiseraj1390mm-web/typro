'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Key,
  ShieldCheck,
  User,
  Lock,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword, loginWithOtp, requestOtp, registerInit, adminLogin, forgotPassword } = useAuth();

  // 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  // Registration step: 'form' | 'otp'
  const [regStep, setRegStep] = useState<'form' | 'otp'>('form');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, countdown]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Password Login (نام کاربری یا شماره موبایل + رمز عبور)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await loginWithPassword(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      showToast('🎉 خوش آمدید! ورود با موفقیت انجام شد.');
      setTimeout(() => router.push('/profile'), 1000);
    } else {
      setErrorMessage(res.error || 'اطلاعات ورود اشتباه است.');
    }
  };

  // 4. Registration: Submit Form -> Send OTP
  const handleRegisterInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!/^09\d{9}$/.test(mobile)) {
      setErrorMessage('شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.');
      return;
    }
    if (username.trim().length < 3) {
      setErrorMessage('نام کاربری باید حداقل ۳ حرف باشد.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerInit(mobile, username, password);
    setIsSubmitting(false);

    if (res.success) {
      setRegStep('otp');
      setCountdown(120);
      showToast(`📩 کد فعال‌سازی پیامکی به شماره ${mobile} ارسال شد.`);
    } else {
      setErrorMessage(res.error || 'خطا در ثبت‌نام.');
    }
  };

  // 5. Registration: Verify OTP -> Complete
  const handleRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('کد فعال‌سازی ۶ رقمی را وارد نمایید.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithOtp(mobile, otpCode);
    setIsSubmitting(false);

    if (res.success) {
      showToast('🚀 حساب کاربری شما با موفقیت فعال شد!');
      setTimeout(() => router.push('/profile'), 1200);
    } else {
      setErrorMessage(res.error || 'کد تایید نادرست است.');
    }
  };

  // 6. Forgot Password via Melli Payamak SMS
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotSuccess(null);

    if (!/^09\d{9}$/.test(mobile)) {
      setErrorMessage('لطفاً شماره موبایل ۱۱ رقمی معتبر (09xxxxxxxxx) وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    const res = await forgotPassword(mobile);
    setIsSubmitting(false);

    if (res.success) {
      setForgotSuccess(res.message || 'رمز عبور جدید به شماره شما پیامک شد. می‌توانید اکنون با گذرواژه جدید وارد شوید.');
      showToast('📩 رمز عبور جدید از طریق پیامک ارسال شد.');
    } else {
      setErrorMessage(res.error || 'خطا در ارسال پیامک بازیابی رمز عبور.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12" dir="rtl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}



      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            T
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {activeTab === 'login'
              ? 'ورود به حساب تایپرو'
              : activeTab === 'register'
              ? 'عضویت و افتتاح حساب'
              : 'بازیابی رمز عبور'}
          </h1>
          <p className="text-xs text-slate-500">
            {activeTab === 'login'
              ? 'دسترسی به آکادمی، مسابقات زنده، سوابق تایپ و کیف پول'
              : activeTab === 'register'
              ? 'ثبت‌نام سریع در ۳۰ ثانیه جهت ذخیره پیشرفت‌ها و رکوردها'
              : 'ارسال گذرواژه جدید با سامانه پیامکی ملی‌پیامک'}
          </p>
        </div>


        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition ${
              activeTab === 'login' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ورود به حساب
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition ${
              activeTab === 'register' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: LOGIN (ورود صرفاً با نام کاربری یا موبایل + رمز عبور) */}
        {activeTab === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">نام کاربری یا شماره موبایل</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="مثلاً typro_user یا 09120000000"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-left text-xs"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700 block">رمز عبور</label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMessage(null);
                    setForgotSuccess(null);
                  }}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer font-bold"
                >
                  فراموشی رمز عبور؟
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-xs"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'در حال بررسی...' : 'ورود به حساب کاربری'}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER (Section 16: Mobile + Username + Password -> OTP) */}
        {activeTab === 'register' && (
          <div className="space-y-4">
            {regStep === 'form' ? (
              <form onSubmit={handleRegisterInit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">شماره تلفن همراه</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="09120000000"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-left text-xs"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">کد فعال‌سازی پیامک خواهد شد.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">نام کاربری اختصاصی (لاتین)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="مثلاً: typro_user"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-left text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">رمز عبور (حداقل ۶ نویسه)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="گذرواژه امن"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
                >
                  ارسال پیامک کد تایید و ادامه
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterComplete} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                  <div className="font-bold">ارسال کد تایید به شماره {mobile}</div>
                  <div className="text-[11px] text-blue-600 mt-0.5">
                    نام کاربری ثبت‌شده: <strong>{username}</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">کد ۶ رقمی پیامکی</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="کد ۶ رقمی"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-center tracking-widest text-lg font-bold"
                      dir="ltr"
                      autoFocus
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                    <span>کد فعال‌سازی ارسال‌شده به شماره همراه را وارد کنید</span>
                    <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')} مانده</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-500/20"
                >
                  تکمیل عضویت و فعال‌سازی حساب
                </button>

                <button
                  type="button"
                  onClick={() => setRegStep('form')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  ویرایش اطلاعات ثبت‌نام
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: FORGOT PASSWORD */}
        {activeTab === 'forgot' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>بازیابی گذرواژه با سامانه پیامکی ملی‌پیامک</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                شماره موبایل ثبت‌شده در حساب خود را وارد کنید. یک رمز عبور جدید به شماره همراه شما پیامک خواهد شد.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>پیامک با موفقیت ارسال شد!</span>
                  </div>
                  <p className="leading-relaxed">{forgotSuccess}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setForgotSuccess(null);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
                >
                  ورود با رمز عبور جدید پیامک‌شده
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">شماره تلفن همراه</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="09121234567"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-left text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? 'در حال ارسال پیامک...' : 'ارسال رمز عبور جدید از طریق پیامک'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 text-center text-xs text-slate-600 hover:text-slate-900 font-bold transition"
                >
                  ← بازگشت به صفحه ورود
                </button>
              </form>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            ورود به معنای پذیرش <Link href="/terms" className="text-blue-600 hover:underline font-bold">قوانین</Link> و <Link href="/privacy" className="text-blue-600 hover:underline font-bold">حریم خصوصی</Link> سامانه Typro.ir است.
          </p>
        </div>
      </div>
    </div>
  );
}

