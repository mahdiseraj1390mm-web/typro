'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Award,
  Music,
  BookOpen,
  Cpu,
  Briefcase,
  Rewind,
  Eye,
  EyeOff,
  Activity,
  Check,
  Flame,
  ShieldCheck,
  Send,
  HelpCircle,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  Sliders,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import {
  AudioLessonItem,
  getStoredAudioLessons,
  analyzeTranscription,
  TranscriptionAnalysisResult
} from '@/data/audioVideoData';

export default function AudioTypingPage() {
  const [audioLessons, setAudioLessons] = useState<AudioLessonItem[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<AudioLessonItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBlindMode, setIsBlindMode] = useState(true); // Default is Blind Dictation as requested!
  const [audioProgress, setAudioProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User transcription input state: COMPLETELY EMPTY BY DEFAULT!
  const [transcribedText, setTranscribedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Smart Evaluation Analysis Result
  const [analysisResult, setAnalysisResult] = useState<TranscriptionAnalysisResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load audio lessons from storage / presets
  useEffect(() => {
    const list = getStoredAudioLessons();
    setAudioLessons(list);
    if (list.length > 0) {
      setSelectedLesson(list[0]);
    }
  }, []);

  // Reset state when changing lesson
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setTranscribedText('');
    setStartTime(null);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setAnalysisResult(null);
  }, [selectedLesson]);

  // Elapsed timer tracking while user transcribes
  useEffect(() => {
    let timerInterval: any;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning]);

  // Audio progress animation simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2 * playbackRate;
        });
      }, 200);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, playbackRate]);

  // Toggle Audio Playback
  const handleToggleAudio = () => {
    if (!selectedLesson) return;

    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(selectedLesson.referenceTranscript);
        utterance.lang = 'fa-IR';
        utterance.rate = playbackRate;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setAudioProgress(100);
        };
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);

        if (!isTimerRunning) {
          setIsTimerRunning(true);
          setStartTime(Date.now());
        }
        showToast('🎧 در حال پخش صوت گفتاری... متن را در کادر خالی زیر بنویسید.');
      }
    } else {
      showToast('⚠️ مرورگر شما از موتور پخش سنتز صوتی پشتیبانی نمی‌کند.');
    }
  };

  const handleRewind = () => {
    if (!selectedLesson) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedLesson.referenceTranscript);
      utterance.lang = 'fa-IR';
      utterance.rate = playbackRate;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      setAudioProgress(0);
      showToast('⏪ صوت مجدداً از ابتدا پخش شد.');
    }
  };

  // User typed into empty transcription box
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTranscribedText(val);

    if (!isTimerRunning && val.length > 0) {
      setIsTimerRunning(true);
      setStartTime(Date.now());
    }
  };

  // Smart Evaluation against reference transcript from admin
  const handleEvaluate = () => {
    if (!selectedLesson) return;
    if (!transcribedText.trim()) {
      showToast('⚠️ لطفاً ابتدا آنچه را از صوت می‌شنوید در کادر تایپ کنید.');
      return;
    }

    setIsTimerRunning(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);

    const seconds = Math.max(3, elapsedSeconds);
    const result = analyzeTranscription(
      transcribedText,
      selectedLesson.referenceTranscript,
      seconds
    );
    setAnalysisResult(result);

    if (result.isPassed) {
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
      showToast(`🎉 ارزیابی موفق! دقت پیاده‌سازی شما ${result.similarity}٪ است.`);
    } else {
      showToast(`دقت پیاده‌سازی ${result.similarity}٪ ثبت شد. می‌توانید دوباره گوش دهید.`);
    }
  };

  if (!selectedLesson) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500 font-sans">
        در حال بارگذاری فایل‌های صوتی استودیو...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              استودیو پیاده‌سازی صوت به متن (Audio Dictation Studio)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            پیاده‌سازی زنده صوت و پادکست به متن
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            کادر تایپ کاملاً خالی است تا صوت را بشنوید و بنویسید. موتور هوشمند با متن مرجع ادمین مقایسه می‌کند.
          </p>
        </div>

        {/* Mode Switcher: Blind Dictation (Default) vs Revealed Text */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setIsBlindMode(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                isBlindMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="متن مرجع کاملاً پنهان است و فقط با گوش دادن تایپ می‌کنید"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>دیکته نابینا (پیش‌فرض)</span>
            </button>
            <button
              onClick={() => setIsBlindMode(false)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition ${
                !isBlindMode
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمایش متن آشکار برای افراد تازه‌کار و مبتدی"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>متن آشکار (مبتدیان)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audio Lessons Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {audioLessons.map((lesson) => {
          const isSelected = selectedLesson.id === lesson.id;
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`text-right p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {lesson.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{lesson.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">{lesson.audioPrompt}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                <span>تخمین زمان: {lesson.durationEst}</span>
                <span className="text-blue-600 font-bold">{lesson.categoryFa}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Audio Player & Synthesizer Controller */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Headphones className="w-4 h-4" />
              <span>صوت منتخب: {selectedLesson.categoryFa}</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black">{selectedLesson.title}</h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRewind}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold"
              title="بازپخش صوت از ابتدا"
            >
              <Rewind className="w-4 h-4" />
              <span>بازپخش</span>
            </button>

            <button
              onClick={handleToggleAudio}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>توقف صوت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>پخش فایل صوتی</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Animated Waveform Visualization */}
        <div className="flex items-center justify-between gap-1 h-12 px-2 bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden">
          {Array.from({ length: 48 }).map((_, idx) => {
            const activeHeight = isPlayingAudio ? Math.sin((idx + audioProgress) * 0.4) * 20 + 24 : 6;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlayingAudio ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-slate-700'
                }`}
                style={{ height: `${Math.max(4, activeHeight)}px` }}
              />
            );
          })}
        </div>

        {/* Speed Controls & Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span>سرعت بازخوانی صوت:</span>
            {[0.75, 0.85, 1, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-3 py-1 rounded-xl font-mono font-bold transition ${
                  playbackRate === rate
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>زمان سپری‌شده: {elapsedSeconds} ثانیه</span>
            </span>
          </div>
        </div>
      </div>

      {/* REVEALED TEXT BANNER: Only shown if user explicitly clicked "متن آشکار" for beginners */}
      {!isBlindMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 text-amber-900 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>متن آشکار راهنما (مخصوص افراد تازه‌وارد و تمرین اولیه):</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 font-bold">
              متن مرجع ادمین
            </span>
          </div>
          <p className="text-sm font-semibold leading-relaxed font-sans bg-white/70 p-3 rounded-2xl border border-amber-200 select-all">
            {selectedLesson.referenceTranscript}
          </p>
        </div>
      )}

      {/* MAIN TRANSCRIPTION WORKSPACE: EMPTY INPUT BOX AS REQUESTED */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <span>کادر خالی پیاده‌سازی صوت (بدون متن اولیه)</span>
            </h3>
            <p className="text-xs text-slate-500">
              صدا را پخش کنید و همزمان عبارات شنیده‌شده را در کادر زیر بنویسید.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              تعداد کلمات: {transcribedText.trim() ? transcribedText.trim().split(/\s+/).length : 0}
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              کاراکترها: {transcribedText.length}
            </span>
          </div>
        </div>

        {/* Empty Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={5}
            value={transcribedText}
            onChange={handleTextChange}
            placeholder="صدا را پخش کنید و هر آنچه می‌شنوید را اینجا تایپ نمایید... (کادر بدون متن اولیه آماده پیاده‌سازی است)"
            className="w-full p-5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-hidden font-sans text-base leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-inner resize-y transition-colors"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              متن مرجع این صوت در پنل مدیریت ثبت شده و تحلیل هوشمند پس از کلیک بر روی دکمه زیر اعمال می‌شود.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setTranscribedText('');
                setAnalysisResult(null);
                setElapsedSeconds(0);
                setIsTimerRunning(false);
                textareaRef.current?.focus();
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              پاک کردن کادر
            </button>

            <button
              onClick={handleEvaluate}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>بررسی و ارزیابی هوشمند متن پیاده‌سازی‌شده</span>
            </button>
          </div>
        </div>

        {/* Smart Analysis Result Card */}
        {analysisResult && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in duration-300">
            <div
              className={`p-6 rounded-3xl border ${
                analysisResult.isPassed
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              } space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white ${
                      analysisResult.isPassed ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  >
                    {analysisResult.similarity}٪
                  </div>
                  <div>
                    <h4 className="font-black text-base">
                      {analysisResult.isPassed
                        ? 'تطابق پیاده‌سازی مورد تأیید است'
                        : 'نیاز به تمرین و دقت بیشتر'}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">{analysisResult.feedback}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-black/5">
                    سرعت: {analysisResult.wpm} کلمه در دقیقه
                  </div>
                  <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-black/5">
                    زمان: {elapsedSeconds}s
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-500 block text-[11px]">کلمات صحیح منطبق:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {analysisResult.correctWordsCount} از {analysisResult.expectedWordCount} کلمه
                  </span>
                </div>

                <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-500 block text-[11px]">کلمات جا افتاده:</span>
                  <span className="font-bold text-rose-600 text-xs">
                    {analysisResult.missingWords.length > 0
                      ? analysisResult.missingWords.slice(0, 5).join('، ')
                      : 'هیچ واژه‌ای جا نیفتاده است ✓'}
                  </span>
                </div>

                <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-500 block text-[11px]">امتیاز مهارتی:</span>
                  <span className="font-black text-amber-600 text-sm">
                    {Math.round(analysisResult.similarity * 1.5)} XP + ۵ سکه
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
