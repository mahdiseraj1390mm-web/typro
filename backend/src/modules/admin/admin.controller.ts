import { Controller, Get, Put, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { AdminService, SubscriptionReceipt } from './admin.service';
import { AuthService } from '../auth/auth.service';

@Controller(['admin', 'api/admin'])
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Post('track-visit')
  trackVisit(
    @Req() req: any,
    @Body() body: { path?: string; userId?: string; visitorId?: string; sessionId?: string; referrer?: string },
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfIp = req.headers['cf-connecting-ip'];
    const ip = (typeof cfIp === 'string' && cfIp.trim()) ||
      (typeof realIp === 'string' && realIp.trim()) ||
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'مرورگر کاربر';
    return this.adminService.recordVisit(
      ip,
      userAgent,
      body?.path,
      body?.userId,
      body?.visitorId,
      body?.sessionId,
      body?.referrer,
    );
  }

  @Get('realtime-stats')
  getRealtimeStats() {
    return this.adminService.getRealtimeStats();
  }

  @Get('platform-stats')
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Post('platform-stats')
  savePlatformStats(@Body() body: any) {
    return this.adminService.saveCustomPlatformStats(body);
  }

  @Post('platform-stats/sync-real')
  syncRealPlatformStats() {
    return this.adminService.computeRealPlatformStats();
  }

  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() body: any) {
    return this.authService.adminCreateUser(body);
  }

  @Put('users/:id')
  editUser(@Param('id') userId: string, @Body() body: any) {
    return this.authService.adminEditUser(userId, body);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') userId: string) {
    return this.authService.adminDeleteUser(userId);
  }

  @Post('sync-users')
  syncUsers(@Body('users') users: any[]) {
    return this.authService.adminSyncUsers(users);
  }

  @Put('users/:id/subscription')
  updateSubscription(
    @Param('id') userId: string,
    @Body() body: { plan?: string; days?: number; active?: boolean },
  ) {
    return this.authService.adminSetSubscription(
      userId,
      body.plan || 'VIP طلایی',
      body.days ?? 30,
      body.active ?? true,
    );
  }

  // Subscription receipts submitted by users
  @Post('subscriptions/receipt')
  submitReceipt(@Body() body: Partial<SubscriptionReceipt>) {
    return this.adminService.submitReceipt(body);
  }

  @Get('subscriptions/receipts')
  getReceipts() {
    return this.adminService.getReceipts();
  }

  @Put('subscriptions/receipts/:id/status')
  updateReceiptStatus(
    @Param('id') receiptId: string,
    @Body() body: { status: 'approved' | 'rejected'; rejectionReason?: string },
  ) {
    return this.adminService.updateReceiptStatus(receiptId, body.status, body.rejectionReason);
  }

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('rooms/monitor')
  getRoomsMonitor() {
    return this.adminService.getActiveRoomsMonitoring();
  }

  // Content Management: Texts for Live Races and Typing Tests
  @Get('texts')
  getCustomTexts() {
    return this.adminService.getCustomTexts();
  }

  @Post('texts/race')
  addCustomRaceText(
    @Body() body: { roomId: string; title: string; category?: string; text: string; createdByName?: string }
  ) {
    return this.adminService.addCustomRaceText(body);
  }

  @Delete('texts/race/:id')
  deleteCustomRaceText(@Param('id') id: string) {
    return this.adminService.deleteCustomRaceText(id);
  }

  @Post('texts/typing')
  addCustomTypingText(
    @Body() body: { title: string; category?: string; difficulty?: 'آسان' | 'متوسط' | 'سخت'; text: string; createdByName?: string }
  ) {
    return this.adminService.addCustomTypingText(body);
  }

  @Delete('texts/typing/:id')
  deleteCustomTypingText(@Param('id') id: string) {
    return this.adminService.deleteCustomTypingText(id);
  }

  // Admin Messages & Broadcast System
  @Get('messages')
  getAdminMessages() {
    return this.adminService.getAdminMessages();
  }

  @Post('messages')
  sendAdminMessage(@Body() body: any) {
    return this.adminService.sendAdminMessage(body);
  }

  @Delete('messages/:id')
  deleteAdminMessage(@Param('id') id: string) {
    return this.adminService.deleteAdminMessage(id);
  }

  @Get('active-broadcast')
  getActiveBroadcast() {
    return this.adminService.getLatestBroadcast();
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body('actor') actor: string, @Body('updates') updates: any) {
    return this.adminService.updateSettings(actor || 'Admin', updates);
  }

  // Sub-Admins Management & Granular RBAC Permissions
  @Get('sub-admins')
  getSubAdmins() {
    return this.authService.getSubAdmins();
  }

  @Post('sub-admins')
  createSubAdmin(@Body() body: any) {
    return this.authService.createSubAdmin(body);
  }

  @Put('sub-admins/:id')
  editSubAdmin(@Param('id') adminId: string, @Body() body: any) {
    return this.authService.editSubAdmin(adminId, body);
  }

  @Delete('sub-admins/:id')
  deleteSubAdmin(@Param('id') adminId: string) {
    return this.authService.deleteSubAdmin(adminId);
  }

  @Get('permissions-list')
  getPermissionsList() {
    return [
      // 1. پیشخوان و آمار
      { id: 'dashboard.view', module: 'dashboard', moduleFa: 'پیشخوان کلان', name: 'مشاهده آمار و نمودارها', desc: 'مشاهده آمار لحظه‌ای، بازدیدها و نمودار ترافیک' },
      { id: 'dashboard.export', module: 'dashboard', moduleFa: 'پیشخوان کلان', name: 'خروجی گزارش‌ها', desc: 'دریافت خروجی گزارش‌های تحلیلی و اکسل' },

      // 2. کاربران و امنیت
      { id: 'users.view', module: 'users', moduleFa: 'کاربران و امنیت', name: 'مشاهده فهرست کاربران', desc: 'مشاهده مشخصات هویتی و سوابق کاربران' },
      { id: 'users.create', module: 'users', moduleFa: 'کاربران و امنیت', name: 'افزودن کاربر جدید', desc: 'ثبت کاربر عادی به صورت دستی' },
      { id: 'users.edit', module: 'users', moduleFa: 'کاربران و امنیت', name: 'ویرایش مشخصات و لول', desc: 'تغییر نام، شماره، لول، سکه و اطلاعات کاربر' },
      { id: 'users.ban', module: 'users', moduleFa: 'کاربران و امنیت', name: 'مسدودسازی کاربر (Ban)', desc: 'توقیف و غیرفعال‌سازی دسترسی کاربران متخلف' },
      { id: 'users.delete', module: 'users', moduleFa: 'کاربران و امنیت', name: 'حذف کاربر', desc: 'حذف دائمی کاربر از پایگاه‌داده' },

      // 3. ادمین‌های فرعی و سطوح دسترسی (RBAC)
      { id: 'roles.view', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'مشاهده ادمین‌ها و دسترسی‌ها', desc: 'مشاهده فهرست مدیران فرعی و مجوزها' },
      { id: 'roles.create', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'افزودن ادمین فرعی جدید', desc: 'تعریف ادمین جدید با نام کاربری، رمز و سطح دسترسی' },
      { id: 'roles.edit', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'ویرایش مجوزها و رمز عبور ادمین', desc: 'تغییر سطح دسترسی‌ها و ریست پسورد ادمین‌های فرعی' },
      { id: 'roles.delete', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'حذف یا عزل ادمین', desc: 'خلع درجه یا حذف حساب ادمین فرعی' },

      // 4. سفارشات تایپ و مبالغ امانی (Escrow)
      { id: 'orders.view', module: 'orders', moduleFa: 'سفارش‌ها و پروژه‌های امانی', name: 'مشاهده سفارش‌ها', desc: 'بررسی پروژه‌های تایپ و قراردادها' },
      { id: 'orders.status', module: 'orders', moduleFa: 'سفارش‌ها و پروژه‌های امانی', name: 'تغییر وضعیت سفارش', desc: 'تایید، رد یا خاتمه سفارشات' },
      { id: 'orders.escrow', module: 'orders', moduleFa: 'سفارش‌ها و پروژه‌های امانی', name: 'تسویه وجوه امانی', desc: 'آزادسازی و تسویه مبالغ امانی مجریان' },

      // 5. مسابقات و اتاق‌های زنده (Live Races)
      { id: 'races.view', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'مشاهده پیست‌ها و اتاق‌ها', desc: 'پایش وضعیت زنده سرورها و مسابقات' },
      { id: 'races.create', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'ایجاد پیست مسابقه', desc: 'تعریف اتاق یا سرور رقابتی جدید' },
      { id: 'races.manage', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'مدیریت و تنظیمات پیست', desc: 'تغییر متون، زمان دورها و ریستارت اتاق' },
      { id: 'races.referee', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'داوری زنده و مداخله', desc: 'اخراج رانندگان متخلف و رفع اشکال مسابقه' },

      // 6. دروس و آکادمی تایپ
      { id: 'lessons.view', module: 'lessons', moduleFa: 'دروس و آکادمی تایپ', name: 'مشاهده ساختار دروس', desc: 'مشاهده متدها و تمرین‌های آموزشی' },
      { id: 'lessons.edit', module: 'lessons', moduleFa: 'دروس و آکادمی تایپ', name: 'ویرایش و افزودن دروس', desc: 'طراحی مراحل، متون تمرین و کلیدهای آکادمی' },

      // 7. محتوای متنی و قرآن CMS
      { id: 'content.view', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'مشاهده بانک متون و قرآن', desc: 'بررسی متون تست تایپ و سوره‌های قرآن' },
      { id: 'content.edit', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'افزودن و ویرایش متون و آیات', desc: 'ورود متون جدید، تصحیح اعراب و اشعار' },
      { id: 'content.texts.race', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'افزودن و مدیریت متون مسابقه زنده', desc: 'امکان افزودن، ویرایش و حذف متون اتاق‌های مسابقه زنده اتومبیل‌رانی' },
      { id: 'content.texts.typing', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'افزودن و مدیریت متون تست تایپ', desc: 'امکان افزودن، ویرایش و حذف متون سامانه تست تایپ و رکوردگیری' },

      // 8. بازی‌ها و سرگرمی
      { id: 'games.view', module: 'games', moduleFa: 'بازی‌ها و سرگرمی', name: 'مشاهده فهرست بازی‌ها', desc: 'بررسی وضعیت بازی‌های مهارتی تایپ' },
      { id: 'games.manage', module: 'games', moduleFa: 'بازی‌ها و سرگرمی', name: 'تنظیمات و جوایز بازی‌ها', desc: 'فعال/غیرفعال‌سازی بازی‌ها و ضریب امتیازات' },

      // 9. تورنمنت‌ها و براکت‌ها
      { id: 'tournaments.view', module: 'tournaments', moduleFa: 'تورنمنت‌ها و لیگ‌ها', name: 'مشاهده تورنمنت‌ها', desc: 'مشاهده براکت‌ها، بازیکنان و جوایز هفتگی' },
      { id: 'tournaments.manage', module: 'tournaments', moduleFa: 'تورنمنت‌ها و لیگ‌ها', name: 'برگزاری و قرعه‌کشی تورنمنت', desc: 'زمان‌بندی، ثبت برندگان و اهداء مدال‌ها' },

      // 10. اقتصاد، سکه و اسکین‌ها
      { id: 'economy.view', module: 'economy', moduleFa: 'اقتصاد و اسکین‌ها', name: 'مشاهده تراز اقتصادی', desc: 'بررسی گردش سکه، الماس و خریدها' },

      // 11. پیام‌رسانی و اعلان‌های رسمی
      { id: 'messages.manage', module: 'communication', moduleFa: 'پیام‌رسانی و اعلان‌ها', name: 'ارسال پیام سراسری و خصوصی', desc: 'امکان ارسال پیام رسمی مدیریت به همه کاربران یا کاربر خاص با نمایش پاپ‌آپ' },
      { id: 'economy.adjust', module: 'economy', moduleFa: 'اقتصاد و اسکین‌ها', name: 'شارژ و کسر ارز بازی', desc: 'افزودن یا کسر دستی سکه و الماس به کاربران' },
      { id: 'economy.skins', module: 'economy', moduleFa: 'اقتصاد و اسکین‌ها', name: 'مدیریت و قیمت‌گذاری اسکین‌ها', desc: 'افزودن و تغییر قیمت خودروها و موتورها' },

      // 11. جوایز و صندوق‌ها
      { id: 'rewards.view', module: 'rewards', moduleFa: 'جوایز و صندوق‌ها', name: 'مشاهده سیستم پاداش', desc: 'مشاهده جوایز روزانه و لاگین' },
      { id: 'rewards.manage', module: 'rewards', moduleFa: 'جوایز و صندوق‌ها', name: 'تنظیم شانس گردونه و هدایا', desc: 'تغییر شانس آیتم‌های گردونه و صندوق‌های جوایز' },

      // 12. اشتراک‌ها و فیش‌های بانکی
      { id: 'subscriptions.view', module: 'subscriptions', moduleFa: 'اشتراک‌ها و فیش‌ها', name: 'مشاهده پلن‌ها و فیش‌های ارسالی', desc: 'بررسی درخواست‌های خرید اشتراک VIP' },
      { id: 'subscriptions.approve', module: 'subscriptions', moduleFa: 'اشتراک‌ها و فیش‌ها', name: 'تایید یا رد فیش‌های بانکی', desc: 'بررسی رسید کارت‌به‌کارت و فعال‌سازی اکانت' },
      { id: 'subscriptions.manage', module: 'subscriptions', moduleFa: 'اشتراک‌ها و فیش‌ها', name: 'اعطای دستی اشتراک VIP', desc: 'تخصیص یا لغو اشتراک طلایی به کاربران' },

      // 13. مرکز فرماندهی سئو
      { id: 'seo.view', module: 'seo', moduleFa: 'سئو و رتبه گوگل', name: 'مشاهده داشبورد سئو', desc: 'مشاهده متاتگ‌ها و کلمات کلیدی' },
      { id: 'seo.edit', module: 'seo', moduleFa: 'سئو و رتبه گوگل', name: 'مدیریت تگ‌ها و سایت‌مپ', desc: 'ویرایش ساختار سئو و توضیحات موتورهای جستجو' },

      // 14. نظارت بر چت‌ها
      { id: 'chat.view', module: 'chat', moduleFa: 'نظارت بر چت‌ها', name: 'مشاهده لاگ پیام‌های چت', desc: 'بررسی گفتگوی لابی و مسابقات زنده' },
      { id: 'chat.moderate', module: 'chat', moduleFa: 'نظارت بر چت‌ها', name: 'مدیریت پیام و مسدودسازی چت', desc: 'حذف پیام نامناسب و بستن چت کاربر' },

      // 15. لاگ‌های امنیتی و ممیزی
      { id: 'audit.view', module: 'audit', moduleFa: 'لاگ‌های امنیتی و ممیزی', name: 'مشاهده لاگ‌های امنیتی', desc: 'بررسی ردپای تغییرات و ورودهای مدیریتی' },

      // 16. پشتیبان‌گیری و دیتابیس
      { id: 'backup.manage', module: 'backup', moduleFa: 'پشتیبان‌گیری و دیتابیس', name: 'پشتیبان‌گیری و بازیابی', desc: 'ایجاد نسخه پشتیبان یا بازگردانی فایل‌های دیتابیس' },
    ];
  }
}
