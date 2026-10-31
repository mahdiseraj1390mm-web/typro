'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Award,
  Check,
  Lock,
  Car,
  Keyboard,
  Volume2,
  Gift,
  CheckCircle2,
  Eye,
  X,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CollectionItem {
  id: string;
  name: string;
  type: 'car' | 'track' | 'effect' | 'keycap';
  unlocked: boolean;
  speedBonus: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Collection {
  id: string;
  title: string;
  desc: string;
  itemsCount: number;
  unlockedCount: number;
  rewardBadge: string;
  rewardCoins: number;
  color: string;
  items: CollectionItem[];
}

interface SoundTheme {
  id: string;
  name: string;
  switchType: string;
  desc: string;
  pitch: string;
  unlocked: boolean;
}

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<'themes' | 'keycaps' | 'sounds'>('themes');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<string[]>(['col-cyber']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const collections: Collection[] = [
    {
      id: 'col-persian',
      title: 'کلکسیون کهن پارسی (Persian Legend)',
      desc: 'خودروهای اساطیری رخش و سیمرغ همراه با پیست‌های تاریخی تخت جمشید و سی‌وسه‌پل',
      itemsCount: 6,
      unlockedCount: 4,
      rewardBadge: 'نشان زرین کوروش کبیر',
      rewardCoins: 500,
      color: 'from-amber-600 to-amber-900',
      items: [
        { id: 'p1', name: 'خودرو اساطیری رخش', type: 'car', unlocked: true, speedBonus: '+۴٪', rarity: 'legendary' },
        { id: 'p2', name: 'شاهین فیروزه‌ای', type: 'car', unlocked: true, speedBonus: '+۲٪', rarity: 'epic' },
        { id: 'p3', name: 'پیست میدان نقش جهان', type: 'track', unlocked: true, speedBonus: 'استاندارد', rarity: 'rare' },
        { id: 'p4', name: 'افکت خط ترمز زعفرانی', type: 'effect', unlocked: true, speedBonus: 'جلوه ویژه', rarity: 'common' },
        { id: 'p5', name: 'خودرو سیمرغ آتشین', type: 'car', unlocked: false, speedBonus: '+۵٪', rarity: 'legendary' },
        { id: 'p6', name: 'پیست ستون‌های تخت جمشید', type: 'track', unlocked: false, speedBonus: 'شتاب اولیه', rarity: 'epic' },
      ],
    },
    {
      id: 'col-cyber',
      title: 'کلکسیون آینده سایبری (Cyber Phantom)',
      desc: 'خودروهای نئونی سایبر فانتوم، پیست مگاسیتی شبانه و ردپای دیجیتال نئون',
      itemsCount: 6,
      unlockedCount: 6,
      rewardBadge: 'نشان استاد سایبر نئو',
      rewardCoins: 800,
      color: 'from-blue-600 to-indigo-900',
      items: [
        { id: 'c1', name: 'سایبر فانتوم پروتوتایپ', type: 'car', unlocked: true, speedBonus: '+۵٪', rarity: 'legendary' },
        { id: 'c2', name: 'پیست نیو تهران ۲۰۸۰', type: 'track', unlocked: true, speedBonus: 'تثبیت ریتم', rarity: 'epic' },
        { id: 'c3', name: 'افکت نیترو الکتریکال', type: 'effect', unlocked: true, speedBonus: 'افکت شتاب', rarity: 'rare' },
        { id: 'c4', name: 'ردپای ماتریس باینری', type: 'effect', unlocked: true, speedBonus: 'انیمیشن کلید', rarity: 'rare' },
        { id: 'c5', name: 'خودرو سینت‌ویو ۸۴', type: 'car', unlocked: true, speedBonus: '+۳٪', rarity: 'epic' },
        { id: 'c6', name: 'کلیدهای نئونی هولوگرافیک', type: 'keycap', unlocked: true, speedBonus: 'نورپردازی', rarity: 'legendary' },
      ],
    },
    {
      id: 'col-space',
      title: 'کلکسیون کهکشان و اعماق فضا (Cosmic Deep)',
      desc: 'سفینه‌های فضایی مداری، ایستگاه فضایی قمر و نوای صوتی خلاء',
      itemsCount: 5,
      unlockedCount: 2,
      rewardBadge: 'نشان کیهان‌نورد فراراه شیری',
      rewardCoins: 650,
      color: 'from-indigo-800 via-purple-900 to-slate-950',
      items: [
        { id: 's1', name: 'ناوچه شهاب‌سنگ', type: 'car', unlocked: true, speedBonus: '+۲٪', rarity: 'rare' },
        { id: 's2', name: 'پیست مدار ماه', type: 'track', unlocked: true, speedBonus: 'بدون اصطکاک', rarity: 'epic' },
        { id: 's3', name: 'سفینه سیاه‌چاله', type: 'car', unlocked: false, speedBonus: '+۶٪', rarity: 'legendary' },
        { id: 's4', name: 'ردپای غبار ستاره‌ای', type: 'effect', unlocked: false, speedBonus: 'افکت درخشش', rarity: 'rare' },
        { id: 's5', name: 'کیپ‌کپ طرح منظومه شمسی', type: 'keycap', unlocked: false, speedBonus: 'چیکلت فضایی', rarity: 'legendary' },
      ],
    },
  ];

  const soundThemes: SoundTheme[] = [
    { id: 'snd-1', name: 'چری ام‌ایکس آبی (Cherry MX Blue)', switchType: 'کلیکی مکانیکی', desc: 'صدای رسا و تق‌تق واضح کلیک با فیدبک لمسی شدید', pitch: 'فرکانس بالا', unlocked: true },
    { id: 'snd-2', name: 'چری ام‌ایکس قرمز (Cherry MX Red)', switchType: 'خطی نرم', desc: 'حرکت روان و بدون صدا برای تایپ سریع شبانه', pitch: 'بیس ملایم', unlocked: true },
    { id: 'snd-3', name: 'تاپر الکترواستاتیک (Topre 45g)', switchType: 'کلاپ عمیق (Thock)', desc: 'صدای عمیق و گوش‌نواز محبوب نویسندگان حرفه‌ای', pitch: 'صدای تپ پرطنین', unlocked: true },
    { id: 'snd-4', name: 'ماشین‌تحریر نوستالژیک (Retro Typewriter)', switchType: 'مکانیکی سنگین', desc: 'صدای متالیک دنگ زنگ پایان خط و کوبش اهرم‌ها', pitch: 'نوستالژی فلزی', unlocked: false },
  ];

  const handleClaimCollectionReward = (col: Collection) => {
    setClaimedRewards(prev => [...prev, col.id]);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast("🎉 پاداش تکمیل کلکسیون «" + col.title + "» (+" + col.rewardCoins + " سکه و نشان افتخار) واریز شد!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans" dir="rtl">
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
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            بخش ۱۱۲ مستند فنی: سامانه کلکسیون‌ها، گاراژ تماتیک و کیپ‌کپ‌ها
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          کلکسیون‌های تماتیک و سفارشی‌سازی صوتی (Collections & Garage)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          با جمع‌آوری کامل ست‌های اساطیری، سایبری و فضایی، نشان‌های افتخار دریافت کنید و تم صوتی سوئیچ‌های مکانیکی کیبورد خود را شخصی‌سازی نمایید.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'themes', label: 'کلکسیون‌های تماتیک مسابقه', icon: Trophy },
          { id: 'sounds', label: 'تم‌های صوتی سوئیچ‌های کیبورد', icon: Volume2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={"flex items-center gap-2 px-5 py-2.5 rounded-2xl transition " + (
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: THEMATIC COLLECTIONS */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col) => {
            const isComplete = col.unlockedCount === col.itemsCount;
            const pct = Math.round((col.unlockedCount / col.itemsCount) * 100);
            const isClaimed = claimedRewards.includes(col.id);

            return (
              <div
                key={col.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between hover:border-blue-400 transition"
              >
                <div className="space-y-4">
                  <div
                    className={"h-36 rounded-2xl bg-linear-to-r " + col.color + " text-white p-5 flex flex-col justify-between shadow-md relative overflow-hidden"}
                  >
                    <div className="flex justify-between items-start z-10">
                      <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                        {col.unlockedCount} از {col.itemsCount} آیتم آزادشده
                      </span>
                      {isComplete && (
                        <span className="text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>تکمیل‌شده</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-lg z-10">{col.title}</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{col.desc}</p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>پیشرفت مجموعه</span>
                      <span>{pct}٪</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions & Reward */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <Award className="w-4 h-4" />
                      <span>{col.rewardBadge}</span>
                    </div>
                    <span className="font-mono text-slate-500">+{col.rewardCoins} سکه</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCollection(col)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مشاهده آیتم‌ها</span>
                    </button>

                    {isComplete && (
                      isClaimed ? (
                        <span className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">
                          دریافت شد ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaimCollectionReward(col)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                        >
                          دریافت پاداش
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: KEYBOARD SOUND THEMES */}
      {activeTab === 'sounds' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-black text-base text-slate-900">تم‌های صوتی سوئیچ‌های مکانیکی (Acoustic Typing Profiles)</h3>
            <p className="text-xs text-slate-500 mt-0.5">صدای کلیدها حین تایپ بر اساس سوئیچ مکانیکی مورد علاقه شما شبیه‌سازی می‌شود.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {soundThemes.map((snd) => (
              <div
                key={snd.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900">{snd.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {snd.switchType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{snd.desc}</p>
                  <span className="text-[11px] text-slate-400 block pt-1 font-mono">طنین صوت: {snd.pitch}</span>
                </div>

                <div className="shrink-0">
                  {snd.unlocked ? (
                    <button
                      onClick={() => showToast("تم صوتی «" + snd.name + "» به عنوان صدای پیش‌فرض کیبورد فعال شد.")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      فعال‌سازی
                    </button>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>قفل (سطح ۱۵)</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Inspect Modal */}
      {selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative">
            <button
              onClick={() => setSelectedCollection(null)}
              className="absolute top-6 left-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase">مشاهده آیتم‌های کلکسیون</span>
              <h3 className="font-black text-lg text-slate-900">{selectedCollection.title}</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedCollection.items.map((item) => (
                <div
                  key={item.id}
                  className={"p-3.5 rounded-2xl border flex items-center justify-between text-xs " + (
                    item.unlocked
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-100/60 border-slate-200/50 text-slate-400'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.type === 'car' ? '🏎️' : item.type === 'track' ? '🏁' : '✨'}</span>
                    <div>
                      <span className="font-bold block">{item.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">{item.speedBonus}</span>
                    </div>
                  </div>

                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-md " + (
                    item.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                  )}>
                    {item.unlocked ? 'آزاد شده ✓' : 'قفل'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCollection(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
