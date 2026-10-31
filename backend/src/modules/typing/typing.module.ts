import { Module } from '@nestjs/common';
import { TypingService } from './typing.service';
import { TypingController } from './typing.controller';

@Module({
  controllers: [TypingController],
  providers: [TypingService],
  exports: [TypingService],
})
export class TypingModule {}
