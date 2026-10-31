'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ToggleLeft, ToggleRight, CheckCircle2, Shield, Sparkles, 
  Plus, Search, Sliders, Users, Globe, Zap, Check, AlertCircle 
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  category: 'رقابت' | 'آموزش' | 'بازی‌ها' | 'اقتصاد' | 'کسب درآمد' | 'آزمایشی';
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: 'all' | 'beta_testers' | 'pro_members' | 'staff_only';
  description: string;
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    { 
      id: 'flag-live-race', 
      name: 'سامانه مسابقات چندنفره زنده (Live Race)', 
      category: 'رقابت', 
      enabled: true, 
      rolloutPercentage: 100, 
      targetAudience: 'all',
      description: 'موتور مسابقات اتومبیل‌رانی همزمان با ارتباط WebSocket و تله‌متری زنده لاین‌ها.'
    },
    { 
      id: 'flag-audio-typing', 
      name: 'تمرین تایپ صوتی و ترتیل قرآن (Audio Typing)', 
      category: 'آموزش', 
      enabled: true, 
      rolloutPercentage: 100, 
      targetAudience: 'all',
      description: 'پخش همگام صوت و سنجش مهارت تایپ پیوسته بدون دیدن متن مکتوب.'
    },
    { 
      id: 'flag-video-typing', 
      name: 'تمرین تایپ ویدیویی (Video Typing)', 
      category: 'آموزش', 
      enabled: true, 
      rolloutPercentage: 100, 
      targetAudience: 'all',
      description: 'زیرنویس همگام ویدیوهای تدریس برنامه‌نویسی و مهارت‌های دیجیتال.'
    },
    { 
      id: 'flag-ocr', 
      name: 'نویسه‌خوان هوشمند تصویر به متن (OCR)', 
      category: 'آموزش', 
      enabled: true, 
      rolloutPercentage: 50, 
      targetAudience: 'pro_members',
      description: 'استخراج متون فارسی از روی اسکن جزوه و کتاب با موتور نویسه‌خوان مبتنی بر یادگیری عمیق.'
    },
    { 
      id: 'flag-word-fall', 
      name: 'بازی باران کلمات (Word Fall Arcade)', 
      category: 'بازی‌ها', 
      enabled: true, 
      rolloutPercentage: 100, 
      targetAudience: 'all',
      description: 'بازی تفننی سرعتی برای تقویت واکنش انگشتان دست چپ و راست.'
    },
    { 
      id: 'flag-chests', 
      name: 'صندوق‌های شانس و جوایز (Mystery Loot Box)', 
      category: 'اقتصاد', 
      enabled: true, 
      rolloutPercentage: 100, 
      targetAudience: 'all',
      description: 'دراپ تصادفی پوسته‌های اختصاصی خودرو، بوست‌های ضریب XP و سکه‌های طلایی.'
    },
    { 
      id: 'flag-marketplace', 
      name: 'بازار فریلنسری و پروژه‌های تایپ', 
      category: 'کسب درآمد', 
      enabled: true, 
      rolloutPercentage: 25, 
      targetAudience: 'beta_testers',
      description: 'پلتفرم اتصال تایپیست‌های سریع به کارفرمایان جهت نگارش پایان‌نامه و متون رسمی.'
    },
    { 
      id: 'flag-spectator-mode', 
      name: 'حالت تماشای زنده پیست (Spectator Mode)', 
      category: 'آزمایشی', 
      enabled: true, 
      rolloutPercentage: 100, 
      targetAudience: 'all',
      description: 'امکان مشاهده زنده مسابقات بدون اشغال لاین‌های پیست اتومبیل‌رانی.'
    },
    { 
      id: 'flag-ai-coach-v2', 
      name: 'مربی هوش مصنوعی نسخه ۲ (Neural Adaptive Engine)', 
      category: 'آزمایشی', 
      enabled: false, 
      rolloutPercentage: 10, 
      targetAudience: 'staff_only',
      description: 'تحلیل بایومتریک و ارائه رژیم تمرینی هوشمند جهت جبران تاخیر کلیدهای ضعیف.'
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // New flag form
  const [newFlagId, setNewFlagId] = useState('');
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [newFlagCategory, setNewFlagCategory] = useState<FeatureFlag['category']>('رقابت');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = !f.enabled;
          showToast(`پرچم «${f.name}» ${nextState ? 'فعال' : 'غیرفعال'} شد.`);
          return { ...f, enabled: nextState };
        }
        return f;
      })
    );
  };

  const updateRollout = (id: string, percentage: number) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rolloutPercentage: percentage } : f))
    );
    showToast(`درصد رول‌اوت (Canary) به ${percentage}٪ تنظیم گردید.`);
  };

  const updateAudience = (id: string, audience: FeatureFlag['targetAudience']) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, targetAudience: audience } : f))
    );
    showToast('جامعه هدف پرچم به‌روزرسانی شد.');
  };

  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagId.trim() || !newFlagName.trim()) return;

    const newFlag: FeatureFlag = {
      id: newFlagId.startsWith('flag-') ? newFlagId : `flag-${newFlagId}`,
      name: newFlagName,
      category: newFlagCategory,
      enabled: false,
      rolloutPercentage: 0,
      targetAudience: 'staff_only',
      description: newFlagDesc || 'بدون توضیحات تکمیلی',
    };

    setFlags([newFlag, ...flags]);
    setNewFlagId('');
    setNewFlagName('');
    setNewFlagDesc('');
    setModalOpen(false);
    showToast(`فیچرفلگ جدید «${newFlag.name}» با موفقیت اضافه شد.`);
  };

  const filtered = flags.filter((f) => {
    if (activeCategory !== 'all' && f.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
            مدیریت فیچرفلگ‌ها و کلیدهای فعال‌سازی (Feature Flags)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تغییر آنی وضعیت ماژول‌ها، درصد رول‌اوت تدریجی (Canary Deployment) و تعیین دسترسی گروه‌های کاربری (بند ۱۷۳).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف فیچرفلگ جدید</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی کلید، شناسه یا توضیحات..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          {['all', 'رقابت', 'آموزش', 'بازی‌ها', 'اقتصاد', 'کسب درآمد', 'آزمایشی'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                activeCategory === cat ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              {cat === 'all' ? 'همه دسته‌ها' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="divide-y divide-slate-100">
          {filtered.map((flag) => (
            <div key={flag.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{flag.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {flag.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">({flag.id})</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {flag.description}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Rollout % Slider */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-500">انتشار:</span>
                  <select
                    disabled={!flag.enabled}
                    value={flag.rolloutPercentage}
                    onChange={(e) => updateRollout(flag.id, Number(e.target.value))}
                    className="bg-white font-mono font-bold text-slate-800 text-xs rounded-lg px-2 py-0.5 border border-slate-200 disabled:opacity-40"
                  >
                    <option value={0}>۰٪</option>
                    <option value={10}>۱۰٪</option>
                    <option value={25}>۲۵٪</option>
                    <option value={50}>۵۰٪</option>
                    <option value={100}>۱۰۰٪</option>
                  </select>
                </div>

                {/* Audience Target */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    disabled={!flag.enabled}
                    value={flag.targetAudience}
                    onChange={(e) => updateAudience(flag.id, e.target.value as any)}
                    className="bg-white font-bold text-slate-800 text-xs rounded-lg px-2 py-0.5 border border-slate-200 disabled:opacity-40"
                  >
                    <option value="all">همه کاربران</option>
                    <option value="pro_members">مشترکین VIP</option>
                    <option value="beta_testers">تسترهای بتا</option>
                    <option value="staff_only">فقط پرسنل</option>
                  </select>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    flag.enabled
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {flag.enabled ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-white" />
                      <span>فعال</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>غیرفعال</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Flag Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateFlag} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">تعریف فیچرفلگ جدید</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">شناسه فنی (Key)</label>
              <input
                type="text"
                required
                placeholder="flag-new-feature"
                value={newFlagId}
                onChange={(e) => setNewFlagId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">عنوان ماژول</label>
              <input
                type="text"
                required
                placeholder="مثال: سیستم مسابقات تیمی زنده"
                value={newFlagName}
                onChange={(e) => setNewFlagName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">دسته‌بندی</label>
              <select
                value={newFlagCategory}
                onChange={(e) => setNewFlagCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="رقابت">رقابت</option>
                <option value="آموزش">آموزش</option>
                <option value="بازی‌ها">بازی‌ها</option>
                <option value="اقتصاد">اقتصاد</option>
                <option value="کسب درآمد">کسب درآمد</option>
                <option value="آزمایشی">آزمایشی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">توضیحات ماژول</label>
              <textarea
                rows={3}
                placeholder="کاربرد و دامنه اثر این پرچم را شرح دهید..."
                value={newFlagDesc}
                onChange={(e) => setNewFlagDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                ذخیره فیچرفلگ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
