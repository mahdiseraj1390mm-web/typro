'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Sparkles, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await adminLogin(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      showToast('👑 ورود مدیر با موفقیت تایید شد. انتقال به مرکز کنترل...');
      setTimeout(() => router.push('/admin'), 900);
    } else {
      setErrorMessage(res.error || 'دسترسی مدیریت تایید نشد.');
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12" dir="rtl">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-9 border-2 border-red-100 shadow-2xl space-y-6">
        {/* Admin Gateway Badge & Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-500/25">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-black">
            بخش امنیتی ورود مدیران (RBAC)
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            ورود به پنل مدیریت مستر
          </h1>
          <p className="text-xs text-slate-500">
            تنها حساب‌های دارای نقش Super Admin، Admin، یا مدیریت ماژول‌ها مجاز به ورود هستند.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">نام کاربری یا شماره موبایل مدیریت</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="typro_admin یا 09121112233"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 font-mono text-left text-xs"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">رمز عبور امنیتی مدیریت</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 text-xs"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-xs transition shadow-md shadow-red-600/20"
          >
            {isSubmitting ? 'در حال تایید دسترسی...' : 'احراز هویت و ورود به پنل'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>بازگشت به صفحه اصلی سامانه</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
