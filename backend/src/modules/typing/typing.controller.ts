import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { TypingService, TypingSubmitDto } from './typing.service';

@Controller('api/typing')
export class TypingController {
  constructor(private readonly typingService: TypingService) {}

  @Post('submit-session')
  submitSession(@Body() body: TypingSubmitDto) {
    return this.typingService.evaluateSession(body);
  }

  @Get('lessons')
  getLessons() {
    return this.typingService.getCurriculum();
  }

  @Get('lesson/:id')
  getLesson(@Param('id') id: string) {
    return this.typingService.getLessonById(id);
  }

  @Get('user-history/:userId')
  getUserHistory(@Param('userId') userId: string) {
    return this.typingService.getUserHistory(userId);
  }

  @Get('user-stats/:userId')
  getUserStats(
    @Param('userId') userId: string,
    @Query('category') category?: string,
  ) {
    return this.typingService.getUserStats(userId, category);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.typingService.getLeaderboard();
  }
}
