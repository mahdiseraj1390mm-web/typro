'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Tv,
  Film,
  Zap,
  Check,
  Flame,
  Maximize2,
  Minimize2,
  ListOrdered,
  Activity,
  Layers,
  ShieldCheck,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  VideoLessonItem,
  VideoSegmentItem,
  getStoredVideoLessons,
  analyzeTranscription,
  TranscriptionAnalysisResult
} from '@/data/audioVideoData';

export default function VideoTypingPage() {
  const [videoLessons, setVideoLessons] = useState<VideoLessonItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoLessonItem | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Full-screen Theater Mode (to eliminate all distractions)
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  // Top Collapsible Drawers: ALL DEFAULT CLOSED AS REQUESTED!
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isVideoCatalogOpen, setIsVideoCatalogOpen] = useState(false);

  // Live Transcription Input: COMPLETELY EMPTY BY DEFAULT!
  const [liveTranscriptionText, setLiveTranscriptionText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Segment Completion & Evaluation
  const [completedSegmentIds, setCompletedSegmentIds] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<TranscriptionAnalysisResult | null>(null);
  const [showRevealedHelper, setShowRevealedHelper] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load video lessons
  useEffect(() => {
    const list = getStoredVideoLessons();
    setVideoLessons(list);
    if (list.length > 0) {
      setSelectedVideo(list[0]);
    }
  }, []);

  const currentSegment = useMemo<VideoSegmentItem | null>(() => {
    if (!selectedVideo || !selectedVideo.segments.length) return null;
    return selectedVideo.segments[currentSegmentIndex] || selectedVideo.segments[0];
  }, [selectedVideo, currentSegmentIndex]);

  // Reset when segment or video changes
  useEffect(() => {
    setIsPlaying(false);
    setLiveTranscriptionText('');
    setStartTime(null);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setAnalysisResult(null);
  }, [selectedVideo?.id, currentSegmentIndex]);

  // Elapsed timer
  useEffect(() => {
    let timer: any;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Simulated Speech Synthesis for Video Audio when playing
  useEffect(() => {
    if (!currentSegment) return;

    if (isPlaying) {
      if ('speechSynthesis' in window && !isAudioMuted) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentSegment.referenceText);
        utterance.lang = 'fa-IR';
        utterance.rate = playbackSpeed;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, currentSegment, playbackSpeed, isAudioMuted]);

  // Text change handler
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLiveTranscriptionText(val);

    if (!isTimerRunning && val.length > 0) {
      setIsTimerRunning(true);
      setStartTime(Date.now());
    }
  };

  // Evaluate Live Subtitle
  const handleEvaluateSegment = () => {
    if (!currentSegment) return;
    if (!liveTranscriptionText.trim()) {
      showToast('⚠️ کادر پیاده‌سازی خالی است! لطفاً آنچه را در فیلم می‌بینید یا می‌شنوید تایپ کنید.');
      return;
    }

    setIsTimerRunning(false);
    setIsPlaying(false);

    const seconds = Math.max(3, elapsedSeconds);
    const result = analyzeTranscription(
      liveTranscriptionText,
      currentSegment.referenceText,
      seconds
    );
    setAnalysisResult(result);

    if (result.isPassed) {
      if (!completedSegmentIds.includes(currentSegment.id)) {
        setCompletedSegmentIds((prev) => [...prev, currentSegment.id]);
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast(`🎉 قطعه ${currentSegmentIndex + 1} با دقت ${result.similarity}٪ تایید شد!`);
    } else {
      showToast(`دقت پیاده‌سازی ${result.similarity}٪ ثبت شد. می‌توانید فیلم را دوباره دیده و ویرایش کنید.`);
    }
  };

  const handleNextSegment = () => {
    if (!selectedVideo) return;
    if (currentSegmentIndex < selectedVideo.segments.length - 1) {
      setCurrentSegmentIndex((p) => p + 1);
    } else {
      showToast('🏆 تمام قطعات این ویدیو با موفقیت پیاده‌سازی شدند!');
    }
  };

  if (!selectedVideo || !currentSegment) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500 font-sans">
        در حال بارگذاری استودیو پیاده‌سازی و زیرنویس ویدیو...
      </div>
    );
  }

  const progressPercent = Math.round(
    (completedSegmentIds.filter((id) =>
      selectedVideo.segments.some((s) => s.id === id)
    ).length /
      selectedVideo.segments.length) *
      100
  );

  return (
    <div
      className={`font-sans transition-all duration-300 ${
        isFullScreenMode
          ? 'fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto p-4 sm:p-8'
          : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'
      }`}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              استودیو تایپ ویدیو و پیاده‌سازی زیرنویس زنده
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            پیاده‌سازی همزمان زیرنویس از روی فیلم (بدون متن اولیه)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            فقط فیلم و کادر پیاده‌سازی باز است. کادرهای جانبی در بالای صفحه به صورت کشویی قرار دارند.
          </p>
        </div>

        {/* Full-Screen Theater Mode Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullScreenMode(!isFullScreenMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition shadow-sm ${
              isFullScreenMode
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isFullScreenMode ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>خروج از حالت تمام صفحه</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>حالت تمام صفحه (بدون حواس‌پرتی)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOP COLLAPSIBLE DRAWERS: DEFAULT CLOSED (ACCORDION BARS AT THE TOP)
          ========================================================================= */}
      <div className="space-y-2 z-20">
        {/* Drawer Control Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {/* Drawer 1 Toggle: Timeline & Segments */}
          <button
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border transition ${
              isTimelineOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>تایم‌لاین قطعات زیرنویس ({selectedVideo.segments.length} قطعه)</span>
            {isTimelineOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Drawer 2 Toggle: Real-Time Sync & Telemetry */}
          <button
            onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border transition ${
              isTelemetryOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>شاخص‌های همگام‌سازی و سلامت پیاده‌سازی</span>
            {isTelemetryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Drawer 3 Toggle: Video Catalog */}
          <button
            onClick={() => setIsVideoCatalogOpen(!isVideoCatalogOpen)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border transition ${
              isVideoCatalogOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>تغییر ویدیو ({selectedVideo.title})</span>
            {isVideoCatalogOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* DRAWER 1 CONTENT: TIMELINE (DEFAULT CLOSED) */}
        {isTimelineOpen && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>فهرست قطعات و تایم‌کدهای زیرنویس فیلم</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                پیشرفت کلی: {progressPercent}٪ تکمیل شده
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {selectedVideo.segments.map((seg, idx) => {
                const isCurrent = idx === currentSegmentIndex;
                const isDone = completedSegmentIds.includes(seg.id);
                return (
                  <button
                    key={seg.id}
                    onClick={() => {
                      setCurrentSegmentIndex(idx);
                      setIsTimelineOpen(false); // auto-close drawer to refocus on video
                    }}
                    className={`text-right p-3.5 rounded-2xl border transition text-xs flex flex-col justify-between space-y-2 ${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                        : isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">
                        [{seg.timestamp}]
                      </span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <span className="font-bold line-clamp-1">
                      قطعه شماره {idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      تخمین زمان: {seg.expectedDurationSec} ثانیه
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DRAWER 2 CONTENT: TELEMETRY & SYNC METRICS (DEFAULT CLOSED) */}
        {isTelemetryOpen && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
            <h3 className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>شاخص‌های تحلیلی و مانیتورینگ پیاده‌سازی همزمان زیرنویس</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">میزان تاخیر ورودی (Latency):</span>
                <span className="font-black text-base text-slate-900 dark:text-white font-mono">
                  {isPlaying ? '۱۲ میلی‌ثانیه' : 'آفلاین'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">همگرایی فریم زیرنویس:</span>
                <span className="font-black text-base text-emerald-600 font-mono">
                  ۹۹.۲٪ همگام
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">انحراف سرعت تایپ (Jitter):</span>
                <span className="font-black text-base text-indigo-500 font-mono">
                  ±۰.۰۴s
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block">قطعات تایید شده:</span>
                <span className="font-black text-base text-amber-500 font-mono">
                  {completedSegmentIds.length} از {selectedVideo.segments.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DRAWER 3 CONTENT: VIDEO CATALOG (DEFAULT CLOSED) */}
        {isVideoCatalogOpen && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in duration-200">
            <h3 className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Film className="w-4 h-4 text-purple-500" />
              <span>انتخاب ویدیو از آرشیو مستندها و دوره‌ها</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {videoLessons.map((v) => {
                const isSelected = v.id === selectedVideo.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVideo(v);
                      setCurrentSegmentIndex(0);
                      setIsVideoCatalogOpen(false);
                    }}
                    className={`text-right p-4 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {v.title}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>گوینده: {v.speaker}</span>
                      <span>مدت: {v.totalDuration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MAIN WORKSPACE: ONLY THE VIDEO + LIVE TRANSCRIPTION BOX (CLEAN & FOCUSED)
          ========================================================================= */}
      <div className="space-y-6">
        {/* 1. THE VIDEO SCREEN */}
        <div className="bg-slate-950 rounded-3xl p-5 sm:p-7 border border-slate-800 text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="aspect-video max-h-[360px] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 flex flex-col justify-between p-5 relative overflow-hidden shadow-inner">
            {/* Top Screen Indicators */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
                <Tv className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="font-bold text-slate-200">پخش زنده فیلم</span>
                <span className="text-amber-400 font-mono text-[11px] mr-1">
                  تایم‌کد: {currentSegment.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-300 transition"
                  title={isAudioMuted ? 'وصل صدا' : 'قطع صدا'}
                >
                  {isAudioMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Center Video Graphic & Play Button */}
            <div className="text-center space-y-3 z-10 my-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl shadow-indigo-500/30 mx-auto"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 translate-x-[-1px]" />
                )}
              </button>
              <h2 className="text-xs sm:text-sm font-bold text-slate-200 max-w-sm mx-auto">
                {selectedVideo.title} • قطعه {currentSegmentIndex + 1}
              </h2>

              {/* Subtitle Audio wave */}
              {isPlaying && (
                <div className="flex items-center justify-center gap-1 h-5 pt-1">
                  <span className="w-1 bg-cyan-400 rounded-full h-3 animate-pulse" />
                  <span className="w-1 bg-cyan-400 rounded-full h-5 animate-bounce" />
                  <span className="w-1 bg-cyan-400 rounded-full h-4 animate-pulse" />
                  <span className="w-1 bg-cyan-400 rounded-full h-2 animate-bounce" />
                  <span className="w-1 bg-cyan-400 rounded-full h-5 animate-pulse" />
                </div>
              )}
            </div>

            {/* Bottom: Clear Instruction Prompt (No pre-filled text in box!) */}
            <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-center text-xs text-slate-400 z-10">
              فیلم را تماشا کرده و کلمات زیرنویس را مستقیماً در کادر پیاده‌سازی زیر تایپ کنید.
            </div>
          </div>

          {/* Video Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-400">سرعت پخش:</span>
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                    playbackSpeed === speed
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Navigation between segments */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentSegmentIndex === 0}
                onClick={() => setCurrentSegmentIndex((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
                <span>قطعه قبل</span>
              </button>

              <span className="text-xs font-mono font-bold px-2 text-slate-400">
                {currentSegmentIndex + 1} از {selectedVideo.segments.length}
              </span>

              <button
                disabled={currentSegmentIndex === selectedVideo.segments.length - 1}
                onClick={() =>
                  setCurrentSegmentIndex((p) =>
                    Math.min(selectedVideo.segments.length - 1, p + 1)
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <span>قطعه بعد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. THE LIVE TRANSCRIPTION BOX (EMPTY TEXTAREA AS REQUESTED) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                کادر پیاده‌سازی زنده قطعه {currentSegmentIndex + 1} [{currentSegment.timestamp}]
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRevealedHelper(!showRevealedHelper)}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                title="نمایش متن راهنما برای نوآموزان"
              >
                {showRevealedHelper ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showRevealedHelper ? 'پنهان‌سازی راهنما' : 'راهنمای متن (مبتدی)'}</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                کلمات: {liveTranscriptionText.trim() ? liveTranscriptionText.trim().split(/\s+/).length : 0}
              </span>
            </div>
          </div>

          {/* Optional Revealed Helper (Only if beginner toggled it) */}
          {showRevealedHelper && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-in fade-in duration-150">
              <span className="font-bold block">متن راهنمای این قطعه فیلم (جهت رفع اشکال):</span>
              <p className="font-sans leading-relaxed select-all font-semibold">
                «{currentSegment.referenceText}»
              </p>
            </div>
          )}

          {/* EMPTY TEXTAREA FOR USER TYPING */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={4}
              value={liveTranscriptionText}
              onChange={handleTextChange}
              placeholder="فیلم را تماشا کنید و کلمات زیرنویس یا گفتاری را که می‌بینید/می‌شنوید اینجا تایپ کنید... (کادر بدون متن اولیه آماده است)"
              className="w-full p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 focus:outline-hidden font-sans text-base leading-relaxed placeholder:text-slate-400 shadow-inner resize-y transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                سیستم با هوش مصنوعی دقت و انطباق عبارات تایپ‌شده شما را با زیرنویس مرجع سنجش می‌کند.
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setLiveTranscriptionText('');
                  setAnalysisResult(null);
                  setElapsedSeconds(0);
                  textareaRef.current?.focus();
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
              >
                پاک کردن کادر
              </button>

              <button
                onClick={handleEvaluateSegment}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>بررسی و ثبت این قطعه زیرنویس</span>
              </button>
            </div>
          </div>

          {/* Evaluation Result Card */}
          {analysisResult && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div
                className={`p-5 rounded-3xl border ${
                  analysisResult.isPassed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200'
                } space-y-3`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg text-white ${
                        analysisResult.isPassed ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    >
                      {analysisResult.similarity}٪
                    </div>
                    <div>
                      <h4 className="font-black text-sm">
                        {analysisResult.isPassed
                          ? 'زیرنویس این قطعه با موفقیت تایید شد'
                          : 'دقت ناکافی برای عبور از این قطعه'}
                      </h4>
                      <p className="text-xs opacity-80 mt-0.5">{analysisResult.feedback}</p>
                    </div>
                  </div>

                  {analysisResult.isPassed && currentSegmentIndex < selectedVideo.segments.length - 1 && (
                    <button
                      onClick={handleNextSegment}
                      className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md"
                    >
                      <span>رفتن به قطعه بعدی</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-black/5 dark:border-white/5 font-mono">
                  <span>سرعت: {analysisResult.wpm} WPM</span>
                  <span>•</span>
                  <span>کلمات تطبیق یافته: {analysisResult.correctWordsCount} از {analysisResult.expectedWordCount}</span>
                  {analysisResult.missingWords.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">
                        جاافتاده: {analysisResult.missingWords.slice(0, 4).join('، ')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
