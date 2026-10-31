import { Controller, Post, Get, Body } from '@nestjs/common';
import { AntiCheatService, AntiCheatAnalysisInput } from './anticheat.service';

@Controller('api/anticheat')
export class AntiCheatController {
  constructor(private readonly antiCheatService: AntiCheatService) {}

  @Post('analyze')
  analyzeSession(@Body() body: AntiCheatAnalysisInput) {
    return this.antiCheatService.analyzeSession(body);
  }

  @Get('flags')
  getFlaggedSessions() {
    return this.antiCheatService.getFlaggedSessions();
  }
}
