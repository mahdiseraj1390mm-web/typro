'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit, Trash2, CheckCircle2, Search, Filter, 
  Sparkles, FileText, Upload, BarChart2, Hash, Layers, Check, X, ShieldAlert,
  Headphones, Volume2, Play, Pause, Eye, EyeOff, ShieldCheck, Sliders, GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import {
  AudioLessonItem,
  getStoredAudioLessons,
  saveStoredAudioLessons
} from '@/data/audioVideoData';
import {
  getTypingDisplayConfig,
  saveTypingDisplayConfig,
  TypingDisplayConfig,
  DEFAULT_TYPING_DISPLAY_CONFIG
} from '@/lib/typingDisplayConfig';

import ADMIN_CONTENT_JSON from '@/data/adminContentPool.json';

interface ContentItem {
  id: string;
  title: string;
  category: string;
  targetSection?: 'all' | 'typing_test' | 'live_race' | 'free_typing' | 'quran';
  lineFormat?: 'single' | 'multiline' | 'long';
  status: 'published' | 'draft' | 'archived';
  lang: 'fa' | 'en';
  difficulty: 'آسان' | 'متوسط' | 'سخت' | 'استادی';
  length: 'کوتاه' | 'متوسط' | 'بلند';
  charCount: number;
  wordCount: number;
  harakatCount: number;
  entropyScore: number;
  content: string;
}

export default function AdminContentCmsPage() {
  const [contentList, setContentList] = useState<ContentItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_admin_content_list');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { /* fallback */ }
      }
    }
    return ADMIN_CONTENT_JSON as ContentItem[];
  });

  const saveContentList = (updated: ContentItem[]) => {
    setContentList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_admin_content_list', JSON.stringify(updated));
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [inspectorItem, setInspectorItem] = useState<ContentItem | null>(null);

  // New Content Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('قرآن');
  const [newText, setNewText] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [newTargetSection, setNewTargetSection] = useState<'all' | 'typing_test' | 'live_race' | 'free_typing' | 'quran'>('typing_test');
  const [newLineFormat, setNewLineFormat] = useState<'single' | 'multiline' | 'long'>('multiline');

  const [adminTab, setAdminTab] = useState<'texts' | 'audio_dictation' | 'display_settings'>('texts');

  // Box Display Appearance Config State
  const [displayConfig, setDisplayConfig] = useState<TypingDisplayConfig>(DEFAULT_TYPING_DISPLAY_CONFIG);

  useEffect(() => {
    setDisplayConfig(getTypingDisplayConfig());
  }, []);

  const handleSaveDisplayConfig = () => {
    saveTypingDisplayConfig(displayConfig);
    showToast('✅ ابعاد و رنگ‌بندی باکس تایپ با موفقیت در سراسر سامانه ذخیره و اعمال شد.');
  };

  const handleResetDisplayConfig = () => {
    setDisplayConfig(DEFAULT_TYPING_DISPLAY_CONFIG);
    saveTypingDisplayConfig(DEFAULT_TYPING_DISPLAY_CONFIG);
    showToast('↺ ابعاد و تنظیمات باکس به حالت پیش‌فرض (مشکی، آبی، فوق‌عریض) بازنشانی شد.');
  };

  // Audio Lessons CMS State
  const [audioList, setAudioList] = useState<AudioLessonItem[]>([]);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [newAudioTitle, setNewAudioTitle] = useState('');
  const [newAudioCategory, setNewAudioCategory] = useState('اخلاقی و انگیزشی');
  const [newAudioPrompt, setNewAudioPrompt] = useState('');
  const [newAudioTranscript, setNewAudioTranscript] = useState('');
  const [newAudioDuration, setNewAudioDuration] = useState('۲۰ ثانیه');
  const [newAudioDifficulty, setNewAudioDifficulty] = useState<'مقدماتی' | 'متوسط' | 'پیشرفته'>('مقدماتی');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    setAudioList(getStoredAudioLessons());
  }, []);

  const handleSaveAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudioTitle.trim() || !newAudioTranscript.trim()) {
      showToast('⚠️ لطفاً عنوان صوت و متن مرجع پنهان را وارد کنید.');
      return;
    }

    const newAudio: AudioLessonItem = {
      id: `audio-${Date.now()}`,
      title: newAudioTitle.trim(),
      category: 'custom',
      categoryFa: newAudioCategory,
      audioPrompt: newAudioPrompt.trim() || 'پیاده‌سازی صوت به متن گفتار رسمی',
      referenceTranscript: newAudioTranscript.trim(),
      durationEst: newAudioDuration,
      difficulty: newAudioDifficulty,
      source: 'admin',
    };

    const updated = [newAudio, ...audioList];
    setAudioList(updated);
    saveStoredAudioLessons(updated);
    setAudioModalOpen(false);

    // Reset
    setNewAudioTitle('');
    setNewAudioPrompt('');
    setNewAudioTranscript('');
    showToast('✓ فایل صوتی جدید همراه با متن مرجع پنهان با موفقیت ذخیره شد.');
  };

  const handleDeleteAudio = (id: string) => {
    const updated = audioList.filter((a) => a.id !== id);
    setAudioList(updated);
    saveStoredAudioLessons(updated);
    showToast('فایل صوتی حذف شد.');
  };

  const handleTestAudioPlay = (item: AudioLessonItem) => {
    if ('speechSynthesis' in window) {
      if (playingAudioId === item.id) {
        window.speechSynthesis.cancel();
        setPlayingAudioId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(item.referenceTranscript);
        utterance.lang = 'fa-IR';
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingAudioId(item.id);
      }
    }
  };

  // Real-time Lexical & Entropy Scorer
  const calculateTextMetrics = (text: string) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const harakat = (text.match(/[ًٌٍَُِّْـ]/g) || []).length;
    const uniqueChars = new Set(text.replace(/\s+/g, '')).size;
    const entropy = chars > 0 ? Number(((uniqueChars / 32) * (1 + harakat / (chars || 1)) * 3).toFixed(1)) : 1.0;
    
    let difficulty: 'آسان' | 'متوسط' | 'سخت' | 'استادی' = 'متوسط';
    if (entropy < 2.5) difficulty = 'آسان';
    else if (entropy < 3.8) difficulty = 'متوسط';
    else if (entropy < 4.5) difficulty = 'سخت';
    else difficulty = 'استادی';

    return { chars, words, harakat, entropy: Math.min(entropy, 5.0), difficulty };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const metrics = calculateTextMetrics(newText);
    const isEn = /[a-zA-Z]/.test(newText.slice(0, 30));

    const newItem: ContentItem = {
      id: `cnt-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      targetSection: newTargetSection,
      lineFormat: newLineFormat,
      status: 'published',
      lang: isEn ? 'en' : 'fa',
      difficulty: metrics.difficulty,
      length: metrics.words > 60 ? 'بلند' : metrics.words > 25 ? 'متوسط' : 'کوتاه',
      charCount: metrics.chars,
      wordCount: metrics.words,
      harakatCount: metrics.harakat,
      entropyScore: metrics.entropy,
      content: newText,
    };

    saveContentList([newItem, ...contentList]);
    setNewTitle('');
    setNewText('');
    setModalOpen(false);
    showToast(`✅ متن «${newItem.title}» با نمره سختی ${metrics.entropy} ثبت گردید.`);
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const passages = bulkText.split('---').map(p => p.trim()).filter(p => p.length > 10);
    if (passages.length === 0) {
      showToast('⚠️ متنی با جداکننده --- یافت نشد.');
      return;
    }

    const newItems: ContentItem[] = passages.map((p, idx) => {
      const firstLine = p.split('\n')[0].substring(0, 40);
      const metrics = calculateTextMetrics(p);
      return {
        id: `cnt-bulk-${Date.now()}-${idx}`,
        title: `واردسازی دسته‌ای: ${firstLine}...`,
        category: 'ادبیات',
        status: 'published',
        lang: 'fa',
        difficulty: metrics.difficulty,
        length: metrics.words > 60 ? 'بلند' : 'متوسط',
        charCount: metrics.chars,
        wordCount: metrics.words,
        harakatCount: metrics.harakat,
        entropyScore: metrics.entropy,
        content: p,
      };
    });

    saveContentList([...newItems, ...contentList]);
    setBulkText('');
    setBulkModalOpen(false);
    showToast(`📦 تعداد ${newItems.length} متن با موفقیت پردازش و ذخیره شد.`);
  };

  const handleDelete = (id: string) => {
    const item = contentList.find((c) => c.id === id);
    saveContentList(contentList.filter((c) => c.id !== id));
    showToast(`متن «${item?.title || id}» با موفقیت حذف گردید.`);
  };

  const filtered = contentList.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
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

      {/* Text Inspector Drawer */}
      {inspectorItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">آنالیز لغوی و تله‌متری متن</h3>
              <button
                onClick={() => setInspectorItem(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">عنوان:</span>
                <span className="font-bold text-slate-800">{inspectorItem.title}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">کاراکترها</span>
                  <span className="font-mono font-black text-slate-800">{inspectorItem.charCount}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">کلمات</span>
                  <span className="font-mono font-black text-slate-800">{inspectorItem.wordCount}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">تعداد اعراب</span>
                  <span className="font-mono font-black text-emerald-600">{inspectorItem.harakatCount}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">آنتروپی</span>
                  <span className="font-mono font-black text-blue-600">{inspectorItem.entropyScore} / 5.0</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">محتوای کامل:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed max-h-48 overflow-y-auto">
                  {inspectorItem.content}
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectorItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs between Text CMS, Audio Dictation CMS, and Display Appearance Settings */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAdminTab('texts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
            adminTab === 'texts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>کتابخانه متون و قرآن ({contentList.length} متن)</span>
        </button>

        <button
          onClick={() => setAdminTab('audio_dictation')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
            adminTab === 'audio_dictation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>مدیریت صوت‌ها و متون مرجع پیاده‌سازی ({audioList.length} صوت فعال)</span>
        </button>

        <button
          onClick={() => setAdminTab('display_settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
            adminTab === 'display_settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>تنظیمات ابعاد، فونت و ظاهر باکس تایپ ⚙️</span>
        </button>

        <Link
          href="/admin/lessons"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
        >
          <GraduationCap className="w-4 h-4" />
          <span>پنل مدیریت دروس آکادمی (مقدماتی، مبتدی، پیشرفته) 🎓</span>
        </Link>
      </div>

      {adminTab === 'texts' ? (
        <>
          {/* Header Texts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin" className="text-xs text-blue-600 hover:underline">← بازگشت به داشبورد ادمین</Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                سیستم مدیریت محتوای مرکزی و قرآن (Central Content CMS)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                مدیریت، ارزیابی خودکار ضریب سختی (آنتروپی لغوی)، اعراب‌سنجی و واردسازی دسته‌ای متون (بند ۲۷ الی ۳۰).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition border border-slate-200"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>واردسازی فله‌ای (Bulk)</span>
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن متن جدید</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی متن، عنوان یا دسته‌بندی..."
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              {['all', 'قرآن', 'فناوری', 'ادبیات', 'کد و نرم‌افزار'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                    selectedCategory === cat ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {cat === 'all' ? 'همه دسته‌ها' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">عنوان محتوا</th>
                    <th className="py-3 px-4">دسته</th>
                    <th className="py-3 px-4">سختی و آنتروپی</th>
                    <th className="py-3 px-4">کلمات / اعراب</th>
                    <th className="py-3 px-4">وضعیت</th>
                    <th className="py-3 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="line-clamp-1">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            item.difficulty === 'آسان' ? 'text-emerald-600' :
                            item.difficulty === 'متوسط' ? 'text-blue-600' :
                            item.difficulty === 'سخت' ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {item.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({item.entropyScore})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <span>{item.wordCount} کلمه</span>
                        {item.harakatCount > 0 && (
                          <span className="mr-2 text-emerald-600 font-bold text-[11px]">
                            ({item.harakatCount} اعراب)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          منتشر شده
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setInspectorItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="مشاهده تله‌متری"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="حذف متن"
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
        </>
      ) : (
        /* AUDIO DICTATION CMS SECTION */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin" className="text-xs text-blue-600 hover:underline">← بازگشت به داشبورد ادمین</Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                مدیریت صوت‌ها و متون مرجع پیاده‌سازی گفتار (Audio Dictation CMS)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                صوت‌ها و متون مرجع را کنترل کنید. متون نوشته شده در پنل ادمین برای ارزیابی هوشمند نگهداری می‌شوند و از کاربر عادی مخفی هستند.
              </p>
            </div>

            <button
              onClick={() => setAudioModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن صوت و متن مرجع جدید</span>
            </button>
          </div>

          {/* Audio Lessons Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">عنوان فایل صوتی</th>
                    <th className="py-3 px-4">دسته‌بندی</th>
                    <th className="py-3 px-4">سطح / زمان</th>
                    <th className="py-3 px-4">متن پنهان مرجع صوتی (جهت ارزیابی هوشمند)</th>
                    <th className="py-3 px-4 text-center">تست صوت</th>
                    <th className="py-3 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audioList.map((audio) => (
                    <tr key={audio.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="line-clamp-1">{audio.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                          {audio.categoryFa}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700 ml-1">{audio.difficulty}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({audio.durationEst})</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed line-clamp-2">
                          {audio.referenceTranscript}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                          ✓ ذخیره در ادمین • پنهان از کاربر در حالت نابینا
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTestAudioPlay(audio)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-[11px] transition inline-flex items-center gap-1.5"
                        >
                          {playingAudioId === audio.id ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-blue-600" />
                              <span>توقف</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-blue-600" />
                              <span>پخش تست</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteAudio(audio.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="حذف فایل صوتی"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPLAY SETTINGS FOR TYPING CANVAS */}
      {adminTab === 'display_settings' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>تنظیمات ابعاد، فونت و ظاهر باکس تایپ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                تنظیم دقیق طول افقی و عمودی، اندازه قلم، فاصله چندخطی و رنگ‌های متن در تست تایپ، دروس و رقابت زنده.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDisplayConfig}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
              >
                بازنشانی به پیش‌فرض (مشکی و آبی)
              </button>
              <button
                type="button"
                onClick={handleSaveDisplayConfig}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
              >
                ذخیره و اعمال سراسری در سایت ✓
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Control Form (8 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              {/* Box Dimensions */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>۱. ابعاد باکس متن (Horizontal & Vertical Box Span)</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    طول افقی باکس متن (کشیدگی افقی):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'compact', name: 'فشرده (۹۰۰px)' },
                      { id: 'medium', name: 'متوسط و متعادل (۱۱۵۰px) ⭐' },
                      { id: 'wide', name: 'عریض (۱۳۰۰px)' },
                      { id: 'ultrawide', name: 'فوق‌عریض (۱۵۵۰px)' },
                      { id: 'full', name: 'تمام‌صفحه (۱۰۰٪)' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, boxWidth: w.id as any }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          displayConfig.boxWidth === w.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">
                    ارتفاع عمودی باکس متن:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'compact', name: 'فشرده (۱۴۰ الی ۲۲۰px)' },
                      { id: 'standard', name: 'استاندارد (۱۷۰ الی ۲۹۰px) ⭐' },
                      { id: 'tall', name: 'مرتفع (۲۳۰ الی ۳۸۰px)' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, boxHeight: h.id as any }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          displayConfig.boxHeight === h.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {h.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography & Line Spacing */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>۲. سایز فونت و چندخطی بودن متن (Typography & Multi-line Spacing)</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">اندازه قلم متن:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'sm', name: 'کوچک (text-xl)' },
                      { id: 'md', name: 'متوسط (text-2xl) ⭐' },
                      { id: 'lg', name: 'بزرگ (text-3xl)' },
                      { id: 'xl', name: 'خیلی بزرگ (text-4xl)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, fontSize: f.id as any }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          displayConfig.fontSize === f.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">فاصله سطرها (چند خطی بودن متن):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', name: 'فشرده (۱٫۶)' },
                      { id: 'relaxed', name: 'استاندارد و روان (۱٫۹) ⭐' },
                      { id: 'loose', name: 'باز و فاصله‌دار (۲٫۲)' },
                    ].map((ls) => (
                      <button
                        key={ls.id}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, lineSpacing: ls.id as any }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          displayConfig.lineSpacing === ls.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {ls.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colors Customization */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>۳. رنگ‌بندی متن و هایلایت‌ها (Color Scheme)</span>
                </h3>

                {/* Default Text Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">رنگ پیش‌فرض متن (تایپ‌نشده):</label>
                    <span className="font-mono text-slate-500 font-bold">{displayConfig.defaultTextColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={displayConfig.defaultTextColor}
                      onChange={(e) => setDisplayConfig((c) => ({ ...c, defaultTextColor: e.target.value }))}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    />
                    {[
                      { hex: '#020617', label: 'مشکی پررنگ (پیش‌فرض)' },
                      { hex: '#0f172a', label: 'سرمه‌ای تیره' },
                      { hex: '#18181b', label: 'دودی متالیک' },
                      { hex: '#1e293b', label: 'خاکستری تیره' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, defaultTextColor: swatch.hex }))}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 bg-white hover:bg-slate-50"
                      >
                        <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: swatch.hex }} />
                        <span>{swatch.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highlight Correct Color */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">رنگ هایلایت تایپ‌شده (حروف صحیح):</label>
                    <span className="font-mono text-slate-500 font-bold">{displayConfig.highlightColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={displayConfig.highlightColor}
                      onChange={(e) => setDisplayConfig((c) => ({ ...c, highlightColor: e.target.value }))}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    />
                    {[
                      { hex: '#2563eb', label: 'آبی رسمی (پیش‌فرض)' },
                      { hex: '#059669', label: 'سبز زمردی' },
                      { hex: '#7c3aed', label: 'بنفش نئونی' },
                      { hex: '#d97706', label: 'طلایی مسابقه‌ای' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, highlightColor: swatch.hex }))}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 bg-white hover:bg-slate-50"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: swatch.hex }} />
                        <span>{swatch.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Color */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">رنگ نمایش خطای تایپی:</label>
                    <span className="font-mono text-slate-500 font-bold">{displayConfig.errorColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={displayConfig.errorColor}
                      onChange={(e) => setDisplayConfig((c) => ({ ...c, errorColor: e.target.value }))}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    />
                    {[
                      { hex: '#e11d48', label: 'قرمز گلگون (پیش‌فرض)' },
                      { hex: '#dc2626', label: 'قرمز تند' },
                      { hex: '#b91c1c', label: 'زرشکی' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, errorColor: swatch.hex }))}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 bg-white hover:bg-slate-50"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: swatch.hex }} />
                        <span>{swatch.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pre-Test Flow & Two-Screen Control */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>۴. کنترل جریان دو صفحه‌ای آزمون تایپ (صفحه قبل و بعد از انتخاب زبان)</span>
                </h3>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  💡 <strong>هوشمندی دسته‌بندی قرآن:</strong> هنگامی که کاربر در صفحه اول دسته‌بندی «قرآن» را انتخاب کند، سیستم از پرسش تکراری زبان فارسی/انگلیسی صرف‌نظر کرده و فوراً تنظیمات سوره، آیات و اعراب را نمایش می‌دهد. با ورود به صفحه آزمون، تمامی المان‌های متفرقه محو شده و کاربر ۱۰۰٪ با تمرکز تایپ می‌کند.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">صفحه انتخاب قبل از آزمون:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, showPreTestSetupPage: true }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          displayConfig.showPreTestSetupPage
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        فعال (۲ مرحله‌ای) ⭐
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, showPreTestSetupPage: false }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          !displayConfig.showPreTestSetupPage
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        مستقیم به تایپ
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">دسته و زبان پیش‌فرض آزمون:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'fa', name: 'فارسی' },
                        { id: 'en', name: 'انگلیسی' },
                        { id: 'quran', name: 'قرآن' },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setDisplayConfig((c) => ({ ...c, defaultLanguage: lang.id as any }))}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                            displayConfig.defaultLanguage === lang.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">نمایش بنر استاندارد مهندسی (صفحه اول):</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, showStandardBanner: true }))}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          displayConfig.showStandardBanner
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        نمایش بنر ISIRI
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, showStandardBanner: false }))}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          !displayConfig.showStandardBanner
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        مخفی کردن بنر
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">دکمه ضبط ویدیو (صفحه اول):</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, showVideoRecordButton: true }))}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          displayConfig.showVideoRecordButton
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        نمایش دکمه ضبط
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisplayConfig((c) => ({ ...c, showVideoRecordButton: false }))}
                        className={`p-2 rounded-xl border text-xs font-bold transition ${
                          !displayConfig.showVideoRecordButton
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        عدم نمایش
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>پیش‌نمایش زنده در همان لحظه (Live Simulation)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {displayConfig.boxWidth} • {displayConfig.fontSize}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                باکس زیر دقیقاً همان نحوه نمایش را نشان می‌دهد که پس از ذخیره، کاربران در صفحه آزمون، دروس و مسابقات مشاهده خواهند کرد:
              </p>

              {/* Preview Canvas Box */}
              <div
                className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-inner select-none transition-all duration-200"
                style={{
                  minHeight: displayConfig.boxHeight === 'compact' ? '140px' : displayConfig.boxHeight === 'tall' ? '220px' : '170px',
                }}
              >
                <div
                  className={`font-bold select-none whitespace-pre-wrap ${
                    displayConfig.fontSize === 'xl'
                      ? 'text-3xl sm:text-4xl'
                      : displayConfig.fontSize === 'lg'
                      ? 'text-2xl sm:text-3xl'
                      : displayConfig.fontSize === 'sm'
                      ? 'text-lg sm:text-xl'
                      : 'text-xl sm:text-2xl'
                  } ${
                    displayConfig.lineSpacing === 'loose'
                      ? 'leading-[2.2]'
                      : displayConfig.lineSpacing === 'normal'
                      ? 'leading-[1.6]'
                      : 'leading-[1.9]'
                  }`}
                  dir="rtl"
                >
                  <span style={{ color: displayConfig.highlightColor }}>
                    تایپ ده انگشتی مهارتی است که سرعت{' '}
                  </span>
                  <span
                    style={{
                      color: displayConfig.highlightColor,
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    }}
                    className="relative rounded-xs"
                  >
                    ارتباطات
                    <span
                      style={{ backgroundColor: displayConfig.highlightColor }}
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full animate-pulse"
                    />
                  </span>
                  <span style={{ color: displayConfig.defaultTextColor }}>
                    {' '}در عصر جدید را ارتقا داده و موجب ارتقای بهره‌وری روزافزون می‌گردد.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveDisplayConfig}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-md shadow-indigo-500/20 active:scale-98 cursor-pointer"
                >
                  تایید و اعمال روی سایت ✓
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  این تنظیمات بلادرنگ در حافظه و رویدادهای سامانه منتشر می‌شوند.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Content Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">افزودن متن به کتابخانه مرکزی</h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">عنوان متن</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: حکمت ۴۲ نهج‌البلاغه"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">دسته‌بندی موضوعی</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="قرآن">قرآن کریم و سوره‌ها</option>
                  <option value="فناوری">فناوری و مهندسی</option>
                  <option value="ادبیات">ادبیات کهن و معاصر (سعدی، مولانا)</option>
                  <option value="کد و نرم‌افزار">کد و برنامه‌نویسی</option>
                  <option value="تاریخی و سخنان بزرگان">تاریخی، مذهبی و سخنان بزرگان</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">بخش مورد نظر در سامانه</label>
                <select
                  value={newTargetSection}
                  onChange={(e) => setNewTargetSection(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="typing_test">تست تایپ استاندارد (/typing-test)</option>
                  <option value="live_race">مسابقات و رقابت زنده (/live-race)</option>
                  <option value="free_typing">تایپ آزاد و تمرین آزاد (/typing)</option>
                  <option value="quran">بخش تخصصی قرآن (/quran)</option>
                  <option value="all">نمایش در تمام بخش‌ها (همگانی)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">فرمت و نوع چینش خطوط</label>
              <select
                value={newLineFormat}
                onChange={(e) => setNewLineFormat(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="multiline">چندخطی روان (پاراگراف استاندارد با شکست خودکار کلمات)</option>
                <option value="long">چندخطی کامل / قطعه شعر / آیات چندگانه (حفظ خطوط و سطرها)</option>
                <option value="single">تک‌خطی فشرده (مناسب مسابقات سرعتی و اسپرینت)</option>
              </select>
            </div>

            {newCategory === 'قرآن' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
                💡 <strong>نکته سوره و آیات:</strong> می‌توانید متن آیات دلخواه (مثلاً آیات ۱ الی ۵ یا یک سوره کامل) را با یا بدون اعراب الصاق فرمایید. کاربر در زمان آزمون، آیات را بدون لرزش کلمات تایپ خواهد کرد.
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">متن کامل (جهت ارزیابی خودکار سختی، کلمات و اعراب)</label>
              <textarea
                rows={5}
                required
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                placeholder="متن، سوره یا ابیات را اینجا بنویسید یا الصاق کنید..."
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
                ذخیره در دیتابیس
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBulkImport} className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>واردسازی فله‌ای و دسته‌ای متون (Bulk Import)</span>
            </h3>
            <p className="text-xs text-slate-500">
              متون مورد نظر خود را با علامت جداکننده <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">---</code> از یکدیگر جدا نمایید. سامانه به طور خودکار سختی، کلمات و اعراب هر بخش را استخراج می‌کند.
            </p>

            <textarea
              rows={8}
              required
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="متن اول...\n---\nمتن دوم...\n---\nمتن سوم..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                شروع پردازش و ذخیره دسته‌ای
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Audio Dictation Lesson Modal */}
      {audioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form
            onSubmit={handleSaveAudio}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  افزودن فایل صوتی و متن پنهان مرجع
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAudioModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">عنوان فایل صوتی</label>
              <input
                type="text"
                required
                value={newAudioTitle}
                onChange={(e) => setNewAudioTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="مثال: مصاحبه رادیویی هوش مصنوعی"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">دسته‌بندی</label>
                <select
                  value={newAudioCategory}
                  onChange={(e) => setNewAudioCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="اخلاقی و انگیزشی">اخلاقی و انگیزشی</option>
                  <option value="فناوری و علمی">فناوری و علمی</option>
                  <option value="معارف و حکمت">معارف و حکمت</option>
                  <option value="مکاتبات اداری و دادگستری">مکاتبات اداری و دادگستری</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">سطح دشواری</label>
                <select
                  value={newAudioDifficulty}
                  onChange={(e) => setNewAudioDifficulty(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="مقدماتی">مقدماتی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">مدت زمان تخمینی</label>
                <input
                  type="text"
                  value={newAudioDuration}
                  onChange={(e) => setNewAudioDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="مثال: ۲۵ ثانیه"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">راهنمای گوینده (اختیاری)</label>
              <input
                type="text"
                value={newAudioPrompt}
                onChange={(e) => setNewAudioPrompt(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="توضیح کوتاه درباره تمپو یا موضوع صوت..."
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-purple-700">
                  متن مرجع صوتی جهت ارزیابی هوشمند (الزامی):
                </label>
                <span className="text-[10px] text-slate-400 font-bold">
                  در حالت پیش‌فرض نابینا از کاربر پنهان است
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={newAudioTranscript}
                onChange={(e) => setNewAudioTranscript(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-purple-600 text-xs focus:outline-none font-sans leading-relaxed"
                placeholder="متن دقیق کلماتی که در صوت ادا می‌شود را اینجا بنویسید. این متن در پایگاه داده ثبت می‌شود تا پس از تایپ کاربر، دقت و درستی عبارات او به صورت هوشمند با این متن سنجیده شود..."
              />
              <p className="text-[11px] text-slate-500">
                💡 این نوشته در کادر تایپ کاربر قرار نمی‌گیرد تا کاربر با گوش دادن بنویسد؛ فقط الگوریتم هوشمند سنجش با آن تطبیق داده می‌شود.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAudioModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20"
              >
                ذخیره صوت در سیستم
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
