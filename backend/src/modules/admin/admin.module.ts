import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RaceModule } from '../race/race.module';
import { AuthModule } from '../auth/auth.module';
import { TypingModule } from '../typing/typing.module';
import { CertificateModule } from '../certificate/certificate.module';

@Module({
  imports: [RaceModule, AuthModule, TypingModule, CertificateModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
