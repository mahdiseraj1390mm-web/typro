'use client';

import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  Laptop,
  LogOut,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SecurityPage() {
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'مرورگر Chrome روی Windows 11 (دستگاه فعلی)', ip: '185.120.44.12', lastActive: 'هم‌اکنون فعال', current: true },
    { id: 'sess-2', device: 'اپلیکیشن موبایل Safari روی iPhone 15', ip: '5.200.12.89', lastActive: '۳ ساعت پیش', current: false },
    { id: 'sess-3', device: 'مرورگر Firefox روی لینوکس اوبونتو', ip: '91.98.24.110', lastActive: '۲ روز پیش', current: false },
  ]);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRevoke = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('نشست دستگاه انتخابی با موفقیت باطل گردید.');
  };

  const handleLogoutAll = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    showToast('تمام نشست‌های فعال در سایر دستگاه‌ها با موفقیت باطل شدند.');
  };

  const handleOpen2FAModal = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
      showToast('ورود دومرحله‌ای با موفقیت غیرفعال گردید.');
    } else {
      setBackupCodes([
        'TYP-8841-9920',
        'TYP-1145-8832',
        'TYP-6623-1109',
        'TYP-9904-3321',
        'TYP-7712-4456',
        'TYP-2234-7788',
      ]);
      setIs2FAModalOpen(true);
    }
  };

  const handleVerifyAndEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode.length !== 6) {
      showToast('لطفاً کد ۶ رقمی احراز هویت را کامل وارد کنید.');
      return;
    }
    setIs2FAEnabled(true);
    setIs2FAModalOpen(false);
    setTwoFACode('');
    confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    showToast('🔒 ورود دومرحله‌ای (2FA) با موفقیت روی حساب شما فعال شد!');
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    showToast('کدهای اضطراری در کلیپ‌بورد کپی شدند.');
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('کلمه عبور جدید باید حداقل ۸ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('کلمه عبور جدید با تکرار آن یکسان نیست.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('🔐 کلمه عبور شما با موفقیت تغییر یافت و رمزنگاری شد.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            بخش‌های ۱۹ و ۲۰ مستند فنی: امنیت حساب، ورود دومرحله‌ای و سوابق دسترسی
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          امنیت حساب، تایید هویت دومرحله‌ای (2FA) و نشست‌ها
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          مدیریت دستگاه‌های متصل، فعال‌سازی تایید دومرحله‌ای با نرم‌افزارهای احراز هویت، و ابطال فوری نشست‌های مشکوک.
        </p>
      </div>

      {/* Two-Factor Authentication (2FA) Card (Section 19) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-base text-slate-900">ورود دومرحله‌ای (Two-Factor Authentication)</h2>
            </div>
            <p className="text-xs text-slate-500">
              با فعال‌سازی 2FA، علاوه بر رمز عبور، وارد کردن کد پویای اپلیکیشن‌های Google Authenticator یا Microsoft Authenticator الزامی خواهد بود.
            </p>
          </div>

          <button
            onClick={handleOpen2FAModal}
            className={"px-5 py-2.5 rounded-2xl font-bold text-xs transition shadow-xs " + (
              is2FAEnabled
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            )}
          >
            {is2FAEnabled ? 'غیرفعال‌سازی 2FA' : 'فعال‌سازی ورود دومرحله‌ای'}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className={"w-3 h-3 rounded-full " + (is2FAEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300')} />
          <span className="font-bold text-slate-700">
            وضعیت جاری: {is2FAEnabled ? 'فعال و ایمن‌شده با استاندارد TOTP' : 'غیرفعال (توصیه به فعال‌سازی فوری)'}
          </span>
        </div>
      </div>

      {/* Active Sessions List (Section 20) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">دستگاه‌ها و نشست‌های متصل (Active Sessions)</h2>
            <p className="text-xs text-slate-500 mt-0.5">در صورت مشاهده دستگاه ناشناس، فوراً دسترسی آن را قطع کنید.</p>
          </div>

          <button
            onClick={handleLogoutAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition border border-red-200 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج از تمام دستگاه‌های دیگر</span>
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={"p-4 rounded-2xl border flex items-center justify-between gap-4 " + (
                sess.current ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200/80'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                  {sess.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{sess.device}</span>
                    {sess.current && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                        این دستگاه
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    IP: {sess.ip} • {sess.lastActive}
                  </span>
                </div>
              </div>

              {!sess.current && (
                <button
                  onClick={() => handleRevoke(sess.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition border border-rose-200"
                >
                  ابطال دسترسی
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-700" />
          <span>تغییر کلمه عبور حساب کاربری</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">کلمه عبور فعلی</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">کلمه عبور جدید (حداقل ۸ کاراکتر)</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">تکرار کلمه عبور جدید</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPassword ? 'مخفی‌سازی کاراکترها' : 'نمایش کلمات عبور'}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
          >
            ذخیره کلمه عبور جدید
          </button>
        </div>
      </form>

      {/* 2FA Setup Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 relative">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">پیکربندی امنیت TOTP</span>
              <h3 className="font-black text-lg text-slate-900">راه‌اندازی ورود دومرحله‌ای</h3>
              <p className="text-xs text-slate-500">
                کد QR زیر را در اپلیکیشن Authenticator اسکن کنید، سپس کد ۶ رقمی تولیدشده را وارد نمایید.
              </p>
            </div>

            {/* Simulated QR Code */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <div className="w-36 h-36 bg-white border border-slate-300 rounded-xl flex items-center justify-center text-slate-800 shadow-inner">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <span className="text-[11px] text-slate-500 font-mono">کلید دستی: JBSW Y3DP EHPK 3PXP</span>
            </div>

            {/* Backup Codes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">کدهای بازیابی اضطراری (Backup Codes):</span>
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                >
                  {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCodes ? 'کپی شد' : 'کپی همه'}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-slate-100 font-mono text-[10px] text-slate-700 text-center">
                {backupCodes.map((code, i) => (
                  <span key={i} className="bg-white py-1 rounded border border-slate-200">{code}</span>
                ))}
              </div>
            </div>

            {/* Verification input */}
            <form onSubmit={handleVerifyAndEnable2FA} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">کد ۶ رقمی اپلیکیشن:</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="کد ۶ رقمی"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-center font-mono text-lg tracking-widest focus:outline-hidden focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIs2FAModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  تایید و فعال‌سازی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
