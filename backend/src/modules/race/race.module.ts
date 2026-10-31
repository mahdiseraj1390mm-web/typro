import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceGateway } from './race.gateway';
import { RaceController } from './race.controller';

@Module({
  controllers: [RaceController],
  providers: [RaceService, RaceGateway],
  exports: [RaceService],
})
export class RaceModule {}
