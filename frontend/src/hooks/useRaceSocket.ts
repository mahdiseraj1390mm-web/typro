'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RaceParticipant, RaceRoomData } from '@/types';

interface UseRaceSocketProps {
  roomId: string;
  user: {
    id: string;
    name: string;
    level: number;
    skinId: string;
  };
  enabled?: boolean;
}

export function useRaceSocket({ roomId, user, enabled = true }: UseRaceSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomData, setRoomData] = useState<RaceRoomData | null>(null);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [raceState, setRaceState] = useState<string>('LOBBY');
  const [countdown, setCountdown] = useState<number>(5);
  const [roundRemainingSeconds, setRoundRemainingSeconds] = useState<number>(60);
  const [intermissionSeconds, setIntermissionSeconds] = useState<number>(8);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roomText, setRoomText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [raceError, setRaceError] = useState<{ code: string; message: string; activeRoomId?: string } | null>(null);
  const [latestTip, setLatestTip] = useState<{ fromUserId: string; fromName: string; toUserId: string; toName: string; amount: number; timestamp: number } | null>(null);
  const [latestReaction, setLatestReaction] = useState<{ fromUserId: string; toUserId: string; emoji: string; timestamp: number } | null>(null);


  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [promotedNotification, setPromotedNotification] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !roomId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to NestJS backend socket server (smart resolution for dev vs nginx prod)
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl && typeof window !== 'undefined') {
      if (window.location.port === '3000') {
        socketUrl = `${window.location.protocol}//${window.location.hostname}:4000`;
      } else {
        socketUrl = window.location.origin;
      }
    }
    const socket = io(socketUrl || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join Room (Section 50 & 51)
      socket.emit('join_room', { roomId, user });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room_update', (data: any) => {
      setRaceState(data.state);
      setCountdown(data.countdownSeconds ?? 5);
      if (data.roundRemainingSeconds !== undefined) setRoundRemainingSeconds(data.roundRemainingSeconds);
      if (data.intermissionSeconds !== undefined) setIntermissionSeconds(data.intermissionSeconds);
      if (data.currentRound !== undefined) setCurrentRound(data.currentRound);
      if (data.text) setRoomText(data.text);
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
        const me = data.participants.find((p: any) => p.odUserId === user.id);
        if (me && me.isSpectator !== undefined) {
          setIsSpectator(Boolean(me.isSpectator));
        }
      }
      if (data.chatMessages && Array.isArray(data.chatMessages)) {
        setChatMessages(data.chatMessages);
      }
    });

    socket.on('countdown_tick', (data: { seconds: number }) => {
      setCountdown(data.seconds);
    });

    socket.on('race_started', (data?: any) => {
      setRaceState('ACTIVE');
      setIntermissionSeconds(0);
      setCountdown(0);
      if (data?.roundRemainingSeconds !== undefined) {
        setRoundRemainingSeconds(data.roundRemainingSeconds);
      }
      if (data?.currentRound !== undefined) {
        setCurrentRound(data.currentRound);
      }
      if (data?.text) {
        setRoomText(data.text);
      }
      if (data?.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socket.on('round_tick', (data: { remainingSeconds: number }) => {
      setRoundRemainingSeconds(data.remainingSeconds);
    });

    socket.on('round_ended', (data: { currentRound: number; intermissionSeconds: number }) => {
      setRaceState('INTERMISSION');
      setIntermissionSeconds(data.intermissionSeconds ?? 5);
      if (data.currentRound !== undefined) {
        setCurrentRound(data.currentRound);
      }
    });

    socket.on('new_round_countdown', (data: { currentRound: number; text: string; intermissionSeconds: number; participants?: any[] }) => {
      setRaceState('INTERMISSION');
      setIntermissionSeconds(data.intermissionSeconds ?? 5);
      setCurrentRound(data.currentRound);
      setRoomText(data.text);
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socket.on('intermission_tick', (data: { seconds: number; currentRound?: number; text?: string; participants?: any[] }) => {
      setRaceState('INTERMISSION');
      setIntermissionSeconds(data.seconds);
      if (data.currentRound !== undefined) {
        setCurrentRound(data.currentRound);
      }
      if (data.text) {
        setRoomText(data.text);
      }
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socket.on('new_round', (data: { currentRound: number; text: string; countdownSeconds?: number; roundDurationSeconds?: number; participants?: any[] }) => {
      setRaceState('ACTIVE');
      setCountdown(0);
      setIntermissionSeconds(0);
      setCurrentRound(data.currentRound);
      setRoomText(data.text);
      setRoundRemainingSeconds(data.roundDurationSeconds ?? 60);
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socket.on('progress_broadcast', (data: any) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.odUserId === data.userId || p.id === data.userId) {
            const prog = data.progressPercent !== undefined ? data.progressPercent : data.progress;
            const isFin = data.isFinished !== undefined ? Boolean(data.isFinished) : (Number(prog) || 0) >= 100 || p.isFinished;
            const finishPos = data.finishPosition !== undefined ? data.finishPosition : p.finishPosition;
            return {
              ...p,
              progressPercent: Number(prog) || 0,
              wpm: data.wpm !== undefined ? Number(data.wpm) : (p.wpm || 0),
              accuracy: data.accuracy !== undefined ? Number(data.accuracy) : (p.accuracy ?? 100),
              errors: data.errors !== undefined ? Number(data.errors) : (p.errors ?? 0),
              isFinished: isFin,
              finishPosition: finishPos,
            };
          }
          return p;
        })
      );
    });

    socket.on('new_chat_message', (data: any) => {
      setChatMessages((prev) => [...prev, data]);
    });

    socket.on('users_abandoned', (data: { userIds: string[] }) => {
      setParticipants((prev) =>
        prev.map((p) => (data.userIds.includes(p.odUserId) ? { ...p, isAbandoned: true, isActive: false } : p))
      );
    });


    socket.on('race_tip_received', (data: any) => {
      setLatestTip(data);
    });

    socket.on('race_reaction_received', (data: any) => {
      setLatestReaction(data);
    });

    socket.on('spectator_promoted', (data: { userId: string }) => {
      if (data.userId === user.id) {
        setIsSpectator(false);
        setPromotedNotification(true);
      }
    });

    socket.on('vote_recorded', (data: { userId: string }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.odUserId === data.userId || p.id === data.userId
            ? { ...p, voteChangeText: true }
            : p
        )
      );
    });

    socket.on('text_change_approved', (data: any) => {
      setRaceState('INTERMISSION');
      setIntermissionSeconds(data.intermissionSeconds ?? 7);
      if (data.currentRound !== undefined) setCurrentRound(data.currentRound);
      if (data.text) setRoomText(data.text);
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      }
    });

    socket.on('race_error', (errorData: { code: string; message: string; activeRoomId?: string }) => {
      setRaceError(errorData);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, user.id, enabled]);

  const sendProgress = useCallback(
    (progress: number, wpm: number, accuracy: number, errors: number) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('typing_progress', {
          roomId,
          userId: user.id,
          progress,
          wpm,
          accuracy,
          errors,
        });
      }
    },
    [roomId, user.id, isConnected]
  );

  const requestTextChange = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('vote_change_text', { roomId, userId: user.id });
    }
  }, [roomId, user.id, isConnected]);

  const sendChat = useCallback(
    (text: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('send_chat', { roomId, userId: user.id, sender: user.name, text });
      }
    },
    [roomId, user.id, user.name, isConnected]
  );


  const sendTip = useCallback(
    (toUserId: string, toName: string, amount: number) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('send_tip', {
          roomId,
          fromUserId: user.id,
          fromName: user.name,
          toUserId,
          toName,
          amount,
        });
      }
    },
    [roomId, user.id, user.name, isConnected]
  );

  const sendReaction = useCallback(
    (toUserId: string, emoji: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('send_reaction', {
          roomId,
          fromUserId: user.id,
          toUserId,
          emoji,
        });
      }
    },
    [roomId, user.id, isConnected]
  );

  const toggleSpectator = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('toggle_spectator', { roomId, userId: user.id });
    }
  }, [roomId, user.id, isConnected]);

  return {
    isConnected,
    isSpectator,
    promotedNotification,
    setPromotedNotification,
    toggleSpectator,
    raceState,
    countdown,
    roundRemainingSeconds,
    intermissionSeconds,
    currentRound,
    roomText,
    participants,
    chatMessages,
    raceError,
    sendProgress,
    requestTextChange,
    sendChat,
    latestTip,
    latestReaction,
    sendTip,
    sendReaction,
  };
}
