'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Keyboard,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  Layers,
  Hash,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export interface CustomRaceTextItem {
  id: string;
  roomId: string;
  title: string;
  category: string;
  text: string;
  charCount: number;
  wordCount: number;
  createdAt: string;
  createdByName?: string;
}

export interface CustomTypingTextItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'آسان' | 'متوسط' | 'سخت';
  text: string;
  charCount: number;
  wordCount: number;
  createdAt: string;
  createdByName?: string;
}

const ROOM_OPTIONS = [
  { id: 'all', title: 'همه اتاق‌های مسابقه (اشتراکی)' },
  { id: 'room-1', title: 'اتاق ۱: کورس سرعتی فناوری و هوش مصنوعی' },
  { id: 'room-2', title: 'اتاق ۲: ادبیات کهن و گلستان سعدی' },
  { id: 'room-3', title: 'اتاق ۳: انگلیسی برنامه‌نویسان (Fullstack)' },
  { id: 'room-4', title: 'اتاق ۴: شاهنامه فردوسی و حماسی' },
  { id: 'room-scientific', title: 'اتاق ۵: متون علمی و اکتشافات کیهانی' },
  { id: 'room-historical', title: 'اتاق ۶: تاریخ و تمدن‌های کهن' },
  { id: 'room-numbers', title: 'اتاق ۷: پد عددی و سرعت ارقام (بدون فاصله)' },
];

export default function AdminTextsPage() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userPermissions = user?.permissions || [];
  const canManageRaceTexts = isSuperAdmin || userPermissions.includes('content.texts.race');
  const canManageTypingTexts = isSuperAdmin || userPermissions.includes('content.texts.typing');

  const [activeTab, setActiveTab] = useState<'race' | 'typing'>('race');
  const [raceTexts, setRaceTexts] = useState<CustomRaceTextItem[]>([]);
  const [typingTexts, setTypingTexts] = useState<CustomTypingTextItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all_filter');
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [isAddRaceModalOpen, setIsAddRaceModalOpen] = useState(false);
  const [isAddTypingModalOpen, setIsAddTypingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [raceForm, setRaceForm] = useState({
    roomId: 'room-1',
    title: '',
    category: 'علمی و فناوری',
    text: '',
  });

  const [typingForm, setTypingForm] = useState({
    title: '',
    category: 'عمومی و مهارتی',
    difficulty: 'متوسط' as 'آسان' | 'متوسط' | 'سخت',
    text: '',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadTexts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/texts');
      if (res.ok) {
        const data = await res.json();
        setRaceTexts(data.raceTexts || []);
        setTypingTexts(data.typingTexts || []);
      }
    } catch (e) {
      console.warn('Failed loading texts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTexts();
    // Default tab according to available permissions
    if (!canManageRaceTexts && canManageTypingTexts) {
      setActiveTab('typing');
    }
  }, [canManageRaceTexts, canManageTypingTexts]);

  // Handle Add Race Text
  const handleCreateRaceText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raceForm.text.trim()) {
      showToast('لطفاً متن مسابقه را وارد نمایید.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/texts/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...raceForm,
          createdByName: user?.displayName || user?.username || 'ادمین',
        }),
      });
      if (!res.ok) throw new Error('خطا در ذخیره متن');
      const created = await res.json();
      setRaceTexts((prev) => [created, ...prev]);
      setIsAddRaceModalOpen(false);
      setRaceForm({ roomId: 'room-1', title: '', category: 'علمی و فناوری', text: '' });
      showToast('🎉 متن جدید مسابقه با موفقیت به پیست اضافه شد و در چرخه مسابقات قرار گرفت.');
    } catch (err: any) {
      showToast('خطا در ثبت متن مسابقه: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Race Text
  const handleDeleteRaceText = async (id: string) => {
    if (!confirm('آیا از حذف این متن مسابقه مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/texts/race/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف');
      setRaceTexts((prev) => prev.filter((t) => t.id !== id));
      showToast('متن مسابقه با موفقیت حذف شد.');
    } catch (err: any) {
      showToast('خطا در حذف: ' + (err.message || ''));
    }
  };

  // Handle Add Typing Test Text
  const handleCreateTypingText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typingForm.text.trim()) {
      showToast('لطفاً متن تست تایپ را وارد نمایید.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/texts/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...typingForm,
          createdByName: user?.displayName || user?.username || 'ادمین',
        }),
      });
      if (!res.ok) throw new Error('خطا در ذخیره متن');
      const created = await res.json();
      setTypingTexts((prev) => [created, ...prev]);
      setIsAddTypingModalOpen(false);
      setTypingForm({ title: '', category: 'عمومی و مهارتی', difficulty: 'متوسط', text: '' });
      showToast('🎉 متن جدید تست تایپ با موفقیت در بانک متون آزمون ذخیره گردید.');
    } catch (err: any) {
      showToast('خطا در ثبت متن تست تایپ: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Typing Text
  const handleDeleteTypingText = async (id: string) => {
    if (!confirm('آیا از حذف این متن تست تایپ مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/texts/typing/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف');
      setTypingTexts((prev) => prev.filter((t) => t.id !== id));
      showToast('متن تست تایپ با موفقیت حذف شد.');
    } catch (err: any) {
      showToast('خطا در حذف: ' + (err.message || ''));
    }
  };

  // Filter Race Texts
  const filteredRaceTexts = useMemo(() => {
    return raceTexts.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.text.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchRoom = selectedRoomFilter === 'all_filter' || t.roomId === selectedRoomFilter;
      return matchSearch && matchRoom;
    });
  }, [raceTexts, search, selectedRoomFilter]);

  // Filter Typing Texts
  const filteredTypingTexts = useMemo(() => {
    return typingTexts.filter((t) => {
      return (
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.text.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        t.difficulty.includes(search)
      );
    });
  }, [typingTexts, search]);

  const getRoomTitle = (roomId: string) => {
    return ROOM_OPTIONS.find((r) => r.id === roomId)?.title || roomId;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                مدیریت متون مسابقه زنده و تست تایپ
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                افزودن، ویرایش و مدیریت متن‌های پیست مسابقات چندنفره و آزمون‌های رکوردگیری
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'race' && canManageRaceTexts && (
            <button
              onClick={() => setIsAddRaceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن متن به مسابقه زنده</span>
            </button>
          )}

          {activeTab === 'typing' && canManageTypingTexts && (
            <button
              onClick={() => setIsAddTypingModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن متن به تست تایپ</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('race')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'race'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 border border-transparent'
          }`}
        >
          <Trophy className="w-4 h-4 text-emerald-600" />
          <span>متون مسابقه زنده (پیست‌ها)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
            {raceTexts.length}
          </span>
          {!canManageRaceTexts && <Lock className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          onClick={() => setActiveTab('typing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'typing'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 border border-transparent'
          }`}
        >
          <Keyboard className="w-4 h-4 text-blue-600" />
          <span>متون تست تایپ و رکوردگیری</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono">
            {typingTexts.length}
          </span>
          {!canManageTypingTexts && <Lock className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* Permission Warning if No Access */}
      {activeTab === 'race' && !canManageRaceTexts && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-sm">عدم دسترسی به مدیریت متون مسابقه زنده</div>
            <div>
              حساب کاربری شما فاقد مجوز <code>content.texts.race</code> است. جهت اعطای دسترسی، از مدیر اصلی (Super Admin) سامانه درخواست فعال‌سازی نمایید.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'typing' && !canManageTypingTexts && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-sm">عدم دسترسی به مدیریت متون تست تایپ</div>
            <div>
              حساب کاربری شما فاقد مجوز <code>content.texts.typing</code> است. جهت اعطای دسترسی، از مدیر اصلی (Super Admin) سامانه درخواست فعال‌سازی نمایید.
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {((activeTab === 'race' && canManageRaceTexts) || (activeTab === 'typing' && canManageTypingTexts)) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان یا متن..."
              className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {activeTab === 'race' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">فیلتر اتاق:</span>
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all_filter">همه اتاق‌ها</option>
                {ROOM_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: RACE TEXTS */}
      {activeTab === 'race' && canManageRaceTexts && (
        <div className="space-y-4">
          {filteredRaceTexts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="font-black text-slate-900 text-sm">هیچ متن سفارشی در این اتاق ثبت نشده است.</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                متون پیش‌فرض سیستم (۱۴۰+ متن علمی، تاریخی و تکنولوژی) به صورت خودکار در پیست‌ها فعال هستند. می‌توانید با زدن دکمه «افزودن متن به مسابقه زنده»، متون جدید و اختصاصی دلخواه خود را نیز اضافه کنید.
              </p>
              <button
                onClick={() => setIsAddRaceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن اولین متن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRaceTexts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {getRoomTitle(item.roomId)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          دسته‌بندی: {item.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRaceText(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="حذف متن از پیست"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-mono line-clamp-3">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                    <div className="flex items-center gap-3">
                      <span>{item.charCount} نویسه</span>
                      <span>•</span>
                      <span>{item.wordCount} کلمه</span>
                    </div>
                    <span>ثبت توسط: {item.createdByName || 'ادمین'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TYPING TEST TEXTS */}
      {activeTab === 'typing' && canManageTypingTexts && (
        <div className="space-y-4">
          {filteredTypingTexts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Keyboard className="w-6 h-6" />
              </div>
              <div className="font-black text-slate-900 text-sm">متن سفارشی برای تست تایپ یافت نشد.</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                متون استاندارد سیستم در آزمون تایپ فعال هستند. شما می‌توانید متون رسمی جدید را به بانک آزمون اضافه کنید تا کاربران هنگام تست تایپ آن‌ها را مشاهده و تایپ کنند.
              </p>
              <button
                onClick={() => setIsAddTypingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن متن به تست تایپ</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTypingTexts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            item.difficulty === 'آسان'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.difficulty === 'متوسط'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          سطح {item.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          دسته‌بندی: {item.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTypingText(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="حذف متن از آزمون"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-mono line-clamp-3">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                    <div className="flex items-center gap-3">
                      <span>{item.charCount} نویسه</span>
                      <span>•</span>
                      <span>{item.wordCount} کلمه</span>
                    </div>
                    <span>ثبت توسط: {item.createdByName || 'ادمین'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: ADD RACE TEXT ── */}
      {isAddRaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-sm">افزودن متن جدید به پیست مسابقه زنده</h3>
              </div>
              <button
                onClick={() => setIsAddRaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRaceText} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اتاق هدف مسابقه:</label>
                <select
                  value={raceForm.roomId}
                  onChange={(e) => setRaceForm({ ...raceForm, roomId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ROOM_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان متن:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: سفر به سیارات دوردست منظومه شمسی"
                  value={raceForm.title}
                  onChange={(e) => setRaceForm({ ...raceForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">دسته‌بندی موضوعی:</label>
                <input
                  type="text"
                  placeholder="مثلاً: کیهان‌شناسی، تاریخی، حماسی، فناوری"
                  value={raceForm.category}
                  onChange={(e) => setRaceForm({ ...raceForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">محتوای متن مسابقه:</label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {raceForm.text.length} کاراکتر | {raceForm.text.trim().split(/\s+/).filter(Boolean).length} کلمه
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="متن فارسی یا انگلیسی پیست را اینجا وارد یا پیست کنید..."
                  value={raceForm.text}
                  onChange={(e) => setRaceForm({ ...raceForm, text: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'افزودن متن به پیست'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD TYPING TEST TEXT ── */}
      {isAddTypingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">افزودن متن جدید به آزمون تست تایپ</h3>
              </div>
              <button
                onClick={() => setIsAddTypingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTypingText} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان آزمون:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: آزمون دقت و هماهنگی کلیدها"
                  value={typingForm.title}
                  onChange={(e) => setTypingForm({ ...typingForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">درجه سختی:</label>
                  <select
                    value={typingForm.difficulty}
                    onChange={(e: any) => setTypingForm({ ...typingForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="آسان">آسان</option>
                    <option value="متوسط">متوسط</option>
                    <option value="سخت">سخت</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">دسته‌بندی:</label>
                  <input
                    type="text"
                    placeholder="مثلاً: ادبی، علمی، سرعت"
                    value={typingForm.category}
                    onChange={(e) => setTypingForm({ ...typingForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">متن آزمون تست تایپ:</label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {typingForm.text.length} کاراکتر | {typingForm.text.trim().split(/\s+/).filter(Boolean).length} کلمه
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="متن تست تایپ را اینجا بنویسید یا کپی کنید..."
                  value={typingForm.text}
                  onChange={(e) => setTypingForm({ ...typingForm, text: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTypingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'افزودن متن به آزمون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
