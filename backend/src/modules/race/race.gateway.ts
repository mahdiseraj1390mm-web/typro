import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RaceService } from './race.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RaceGateway.name);

  constructor(private readonly raceService: RaceService) {
    // Background interval to handle countdown transitions and 5s inactivity detection
    setInterval(() => {
      this.tickRooms();
    }, 1000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const session = this.raceService.handleSocketDisconnect(client.id);
    if (session) {
      const room = this.raceService.getRoom(session.roomId);
      if (room) {
        if (session.promotedUserId) {
          this.server.to(session.roomId).emit('spectator_promoted', { userId: session.promotedUserId });
        }
        this.server.to(session.roomId).emit('room_update', {
          roomId: room.id,
          state: room.state,
          countdownSeconds: room.countdownSeconds,
          roundDurationSeconds: room.roundDurationSeconds,
          roundRemainingSeconds: room.roundRemainingSeconds,
          intermissionSeconds: room.intermissionSeconds,
          currentRound: room.currentRound,
          text: room.text,
          participants: Array.from(room.participants.values()),
          chatMessages: room.chatMessages,
        });
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; user: { id: string; name: string; level: number; skinId: string; isSpectator?: boolean } }
  ) {
    // 1. Check if user is already racing in another tab or room
    const activeSession = this.raceService.findActiveUserSession(data.user?.id, client.id);
    if (activeSession) {
      client.emit('race_error', {
        code: 'DUPLICATE_SESSION',
        message: `حساب کاربری شما در حال حاضر در یک تب دیگر در مسابقه زنده حضور دارد (${activeSession.roomTitle}). امکان حضور همزمان با یک اکانت در چند مسابقه وجود ندارد.`,
        activeRoomId: activeSession.roomId,
      });
      return;
    }

    client.join(data.roomId);
    const { room, joinedDuringActive, isSpectator } = this.raceService.joinRoom(data.roomId, client.id, data.user);

    this.server.to(data.roomId).emit('room_update', {
      roomId: room.id,
      state: room.state,
      countdownSeconds: room.countdownSeconds,
      roundDurationSeconds: room.roundDurationSeconds,
      roundRemainingSeconds: room.roundRemainingSeconds,
      intermissionSeconds: room.intermissionSeconds,
      currentRound: room.currentRound,
      text: room.text,
      participants: Array.from(room.participants.values()),
      joinedDuringActive,
      isSpectator,
      chatMessages: room.chatMessages,
    });
  }

  @SubscribeMessage('toggle_spectator')
  handleToggleSpectator(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string }
  ) {
    const result = this.raceService.toggleSpectator(data.roomId, data.userId);
    const room = this.raceService.getRoom(data.roomId);
    if (!room) return;

    if (result?.promotedUserId) {
      this.server.to(data.roomId).emit('spectator_promoted', { userId: result.promotedUserId });
    }

    this.server.to(data.roomId).emit('room_update', {
      roomId: room.id,
      state: room.state,
      countdownSeconds: room.countdownSeconds,
      roundDurationSeconds: room.roundDurationSeconds,
      roundRemainingSeconds: room.roundRemainingSeconds,
      intermissionSeconds: room.intermissionSeconds,
      currentRound: room.currentRound,
      text: room.text,
      participants: Array.from(room.participants.values()),
      chatMessages: room.chatMessages,
    });
  }

  @SubscribeMessage('typing_progress')
  handleTypingProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; progress: number; wpm: number; accuracy: number; errors: number }
  ) {
    const room = this.raceService.updateProgress(
      data.roomId,
      data.userId,
      data.progress,
      data.wpm,
      data.accuracy,
      data.errors
    );

    if (room) {
      const p = room.participants.get(data.userId);
      this.server.to(data.roomId).emit('progress_broadcast', {
        userId: data.userId,
        progress: data.progress,
        progressPercent: data.progress,
        wpm: data.wpm,
        accuracy: data.accuracy,
        errors: data.errors,
        isFinished: p?.isFinished ?? (data.progress >= 100),
        finishPosition: p?.finishPosition,
        roomState: room.state,
      });

      if (room.state === 'INTERMISSION') {
        this.server.to(data.roomId).emit('round_ended', {
          currentRound: room.currentRound,
          intermissionSeconds: room.intermissionSeconds,
        });
      }
    }
  }

  @SubscribeMessage('vote_change_text')
  handleVoteChangeText(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string }
  ) {
    const restarted = this.raceService.voteChangeText(data.roomId, data.userId);
    const room = this.raceService.getRoom(data.roomId);
    if (!room) return;

    if (restarted) {
      this.server.to(data.roomId).emit('text_change_approved', {
        state: room.state,
        text: room.text,
        participants: Array.from(room.participants.values()),
      });
    } else {
      this.server.to(data.roomId).emit('vote_recorded', {
        userId: data.userId,
      });
    }
  }

  @SubscribeMessage('send_chat')
  handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId?: string; sender: string; text: string }
  ) {
    const msg = this.raceService.addChatMessage(
      data.roomId,
      data.userId || client.id,
      data.sender || 'راننده',
      data.text
    );
    if (msg) {
      this.server.to(data.roomId).emit('new_chat_message', msg);
    }
  }

  @SubscribeMessage('send_tip')
  handleTip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; fromUserId: string; fromName: string; toUserId: string; toName: string; amount: number }
  ) {
    if (!data.roomId || !data.toUserId || !data.amount || data.amount <= 0) return;
    this.server.to(data.roomId).emit('race_tip_received', {
      fromUserId: data.fromUserId,
      fromName: data.fromName || 'یک راننده',
      toUserId: data.toUserId,
      toName: data.toName || 'راننده',
      amount: data.amount,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('send_reaction')
  handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; fromUserId: string; toUserId: string; emoji: string }
  ) {
    if (!data.roomId || !data.toUserId || !data.emoji) return;
    this.server.to(data.roomId).emit('race_reaction_received', {
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      emoji: data.emoji,
      timestamp: Date.now(),
    });
  }

  private tickRooms() {
    for (const room of (this.raceService as any).rooms.values()) {
      if (room.state === 'COUNTDOWN') {
        room.state = 'ACTIVE';
        room.countdownSeconds = 0;
        for (const p of room.participants.values()) {
          p.isActive = true;
          p.isAbandoned = false;
          p.lastStrokeTime = Date.now();
        }
        this.server.to(room.id).emit('race_started', {
          currentRound: room.currentRound,
          text: room.text,
        });
      } else if (room.state === 'ACTIVE') {
        const { abandonedUsers, shouldStartIntermission, intermissionSeconds } = this.raceService.checkInactivity(room.id);
        if (abandonedUsers.length > 0) {
          this.server.to(room.id).emit('users_abandoned', { userIds: abandonedUsers });
        }

        const activeParticipants = Array.from(room.participants.values()).filter(
          (item: any) => item.isActive && !item.isAbandoned && !item.isSpectator
        );
        const allFinished = activeParticipants.length > 0 && activeParticipants.every((item: any) => item.isFinished);

        if (allFinished || shouldStartIntermission) {
          room.state = 'INTERMISSION';
          room.intermissionSeconds = intermissionSeconds || 7;
          this.server.to(room.id).emit('round_ended', {
            currentRound: room.currentRound,
            intermissionSeconds: room.intermissionSeconds,
          });
        }
      } else if (room.state === 'INTERMISSION') {
        if (room.intermissionSeconds > 1) {
          room.intermissionSeconds -= 1;
          this.server.to(room.id).emit('intermission_tick', {
            seconds: room.intermissionSeconds,
            currentRound: room.currentRound,
          });
        } else {
          const nextRoom = this.raceService.nextRound(room.id);
          if (nextRoom) {
            nextRoom.state = 'ACTIVE';
            nextRoom.intermissionSeconds = 0;
            this.server.to(room.id).emit('new_round', {
              currentRound: nextRoom.currentRound,
              text: nextRoom.text,
              countdownSeconds: 0,
              participants: Array.from(nextRoom.participants.values()),
            });
          }
        }
      }
    }
  }
}
