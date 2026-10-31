import { describe, it, expect, beforeEach } from 'vitest';
import { TypingService } from '../src/modules/typing/typing.service';
import { CertificateService } from '../src/modules/certificate/certificate.service';
import { EconomyService } from '../src/modules/economy/economy.service';
import { AntiCheatService } from '../src/modules/anticheat/anticheat.service';

describe('Comprehensive Modules Acceptance Tests', () => {
  let typingService: TypingService;
  let certificateService: CertificateService;
  let economyService: EconomyService;
  let antiCheatService: AntiCheatService;

  beforeEach(() => {
    typingService = new TypingService();
    certificateService = new CertificateService();
    economyService = new EconomyService();
    antiCheatService = new AntiCheatService();
  });

  describe('Typing Engine & Anti-Cheat Telemetry', () => {
    it('accurately computes Net WPM and 100% Accuracy on exact match', () => {
      const text = 'تایپ ده انگشتی مهارت بنیادین دنیای مدرن است.';
      const res = typingService.evaluateSession({
        userId: 'u-1',
        originalText: text,
        typedText: text,
        elapsedSeconds: 30, // 0.5 minutes
        mode: 'TEST',
        language: 'fa',
      });

      expect(res.accuracy).toBe(100);
      expect(res.errorChars).toBe(0);
      expect(res.netWpm).toBeGreaterThan(0);
      expect(res.cheatSuspicion).toBe(false);
    });

    it('flags superhuman intervals (<20ms) as suspicious bot activity', () => {
      const text = 'متن آزمایشی';
      const fakeKeystrokes = [
        { char: 'م', timestamp: 1000, isError: false },
        { char: 'ت', timestamp: 1010, isError: false }, // 10ms diff (< 20ms)
        { char: 'ن', timestamp: 1018, isError: false }, // 8ms diff
        { char: ' ', timestamp: 1025, isError: false },
        { char: 'آ', timestamp: 1032, isError: false },
        { char: 'ز', timestamp: 1040, isError: false },
      ];

      const res = typingService.evaluateSession({
        userId: 'bot-1',
        originalText: text,
        typedText: text,
        elapsedSeconds: 1,
        mode: 'TEST',
        language: 'fa',
        keystrokes: fakeKeystrokes,
      });

      expect(res.cheatSuspicion).toBe(true);
      expect(res.isVerified).toBe(false);
      expect(res.cheatReason).toContain('تاخیر غیرانسانی');
    });
  });

  describe('Verifiable Certificates System (Section 106)', () => {
    it('issues a Gold tier certificate when criteria are met', () => {
      const cert = certificateService.issueCertificate({
        userId: 'u-gold-1',
        fullName: 'فرهاد احمدی',
        wpm: 75,
        accuracy: 98.5,
        language: 'fa',
        testDurationSeconds: 60,
      });

      expect(cert.tier).toBe('Gold');
      expect(cert.serialNumber).toMatch(/^TYPRO-CERT-2026-\d{5}$/);
      expect(cert.verificationHash).toBeDefined();
      expect(cert.isValid).toBe(true);

      // Verify certificate lookup
      const verified = certificateService.verifyCertificate(cert.serialNumber);
      expect(verified.fullName).toBe('فرهاد احمدی');
      expect(verified.wpm).toBe(75);
    });

    it('rejects certificate when accuracy is below 97%', () => {
      expect(() =>
        certificateService.issueCertificate({
          userId: 'u-fail',
          fullName: 'کاربر ناموفق',
          wpm: 85,
          accuracy: 94.0, // Below 97% requirement
          language: 'fa',
          testDurationSeconds: 60,
        })
      ).toThrow('حداقل دقت مجاز ۹۷٪ است');
    });
  });

  describe('Digital Economy & Escrow System (Section 126)', () => {
    it('deducts currency on purchase and adds item to inventory', () => {
      const initialWallet = economyService.getWallet('user-me-01');
      const startCoins = initialWallet.coins;

      const res = economyService.purchaseItem('user-me-01', 'skin-dena-plus', 'coins');
      expect(res.success).toBe(true);
      expect(res.wallet.coins).toBe(startCoins - 500);

      const inv = economyService.getUserInventory('user-me-01');
      expect(inv).toContain('skin-dena-plus');
    });

    it('creates freelancer order in escrow and releases upon client confirmation', () => {
      const order = economyService.createFreelancerOrder({
        clientId: 'client-alice',
        freelancerId: 'freelancer-bob',
        title: 'تایپ پایان‌نامه مهندسی',
        description: '۱۰۰ صفحه همراه با جداول',
        amountToman: 500000,
      });

      expect(order.escrowStatus).toBe('HELD_IN_ESCROW');
      expect(order.status).toBe('PENDING');

      const released = economyService.releaseEscrow(order.id, 'client-alice');
      expect(released.escrowStatus).toBe('RELEASED');
      expect(released.status).toBe('COMPLETED');

      const bobWallet = economyService.getWallet('freelancer-bob');
      expect(bobWallet.tomanBalance).toBe(500000);
    });
  });

  describe('Anti-Cheat Telemetry & Shannon Entropy (Section 145)', () => {
    it('detects uniform robotic intervals with low Shannon entropy', () => {
      // Simulate a robotic bot typing exactly every 50ms (0 variance, 0 entropy)
      const botKeystrokes = Array.from({ length: 30 }, (_, i) => ({
        char: 'a',
        pressTimestamp: 1000 + i * 50,
      }));

      const report = antiCheatService.analyzeSession({
        sessionId: 'session-bot-101',
        userId: 'bot-user',
        targetText: 'test robotic script typing',
        typedText: 'test robotic script typing',
        totalDurationMs: 1500,
        keystrokes: botKeystrokes,
      });

      expect(report.isFlagged).toBe(true);
      expect(report.confidencePercent).toBeGreaterThanOrEqual(90);
      expect(report.metrics.shannonEntropyBits).toBeLessThan(1.0);
    });

    it('validates natural human keystrokes with organic latency variance', () => {
      // Simulate natural human intervals (varying between 80ms and 240ms)
      const humanLatencies = [120, 150, 95, 210, 140, 180, 110, 160, 230, 115, 145, 175, 130, 205, 90, 165, 135, 190, 105, 155];
      let currentT = 1000;
      const humanKeystrokes = humanLatencies.map((lat) => {
        currentT += lat;
        return { char: 'x', pressTimestamp: currentT };
      });

      const report = antiCheatService.analyzeSession({
        sessionId: 'session-human-202',
        userId: 'human-user',
        targetText: 'natural human typing with organic jitter',
        typedText: 'natural human typing with organic jitter',
        totalDurationMs: currentT - 1000,
        keystrokes: humanKeystrokes,
      });

      expect(report.isFlagged).toBe(false);
      expect(report.metrics.minIntervalMs).toBeGreaterThanOrEqual(20);
      expect(report.metrics.shannonEntropyBits).toBeGreaterThan(2.0);
    });
  });
});
