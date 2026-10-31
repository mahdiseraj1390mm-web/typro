'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  Save,
  Printer,
  Gauge,
  Sparkles,
  FileText,
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Type,
  Wand2,
  Clock,
  Trash2,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  ShieldCheck,
  Languages,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  findSpellingAndGrammarIssues,
  applySingleFix,
  applyAllFixes,
  SpellIssue
} from '@/data/spellCheckRules';

export default function TyproWritePage() {
  const [content, setContent] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_write_content');
      if (saved) return saved;
    }
    return 'در این ویرایشگر می‌توانید مقالات، نامه‌های اداری و اسناد خود را با قلم‌های استاندارد فارسی نگارش نموده و همزمان سرعت واقعی (WPM) و دقت تایپ خود را در لحظه پایش کنید.\n\nبرای درج نیم‌فاصله می‌توانید از کلید میانبر استاندارد Ctrl+Shift+2 یا دکمه نیم‌فاصله در نوار ابزار استفاده نمایید.';
  });

  // Formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState<'right' | 'center' | 'left' | 'justify'>('right');
  const [fontFamily, setFontFamily] = useState<'vazir' | 'shabnam' | 'yekan' | 'titr' | 'courier'>('vazir');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(2.0);
  const [isZenMode, setIsZenMode] = useState(false);

  // Live Typing Telemetry state
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState<number>(0);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isActivelyTyping, setIsActivelyTyping] = useState<boolean>(false);

  // Spellcheck & Grammar State
  const [isSpellDrawerOpen, setIsSpellDrawerOpen] = useState(false);
  const [spellLangFilter, setSpellLangFilter] = useState<'all' | 'fa' | 'en'>('all');
  const [isVisualInspectMode, setIsVisualInspectMode] = useState(false);

  const [savedStatus, setSavedStatus] = useState('ذخیره خودکار در مرورگر');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keystrokeTimestamps = useRef<number[]>([]);
  const lastActiveTimestamp = useRef<number>(Date.now());

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 3500);
  };

  // Run Real-time Spellcheck Analysis on text changes
  const detectedIssues = useMemo(() => {
    return findSpellingAndGrammarIssues(content, spellLangFilter);
  }, [content, spellLangFilter]);

  // Text Analytics
  const metrics = useMemo(() => {
    const text = content.trim();
    if (!text) {
      return { words: 0, chars: 0, charsNoSpaces: 0, paragraphs: 0, readTimeMinutes: 0 };
    }
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    const charsNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n+/).filter((p) => p.trim().length > 0).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

    return { words, chars, charsNoSpaces, paragraphs, readTimeMinutes };
  }, [content]);

  // Session stopwatch & active typing tracker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (now - lastActiveTimestamp.current < 4000) {
        setIsActivelyTyping(true);
        setSessionSeconds((prev) => prev + 1);
      } else {
        setIsActivelyTyping(false);
      }

      // Rolling WPM calculation based on last 20 seconds (Typeo standard)
      const cutoff = now - 20000;
      keystrokeTimestamps.current = keystrokeTimestamps.current.filter((ts) => ts > cutoff);
      const recentKeys = keystrokeTimestamps.current.length;
      if (recentKeys > 0) {
        const isEnglish = /[a-zA-Z]/.test(content.slice(0, 50));
        const charsPerWord = isEnglish ? 5 : 4;
        const wordsInWindow = recentKeys / charsPerWord;
        const currentWpm = Math.round((wordsInWindow / 20) * 60);
        setWpm(currentWpm);
      } else {
        setWpm(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_write_content', content);
      setSavedStatus('ذخیره شد ✓');
      const t = setTimeout(() => setSavedStatus('ذخیره خودکار در مرورگر'), 2000);
      return () => clearTimeout(t);
    }
  }, [content]);

  // Keystroke listener for live metrics & Ctrl+Shift+2 half-space
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    lastActiveTimestamp.current = Date.now();
    keystrokeTimestamps.current.push(Date.now());
    setTotalKeystrokes((prev) => prev + 1);

    if (e.key === 'Backspace') {
      setErrorKeystrokes((prev) => prev + 1);
    }

    // Calculate accuracy percentage
    if (totalKeystrokes > 5) {
      const acc = Math.max(70, Math.min(100, Math.round(((totalKeystrokes - errorKeystrokes) / totalKeystrokes) * 100)));
      setAccuracy(acc);
    }

    // Ctrl + Shift + 2 or Shift + Space for Persian Zero-Width Non-Joiner (ZWNJ)
    if ((e.ctrlKey && e.shiftKey && e.key === '2') || (e.shiftKey && e.key === ' ')) {
      e.preventDefault();
      insertHalfSpace();
    }
  };

  // Insert ZWNJ (‌)
  const insertHalfSpace = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + '\u200c' + content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      textarea.focus();
    }, 0);
    showToast('نیم‌فاصله استاندارد (ZWNJ) درج شد.');
  };

  // Auto-Persian & Multilingual Formatter (Clean punctuation, Arabic chars, quotes, spelling)
  const handleAutoFormatAll = () => {
    const { fixedText, count } = applyAllFixes(content);
    setContent(fixedText);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    showToast(`✨ متن بر اساس استانداردهای فرهنگستان زبان فارسی و قواعد بین‌المللی پالایش شد (${count} مورد اصلاح).`);
  };

  // Fix single issue
  const handleFixSingleIssue = (issue: SpellIssue) => {
    const updated = applySingleFix(content, issue);
    setContent(updated);
    showToast(`✓ مورد «${issue.wrong}» به «${issue.suggestion}» اصلاح شد.`);
  };

  // Download File (.txt or Word compatible .doc)
  const handleDownload = (format: 'doc' | 'txt') => {
    const blob = new Blob([content], {
      type: format === 'doc' ? 'application/msword;charset=utf-8' : 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typro_document_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`📥 سند با فرمت .${format} با موفقیت دانلود شد.`);
  };

  // Copy All Text
  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    showToast('متن با موفقیت در حافظه کلیپ‌بورد کپی گردید.');
  };

  // Clear Canvas
  const handleClear = () => {
    if (window.confirm('آیا از پاکسازی کامل صفحه ویرایشگر اطمینان دارید؟')) {
      setContent('');
      showToast('صفحه ویرایشگر پاکسازی شد.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Font class mapping
  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'shabnam':
        return 'font-[Shabnam,sans-serif]';
      case 'yekan':
        return 'font-[Yekan,sans-serif]';
      case 'titr':
        return 'font-serif font-black';
      case 'courier':
        return 'font-mono';
      default:
        return 'font-[Vazirmatn,sans-serif]';
    }
  };

  return (
    <div className={`transition-all ${isZenMode ? 'fixed inset-0 z-50 bg-slate-100 p-6 overflow-y-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      {!isZenMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                استودیوی نگارش حرفه‌ای، غلط‌یاب فرهنگستان و سرعت‌سنج زنده
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              تایپرو رایت (Typro Write Studio)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ویرایشگر استاندارد فارسی و بین‌المللی مجهز به غلط‌یاب املایی هوشمند، پایش نیم‌فاصله‌ها و سرعت‌سنج زنده.
            </p>
          </div>

          {/* Live Typing Speed & Accuracy HUD */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>سرعت:</span>
              <span className="font-mono text-base font-black">{wpm}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
              <span>دقت:</span>
              <span className="font-mono text-base font-black">{accuracy}٪</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono">
                {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Editor Toolbar */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-slate-700 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Font Family Selector */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-xs focus:outline-hidden"
            title="انتخاب قلم نگارش"
          >
            <option value="vazir">قلم وزیرمتن (پیش‌فرض)</option>
            <option value="shabnam">قلم شبنم (خوانا)</option>
            <option value="yekan">قلم ایران‌یکان (مدرن)</option>
            <option value="titr">قلم سنتی و ضخیم</option>
            <option value="courier">قلم ماشین‌تحریر (مونو)</option>
          </select>

          {/* Font Size Increment / Decrement */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setFontSize((p) => Math.max(12, p - 2))}
              className="px-2.5 py-1.5 hover:bg-slate-200 font-mono font-bold"
              title="کاهش سایز قلم"
            >
              -
            </button>
            <span className="px-2 font-mono font-bold text-slate-800 text-[11px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize((p) => Math.min(32, p + 2))}
              className="px-2.5 py-1.5 hover:bg-slate-200 font-mono font-bold"
              title="افزایش سایز قلم"
            >
              +
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Basic Formatting */}
          <button
            onClick={() => setIsBold(!isBold)}
            className={`p-2 rounded-xl transition ${isBold ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            title="درشت (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`p-2 rounded-xl transition ${isItalic ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            title="کج (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`p-2 rounded-xl transition ${isUnderline ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            title="خط زیرین (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsStrikethrough(!isStrikethrough)}
            className={`p-2 rounded-xl transition ${isStrikethrough ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            title="خط‌خورده (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => setTextAlign('right')}
            className={`p-2 rounded-xl transition ${textAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
            title="راست‌چین"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={`p-2 rounded-xl transition ${textAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
            title="وسط‌چین"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('left')}
            className={`p-2 rounded-xl transition ${textAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
            title="چپ‌چین"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('justify')}
            className={`p-2 rounded-xl transition ${textAlign === 'justify' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
            title="هم‌تراز دوطرفه"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Persian Half-Space & Punctuation Tools */}
          <button
            onClick={insertHalfSpace}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition text-[11px]"
            title="درج نیم‌فاصله (Ctrl+Shift+2 یا Shift+Space)"
          >
            <span>نیم‌فاصله</span>
          </button>

          <button
            onClick={handleAutoFormatAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold transition text-[11px]"
            title="پالایش خودکار تمام خطاهای نگارشی، ی/ک و نشانه‌گذاری طبق استاندارد فرهنگستان"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>ویراستار خودکار</span>
          </button>

          {/* REAL-TIME SPELLCHECK & GRAMMAR BUTTON */}
          <button
            onClick={() => setIsSpellDrawerOpen(!isSpellDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-[11px] border ${
              detectedIssues.length > 0
                ? isSpellDrawerOpen
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="بررسی خطاهای املایی و نگارشی متن"
          >
            {detectedIssues.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>{detectedIssues.length} غلط نگارشی</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>متن بدون غلط ✓</span>
              </>
            )}
            {isSpellDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Actions & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="کپی کل متن"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDownload('doc')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition text-[11px]"
            title="دانلود با فرمت Word"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word (.doc)</span>
          </button>

          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-[11px]"
            title="دانلود متن ساده"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="چاپ یا ذخیره PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title={isZenMode ? 'خروج از حالت تمام‌صفحه' : 'حالت تمرکز تمام‌صفحه (Zen Mode)'}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition"
            title="پاکسازی صفحه"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE SPELLCHECK & GRAMMAR DRAWER (ACCORDING TO PERSIAN ACADEMY & INT'L)
          ========================================================================= */}
      {isSpellDrawerOpen && (
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  پنل تخصصی غلط‌یاب و ویراستاری هوشمند (استاندارد فرهنگستان و زبان‌های دیگر)
                </h3>
                <p className="text-[11px] text-slate-500">
                  بررسی خودکار غلط‌های املایی، پیشوندها/پسوندها، نیم‌فاصله، حروف عربی و املای انگلیسی.
                </p>
              </div>
            </div>

            {/* Filter Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSpellLangFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  spellLangFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                همه زبان‌ها
              </button>
              <button
                onClick={() => setSpellLangFilter('fa')}
                className={`px-3 py-1 rounded-lg transition ${
                  spellLangFilter === 'fa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فارسی (فرهنگستان)
              </button>
              <button
                onClick={() => setSpellLangFilter('en')}
                className={`px-3 py-1 rounded-lg transition ${
                  spellLangFilter === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English Standard
              </button>
            </div>
          </div>

          {detectedIssues.length === 0 ? (
            <div className="py-6 text-center space-y-2 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-black text-sm text-emerald-900">متن شما کاملاً منطبق بر استانداردهای نگارشی است!</h4>
              <p className="text-xs text-emerald-700">هیچ غلط املایی یا خطای نشانه‌گذاری در متن یافت نشد.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Batch Action Bar */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">
                  تعداد کل موارد شناسایی‌شده: <strong className="text-rose-600 font-mono text-sm">{detectedIssues.length}</strong> مورد
                </span>
                <button
                  onClick={handleAutoFormatAll}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>اصلاح خودکار تمام موارد</span>
                </button>
              </div>

              {/* List of Detected Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {detectedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition flex flex-col justify-between space-y-2 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          {issue.categoryLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {issue.language === 'fa' ? 'فارسی' : 'English'}
                        </span>
                      </div>

                      {/* Before & After */}
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="line-through text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold">
                          {issue.wrong}
                        </span>
                        <span className="text-slate-400">←</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-black">
                          {issue.suggestion}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                        {issue.explanation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleFixSingleIssue(issue)}
                      className="self-end px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>اصلاح این مورد</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor Document Canvas */}
      <div className="bg-white min-h-[580px] p-8 sm:p-14 rounded-3xl border border-slate-200 shadow-lg focus-within:ring-4 focus-within:ring-blue-500/10 transition-all flex flex-col justify-between">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            textAlign: textAlign,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: [
              isUnderline ? 'underline' : '',
              isStrikethrough ? 'line-through' : '',
            ]
              .filter(Boolean)
              .join(' ') || 'none',
          }}
          className={`w-full h-full min-h-[460px] resize-none text-slate-900 focus:outline-hidden leading-relaxed ${getFontFamilyStyle()}`}
          placeholder="نگارش متن، مقاله یا تمرین تایپ خود را در این بوم آغاز نمایید..."
        />

        {/* Bottom Document Metrics Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-5">
            <div>
              تعداد کلمات: <strong className="font-mono text-slate-800">{metrics.words.toLocaleString('fa-IR')}</strong>
            </div>
            <div>
              کاراکترها: <strong className="font-mono text-slate-800">{metrics.chars.toLocaleString('fa-IR')}</strong>
            </div>
            <div>
              بدون فاصله: <strong className="font-mono text-slate-800">{metrics.charsNoSpaces.toLocaleString('fa-IR')}</strong>
            </div>
            <div>
              پاراگراف‌ها: <strong className="font-mono text-slate-800">{metrics.paragraphs}</strong>
            </div>
            <div>
              زمان تخمینی خواندن: <strong className="font-mono text-slate-800">{metrics.readTimeMinutes} دقیقه</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{savedStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
