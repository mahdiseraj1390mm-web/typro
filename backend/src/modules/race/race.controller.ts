import { Controller, Get, Param } from '@nestjs/common';
import { RaceService } from './race.service';

@Controller(['race', 'api/race'])
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Get('rooms')
  getRooms() {
    return this.raceService.getDetailedRooms();
  }

  @Get('rooms/:id')
  getRoom(@Param('id') id: string) {
    const room = this.raceService.getRoom(id);
    if (!room) return null;
    return {
      id: room.id,
      title: room.title,
      topic: room.topic,
      language: room.language,
      text: room.text,
      state: room.state,
      currentRound: room.currentRound,
      intermissionSeconds: room.intermissionSeconds,
      capacity: 8,
      onlineUsers: room.participants.size,
      participants: Array.from(room.participants.values()),
    };
  }
}
