import { Injectable, Logger } from '@nestjs/common';
import { 
  ROOM_1_TEXTS, 
  ROOM_2_TEXTS, 
  ROOM_3_TEXTS, 
  ROOM_4_TEXTS,
  ROOM_SCIENTIFIC_TEXTS,
  ROOM_HISTORICAL_TEXTS,
  ROOM_NUMBERS_TEXTS
} from './race.texts';

export type RaceState = 'IDLE' | 'LOBBY' | 'READY' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHING' | 'INTERMISSION' | 'RESULT';

export interface Participant {
  odUserId: string;
  socketId: string;
  name: string;
  level: number;
  cup: string;
  skinId: string;
  progressPercent: number;
  wpm: number;
  accuracy: number;
  errors: number;
  isActive: boolean; // Active typer flag
  isAbandoned: boolean;
  isFinished: boolean;
  finishPosition?: number;
  lastStrokeTime: number;
  voteChangeText: boolean;
  joinedDuringActive: boolean; // Queued or joined mid-race
  isSpectator?: boolean;
  consecutiveIdleHands?: number; // Counter for hands without any keystrokes (>= 10 -> moved to spectators)
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: string;
  text: string;
  time: string;
  date: string;
  timestamp: number;
}

export interface Room {
  id: string;
  title: string;
  topic: string;
  language: 'fa' | 'en';
  state: RaceState;
  text: string;
  countdownSeconds: number;
  roundDurationSeconds: number;
  roundRemainingSeconds: number;
  intermissionSeconds: number;
  currentRound: number;
  textPool: string[];
  shuffledDeck: string[];
  deckIndex: number;
  lastText?: string;
  participants: Map<string, Participant>;
  spectatorQueue: string[]; // FIFO Queue for spectators waiting to enter race
  finishCounter: number;
  chatMessages: ChatMessage[];
  lastChatDate: string;
  allIdleSince?: number | null; // Timestamp when everyone in room stopped typing
}

// Fisher-Yates shuffle with previous last item avoidance
function shuffleArray<T>(arr: T[], prevLast?: T): T[] {
  if (!arr || arr.length <= 1) return arr ? [...arr] : [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (prevLast && copy[0] === prevLast && copy.length > 1) {
    const swapIdx = Math.floor(Math.random() * (copy.length - 1)) + 1;
    [copy[0], copy[swapIdx]] = [copy[swapIdx], copy[0]];
  }
  return copy;
}

@Injectable()
export class RaceService {
  private readonly logger = new Logger(RaceService.name);
  private rooms: Map<string, Room> = new Map();

  constructor() {
    this.initDefaultRooms();
  }

  private initDefaultRooms() {
    this.createRoom(
      'room-1',
      'اتاق ۱: کورس سرعتی متون فناوری و هوش مصنوعی',
      'فناوری و مهارت',
      'fa',
      ROOM_1_TEXTS[0],
      45,
      ROOM_1_TEXTS
    );

    this.createRoom(
      'room-2',
      'اتاق ۲: رقابت ادبیات کهن و گلستان سعدی',
      'ادبیات کهن',
      'fa',
      ROOM_2_TEXTS[0],
      45,
      ROOM_2_TEXTS
    );

    this.createRoom(
      'room-3',
      'Room 3: Fullstack Devs English Typing Sprint',
      'Computer Science',
      'en',
      ROOM_3_TEXTS[0],
      45,
      ROOM_3_TEXTS
    );

    this.createRoom(
      'room-4',
      'اتاق ۴: دوئل استقامتی اشعار کهن شاهنامه فردوسی',
      'ادبیات کهن فارسی',
      'fa',
      ROOM_4_TEXTS[0],
      45,
      ROOM_4_TEXTS
    );

    this.createRoom(
      'room-scientific',
      'اتاق ۵: کورس دانش و متون علمی جهان',
      'علمی و اکتشافات',
      'fa',
      ROOM_SCIENTIFIC_TEXTS[0],
      45,
      ROOM_SCIENTIFIC_TEXTS
    );

    this.createRoom(
      'room-historical',
      'اتاق ۶: رقابت تاریخ و تمدن‌های کهن',
      'تاریخ و تمدن',
      'fa',
      ROOM_HISTORICAL_TEXTS[0],
      45,
      ROOM_HISTORICAL_TEXTS
    );

    this.createRoom(
      'room-numbers',
      'اتاق ۷: پد عددی و تایپ سرعتی اعداد (بدون کلید فاصله)',
      'تایپ اعداد',
      'en',
      ROOM_NUMBERS_TEXTS[0],
      45,
      ROOM_NUMBERS_TEXTS
    );
  }

  createRoom(
    id: string,
    title: string,
    topic: string,
    language: 'fa' | 'en',
    text: string,
    roundDurationSeconds: number = 60,
    textPool?: string[]
  ): Room {
    const pool = textPool && textPool.length > 0 ? textPool : [text];
    const initialDeck = shuffleArray(pool);
    const room: Room = {
      id,
      title,
      topic,
      language,
      state: 'LOBBY',
      text: initialDeck[0] || pool[0],
      countdownSeconds: 0,
      roundDurationSeconds,
      roundRemainingSeconds: roundDurationSeconds,
      intermissionSeconds: 0,
      currentRound: 1,
      textPool: pool,
      shuffledDeck: initialDeck,
      deckIndex: 0,
      lastText: initialDeck[0],
      participants: new Map(),
      spectatorQueue: [],
      finishCounter: 0,
      chatMessages: [],
      lastChatDate: new Date().toISOString().split('T')[0],
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): any[] {
    return Array.from(this.rooms.values()).map((r) => ({
      id: r.id,
      title: r.title,
      topic: r.topic,
      language: r.language,
      state: r.state,
      participantCount: r.participants.size,
      activeTypers: Array.from(r.participants.values()).filter((p) => p.isActive && !p.isAbandoned && !p.isSpectator).length,
      spectatorsCount: Array.from(r.participants.values()).filter((p) => p.isSpectator).length,
    }));
  }

  getDetailedRooms(): any[] {
    return Array.from(this.rooms.values()).map((r) => {
      const activeRacers = Array.from(r.participants.values()).filter(
        (p) => !p.isSpectator && !p.isAbandoned
      ).length;
      return {
        id: r.id,
        title: r.title,
        topic: r.topic,
        mode: r.roundDurationSeconds ? `${r.roundDurationSeconds}Classic` : '60Classic',
        language: r.language,
        capacity: 8,
        onlineUsers: r.participants.size,
        activeRacers,
        averageWpm: r.participants.size > 0
          ? Math.round(Array.from(r.participants.values()).reduce((acc, p) => acc + (p.wpm || 0), 0) / r.participants.size)
          : 0,
        trackTheme: r.id === 'room-1' ? 'Cyber City' : r.id === 'room-2' ? 'Persian-inspired' : r.id === 'room-3' ? 'Space Odyssey' : 'Historic Persepolis',
        status: r.state,
        isPrivate: false,
        pinCode: undefined,
        hasBots: false,
        hostName: `سرور متمرکز رقابت زنده تایپرو (${r.id})`,
        text: r.text,
        currentRound: r.currentRound,
        participants: Array.from(r.participants.values()),
      };
    });
  }

  // Map socketId -> { roomId, userId }
  private socketUserMap: Map<string, { roomId: string; userId: string }> = new Map();

  // Find if user is currently active in ANY room
  findActiveUserSession(userId: string, currentSocketId: string): { roomId: string; roomTitle: string } | null {
    if (!userId || userId.startsWith('guest_') || userId.startsWith('temp_') || userId === 'user-guest') {
      return null;
    }
    for (const room of this.rooms.values()) {
      const p = room.participants.get(userId);
      if (p && p.socketId && p.socketId !== currentSocketId) {
        return { roomId: room.id, roomTitle: room.title };
      }
    }
    return null;
  }

  // Handle socket disconnect
  handleSocketDisconnect(socketId: string): { roomId: string; userId: string; promotedUserId?: string } | null {
    const session = this.socketUserMap.get(socketId);
    if (session) {
      const res = this.leaveRoom(session.roomId, session.userId);
      this.socketUserMap.delete(socketId);
      return { ...session, promotedUserId: res?.promotedUserId };
    }
    return null;
  }

  // Strict 8-racer capacity + FIFO Spectator Queue
  joinRoom(
    roomId: string,
    socketId: string,
    user: { id: string; name: string; level: number; skinId: string; isSpectator?: boolean }
  ): { room: Room; joinedDuringActive: boolean; isSpectator: boolean } {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId, 'اتاق عمومی', 'عمومی', 'fa', 'متن پیش‌فرض مسابقه سرعت تایپرو.');
    }

    if (!room.spectatorQueue) {
      room.spectatorQueue = [];
    }

    this.socketUserMap.set(socketId, { roomId, userId: user.id });

    // Daily purge check: if calendar day has changed, clear chat messages for the fresh new day!
    const today = new Date().toISOString().split('T')[0];
    if (room.lastChatDate !== today) {
      room.chatMessages = [];
      room.lastChatDate = today;
    }

    const isRunning = room.state === 'ACTIVE';

    // Strict maximum of 8 active racers per room
    const MAX_ACTIVE_RACERS = 8;
    const existingP = room.participants.get(user.id);
    const currentActiveRacers = Array.from(room.participants.values()).filter(
      (p) => !p.isSpectator && !p.isAbandoned && p.odUserId !== user.id
    ).length;

    let shouldSpectate = false;
    if (user.isSpectator) {
      shouldSpectate = true;
    } else if (existingP && existingP.isSpectator) {
      shouldSpectate = true;
    } else if (currentActiveRacers >= MAX_ACTIVE_RACERS) {
      // 8 racers are already active on the track! 9th+ joins as Spectator in FIFO queue
      shouldSpectate = true;
    }

    if (shouldSpectate) {
      if (!room.spectatorQueue.includes(user.id)) {
        room.spectatorQueue.push(user.id);
      }
    } else {
      room.spectatorQueue = room.spectatorQueue.filter((id) => id !== user.id);
    }

    const participant: Participant = {
      odUserId: user.id,
      socketId,
      name: user.name,
      level: user.level || 1,
      cup: 'Bronze Cup',
      skinId: user.skinId || 'skin-vw-beetle',
      progressPercent: 0,
      wpm: 0,
      accuracy: 100,
      errors: 0,
      isActive: !shouldSpectate,
      isAbandoned: false,
      isFinished: false,
      lastStrokeTime: Date.now(),
      voteChangeText: false,
      joinedDuringActive: isRunning,
      isSpectator: shouldSpectate,
      consecutiveIdleHands: 0,
    };

    room.participants.set(user.id, participant);

    // If room is in LOBBY or IDLE, activate immediately
    if ((room.state === 'LOBBY' || room.state === 'IDLE') && !shouldSpectate) {
      room.state = 'ACTIVE';
      room.countdownSeconds = 0;
    }

    return { room, joinedDuringActive: isRunning, isSpectator: shouldSpectate };
  }

  nextRound(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentRound += 1;
    room.deckIndex += 1;
    if (room.deckIndex >= room.shuffledDeck.length) {
      room.shuffledDeck = shuffleArray(room.textPool, room.lastText);
      room.deckIndex = 0;
    }
    room.text = room.shuffledDeck[room.deckIndex];
    room.lastText = room.text;
    room.state = 'ACTIVE';
    room.countdownSeconds = 0;
    room.roundRemainingSeconds = room.roundDurationSeconds;
    room.intermissionSeconds = 0;
    room.finishCounter = 0;
    room.allIdleSince = null;

    // Rule: Move typists to Spectators after 10 consecutive hands of not typing
    for (const p of room.participants.values()) {
      if (!p.isSpectator) {
        if (p.progressPercent === 0) {
          p.consecutiveIdleHands = (p.consecutiveIdleHands || 0) + 1;
          if (p.consecutiveIdleHands >= 10) {
            p.isSpectator = true;
            p.isActive = false;
            p.consecutiveIdleHands = 0;
            if (!room.spectatorQueue.includes(p.odUserId)) {
              room.spectatorQueue.push(p.odUserId);
            }
            this.logger.log(`[Race] Typist ${p.name} (${p.odUserId}) inactive for 10 hands -> moved to spectators in room ${roomId}`);
          }
        } else {
          p.consecutiveIdleHands = 0;
        }
      }
    }

    // Promote waiting spectators if spots freed up (< 8 racers)
    const activeRacerCount = Array.from(room.participants.values()).filter((p) => !p.isSpectator).length;
    if (activeRacerCount < 8 && room.spectatorQueue.length > 0) {
      const promoteId = room.spectatorQueue.shift();
      const p = room.participants.get(promoteId || '');
      if (p) {
        p.isSpectator = false;
        p.isActive = true;
        p.consecutiveIdleHands = 0;
        this.logger.log(`[Race] Promoted spectator ${p.name} to racer in room ${roomId}`);
      }
    }

    for (const p of room.participants.values()) {
      p.progressPercent = 0;
      p.wpm = 0;
      p.accuracy = 100;
      p.errors = 0;
      p.isActive = true;
      p.isAbandoned = false;
      p.isFinished = false;
      p.finishPosition = undefined;
      p.lastStrokeTime = Date.now();
      p.voteChangeText = false;
      p.joinedDuringActive = false;
    }

    return room;
  }

  startRace(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.state = 'ACTIVE';
    room.countdownSeconds = 0;
    for (const p of room.participants.values()) {
      p.joinedDuringActive = false;
      p.isActive = true;
      p.isAbandoned = false;
      p.lastStrokeTime = Date.now();
    }
  }

  leaveRoom(roomId: string, userId: string): { promotedUserId?: string } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const leavingP = room.participants.get(userId);
    const wasActiveRacer = leavingP && !leavingP.isSpectator;
    room.participants.delete(userId);
    if (!room.spectatorQueue) room.spectatorQueue = [];
    room.spectatorQueue = room.spectatorQueue.filter((id) => id !== userId);

    let promotedUserId: string | undefined;

    // Proposal: When an active racer leaves, automatically promote the earliest spectator in the FIFO queue!
    if (wasActiveRacer && room.spectatorQueue.length > 0) {
      while (room.spectatorQueue.length > 0) {
        const nextId = room.spectatorQueue.shift()!;
        const nextP = room.participants.get(nextId);
        if (nextP) {
          nextP.isSpectator = false;
          nextP.isActive = true;
          nextP.progressPercent = 0;
          nextP.wpm = 0;
          nextP.accuracy = 100;
          nextP.errors = 0;
          nextP.isFinished = false;
          nextP.isAbandoned = false;
          nextP.lastStrokeTime = Date.now();
          promotedUserId = nextId;
          this.logger.log(`Spectator ${nextP.name} (${nextId}) promoted to active racer in room ${roomId}`);
          break;
        }
      }
    }

    // When the room becomes empty, purge all chat messages & reset state
    if (room.participants.size === 0) {
      room.state = 'LOBBY';
      room.finishCounter = 0;
      room.chatMessages = [];
      room.spectatorQueue = [];
    }

    return { promotedUserId };
  }

  // Voluntary toggle between Racer & Spectator mode
  toggleSpectator(
    roomId: string,
    userId: string
  ): { participant: Participant; promotedUserId?: string; wasSpectator: boolean } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const p = room.participants.get(userId);
    if (!p) return null;

    if (!room.spectatorQueue) room.spectatorQueue = [];
    let promotedUserId: string | undefined;

    if (!p.isSpectator) {
      // 1. Racer voluntarily steps down to Spectator
      p.isSpectator = true;
      p.isActive = false;
      if (!room.spectatorQueue.includes(userId)) {
        room.spectatorQueue.push(userId);
      }

      // Auto-promote first waiting spectator to fill the freed racer spot
      while (room.spectatorQueue.length > 0) {
        const nextId = room.spectatorQueue[0];
        if (nextId === userId) break; // Don't re-promote the player who just stepped down
        room.spectatorQueue.shift();
        const nextP = room.participants.get(nextId);
        if (nextP) {
          nextP.isSpectator = false;
          nextP.isActive = true;
          nextP.progressPercent = 0;
          nextP.wpm = 0;
          nextP.accuracy = 100;
          nextP.errors = 0;
          nextP.isFinished = false;
          nextP.isAbandoned = false;
          nextP.lastStrokeTime = Date.now();
          promotedUserId = nextId;
          this.logger.log(`Spectator ${nextP.name} promoted after voluntary step down`);
          break;
        }
      }

      return { participant: p, promotedUserId, wasSpectator: false };
    } else {
      // 2. Spectator requests to enter active race
      const activeRacers = Array.from(room.participants.values()).filter(
        (x) => !x.isSpectator && !x.isAbandoned
      );

      if (activeRacers.length < 8) {
        // Track has an open lane (< 8 active racers), promote immediately!
        p.isSpectator = false;
        p.isActive = true;
        p.progressPercent = 0;
        p.wpm = 0;
        p.accuracy = 100;
        p.errors = 0;
        p.isFinished = false;
        p.isAbandoned = false;
        p.lastStrokeTime = Date.now();
        room.spectatorQueue = room.spectatorQueue.filter((id) => id !== userId);
        return { participant: p, wasSpectator: true };
      } else {
        // Track is full (8/8 racers). Add to FIFO queue
        if (!room.spectatorQueue.includes(userId)) {
          room.spectatorQueue.push(userId);
        }
        return { participant: p, wasSpectator: true };
      }
    }
  }

  // Add chat message with daily purge verification
  addChatMessage(roomId: string, userId: string, sender: string, text: string): ChatMessage | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const today = new Date().toISOString().split('T')[0];
    if (room.lastChatDate !== today) {
      room.chatMessages = [];
      room.lastChatDate = today;
    }

    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      sender,
      text,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      date: today,
      timestamp: Date.now(),
    };

    room.chatMessages.push(msg);
    if (room.chatMessages.length > 100) {
      room.chatMessages.shift();
    }
    return msg;
  }

  getRoomChatMessages(roomId: string): ChatMessage[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    const today = new Date().toISOString().split('T')[0];
    if (room.lastChatDate !== today) {
      room.chatMessages = [];
      room.lastChatDate = today;
    }
    return room.chatMessages;
  }

  // Section 61: Progress update derived from actual keystrokes
  updateProgress(roomId: string, userId: string, progress: number, wpm: number, accuracy: number, errors: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const p = room.participants.get(userId);
    if (!p || p.isAbandoned) return null;

    p.lastStrokeTime = Date.now();
    p.progressPercent = Math.min(100, progress);
    p.wpm = wpm;
    p.accuracy = accuracy;
    p.errors = errors;
    p.consecutiveIdleHands = 0;
    room.allIdleSince = null;

    if (p.progressPercent >= 100 && !p.isFinished) {
      p.isFinished = true;
      room.finishCounter += 1;
      p.finishPosition = room.finishCounter;
    }

    // Check if all active participants have finished
    const activeParticipants = Array.from(room.participants.values()).filter(
      (item) => item.isActive && !item.isAbandoned
    );

    const allActiveFinished = activeParticipants.length > 0 && activeParticipants.every((item) => item.isFinished);
    if (allActiveFinished && room.state === 'ACTIVE') {
      room.state = 'INTERMISSION';
      room.intermissionSeconds = 7; // 2 seconds viewing score/rank bubble + 5 seconds circular countdown
    }

    return room;
  }

  // Inactivity detection conforming to user rules:
  // 1. Priority to active typers: as long as anyone is actively typing, text NEVER changes.
  // 2. Priority to winners over idle typists: if winners are waiting and unfinished racers stopped for 5s -> hand ends!
  // 3. Room keepalive: if no one in the room is typing at all for 5s -> 5-second countdown to switch text so room stays lively.
  checkInactivity(roomId: string): { abandonedUsers: string[]; shouldStartIntermission?: boolean; intermissionSeconds?: number } {
    const room = this.rooms.get(roomId);
    const abandonedUsers: string[] = [];
    if (!room || room.state !== 'ACTIVE') return { abandonedUsers };

    const now = Date.now();
    const activeRacers = Array.from(room.participants.values()).filter(
      (p) => !p.isSpectator && !p.isAbandoned && p.isActive
    );

    if (activeRacers.length === 0) return { abandonedUsers };

    // Check if any participant has already finished the race in this hand
    const hasFinishedWinner = activeRacers.some((p) => p.isFinished);

    // Rule 1: Are there participants actively typing right now?
    // Actively typing = progress > 0, not finished, and last keystroke within 5 seconds
    const isAnyoneActivelyTyping = activeRacers.some(
      (p) => !p.isFinished && p.progressPercent > 0 && (now - p.lastStrokeTime < 5000)
    );

    if (isAnyoneActivelyTyping) {
      // Typing has 100% priority! Never interrupt active typists.
      room.allIdleSince = null;
      return { abandonedUsers };
    }

    if (hasFinishedWinner) {
      // Rule 2: Winners completed, and NO unfinished racer is actively typing (all idle >= 5s).
      // Priority shifts to winners!
      for (const p of activeRacers) {
        if (!p.isFinished) {
          p.isAbandoned = true;
          p.isActive = false;
          abandonedUsers.push(p.odUserId);
        }
      }
      room.allIdleSince = null;
      return { abandonedUsers, shouldStartIntermission: true, intermissionSeconds: 7 };
    } else {
      // Rule 3: No one finished, and completely NO ONE in the room is typing
      const anyTypingAtAll = activeRacers.some((p) => (now - p.lastStrokeTime < 5000));
      if (anyTypingAtAll) {
        room.allIdleSince = null;
      } else {
        if (!room.allIdleSince) {
          room.allIdleSince = now;
        } else if (now - room.allIdleSince >= 5000) {
          // Room completely idle for 5 seconds -> trigger 5-second countdown to refresh text
          room.allIdleSince = null;
          return { abandonedUsers, shouldStartIntermission: true, intermissionSeconds: 5 };
        }
      }
    }

    return { abandonedUsers };
  }

  // Proposal: If 1 person, text changes immediately with 5s countdown. If multiple, all remaining unfinished typers must vote. If some finished, only remaining typers decide.
  voteChangeText(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const p = room.participants.get(userId);
    if (p) p.voteChangeText = true;

    // Typers still currently racing (not abandoned, not finished)
    const remainingTypers = Array.from(room.participants.values()).filter(
      (item) => item.isActive && !item.isAbandoned && !item.isFinished
    );

    const shouldChange =
      remainingTypers.length <= 1 ||
      (remainingTypers.length > 0 && remainingTypers.every((item) => item.voteChangeText));

    if (shouldChange) {
      room.currentRound += 1;
      room.deckIndex += 1;
      if (room.deckIndex >= room.shuffledDeck.length) {
        room.shuffledDeck = shuffleArray(room.textPool, room.lastText);
        room.deckIndex = 0;
      }
      room.text = room.shuffledDeck[room.deckIndex];
      room.lastText = room.text;
      room.state = 'INTERMISSION';
      room.countdownSeconds = 0;
      room.roundRemainingSeconds = room.roundDurationSeconds;
      room.intermissionSeconds = 5; // 5-second countdown to prepare for next round
      room.finishCounter = 0;
      for (const item of room.participants.values()) {
        item.progressPercent = 0;
        item.wpm = 0;
        item.accuracy = 100;
        item.errors = 0;
        item.isFinished = false;
        item.isAbandoned = false;
        item.voteChangeText = false;
        item.joinedDuringActive = false;
      }
      return true;
    }
    return false;
  }
}
