'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, ArrowRight, Plus, Edit2, Trash2, CheckCircle2, 
  X, Sparkles, Star, Target, Eye, Key, Keyboard, Award 
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  tier: 'مقدماتی' | 'مبتدی' | 'متوسط' | 'پیشرفته' | 'قرآن' | 'اسپرینت';
  keys: string;
  fingerGroup: string;
  minWpm: number;
  accuracy: number;
  sampleText: string;
  threeStarWpm: number;
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([
    { 
      id: 1, 
      title: 'کلیدهای شاخص برجسته «ت» و «ن»', 
      tier: 'مقدماتی', 
      keys: 'ت، ن، ب، ی', 
      fingerGroup: 'سبابه چپ و راست',
      minWpm: 15, 
      accuracy: 95,
      threeStarWpm: 30,
      sampleText: 'تن تن بت بی بن نی تین نین بین تبت' 
    },
    { 
      id: 2, 
      title: 'ردیف میانی کامل (Home Row Fingers)', 
      tier: 'مقدماتی', 
      keys: 'ش، س، ی، ب، ل، ا، ت، ن، م، ک، گ', 
      fingerGroup: 'تمام انگشتان دست چپ و راست',
      minWpm: 20, 
      accuracy: 96,
      threeStarWpm: 35,
      sampleText: 'شایست با شتاب به سمت کلیدها رفت' 
    },
    { 
      id: 3, 
      title: 'ردیف بالا و جهش انگشتان سبابه', 
      tier: 'متوسط', 
      keys: 'ق، ف، غ، ع، ه، خ، ح، ج، چ', 
      fingerGroup: 'سبابه و وسطی بالا',
      minWpm: 25, 
      accuracy: 95,
      threeStarWpm: 45,
      sampleText: 'خورشید جهان‌فروز از بلندای قله درخشید' 
    },
    { 
      id: 4, 
      title: 'ردیف پایین و دامنه حرکتی مچ', 
      tier: 'متوسط', 
      keys: 'ظ، ط، ز، ر، ذ، د، پ، و', 
      fingerGroup: 'انگشتان کوچک و ردیف تحتانی',
      minWpm: 30, 
      accuracy: 95,
      threeStarWpm: 50,
      sampleText: 'پرواز در افق دوردست روزگار دیرپای' 
    },
    { 
      id: 5, 
      title: 'کتابت روان آیات قرآن کریم', 
      tier: 'قرآن', 
      keys: 'َ، ِ، ُ، ً، ٍ، ٌ، ّ، ْ', 
      fingerGroup: 'ترکیب کلید Shift + ردیف عددی و بالا',
      minWpm: 20, 
      accuracy: 98,
      threeStarWpm: 35,
      sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' 
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTier, setNewTier] = useState<Lesson['tier']>('مقدماتی');
  const [newKeys, setNewKeys] = useState('');
  const [newFingerGroup, setNewFingerGroup] = useState('سبابه چپ و راست');
  const [newMinWpm, setNewMinWpm] = useState(20);
  const [newAccuracy, setNewAccuracy] = useState(95);
  const [newThreeStarWpm, setNewThreeStarWpm] = useState(35);
  const [newSampleText, setNewSampleText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newLesson: Lesson = {
      id: lessons.length + 1,
      title: newTitle.trim(),
      tier: newTier,
      keys: newKeys.trim() || 'کلیدهای پایه',
      fingerGroup: newFingerGroup,
      minWpm: newMinWpm,
      accuracy: newAccuracy,
      threeStarWpm: newThreeStarWpm,
      sampleText: newSampleText.trim() || 'تمرین پیش‌فرض درس',
    };

    setLessons([...lessons, newLesson]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewKeys('');
    setNewSampleText('');
    showToast(`✅ درس جدید «${newLesson.title}» با موفقیت در کوریکولوم آکادمی ذخیره شد.`);
  };

  const handleDelete = (id: number) => {
    const item = lessons.find(l => l.id === id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    showToast(`درس «${item?.title || id}» با موفقیت حذف گردید.`);
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

      {/* Lesson Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">پیش‌نمایش درس آکادمی</h3>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 text-base">{previewLesson.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">حداقل سرعت قبولی</span>
                  <span className="font-mono font-black text-slate-800">{previewLesson.minWpm} WPM</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">حداقل دقت</span>
                  <span className="font-mono font-black text-emerald-600">{previewLesson.accuracy}٪</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">سرعت ۳ ستاره</span>
                  <span className="font-mono font-black text-amber-500">{previewLesson.threeStarWpm} WPM</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">انگشتان درگیر</span>
                  <span className="font-bold text-blue-600">{previewLesson.fingerGroup}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block font-bold mb-1">متن تمرینی درس:</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-mono leading-relaxed text-center">
                  {previewLesson.sampleText}
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewLesson(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
            >
              بستن پیش‌نمایش
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                مدیریت کوریکولوم آموزشی و مهارت دست‌ها
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              مدیریت دروس آکادمی تایپرو (Lessons CMS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              تنظیم دروس آکادمی، تخصیص انگشتان طبق استاندارد ISIRI 9147 و تعریف شرایط قبولی و ستاره‌ها (بند ۳۴ الی ۳۶).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 self-start shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن درس جدید</span>
        </button>
      </div>

      {/* Lessons Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">شماره</th>
                <th className="py-3 px-4">عنوان درس</th>
                <th className="py-3 px-4">سطح</th>
                <th className="py-3 px-4">کلیدهای هدف</th>
                <th className="py-3 px-4">انگشتان درگیر</th>
                <th className="py-3 px-4">شرط قبولی (WPM / دقت)</th>
                <th className="py-3 px-4">۳ ستاره</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{lesson.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{lesson.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-600">
                      {lesson.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{lesson.keys}</td>
                  <td className="py-3.5 px-4 text-slate-600">{lesson.fingerGroup}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    <strong className="text-slate-900">{lesson.minWpm} WPM</strong> / {lesson.accuracy}٪
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{lesson.threeStarWpm} WPM</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewLesson(lesson)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="پیش‌نمایش درس"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="حذف درس"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateLesson} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">طراحی و افزودن درس جدید</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">عنوان درس</label>
              <input
                type="text"
                required
                placeholder="مثال: کلیدهای زاویه‌دار ردیف بالا"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سطح آموزشی</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="مقدماتی">مقدماتی</option>
                  <option value="مبتدی">مبتدی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                  <option value="قرآن">قرآن و اعراب</option>
                  <option value="اسپرینت">اسپرینت</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">گروه انگشتان درگیر</label>
                <input
                  type="text"
                  placeholder="مثال: انگشت کوچک دست چپ"
                  value={newFingerGroup}
                  onChange={(e) => setNewFingerGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">کلیدهای هدف (جداشده با ویرگول)</label>
              <input
                type="text"
                required
                placeholder="ش، س، ی، ب"
                value={newKeys}
                onChange={(e) => setNewKeys(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">کف سرعت قبولی</label>
                <input
                  type="number"
                  value={newMinWpm}
                  onChange={(e) => setNewMinWpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">کف دقت قبولی (٪)</label>
                <input
                  type="number"
                  value={newAccuracy}
                  onChange={(e) => setNewAccuracy(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سرعت ۳ ستاره</label>
                <input
                  type="number"
                  value={newThreeStarWpm}
                  onChange={(e) => setNewThreeStarWpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">متن نمونه تمرینی درس</label>
              <textarea
                rows={3}
                required
                placeholder="متن کوتاه تمرین را بنویسید..."
                value={newSampleText}
                onChange={(e) => setNewSampleText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                ثبت درس
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
