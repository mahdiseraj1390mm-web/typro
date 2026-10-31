'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import TypingEngine from '@/components/typing/TypingEngine';
import { TYPING_TEST_POOL } from '@/lib/constants';
import { shuffleDeck } from '@/lib/deckManager';
import { TypingMetrics } from '@/types';
import {
  Gem,
  Video,
  Award,
  History,
  LineChart,
  Sparkles,
  Coins,
  Zap,
  Clock,
  Code,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Shuffle,
  Play,
  RotateCcw,
  Languages,
  BookMarked,
  ArrowRight,
  Sliders,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { typroApi } from '@/lib/api';
import confetti from 'canvas-confetti';
import { getTypingDisplayConfig, TypingDisplayConfig, DEFAULT_TYPING_DISPLAY_CONFIG } from '@/lib/typingDisplayConfig';
import { soundEffects } from '@/lib/soundEffects';

type TestCategory = 'fa' | 'en' | 'code' | 'numbers';
type FaSubCategory = 'all' | 'scientific' | 'historical' | 'quran' | 'religious';

export default function TypingTestPage() {
  const [displayConfig, setDisplayConfig] = useState<TypingDisplayConfig>(DEFAULT_TYPING_DISPLAY_CONFIG);

  // Flow State: Is user currently taking the focused test, or in the setup screen?
  const [isTesting, setIsTesting] = useState(false);

  // Selected Mode and Language
  const [selectedCategory, setSelectedCategory] = useState<TestCategory>('fa');
  const [selectedFaSubCategory, setSelectedFaSubCategory] = useState<FaSubCategory>('all');
  const [testDuration, setTestDuration] = useState<1 | 3 | 5>(1); // minutes
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  // Video recording state (in setup screen)
  const [isRecording, setIsRecording] = useState(false);

  // Performance metrics
  const [lastMetrics, setLastMetrics] = useState<TypingMetrics | null>(null);
  const [bestWpm, setBestWpm] = useState(64);
  const [sessionReward, setSessionReward] = useState<{
    earnedXp: number;
    earnedCoins: number;
    earnedDiamonds: number;
    netWpm: number;
    accuracy: number;
  } | null>(null);

  // Sync display config from Admin & localStorage
  useEffect(() => {
    const cfg = getTypingDisplayConfig();
    setDisplayConfig(cfg);
    if (cfg.defaultLanguage) {
      setSelectedCategory(cfg.defaultLanguage);
    }
    if (cfg.defaultDurationMinutes && (cfg.defaultDurationMinutes === 1 || cfg.defaultDurationMinutes === 3 || cfg.defaultDurationMinutes === 5)) {
      setTestDuration(cfg.defaultDurationMinutes as 1 | 3 | 5);
    }

    const handleConfigChange = (e: any) => {
      if (e.detail) {
        setDisplayConfig(e.detail);
      } else {
        setDisplayConfig(getTypingDisplayConfig());
      }
    };

    window.addEventListener('typro_display_config_changed', handleConfigChange);
    return () => window.removeEventListener('typro_display_config_changed', handleConfigChange);
  }, []);

  // Text Pools using official TYPING_TEST_POOL (over 120 standard curated texts)
  const allFaTexts = useMemo(() => {
    return TYPING_TEST_POOL.filter(item => item.language === 'fa');
  }, []);

  const activeFaPool = useMemo(() => {
    if (selectedFaSubCategory === 'scientific') {
      return allFaTexts.filter(t => t.subCategory === 'علمی');
    }
    if (selectedFaSubCategory === 'historical') {
      return allFaTexts.filter(t => t.subCategory === 'تاریخی');
    }
    if (selectedFaSubCategory === 'quran') {
      return allFaTexts.filter(t => t.subCategory === 'قرآنی');
    }
    if (selectedFaSubCategory === 'religious') {
      return allFaTexts.filter(t => t.subCategory === 'مذهبی');
    }
    return allFaTexts;
  }, [allFaTexts, selectedFaSubCategory]);

  const activeCodePool = useMemo(() => {
    return TYPING_TEST_POOL.filter(item => item.language === 'code');
  }, []);

  const activeEnPool = useMemo(() => {
    return [
      'Touch typing is the ability to use muscle memory to find keys fast, without using the sense of sight, and with all the available fingers.',
      'Consistency and accuracy always outweigh rushed speed. Focus on clean rhythm and the natural velocity of fingers will steadily follow.',
      'Practice makes progress. Dedicating just ten minutes each morning develops subconscious muscle memory that lasts a lifetime.',
      'Clear writing reflects clear thinking. Typing at the speed of thought removes friction between creative mind and digital canvas.',
      'Fast typing enables developers and writers to translate pure thoughts directly into digital reality.',
      'Continuous practice builds muscle memory that transforms mechanical keystrokes into fluid thinking.'
    ];
  }, []);

  // Determine active text with randomized deck cycling (no repeats until whole deck completed)
  const currentPoolTexts = useMemo(() => {
    if (selectedCategory === 'fa') {
      return activeFaPool.map(item => item.text);
    }
    if (selectedCategory === 'code') {
      return activeCodePool.map(item => item.text);
    }
    if (selectedCategory === 'numbers') {
      const nums = TYPING_TEST_POOL.filter(item => item.subCategory === 'اعداد');
      return nums.length > 0 ? nums.map(item => item.text) : ['98866 556954 594544 1436244 575270 867 69642 5587 3561537 466'];
    }
    return activeEnPool;
  }, [selectedCategory, activeFaPool, activeCodePool, activeEnPool]);

  // Shuffled deck state for current active pool
  const [shuffledDeck, setShuffledDeck] = useState<string[]>([]);
  const lastDeckItemRef = useRef<string | undefined>(undefined);

  // When pool changes, shuffle the whole deck randomly from the start
  useEffect(() => {
    if (currentPoolTexts.length > 0) {
      const newDeck = shuffleDeck(currentPoolTexts, lastDeckItemRef.current);
      setShuffledDeck(newDeck);
      setCurrentTestIndex(0);
    }
  }, [currentPoolTexts]);

  const activeTargetText = shuffledDeck[currentTestIndex] || currentPoolTexts[0] || 'تایپ ده انگشتی یک مهارت ارزشمند است.';

  const handleNextText = () => {
    setSessionReward(null);
    setCurrentTestIndex((prev) => {
      const nextIdx = prev + 1;
      // If we exhausted all texts in this random cycle, re-shuffle ensuring the new first is not the same as the previous last
      if (nextIdx >= shuffledDeck.length) {
        lastDeckItemRef.current = shuffledDeck[shuffledDeck.length - 1];
        const freshDeck = shuffleDeck(currentPoolTexts, lastDeckItemRef.current);
        setShuffledDeck(freshDeck);
        return 0;
      }
      return nextIdx;
    });
  };

  const handleStartTest = (category?: TestCategory) => {
    soundEffects.initAudio();
    if (category) {
      setSelectedCategory(category);
    }
    setIsTesting(true);
    setSessionReward(null);
  };

  const handleComplete = async (metrics: TypingMetrics) => {
    setLastMetrics(metrics);
    if (metrics.netWpm > bestWpm) {
      setBestWpm(metrics.netWpm);
    }

    if (typeof window !== 'undefined') {
      const prevBestWpm = Number(localStorage.getItem('typro_best_wpm') || 0);
      if (metrics.netWpm > prevBestWpm) {
        localStorage.setItem('typro_best_wpm', String(metrics.netWpm));
        const prevRecords = Number(localStorage.getItem('typro_records_broken') || 0);
        localStorage.setItem('typro_records_broken', String(prevRecords + 1));
      }
      const prevBestAcc = Number(localStorage.getItem('typro_best_accuracy') || 0);
      if (metrics.accuracy > prevBestAcc) {
        localStorage.setItem('typro_best_accuracy', String(metrics.accuracy));
      }
      if (metrics.accuracy >= 95) {
        localStorage.setItem('typro_consistency_accuracy', String(metrics.accuracy));
      }
      const today = new Date().toISOString().slice(0, 10);
      const lastDay = localStorage.getItem('typro_last_test_date');
      if (lastDay !== today) {
        const curStreak = Number(localStorage.getItem('typro_streak_days') || 0);
        localStorage.setItem('typro_streak_days', String(curStreak + 1));
        localStorage.setItem('typro_last_test_date', today);
      }
    }

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    // Calculate Diamond Rewards: Accuracy 100% gives 20 full diamonds! Scaled by accuracy and speed
    const testAcc = metrics.accuracy;
    const testWpm = metrics.netWpm;
    let earnedDiamonds = 0;

    if (testAcc >= 100) {
      earnedDiamonds = 20; // 100% accuracy = 20 diamonds full!
    } else if (testAcc >= 98) {
      earnedDiamonds = Math.min(18, 15 + (testWpm >= 60 ? 3 : testWpm >= 40 ? 1 : 0));
    } else if (testAcc >= 95) {
      earnedDiamonds = Math.min(14, 10 + (testWpm >= 50 ? 2 : 0));
    } else if (testAcc >= 90) {
      earnedDiamonds = Math.min(8, 5 + (testWpm >= 40 ? 2 : 0));
    } else if (testAcc >= 85) {
      earnedDiamonds = 3;
    } else {
      earnedDiamonds = 1;
    }

    // 1:1 Coins with Points (XP)
    const earnedXp = Math.max(10, Math.round(testAcc * 0.4) + Math.min(10, Math.round(testWpm * 0.1)));
    const earnedCoins = earnedXp;

    if (typeof window !== 'undefined') {
      const curCoins = Number(localStorage.getItem('typro_user_coins') || '0');
      const nextCoins = curCoins + earnedCoins;
      localStorage.setItem('typro_user_coins', String(nextCoins));

      const curXp = Number(localStorage.getItem('typro_user_xp') || String(curCoins));
      const nextXp = Math.max(curXp + earnedXp, nextCoins);
      localStorage.setItem('typro_user_xp', String(nextXp));
      localStorage.setItem('typro_user_level', String(Math.floor(nextXp / 100) + 1));

      const curDiamonds = Number(localStorage.getItem('typro_user_diamonds') || '0');
      const nextDiamonds = curDiamonds + earnedDiamonds;
      localStorage.setItem('typro_user_diamonds', String(nextDiamonds));

      const rawU = localStorage.getItem('typro_user');
      if (rawU) {
        try {
          const parsedU = JSON.parse(rawU);
          parsedU.diamonds = nextDiamonds;
          parsedU.coins = nextCoins;
          parsedU.xp = nextXp;
          parsedU.level = Math.floor(nextXp / 100) + 1;
          localStorage.setItem('typro_user', JSON.stringify(parsedU));
        } catch {}
      }

      window.dispatchEvent(new Event('typro_economy_updated'));
    }

    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('typro_user') : null;
      let effectiveUserId = 'user-active';
      let effectiveUsername = 'user';
      let effectiveDisplayName = 'کاربر تایپرو';
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.id) effectiveUserId = parsed.id;
          if (parsed.username) effectiveUsername = parsed.username;
          if (parsed.displayName) effectiveDisplayName = parsed.displayName;
        } catch {}
      }

      fetch('/api/gamification/record-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          username: effectiveUsername,
          displayName: effectiveDisplayName,
          earnedXp: earnedXp,
          earnedCoins: earnedCoins,
          earnedDiamonds: earnedDiamonds,
          wpm: testWpm,
          accuracy: testAcc,
        }),
      }).catch((e) => console.warn('Could not record progress:', e));
    } catch (e) {
      console.warn('Error recording progress:', e);
    }

    setSessionReward({
      earnedXp: earnedXp,
      earnedCoins: earnedCoins,
      earnedDiamonds: earnedDiamonds,
      netWpm: testWpm,
      accuracy: testAcc,
    });

    try {
      await typroApi.typing.submitSession({
        userId: 'user-active',
        originalText: activeTargetText,
        typedText: activeTargetText,
        elapsedSeconds: metrics.elapsedSeconds,
        mode: 'TEST',
        language: selectedCategory === 'en' || selectedCategory === 'code' ? 'en' : 'fa',
      });
    } catch {
      // Offline fallback
    }
  };

  const isQualifiedForCert = lastMetrics && lastMetrics.netWpm >= 50 && lastMetrics.accuracy >= 95;

  // Title for active test
  const getTestTitle = () => {
    if (selectedCategory === 'en') {
      return `آزمون رسمی تایپ انگلیسی (${testDuration} دقیقه)`;
    }
    if (selectedCategory === 'code') {
      return `آزمون تایپ تخصصی کدنویسی (${testDuration} دقیقه)`;
    }
    return `آزمون رسمی تایپ فارسی (${testDuration} دقیقه)`;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // حالت دوم: صفحه خالص آزمون تایپ (تمرکز کامل روی متن بدون هیچ المان اضافی)
  // ══════════════════════════════════════════════════════════════════════════
  if (isTesting) {
    return (
      <div className="w-full min-h-[75vh] flex flex-col justify-start items-center py-6 sm:py-10 px-2 sm:px-4" dir="rtl">
        <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto space-y-4">
          <TypingEngine
            key={selectedCategory + "-" + testDuration + "-" + currentTestIndex}
            targetText={activeTargetText}
            language={selectedCategory === 'en' || selectedCategory === 'code' ? 'en' : 'fa'}
            allowChangeText={true}
            onTextChangeRequest={handleNextText}
            onComplete={handleComplete}
            onBackToSetup={() => setIsTesting(false)}
            title={getTestTitle()}
            isLesson={false}
            timeLimitSeconds={testDuration * 60}
          />

          {/* Real-time Session Reward Banner on Finish */}
          {sessionReward && (
            <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg">نتیجه آزمون در سامانه مرکزی رتبه‌بندی ثبت شد!</h3>
                  <p className="text-xs text-blue-100">
                    سرعت خالص: <span className="font-bold font-mono">{sessionReward.netWpm} WPM</span> • دقت: <span className="font-bold font-mono">{sessionReward.accuracy}٪</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/15 px-4 py-2 rounded-2xl border border-white/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-mono">
                  <Coins className="w-4 h-4 text-amber-300" />
                  <span>+{sessionReward.earnedCoins} سکه</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 font-mono">
                  <Zap className="w-4 h-4 text-emerald-300" />
                  <span>+{sessionReward.earnedXp} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Qualification Banner */}
          {isQualifiedForCert && (
            <div className="bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">شما واجد شرایط صدور گواهینامه رسمی تایپرو شدید!</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    با ثبت رکورد بالای ۵۰ کلمه در دقیقه و دقت فراتر از ۹۵٪، می‌توانید مدرک معتبر با امضای دیجیتال دریافت کنید.
                  </p>
                </div>
              </div>

              <Link
                href="/certificates"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md whitespace-nowrap self-start sm:self-auto"
              >
                مشاهده و صدور گواهینامه رسمی
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // حالت اول: صفحه قبل از تست (انتخاب زبان، زمان، ضبط ویدیو و آموزش)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans" dir="rtl">
      {/* Header Info & Video Recording Bar (Controlled by Admin) */}
      {displayConfig.showStandardBanner && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              بخش‌های ۳۶ تا ۴۰ مستند مهندسی: آزمون رسمی و استاندارد تایپ (ISIRI 9147)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              آزمون استاندارد تایپ ده‌انگشتی (Typing Speed Test)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              کرنومتر دقیق و سرعت خالص با استانداردهای رسمی تایپو و ادکلاب محاسبه می‌شود.
            </p>
          </div>

          {/* Video recording toggle */}
          {displayConfig.showVideoRecordButton && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={"flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition shadow-2xs " + (
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                <Video className="w-4 h-4 text-rose-500" />
                <span>{isRecording ? 'در حال ضبط ویدیویی تست...' : 'ضبط ویدیوی آزمون'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Selection Setup Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                مرحله ۱: انتخاب زبان و نوع متن آزمون
              </h2>
              <p className="text-xs text-slate-500">
                زبان یا دسته‌بندی مدنظر خود را مشخص کنید تا متن مرتبط بارگذاری شود:
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            تنظیمات پیش از شروع
          </span>
        </div>

        {/* 3 Main Category Cards: Persian vs English vs Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Persian */}
          <div
            onClick={() => setSelectedCategory('fa')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer relative space-y-2.5 ${
              selectedCategory === 'fa'
                ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🇮🇷</span>
              {selectedCategory === 'fa' && (
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
            <h3 className="font-black text-sm text-slate-900">متن فارسی</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              شامل متون علمی و فناوری، آیات نورانی قرآن (روان بدون اعراب) و حکمت‌های مذهبی.
            </p>
            {/* Sub-category selector */}
            <div className="flex flex-wrap gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => { setSelectedCategory('fa'); setSelectedFaSubCategory('all'); }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  selectedCategory === 'fa' && selectedFaSubCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                همه متون
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory('fa'); setSelectedFaSubCategory('scientific'); }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  selectedCategory === 'fa' && selectedFaSubCategory === 'scientific'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔬 علمی
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory('fa'); setSelectedFaSubCategory('historical'); }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  selectedCategory === 'fa' && selectedFaSubCategory === 'historical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                📜 تاریخی
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory('fa'); setSelectedFaSubCategory('quran'); }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  selectedCategory === 'fa' && selectedFaSubCategory === 'quran'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                📖 قرآنی
              </button>
              <button
                type="button"
                onClick={() => { setSelectedCategory('fa'); setSelectedFaSubCategory('religious'); }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  selectedCategory === 'fa' && selectedFaSubCategory === 'religious'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                🕌 مذهبی
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartTest('fa');
              }}
              className="w-full mt-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
            >
              <span>شروع آزمون فارسی</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Card 2: English */}
          <div
            onClick={() => setSelectedCategory('en')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer relative space-y-2.5 ${
              selectedCategory === 'en'
                ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🇬🇧</span>
              {selectedCategory === 'en' && (
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
            <h3 className="font-black text-sm text-slate-900">متن انگلیسی (English)</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              واژگان و متون استاندارد بین‌المللی با حروف لاتین و علائم نگارشی انگلیسی.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartTest('en');
              }}
              className="w-full mt-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
            >
              <span>Start English Test</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>


          {/* Card 4: Code */}
          <div
            onClick={() => setSelectedCategory('code')}
            className={`p-5 rounded-2xl border-2 transition cursor-pointer relative space-y-2.5 ${
              selectedCategory === 'code'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-500/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">💻</span>
              {selectedCategory === 'code' && (
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
            <h3 className="font-black text-sm text-slate-900">کدنویسی (Clean Code)</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              تایپ سینتکس کدهای تمیز برنامه‌نویسی، توابع و الگوهای الگوریتمی.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartTest('code');
              }}
              className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
            >
              <span>شروع تست کدنویسی</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>



        {/* Duration Selector & Big Start Button */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">مدت زمان آزمون:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTestDuration(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  testDuration === 1 ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ۱ دقیقه (اسپرینت)
              </button>
              <button
                type="button"
                onClick={() => setTestDuration(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  testDuration === 3 ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ۳ دقیقه (استاندارد)
              </button>
              <button
                type="button"
                onClick={() => setTestDuration(5)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  testDuration === 5 ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ۵ دقیقه (استقامتی)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleStartTest()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition cursor-pointer"
          >
            <span>شروع آزمون تایپ با تمرکز کامل 🚀</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Historical Best & Records comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">بهترین رکورد شخصی شما</span>
            <span className="text-2xl font-black text-slate-900 font-mono block">{bestWpm} WPM</span>
            <span className="text-[10px] text-emerald-600 font-semibold">دقت ۹۸٪ • زبان فارسی استاندارد</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">میانگین آزمون‌های اخیر</span>
            <span className="text-2xl font-black text-slate-900 font-mono block">۵۸ WPM</span>
            <span className="text-[10px] text-slate-500 font-semibold">ثبت‌شده در ۱۴ آزمون رسمی</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">شاخص پایداری و ریتم ضربه</span>
            <span className="text-2xl font-black text-slate-900 font-mono block">۹۶٪</span>
            <span className="text-[10px] text-emerald-600 font-semibold">توزیع ضربه‌زنی پایدار و یکدست</span>
          </div>
        </div>
      </div>
    </div>
  );
}
