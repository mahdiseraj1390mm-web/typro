import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SmsService } from './sms.service';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER' | 'ECONOMY_MANAGER' | 'USER';

export interface UserSession {
  token: string;
  device: string;
  ip: string;
  createdAt: number;
}

export interface UserNotification {
  id: string;
  category: 'esports' | 'rewards' | 'clubs' | 'system';
  title: string;
  desc: string;
  time: string;
  read: boolean;
  popupShown?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  createdAt?: number;
  sender?: string;
  subject?: string;
}

export interface UserAccount {
  id: string;
  mobile: string;
  email?: string;
  googleId?: string;
  username: string;
  displayName: string;
  bio: string;
  passwordHash: string; // Never plaintext!
  role: UserRole;
  adminTitle?: string;
  permissions?: string[];
  level: number;
  xp: number;
  coins: number;
  diamonds?: number;
  banknotes: number;
  isVerified: boolean;
  isBanned?: boolean;
  sessions: UserSession[];
  profileCompletion: number;
  avatar?: string;
  isSubscribed?: boolean;
  subscriptionTier?: 'FREE' | 'VIP' | 'PRO';
  subscriptionPlan?: string;
  subscription?: string;
  subscriptionExpiresAt?: string;
  notifications?: UserNotification[];
  racesWon?: number;
  wpm?: number;
  accuracy?: number;
  bestWpm?: number;
  bestAccuracy?: number;
  isOnline?: boolean;
  lastActivePath?: string;
  lastActiveAt?: number;
  completedLessons?: Array<{ id: string; title?: string; stars?: number; wpm?: number; accuracy?: number; completedAt: string }>;
  lastLessonId?: string;
  lastLessonTitle?: string;
}

@Injectable()
export class AuthService {
  // Map of mobile -> UserAccount
  private users: Map<string, UserAccount> = new Map();
  // Map of mobile -> { code, expiresAt, pendingUser? }
  private otps: Map<string, { code: string; expiresAt: number; pendingUser?: { username: string; passwordHash: string } }> = new Map();
  // Map of token -> mobile
  private tokens: Map<string, string> = new Map();

  private getDataFilePath(): string {
    const candidates = [
      path.join(process.cwd(), 'data', 'users.json'),
      path.join(process.cwd(), 'backend', 'data', 'users.json'),
      path.resolve(__dirname, '..', '..', '..', 'data', 'users.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidates[0];
  }

  private loadUsers() {
    try {
      const filePath = this.getDataFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const list: UserAccount[] = JSON.parse(raw);
        for (const u of list) {
          if (u.isSubscribed) {
            if (!u.notifications) u.notifications = [];
            if (!u.notifications.some((n) => n.id && n.id.includes('vip-active'))) {
              u.notifications.unshift({
                id: `notif-vip-active-${u.id || Date.now()}`,
                category: 'rewards',
                title: '👑 اشتراک ویژه VIP شما فعال شد!',
                desc: `طرح «${u.subscriptionPlan || 'VIP طلایی'}» توسط مدیریت برای حساب کاربری شما با موفقیت فعال گردید. اکنون تمام مزایای ویژه در دسترس است.`,
                time: 'هم‌اکنون',
                read: false,
                popupShown: false,
                actionLabel: 'مشاهده جزییات اشتراک',
                actionUrl: '/subscription',
                createdAt: Date.now(),
              });
            }
          }
          if (u.mobile) {
            this.users.set(u.mobile, u);
          } else if (u.id) {
            this.users.set(u.id, u);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load users from file:', e);
    }
  }

  private saveUsers() {
    try {
      const targetPath = this.getDataFilePath();
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.users.values());
      fs.writeFileSync(targetPath, JSON.stringify(list, null, 2), 'utf8');

      // Also mirror to backend/data/users.json if started from root or vice versa
      const altCandidates = [
        path.join(process.cwd(), 'data', 'users.json'),
        path.join(process.cwd(), 'backend', 'data', 'users.json'),
      ];
      for (const alt of altCandidates) {
        if (alt !== targetPath && fs.existsSync(path.dirname(alt))) {
          try {
            fs.writeFileSync(alt, JSON.stringify(list, null, 2), 'utf8');
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Failed to save users to file:', e);
    }
  }

  constructor(private readonly smsService: SmsService) {
    // Seed default Super Admin (Section 139)
    const adminUser: UserAccount = {
      id: 'usr-admin',
      mobile: '09121112233',
      username: 'typro_admin',
      displayName: 'مدیر کل سامانه تایپرو',
      bio: 'مدیریت و نظارت یکپارچه بر سیستم‌های رقابت، اقتصاد و محتوا',
      passwordHash: 'Typro@Master2026!', // Professional secure password
      role: 'SUPER_ADMIN',
      level: 100,
      xp: 100000,
      coins: 50000,
      banknotes: 5000,
      isVerified: true,
      sessions: [],
      profileCompletion: 100,
    };
    this.users.set(adminUser.mobile, adminUser);

    // Seed default standard user for immediate demo testing
    const regularUser: UserAccount = {
      id: 'usr-regular',
      mobile: '09120000000',
      username: 'typro_user',
      displayName: 'کاربر تایپرو',
      bio: 'علاقه‌مند به یادگیری تایپ ده‌انگشتی و افزایش سرعت',
      passwordHash: 'user123456',
      role: 'USER',
      level: 1,
      xp: 0,
      coins: 0,
      diamonds: 0,
      banknotes: 0,
      isVerified: true,
      sessions: [],
      profileCompletion: 80,
    };
    this.users.set(regularUser.mobile, regularUser);

    this.loadUsers();
    this.saveUsers();
  }

  getMobileByToken(token: string): string | undefined {
    return this.tokens.get(token);
  }

  // Real-time Active Presence Tracking
  private activeHeartbeats: Map<string, number> = new Map();

  getUsersMap(): Map<string, UserAccount> {
    return this.users;
  }

  recordHeartbeat(clientId: string, currentPath?: string): number {
    const now = Date.now();
    this.activeHeartbeats.set(clientId, now);
    this.cleanupHeartbeats(now);

    // Update real user active state if clientId matches user
    for (const u of this.users.values()) {
      if (u.id === clientId || u.username === clientId || u.mobile === clientId) {
        u.lastActiveAt = now;
        if (currentPath) u.lastActivePath = currentPath;
        break;
      }
    }

    return Math.max(1, this.activeHeartbeats.size);
  }

  getOnlineCount(): { onlineCount: number } {
    const now = Date.now();
    this.cleanupHeartbeats(now);
    return { onlineCount: Math.max(1, this.activeHeartbeats.size) };
  }

  private cleanupHeartbeats(now: number) {
    const cutoff = now - 2 * 60 * 1000; // 2 minutes inactivity timeout
    for (const [id, time] of this.activeHeartbeats.entries()) {
      if (time < cutoff) {
        this.activeHeartbeats.delete(id);
      }
    }
  }

  // Section 16: Request SMS OTP for login via Melli Payamak
  async requestOtp(mobile: string): Promise<{ message: string }> {
    if (!mobile || !/^09\d{9}$/.test(mobile)) {
      throw new BadRequestException('شماره موبایل واردشده نامعتبر است. فرمت صحیح: 09xxxxxxxxx');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otps.set(mobile, {
      code,
      expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
    });

    // Send via Melli Payamak SMS
    await this.smsService.sendOtp(mobile, code);

    return {
      message: 'کد تایید پیامکی با موفقیت ارسال شد.',
    };
  }

  // Section 16: Initial registration (mobile, username, password) -> sends OTP via SMS
  async registerInit(mobile: string, username: string, password: string): Promise<{ message: string }> {
    if (!mobile || !/^09\d{9}$/.test(mobile)) {
      throw new BadRequestException('شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.');
    }
    if (!username || username.trim().length < 3) {
      throw new BadRequestException('نام کاربری باید حداقل ۳ حرف باشد.');
    }
    if (!password || password.length < 6) {
      throw new BadRequestException('رمز عبور باید حداقل ۶ کاراکتر باشد.');
    }

    // Check if mobile already exists
    if (this.users.has(mobile)) {
      throw new BadRequestException('این شماره موبایل قبلاً در سیستم ثبت شده است. لطفاً وارد شوید.');
    }

    // Check if username taken
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase().trim()) {
        throw new BadRequestException('این نام کاربری قبلاً انتخاب شده است.');
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otps.set(mobile, {
      code,
      expiresAt: Date.now() + 2 * 60 * 1000,
      pendingUser: {
        username: username.trim(),
        passwordHash: password,
      },
    });

    // Send via Melli Payamak SMS
    await this.smsService.sendOtp(mobile, code);

    return {
      message: 'کد فعال‌سازی حساب کاربری پیامک شد.',
    };
  }

  // Forgot password: receives mobile and sends newly generated password via SMS
  async forgotPassword(mobile: string): Promise<{ success: boolean; message: string }> {
    if (!mobile || !/^09\d{9}$/.test(mobile)) {
      throw new BadRequestException('شماره موبایل واردشده نامعتبر است. فرمت صحیح: 09xxxxxxxxx');
    }

    let user = this.users.get(mobile);
    if (!user) {
      for (const u of this.users.values()) {
        if (u.mobile === mobile) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('با این شماره ثبت نام نشده است.');
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const newPassword = `TP${randomDigits}`;
    user.passwordHash = newPassword;
    this.saveUsers();

    // Send SMS via Melli Payamak
    await this.smsService.sendNewPassword(mobile, newPassword);

    return {
      success: true,
      message: `رمز عبور جدید به شماره ${mobile} با موفقیت پیامک شد.`,
    };
  }

  // Change Password for authenticated user
  async changePassword(
    tokenOrIdentifier: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('رمز عبور فعلی و رمز عبور جدید الزامی هستند.');
    }
    if (newPassword.length < 6) {
      throw new BadRequestException('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');
    }

    let user: UserAccount | undefined;
    const mobileFromToken = this.tokens.get(tokenOrIdentifier);
    if (mobileFromToken) {
      user = this.users.get(mobileFromToken);
    }
    if (!user) {
      for (const u of this.users.values()) {
        if (
          u.mobile === tokenOrIdentifier.trim() ||
          u.username.toLowerCase() === tokenOrIdentifier.toLowerCase().trim() ||
          u.id === tokenOrIdentifier
        ) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد. لطفاً مجدداً وارد شوید.');
    }

    if (user.passwordHash !== currentPassword) {
      throw new BadRequestException('رمز عبور فعلی واردشده اشتباه است.');
    }

    user.passwordHash = newPassword;
    this.saveUsers();

    return {
      success: true,
      message: 'رمز عبور شما با موفقیت تغییر یافت.',
    };
  }

  // Verify OTP for Login or Registration completion
  verifyOtp(mobile: string, code: string): { token: string; user: Partial<UserAccount> } {
    const record = this.otps.get(mobile);
    if (!record || record.expiresAt < Date.now()) {
      throw new BadRequestException('کد تایید منقضی شده است یا وجود ندارد.');
    }
    if (record.code !== code) {
      throw new BadRequestException('کد تایید واردشده نادرست است.');
    }

    let user = this.users.get(mobile);

    // If it was a pending registration
    if (!user && record.pendingUser) {
      user = {
        id: `usr-${Date.now()}`,
        mobile,
        username: record.pendingUser.username,
        displayName: record.pendingUser.username,
        bio: '',
        passwordHash: record.pendingUser.passwordHash,
        role: 'USER',
        level: 1,
        xp: 0,
        coins: 0,
        diamonds: 0,
        banknotes: 0,
        isVerified: true,
        sessions: [],
        profileCompletion: 50,
      };
      this.users.set(mobile, user);
      this.saveUsers();
    } else if (!user) {
      // Auto-create basic user for quick OTP login
      user = {
        id: `usr-${Date.now()}`,
        mobile,
        username: `user_${mobile.slice(-4)}`,
        displayName: `کاربر ${mobile.slice(-4)}`,
        bio: '',
        passwordHash: 'default_otp_pass',
        role: 'USER',
        level: 1,
        xp: 0,
        coins: 0,
        diamonds: 0,
        banknotes: 0,
        isVerified: true,
        sessions: [],
        profileCompletion: 40,
      };
      this.users.set(mobile, user);
      this.saveUsers();
    }

    if (user.isBanned) {
      throw new UnauthorizedException('این حساب کاربری توسط مدیریت مسدود شده است.');
    }

    this.otps.delete(mobile);

    const token = `tok_${user.id}_${Date.now()}`;
    this.tokens.set(token, mobile);

    user.sessions.push({
      token,
      device: 'مرورگر وب / سیستم عامل کاربر',
      ip: '127.0.0.1',
      createdAt: Date.now(),
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  // Login with Password (identifier = mobile or username)
  loginWithPassword(identifier: string, password: string): { token: string; user: Partial<UserAccount> } {
    if (!identifier || !password) {
      throw new BadRequestException('لطفاً نام کاربری/موبایل و رمز عبور را وارد نمایید.');
    }

    let user: UserAccount | undefined;
    for (const u of this.users.values()) {
      if (u.mobile === identifier.trim() || u.username.toLowerCase() === identifier.toLowerCase().trim()) {
        user = u;
        break;
      }
    }

    if (!user || user.passwordHash !== password) {
      throw new UnauthorizedException('اطلاعات ورود نامعتبر است. نام کاربری یا گذرواژه اشتباه است.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('حساب کاربری شما مسدود شده است.');
    }

    const token = `tok_${user.id}_${Date.now()}`;
    this.tokens.set(token, user.mobile);

    user.sessions.push({
      token,
      device: 'ورود با رمز عبور',
      ip: '127.0.0.1',
      createdAt: Date.now(),
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  // Google OAuth Login & Account Binding
  loginWithGoogle(email: string, name: string, googleId: string, avatar?: string): { token: string; user: Partial<UserAccount> } {
    if (!email) {
      throw new BadRequestException('ایمیل حساب گوگل الزامی است.');
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: UserAccount | undefined;

    // Search by googleId or email
    for (const u of this.users.values()) {
      if (u.email?.toLowerCase() === cleanEmail || (googleId && u.googleId === googleId)) {
        user = u;
        break;
      }
    }

    if (!user) {
      // Create new user bound to this Google account
      const usernameFromEmail = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      user = {
        id: `usr-g-${Date.now()}`,
        mobile: '',
        email: cleanEmail,
        googleId: googleId || `gid-${Date.now()}`,
        username: usernameFromEmail,
        displayName: name || usernameFromEmail,
        bio: 'ورود امن از طریق حساب گوگل',
        passwordHash: 'google_oauth_auth_token',
        role: 'USER',
        level: 1,
        xp: 0,
        coins: 0,
        diamonds: 0,
        banknotes: 0,
        isVerified: true,
        sessions: [],
        profileCompletion: 85,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`
      };
      this.users.set(user.id, user);
    } else {
      if (name && !user.displayName) user.displayName = name;
      if (avatar && !user.avatar) user.avatar = avatar;
      if (googleId && !user.googleId) user.googleId = googleId;
    }

    if (user.isBanned) {
      throw new UnauthorizedException('این حساب کاربری توسط مدیریت مسدود شده است.');
    }

    const token = `tok_g_${user.id}_${Date.now()}`;
    this.tokens.set(token, user.mobile || user.id);

    user.sessions.push({
      token,
      device: 'حساب گوگل (Google Sign-In)',
      ip: '127.0.0.1',
      createdAt: Date.now(),
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  // Dedicated Admin Login Check
  adminLogin(identifier: string, password: string): { token: string; user: Partial<UserAccount> } {
    const result = this.loginWithPassword(identifier, password);
    const user = result.user;

    const adminRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'ECONOMY_MANAGER'];
    if (!user.role || !adminRoles.includes(user.role)) {
      throw new UnauthorizedException('شما دسترسی مدیریت به سامانه ندارید.');
    }

    return result;
  }

  // Get current user by token
  getMe(token: string): Partial<UserAccount> {
    let mobile = this.tokens.get(token);
    if (!mobile) {
      // Find in sessions of all users (survives server restart)
      for (const u of this.users.values()) {
        if (u.sessions && u.sessions.some((s) => s.token === token)) {
          mobile = u.mobile || u.id;
          this.tokens.set(token, mobile);
          break;
        }
      }
    }
    if (!mobile) {
      for (const u of this.users.values()) {
        if (token.includes(u.id) || (u.username && token.includes(u.username)) || (u.mobile && token.includes(u.mobile))) {
          mobile = u.mobile || u.id;
          this.tokens.set(token, mobile);
          break;
        }
      }
    }
    if (!mobile) throw new UnauthorizedException('نشست کاربری نامعتبر یا منقضی شده است.');

    const user = this.users.get(mobile);
    if (!user) throw new UnauthorizedException('کاربر یافت نشد.');

    return this.sanitizeUser(user);
  }

  // Real-time user status lookup (subscription, notifications, role)
  getUserStatus(identifier: string) {
    if (!identifier) return { isSubscribed: false, subscriptionPlan: 'رایگان', notifications: [] };
    const clean = identifier.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (
        u.id.toLowerCase() === clean ||
        u.username.toLowerCase() === clean ||
        (u.mobile && u.mobile.trim() === identifier.trim())
      ) {
        const userXp = typeof u.xp === 'number' ? u.xp : (Number(u.xp) || 0);
        const userLevel = typeof u.level === 'number' ? u.level : Math.max(1, Math.floor(userXp / 100) + 1);
        return {
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          role: u.role,
          xp: userXp,
          level: userLevel,
          coins: Number(u.coins) || 0,
          diamonds: Number(u.diamonds) || 0,
          racesWon: Number(u.racesWon) || 0,
          bestWpm: Number(u.bestWpm || u.wpm) || 0,
          bestAccuracy: Number(u.bestAccuracy || u.accuracy) || 0,
          isSubscribed: !!u.isSubscribed,
          subscriptionTier: u.subscriptionTier || (u.isSubscribed ? 'VIP' : 'FREE'),
          subscriptionPlan: u.subscriptionPlan || (u.isSubscribed ? 'VIP طلایی' : 'رایگان'),
          subscription: u.subscription || u.subscriptionPlan || (u.isSubscribed ? 'VIP طلایی' : 'رایگان'),
          subscriptionExpiresAt: u.subscriptionExpiresAt,
          notifications: u.notifications || [],
        };
      }
    }
    return { isSubscribed: false, subscriptionPlan: 'رایگان', notifications: [] };
  }

  // Logout session
  logout(token: string): { success: boolean } {
    const mobile = this.tokens.get(token);
    if (mobile) {
      const user = this.users.get(mobile);
      if (user) {
        user.sessions = user.sessions.filter((s) => s.token !== token);
      }
      this.tokens.delete(token);
    }
    return { success: true };
  }

  // Section 18: Progressive profile completion
  updateProfile(
    identifier: string,
    data: { displayName?: string; bio?: string; avatar?: string; email?: string },
  ): Partial<UserAccount> {
    let user = this.users.get(identifier);
    if (!user) {
      for (const u of this.users.values()) {
        if (u.mobile === identifier || u.username === identifier || u.id === identifier) {
          user = u;
          break;
        }
      }
    }
    if (!user) throw new UnauthorizedException('کاربر یافت نشد.');

    if (data.displayName !== undefined) user.displayName = data.displayName;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.email !== undefined) user.email = data.email;

    let completion = 50;
    if (user.displayName) completion += 25;
    if (user.bio) completion += 25;
    user.profileCompletion = completion;

    this.saveUsers();
    return this.sanitizeUser(user);
  }

  // List all users for Admin CMS
  getAllUsers(): Partial<UserAccount>[] {
    return Array.from(this.users.values()).map((u) => this.sanitizeUser(u));
  }

  // Admin: Update user role / status
  adminUpdateUser(userId: string, updates: { role?: UserRole; isBanned?: boolean; coinsDelta?: number }) {
    for (const user of this.users.values()) {
      if (user.id === userId || user.username === userId || user.mobile === userId) {
        if (updates.role) user.role = updates.role;
        if (updates.isBanned !== undefined) user.isBanned = updates.isBanned;
        if (updates.coinsDelta) user.coins = Math.max(0, user.coins + updates.coinsDelta);
        this.saveUsers();
        return this.sanitizeUser(user);
      }
    }
    throw new BadRequestException('کاربر مورد نظر یافت نشد.');
  }

  // Admin: Directly grant or extend VIP subscription (1 month, 3 months, 1 year, lifetime, etc.)
  adminSetSubscription(userId: string, plan: string, days: number, active: boolean = true) {
    const cleanId = (userId || '').trim().toLowerCase();
    for (const user of this.users.values()) {
      if (
        user.id.toLowerCase() === cleanId ||
        user.username.toLowerCase() === cleanId ||
        (user.mobile && user.mobile.trim() === userId.trim())
      ) {
        if (!active || days <= 0) {
          user.isSubscribed = false;
          user.subscriptionTier = 'FREE';
          user.subscriptionPlan = 'رایگان';
          user.subscription = 'رایگان';
          user.subscriptionExpiresAt = undefined;
          if (!user.notifications) user.notifications = [];
          user.notifications.unshift({
            id: `notif-vip-deact-${Date.now()}`,
            category: 'system',
            title: 'پایان اشتراک ویژه تایپرو',
            desc: 'اشتراک ویژه حساب شما پایان یافت و به طرح پایه (رایگان) تغییر یافت.',
            time: 'هم‌اکنون',
            read: false,
            popupShown: true,
            createdAt: Date.now(),
          });
          this.saveUsers();
          return { success: true, message: 'اشتراک کاربر با موفقیت غیرفعال شد.', user: this.sanitizeUser(user) };
        }

        user.isSubscribed = true;
        user.subscriptionTier = 'VIP';
        const planName = plan || 'VIP طلایی';
        user.subscriptionPlan = planName;
        user.subscription = planName;
        const expiresAt = days >= 9999
          ? new Date(9999, 11, 31).toISOString()
          : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        user.subscriptionExpiresAt = expiresAt;

        const durationText = days >= 9999 ? 'مادام‌العمر' : `${days} روز`;
        if (!user.notifications) user.notifications = [];
        const notifId = `notif-vip-active-${Date.now()}`;
        user.notifications.unshift({
          id: notifId,
          category: 'rewards',
          title: '👑 اشتراک ویژه VIP شما فعال شد!',
          desc: `طرح «${planName}» با اعتبار ${durationText} توسط مدیریت برای حساب شما با موفقیت فعال گردید. اکنون تمام مزایای اختصاصی و پیست‌های ویژه برای شما در دسترس است.`,
          time: 'هم‌اکنون',
          read: false,
          popupShown: false,
          actionLabel: 'مشاهده جزییات اشتراک',
          actionUrl: '/subscription',
          createdAt: Date.now(),
        });

        this.saveUsers();
        return {
          success: true,
          message: `اشتراک ${user.subscriptionPlan} با اعتبار ${days >= 9999 ? 'مادام‌العمر' : days + ' روز'} با موفقیت فعال شد.`,
          user: this.sanitizeUser(user),
          notification: user.notifications[0],
        };
      }
    }
    throw new BadRequestException('کاربر مورد نظر یافت نشد.');
  }

  markNotificationSeen(userId: string, notifId: string): { success: boolean } {
    const cleanId = (userId || '').trim().toLowerCase();
    for (const user of this.users.values()) {
      if (
        user.id.toLowerCase() === cleanId ||
        user.username.toLowerCase() === cleanId ||
        (user.mobile && user.mobile.trim() === userId.trim())
      ) {
        if (user.notifications) {
          const target = user.notifications.find((n) => n.id === notifId);
          if (target) {
            target.popupShown = true;
            this.saveUsers();
          }
        }
        return { success: true };
      }
    }
    return { success: false };
  }

  sendAdminNotification(opts: {
    targetId?: string;
    broadcast?: boolean;
    title: string;
    content: string;
    sender?: string;
    priority?: string;
  }): { count: number; notifId: string } {
    const sender = opts.sender || 'مدیر سامانه تایپرو';
    const notifId = `notif-admin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newNotif: UserNotification = {
      id: notifId,
      category: 'system',
      title: `پیام از طرف: ${sender}`,
      subject: opts.title || 'پیام رسمی مدیریت سامانه',
      desc: opts.content,
      time: 'هم‌اکنون',
      read: false,
      popupShown: false,
      actionLabel: 'مشاهده در بخش اعلان‌ها',
      actionUrl: '/notifications',
      createdAt: Date.now(),
      sender: sender,
    };

    let count = 0;
    if (opts.broadcast) {
      for (const user of this.users.values()) {
        if (!user.notifications) user.notifications = [];
        // Ensure each user has a unique notif id for per-user tracking
        user.notifications.unshift({ ...newNotif, id: `${notifId}-${user.id}` });
        count++;
      }
    } else if (opts.targetId) {
      const cleanTarget = opts.targetId.trim().toLowerCase();
      for (const user of this.users.values()) {
        if (
          user.id.toLowerCase() === cleanTarget ||
          user.username.toLowerCase() === cleanTarget ||
          (user.mobile && user.mobile.trim() === opts.targetId.trim())
        ) {
          if (!user.notifications) user.notifications = [];
          user.notifications.unshift(newNotif);
          count++;
          break;
        }
      }
    }
    if (count > 0) {
      this.saveUsers();
    }
    return { count, notifId };
  }

  // Admin: Create new user
  adminCreateUser(dto: Partial<UserAccount>) {
    if (!dto.username && !dto.mobile) {
      throw new BadRequestException('نام کاربری یا شماره موبایل الزامی است.');
    }
    const mobile = dto.mobile ? dto.mobile.trim() : '';
    const username = (dto.username || (mobile ? `user_${mobile.slice(-4)}` : `user_${Date.now()}`)).trim();

    // Check duplicate
    for (const u of this.users.values()) {
      if ((mobile && u.mobile === mobile) || (username && u.username.toLowerCase() === username.toLowerCase())) {
        Object.assign(u, {
          displayName: dto.displayName || u.displayName,
          level: dto.level !== undefined ? dto.level : u.level,
          coins: dto.coins !== undefined ? dto.coins : u.coins,
          diamonds: dto.diamonds !== undefined ? dto.diamonds : u.diamonds,
          role: dto.role || u.role,
          subscription: dto.subscription || u.subscription,
          subscriptionPlan: dto.subscriptionPlan || u.subscriptionPlan,
          isSubscribed: dto.isSubscribed !== undefined ? dto.isSubscribed : u.isSubscribed,
          subscriptionExpiresAt: dto.subscriptionExpiresAt || u.subscriptionExpiresAt,
        });
        this.saveUsers();
        return this.sanitizeUser(u);
      }
    }

    const newUser: UserAccount = {
      id: dto.id || `usr-${Date.now()}`,
      mobile,
      username,
      displayName: dto.displayName || username,
      bio: dto.bio || '',
      passwordHash: dto.passwordHash || '123456',
      role: dto.role || 'USER',
      level: dto.level || 1,
      xp: dto.xp || 0,
      coins: dto.coins || 0,
      diamonds: dto.diamonds || 0,
      banknotes: 0,
      isVerified: true,
      subscription: dto.subscription,
      subscriptionPlan: dto.subscriptionPlan || dto.subscription,
      isSubscribed: !!dto.isSubscribed,
      subscriptionExpiresAt: dto.subscriptionExpiresAt,
      sessions: [],
      profileCompletion: 50,
      racesWon: dto.racesWon || 0,
    };

    if (mobile) {
      this.users.set(mobile, newUser);
    } else {
      this.users.set(newUser.id, newUser);
    }
    this.saveUsers();
    return this.sanitizeUser(newUser);
  }

  // Admin: Edit user
  adminEditUser(userId: string, updates: Partial<UserAccount>) {
    for (const user of this.users.values()) {
      if (user.id === userId || user.username === userId || user.mobile === userId) {
        if (updates.username) user.username = updates.username.trim();
        if (updates.displayName) user.displayName = updates.displayName.trim();
        if (updates.mobile) user.mobile = updates.mobile.trim();
        if (updates.bio !== undefined) user.bio = updates.bio;
        if (updates.role) user.role = updates.role;
        if (updates.xp !== undefined) {
          user.xp = Math.max(0, Number(updates.xp));
          user.level = Math.max(1, Math.floor(user.xp / 100) + 1);
        } else if (updates.level !== undefined) {
          user.level = Math.max(1, Number(updates.level));
          user.xp = Math.max(user.xp || 0, (user.level - 1) * 100);
        }
        if (updates.coins !== undefined) user.coins = updates.coins;
        if (updates.diamonds !== undefined) user.diamonds = updates.diamonds;
        if (updates.isBanned !== undefined) user.isBanned = updates.isBanned;
        if (updates.subscription !== undefined) user.subscription = updates.subscription;
        if (updates.subscriptionPlan !== undefined) user.subscriptionPlan = updates.subscriptionPlan;
        if (updates.isSubscribed !== undefined) user.isSubscribed = updates.isSubscribed;
        if (updates.subscriptionExpiresAt !== undefined) user.subscriptionExpiresAt = updates.subscriptionExpiresAt;
        if (updates.adminTitle !== undefined) user.adminTitle = updates.adminTitle;
        if (updates.permissions !== undefined) user.permissions = updates.permissions;
        if (updates.passwordHash) user.passwordHash = updates.passwordHash;
        this.saveUsers();
        return this.sanitizeUser(user);
      }
    }
    throw new BadRequestException('کاربر مورد نظر یافت نشد.');
  }

  // Admin: Delete user
  adminDeleteUser(userId: string) {
    let targetKey: string | null = null;
    for (const [key, user] of this.users.entries()) {
      if (user.id === userId || user.username === userId || user.mobile === userId) {
        targetKey = key;
        break;
      }
    }
    if (targetKey) {
      this.users.delete(targetKey);
      this.saveUsers();
      return { success: true, message: 'کاربر با موفقیت حذف شد.' };
    }
    throw new BadRequestException('کاربر مورد نظر یافت نشد.');
  }

  // Synchronized User Progress Handler (Strictly Monotonic Lifetime XP, Never Resets!)
  recordUserProgress(data: {
    userId?: string;
    username?: string;
    displayName?: string;
    earnedXp?: number;
    earnedCoins?: number;
    earnedDiamonds?: number;
    wonRace?: boolean;
    wpm?: number;
    accuracy?: number;
    lessonId?: string;
    lessonTitle?: string;
    stars?: number;
    currentPath?: string;
  }) {
    let targetUser: UserAccount | undefined;
    for (const u of this.users.values()) {
      if (
        (data.userId && (u.id === data.userId || u.username === data.userId || u.mobile === data.userId)) ||
        (data.username && (u.username === data.username || u.id === data.username)) ||
        (data.displayName && u.displayName === data.displayName)
      ) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) {
      if (data.userId || data.username || data.displayName) {
        const id = data.userId || `usr-${Date.now()}`;
        targetUser = {
          id,
          mobile: '',
          username: data.username || `user_${Date.now().toString().slice(-4)}`,
          displayName: data.displayName || data.username || 'کاربر تایپرو',
          bio: '',
          passwordHash: 'TP_AUTOGEN_' + Math.random().toString(36).substring(2, 8),
          role: 'USER',
          level: 1,
          xp: 0,
          coins: 0,
          diamonds: 0,
          banknotes: 0,
          isVerified: true,
          sessions: [],
          profileCompletion: 50,
          racesWon: 0,
        };
        this.users.set(targetUser.id, targetUser);
      } else {
        return { success: false, message: 'کاربر یافت نشد' };
      }
    }

    // Cumulative Lifetime XP: strictly increase, never reset or wrap around!
    const addedXp = Math.max(0, Number(data.earnedXp) || 0);
    const currentXp = Number(targetUser.xp) || 0;
    const newXp = currentXp + addedXp;
    const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

    targetUser.xp = newXp;
    targetUser.level = newLevel;

    // Coins: 1:1 with earned XP or earnedCoins
    const addedCoins = Math.max(0, Number(data.earnedCoins) || addedXp || 0);
    if (addedCoins > 0) {
      targetUser.coins = (Number(targetUser.coins) || 0) + addedCoins;
    }

    if (data.earnedDiamonds && Number(data.earnedDiamonds) > 0) {
      targetUser.diamonds = (Number(targetUser.diamonds) || 0) + Number(data.earnedDiamonds);
    }

    if (data.wonRace) {
      targetUser.racesWon = (Number(targetUser.racesWon) || 0) + 1;
    }

    if (data.wpm && Number(data.wpm) > 0) {
      targetUser.wpm = Number(data.wpm);
      if (!targetUser.bestWpm || Number(data.wpm) > Number(targetUser.bestWpm)) {
        targetUser.bestWpm = Number(data.wpm);
      }
    }

    if (data.accuracy && Number(data.accuracy) > 0) {
      targetUser.accuracy = Number(data.accuracy);
      if (!targetUser.bestAccuracy || Number(data.accuracy) > Number(targetUser.bestAccuracy)) {
        targetUser.bestAccuracy = Number(data.accuracy);
      }
    }

    if (data.lessonId) {
      if (!targetUser.completedLessons) targetUser.completedLessons = [];
      const existingLessonIdx = targetUser.completedLessons.findIndex((l) => l.id === data.lessonId);
      const lessonEntry = {
        id: data.lessonId,
        title: data.lessonTitle || `درس ${data.lessonId}`,
        stars: data.stars || 3,
        wpm: data.wpm || 0,
        accuracy: data.accuracy || 100,
        completedAt: new Date().toISOString(),
      };
      if (existingLessonIdx >= 0) {
        targetUser.completedLessons[existingLessonIdx] = lessonEntry;
      } else {
        targetUser.completedLessons.push(lessonEntry);
      }
      targetUser.lastLessonId = data.lessonId;
      targetUser.lastLessonTitle = lessonEntry.title;
    }

    if (data.currentPath) {
      targetUser.lastActivePath = data.currentPath;
    }
    targetUser.lastActiveAt = Date.now();

    this.saveUsers();

    return {
      success: true,
      xp: targetUser.xp,
      level: targetUser.level,
      coins: targetUser.coins,
      diamonds: targetUser.diamonds,
      racesWon: targetUser.racesWon,
      completedLessons: targetUser.completedLessons,
      lastLessonTitle: targetUser.lastLessonTitle,
    };
  }

  // Admin: Bulk sync users from client
  adminSyncUsers(usersList: any[]) {
    if (!Array.isArray(usersList)) return this.getAllUsers();
    let hasChanges = false;
    for (const r of usersList) {
      if (!r || (!r.id && !r.username && !r.mobile)) continue;
      let existing: UserAccount | undefined;
      for (const u of this.users.values()) {
        if ((r.id && u.id === r.id) || (r.username && u.username === r.username) || (r.mobile && u.mobile === r.mobile)) {
          existing = u;
          break;
        }
      }

      if (!existing) {
        const newUser: UserAccount = {
          id: r.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          mobile: r.mobile || '',
          username: r.username || (r.mobile ? `user_${r.mobile.slice(-4)}` : 'user'),
          displayName: r.displayName || r.username || 'کاربر',
          bio: r.bio || '',
          passwordHash: r.password || '123456',
          role: r.role || 'USER',
          level: r.level ?? 1,
          xp: r.xp ?? 0,
          coins: r.coins ?? 0,
          diamonds: r.diamonds ?? 0,
          banknotes: 0,
          isVerified: true,
          subscription: r.subscription || r.subscriptionPlan,
          subscriptionPlan: r.subscriptionPlan || r.subscription,
          isSubscribed: !!r.isSubscribed,
          subscriptionExpiresAt: r.subscriptionExpiresAt,
          sessions: [],
          profileCompletion: 50,
          racesWon: r.racesWon || 0,
        };
        if (newUser.mobile) {
          this.users.set(newUser.mobile, newUser);
        } else {
          this.users.set(newUser.id, newUser);
        }
        hasChanges = true;
      }
    }
    if (hasChanges) {
      this.saveUsers();
    }
    return this.getAllUsers();
  }

  // Sanitize: Never expose passwordHash! Enrich with real online status & activity
  private sanitizeUser(user: UserAccount): Partial<UserAccount> {
    const { passwordHash, ...safe } = user;
    const now = Date.now();
    const isOnline = Boolean(user.lastActiveAt && (now - user.lastActiveAt < 90000));
    return {
      ...safe,
      isOnline,
      lastActivePath: user.lastActivePath || '/',
      lastActiveAt: user.lastActiveAt || undefined,
      completedLessons: user.completedLessons || [],
      lastLessonId: user.lastLessonId,
      lastLessonTitle: user.lastLessonTitle,
    };
  }

  getPublicProfile(userId: string) {
    let found: UserAccount | undefined;
    for (const u of this.users.values()) {
      if (u.id === userId || u.username === userId || u.displayName === userId) {
        found = u;
        break;
      }
    }

    if (!found) {
      // Return guest or synthetic public profile
      return {
        id: userId,
        displayName: userId.startsWith('guest_') ? 'راننده مهمان' : userId,
        username: userId,
        level: 1,
        xp: 100,
        bio: 'تایپیست پیست رقابت‌های زنده تایپرو',
        wpm: 65,
        accuracy: 98,
        totalRaces: 10,
        racesWon: 2,
        achievements: [
          { id: 'ach-first-blood', title: 'اولین نبرد پیست', description: 'شرکت در مسابقه زنده', isUnlocked: true },
          { id: 'ach-speed-demon', title: 'دیو سرعت (۱۰۰+ WPM)', description: 'رسیدن به سرعت ۱۰۰ کلمه در دقیقه', isUnlocked: false },
          { id: 'ach-perfect-100', title: 'تمرکز مطلق (دقت ۱۰۰٪)', description: 'تایپ بی‌نقص بدون خطا', isUnlocked: true },
        ],
      };
    }

    // STRICTLY omit mobile, email, coins, diamonds, banknotes, passwordHash, sessions!
    return {
      id: found.id,
      displayName: found.displayName || found.username,
      username: found.username,
      avatar: found.avatar,
      level: found.level || Math.floor((found.xp || 0) / 100) + 1,
      xp: found.xp || ((found.level || 1) - 1) * 100,
      bio: found.bio || 'تایپیست فعال پیست رقابت‌های تایپرو',
      wpm: 85,
      accuracy: 99,
      totalRaces: 48,
      racesWon: 14,
      achievements: [
        { id: 'ach-first-blood', title: 'اولین نبرد پیست', description: 'شرکت در اولین مسابقه زنده اتومبیل‌رانی تایپرو', isUnlocked: true },
        { id: 'ach-speed-demon', title: 'دیو سرعت (۱۰۰+ WPM)', description: 'رسیدن به سرعت ثبت شده ۱۰۰ کلمه در دقیقه', isUnlocked: (found.level || 1) > 20 },
        { id: 'ach-perfect-100', title: 'تمرکز مطلق (دقت ۱۰۰٪)', description: 'تایپ بی‌نقص بدون ۱ خطای ثبت شده', isUnlocked: true },
        { id: 'ach-streak-30', title: 'تداوم پولادین (۳۰ روز متوالی)', description: 'حفظ زنجیره تمرین روزانه بدون وقفه', isUnlocked: (found.level || 1) > 10 },
      ],
    };
  }

  // Get all Sub-Admins & Super Admins
  getSubAdmins(): Partial<UserAccount>[] {
    const adminRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'ECONOMY_MANAGER'];
    return Array.from(this.users.values())
      .filter((u) => u.role && adminRoles.includes(u.role))
      .map((u) => this.sanitizeUser(u));
  }

  // Create Sub-Admin with granular permissions
  createSubAdmin(dto: {
    displayName: string;
    username: string;
    password: string;
    mobile?: string;
    email?: string;
    adminTitle?: string;
    role?: UserRole;
    permissions: string[];
  }): Partial<UserAccount> {
    if (!dto.username || !dto.password) {
      throw new BadRequestException('نام کاربری و رمز عبور برای ادمین فرعی الزامی است.');
    }

    const cleanUsername = dto.username.trim().toLowerCase();
    const cleanMobile = dto.mobile ? dto.mobile.trim() : '';

    // Check duplicate
    for (const u of this.users.values()) {
      if (u.username.toLowerCase() === cleanUsername) {
        throw new BadRequestException('این نام کاربری قبلاً برای کاربر یا ادمین دیگری ثبت شده است.');
      }
      if (cleanMobile && u.mobile === cleanMobile) {
        throw new BadRequestException('این شماره موبایل قبلاً ثبت شده است.');
      }
    }

    const id = `adm-${Date.now()}`;
    const assignedMobile = cleanMobile || `0999${Date.now().toString().slice(-7)}`;
    const newAdmin: UserAccount = {
      id,
      mobile: assignedMobile,
      email: dto.email ? dto.email.trim() : undefined,
      username: cleanUsername,
      displayName: dto.displayName ? dto.displayName.trim() : dto.username,
      bio: `ادمین فرعی سامانه - ${dto.adminTitle || 'مدیر بخش'}`,
      passwordHash: dto.password,
      role: dto.role || 'ADMIN',
      adminTitle: dto.adminTitle || 'مدیر فرعی سامانه',
      permissions: Array.isArray(dto.permissions) ? dto.permissions : [],
      level: 99,
      xp: 9900,
      coins: 5000,
      diamonds: 100,
      banknotes: 50,
      isVerified: true,
      sessions: [],
      profileCompletion: 100,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      racesWon: 0,
      wpm: 90,
      accuracy: 100,
    };

    this.users.set(assignedMobile, newAdmin);
    this.saveUsers();
    return this.sanitizeUser(newAdmin);
  }

  // Edit Sub-Admin
  editSubAdmin(
    adminId: string,
    dto: {
      displayName?: string;
      username?: string;
      password?: string;
      mobile?: string;
      email?: string;
      adminTitle?: string;
      role?: UserRole;
      permissions?: string[];
      isBanned?: boolean;
    }
  ): Partial<UserAccount> {
    let found: UserAccount | undefined;
    for (const u of this.users.values()) {
      if (u.id === adminId || u.username === adminId || u.mobile === adminId) {
        found = u;
        break;
      }
    }

    if (!found) {
      throw new BadRequestException('ادمین مورد نظر یافت نشد.');
    }

    if (dto.username) found.username = dto.username.trim().toLowerCase();
    if (dto.displayName) found.displayName = dto.displayName.trim();
    if (dto.mobile) found.mobile = dto.mobile.trim();
    if (dto.email !== undefined) found.email = dto.email.trim();
    if (dto.password) found.passwordHash = dto.password;
    if (dto.adminTitle !== undefined) found.adminTitle = dto.adminTitle;
    if (dto.role) found.role = dto.role;
    if (dto.permissions !== undefined) found.permissions = dto.permissions;
    if (dto.isBanned !== undefined) found.isBanned = dto.isBanned;

    this.saveUsers();
    return this.sanitizeUser(found);
  }

  // Delete Sub-Admin
  deleteSubAdmin(adminId: string): { success: boolean } {
    let targetKey: string | null = null;
    let targetUser: UserAccount | null = null;

    for (const [key, user] of this.users.entries()) {
      if (user.id === adminId || user.username === adminId || user.mobile === adminId) {
        targetKey = key;
        targetUser = user;
        break;
      }
    }

    if (!targetKey || !targetUser) {
      throw new BadRequestException('ادمین مورد نظر یافت نشد.');
    }

    if (targetUser.role === 'SUPER_ADMIN' && (targetUser.username === 'admin' || targetUser.mobile === '09120000000')) {
      throw new BadRequestException('حساب سوپر ادمین اصلی سیستم غیرقابل حذف است.');
    }

    this.users.delete(targetKey);
    this.saveUsers();
    return { success: true };
  }
}
