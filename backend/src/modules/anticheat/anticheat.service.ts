import { Injectable } from '@nestjs/common';

export interface KeystrokeTelemetryPoint {
  char: string;
  pressTimestamp: number; // epoch ms
  releaseTimestamp?: number; // epoch ms
}

export interface AntiCheatAnalysisInput {
  sessionId: string;
  userId: string;
  targetText: string;
  typedText: string;
  totalDurationMs: number;
  keystrokes: KeystrokeTelemetryPoint[];
}

export interface AntiCheatReport {
  sessionId: string;
  userId: string;
  isFlagged: boolean;
  confidencePercent: number;
  reason?: string;
  metrics: {
    averageIntervalMs: number;
    minIntervalMs: number;
    varianceMs: number;
    shannonEntropyBits: number;
    calculatedNetWpm: number;
  };
  analyzedAt: string;
}

@Injectable()
export class AntiCheatService {
  private flaggedSessions: AntiCheatReport[] = [];

  /**
   * Conforms strictly to Section 145 (Anti-Cheat Telemetry):
   * - Keystroke interval inspection (< 20ms human impossibility limit)
   * - Shannon Entropy of interval frequency distribution
   * - Macro uniformity checks
   */
  analyzeSession(input: AntiCheatAnalysisInput): AntiCheatReport {
    const { keystrokes, totalDurationMs, typedText } = input;
    const intervals: number[] = [];

    for (let i = 1; i < keystrokes.length; i++) {
      const diff = keystrokes[i].pressTimestamp - keystrokes[i - 1].pressTimestamp;
      if (diff >= 0 && diff < 5000) {
        intervals.push(diff);
      }
    }

    const isEnglish = /[a-zA-Z]/.test(typedText.slice(0, 50));
    const charsPerWord = isEnglish ? 5 : 4;
    const calculatedNetWpm = Math.round(
      (typedText.length / charsPerWord) / Math.max(0.05, totalDurationMs / 60000)
    );

    if (intervals.length < 5) {
      return {
        sessionId: input.sessionId,
        userId: input.userId,
        isFlagged: false,
        confidencePercent: 20,
        metrics: {
          averageIntervalMs: 0,
          minIntervalMs: 0,
          varianceMs: 0,
          shannonEntropyBits: 0,
          calculatedNetWpm,
        },
        analyzedAt: new Date().toISOString(),
      };
    }

    const avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    const minInterval = Math.min(...intervals);
    const variance = Math.round(
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    );

    // Calculate Shannon Entropy of 20ms latency buckets
    const bucketSize = 20;
    const buckets: Record<number, number> = {};
    intervals.forEach((interval) => {
      const bucket = Math.floor(interval / bucketSize);
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });

    let entropy = 0;
    const totalCount = intervals.length;
    Object.values(buckets).forEach((count) => {
      const p = count / totalCount;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });

    const shannonEntropyBits = Math.round(entropy * 100) / 100;

    let isFlagged = false;
    let confidencePercent = 0;
    let reason: string | undefined = undefined;

    // Detection Rule 1: Superhuman intervals (< 20ms human physiological limit)
    if (minInterval < 20) {
      isFlagged = true;
      confidencePercent = 98;
      reason = 'ثبت ضربات کلید با تاخیر غیرانسانی کمتر از ۲۰ میلی‌ثانیه (ربات یا ماکرو سخت‌افزاری)';
    }
    // Detection Rule 2: Robotic uniformity (Entropy < 1.0 or Variance < 3 with >= 20 keystrokes)
    else if (intervals.length >= 20 && (shannonEntropyBits < 1.0 || variance < 3)) {
      isFlagged = true;
      confidencePercent = 95;
      reason = 'آنتروپی توزیع زمانی بسیار پایین و یکنواختی ماشینی ضربات (اسکریپت خودکار)';
    }
    // Detection Rule 3: Extreme high speed without human jitter
    else if (calculatedNetWpm > 180 && shannonEntropyBits < 1.8) {
      isFlagged = true;
      confidencePercent = 88;
      reason = 'سرعت بالای ۱۸۰ کلمه در دقیقه فاقد مشخصه‌های بیومتریک ارتعاش عصبی دست انسان';
    }

    const report: AntiCheatReport = {
      sessionId: input.sessionId,
      userId: input.userId,
      isFlagged,
      confidencePercent,
      reason,
      metrics: {
        averageIntervalMs: avgInterval,
        minIntervalMs: minInterval,
        varianceMs: variance,
        shannonEntropyBits,
        calculatedNetWpm,
      },
      analyzedAt: new Date().toISOString(),
    };

    if (isFlagged) {
      this.flaggedSessions.unshift(report);
    }

    return report;
  }

  getFlaggedSessions(): AntiCheatReport[] {
    return this.flaggedSessions;
  }
}
