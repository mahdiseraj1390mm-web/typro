import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SmsService } from './sms.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SmsService],
  exports: [AuthService, SmsService],
})
export class AuthModule {}
