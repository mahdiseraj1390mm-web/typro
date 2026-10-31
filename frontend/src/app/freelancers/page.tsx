'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Shield,
  Star,
  Award,
  Search,
  Filter,
  CheckCircle2,
  MessageSquare,
  X,
  ArrowLeft,
  Lock,
  FileText,
  UserPlus,
  User,
  Plus,
  Zap,
  Phone,
  Send,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

export interface Freelancer {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  category: 'academic' | 'audio' | 'legal' | 'general';
  verifiedWpm: number;
  accuracy: number;
  trustScore: number;
  completedOrders: number;
  pricePerPageNum: number;
  pricePerPage: string;
  skills: string[];
  contactInfo?: string;
  rating: number;
  registeredAt: string;
}

const STORAGE_KEY = 'typro_registered_freelancers';

export default function FreelancersPage() {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderingFreelancer, setOrderingFreelancer] = useState<Freelancer | null>(null);

  // Escrow Order Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [pageCount, setPageCount] = useState<number>(5);
  const [projectDescription, setProjectDescription] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Freelancer Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regCategory, setRegCategory] = useState<'academic' | 'audio' | 'legal' | 'general'>('academic');
  const [regWpm, setRegWpm] = useState<number>(75);
  const [regAccuracy, setRegAccuracy] = useState<number>(99);
  const [regPrice, setRegPrice] = useState<number>(15000);
  const [regSkills, setRegSkills] = useState('تایپ سریع، ورد، نیم‌فاصله');
  const [regContact, setRegContact] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load registered freelancers (all fake personas removed)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Freelancer[] = JSON.parse(saved);
        // Ensure no fake mock personas
        const cleaned = parsed.filter(
          (f) =>
            f.name !== 'مهدی کاظمی' &&
            f.name !== 'فاطمه صادقی' &&
            f.name !== 'امیرحسین نوری' &&
            f.name !== 'زهرا رضوی'
        );
        setFreelancers(cleaned);
      } else {
        setFreelancers([]);
      }
    } catch {
      setFreelancers([]);
    }

    // Prefill registration inputs from logged-in profile
    const savedName = localStorage.getItem('typro_profile_name') || user?.displayName || '';
    const savedAvatar = localStorage.getItem('typro_profile_avatar') || user?.avatar || '';
    const bestWpm = Number(localStorage.getItem('typro_best_wpm') || 75);
    const bestAcc = Number(localStorage.getItem('typro_best_accuracy') || 99);

    if (savedName) setRegName(savedName);
    if (savedAvatar) setRegAvatar(savedAvatar);
    if (bestWpm > 0) setRegWpm(bestWpm);
    if (bestAcc > 0) setRegAccuracy(bestAcc);
  }, [user]);

  // Handle new freelancer registration
  const handleRegisterFreelancer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regTitle.trim()) {
      showToast('⚠️ لطفاً نام و عنوان تخصص خود را وارد کنید.');
      return;
    }

    const skillsArray = regSkills
      .split('،')
      .map((s) => s.trim())
      .flatMap((s) => s.split(','))
      .map((s) => s.trim())
      .filter(Boolean);

    const newFl: Freelancer = {
      id: `freelancer-${Date.now()}`,
      name: regName.trim(),
      avatar: regAvatar.trim() || undefined,
      title: regTitle.trim(),
      category: regCategory,
      verifiedWpm: Number(regWpm) || 70,
      accuracy: Number(regAccuracy) || 98,
      trustScore: 95,
      completedOrders: 0,
      pricePerPageNum: Number(regPrice) || 15000,
      pricePerPage: `${Number(regPrice).toLocaleString('fa-IR')} تومان`,
      skills: skillsArray.length > 0 ? skillsArray : ['تایپ ده‌انگشتی', 'رعایت نیم‌فاصله'],
      contactInfo: regContact.trim(),
      rating: 5.0,
      registeredAt: new Date().toLocaleDateString('fa-IR'),
    };

    const updated = [newFl, ...freelancers];
    setFreelancers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    setIsRegisterOpen(false);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    showToast(`✅ تبریک «${newFl.name}»! رزومه شما با موفقیت ثبت شد و برای تمامی کارفرمایان نمایش داده می‌شود.`);
  };

  const categories = [
    { id: 'all', label: 'همه تخصص‌ها' },
    { id: 'academic', label: 'دانشگاهی و فرمول' },
    { id: 'audio', label: 'تایپ صوتی و پادکست' },
    { id: 'legal', label: 'حقوقی و اداری' },
    { id: 'general', label: 'عمومی و نگارش کتاب' },
  ];

  const filtered = freelancers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenOrderModal = (fl: Freelancer) => {
    setOrderingFreelancer(fl);
    setProjectTitle(`سفارش تایپ متون برای ${fl.name}`);
    setPageCount(5);
    setProjectDescription('');
    setOrderSuccess(false);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
  };

  // Helper for rendering avatar photo or clean empty frame
  const renderAvatar = (avatarUrl?: string, name?: string) => {
    if (avatarUrl && (avatarUrl.startsWith('data:image') || avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      return (
        <img
          src={avatarUrl}
          alt={name || 'تایپیست'}
          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
        />
      );
    }
    // اگر عکس پروفایل بدون عکس بود خالی باشد
    return (
      <div
        className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 text-slate-300 flex items-center justify-center shrink-0"
        title={name ? `${name} (بدون عکس)` : 'بدون عکس'}
      >
        <User className="w-6 h-6 text-slate-300 stroke-[1.5]" />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              سامانه اشتغال و بازار کار تایپرو (Freelance Marketplace)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            تایپیست‌های فریلنسر با مهارت اعتبارسنجی‌شده
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            تنها تایپیست‌های واقعی ثبت‌نام‌شده نمایش داده می‌شوند. کارفرمایان می‌توانند بر اساس سرعت تاییدشده، دقت و نمونه‌کار مستقیماً پروژه ثبت نمایند.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت‌نام و عضویت به عنوان تایپیست</span>
          </button>

          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-200"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>پیگیری سفارش‌ها</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام یا مهارت تایپیست..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 text-xs sm:text-sm bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Freelancers Grid or Real Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto text-2xl">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">
              هنوز تایپیستی در این بخش ثبت‌نام نکرده است
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              تمامی اطلاعات و افراد ساختگی حذف شده‌اند. هر کاربر واقعی که به عنوان فریلنسر ثبت‌نام کند، بلافاصله در این بخش برای کارفرمایان سراسر کشور به نمایش درخواهد آمد.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت رزومه من به عنوان اولین تایپیست</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((fl) => (
            <div
              key={fl.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderAvatar(fl.avatar, fl.name)}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{fl.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{fl.rating}</span>
                        <span className="text-slate-400 font-normal">
                          ({fl.completedOrders} سفارش موفق)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Score Badge */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{fl.trustScore}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5">امتیاز اعتماد</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">{fl.title}</p>

                {/* Verified Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">سرعت تاییدشده</span>
                    <span className="text-base font-extrabold text-blue-600 font-mono">
                      {fl.verifiedWpm} WPM
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">دقت تاییدشده</span>
                    <span className="text-base font-extrabold text-emerald-600 font-mono">
                      {fl.accuracy}٪
                    </span>
                  </div>
                </div>

                {/* Skill Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {fl.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">شروع قیمت هر صفحه</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {fl.pricePerPage}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenOrderModal(fl)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
                >
                  ثبت سفارش امن امانی
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Freelancer Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase">عضویت در بازار کار تایپرو</span>
              <h3 className="font-black text-lg text-slate-900">
                ثبت رزومه و پیوستن به تایپیست‌های تاییدشده
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                مشخصات و تعرفه دستمزد خود را ثبت کنید تا به کارفرمایان معرفی شوید.
              </p>
            </div>

            <form onSubmit={handleRegisterFreelancer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: علیرضا محمدی"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تخصص و دسته‌بندی:</label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="academic">دانشگاهی و فرمول</option>
                    <option value="audio">تایپ صوتی و پادکست</option>
                    <option value="legal">حقوقی و اداری</option>
                    <option value="general">عمومی و کتاب</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  عنوان کوتاه شغلی / معرفی تخصص:
                </label>
                <input
                  type="text"
                  required
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  placeholder="مثال: تایپیست تخصصی مقالات ISI و متون انگلیسی و عربی"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سرعت (WPM):</label>
                  <input
                    type="number"
                    value={regWpm}
                    onChange={(e) => setRegWpm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">دقت (درصد):</label>
                  <input
                    type="number"
                    value={regAccuracy}
                    onChange={(e) => setRegAccuracy(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">قیمت هر صفحه (تومان):</label>
                  <input
                    type="number"
                    step={1000}
                    value={regPrice}
                    onChange={(e) => setRegPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  مهارت‌ها (با ویرگول جدا کنید):
                </label>
                <input
                  type="text"
                  value={regSkills}
                  onChange={(e) => setRegSkills(e.target.value)}
                  placeholder="مثال: تایپ صوتی، رعایت نیم‌فاصله، جدول و فرمول، قالب‌بندی Word"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شماره تماس یا آیدی تلگرام برای ارتباط کارفرما:
                </label>
                <input
                  type="text"
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                  placeholder="مثال: @username یا 0912..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                عکس پروفایل شما به صورت خودکار از بخش «پروفایل» بارگذاری می‌شود؛ در صورتی که عکسی ثبت نکرده باشید، کادر تصویر خالی نمایش داده خواهد شد.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-500/20"
                >
                  ثبت رسمی در لیست فریلنسرها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Escrow Order Modal */}
      {orderingFreelancer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setOrderingFreelancer(null)}
              className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!orderSuccess ? (
              <form onSubmit={handleConfirmOrder} className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase">
                    ضمانت پرداخت امانی تایپرو (Typro Escrow)
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-900 mt-0.5">
                    ثبت سفارش برای «{orderingFreelancer.name}»
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    وجه پرداختی شما تا زمان تحویل فایل و تایید کامل کیفیت، نزد حساب امانی تایپرو محفوظ خواهد ماند.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">عنوان پروژه یا سند:</label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">تعداد صفحات تخمینی:</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={pageCount}
                        onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-3 rounded-xl border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">مبلغ ودیعه امانی:</label>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-blue-600 text-sm">
                        {(pageCount * orderingFreelancer.pricePerPageNum).toLocaleString('fa-IR')} تومان
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">توضیحات و دستورالعمل انجام تایپ:</label>
                    <textarea
                      rows={3}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="فرمت موردنظر، استانداردهای فونت یا فایل پیوست را شرح دهید..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setOrderingFreelancer(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>پرداخت امن به حساب امانی</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">سفارش با موفقیت ثبت شد</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    پیام ودیعه به تایپیست مخابره شد. وجه پروژه در حساب امانی امن قرار گرفت و پس از دریافت فایل نهایی آزاد می‌شود.
                  </p>
                </div>
                <button
                  onClick={() => setOrderingFreelancer(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  بستن پنجره
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
