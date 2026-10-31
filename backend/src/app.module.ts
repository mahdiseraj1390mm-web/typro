import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RaceModule } from './modules/race/race.module';
import { ContentModule } from './modules/content/content.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { TypingModule } from './modules/typing/typing.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { EconomyModule } from './modules/economy/economy.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AntiCheatModule } from './modules/anticheat/anticheat.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    RaceModule,
    ContentModule,
    AuthModule,
    AdminModule,
    TypingModule,
    CertificateModule,
    EconomyModule,
    GamificationModule,
    AntiCheatModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
