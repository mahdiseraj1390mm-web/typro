import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('api/gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('leaderboard')
  getLeaderboard(@Query('period') period?: string) {
    return this.gamificationService.getLeaderboard(period || 'day');
  }

  @Post('record-progress')
  recordProgress(
    @Body()
    dto: {
      userId?: string;
      username?: string;
      displayName?: string;
      earnedXp?: number;
      earnedDiamonds?: number;
      wonRace?: boolean;
      wpm?: number;
      accuracy?: number;
    },
  ) {
    return this.gamificationService.recordProgress(dto);
  }

  @Get('achievements')
  getAllAchievements() {
    return this.gamificationService.getAllAchievements();
  }

  @Get('user-achievements/:userId')
  getUserAchievements(@Param('userId') userId: string) {
    return this.gamificationService.getUserAchievements(userId);
  }

  @Get('leagues')
  getLeagues() {
    return this.gamificationService.getLeagues();
  }

  @Get('user-progress/:userId')
  getUserProgress(@Param('userId') userId: string) {
    return this.gamificationService.getUserProgress(userId);
  }
}
