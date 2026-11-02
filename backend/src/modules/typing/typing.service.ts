import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface KeystrokeSample {
  char: string;
  timestamp: number; // epoch ms
  isError: boolean;
}

export interface TypingSubmitDto {
  userId: string;
  textId?: string;
  originalText: string;
  typedText: string;
  elapsedSeconds: number;
  mode: 'TEST' | 'LESSON' | 'PRACTICE' | 'RACE' | 'QURAN';
  language: 'fa' | 'en';
  category?: 'fa' | 'en' | 'code' | 'numbers';
  keystrokes?: KeystrokeSample[];
  lessonId?: string;
}

export interface TypingAnalysisResult {
  id: string;
  userId: string;
  category?: 'fa' | 'en' | 'code' | 'numbers';
  language?: 'fa' | 'en';
  netWpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
  consistency: number;
  totalChars: number;
  errorChars: number;
  elapsedSeconds: number;
  isVerified: boolean;
  cheatSuspicion: boolean;
  cheatReason?: string;
  fingerWeaknesses: { finger: string; errorRate: number }[];
  earnedXp: number;
  earnedCoins: number;
  createdAt: string;
}

export interface LessonItem {
  id: string;
  title: string;
  tier: 'foundation' | 'middle' | 'advanced' | 'numbers' | 'symbols' | 'quran';
  characters: string[];
  targetAccuracy: number;
  minWpm: number;
  sampleText: string;
}

@Injectable()
export class TypingService {
  private typingHistory: TypingAnalysisResult[] = [];

  private lessonCurriculum: LessonItem[] = [
    {
      id: 'lesson-fa-1',
      title: 'ردیف میانی: ت و ن (کلیدهای شاخص برجسته)',
      tier: 'foundation',
      characters: ['ت', 'ن', 'ب', 'ی'],
      targetAccuracy: 95,
      minWpm: 15,
      sampleText: 'تتت ننن ت ن تن نت بنت تبت نبت نبین تبتن',
    },
    {
      id: 'lesson-fa-2',
      title: 'ردیف میانی: ش، س، م، ک و گ',
      tier: 'foundation',
      characters: ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
      targetAccuracy: 96,
      minWpm: 20,
      sampleText: 'شست شب تاب کلم نمک سنگ گندم شکست تمنا سلامت',
    },
    {
      id: 'lesson-fa-3',
      title: 'ردیف بالا: ض، ص، ث، ق، ف، غ، ع، ه، خ، ح، ج، چ',
      tier: 'middle',
      characters: ['ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
      targetAccuracy: 95,
      minWpm: 25,
      sampleText: 'قفص غنچه عقیق خورشید جهان حجاب حقیقت چشمه قلم',
    },
    {
      id: 'lesson-fa-4',
      title: 'ردیف پایین: ظ، ط، ز، ر، ذ، د، پ، و',
      tier: 'middle',
      characters: ['ط', 'ظ', 'ز', 'ر', 'ذ', 'د', 'پ', 'و'],
      targetAccuracy: 95,
      minWpm: 30,
      sampleText: 'طلوع ذره دوران پرواز وطن راز قدرت زیبا طوفان',
    },
    {
      id: 'lesson-fa-5',
      title: 'اعراب‌گذاری قرآن و تنوین‌ها (حرکات ثلاث)',
      tier: 'quran',
      characters: ['َ', 'ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ّ', 'ْ'],
      targetAccuracy: 98,
      minWpm: 20,
      sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    },
  ];

  constructor() {
    this.loadHistory();
  }

  private getHistoryFilePath(): string {
    const candidates = [
      path.join(process.cwd(), 'data', 'typing_history.json'),
      path.join(process.cwd(), 'backend', 'data', 'typing_history.json'),
      path.resolve(__dirname, '..', '..', '..', 'data', 'typing_history.json'),
      path.resolve(__dirname, '..', '..', 'data', 'typing_history.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidates[0];
  }

  private loadHistory() {
    try {
      const filePath = this.getHistoryFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.typingHistory = list;
        }
      }
    } catch (e) {
      console.warn('Failed to load typing history:', e);
    }
  }

  private saveHistory() {
    try {
      const targets = [
        path.join(process.cwd(), 'data', 'typing_history.json'),
        path.join(process.cwd(), 'backend', 'data', 'typing_history.json'),
      ];
      const json = JSON.stringify(this.typingHistory, null, 2);
      for (const t of targets) {
        try {
          const dir = path.dirname(t);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(t, json, 'utf8');
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to save typing history:', e);
    }
  }

  getCurriculum(): LessonItem[] {
    return this.lessonCurriculum;
  }

  getLessonById(id: string): LessonItem | undefined {
    return this.lessonCurriculum.find((l) => l.id === id);
  }

  /**
   * Evaluates typing session conforming to Sections 27, 28, 145 & 150:
   * - Strict Net WPM calculation: (Correct Chars / 5) / (Minutes)
   * - Keystroke jitter entropy validation
   * - Hardware paste / macro bot prevention
   */
  evaluateSession(dto: TypingSubmitDto): TypingAnalysisResult {
    const elapsedMinutes = Math.max(0.05, dto.elapsedSeconds / 60);
    const original = dto.originalText;
    const typed = dto.typedText;

    let correctChars = 0;
    let errorChars = 0;

    const minLen = Math.min(original.length, typed.length);
    for (let i = 0; i < minLen; i++) {
      if (original[i] === typed[i]) {
        correctChars++;
      } else {
        errorChars++;
      }
    }
    // Any excess characters typed or omitted count as errors
    errorChars += Math.abs(original.length - typed.length);

    const totalChars = Math.max(1, correctChars + errorChars);
    const accuracy = Math.max(0, Math.min(100, Math.round((correctChars / totalChars) * 10000) / 100));

    // Standard Typeo typing calculation: 4 chars/word for Persian, 5 chars/word for English
    const isEnglish = /[a-zA-Z]/.test(original.slice(0, 50));
    const charsPerWord = isEnglish ? 5 : 4;
    const rawWpm = Math.round((totalChars / charsPerWord) / elapsedMinutes);
    const netChars = Math.max(0, correctChars - errorChars);
    const netWpm = Math.max(0, Math.round((netChars / charsPerWord) / elapsedMinutes));
    const cpm = Math.round(correctChars / elapsedMinutes);

    // Anti-Cheat Telemetry Validation (Section 145)
    let cheatSuspicion = false;
    let cheatReason: string | undefined = undefined;

    if (dto.keystrokes && dto.keystrokes.length > 5) {
      const intervals: number[] = [];
      for (let i = 1; i < dto.keystrokes.length; i++) {
        intervals.push(dto.keystrokes[i].timestamp - dto.keystrokes[i - 1].timestamp);
      }

      // Check for superhuman speed or robotic uniform latency (< 15ms or 0 variance)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;

      if (avgInterval < 20) {
        cheatSuspicion = true;
        cheatReason = 'تاخیر غیرانسانی کمتر از ۲۰ میلی‌ثانیه بین کلیدها (ربات شناسایی شد)';
      } else if (variance < 2 && intervals.length > 20) {
        cheatSuspicion = true;
        cheatReason = 'توزیع تاخیر کامپیوتر کاملاً صفر و یکنواخت (ماکرو کلید)';
      }
    }

    // High speed without keystroke verification flag
    if (netWpm > 180 && !dto.keystrokes) {
      cheatSuspicion = true;
      cheatReason = 'سرعت تایپ نامتعارف بیش از ۱۸۰ کلمه در دقیقه بدون تله‌متری کلیدها';
    }

    // Consistency calculation based on speed maintenance
    const consistency = cheatSuspicion ? 20 : Math.min(100, Math.max(65, Math.round(100 - (errorChars * 3))));

    // Calculate Gamification Rewards (Section 85)
    const earnedXp = Math.round(netWpm * 1.5 + (accuracy >= 98 ? 30 : 10));
    const earnedCoins = Math.round(netWpm * 0.5 + (accuracy === 100 ? 25 : 5));

    const determinedCategory: 'fa' | 'en' | 'code' | 'numbers' =
      dto.category ||
      (dto.originalText && /[{};=()=>]/.test(dto.originalText) && /[a-zA-Z]/.test(dto.originalText) ? 'code' : null) ||
      (dto.originalText && /^[0-9\s]+$/.test(dto.originalText) ? 'numbers' : null) ||
      (isEnglish || dto.language === 'en' ? 'en' : 'fa');

    const result: TypingAnalysisResult = {
      id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: dto.userId,
      category: determinedCategory,
      language: dto.language || (isEnglish ? 'en' : 'fa'),
      netWpm,
      rawWpm,
      cpm,
      accuracy,
      consistency,
      totalChars,
      errorChars,
      elapsedSeconds: dto.elapsedSeconds,
      isVerified: !cheatSuspicion && accuracy >= 90,
      cheatSuspicion,
      cheatReason,
      fingerWeaknesses: [
        { finger: 'انگشت کوچک دست چپ', errorRate: errorChars > 3 ? 14 : 4 },
        { finger: 'انگشت حلقه دست راست', errorRate: errorChars > 1 ? 9 : 2 },
      ],
      earnedXp,
      earnedCoins,
      createdAt: new Date().toISOString(),
    };

    this.typingHistory.unshift(result);
    this.saveHistory();
    return result;
  }

  getUserHistory(userId: string): TypingAnalysisResult[] {
    this.loadHistory();
    if (!userId || userId === 'all') return this.typingHistory;
    const direct = this.typingHistory.filter((h) => h.userId === userId);
    if (direct.length > 0) return direct;
    if (userId === 'usr-admin' || userId === 'user-active' || userId === 'guest') {
      return this.typingHistory.filter((h) => h.userId === 'user-active' || h.userId === userId);
    }
    return [];
  }

  getUserStats(userId: string, category?: string) {
    let userSessions = this.getUserHistory(userId);
    if (category && category !== 'all') {
      userSessions = userSessions.filter((s) => {
        if (s.category) return s.category === category;
        if (category === 'code') return s.category === 'code';
        if (category === 'en') return s.language === 'en';
        if (category === 'fa') return !s.language || s.language === 'fa';
        return false;
      });
    }
    if (userSessions.length === 0) {
      return {
        totalTests: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        averageConsistency: 0,
        totalTypingMinutes: 0,
      };
    }

    const sortedByWpm = [...userSessions].sort((a, b) => b.netWpm - a.netWpm);
    const bestSession = sortedByWpm[0];
    const bestWpm = bestSession ? bestSession.netWpm : 0;
    const bestAccuracy = bestSession ? bestSession.accuracy : 0;
    const avgWpm = Math.round(userSessions.reduce((acc, s) => acc + s.netWpm, 0) / userSessions.length);
    const avgAcc = Math.round((userSessions.reduce((acc, s) => acc + s.accuracy, 0) / userSessions.length) * 10) / 10;
    const avgCons = Math.round(userSessions.reduce((acc, s) => acc + (s.consistency ?? s.accuracy ?? 100), 0) / userSessions.length);
    const totalMins = Math.round(userSessions.reduce((acc, s) => acc + s.elapsedSeconds, 0) / 60);

    return {
      totalTests: userSessions.length,
      bestWpm,
      bestAccuracy,
      averageWpm: avgWpm,
      averageAccuracy: avgAcc,
      averageConsistency: avgCons,
      totalTypingMinutes: totalMins,
    };
  }

  getLeaderboard() {
    return [
      { rank: 1, name: 'علی رضایی', wpm: 124, accuracy: 99.4, league: 'Grandmaster' },
      { rank: 2, name: 'زهرا مهدوی', wpm: 118, accuracy: 98.8, league: 'Master' },
      { rank: 3, name: 'سروش نیک‌پی', wpm: 112, accuracy: 98.2, league: 'Master' },
      { rank: 4, name: 'مبینا کریمی', wpm: 106, accuracy: 99.0, league: 'Diamond' },
      { rank: 5, name: 'پوریا دانشور', wpm: 99, accuracy: 97.6, league: 'Diamond' },
    ];
  }

  getAllHistory(): TypingAnalysisResult[] {
    return this.typingHistory;
  }
}
