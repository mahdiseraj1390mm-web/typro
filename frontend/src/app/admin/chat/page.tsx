'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Ban,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Plus,
  Filter,
  Check,
  X
} from 'lucide-react';

export default function AdminChatModerationPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'blacklist'>('reports');

  const [reports, setReports] = useState([
    { id: 'rep-1', sender: 'bad_typer', room: 'اتاق ۱: متن کوتاه فارسی', text: 'پیام اسپم و تبلیغاتی در چت مسابقه...', reason: 'اسپم و تبلیغات', time: '۱۰ دقیقه پیش', status: 'Pending' },
    { id: 'rep-2', sender: 'angry_user', room: 'اتاق ۳: انگلیسی پیشرفته', text: 'استفاده از الفاظ نامناسب بعد از باخت در مسابقه', reason: 'توهین و بی‌احترامی', time: '۱ ساعت پیش', status: 'Pending' },
  ]);

  const [blacklist, setBlacklist] = useState<string[]>([
    'توهین',
    'فحش',
    'تبلیغات',
    'ربات',
    'هک',
    'تقلب',
    'خرید اکانت',
  ]);
  const [newWord, setNewWord] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAction = (id: string, actionType: string) => {
    const rep = reports.find((r) => r.id === id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast("✅ اقدام انضباطی «" + actionType + "» برای کاربر @" + (rep?.sender || 'متخلف') + " اعمال و لاگ گردید.");
  };

  const handleAddBlacklistWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    if (blacklist.includes(newWord.trim())) {
      showToast('این واژه پیش‌تر در لیست سیاه ثبت شده است.');
      return;
    }
    setBlacklist([newWord.trim(), ...blacklist]);
    setNewWord('');
    showToast('واژه جدید با موفقیت به فیلتر کلمات ممنوعه اضافه شد.');
  };

  const handleRemoveWord = (word: string) => {
    setBlacklist(blacklist.filter(w => w !== word));
    showToast("واژه «" + word + "» از فیلتر واژگان ممنوعه حذف شد.");
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
            نظارت بر چت، فیلتر واژگان و مدیریت تخلفات (Chat Moderation)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            بررسی گزارش‌های سوء‌استفاده در اتاق‌های مسابقه، واژه‌نامه کلمات ممنوعه و مسدودسازی متخلفین طبق بندهای ۸۰ و ۱۳۲.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('reports')}
            className={"px-4 py-2.5 rounded-2xl border transition " + (
              activeTab === 'reports' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
            )}
          >
            گزارش‌های تخلف ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={"px-4 py-2.5 rounded-2xl border transition " + (
              activeTab === 'blacklist' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-700 border-slate-200'
            )}
          >
            فیلتر واژگان ممنوعه ({blacklist.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Reports Table (Section 132) */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>پیام‌های گزارش‌شده توسط ناظرین و بازیکنان ({reports.length})</span>
          </h3>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <span className="font-bold block text-slate-700">هیچ گزارش تخلف جدیدی وجود ندارد.</span>
              <span>محیط گفتگو در کلیه اتاق‌های مسابقه سالم و آرام است.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">کاربر فرستنده</th>
                    <th className="py-3 px-4">اتاق مسابقه</th>
                    <th className="py-3 px-4">متن پیام</th>
                    <th className="py-3 px-4">علت گزارش</th>
                    <th className="py-3 px-4">زمان</th>
                    <th className="py-3 px-4 text-center">اقدامات مدیریتی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">@{rep.sender}</td>
                      <td className="py-3 px-4 text-slate-600">{rep.room}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">{rep.text}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {rep.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{rep.time}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleAction(rep.id, 'حذف پیام')}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-red-600 transition"
                            title="حذف پیام"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(rep.id, 'بی‌صدا کردن ۲۴ ساعته')}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-amber-600 transition"
                            title="بی‌صدا کردن کاربر برای ۲۴ ساعت"
                          >
                            <VolumeX className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(rep.id, 'مسدودسازی ۷ روزه')}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition"
                            title="مسدودسازی ۷ روزه"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Word Blacklist (Section 80) */}
      {activeTab === 'blacklist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">فرهنگ واژگان ممنوعه و فیلتر خودکار (Profanity Blacklist)</h3>
              <p className="text-xs text-slate-500 mt-0.5">پیام‌های حاوی این کلمات در تمام چت‌روم‌ها به صورت خودکار با ستاره (***) جایگزین می‌شوند.</p>
            </div>
          </div>

          {/* Add Word Form */}
          <form onSubmit={handleAddBlacklistWord} className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              required
              placeholder="افزودن کلمه جدید به فیلتر..."
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن</span>
            </button>
          </form>

          {/* Words Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 block">واژگان فیلترشده فعال:</span>
            <div className="flex flex-wrap gap-2">
              {blacklist.map((word) => (
                <span
                  key={word}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
