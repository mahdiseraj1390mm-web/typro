'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TypingMetrics } from '@/types';
import VirtualKeyboard from './VirtualKeyboard';
import { Play, Pause, RotateCcw, Shuffle, Award, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Volume2, VolumeX, Sliders, Brain, Sparkles, Target, ChevronDown, Keyboard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects, SwitchType } from '@/lib/soundEffects';
import { analyzeTypingWithAiCoach, CoachDiagnosticResult } from '@/lib/aiCoach';
import { getTypingDisplayConfig, TypingDisplayConfig, DEFAULT_TYPING_DISPLAY_CONFIG } from '@/lib/typingDisplayConfig';
import AnimatedCompletionGauge from './AnimatedCompletionGauge';

interface TypingEngineProps {
  targetText: string;
  language: 'fa' | 'en';
  allowChangeText?: boolean;
  onTextChangeRequest?: () => void;
  onComplete?: (metrics: TypingMetrics) => void;
  onBackToSetup?: () => void;
  title?: string;
  isLesson?: boolean;
  minimalLessonMode?: boolean;
  timeLimitSeconds?: number;
  onNextLesson?: () => void;
}

export default function TypingEngine({
  targetText,
  language,
  allowChangeText = false,
  onTextChangeRequest,
  onComplete,
  onBackToSetup,
  title = 'تست تایپ ده‌انگشتی',
  isLesson = false,
  minimalLessonMode = false,
  timeLimitSeconds,
  onNextLesson
}: TypingEngineProps) {
  // Sound controls (consistent defaults for SSR hydration match)
  const [currentSwitch, setCurrentSwitch] = useState<SwitchType>('thocky');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Display appearance settings from Admin / Storage
  const [displayConfig, setDisplayConfig] = useState<TypingDisplayConfig>(DEFAULT_TYPING_DISPLAY_CONFIG);

  // Sync sound & display settings with storage after hydration
  useEffect(() => {
    soundEffects.initFromStorage();
    setCurrentSwitch(soundEffects.currentSwitch);
    setIsAudioMuted(!soundEffects.enabled);
    setDisplayConfig(getTypingDisplayConfig());

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

  // Keyboard shortcut Alt + N for quick text change
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N' || e.key === 'د')) {
        e.preventDefault();
        if (allowChangeText && onTextChangeRequest && !isLesson) {
          onTextChangeRequest();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [allowChangeText, onTextChangeRequest, isLesson]);

  const [showKeyboardDrawer, setShowKeyboardDrawer] = useState(!minimalLessonMode);

  // Sanitize targetText to remove all half-spaces (ZWNJ \u200c), zero-width spaces (\u200b), etc.
  const cleanTargetText = React.useMemo(() => {
    return (targetText || '')
      .replace(/[\u200c\u200b\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [targetText]);

  // Pre-split characters into memoized array for 0ms render overhead
  const textChars = React.useMemo(() => cleanTargetText.split(''), [cleanTargetText]);

  // Typing state
  const [cursorIndex, setCursorIndex] = useState(0);
  const [charStates, setCharStates] = useState<('untyped' | 'correct' | 'incorrect')[]>([]);
  const [hasErrorAtCursor, setHasErrorAtCursor] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const errorIndicesRef = useRef<Set<number>>(new Set());
  const [errorIndicesCount, setErrorIndicesCount] = useState<number>(0);

  // Session & Timer
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Immediate Auto-Focus on mount & global key listener to prevent missing or sluggish first keystroke
  useEffect(() => {
    // 1. Pre-warm sound synthesizer for 0ms audio latency
    soundEffects.initAudio();

    // 2. Immediate focus on input
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
    inputRef.current?.focus();

    // 3. Fallback: if user clicks outside or starts typing anywhere on the page, route to input immediately
    const handleGlobalTypingCapture = (e: KeyboardEvent) => {
      if (isFinished || isPaused) return;
      if (document.activeElement === inputRef.current) return;

      // Ignore modifiers and special keys
      if (e.altKey || e.ctrlKey || e.metaKey || (e.key.length > 1 && e.key !== 'Backspace')) return;

      // Check if user is typing into some other real form field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Auto-refocus and process
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', handleGlobalTypingCapture);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleGlobalTypingCapture);
    };
  }, [isFinished, isPaused]);

  // Space key to advance to next lesson or next text on completion
  useEffect(() => {
    if (!isFinished) return;

    const handleSpaceToNext = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        if (isLesson && onNextLesson) {
          onNextLesson();
        } else if (allowChangeText && onTextChangeRequest) {
          onTextChangeRequest();
        }
      }
    };

    window.addEventListener('keydown', handleSpaceToNext, true);
    return () => window.removeEventListener('keydown', handleSpaceToNext, true);
  }, [isFinished, isLesson, onNextLesson, allowChangeText, onTextChangeRequest]);

  // Statistics counters
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [errorHistory, setErrorHistory] = useState<{ char: string; index: number }[]>([]);
  const [speedSamples, setSpeedSamples] = useState<number[]>([]);

  // Timing & High-Precision Tracking Refs
  const startTimeRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const correctKeysRef = useRef<number>(0);
  const errorKeysRef = useRef<number>(0);
  const totalKeysRef = useRef<number>(0);
  const keystrokeTimestampsRef = useRef<{ time: number; isCorrect: boolean }[]>([]);
  const lastSpeedUpdateSecRef = useRef<number>(0);
  const smoothSpeedRef = useRef<number>(0);
  const lastKeyTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Real-time responsive speed states (Standard & Responsive)
  const [liveInstantWpm, setLiveInstantWpm] = useState<number>(0);
  const [liveNetWpm, setLiveNetWpm] = useState<number>(0);

  // Jitter-free container scroll (only scroll when user actually reaches the bottom edge of the box)
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;

    if (cursorIndex === 0) {
      container.scrollTop = 0;
      return;
    }

    if (activeCharRef.current) {
      const activeChar = activeCharRef.current;
      const charOffsetTop = activeChar.offsetTop - container.offsetTop;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (charOffsetTop > containerScrollTop + containerHeight - 55) {
        container.scrollTop = charOffsetTop - containerHeight + 80;
      } else if (charOffsetTop < containerScrollTop) {
        container.scrollTop = Math.max(0, charOffsetTop - 20);
      }
    }
  }, [cursorIndex]);

  useEffect(() => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollTop = 0;
    }
  }, [cleanTargetText]);

  // Consistency calculation: standard deviation from speed samples
  const calculateConsistency = useCallback((): number => {
    if (speedSamples.length < 2) return 95;
    const avg = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
    const variance = speedSamples.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / speedSamples.length;
    const stdDev = Math.sqrt(variance);
    const score = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (avg || 1)) * 40)));
    return score;
  }, [speedSamples]);

  // Unified Session Completion Handler conforming to Typeo & ISIRI 9147
  const finishSession = useCallback((overrideElapsedMs?: number) => {
    setIsFinished(true);
    soundEffects.playVictory();
    const finalConsistency = calculateConsistency();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const now = Date.now();
    const actualElapsedMs = overrideElapsedMs ?? (
      startTimeRef.current
        ? Math.max(500, now - startTimeRef.current - totalPausedTimeRef.current)
        : 1000
    );
    const finalElapsedMs = timeLimitSeconds
      ? Math.min(timeLimitSeconds * 1000, actualElapsedMs)
      : actualElapsedMs;

    const finalMinutes = Math.max(1 / 60, finalElapsedMs / 60000);
    const finalCorrect = correctKeysRef.current;
    const finalErrors = errorKeysRef.current;
    const finalTotal = totalKeysRef.current;

    // Standard Typing Speed (Typeo / ISIRI 9147 standard):
    // 5.0 characters per word (international and Typeo standard CPM / 5)
    const charsPerWord = 5.0;

    // Typeo standard Net WPM: each error deducts 1 character from net count
    const netChars = Math.max(0, finalCorrect - finalErrors);
    const finalNet = Math.max(0, Math.round((netChars / charsPerWord) / finalMinutes));
    const finalRaw = Math.round((finalTotal / charsPerWord) / finalMinutes);
    const finalAcc = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 100;

    const finalMetrics: TypingMetrics = {
      rawWpm: finalRaw,
      netWpm: finalNet,
      wpm: finalNet,
      accuracy: finalAcc,
      errors: finalErrors,
      errorIndices: errorHistory.map((h) => h.index),
      consistency: finalConsistency,
      elapsedSeconds: Math.round(finalElapsedMs / 1000),
      charactersTyped: finalTotal,
      correctCharacters: finalCorrect,
      incorrectCharacters: finalErrors,
      weakKeys: Array.from(new Set(errorHistory.map((h) => h.char))),
      weakWords: []
    };
    if (onComplete) onComplete(finalMetrics);
  }, [calculateConsistency, errorHistory, onComplete, timeLimitSeconds]);

  // Initialize character states whenever cleanTargetText changes
  useEffect(() => {
    errorIndicesRef.current.clear();
    setErrorIndicesCount(0);
    setCharStates(new Array(cleanTargetText.length).fill('untyped'));
    setCursorIndex(0);
    setHasErrorAtCursor(false);
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
    setErrorHistory([]);
    setSpeedSamples([]);
    startTimeRef.current = null;
    pauseStartRef.current = null;
    totalPausedTimeRef.current = 0;
    correctKeysRef.current = 0;
    errorKeysRef.current = 0;
    totalKeysRef.current = 0;
    keystrokeTimestampsRef.current = [];
    lastSpeedUpdateSecRef.current = 0;
    smoothSpeedRef.current = 0;
    lastKeyTimeRef.current = 0;
    setLiveInstantWpm(0);
    setLiveNetWpm(0);
  }, [cleanTargetText]);

  // Typeo & EdClub standard live responsive speed calculator (WPM)
  const calculateStandardWpm = useCallback((now: number = Date.now()): number => {
    if (!startTimeRef.current || correctKeysRef.current === 0) return 0;
    return Math.max(0, Math.min(280, Math.round(smoothSpeedRef.current)));
  }, []);

  // High-Precision Real-time Timer runner conforming strictly to Typeo and EdClub
  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      const interval = setInterval(() => {
        if (!startTimeRef.current) return;
        const now = Date.now();
        const activeElapsedMs = Math.max(100, now - startTimeRef.current - totalPausedTimeRef.current);
        const elapsedSec = activeElapsedMs / 1000;
        setElapsedSeconds(Math.floor(elapsedSec));

        // In paragraph tests, tests NEVER cut off mid-text before the text is finished!
        // Only in lesson drills with a strict time limit does time cutoff apply:
        if (isLesson && timeLimitSeconds && elapsedSec >= timeLimitSeconds) {
          finishSession(timeLimitSeconds * 1000);
          return;
        }

        // Natural pause handling: within 1000ms grace period, finger transitions between words don't drop speed.
        // On prolonged pauses (> 1000ms), gently and smoothly decelerate at ~3 WPM per second (0.3 WPM per 100ms)
        const idleMs = lastKeyTimeRef.current > 0 ? now - lastKeyTimeRef.current : 0;
        if (idleMs > 1000 && smoothSpeedRef.current > 0) {
          smoothSpeedRef.current = Math.max(0, smoothSpeedRef.current - 0.3);
          const currentSpeed = Math.round(smoothSpeedRef.current);
          setLiveInstantWpm(currentSpeed);
          setLiveNetWpm(currentSpeed);
        }

        // Sampling speed for consistency calculation
        const currentSecond = Math.floor(elapsedSec);
        if (elapsedSec >= 1.0 && currentSecond !== lastSpeedUpdateSecRef.current) {
          lastSpeedUpdateSecRef.current = currentSecond;
          const currentSpeed = Math.round(smoothSpeedRef.current);
          if (currentSecond % 2 === 0) {
            setSpeedSamples((s) => [...s, currentSpeed]);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isStarted, isPaused, isFinished, isLesson, timeLimitSeconds, finishSession]);

  // Calculate Real-time Metrics
  const minutes = elapsedSeconds > 0 ? Math.max(0.05, Math.max(2.5, elapsedSeconds) / 60) : 0.05;
  const rawWpm = Math.round((totalKeystrokes / 5) / minutes) || 0;
  const netWpm = liveInstantWpm > 0 ? liveInstantWpm : liveNetWpm;
  const wpm = liveInstantWpm > 0 ? liveInstantWpm : liveNetWpm;
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const remainingSeconds = timeLimitSeconds ? Math.max(0, timeLimitSeconds - elapsedSeconds) : null;

  // Handle Key Down event conforming to Strict Typing Rule (Section 44 & 165)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished || isPaused) return;

    const key = e.key;
    setLastPressedKey(key);

    // Context-aware Pause via shortcut: Esc or Ctrl+Space (never single Space when typing!)
    if (e.key === 'Escape' || (e.ctrlKey && e.code === 'Space')) {
      e.preventDefault();
      setIsPaused((p) => !p);
      return;
    }

    // Ignore non-printable keys except Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      if (hasErrorAtCursor) {
        // Clear error on current character
        setHasErrorAtCursor(false);
        setCharStates((prev) => {
          const updated = [...prev];
          updated[cursorIndex] = 'untyped';
          return updated;
        });
      }
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey || key.length > 1) {
      return;
    }

    e.preventDefault();

    // Start timer on first keystroke
    if (!isStarted) {
      setIsStarted(true);
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
    }

    const expectedChar = cleanTargetText[cursorIndex];

    // Numbers mode detection: Persian digits (۰-۹), Arabic digits (٠-٩), or English digits (0-9) + whitespace
    const isNumbersMode = /^[\d\u06F0-\u06F9\u0660-\u0669\s]+$/.test(cleanTargetText);

    // Bidirectional digit normalization supporting English, Persian, and Arabic digits
    const normalizeDigit = (c: string): string => {
      if (!c) return '';
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const arDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      const fIdx = faDigits.indexOf(c);
      if (fIdx !== -1) return String(fIdx);
      const aIdx = arDigits.indexOf(c);
      if (aIdx !== -1) return String(aIdx);
      return c;
    };

    const normKey = normalizeDigit(key);
    const normExpected = normalizeDigit(expectedChar);
    const isDigitTarget = /\d/.test(normExpected);
    const isDigitCode =
      (e.code.startsWith('Numpad') && e.code.length === 7 && e.code.slice(6) === normExpected) ||
      (e.code.startsWith('Digit') && e.code.length === 6 && e.code.slice(5) === normExpected);

    const isDigitMatch = isDigitTarget && (normKey === normExpected || isDigitCode);

    // Persian letter 'پ' multi-layout & Fingilish support:
    // 1. Physical key Backquote (top-left, next to 1 / above Tab): produces ` or ~
    // 2. Physical key Backslash (above / next to Enter): produces \ or |
    // 3. Persian key 'پ'
    // 4. In Persian mode, legacy Arabic mapping 'm' / 'M'
    const isPeMatch = (expectedChar === 'پ') && (
      key === 'پ' ||
      e.code === 'Backquote' ||
      e.code === 'Backslash' ||
      key === '`' || key === '~' ||
      key === '\\' || key === '|' ||
      ((key === 'm' || key === 'M') && language === 'fa')
    );

    const isSpaceKey = key === ' ' || e.code === 'Space' || key === '\u200c';

    // In Numbers Mode: Space key is never required. If pressed, smoothly ignore without penalty
    if (isNumbersMode && isSpaceKey) {
      if (expectedChar === ' ') {
        let nxt = cursorIndex + 1;
        while (nxt < cleanTargetText.length && cleanTargetText[nxt] === ' ') {
          nxt++;
        }
        setCursorIndex(nxt);
      }
      return;
    }

    // Normalize common layout differences (Arabic vs Persian Yeh/Kaf, Half-spaces)
    const normalizeChar = (c: string) => {
      if (!c) return '';
      if (c === '\u200c' || c === '\u200b') return ' ';
      if (c === 'ي') return 'ی';
      if (c === 'ك') return 'ک';
      return c;
    };

    const isExpectedSpace = expectedChar === ' ' || expectedChar === '\u200c';

    const isCorrect =
      key === expectedChar ||
      isDigitMatch ||
      isPeMatch ||
      (isSpaceKey && isExpectedSpace) ||
      (language === 'fa' && normalizeChar(key) === normalizeChar(expectedChar));
    
    totalKeysRef.current += 1;
    setTotalKeystrokes((prev) => prev + 1);
    keystrokeTimestampsRef.current.push({ time: Date.now(), isCorrect });

    if (isCorrect) {
      soundEffects.playKeyClick();
      correctKeysRef.current += 1;
      setCorrectKeystrokes((prev) => prev + 1);

      // High-precision smooth responsive speed update on keystroke (0ms reaction)
      const now = Date.now();
      const prevTime = lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      let deltaMs = prevTime > 0 ? now - prevTime : 240;
      // Soft clamp: natural inter-keystroke interval. Cap at 650ms so inter-word gaps don't crash speed.
      deltaMs = Math.min(650, Math.max(60, deltaMs));
      const instantKeystrokeWpm = 12000 / deltaMs;
      const clampedWpm = Math.min(180, Math.max(15, instantKeystrokeWpm));

      if (smoothSpeedRef.current === 0) {
        smoothSpeedRef.current = clampedWpm;
      } else {
        // Smooth EMA filter (75% previous + 25% current)
        const alpha = 0.25;
        smoothSpeedRef.current = (1 - alpha) * smoothSpeedRef.current + alpha * clampedWpm;
      }

      const immediateSpeed = Math.round(smoothSpeedRef.current);
      setLiveInstantWpm(immediateSpeed);
      setLiveNetWpm(immediateSpeed);
      const hadError = errorIndicesRef.current.has(cursorIndex) || hasErrorAtCursor;
      if (hasErrorAtCursor) {
        setHasErrorAtCursor(false);
      }

      // Advance cursor
      let nextIndex = cursorIndex + 1;

      // In Numbers Mode: automatically jump across spaces between number blocks
      if (isNumbersMode) {
        while (nextIndex < cleanTargetText.length && cleanTargetText[nextIndex] === ' ') {
          nextIndex++;
        }
      }

      setCharStates((prev) => {
        const updated = [...prev];
        updated[cursorIndex] = hadError ? 'incorrect' : 'correct';
        // Auto-mark skipped spaces as correct
        if (isNumbersMode && nextIndex > cursorIndex + 1) {
          for (let s = cursorIndex + 1; s < nextIndex; s++) {
            updated[s] = 'correct';
          }
        }
        return updated;
      });

      if (nextIndex >= cleanTargetText.length) {
        finishSession();
      } else {
        setCursorIndex(nextIndex);
      }
    } else {
      // User pressed wrong character: stays on this character, turns RED, locks advancement until right key is pressed
      soundEffects.playErrorBuzzer();
      setHasErrorAtCursor(true);
      errorIndicesRef.current.add(cursorIndex);
      setErrorIndicesCount(errorIndicesRef.current.size);
      errorKeysRef.current += 1;
      setErrorKeystrokes((prev) => prev + 1);
      setErrorHistory((prev) => [...prev, { char: expectedChar, index: cursorIndex }]);
      setCharStates((prev) => {
        const updated = [...prev];
        updated[cursorIndex] = 'incorrect'; // turns RED
        return updated;
      });

      // Standard calibrated penalty on mistake (0ms reaction, balanced 2-3 WPM deduction)
      const now = Date.now();
      lastKeyTimeRef.current = now;
      const penalty = Math.min(3, Math.max(1.5, smoothSpeedRef.current * 0.04));
      smoothSpeedRef.current = Math.max(0, smoothSpeedRef.current - penalty);

      const penalizedSpeed = Math.round(smoothSpeedRef.current);
      setLiveInstantWpm(penalizedSpeed);
      setLiveNetWpm(penalizedSpeed);
    }
  };

  const handleReset = () => {
    errorIndicesRef.current.clear();
    setErrorIndicesCount(0);
    setCharStates(new Array(cleanTargetText.length).fill('untyped'));
    setCursorIndex(0);
    setHasErrorAtCursor(false);
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
    setErrorHistory([]);
    setSpeedSamples([]);
    startTimeRef.current = null;
    pauseStartRef.current = null;
    totalPausedTimeRef.current = 0;
    correctKeysRef.current = 0;
    errorKeysRef.current = 0;
    totalKeysRef.current = 0;
    keystrokeTimestampsRef.current = [];
    lastSpeedUpdateSecRef.current = 0;
    smoothSpeedRef.current = 0;
    lastKeyTimeRef.current = 0;
    setLiveInstantWpm(0);
    setLiveNetWpm(0);
    if (inputRef.current) inputRef.current.focus();
  };

  // Anti-cheat & Tab Switch Violation Detector:
  // If the user switches tab, opens another page or blurs the window during an active test, cancel test & show warning
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isFinished) {
        handleReset();
        setTabSwitchWarning(true);
      }
    };

    const handleWindowBlur = () => {
      if (isStarted && !isFinished) {
        handleReset();
        setTabSwitchWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isStarted, isFinished, cleanTargetText]);

  const currentExpectedChar = cleanTargetText[cursorIndex] || '';

  const widthClass = 
    displayConfig.boxWidth === 'full' 
      ? 'w-full max-w-full px-2 sm:px-4' 
      : displayConfig.boxWidth === 'ultrawide'
      ? 'w-full max-w-7xl 2xl:max-w-[1550px] mx-auto px-1 sm:px-3'
      : displayConfig.boxWidth === 'wide'
      ? 'w-full max-w-6xl mx-auto px-2 sm:px-4'
      : displayConfig.boxWidth === 'compact'
      ? 'w-full max-w-4xl mx-auto px-2 sm:px-4'
      : 'w-full max-w-5xl 2xl:max-w-6xl mx-auto px-2 sm:px-4'; // default: 'medium' (طول افقی متوسط و استاندارد)

  const heightClass =
    displayConfig.boxHeight === 'compact'
      ? 'min-h-[140px] max-h-[220px]'
      : displayConfig.boxHeight === 'tall'
      ? 'min-h-[230px] max-h-[380px]'
      : 'min-h-[170px] max-h-[290px]';

  const fontSizeClass =
    displayConfig.fontSize === 'xl'
      ? 'text-4xl sm:text-5xl'
      : displayConfig.fontSize === 'lg'
      ? 'text-3xl sm:text-4xl'
      : displayConfig.fontSize === 'sm'
      ? 'text-xl sm:text-2xl'
      : 'text-2xl sm:text-3xl';

  const lineSpacingClass =
    displayConfig.lineSpacing === 'loose'
      ? 'leading-[2.2]'
      : displayConfig.lineSpacing === 'normal'
      ? 'leading-[1.6]'
      : 'leading-[1.9]';

  return (
    <div className={`${widthClass} space-y-4`}>
      {/* Top Bar: Title, Controls, Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          {onBackToSetup && (
            <button
              type="button"
              onClick={onBackToSetup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition shadow-2xs"
              title="بازگشت به صفحه تنظیمات اولیه و تغییر زبان"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تنظیمات و زبان</span>
            </button>
          )}
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {language === 'fa' ? 'فارسی' : 'English'}
          </span>
        </div>

        {/* Real-time Counter HUD (Standard Typeo / EdClub layout) */}
        <div className="flex items-center gap-3 sm:gap-6 text-sm">
          {/* Main Speed */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold">سرعت (WPM)</span>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-black text-blue-600 font-mono tracking-tight">
                {liveInstantWpm}
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-200" />

          {/* Accuracy */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold">دقت</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {accuracy}٪
            </span>
          </div>

          <div className="w-px h-7 bg-slate-200" />

          {/* Errors */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold">خطاها</span>
            <span className={`text-xl sm:text-2xl font-black font-mono ${errorKeystrokes > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
              {errorKeystrokes}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-200" />

          {/* Time (Stopwatch / کرنومتر) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold">زمان (کرنومتر)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-800 font-mono tracking-tight">
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
              {timeLimitSeconds && (
                <span className="text-xs text-slate-400 font-mono">
                  / {Math.floor(timeLimitSeconds / 60)}:00
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {allowChangeText && !isLesson && onTextChangeRequest && (
            <button
              type="button"
              onClick={onTextChangeRequest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition cursor-pointer"
              title="تعویض به متن جدید (کلید میانبر Alt + N)"
            >
              <Shuffle className="w-4 h-4" />
              <span>تعویض متن ↺</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-blue-700 text-blue-100 rounded border border-blue-500 font-mono">Alt+N</kbd>
            </button>
          )}

          <button
            onClick={() => {
              if (!isStarted || isFinished) return;
              if (!isPaused) {
                pauseStartRef.current = Date.now();
                setIsPaused(true);
              } else {
                if (pauseStartRef.current) {
                  totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
                  pauseStartRef.current = null;
                }
                setIsPaused(false);
              }
            }}
            disabled={!isStarted || isFinished}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isPaused
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'ادامه' : 'توقف'}</span>
          </button>

          {/* Mechanical Switch Sound Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAudioSettings(!showAudioSettings)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                !isAudioMuted
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title="تنظیمات صدای سوییچ‌ها"
            >
              {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline" suppressHydrationWarning>
                {currentSwitch === 'thocky'
                  ? 'تاکی (Thock)'
                  : currentSwitch === 'blue'
                  ? 'کلیکی (Blue)'
                  : currentSwitch === 'brown'
                  ? 'لمسی (Brown)'
                  : currentSwitch === 'red'
                  ? 'خطی (Red)'
                  : 'ماشین‌تحریر'}
              </span>
            </button>

            {showAudioSettings && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 space-y-1 text-xs">
                <div className="px-2 py-1 font-bold text-slate-500 border-b border-slate-100 flex items-center justify-between">
                  <span>نوع سویچ مکانیکی:</span>
                  <button
                    onClick={() => {
                      const next = !isAudioMuted;
                      setIsAudioMuted(next);
                      soundEffects.enabled = !next;
                    }}
                    className="text-blue-600 text-[10px]"
                  >
                    {isAudioMuted ? 'فعال‌سازی' : 'بی‌صدا'}
                  </button>
                </div>
                {(
                  [
                    { id: 'thocky', name: 'Holy Panda (تاکی عمیق)' },
                    { id: 'blue', name: 'Cherry MX Blue (کلیکی)' },
                    { id: 'brown', name: 'Gateron Brown (لمسی)' },
                    { id: 'red', name: 'Cherry MX Red (خطی نرم)' },
                    { id: 'typewriter', name: 'ماشین تحریر کلاسیک' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSwitch(s.id);
                      soundEffects.setSwitch(s.id);
                      soundEffects.playKeyClick();
                      setShowAudioSettings(false);
                    }}
                    className={`w-full text-right px-2.5 py-1.5 rounded-lg transition ${
                      currentSwitch === s.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="شروع مجدد"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Focused Canvas: Ultra-wide horizontal span & fixed height */}
      <div
        ref={canvasContainerRef}
        onClick={() => inputRef.current?.focus()}
        className={`relative w-full bg-white p-6 sm:p-8 rounded-3xl border-2 transition-colors cursor-text ${heightClass} overflow-y-auto flex flex-col justify-start items-stretch scroll-smooth shadow-sm ${
          hasErrorAtCursor
            ? 'border-red-400 shadow-md shadow-red-500/10'
            : isPaused
            ? 'border-amber-300 opacity-60'
            : 'border-slate-200 focus-within:border-blue-500 focus-within:shadow-md'
        }`}
        dir={language === 'fa' ? 'rtl' : 'ltr'}
      >
        {/* Hidden active input capturing strokes */}
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 opacity-0 w-full h-full cursor-default"
          onKeyDown={handleKeyDown}
          autoFocus
          readOnly={isPaused || isFinished}
          aria-label="Typing input area"
        />

        {/* Pause Overlay - Pure Light Theme (No black) */}
        {isPaused && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center z-10 border border-amber-200">
            <span className="px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-300 text-sm font-bold shadow-md">
              تست متوقف شده است — برای ادامه کلیک کنید یا کلید فاصله / Esc را بزنید
            </span>
          </div>
        )}

        {/* Character-by-character rendered text: BOLD, BLACK & DYNAMIC ADMIN COLORS */}
        <div 
          className={`${fontSizeClass} ${lineSpacingClass} font-bold select-none w-full mx-auto py-1 whitespace-pre-wrap`}
          dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
          {textChars.map((char, idx) => {
            const state = charStates[idx] || 'untyped';
            const isCursor = idx === cursorIndex && !isFinished;
            const hadError = errorIndicesRef.current.has(idx) || state === 'incorrect';

            let customColor = displayConfig.defaultTextColor || '#0f172a';
            let bgClass = '';
            if (isCursor && hasErrorAtCursor) {
              customColor = displayConfig.errorColor || '#e11d48';
              bgClass = 'bg-rose-500/15 text-rose-600 rounded-xs';
            } else if (isCursor) {
              customColor = displayConfig.defaultTextColor || '#0f172a';
              bgClass = '';
            } else if (idx < cursorIndex && hadError) {
              customColor = displayConfig.errorColor || '#e11d48';
              bgClass = 'bg-rose-100/80 text-rose-600 rounded-xs font-bold';
            } else if (state === 'correct') {
              customColor = displayConfig.highlightColor || '#2563eb';
            }

            return (
              <span
                key={idx}
                ref={isCursor ? activeCharRef : null}
                style={{ color: customColor }}
                className={`relative font-bold transition-none ${bgClass}`}
              >
                {isCursor && (
                  <span
                    style={{
                      backgroundColor: hasErrorAtCursor
                        ? (displayConfig.errorColor || '#e11d48')
                        : (displayConfig.highlightColor || '#2563eb')
                    }}
                    className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full pointer-events-none shadow-xs"
                  />
                )}
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Modal warning on tab switch / window blur during test (Anti-cheat) */}
      {tabSwitchWarning && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-rose-300 space-y-5 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 text-rose-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                کاربر گرامی در هنگام ثبت رکورد از صفحه تست خارج نشوید
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                جهت حفظ عدالت و اعتبار رکوردهای ثبت‌شده، جابجایی تب یا خروج از پنجره در حین تایپ مجاز نیست. آزمون شما لغو و از آن خارج شدید.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTabSwitchWarning(false);
                handleReset();
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer"
            >
              متوجه شدم • شروع مجدد آزمون
            </button>
          </div>
        </div>
      )}

      {/* Floating Error Toast (ثابت در لایه شناور، بدون تغییر ساختار DOM، ۰ پیکسل لرزش یا تغییر کادر) */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-rose-600 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-rose-400 text-xs font-bold pointer-events-none select-none transition-all duration-150 max-w-[calc(100vw-3rem)] ${
          hasErrorAtCursor
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }`}
        aria-live="assertive"
      >
        <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
        <span>نویسه اشتباه است! کلید صحیح را فشار دهید تا پیش بروید (نیازی به فشردن Backspace نیست).</span>
      </div>

      {/* Completion Section with High-Tech Animated Speedometer Gauge */}
      {isFinished && (
        <div className="space-y-6">
          <AnimatedCompletionGauge
            wpm={wpm}
            netWpm={netWpm}
            accuracy={accuracy}
            errors={errorKeystrokes}
            elapsedSeconds={elapsedSeconds}
            consistency={calculateConsistency()}
            onRepeat={handleReset}
            onNextText={isLesson ? onNextLesson : (allowChangeText && onTextChangeRequest ? onTextChangeRequest : undefined)}
            nextButtonText={isLesson ? 'رفتن به درس بعدی' : 'متن بعدی و دست جدید'}
          />

          {/* Smart AI Coach Diagnostic Recommendation */}
          {(() => {
            const coach = analyzeTypingWithAiCoach(
              errorHistory,
              targetText.length,
              wpm,
              accuracy,
              calculateConsistency(),
              language
            );
            return (
              <div className="p-5 rounded-3xl bg-indigo-50/60 border border-indigo-100 max-w-4xl mx-auto space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-indigo-100/80 pb-3">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    <span>تحلیل مربی هوشمند تایپرو (AI Coach)</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-black text-xs font-mono">
                    رتبه مهارت: {coach.overallGrade}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">
                  {coach.coachTip}
                </p>

                {coach.weakestFinger && (
                  <div className="p-3 rounded-2xl bg-white border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      بیشترین میزان خطای مهارتی: <strong>{coach.weakestFinger.nameFa}</strong> ({coach.weakestFinger.errorCount} خطا)
                    </span>
                    <span className="text-indigo-600 font-bold">پیشنهاد تمرین تقویتی</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Virtual Keyboard with Real-time synchronization (Always visible alongside text) */}
      {!isFinished && (
        <div className="w-full max-w-6xl sm:max-w-7xl mx-auto pt-1">
          <VirtualKeyboard
            language={language}
            currentExpectedChar={currentExpectedChar}
            isError={hasErrorAtCursor}
            pressedKey={lastPressedKey}
            showHandsGuide={true}
          />
        </div>
      )}
    </div>
  );
}
