'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Coins, DollarSign, Plus, CheckCircle2, History, ShieldAlert, 
  TrendingUp, Sparkles, Flame, ShoppingBag, ArrowUpRight, Search, ShieldCheck 
} from 'lucide-react';

interface AdjustmentLog {
  id: string;
  user: string;
  amount: string;
  reason: string;
  admin: string;
  timestamp: string;
}

interface CoinPackage {
  id: string;
  title: string;
  coins: number;
  bonusCoins: number;
  priceToman: number;
  activeDiscountPercent: number;
}

export default function AdminEconomyPage() {
  const [manualAdjustments, setManualAdjustments] = useState<AdjustmentLog[]>([
    { 
      id: 'adj-101', 
      user: 'ali_rezaei', 
      amount: '+۵۰۰ سکه', 
      reason: 'جایزه ویژه برنده چالش هفتگی گرندپری', 
      admin: 'SuperAdmin', 
      timestamp: 'امروز، ۱۰:۱۵' 
    },
    { 
      id: 'adj-102', 
      user: 'kazemi_pro', 
      amount: '+۱,۰۰۰ سکه', 
      reason: 'پاداش کشف باگ امنیتی در سیستم تله‌متری', 
      admin: 'SecurityLead', 
      timestamp: 'دیروز، ۱۸:۳۰' 
    },
    { 
      id: 'adj-103', 
      user: 'spammer_99', 
      amount: '-۲۰۰ سکه', 
      reason: 'جریمه نقض قوانین چت روم و اسپم ایموجی', 
      admin: 'Mod_Hossein', 
      timestamp: '۲ روز پیش' 
    },
  ]);

  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([
    { id: 'pkg-1', title: 'بسته برنزی مسابقه‌ای', coins: 500, bonusCoins: 0, priceToman: 49000, activeDiscountPercent: 0 },
    { id: 'pkg-2', title: 'بسته نقره‌ای شوماخر', coins: 1500, bonusCoins: 200, priceToman: 129000, activeDiscountPercent: 10 },
    { id: 'pkg-3', title: 'بسته طلایی گرندپری', coins: 5000, bonusCoins: 1000, priceToman: 349000, activeDiscountPercent: 15 },
    { id: 'pkg-4', title: 'صندوق الماس پادشاهی', coins: 15000, bonusCoins: 4000, priceToman: 899000, activeDiscountPercent: 20 },
  ]);

  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser.trim() || !amount.trim() || !reason.trim()) return;

    const formattedAmount = amount.startsWith('+') || amount.startsWith('-') ? amount : `+${amount}`;

    const newAdj: AdjustmentLog = {
      id: `adj-${Date.now()}`,
      user: targetUser,
      amount: `${formattedAmount} سکه`,
      reason,
      admin: 'SuperAdmin (شما)',
      timestamp: 'هم‌اکنون',
    };

    setManualAdjustments([newAdj, ...manualAdjustments]);
    setTargetUser('');
    setAmount('');
    setReason('');
    showToast(`✅ تعدیل موجودی ${targetUser} به میزان ${formattedAmount} سکه با امضای دیجیتال ثبت شد.`);
  };

  const updateDiscount = (pkgId: string, newDiscount: number) => {
    setCoinPackages(coinPackages.map(pkg => pkg.id === pkgId ? { ...pkg, activeDiscountPercent: newDiscount } : pkg));
    showToast('درصد تخفیف بسته فروشگاهی با موفقیت به‌روزرسانی شد.');
  };

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
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">← بازگشت به داشبورد ادمین</Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            مدیریت اقتصاد درون‌برنامه‌ای، بسته‌ها و خزانه‌داری (Economy Control)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            پایش نقدینگی سکه‌های تایپرو، بسته‌های فروشگاهی، سیاست‌های ضدتورم و ثبت تعدیل دستی با ممیزی (بند ۱۳۷).
          </p>
        </div>
      </div>

      {/* Economic Overview Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">سکه‌های در گردش</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">۱۴,۸۵۰,۲۰۰</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+۴.۲٪ رشد ارگانیک این هفته</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نرخ سوخت سکه (Deflation Burn)</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600 font-mono">۱,۴۲۰,۰۰۰</div>
          <div className="text-[11px] text-slate-500">
            سوزانده‌شده در لوت‌باکس و کارمزد دوئل
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">فروش ریالی ماه جاری</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">۱۸۵,۴۰۰,۰۰۰</div>
          <div className="text-[11px] text-slate-500">
            تومان از درگاه زرین‌پال / ملت
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ارزش پایه‌ای هر ۱۰۰ سکه</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-600 font-mono">۱۰,۰۰۰ تومان</div>
          <div className="text-[11px] text-slate-500">
            نسبت برابری اقتصادی پایدار
          </div>
        </div>
      </div>

      {/* Coin Packages Price & Discount Management */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-blue-600" />
          <span>مدیریت بسته‌های فروشگاهی سکه و اعمال کمپین تخفیف</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coinPackages.map((pkg) => (
            <div key={pkg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">{pkg.title}</span>
                {pkg.activeDiscountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                    {pkg.activeDiscountPercent}٪ تخفیف
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-mono font-black text-base text-slate-900 flex items-center gap-1">
                  <span>{pkg.coins.toLocaleString('fa-IR')}</span>
                  <span className="text-xs font-normal text-slate-500">سکه</span>
                  {pkg.bonusCoins > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold mr-1">
                      (+{pkg.bonusCoins.toLocaleString('fa-IR')} هدیه)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {pkg.priceToman.toLocaleString('fa-IR')} تومان
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">درصد تخفیف:</span>
                <select
                  value={pkg.activeDiscountPercent}
                  onChange={(e) => updateDiscount(pkg.id, Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                >
                  <option value={0}>بدون تخفیف</option>
                  <option value={10}>۱۰٪</option>
                  <option value={15}>۱۵٪</option>
                  <option value={20}>۲۰٪</option>
                  <option value={30}>۳۰٪</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Adjustment Form (Section 137) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleManualAdjust} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>تعدیل دستی موجودی (با امضای ممیزی)</span>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">نام کاربری هدف</label>
            <input
              type="text"
              required
              placeholder="مثال: ali_rezaei"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">مقدار تغییر سکه (مثلاً +500 یا -200)</label>
            <input
              type="text"
              required
              placeholder="+500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-xs text-slate-700 block">علت تغییر (ثبت در لاگ ممیزی مالی)</label>
            <input
              type="text"
              required
              placeholder="مثال: جایزه پیروزی در تورنمنت کاپ رمضان"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs mt-2"
          >
            تایید و اعمال در ترازنامه کاربر
          </button>
        </form>

        {/* Audit Trail List (Section 137) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-slate-600" />
            <span>لاگ تغییرات دستی و ممیزی مالی</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">شناسه</th>
                  <th className="py-2.5 px-3">کاربر هدف</th>
                  <th className="py-2.5 px-3">مقدار</th>
                  <th className="py-2.5 px-3">علت تغییر</th>
                  <th className="py-2.5 px-3">ادمین ناظر</th>
                  <th className="py-2.5 px-3">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualAdjustments.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{log.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.user}</td>
                    <td className={`py-2.5 px-3 font-mono font-bold ${
                      log.amount.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {log.amount}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.reason}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{log.admin}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
