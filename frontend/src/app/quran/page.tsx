'use client';

import React, { useState, useEffect, useMemo } from 'react';
import TypingEngine from '@/components/typing/TypingEngine';
import {
  BookOpen,
  Sparkles,
  Volume2,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers,
  Search,
  Check,
  Play,
  Heart,
  BookMarked,
  SlidersHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QURAN_SURAHS, SurahItem, AyahItem } from '@/data/quranData';

export default function QuranTypingPage() {
  const surahs = QURAN_SURAHS;

  const [selectedSurahIndex, setSelectedSurahIndex] = useState<number>(0);
  const [startAyahNumber, setStartAyahNumber] = useState<number>(1);
  const [endAyahNumber, setEndAyahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReciting, setIsReciting] = useState<boolean>(false);
  const [recitationSpeed, setRecitationSpeed] = useState<number>(0.9);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [completionStats, setCompletionStats] = useState<{
    wpm?: number;
    accuracy?: number;
    durationSeconds?: number;
  }>({});
  const [sessionKey, setSessionKey] = useState<number>(1);

  const activeSurah: SurahItem = surahs[selectedSurahIndex] || surahs[0];

  // Whenever surah changes, reset startAyah to 1 and endAyah to total ayah count (or 1)
  useEffect(() => {
    setStartAyahNumber(1);
    setEndAyahNumber(activeSurah.ayahCount);
    setSessionCompleted(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReciting(false);
    }
  }, [selectedSurahIndex, activeSurah.ayahCount]);

  // Selected ayahs slice based on range
  const selectedAyahs: AyahItem[] = useMemo(() => {
    const start = Math.max(1, Math.min(startAyahNumber, activeSurah.ayahCount));
    const end = Math.max(start, Math.min(endAyahNumber, activeSurah.ayahCount));
    return activeSurah.ayahs.filter(a => a.number >= start && a.number <= end);
  }, [activeSurah, startAyahNumber, endAyahNumber]);

  // Combined smooth Persian/Arabic typing target text (NO HARAKAT, NO AYAH NUMBERS - clean and fluent!)
  const combinedTargetText = useMemo(() => {
    if (selectedAyahs.length === 0) return '';
    return selectedAyahs
      .map(a => a.textSimple.trim())
      .filter(Boolean)
      .join(' ');
  }, [selectedAyahs]);

  // Audio recitation of selected verses
  const handleToggleRecitation = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isReciting) {
      window.speechSynthesis.cancel();
      setIsReciting(false);
    } else {
      window.speechSynthesis.cancel();
      // Recite with standard Arabic voice if available
      const textToRecite = selectedAyahs.map(a => a.textWithHarakat || a.textSimple).join('. ');
      const utterance = new SpeechSynthesisUtterance(textToRecite);
      utterance.lang = 'ar-SA';
      utterance.rate = recitationSpeed;
      utterance.onend = () => setIsReciting(false);
      utterance.onerror = () => setIsReciting(false);
      window.speechSynthesis.speak(utterance);
      setIsReciting(true);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleRangeComplete = (stats?: any) => {
    setSessionCompleted(true);
    setCompletionStats(stats || {});
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleSetFullSurah = () => {
    setStartAyahNumber(1);
    setEndAyahNumber(activeSurah.ayahCount);
    setSessionKey(prev => prev + 1);
    setSessionCompleted(false);
  };

  const handleSetSingleAyah = (num: number) => {
    setStartAyahNumber(num);
    setEndAyahNumber(num);
    setSessionKey(prev => prev + 1);
    setSessionCompleted(false);
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.trim().toLowerCase();
    return surahs.filter(
      s =>
        s.nameArabic.toLowerCase().includes(q) ||
        s.namePersian.toLowerCase().includes(q) ||
        s.number.toString().includes(q)
    );
  }, [surahs, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              کتابت نورانی کلام‌الله مجید (Quran Typing Studio)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              تایپ روان و آسان (بدون اعراب دشوار)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            تایپ سوره‌های کوچک و منتخب قرآن کریم
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            متن آیات به صورت روان و بدون اعراب و حرکات پیچیده برای تایپ آسان و لذت‌بخش آماده شده است. سوره و بازه دلخواه آیات را تعیین کنید و پیوسته تایپ نمایید.
          </p>
        </div>

        {/* Audio Recitation Bar */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs font-bold text-slate-600">
            <span className="text-slate-400">سرعت صوت:</span>
            {[0.75, 0.9, 1.0].map(spd => (
              <button
                key={spd}
                onClick={() => setRecitationSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg transition ${
                  recitationSpeed === spd
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleRecitation}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition shadow-xs ${
              isReciting
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            {isReciting ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isReciting ? 'توقف تلاوت' : 'پخش صوت تلاوت'}</span>
          </button>
        </div>
      </div>

      {/* Surah Selector & Range Configurator Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        {/* Top Controls: Surah Selection & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>تنظیم سوره و محدوده آیات جهت تایپ:</span>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجوی سوره (مثال: اخلاص، کوثر، فلق)..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Surahs Horizontal Pill List */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin text-xs font-bold">
          {filteredSurahs.map((surah) => {
            const originalIndex = surahs.findIndex(s => s.number === surah.number);
            const isSelected = selectedSurahIndex === originalIndex;
            return (
              <button
                key={surah.number}
                onClick={() => {
                  setSelectedSurahIndex(originalIndex);
                  setSessionKey(prev => prev + 1);
                }}
                className={`px-3.5 py-2 rounded-2xl border whitespace-nowrap transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {surah.number}
                </span>
                <span>{surah.nameArabic}</span>
                <span className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  ({surah.ayahCount} آیه)
                </span>
              </button>
            );
          })}
        </div>

        {/* Range Controls: From Ayah X to Ayah Y */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
            <span className="text-slate-900 font-black text-sm flex items-center gap-1.5">
              <span>{activeSurah.nameArabic}</span>
              <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {activeSurah.revelation} • {activeSurah.ayahCount} آیه
              </span>
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="start-ayah" className="text-slate-500">از آیه:</label>
              <select
                id="start-ayah"
                value={startAyahNumber}
                onChange={e => {
                  const val = Number(e.target.value);
                  setStartAyahNumber(val);
                  if (val > endAyahNumber) setEndAyahNumber(val);
                  setSessionKey(prev => prev + 1);
                  setSessionCompleted(false);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {Array.from({ length: activeSurah.ayahCount }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>آیه {num}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="end-ayah" className="text-slate-500">تا آیه:</label>
              <select
                id="end-ayah"
                value={endAyahNumber}
                onChange={e => {
                  const val = Number(e.target.value);
                  setEndAyahNumber(val);
                  setSessionKey(prev => prev + 1);
                  setSessionCompleted(false);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {Array.from({ length: activeSurah.ayahCount }, (_, i) => i + 1)
                  .filter(num => num >= startAyahNumber)
                  .map(num => (
                    <option key={num} value={num}>آیه {num}</option>
                  ))}
              </select>
            </div>

            <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              شامل {selectedAyahs.length} آیه برای تایپ پیوسته
            </span>
          </div>

          {/* Quick Range Selection Buttons */}
          <div className="flex items-center gap-2 self-start lg:self-auto text-xs font-bold">
            <button
              onClick={handleSetFullSurah}
              className={`px-3 py-1.5 rounded-xl border transition ${
                startAyahNumber === 1 && endAyahNumber === activeSurah.ayahCount
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              کل سوره ({activeSurah.ayahCount} آیه)
            </button>

            {activeSurah.ayahCount > 3 && (
              <button
                onClick={() => {
                  setStartAyahNumber(1);
                  setEndAyahNumber(Math.min(3, activeSurah.ayahCount));
                  setSessionKey(prev => prev + 1);
                  setSessionCompleted(false);
                }}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  startAyahNumber === 1 && endAyahNumber === 3
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                آیات ۱ تا ۳
              </button>
            )}

            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition"
            >
              {showTranslations ? 'مخفی‌سازی ترجمه' : 'نمایش ترجمه'}
            </button>
          </div>
        </div>
      </div>

      {/* Persian Translations Accordion / Banner */}
      {showTranslations && selectedAyahs.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-emerald-700" />
              <span>ترجمه فارسی آیات منتخب ({startAyahNumber} تا {endAyahNumber}):</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">ترجمه انصاریان / مکارم شیرازی</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin text-xs text-slate-700 leading-relaxed">
            {selectedAyahs.map(a => (
              <div key={a.number} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-mono text-[10px] flex items-center justify-center shrink-0 font-bold">
                  {a.number}
                </span>
                <div>
                  <strong className="text-emerald-900 ml-1 font-bold">{a.textSimple}:</strong>
                  <span>{a.translationFa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Quran Continuous Typing Engine */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="font-black text-sm text-slate-900">
              تایپ پیوسته: {activeSurah.nameArabic} (از آیه {startAyahNumber} تا آیه {endAyahNumber})
            </h2>
          </div>
          <button
            onClick={() => {
              setSessionKey(prev => prev + 1);
              setSessionCompleted(false);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>شروع مجدد این بازه</span>
          </button>
        </div>

        <TypingEngine
          key={`${activeSurah.number}-${startAyahNumber}-${endAyahNumber}-${sessionKey}`}
          targetText={combinedTargetText}
          language="fa"
          allowChangeText={false}
          title={`${activeSurah.nameArabic} (${activeSurah.namePersian}) - آیات ${startAyahNumber} تا ${endAyahNumber}`}
          isLesson={true}
          onComplete={handleRangeComplete}
        />
      </div>

      {/* Session Completion Congratulations Banner */}
      {sessionCompleted && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-2 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>پایان موفقیت‌آمیز کتابت آیات نورانی</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              آفرین! تایپ آیات {startAyahNumber} تا {endAyahNumber} سوره {activeSurah.nameArabic} با موفقیت به پایان رسید.
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              حفظ و انس با قرآن کریم همراه با ارتقای سرعت تایپ ده‌انگشتی
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSessionKey(prev => prev + 1);
                setSessionCompleted(false);
              }}
              className="px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 transition shadow-sm"
            >
              تایپ دوباره همین آیات
            </button>

            {selectedSurahIndex < surahs.length - 1 && (
              <button
                onClick={() => {
                  setSelectedSurahIndex(prev => prev + 1);
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 text-white font-black text-xs transition border border-white/20"
              >
                سوره بعدی ({surahs[selectedSurahIndex + 1].nameArabic}) ←
              </button>
            )}
          </div>
        </div>
      )}

      {/* Educational & Spiritual Benefits of Quran Typing (SEO Rich Semantic Section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">تثبیت حفظ و حافظه بصری آیات</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            کتابت و تایپ کلمه به کلمه آیات مبارکه قرآن کریم، حافظه عضلانی انگشتان و تمرکز ذهنی قاریان و حافظان را برای به خاطر سپردن دقیق کلمات چند برابر می‌کند.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">تایپ روان بدون زحمت اعراب‌گذاری</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            به درخواست کاربران عزیز، حروف با رسم‌الخط استاندارد و روان فارسی آماده شده تا نیازی به کلیدهای پیچیده تنوین و تشدید نباشد و تایپیست با سرعت بالا تایپ کند.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">تعیین بازه دلخواه آیات (از آیه تا آیه)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            شما می‌توانید به جای تایپ آیه به آیه، یک بازه مشخص از آیات (مثلاً آیات ۱ تا ۵ یا کل سوره) را انتخاب کرده و یکجا به صورت متوالی تایپ نمایید.
          </p>
        </div>
      </div>
    </div>
  );
}
