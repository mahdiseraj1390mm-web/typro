import { Controller, Post, Body, Put, Get, Param, Headers, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService, UserRole } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('heartbeat')
  heartbeat(@Req() req: any, @Body('clientId') clientId?: string) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || '127.0.0.1';
    const id = clientId || `${ip}`;
    return { onlineCount: this.authService.recordHeartbeat(id) };
  }

  @Get('online-count')
  getOnlineCount() {
    return this.authService.getOnlineCount();
  }

  @Post('otp/request')
  requestOtp(@Body('mobile') mobile: string) {
    return this.authService.requestOtp(mobile);
  }

  @Post('otp/verify')
  verifyOtp(
    @Body('mobile') mobile: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyOtp(mobile, code);
  }

  @Post('register/init')
  registerInit(
    @Body('mobile') mobile: string,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.registerInit(mobile, username, password);
  }

  @Post('forgot-password')
  forgotPassword(@Body('mobile') mobile: string) {
    return this.authService.forgotPassword(mobile);
  }

  @Post('login')
  loginWithPassword(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
  ) {
    return this.authService.loginWithPassword(identifier, password);
  }

  @Post('admin/login')
  adminLogin(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
  ) {
    return this.authService.adminLogin(identifier, password);
  }

  @Post('google')
  loginWithGoogle(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('googleId') googleId: string,
    @Body('avatar') avatar?: string,
  ) {
    return this.authService.loginWithGoogle(email, name, googleId, avatar);
  }

  @Get('me')
  getMe(@Headers('authorization') authHeader?: string) {
    if (!authHeader) throw new UnauthorizedException('توکن احراز هویت الزامی است.');
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return this.authService.getMe(token);
  }

  @Get('status/:identifier')
  getUserStatus(@Param('identifier') identifier: string) {
    return this.authService.getUserStatus(identifier);
  }

  @Put('notifications/:userId/:notifId/seen')
  markNotificationSeen(
    @Param('userId') userId: string,
    @Param('notifId') notifId: string,
  ) {
    return this.authService.markNotificationSeen(userId, notifId);
  }

  @Post('logout')
  logout(@Headers('authorization') authHeader?: string) {
    if (!authHeader) return { success: true };
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return this.authService.logout(token);
  }

  @Post('change-password')
  changePassword(
    @Headers('authorization') authHeader: string | undefined,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('identifier') identifier?: string,
  ) {
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
    const tokenOrId = token || identifier || '';
    return this.authService.changePassword(tokenOrId, currentPassword, newPassword);
  }

  @Put('profile')
  updateProfile(
    @Headers('authorization') authHeader: string | undefined,
    @Body('mobile') mobile?: string,
    @Body('displayName') displayName?: string,
    @Body('bio') bio?: string,
    @Body('avatar') avatar?: string,
    @Body('email') email?: string,
  ) {
    let resolved = mobile || '';
    if (!resolved && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      resolved = this.authService.getMobileByToken(token) || '';
    }
    return this.authService.updateProfile(resolved, { displayName, bio, avatar, email });
  }

  // Admin users list & management
  @Get('admin/users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Put('admin/users/:id')
  adminUpdateUser(
    @Param('id') userId: string,
    @Body() body: { role?: UserRole; isBanned?: boolean; coinsDelta?: number },
  ) {
    return this.authService.adminUpdateUser(userId, body);
  }

  @Put('admin/users/:id/subscription')
  adminSetSubscription(
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

  @Get('public/:id')
  getPublicProfile(@Param('id') userId: string) {
    return this.authService.getPublicProfile(userId);
  }

}
