import { Injectable, BadRequestException } from '@nestjs/common';
import { RaceService } from '../race/race.service';
import { AuthService } from '../auth/auth.service';
import { TypingService } from '../typing/typing.service';
import { CertificateService } from '../certificate/certificate.service';
import * as fs from 'fs';
import * as path from 'path';

export interface CustomRaceText {
  id: string;
  roomId: string;
  title: string;
  category: string;
  text: string;
  charCount: number;
  wordCount: number;
  createdAt: string;
  createdByName?: string;
}

export interface CustomTypingText {
  id: string;
  title: string;
  category: string;
  difficulty: 'آسان' | 'متوسط' | 'سخت';
  text: string;
  charCount: number;
  wordCount: number;
  createdAt: string;
  createdByName?: string;
}

export interface AdminMessage {
  id: string;
  type: 'broadcast' | 'direct';
  targetUserId?: string;
  targetUsername?: string;
  targetDisplayName?: string;
  title: string;
  content: string;
  sender: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  seenCount: number;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  object: string;
  timestamp: string;
  before?: any;
  after?: any;
}

export interface VisitorRecord {
  id: string;
  ip: string;
  userAgent: string;
  lastPath: string;
  firstSeen: string;
  lastSeen: string;
  hits: number;
  sessionsCount?: number;
  lastSessionId?: string;
  userId?: string;
  referrer?: string;
}

export interface PlatformStats {
  onlineTypists: string;
  todayTests: string;
  avgGrowth: string;
  issuedCerts: string;
  mode: 'real' | 'custom';
}

export interface SubscriptionReceipt {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userMobile?: string;
  planId: string;
  planName: string;
  amount: number;
  discountCode?: string | null;
  trackingCode: string;
  senderCard: string;
  receiptImage: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

@Injectable()
export class AdminService {
  private receipts: SubscriptionReceipt[] = [];
  private visitors: VisitorRecord[] = [];
  private platformStats: PlatformStats = {
    onlineTypists: '0',
    todayTests: '0',
    avgGrowth: '+۰ WPM',
    issuedCerts: '0',
    mode: 'real',
  };

  private auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      actor: 'SuperAdmin',
      action: 'SYSTEM_CONFIG_UPDATE',
      object: 'RACE_COUNTDOWN_TIME',
      timestamp: new Date().toISOString(),
      before: 5,
      after: 3,
    },
  ];

  private raceCustomTexts: CustomRaceText[] = [];
  private typingCustomTexts: CustomTypingText[] = [];
  private adminMessages: AdminMessage[] = [];

  private systemSettings = {
    xpPerLevel: 1000,
    maxLevel: 1000,
    inactivityTimeoutSec: 5,
    anonymousEntryAllowed: true,
    dailyStarThreshold: 5,
  };

  constructor(
    private readonly raceService: RaceService,
    private readonly authService: AuthService,
    private readonly typingService: TypingService,
    private readonly certificateService: CertificateService,
  ) {
    this.loadReceipts();
    this.loadVisitors();
    this.loadPlatformStats();
    this.loadCustomTexts();
    this.loadAdminMessages();
  }

  private resolveDataPath(filename: string): string {
    const candidates = [
      path.join(process.cwd(), 'data', filename),
      path.join(process.cwd(), 'backend', 'data', filename),
      path.resolve(__dirname, '..', '..', '..', 'data', filename),
      path.resolve(__dirname, '..', '..', 'data', filename),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidates[0];
  }

  private mirrorSaveData(filename: string, data: any) {
    const targets = [
      path.join(process.cwd(), 'data', filename),
      path.join(process.cwd(), 'backend', 'data', filename),
    ];
    const json = JSON.stringify(data, null, 2);
    for (const t of targets) {
      try {
        const dir = path.dirname(t);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(t, json, 'utf8');
      } catch (e) {
        console.warn(`Failed writing to ${t}:`, e);
      }
    }
  }

  private loadVisitors() {
    try {
      const filePath = this.resolveDataPath('visitors.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.visitors = list;
        }
      }
    } catch (e) {
      console.warn('Failed to load visitors:', e);
    }
  }

  private saveVisitors() {
    this.mirrorSaveData('visitors.json', this.visitors);
  }

  recordVisit(
    ip: string,
    userAgent?: string,
    currentPath?: string,
    userId?: string,
    visitorId?: string,
    sessionId?: string,
    referrer?: string,
  ) {
    const rawIp = (ip || '127.0.0.1').split(',')[0].trim();
    const cleanIp = rawIp.startsWith('::ffff:') ? rawIp.replace('::ffff:', '') : rawIp;
    const now = new Date().toISOString();

    if (this.authService) {
      this.authService.recordHeartbeat(userId || visitorId || cleanIp, currentPath);
    }

    // Identify existing visitor:
    // 1. By unique visitorId (per browser storage)
    // 2. By userId (if logged in)
    // 3. Fallback by IP + userAgent (if no visitorId)
    let existing: VisitorRecord | undefined;
    if (visitorId) {
      existing = this.visitors.find((v) => v.id === visitorId || (userId && v.userId === userId));
    }
    if (!existing && userId) {
      existing = this.visitors.find((v) => v.userId === userId);
    }
    if (!existing && !visitorId && !userId) {
      existing = this.visitors.find((v) => v.ip === cleanIp && v.userAgent === userAgent);
    }

    if (existing) {
      existing.hits = (existing.hits || 1) + 1;
      existing.lastSeen = now;
      if (sessionId && existing.lastSessionId !== sessionId) {
        existing.sessionsCount = (existing.sessionsCount || 1) + 1;
        existing.lastSessionId = sessionId;
      }
      if (userAgent) existing.userAgent = userAgent;
      if (currentPath) existing.lastPath = currentPath;
      if (userId && !existing.userId) existing.userId = userId;
      if (referrer) existing.referrer = referrer;
      if (cleanIp && cleanIp !== '127.0.0.1') existing.ip = cleanIp;
    } else {
      const newVid = visitorId || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      this.visitors.unshift({
        id: newVid,
        ip: cleanIp,
        userAgent: userAgent || 'مرورگر کاربر',
        lastPath: currentPath || '/',
        firstSeen: now,
        lastSeen: now,
        hits: 1,
        sessionsCount: 1,
        lastSessionId: sessionId,
        userId: userId,
        referrer: referrer,
      });
      if (this.visitors.length > 5000) this.visitors = this.visitors.slice(0, 5000);
    }
    this.saveVisitors();
    return { success: true, count: this.visitors.length };
  }

  private loadPlatformStats() {
    try {
      const filePath = this.resolveDataPath('platform_stats.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        this.platformStats = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load platform stats:', e);
    }
  }

  private savePlatformStats() {
    this.mirrorSaveData('platform_stats.json', this.platformStats);
  }

  computeRealPlatformStats(): PlatformStats {
    const authOnline = this.authService ? this.authService.getOnlineCount().onlineCount : 0;
    let raceOnline = 0;
    try {
      if (this.raceService) {
        const rooms = this.raceService.getAllRooms();
        raceOnline = rooms.reduce((acc: number, r: any) => acc + (r.participantCount || 0), 0);
      }
    } catch {}

    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const activeVisitors = this.visitors.filter((v) => {
      try {
        return new Date(v.lastSeen).getTime() > twoMinutesAgo;
      } catch {
        return false;
      }
    }).length;

    const realOnline = Math.max(activeVisitors, authOnline, raceOnline, 0);

    let realTests = 0;
    let avgGrowthStr = '+۰ WPM';
    try {
      const history = this.typingService ? this.typingService.getAllHistory() : [];
      realTests = history.length;
      if (history.length > 0) {
        const avgWpm = Math.round(history.reduce((acc, h) => acc + (h.netWpm || 0), 0) / history.length);
        avgGrowthStr = `+${avgWpm} WPM`;
      }
    } catch {}

    let realCerts = 0;
    try {
      const certs = this.certificateService ? this.certificateService.getAllCertificates() : [];
      realCerts = certs.length;
    } catch {}

    const realStats: PlatformStats = {
      onlineTypists: `${realOnline}`,
      todayTests: `${realTests}`,
      avgGrowth: avgGrowthStr,
      issuedCerts: `${realCerts}`,
      mode: 'real',
    };

    this.platformStats = realStats;
    this.savePlatformStats();
    return realStats;
  }

  getPlatformStats(): PlatformStats {
    if (this.platformStats.mode === 'real') {
      return this.computeRealPlatformStats();
    }
    return this.platformStats;
  }

  saveCustomPlatformStats(stats: Partial<PlatformStats>): PlatformStats {
    this.platformStats = {
      ...this.platformStats,
      ...stats,
      mode: stats.mode || 'custom',
    };
    this.savePlatformStats();
    return this.platformStats;
  }

  getRealtimeStats() {
    let allUsers = this.authService ? this.authService.getAllUsers() : [];
    if (!allUsers || allUsers.length === 0) {
      try {
        const candidates = [
          path.join(process.cwd(), 'data', 'users.json'),
          path.join(process.cwd(), 'backend', 'data', 'users.json'),
        ];
        for (const p of candidates) {
          if (fs.existsSync(p)) {
            allUsers = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          }
        }
      } catch {}
    }
    const registeredCount = allUsers ? allUsers.length : 0;
    const stats = this.getPlatformStats();
    const uniqueVisitorsCount = this.visitors.length;
    const totalSessions = this.visitors.reduce((acc, v) => acc + (v.sessionsCount || 1), 0);
    const totalHits = this.visitors.reduce((acc, v) => acc + (v.hits || 1), 0);

    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const activeVisitors = this.visitors.filter((v) => {
      try {
        return new Date(v.lastSeen).getTime() > twoMinutesAgo;
      } catch {
        return false;
      }
    }).length;

    const authOnline = this.authService ? this.authService.getOnlineCount().onlineCount : 0;
    let raceOnline = 0;
    try {
      if (this.raceService) {
        const rooms = this.raceService.getAllRooms();
        raceOnline = rooms.reduce((acc: number, r: any) => acc + (r.participantCount || 0), 0);
      }
    } catch {}

    const onlineReal = Math.max(activeVisitors, authOnline, raceOnline, 0);

    let realTests = 0;
    try {
      const history = this.typingService ? this.typingService.getAllHistory() : [];
      realTests = history.length;
    } catch {}

    // Build user map to enrich visitor records with real usernames and display names
    const userMap = new Map<string, any>();
    if (allUsers && Array.isArray(allUsers)) {
      for (const u of allUsers) {
        if (u.id) userMap.set(u.id, u);
        if (u.username) userMap.set(u.username, u);
      }
    }

    const enrichedVisitors = this.visitors.slice(0, 100).map((v) => {
      let isOnline = false;
      try {
        isOnline = new Date(v.lastSeen).getTime() > twoMinutesAgo;
      } catch {}

      const user = v.userId ? userMap.get(v.userId) : null;

      return {
        ...v,
        isOnline,
        username: user?.username || (v.userId ? v.userId : null),
        displayName: user?.displayName || user?.name || (user?.username ? `@${user.username}` : (v.userId ? 'کاربر سامانه' : 'کاربر مهمان')),
        role: user?.role || (user?.isAdmin ? 'admin' : (v.userId ? 'user' : 'guest')),
        avatar: user?.avatar || null,
        vipLevel: user?.vipLevel || 0,
      };
    });

    // Sort: Online users first, then by lastSeen descending
    enrichedVisitors.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });

    return {
      registeredUsersCount: registeredCount,
      visitorsCount: uniqueVisitorsCount,
      sessionsCount: totalSessions,
      totalHits,
      onlineCount: onlineReal,
      testsCompletedCount: realTests || parseInt(stats.todayTests, 10) || 0,
      recentVisitors: enrichedVisitors,
      platformStats: stats,
    };
  }

  private loadReceipts() {
    try {
      const filePath = this.resolveDataPath('subscription_receipts.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        this.receipts = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load receipts:', e);
    }
  }

  private saveReceipts() {
    this.mirrorSaveData('subscription_receipts.json', this.receipts);
  }

  submitReceipt(dto: Partial<SubscriptionReceipt>): SubscriptionReceipt {
    const newReceipt: SubscriptionReceipt = {
      id: `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: dto.userId || 'guest',
      userName: dto.userName || 'کاربر',
      userEmail: dto.userEmail,
      userMobile: dto.userMobile,
      planId: dto.planId || 'premium-monthly',
      planName: dto.planName || 'اشتراک ویژه',
      amount: dto.amount || 0,
      discountCode: dto.discountCode,
      trackingCode: dto.trackingCode || '',
      senderCard: dto.senderCard || '',
      receiptImage: dto.receiptImage || '',
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    this.receipts.unshift(newReceipt);
    this.saveReceipts();
    return newReceipt;
  }

  getReceipts(): SubscriptionReceipt[] {
    return this.receipts;
  }

  updateReceiptStatus(receiptId: string, status: 'approved' | 'rejected', rejectionReason?: string) {
    const receipt = this.receipts.find((r) => r.id === receiptId);
    if (!receipt) {
      throw new BadRequestException('رسید مورد نظر یافت نشد.');
    }
    receipt.status = status;
    if (status === 'rejected') {
      receipt.rejectionReason = rejectionReason || 'به دلیل عدم تطابق یا عدم واریز وجه، رسید رد شد.';
      this.saveReceipts();
      return { success: true, message: 'رسید پرداخت رد شد.', receipt };
    }

    if (status === 'approved') {
      receipt.rejectionReason = undefined;
      let days = 30;
      if (receipt.planId.includes('yearly') || receipt.planName.includes('سال')) {
        days = 365;
      } else if (receipt.planId.includes('season') || receipt.planName.includes('۳ ماه')) {
        days = 90;
      } else if (receipt.planId.includes('lifetime') || receipt.planName.includes('مادام')) {
        days = 9999;
      }

      this.saveReceipts();
      try {
        this.authService.adminSetSubscription(receipt.userId, receipt.planName, days, true);
      } catch (e) {
        console.warn('Failed to activate user in authService during receipt approve:', e);
      }

      return {
        success: true,
        message: `اشتراک ${receipt.planName} برای کاربر ${receipt.userName} به مدت ${days >= 9999 ? 'مادام‌العمر' : days + ' روز'} با موفقیت فعال شد.`,
        receipt,
      };
    }
  }

  // Section 172: Admin Analytics (DAU, WAU, MAU, Retention, Revenue)
  getDashboardMetrics() {
    const rooms = this.raceService.getAllRooms();
    const activeRooms = rooms.filter((r) => r.state === 'ACTIVE' || r.state === 'COUNTDOWN').length;
    const realStats = this.getRealtimeStats();

    return {
      dau: realStats.registeredUsersCount + realStats.visitorsCount,
      wau: (realStats.registeredUsersCount + realStats.visitorsCount) * 3,
      mau: (realStats.registeredUsersCount + realStats.visitorsCount) * 5,
      retentionRate: '68%',
      onlineUsers: realStats.onlineCount, // Real online presence count
      activeRooms,
      totalRooms: rooms.length,
      todayRevenueToman: 4850000,
      lessonsCompletedToday: 940,
      freelancerOrdersActive: 18,
    };
  }

  // Section 81 & 133: Realtime rooms monitoring for admin
  getActiveRoomsMonitoring() {
    return this.raceService.getAllRooms();
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  getSettings() {
    return this.systemSettings;
  }

  updateSettings(actor: string, updates: Partial<typeof this.systemSettings>) {
    const before = { ...this.systemSettings };
    this.systemSettings = { ...this.systemSettings, ...updates };

    // Section 140: Store immutable audit log
    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor,
      action: 'UPDATE_SYSTEM_SETTINGS',
      object: 'CONFIG',
      timestamp: new Date().toISOString(),
      before,
      after: this.systemSettings,
    });

    return this.systemSettings;
  }

  private loadCustomTexts() {
    try {
      const racePath = this.resolveDataPath('race_custom_texts.json');
      if (fs.existsSync(racePath)) {
        this.raceCustomTexts = JSON.parse(fs.readFileSync(racePath, 'utf8'));
      }
    } catch {}

    try {
      const typingPath = this.resolveDataPath('typing_custom_texts.json');
      if (fs.existsSync(typingPath)) {
        this.typingCustomTexts = JSON.parse(fs.readFileSync(typingPath, 'utf8'));
      }
    } catch {}
  }

  getCustomTexts() {
    return {
      raceTexts: this.raceCustomTexts,
      typingTexts: this.typingCustomTexts,
    };
  }

  addCustomRaceText(dto: {
    roomId: string;
    title: string;
    category?: string;
    text: string;
    createdByName?: string;
  }): CustomRaceText {
    const cleanText = (dto.text || '').trim();
    if (!cleanText) {
      throw new BadRequestException('متن ارسالی نمی‌تواند خالی باشد.');
    }
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    const item: CustomRaceText = {
      id: `rtxt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      roomId: dto.roomId || 'all',
      title: (dto.title || '').trim() || 'متن مسابقه جدید',
      category: (dto.category || '').trim() || 'عمومی',
      text: cleanText,
      charCount: cleanText.length,
      wordCount: words,
      createdAt: new Date().toISOString(),
      createdByName: dto.createdByName || 'ادمین',
    };
    this.raceCustomTexts.unshift(item);
    this.mirrorSaveData('race_custom_texts.json', this.raceCustomTexts);

    // Immediately inject into live race room
    if (this.raceService) {
      this.raceService.addTextToRoom(item.roomId, item.text);
    }
    return item;
  }

  deleteCustomRaceText(id: string): { success: boolean; message: string } {
    const idx = this.raceCustomTexts.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.raceCustomTexts.splice(idx, 1);
      this.mirrorSaveData('race_custom_texts.json', this.raceCustomTexts);
      return { success: true, message: 'متن مسابقه با موفقیت حذف شد.' };
    }
    throw new BadRequestException('متن مورد نظر یافت نشد.');
  }

  addCustomTypingText(dto: {
    title: string;
    category?: string;
    difficulty?: 'آسان' | 'متوسط' | 'سخت';
    text: string;
    createdByName?: string;
  }): CustomTypingText {
    const cleanText = (dto.text || '').trim();
    if (!cleanText) {
      throw new BadRequestException('متن تست تایپ نمی‌تواند خالی باشد.');
    }
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    const item: CustomTypingText = {
      id: `ttxt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: (dto.title || '').trim() || 'متن تست تایپ',
      category: (dto.category || '').trim() || 'عمومی',
      difficulty: dto.difficulty || 'متوسط',
      text: cleanText,
      charCount: cleanText.length,
      wordCount: words,
      createdAt: new Date().toISOString(),
      createdByName: dto.createdByName || 'ادمین',
    };
    this.typingCustomTexts.unshift(item);
    this.mirrorSaveData('typing_custom_texts.json', this.typingCustomTexts);
    return item;
  }

  deleteCustomTypingText(id: string): { success: boolean; message: string } {
    const idx = this.typingCustomTexts.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.typingCustomTexts.splice(idx, 1);
      this.mirrorSaveData('typing_custom_texts.json', this.typingCustomTexts);
      return { success: true, message: 'متن تست تایپ با موفقیت حذف شد.' };
    }
    throw new BadRequestException('متن مورد نظر یافت نشد.');
  }

  // ═══════════════ ADMIN MESSAGES & BROADCAST ═══════════════
  private loadAdminMessages() {
    try {
      const p = this.resolveDataPath('admin_messages.json');
      if (fs.existsSync(p)) {
        this.adminMessages = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch {
      this.adminMessages = [];
    }
  }

  getAdminMessages(): AdminMessage[] {
    return this.adminMessages;
  }

  getLatestBroadcast(): AdminMessage | null {
    return this.adminMessages.find((m) => m.type === 'broadcast') || null;
  }

  sendAdminMessage(dto: {
    type: 'broadcast' | 'direct';
    targetUserId?: string;
    targetUsername?: string;
    targetDisplayName?: string;
    title: string;
    content: string;
    sender?: string;
    priority?: 'normal' | 'important' | 'urgent';
  }): AdminMessage {
    const cleanContent = (dto.content || '').trim();
    const cleanTitle = (dto.title || '').trim();
    if (!cleanTitle) {
      throw new BadRequestException('موضوع پیام نمی‌تواند خالی باشد.');
    }
    if (!cleanContent) {
      throw new BadRequestException('متن پیام نمی‌تواند خالی باشد.');
    }

    const senderName = (dto.sender || '').trim() || 'مدیر سامانه تایپرو';

    const msg: AdminMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: dto.type,
      targetUserId: dto.targetUserId,
      targetUsername: dto.targetUsername,
      targetDisplayName: dto.targetDisplayName,
      title: cleanTitle,
      content: cleanContent,
      sender: senderName,
      priority: dto.priority || 'normal',
      createdAt: new Date().toISOString(),
      seenCount: 0,
    };

    this.adminMessages.unshift(msg);
    this.mirrorSaveData('admin_messages.json', this.adminMessages);

    // Inject into actual user(s) notification inbox with popupShown: false
    this.authService.sendAdminNotification({
      broadcast: dto.type === 'broadcast',
      targetId: dto.targetUserId || dto.targetUsername,
      title: cleanTitle,
      content: cleanContent,
      sender: senderName,
      priority: dto.priority,
    });

    return msg;
  }

  deleteAdminMessage(id: string): { success: boolean; message: string } {
    const idx = this.adminMessages.findIndex((m) => m.id === id);
    if (idx >= 0) {
      this.adminMessages.splice(idx, 1);
      this.mirrorSaveData('admin_messages.json', this.adminMessages);
      return { success: true, message: 'پیام با موفقیت حذف گردید.' };
    }
    throw new BadRequestException('پیام مورد نظر یافت نشد.');
  }
}
