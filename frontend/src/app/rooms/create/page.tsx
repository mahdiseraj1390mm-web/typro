'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, Shield, Users, Clock, Globe, Lock, Unlock, ArrowRight, 
  CheckCircle, Copy, Bot, FileText, Sparkles, AlertCircle, Eye
} from 'lucide-react';

export default function CreateRoomPage() {
  const [created, setCreated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createdRoomId, setCreatedRoomId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [formData, setFormData] = useState({
    title: '',
    topic: 'فناوری و مهندسی',
    capacity: 6,
    mode: '60Classic',
    trackTheme: 'Cyber City',
    privacy: 'public' as 'public' | 'private',
    password: '',
    minWpm: 0,
    allowSpectators: true,
    fillWithBots: true,
    botDifficulty: 'Intermediate (60 WPM)',
    textSource: 'preset' as 'preset' | 'custom',
    customText: '',
  });

  // Calculate text analytics for custom snippet
  const charCount = formData.customText.length;
  const wordCount = formData.customText.trim() ? formData.customText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = wordCount > 0 ? Math.ceil((wordCount / 50) * 60) : 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.privacy === 'private' && !formData.password.trim()) {
      showToast('⚠️ لطفاً برای اتاق خصوصی یک رمز عبور تعیین فرمایید.');
      return;
    }
    if (formData.textSource === 'custom' && formData.customText.trim().length < 20) {
      showToast('⚠️ متن سفارشی مسابقه باید حداقل حاوی ۲۰ حرف باشد.');
      return;
    }

    const roomId = 'ROOM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedRoomId(roomId);
    setCreated(true);
    showToast('🎉 اتاق مسابقه سفارشی با موفقیت در کلاستر ابری ساخته شد!');
  };

  const copyInviteLink = () => {
    const link = `https://typro.ir/rooms/join?id=${createdRoomId}${formData.privacy === 'private' ? `&pin=${formData.password}` : ''}`;
    navigator.clipboard.writeText(link);
    showToast('📋 لینک دعوت به مسابقه با موفقیت در کلیپ‌بورد کپی شد.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
        <Link
          href="/rooms"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              شخصی‌سازی لابی و رقابت‌ها
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ایجاد اتاق مسابقه سفارشی (Custom Race Room)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            مسابقه دوستانه، کلاسی یا کلوبی خود را با متن و قوانین دلخواه راه‌اندازی نمایید.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {created ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">اتاق مسابقه با موفقیت ساخته شد!</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                شناسه اتاق شما: <strong className="text-blue-600 font-mono text-base">{createdRoomId}</strong>
                {formData.privacy === 'private' && (
                  <span className="block mt-1 font-mono text-xs text-amber-600">
                    رمز عبور اتاق: {formData.password}
                  </span>
                )}
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
              <span className="font-mono text-slate-600 truncate" dir="ltr">
                https://typro.ir/rooms/join?id={createdRoomId}
              </span>
              <button
                onClick={copyInviteLink}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shrink-0 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>کپی لینک</span>
              </button>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Link
                href="/live-race"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
              >
                ورود به پیست مسابقه
              </Link>
              <Link
                href="/rooms"
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                بازگشت به لابی اتاق‌ها
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان اتاق مسابقه</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="مثال: رقابت دوستانه متون سرعتی ادبیات کهن"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">دسته‌بندی موضوعی</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="فناوری و مهندسی">فناوری و مهندسی نرم‌افزار</option>
                  <option value="ادبیات کهن فارسی">ادبیات کهن و گلستان سعدی</option>
                  <option value="شعر و نثر معاصر">شعر و نثر معاصر پارسی</option>
                  <option value="حقوق و متون رسمی">حقوق، اداری و دادگستری</option>
                  <option value="انگلیسی تخصصی">انگلیسی تخصصی (IT & Science)</option>
                </select>
              </div>
            </div>

            {/* Capacity & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ظرفیت لاین‌های پیست</label>
                <select
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value={2}>۲ مسابقه‌دهنده (دوئل تک به تک)</option>
                  <option value={4}>۴ مسابقه‌دهنده (کورس استاندارد)</option>
                  <option value={6}>۶ مسابقه‌دهنده</option>
                  <option value={8}>۸ مسابقه‌دهنده</option>
                  <option value={10}>۱۰ مسابقه‌دهنده (حداکثر پیست)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">قالب مسابقه</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="60Classic">۶۰ ثانیه کلاسیک (Standard)</option>
                  <option value="15Sprint">۱۵ ثانیه اسپرینت سرعتی</option>
                  <option value="30Sprint">۳۰ ثانیه شتابی</option>
                  <option value="Marathon">ماراتن استقامتی (متن کامل)</option>
                  <option value="Perfect Race">مسابقه بدون خطا (Perfect Typing)</option>
                </select>
              </div>
            </div>

            {/* Theme & Track */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تم گرافیکی پیست اتومبیل‌رانی</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'Cyber City', label: 'شهر سایبری (Cyber City)' },
                  { id: 'Desert Sands', label: 'کویر لوت (Desert Sands)' },
                  { id: 'Persepolis', label: 'تخت جمشید (Persepolis)' },
                  { id: 'Space Odyssey', label: 'فضای کیهانی (Space)' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setFormData({ ...formData, trackTheme: t.id })}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition ${
                      formData.trackTheme === t.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Source Switcher */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>منبع متن مسابقه</span>
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, textSource: 'preset' })}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      formData.textSource === 'preset'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    متون هوشمند سامانه
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, textSource: 'custom' })}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      formData.textSource === 'custom'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    آپلود / درج متن دلخواه
                  </button>
                </div>
              </div>

              {formData.textSource === 'custom' && (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={4}
                    value={formData.customText}
                    onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                    placeholder="متن فارسی یا انگلیسی مد نظر خود را اینجا الصاق کنید..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-sans leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                    <span>تعداد حروف: <strong className="text-slate-800 font-mono">{charCount}</strong></span>
                    <span>تعداد کلمات: <strong className="text-slate-800 font-mono">{wordCount}</strong></span>
                    <span>تخمین زمان در سرعت متوسط (۵۰ WPM): <strong className="text-slate-800 font-mono">{estimatedSeconds} ثانیه</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & Password */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>سطح دسترسی و حریم خصوصی</span>
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: 'public' })}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      formData.privacy === 'public'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    عمومی (Public)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: 'private' })}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      formData.privacy === 'private'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    خصوصی (دارای رمز)
                  </button>
                </div>
              </div>

              {formData.privacy === 'private' && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-700">رمز عبور ورود به اتاق:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 2026 یا secret"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    تنها کاربرانی که این رمز را در لابی وارد کنند امکان حضور در پیست را خواهند داشت.
                  </p>
                </div>
              )}
            </div>

            {/* Bots & Spectator Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>تکمیل لاین‌ها با هوش مصنوعی (AI Bots)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.fillWithBots}
                    onChange={(e) => setFormData({ ...formData, fillWithBots: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>
                {formData.fillWithBots && (
                  <select
                    value={formData.botDifficulty}
                    onChange={(e) => setFormData({ ...formData, botDifficulty: e.target.value })}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  >
                    <option value="Novice (30 WPM)">مبتدی (Novice - 30 WPM)</option>
                    <option value="Intermediate (60 WPM)">متوسط (Intermediate - 60 WPM)</option>
                    <option value="Master (90 WPM)">استاد (Master - 90 WPM)</option>
                    <option value="Alien (130 WPM)">فوق بشری (Alien - 130 WPM)</option>
                  </select>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>مجوز تماشای زنده (Spectator Mode)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    سایر کاربران بدون مصرف لاین می‌توانند مسابقه را زنده نظاره کنند.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowSpectators}
                  onChange={(e) => setFormData({ ...formData, allowSpectators: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/rooms"
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                انصراف
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
              >
                ایجاد اتاق و راه‌اندازی پیست
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
