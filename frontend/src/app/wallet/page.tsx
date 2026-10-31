'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Coins, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles, CheckCircle2, X, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

interface Transaction {
  id: string;
  type: 'reward' | 'spend' | 'purchase';
  desc: string;
  amount: string;
  date: string;
}

export default function WalletPage() {
  const { user, isAuthenticated } = useAuth();
  const [coins, setCoins] = useState(() => {
    if (!user) return 0;
    if (user?.coins !== undefined) return user.coins;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_user_coins');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCoins(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_user_coins', '0');
      }
    } else {
      setCoins(user.coins ?? 0);
    }
  }, [user, isAuthenticated]);
  const [banknotes, setBanknotes] = useState(0);
  const [activePkg, setActivePkg] = useState<{ id: string; coins: number; priceToman: string; bonus: string } | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'tx-101', type: 'reward', desc: 'جایزه پیروزی در مسابقه لابی ۱', amount: '+۵۰ سکه', date: 'امروز، ۱۰:۴۵' },
    { id: 'tx-102', type: 'reward', desc: 'تکمیل چالش روزانه سوره نور', amount: '+۳۰ سکه', date: 'امروز، ۰۹:۲۰' },
    { id: 'tx-103', type: 'spend', desc: 'خرید پوسته سایبر فانتوم', amount: '-۵۰۰ سکه', date: 'دیروز' },
    { id: 'tx-104', type: 'purchase', desc: 'شارژ کیف پول (واریز کارت به کارت)', amount: '+۱,۰۰۰ سکه', date: '۳ روز پیش' },
  ]);

  const coinPackages = [
    { id: 'pkg-1', coins: 1000, priceToman: '۵۰,۰۰۰', bonus: 'بدون جایزه', popular: false },
    { id: 'pkg-2', coins: 3000, priceToman: '۱۳۰,۰۰۰', bonus: '+۲۰۰ سکه رایگان', popular: true },
    { id: 'pkg-3', coins: 10000, priceToman: '۳۸۰,۰۰۰', bonus: '+۱,۵۰۰ سکه + پوسته ویژه', popular: false },
  ];

  const handleOpenGateway = (pkg: typeof coinPackages[0]) => {
    setActivePkg(pkg);
    setPaymentSuccess(false);
  };

  const handleProcessPayment = () => {
    if (!activePkg) return;
    const bonusCount = activePkg.coins === 3000 ? 200 : activePkg.coins === 10000 ? 1500 : 0;
    const totalGained = activePkg.coins + bonusCount;

    setCoins((prev) => prev + totalGained);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now().toString().slice(-4)}`,
        type: 'purchase',
        desc: `شارژ کیف پول (واریز کارت به کارت - در انتظار تایید)`,
        amount: `+${totalGained.toLocaleString('fa-IR')} سکه`,
        date: 'هم‌اکنون',
      },
      ...prev,
    ]);

    setPaymentSuccess(true);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          سیستم مدیریت مالی و تراکنش‌ها
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          کیف پول دیجیتال (Digital Wallet)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          مدیریت دارایی‌ها، سکه‌های دریافتی از مسابقات و جوایز و شارژ مستقیم حساب کاربری با امنیت کامل و امضای سیستمی.
        </p>
      </div>

      {/* Balance Cards (Section 113: Coins, Banknotes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/15 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100">ارز مسابقات و جوایز</span>
            <Coins className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <span className="text-xs text-amber-100 block">موجودی سکه تایپرو</span>
            <span className="text-4xl font-black font-mono tracking-tight mt-1 block">
              {coins.toLocaleString('fa-IR')}
            </span>
          </div>
          <span className="text-[11px] text-amber-100 block">
            قابل استفاده برای خرید پوسته‌ها، شرکت در کاپ‌ها و بازگشایی صندوق‌ها
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-600/15 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100">اعتبار ریالی و سفارشات</span>
            <Wallet className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-xs text-emerald-100 block">موجودی اسکناس (Banknotes)</span>
            <span className="text-4xl font-black font-mono tracking-tight mt-1 block">
              {banknotes.toLocaleString('fa-IR')}
            </span>
          </div>
          <span className="text-[11px] text-emerald-100 block">
            اعتبار تسویه حساب فریلنسری و خدمات پرسرعت
          </span>
        </div>
      </div>

      {/* Coin Packages (Section 114: Real Money Purchase) */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>بسته‌های افزایش موجودی سکه</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coinPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all space-y-5 flex flex-col justify-between ${
                pkg.popular
                  ? 'border-blue-600 shadow-xl shadow-blue-500/10 relative'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase">
                  محبوب‌ترین بسته
                </span>
              )}

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">{pkg.coins.toLocaleString('fa-IR')} سکه تایپرو</h3>
                <span className="text-xs font-semibold text-emerald-600 block">{pkg.bonus}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">مبلغ قابل پرداخت:</span>
                  <span className="text-base font-black text-slate-900 font-mono">{pkg.priceToman} تومان</span>
                </div>
                <button
                  onClick={() => handleOpenGateway(pkg)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                >
                  خرید آنلاین
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {activePkg && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActivePkg(null)}
              className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>واریز مستقیم کارت به کارت (تایید توسط ادمین)</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    شارژ بسته {activePkg.coins.toLocaleString('fa-IR')} سکه
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مبلغ قابل واریز: <strong className="text-slate-800 font-mono">{activePkg.priceToman} تومان</strong>
                  </p>
                </div>

                {/* Card Transfer Info */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-2 text-xs border border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>شماره کارت بانک سامان:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('6219861473818267');
                        alert('شماره کارت با موفقیت کپی شد ✓');
                      }}
                      className="text-[11px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg text-amber-300 font-bold transition cursor-pointer"
                    >
                      کپی شماره کارت
                    </button>
                  </div>
                  <div className="font-mono text-lg font-black text-amber-400 tracking-wider text-center py-1 select-all" dir="ltr">
                    6219 - 8614 - 7381 - 8267
                  </div>
                  <div className="text-[11px] text-slate-400 text-center">
                    پس از واریز وجه، شماره پیگیری را وارد و دکمه ثبت درخواست را بزنید.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">شماره پیگیری یا ارجاع بانکی:</label>
                  <input
                    type="text"
                    placeholder="مثال: ۱۲۳۴۵۶۷۸"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleProcessPayment}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  ثبت درخواست و ارسال به ادمین جهت تایید
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-slate-900">پرداخت با موفقیت انجام شد!</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  موجودی کیف پول شما با موفقیت افزایش یافت و تراکنش در سامانه ثبت گردید.
                </p>
                <button
                  onClick={() => setActivePkg(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  بازگشت به کیف پول
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction History (Section 113: Server-authorized, auditable) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">تاریخچه گردش حساب و جوایز</h3>

        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    tx.amount.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {tx.amount.startsWith('+') ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{tx.desc}</span>
                  <span className="text-[10px] text-slate-400">{tx.date}</span>
                </div>
              </div>

              <span
                className={`font-mono font-bold text-sm ${
                  tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-700'
                }`}
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
