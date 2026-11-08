'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { RaceRoomData, RaceParticipant } from '@/types';
import { 
  Trophy, AlertCircle, MessageSquare, LogOut, RefreshCw, Gauge, Zap, Users,
  ChevronDown, ChevronUp, Palette, Sparkles, Check, Send, Timer, AlertTriangle, Star, Video, Lock, X, Smile, Coins, Eye,
  Volume2, VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { ALL_SKINS, getSkinById, SkinItem } from '@/lib/skins';
import { getTypingDisplayConfig, DEFAULT_TYPING_DISPLAY_CONFIG } from '@/lib/typingDisplayConfig';
import {
  isRaceAudioMuted,
  setRaceAudioMuted,
  playKeyClickSound,
  playChatNotificationSound,
  playPrecisionResetSound
} from '@/lib/raceAudio';
import AnimatedVehicleSkin from './AnimatedVehicleSkin';
import GamingLevelBadge from '@/components/common/GamingLevelBadge';
import PublicProfileModal, { PublicUserProfile } from './PublicProfileModal';
import VehicleActionModal from './VehicleActionModal';
import LevelShowcaseModal from './LevelShowcaseModal';

export const AVAILABLE_SKINS = ALL_SKINS;

// ── Level badge colour helper ──────────────────────────────────────────────────
function getLevelStyle(level: number): string {
  if (level >= 100) return 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-black';
  if (level >= 75)  return 'bg-gradient-to-r from-rose-500 to-pink-600 text-white';
  if (level >= 50)  return 'bg-orange-600 text-white';
  if (level >= 35)  return 'bg-amber-500 text-black';
  if (level >= 20)  return 'bg-purple-600 text-white';
  if (level >= 10)  return 'bg-blue-600 text-white';
  if (level >= 5)   return 'bg-emerald-600 text-white';
  return 'bg-slate-600 text-white';
}

// ── Quick emoji reactions & Persian phrases ───────────────────────────────────
const QUICK_EMOJIS = ['👍','😂','🔥','💪','🏆','😎','👏','❤️','🤯','😭','🎉','💨'];
const QUICK_PHRASES = ['برو برو!','آفرین!','تند بزن!','خوب بود!','ممنون','دوباره!','عالی!'];

interface LiveRaceTrackProps {
  room: RaceRoomData;
  currentUserId: string;
  userName?: string;
  isSpectator?: boolean;
  onExit: () => void;
  onRequestTextChange?: () => void;
  onProgressUpdate?: (progress: number, wpm: number, accuracy: number, errors: number) => void;
  onSendMessage?: (text: string) => void;
  isConnected?: boolean;
  socketChatMessages?: { id?: string; userId?: string; sender: string; text: string; time: string }[];
  latestTip?: { fromUserId: string; fromName: string; toUserId: string; toName: string; amount: number; timestamp: number } | null;
  latestReaction?: { fromUserId: string; toUserId: string; emoji: string; timestamp: number } | null;
  onSendTip?: (toUserId: string, toName: string, amount: number) => void;
  onSendReaction?: (toUserId: string, emoji: string) => void;
  currentUserCoins?: number;
  onToggleSpectator?: () => void;
}

export default function LiveRaceTrack({
  room,
  currentUserId,
  userName,
  isSpectator = false,
  onExit,
  onRequestTextChange,
  onProgressUpdate,
  onSendMessage,
  isConnected = false,
  socketChatMessages,
  latestTip,
  latestReaction,
  onSendTip,
  onSendReaction,
  currentUserCoins = 0,
  onToggleSpectator,
}: LiveRaceTrackProps) {
  const { user } = useAuth();

  // Resolved user name: Sequential Guest -> "مهمان ۱", "مهمان ۲"..., Registered User -> Profile display name
  const resolvedUserName = React.useMemo(() => {
    if (user) {
      return userName || (typeof window !== 'undefined' ? localStorage.getItem('typro_profile_name') : null) || user.displayName || 'شما (تایپیست)';
    }
    const existingGuests = room.participants.filter((p) => p.name && (p.name.includes('مهمان') || p.odUserId?.startsWith('guest')));
    const myIdx = existingGuests.findIndex((p) => p.odUserId === currentUserId);
    const guestNum = myIdx >= 0 ? myIdx + 1 : (existingGuests.length + 1);
    return `مهمان ${guestNum}`;
  }, [user, userName, room.participants, currentUserId]);

  // Local state for current player typing inside race
  const [typedCount, setTypedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState<number | null>(null);
  const errorIndicesRef = useRef<Set<number>>(new Set());
  const [errorIndicesCount, setErrorIndicesCount] = useState<number>(0);
  
  // Customization & UI state - Skin is directly determined by equipped skin in skins shop
  const myParticipantSkin = room.participants.find((p) => p.odUserId === currentUserId)?.skinId;
  const [selectedSkinId, setSelectedSkinId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_equipped_skin');
      if (saved) return saved;
    }
    if (myParticipantSkin) return myParticipantSkin;
    return 'skin-vw-beetle'; // Free default starter skin
  });

  const [chatOpen, setChatOpen] = useState(false);

  // Live Track Coins & Points State (Synchronized 1:1 with Points & Persistent across hands)
  const [liveCoins, setLiveCoins] = useState<number>(() => {
    return typeof window !== 'undefined'
      ? Number(localStorage.getItem('typro_user_coins') || (user?.coins ?? 0))
      : (user?.coins ?? 0);
  });
  const [liveXp, setLiveXp] = useState<number>(() => {
    return typeof window !== 'undefined'
      ? Number(localStorage.getItem('typro_user_xp') || (user?.xp ?? liveCoins))
      : (user?.xp ?? liveCoins);
  });

  useEffect(() => {
    const syncLiveEconomy = () => {
      if (typeof window === 'undefined') return;
      const c = user && typeof user.coins === 'number'
        ? user.coins
        : Number(localStorage.getItem('typro_user_coins') || '0');
      const x = user && typeof user.xp === 'number'
        ? user.xp
        : Number(localStorage.getItem('typro_user_xp') || String(c));
      setLiveCoins(c);
      setLiveXp(Math.max(x, c));
    };
    syncLiveEconomy();
    window.addEventListener('typro_economy_updated', syncLiveEconomy);
    window.addEventListener('storage', syncLiveEconomy);
    return () => {
      window.removeEventListener('typro_economy_updated', syncLiveEconomy);
      window.removeEventListener('storage', syncLiveEconomy);
    };
  }, [user, currentUserCoins]);

  const [displayConfig, setDisplayConfig] = useState(DEFAULT_TYPING_DISPLAY_CONFIG);
  useEffect(() => {
    setDisplayConfig(getTypingDisplayConfig());
    const handler = (e: any) => {
      setDisplayConfig(e.detail || getTypingDisplayConfig());
    };
    window.addEventListener('typro_display_config_changed', handler);
    return () => window.removeEventListener('typro_display_config_changed', handler);
  }, []);

  const [chatMessages, setChatMessages] = useState<{ id?: string; userId?: string; sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profilePopupUserId, setProfilePopupUserId] = useState<string | null>(null);
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<PublicUserProfile | null>(null);
  const [selectedVehicleDriver, setSelectedVehicleDriver] = useState<{ odUserId: string; name: string; skinId: string; level?: number } | null>(null);
  const [levelShowcaseOpen, setLevelShowcaseOpen] = useState<boolean>(false);

  useEffect(() => {
    if (latestReaction && latestReaction.toUserId && latestReaction.emoji) {
      triggerSpeechBubble(latestReaction.toUserId, latestReaction.emoji);
    }
  }, [latestReaction]);

  useEffect(() => {
    if (latestTip && latestTip.amount > 0) {
      showToast(`🎁 ${latestTip.fromName} مبلغ ${latestTip.amount.toLocaleString('fa-IR')} سکه به ${latestTip.toName} انعام داد!`);
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.75 } });
    }
  }, [latestTip]);

  const handleDriverNameClick = async (p: RaceParticipant) => {
    try {
      const res = await fetch(`/auth/public/${p.odUserId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPublicProfile(data);
        return;
      }
    } catch (e) {}

    setSelectedPublicProfile({
      id: p.odUserId,
      displayName: p.name,
      username: p.odUserId,
      level: p.level || 1,
      xp: ((p.level || 1) - 1) * 100,
      wpm: p.wpm || 65,
      accuracy: p.accuracy || 98,
      totalRaces: 20,
      racesWon: p.finishPosition === 1 ? 2 : 0,
    });
  };

  const handleVehicleClick = (p: RaceParticipant) => {
    if (p.odUserId === currentUserId) return;
    setSelectedVehicleDriver({
      odUserId: p.odUserId,
      name: p.name,
      skinId: p.skinId || 'skin-paykan',
      level: p.level,
    });
  };

  const handleSendTipAction = (targetUserId: string, targetName: string, amount: number) => {
    if (onSendTip) {
      onSendTip(targetUserId, targetName, amount);
    } else {
      showToast(`🎁 شما ${amount.toLocaleString('fa-IR')} سکه به ${targetName} انعام دادید.`);
    }
  };

  const handleSendReactionAction = (targetUserId: string, emoji: string) => {
    if (onSendReaction) {
      onSendReaction(targetUserId, emoji);
    } else {
      triggerSpeechBubble(targetUserId, emoji);
    }
  };
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [sendCoins, setSendCoins] = useState('');
  const [sendDiamonds, setSendDiamonds] = useState('');

  // Power-up Enable/Disable toggle by user
  const [isPowerUpEnabled, setIsPowerUpEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_powerup_enabled');
      return saved !== 'false';
    }
    return true;
  });

  const [activePowerUpItem, setActivePowerUpItem] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('typro_equipped_powerup');
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
    }
    return null;
  });

  useEffect(() => {
    const handlePowerUpChange = () => {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('typro_equipped_powerup');
        if (raw) {
          try { setActivePowerUpItem(JSON.parse(raw)); } catch { setActivePowerUpItem(null); }
        } else {
          setActivePowerUpItem(null);
        }
      }
    };
    window.addEventListener('storage', handlePowerUpChange);
    window.addEventListener('typro_powerup_updated', handlePowerUpChange);
    return () => {
      window.removeEventListener('storage', handlePowerUpChange);
      window.removeEventListener('typro_powerup_updated', handlePowerUpChange);
    };
  }, []);

  const handleTogglePowerUp = () => {
    const nextState = !isPowerUpEnabled;
    setIsPowerUpEnabled(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_powerup_enabled', String(nextState));
      window.dispatchEvent(new Event('typro_powerup_updated'));
    }
    if (nextState) {
      showToast(`⚡ قابلیت «${activePowerUpItem?.name || 'بوستر'}» متصل و فعال گردید.`);
    } else {
      showToast(`✕ قابلیت «${activePowerUpItem?.name || 'بوستر'}» قطع و غیرفعال شد.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };
  
  // 💬 Speech bubble state: displays over vehicle for exactly 2 seconds
  const [activeBubbles, setActiveBubbles] = useState<{ [userId: string]: { text: string; expiresAt: number } }>({});

  const triggerSpeechBubble = (userId: string, text: string) => {
    setActiveBubbles((prev) => ({
      ...prev,
      [userId]: { text, expiresAt: Date.now() + 2000 }
    }));

    setTimeout(() => {
      setActiveBubbles((prev) => {
        if (!prev[userId] || prev[userId].expiresAt > Date.now()) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }, 2050);
  };

  // Load chat messages: daily purge (cleared every new day) and server retention
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    const dateKey = `typro_chat_date_${room.id}`;
    const msgsKey = `typro_chat_messages_${room.id}`;

    setChatMessages([]);
  }, [room.id]);

  // Synchronize incoming socket chat messages, deduplicate, filter > 2 min, and trigger bubbles
  const processedChatIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (socketChatMessages && socketChatMessages.length > 0) {
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const valid = socketChatMessages.filter((m: any) => {
        const ts = m.createdAt || m.timestamp || Date.now();
        return ts > twoMinutesAgo;
      });

      let hasNewMessage = false;
      valid.forEach((msg: any) => {
        const msgId = msg.id || `${msg.userId || msg.sender}-${msg.text}`;
        if (!processedChatIdsRef.current.has(msgId)) {
          processedChatIdsRef.current.add(msgId);
          hasNewMessage = true;
          if (msg.userId) {
            triggerSpeechBubble(msg.userId, msg.text);
          }
        }
      });

      if (hasNewMessage) {
        playChatNotificationSound();
      }

      setChatMessages(valid);
    }
  }, [socketChatMessages]);

  // Auto-purge messages older than 2 minutes every 6 seconds to keep chat clean and fast
  useEffect(() => {
    const purgeInterval = setInterval(() => {
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      setChatMessages((prev) => prev.filter((m: any) => {
        const ts = m.createdAt || m.timestamp || Date.now();
        return ts > twoMinutesAgo;
      }));
    }, 6000);
    return () => clearInterval(purgeInterval);
  }, []);

  const saveRoomMessage = (_msg: any) => {
    // Ephemeral live chat: auto-purged within 2 minutes, no stale disk caching
  };

  const handleExitWithPurge = () => {
    // If leaving leaves the room empty, clear chat messages
    if (participants.length <= 1) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`typro_chat_messages_${room.id}`);
      }
    }
    onExit();
  };

  // Round management and multi-hand cycle state
  const fallbackTextPool = [
    room.text || 'تایپ ده انگشتی یکی از مهارت های کلیدی عصر هوش مصنوعی برای افزایش تمرکز ذهنی و بهره وری نگارش است.',
    'سرعت در تایپ ثمره هماهنگی کامل چشم و مغز و سرانگشتان دست است که با تمرین مستمر شکوفا می شود.',
    'آرامش خاطر و تمرکز بر درستی کلمات بهترین راهنما برای شکستن رکوردهای سرعت در پیست های تایپرو است.',
    'دقت و تمرکز مداوم رمز اصلی تسلط بر صفحه کلید و ورود به جمع تایپیست های حرفه ای جهان است.',
  ];

  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [activeText, setActiveText] = useState(room.text);
  const [voteNotice, setVoteNotice] = useState<string | null>(null);
  const [roundIntermissionSeconds, setRoundIntermissionSeconds] = useState<number | null>(null);
  const [resultsReviewRemaining, setResultsReviewRemaining] = useState<number | null>(null);
  const [finishBubble, setFinishBubble] = useState<{ text: string; xp: number } | null>(null);
  const [lastRoundEarned, setLastRoundEarned] = useState<number>(40);
  const resultsReviewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resultsReviewStartedRef = useRef<boolean>(false);
  const [isAudioMutedState, setIsAudioMutedState] = useState<boolean>(() => isRaceAudioMuted());

  const handleToggleAudio = () => {
    const nextMuted = !isAudioMutedState;
    setIsAudioMutedState(nextMuted);
    setRaceAudioMuted(nextMuted);
    showToast(nextMuted ? '🔇 صدای مسابقه قطع شد.' : '🔊 صدای مسابقه فعال شد.');
  };

  // Race progress simulation & user participation
  const [participants, setParticipants] = useState<RaceParticipant[]>(() => {
    return room.participants.map((p) =>
      p.odUserId === currentUserId ? { ...p, name: resolvedUserName, skinId: selectedSkinId } : p
    );
  });
  const [raceState, setRaceState] = useState<string>('ACTIVE');
  const lastStrokeTimeRef = useRef<number>(Date.now());
  const raceStartTimeRef = useRef<number>(Date.now());
  const typingStartTimeRef = useRef<number | null>(null);
  const precisionFailsRef = useRef<number>(0);
  const [precisionFails, setPrecisionFails] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const keystrokeTimestampsRef = useRef<{ time: number; isCorrect?: boolean }[]>([]);
  const typedCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const powerUpTriggeredRef = useRef<boolean>(false);
  const smoothSpeedRef = useRef<number>(0);

  // Guard room text sync: Synchronize whenever server sends a new text, round, or room changes
  const currentRoomIdRef = useRef<string>(room.id);
  const lastSyncedTextRef = useRef<string>(room.text);
  const lastSyncedRoundRef = useRef<number>(room.currentRound || 1);

  useEffect(() => {
    // 1. If room actually changed (user switched rooms in lobby), reset immediately
    const roomChanged = room.id !== currentRoomIdRef.current;
    if (roomChanged) {
      currentRoomIdRef.current = room.id;
      lastSyncedTextRef.current = room.text;
      lastSyncedRoundRef.current = room.currentRound || 1;
      setActiveText(room.text);
      setCurrentRoundNumber(room.currentRound || 1);
      setTypedCount(0);
      typedCountRef.current = 0;
      setErrorCount(0);
      errorCountRef.current = 0;
      errorIndicesRef.current.clear();
      setErrorIndicesCount(0);
      setHasError(false);
      powerUpTriggeredRef.current = false;
      raceSavedRef.current = false;
      handAwardedRef.current = false;
      telemetryFramesRef.current = [];
      errorSpotsRef.current = [];
      lastStrokeTimeRef.current = Date.now();
      smoothSpeedRef.current = 0;
      raceStartTimeRef.current = Date.now();
      typingStartTimeRef.current = null;
      precisionFailsRef.current = 0;
      setPrecisionFails(0);
      setFinishBubble(null);
      setRoundIntermissionSeconds(null);
      setResultsReviewRemaining(null);
      resultsReviewStartedRef.current = false;
      finishOrderRef.current = [];
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          progressPercent: 0,
          wpm: 0,
          accuracy: 100,
          errors: 0,
          isFinished: false,
          finishPosition: undefined,
          isActive: true,
          isAbandoned: false,
          requestedTextChange: false,
        }))
      );
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    // 2. GOLDEN RULE 1: Never interrupt during the 2-second result review period!
    // When the user completes typing, the completed text, typed progress (100%), score bubble,
    // and car positions must remain visible and untouched for the entire 2 seconds before countdown.
    const isReviewingResults =
      resultsReviewRemaining !== null ||
      (room.state === 'INTERMISSION' && room.intermissionSeconds !== undefined && room.intermissionSeconds > 5);

    if (isReviewingResults) {
      return;
    }

    // 3. Protect user typing mid-race: Never interrupt active typists unless the round has explicitly changed
    const roundChanged = Boolean(room.currentRound && room.currentRound !== lastSyncedRoundRef.current);
    const isIntermissionOrCountdown =
      room.state === 'INTERMISSION' ||
      (room.intermissionSeconds !== undefined && room.intermissionSeconds > 0) ||
      roundIntermissionSeconds !== null;

    const isActivelyTypingMidRace =
      room.state === 'ACTIVE' &&
      !isIntermissionOrCountdown &&
      !roundChanged &&
      typedCountRef.current > 0 &&
      !currentPlayer?.isFinished;

    if (isActivelyTypingMidRace) {
      return;
    }

    // 4. GOLDEN RULE 2: Preparation during the 5-second countdown
    // When countdown starts (5s..), the new text is activated and cars reset to start line (0%).
    // When countdown ends and race starts (race_started), the text MUST REMAIN THE EXACT SAME TEXT!
    const textChanged = Boolean(room.text && room.text !== lastSyncedTextRef.current);

    // Golden Rule: Only sync new text when entering countdown/intermission OR when a new round has officially started
    // In ACTIVE state, text NEVER changes until the round is over!
    if (roundChanged || (isIntermissionOrCountdown && textChanged)) {
      if (room.text) {
        lastSyncedTextRef.current = room.text;
        setActiveText(room.text);
      }
      if (room.currentRound) {
        lastSyncedRoundRef.current = room.currentRound;
        setCurrentRoundNumber(room.currentRound);
      }

      setTypedCount(0);
      typedCountRef.current = 0;
      setErrorCount(0);
      errorCountRef.current = 0;
      errorIndicesRef.current.clear();
      setErrorIndicesCount(0);
      setHasError(false);
      powerUpTriggeredRef.current = false;
      raceSavedRef.current = false;
      handAwardedRef.current = false;
      telemetryFramesRef.current = [];
      errorSpotsRef.current = [];
      lastStrokeTimeRef.current = Date.now();
      smoothSpeedRef.current = 0;
      raceStartTimeRef.current = Date.now();
      typingStartTimeRef.current = null;
      precisionFailsRef.current = 0;
      setPrecisionFails(0);
      setFinishBubble(null);
      if (room.state !== 'INTERMISSION' || (room.intermissionSeconds !== undefined && room.intermissionSeconds <= 0)) {
        setRoundIntermissionSeconds(null);
      }
      setResultsReviewRemaining(null);
      resultsReviewStartedRef.current = false;
      finishOrderRef.current = [];

      // Reset participants to start line (0%) and clear finished state for the new round
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          progressPercent: 0,
          wpm: 0,
          accuracy: 100,
          errors: 0,
          isFinished: false,
          finishPosition: undefined,
          isActive: true,
          isAbandoned: false,
          requestedTextChange: false,
        }))
      );

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [room.id, room.text, room.currentRound, room.state, room.intermissionSeconds, roundIntermissionSeconds, resultsReviewRemaining]);

  const targetText = React.useMemo(() => {
    return (activeText || room.text || '')
      .replace(/[\u200c\u200b\uFEFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [activeText, room.text]);

  // Robust match for local player (handles logged-in user, guest, and local IDs)
  const myUserId = user?.id || currentUserId;
  const isMyUser = React.useCallback(
    (id?: string) => {
      if (!id) return false;
      return (
        id === currentUserId ||
        id === myUserId ||
        (user?.id && id === user.id) ||
        (typeof window !== 'undefined' && id === localStorage.getItem('typro_user_id')) ||
        id.startsWith('participant-me')
      );
    },
    [currentUserId, myUserId, user?.id]
  );

  const currentPlayer = participants.find((p) => isMyUser(p.odUserId));
  const isCurrentlySpectator = isSpectator || Boolean(currentPlayer?.isSpectator);
  const activeSkin = getSkinById(selectedSkinId);

  // Typeo & EdClub standard live responsive speed calculator for live race (WPM)
  const calculateInstantWpm = React.useCallback((now: number = Date.now()): number => {
    return Math.max(0, Math.min(280, Math.round(smoothSpeedRef.current)));
  }, []);

  // Hand award guard (prevents double awarding per hand, resets on each new round)
  const handAwardedRef = useRef<boolean>(false);

  // Centralized Hand Reward Awarder (1:1 Coins with Points)
  const awardHandReward = React.useCallback(
    (earnedScore: number, accuracyPct: number, currentNetWpm: number) => {
      if (handAwardedRef.current) return;
      handAwardedRef.current = true;

      const baseCoins = (user && typeof user.coins === 'number') ? user.coins : 0;
      const rawStoredCoins = typeof window !== 'undefined' ? localStorage.getItem('typro_user_coins') : null;
      const curCoins = rawStoredCoins !== null ? Number(rawStoredCoins) : baseCoins;
      const nextCoins = curCoins + earnedScore;

      const baseXp = (user && typeof user.xp === 'number') ? user.xp : curCoins;
      const rawStoredXp = typeof window !== 'undefined' ? localStorage.getItem('typro_user_xp') : null;
      const curXp = rawStoredXp !== null ? Number(rawStoredXp) : Math.max(baseXp, curCoins);
      const nextXp = Math.max(curXp + earnedScore, nextCoins);
      const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);

      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_user_coins', String(nextCoins));
        localStorage.setItem('typro_user_xp', String(nextXp));
        localStorage.setItem('typro_user_level', String(nextLevel));
        const prevWon = Number(localStorage.getItem('typro_races_won') || 0);
        localStorage.setItem('typro_races_won', String(prevWon + 1));
        const prevBestWpm = Number(localStorage.getItem('typro_best_wpm') || 0);
        if (currentNetWpm > prevBestWpm) {
          localStorage.setItem('typro_best_wpm', String(currentNetWpm));
        }
      }

      setLiveCoins(nextCoins);
      setLiveXp(nextXp);
      setLastRoundEarned(earnedScore);
      setFinishBubble({
        text: `+${earnedScore} سکه و امتیاز 🎉 ${accuracyPct >= 100 ? '(دقت ۱۰۰٪)' : `(دقت ${accuracyPct}٪)`}`,
        xp: earnedScore,
      });

      showToast(`🎉 تبریک! ${earnedScore} سکه و ${earnedScore} امتیاز دست جدید دریافت شد! (موجودی: ${nextCoins.toLocaleString('fa-IR')} سکه)`);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('typro_economy_updated'));
      }

      const effectiveUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('typro_user_id') : null) || currentUserId;
      const effectiveUsername = user?.username || (typeof window !== 'undefined' ? localStorage.getItem('typro_username') : null) || resolvedUserName;
      const effectiveDisplayName = user?.displayName || (typeof window !== 'undefined' ? localStorage.getItem('typro_profile_name') : null) || resolvedUserName;

      fetch('/api/gamification/record-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          username: effectiveUsername,
          displayName: effectiveDisplayName,
          earnedXp: earnedScore,
          earnedCoins: earnedScore,
          wonRace: true,
          wpm: currentNetWpm,
          accuracy: accuracyPct,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            if (data.coins) {
              localStorage.setItem('typro_user_coins', String(data.coins));
              setLiveCoins(data.coins);
            }
            if (data.xp) {
              localStorage.setItem('typro_user_xp', String(data.xp));
              setLiveXp(data.xp);
            }
            if (data.level) localStorage.setItem('typro_user_level', String(data.level));
            window.dispatchEvent(new Event('typro_economy_updated'));
          }
        })
        .catch((e) => console.warn('Failed recording hand progress:', e));
    },
    [user, currentUserId, resolvedUserName]
  );

  // Auto focus input on active state, countdown, and round start
  useEffect(() => {
    if (isCurrentlySpectator) return;

    const shouldFocus = (raceState === 'ACTIVE' || roundIntermissionSeconds !== null) && resultsReviewRemaining === null;
    if (shouldFocus) {
      inputRef.current?.focus();
      const t1 = setTimeout(() => inputRef.current?.focus(), 50);
      const t2 = setTimeout(() => inputRef.current?.focus(), 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [raceState, roundIntermissionSeconds, resultsReviewRemaining, isCurrentlySpectator]);

  // Telemetry recording for Race Replay & Telemetry
  const telemetryFramesRef = useRef<{
    timeSec: number;
    playerProgress: number;
    playerWpm: number;
    playerAcc: number;
    errorCount: number;
    typedChars: number;
    opponents: { id: string; name: string; progress: number; wpm: number; skinId: string }[];
  }[]>([]);
  const errorSpotsRef = useRef<number[]>([]);
  const raceSavedRef = useRef<boolean>(false);

  // Frame-by-frame telemetry recorder during active race
  useEffect(() => {
    if (raceState !== 'ACTIVE' || currentPlayer?.isFinished) return;

    const sampleInterval = setInterval(() => {
      const timingStart = typingStartTimeRef.current || raceStartTimeRef.current;
      const elapsedSec = Math.max(0.1, (Date.now() - timingStart) / 1000);
      telemetryFramesRef.current.push({
        timeSec: Number(elapsedSec.toFixed(1)),
        playerProgress: currentPlayer?.progressPercent || 0,
        playerWpm: currentPlayer?.wpm || 0,
        playerAcc: currentPlayer?.accuracy || 100,
        errorCount: errorCount,
        typedChars: typedCount,
        opponents: participants
          .filter((p) => p.odUserId !== currentUserId)
          .map((p) => ({
            id: p.odUserId,
            name: p.name,
            progress: p.progressPercent || 0,
            wpm: p.wpm || 0,
            skinId: p.skinId || 'skin-porsche'
          }))
      });
    }, 350);

    return () => clearInterval(sampleInterval);
  }, [raceState, currentPlayer?.isFinished, currentPlayer?.progressPercent, currentPlayer?.wpm, currentPlayer?.accuracy, errorCount, typedCount, participants, currentUserId]);

  // Real-time speed updater while race is active (smooth natural deceleration on prolonged pauses)
  useEffect(() => {
    if (raceState !== 'ACTIVE' || currentPlayer?.isFinished) return;

    const decayInterval = setInterval(() => {
      if (!lastStrokeTimeRef.current || !typingStartTimeRef.current) return;
      const now = Date.now();
      const idleMs = now - lastStrokeTimeRef.current;
      // Grace period: within 1000ms, finger transitions between words don't drop speed.
      // On prolonged pauses (> 1000ms), gently and smoothly decelerate at ~3 WPM per second (0.3 WPM per 100ms)
      if (idleMs > 1000 && smoothSpeedRef.current > 0) {
        smoothSpeedRef.current = Math.max(0, smoothSpeedRef.current - 0.3);
        const decayedWpm = Math.round(smoothSpeedRef.current);
        setParticipants((prev) =>
          prev.map((p) => {
            if (isMyUser(p.odUserId) && !p.isFinished) {
              if (p.wpm === decayedWpm) return p;
              return { ...p, wpm: decayedWpm };
            }
            return p;
          })
        );
      }
    }, 100);

    return () => clearInterval(decayInterval);
  }, [raceState, currentPlayer?.isFinished, isMyUser]);

  // Save full race telemetry when race completes for Race Replay & Telemetry
  useEffect(() => {
    if (currentPlayer?.isFinished && !raceSavedRef.current) {
      raceSavedRef.current = true;
      const timingStart = typingStartTimeRef.current || raceStartTimeRef.current;
      const durationSec = Math.max(1, Math.round((Date.now() - timingStart) / 1000));
      
      const sorted = [...participants].sort((a, b) => {
        if (a.isFinished && b.isFinished && a.finishPosition && b.finishPosition) {
          return a.finishPosition - b.finishPosition;
        }
        if (a.isFinished && !b.isFinished) return -1;
        if (!a.isFinished && b.isFinished) return 1;
        return (b.progressPercent || 0) - (a.progressPercent || 0);
      });
      const userRankIndex = sorted.findIndex((p) => isMyUser(p.odUserId));
      const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;
      const winner = sorted[0];

      // Interpolate 11 curve points for WPM dynamics chart
      const frames = telemetryFramesRef.current;
      const sampleWpmCurve: number[] = [];
      for (let i = 0; i <= 10; i++) {
        const targetTime = (i / 10) * durationSec;
        const closest = frames.find((f) => f.timeSec >= targetTime) || frames[frames.length - 1];
        sampleWpmCurve.push(closest ? closest.playerWpm : (currentPlayer.wpm || 0));
      }

      const replaySession = {
        raceId: `R-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('fa-IR'),
        roomName: room.title || `پیست سرور ${room.id}`,
        targetText: targetText,
        totalDurationSec: durationSec,
        winnerName: winner?.name || currentPlayer.name,
        myRank: userRank,
        userSkinId: selectedSkinId,
        participants: sorted.map((p, idx) => ({
          id: p.id,
          odUserId: p.odUserId,
          name: p.odUserId === currentUserId ? `${p.name} (شما)` : p.name,
          role: idx === 0 ? 'برنده مسابقه' : idx === 1 ? 'مقام دوم' : `مقام ${idx + 1}`,
          color: idx === 0 ? '#2563eb' : idx === 1 ? '#10b981' : '#f59e0b',
          skinId: p.odUserId === currentUserId ? selectedSkinId : (p.skinId || (idx === 0 ? 'skin-porsche' : 'skin-kawasaki-h2')),
          isUser: p.odUserId === currentUserId,
          peakWpm: Math.round((p.wpm || 60) * 1.15),
          avgWpm: p.wpm || 60,
          accuracy: p.accuracy || 98,
          entropy: 4.82,
          finishPosition: idx + 1,
          speedMult: Math.max(0.7, 1 - idx * 0.08),
          wpmCurve: p.odUserId === currentUserId
            ? sampleWpmCurve
            : sampleWpmCurve.map((w) => Math.max(25, Math.round(w * (0.85 + (idx % 2 === 0 ? 0.15 : -0.1))))),
          errorSpots: p.odUserId === currentUserId ? errorSpotsRef.current : [15, 62]
        })),
        frames: frames
      };

      try {
        localStorage.setItem('typro_last_race_replay', JSON.stringify(replaySession));
        const prevHistRaw = localStorage.getItem('typro_race_replays_history');
        const prevHist = prevHistRaw ? JSON.parse(prevHistRaw) : [];
        localStorage.setItem('typro_race_replays_history', JSON.stringify([replaySession, ...prevHist.slice(0, 9)]));
      } catch (err) {
        console.error('Failed to store race replay session:', err);
      }

      // Award hand reward (1:1 coins and XP)
      try {
        const acc = currentPlayer.accuracy !== undefined ? currentPlayer.accuracy : 100;
        let earnedXp = 40;
        if (acc >= 100) earnedXp = 40;
        else if (acc >= 99) earnedXp = 38;
        else if (acc >= 98) earnedXp = 35;
        else if (acc >= 95) earnedXp = 30;
        else if (acc >= 90) earnedXp = 25;
        else if (acc >= 80) earnedXp = 20;
        else earnedXp = Math.max(10, Math.round(acc * 0.2));

        if (userRank === 1) {
          earnedXp += 10;
        }

        awardHandReward(earnedXp, acc, currentPlayer.wpm || 0);
      } catch (err) {
        console.warn('Error recording race progress:', err);
      }
    }
  }, [currentPlayer?.isFinished, raceState, awardHandReward]);

  // Sync participants when room prop changes, skin changes, or user profile name updates (Smooth, Jitter-free)
  useEffect(() => {
    setParticipants((prev) => {
      const prevMe = prev.find((p) => isMyUser(p.odUserId));
      const isDuringCountdown = roundIntermissionSeconds !== null;
      const currentLocalProgress = isDuringCountdown
        ? 0
        : Math.min(100, Math.round((typedCountRef.current / Math.max(1, targetText.length)) * 100));
      const mySavedProgress = currentLocalProgress;
      const mySavedWpm = isDuringCountdown ? 0 : (prevMe?.wpm || 0);
      const totalAttempted = typedCountRef.current + errorCountRef.current;
      const currentRealAcc = totalAttempted > 0
        ? Math.max(0, Math.min(100, Math.round((typedCountRef.current / totalAttempted) * 100)))
        : (prevMe?.accuracy ?? 100);
      const mySavedErr = isDuringCountdown ? 0 : errorCountRef.current;
      const mySavedFin = isDuringCountdown ? false : (currentLocalProgress >= 100);
      const mySavedRank = isDuringCountdown ? undefined : prevMe?.finishPosition;

      let list = room.participants.map((item) => {
        const prevItem = prev.find((x) => (x.odUserId && x.odUserId === item.odUserId) || (x.id && x.id === item.id));
        if (isDuringCountdown) {
          return {
            ...item,
            progressPercent: 0,
            wpm: 0,
            accuracy: 100,
            errors: 0,
            isFinished: false,
            finishPosition: undefined,
          };
        }
        if (!prevItem) return item;
        return {
          ...item,
          wpm: (item.wpm !== undefined && item.wpm > 0) ? item.wpm : (prevItem.wpm ?? item.wpm ?? 0),
          accuracy: item.accuracy !== undefined ? item.accuracy : (prevItem.accuracy ?? 100),
          errors: item.errors !== undefined ? item.errors : (prevItem.errors ?? 0),
          isFinished: item.isFinished || prevItem.isFinished,
          finishPosition: item.finishPosition || prevItem.finishPosition,
        };
      });
      const meIndex = list.findIndex((p) => isMyUser(p.odUserId));

      if (meIndex >= 0) {
        list[meIndex] = {
          ...list[meIndex],
          name: resolvedUserName,
          skinId: selectedSkinId || list[meIndex].skinId,
          progressPercent: mySavedProgress,
          wpm: prevMe?.wpm !== undefined ? prevMe.wpm : list[meIndex].wpm,
          accuracy: currentRealAcc,
          errors: mySavedErr,
          isFinished: mySavedFin,
          finishPosition: list[meIndex].finishPosition || mySavedRank,
          isSpectator: isSpectator !== undefined ? isSpectator : list[meIndex].isSpectator,
        };
      } else if (!isSpectator) {
        const myLane: RaceParticipant = {
          id: prevMe?.id || `participant-me-${Date.now()}`,
          odUserId: user?.id || currentUserId,
          name: resolvedUserName,
          progressPercent: mySavedProgress,
          wpm: mySavedWpm,
          accuracy: currentRealAcc,
          errors: mySavedErr,
          isActive: true,
          isAbandoned: false,
          isFinished: mySavedFin,
          finishPosition: mySavedRank,
          skinId: selectedSkinId || 'skin-vw-beetle',
          level: user ? (user.level || 1) : 1,
          cup: 'کاپ طلایی',
          lane: list.length + 1,
          lastTypingTimestamp: Date.now(),
          requestedTextChange: false,
          isSpectator: false,
        };
        list.push(myLane);
      }
      return list;
    });
  }, [room.id, room.participants, currentUserId, user?.id, selectedSkinId, resolvedUserName, isSpectator, targetText.length]);

  // Active Racers (Strict 8 on-track maximum) & Spectators
  const activeRacers = React.useMemo(() => {
    return participants.filter((p) => !p.isSpectator).slice(0, 8);
  }, [participants]);

  const spectators = React.useMemo(() => {
    return participants.filter((p) => Boolean(p.isSpectator));
  }, [participants]);

  // Ordered log of finishers in the current hand (ensures strictly unique, non-duplicate 1st/2nd/3rd ranks)
  const finishOrderRef = useRef<string[]>([]);

  useEffect(() => {
    participants.forEach((p) => {
      if (p.isFinished) {
        const id = p.odUserId || p.id;
        if (id && !finishOrderRef.current.includes(id)) {
          if (p.finishPosition === 1) {
            finishOrderRef.current.unshift(id);
          } else {
            finishOrderRef.current.push(id);
          }
        }
      }
    });
  }, [participants]);

  // Strictly accurate rank calculation: 1st, 2nd, 3rd, etc. (never duplicate 1st place!)
  const getParticipantRank = React.useCallback(
    (p: RaceParticipant): number => {
      const pId = p.odUserId || p.id;

      // 1. If explicit finishPosition is assigned (> 0), use it
      if (typeof p.finishPosition === 'number' && p.finishPosition > 0) {
        return p.finishPosition;
      }

      // 2. Check position in arrival order ref
      const orderIdx = finishOrderRef.current.indexOf(pId);
      if (orderIdx >= 0) {
        return orderIdx + 1;
      }

      // 3. Fallback: Sort all finished participants uniquely (no two participants get the same rank!)
      const finished = participants.filter((item) => item.isFinished);
      const sortedFinished = [...finished].sort((a, b) => {
        const posA = a.finishPosition || 999;
        const posB = b.finishPosition || 999;
        if (posA !== posB) return posA - posB;
        const idxA = finishOrderRef.current.indexOf(a.odUserId || a.id);
        const idxB = finishOrderRef.current.indexOf(b.odUserId || b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return (b.wpm || 0) - (a.wpm || 0);
      });

      const idx = sortedFinished.findIndex((item) => (item.odUserId || item.id) === pId);
      return idx >= 0 ? idx + 1 : finished.length + 1;
    },
    [participants]
  );

  // Synchronize intermission countdown with authoritative server in multiplayer mode
  useEffect(() => {
    if (isConnected) {
      if (room.state === 'INTERMISSION' && room.intermissionSeconds !== undefined && room.intermissionSeconds > 0) {
        if (room.intermissionSeconds > 5) {
          // Exactly 2 seconds viewing score, rank, and results
          setResultsReviewRemaining(room.intermissionSeconds - 5);
          setRoundIntermissionSeconds(null);
        } else {
          // Exactly 5 seconds circular countdown timer
          setResultsReviewRemaining(null);
          setRoundIntermissionSeconds(room.intermissionSeconds);
        }
      } else if (room.state === 'ACTIVE') {
        setResultsReviewRemaining(null);
        setRoundIntermissionSeconds(null);
      }
    }
  }, [isConnected, room.state, room.intermissionSeconds]);

  // ZERO BOTS: All participants are 100% real human typists.
  // When round finishes or user completes typing: Standalone / offline fallback
  useEffect(() => {
    if (isConnected) return; // Server coordinates intermission for multiplayer room
    if (raceState !== 'ACTIVE' && room.state !== 'INTERMISSION') return;
    if (roundIntermissionSeconds !== null || resultsReviewStartedRef.current) return;

    const activeList = participants.filter((p) => p.isActive && !p.isAbandoned);
    const userFinished = currentPlayer?.isFinished;
    const allFinished = activeList.length > 0 && activeList.every((p) => p.isFinished);
    const shouldStartPostFinishFlow = allFinished || userFinished || room.state === 'INTERMISSION';

    if (shouldStartPostFinishFlow) {
      resultsReviewStartedRef.current = true;
      setResultsReviewRemaining(2);

      let remaining = 2;
      const reviewInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(reviewInterval);
          resultsReviewTimerRef.current = null;
          setResultsReviewRemaining(null);
          // 2 seconds review finished -> ACTIVATE NEW TEXT & RESET CARS IMMEDIATELY AT COUNTDOWN START!
          const nextRound = currentRoundNumber + 1;
          setCurrentRoundNumber(nextRound);
          lastSyncedRoundRef.current = nextRound;
          const pool = room.textPool && room.textPool.length > 0 ? room.textPool : fallbackTextPool;
          const nextIndex = (nextRound - 1) % pool.length;
          const chosenText = pool[nextIndex];
          setActiveText(chosenText);
          lastSyncedTextRef.current = chosenText;
          setTypedCount(0);
          setErrorCount(0);
          setHasError(false);
          typedCountRef.current = 0;
          errorCountRef.current = 0;
          errorIndicesRef.current.clear();
          setErrorIndicesCount(0);
          powerUpTriggeredRef.current = false;
          raceSavedRef.current = false;
          handAwardedRef.current = false;
          telemetryFramesRef.current = [];
          errorSpotsRef.current = [];
          lastStrokeTimeRef.current = Date.now();
          raceStartTimeRef.current = Date.now();
          typingStartTimeRef.current = null;
          precisionFailsRef.current = 0;
          setPrecisionFails(0);
          setFinishBubble(null);
          setParticipants((prev) =>
            prev.map((p) => ({
              ...p,
              progressPercent: 0,
              wpm: 0,
              accuracy: 100,
              errors: 0,
              isFinished: false,
              finishPosition: undefined,
              isActive: true,
              isAbandoned: false,
              requestedTextChange: false,
            }))
          );
          setRoundIntermissionSeconds(5);
        } else {
          setResultsReviewRemaining(remaining);
        }
      }, 1000);

      resultsReviewTimerRef.current = reviewInterval as any;
    }
  }, [isConnected, participants, currentPlayer?.isFinished, raceState, room.state, roundIntermissionSeconds]);

  // Intermission Countdown interval (5.. 4.. 3.. 2.. 1.. -> Start Next Round) - Guaranteed to tick down reliably
  useEffect(() => {
    // When connected to multiplayer server, authoritative server drives intermission countdown via socket
    if (isConnected) return;
    if (roundIntermissionSeconds === null) return;

    if (roundIntermissionSeconds <= 0) {
      handleStartNextRound();
      return;
    }

    const timer = setInterval(() => {
      setRoundIntermissionSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleStartNextRound(), 50);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected, roundIntermissionSeconds]);

  const textChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartNextRound = () => {
    setFinishBubble(null);
    setRoundIntermissionSeconds(null);
    setResultsReviewRemaining(null);
    resultsReviewStartedRef.current = false;
    raceStartTimeRef.current = Date.now();
    typingStartTimeRef.current = null;
    precisionFailsRef.current = 0;
    setPrecisionFails(0);
    if (textChangeTimeoutRef.current) {
      clearTimeout(textChangeTimeoutRef.current);
      textChangeTimeoutRef.current = null;
    }
    if (resultsReviewTimerRef.current) {
      clearInterval(resultsReviewTimerRef.current);
      resultsReviewTimerRef.current = null;
    }

    setRaceState('ACTIVE');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  };

  // قوانین تعویض متن دقیقاً طبق دستور کاربر:
  // ۱. اگر کاربر ۱ نفر بود: با زدن دکمه، پس از ۲ ثانیه، همان ثانیه‌شمار ۵ ثانیه‌ای دور بعدی آغاز می‌شود.
  // ۲. اگر چند نفر بودند: تا زمانی که همه موافقت نکنند عوض نمی‌شود.
  // ۳. کسانی که متن را تمام کرده‌اند خود به خود حکم رأی مثبت دارند.
  // ۴. همه افراد باقی‌مانده که مسابقه را تمام نکرده‌اند و دست از تایپ نکشیده‌اند باید تعویض متن را زده باشند.
  const handleVoteChangeText = (isAutoVoteFromExhaustion: boolean = false) => {
    if (roundIntermissionSeconds !== null || resultsReviewRemaining !== null || textChangeTimeoutRef.current) return;

    const activeList = participants.filter((p) => p.isActive && !p.isAbandoned);
    const unfinishedTypers = activeList.filter((p) => !p.isFinished);

    const triggerApprovedTextChange = () => {
      showToast('🔄 تعویض متن تایید شد؛ آماده‌سازی دور جدید (۲ ثانیه)...');
      if (onRequestTextChange) {
        onRequestTextChange();
      }
      if (!isConnected) {
        setResultsReviewRemaining(2);
        if (textChangeTimeoutRef.current) clearTimeout(textChangeTimeoutRef.current);
        textChangeTimeoutRef.current = setTimeout(() => {
          setResultsReviewRemaining(null);
          const pool = [
            "تایپ ده انگشتی سرعت تفکر را دوچندان می کند.",
            "بنی آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند.",
            "به نام خداوند جان و خرد کزین برتر اندیشه برنگذرد.",
            "توانا بود هر که دانا بود ز دانش دل پیر برنا بود.",
            "سعدیا مرد نکونام نمیرد هرگز مرده آن است که نامش به نکویی نبرند.",
            "Clean code always looks like it was written by someone who cares.",
            "Simplicity is the soul of efficiency."
          ].filter((t) => t !== activeText);
          const nextText = pool[Math.floor(Math.random() * pool.length)] || pool[0];
          setActiveText(nextText);
          lastSyncedTextRef.current = nextText;
          const nextRnd = currentRoundNumber + 1;
          setCurrentRoundNumber(nextRnd);
          lastSyncedRoundRef.current = nextRnd;
          setTypedCount(0);
          typedCountRef.current = 0;
          setErrorCount(0);
          errorCountRef.current = 0;
          errorIndicesRef.current.clear();
          setErrorIndicesCount(0);
          setHasError(false);
          setFinishBubble(null);
          typingStartTimeRef.current = null;
          raceStartTimeRef.current = Date.now();
          precisionFailsRef.current = 0;
          setPrecisionFails(0);
          setParticipants((prev) =>
            prev.map((p) => ({
              ...p,
              progressPercent: 0,
              wpm: 0,
              accuracy: 100,
              errors: 0,
              isFinished: false,
              finishPosition: undefined,
              isActive: true,
              isAbandoned: false,
              requestedTextChange: false,
              voteChangeText: false,
            }))
          );
          setRoundIntermissionSeconds(5);
          textChangeTimeoutRef.current = null;
        }, 2000);
      }
    };

    // ۱. حالت تک نفره (یا فقط یک نفر فعال باقی‌مانده)
    if (activeList.length <= 1) {
      triggerApprovedTextChange();
      return;
    }

    // ۲. ارسال رأی به سوکت سرور در صورت اتصال
    if (onRequestTextChange) {
      onRequestTextChange();
    }

    // ۳. ثبت رأی کاربر جاری در لیست شرکت‌کنندگان
    setParticipants((prev) =>
      prev.map((p) => (isMyUser(p.odUserId) ? { ...p, requestedTextChange: true, voteChangeText: true } : p))
    );

    // ۴. بررسی موافقت تمامی افراد ناتمام فعال (کسانی که تمام کرده‌اند خودکار موافقند)
    const otherUnfinished = unfinishedTypers.filter((p) => !isMyUser(p.odUserId));
    const allRemainingVoted = otherUnfinished.length === 0 || otherUnfinished.every((p) => p.requestedTextChange || p.voteChangeText || p.isAbandoned);

    if (allRemainingVoted) {
      triggerApprovedTextChange();
    } else {
      const currentVotes = 1 + otherUnfinished.filter((p) => p.requestedTextChange || p.voteChangeText).length;
      if (!isAutoVoteFromExhaustion) {
        showToast(`🗳️ درخواست شما ثبت شد (${currentVotes} از ${unfinishedTypers.length} راننده ناتمام موافقت کردند).`);
      }
    }
  };

  // Inactivity detection conforming to Race Room rules:
  // 1. Players actively typing are NEVER interrupted (text does not change).
  // 2. If a player stops typing, they have 5 seconds to resume.
  // 3. If winners are waiting and an unfinished player stops for 5s: priority to winners -> next hand!
  // 4. No warning banner popup is shown. Nobody is kicked out of the room.
  useEffect(() => {
    if (raceState !== 'ACTIVE' || currentPlayer?.isFinished) {
      return;
    }

    const interval = setInterval(() => {
      const idleTime = (Date.now() - lastStrokeTimeRef.current) / 1000;
      const hasNeverTyped = typedCountRef.current === 0;

      // Check if any opponent has already completed the race
      const otherParticipants = participants.filter((p) => p.odUserId !== currentUserId);
      const hasFinishedWinner = otherParticipants.some((p) => p.isFinished);

      // If a winner exists and current player stopped typing for 5 seconds:
      // Priority goes to the winning players -> transition to intermission for next hand
      if (
        hasFinishedWinner &&
        idleTime >= 5 &&
        roundIntermissionSeconds === null &&
        resultsReviewRemaining === null &&
        !resultsReviewStartedRef.current
      ) {
        resultsReviewStartedRef.current = true;
        setResultsReviewRemaining(2);
        setTimeout(() => {
          setResultsReviewRemaining(null);
          setRoundIntermissionSeconds(5);
        }, 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [raceState, currentUserId, currentPlayer?.isFinished, participants]);

  // Precision Room (Strictly only Room 5 Persian Precision & Room 6 English Precision)
  const isPrecisionRoom = room.id === 'room-5' || room.id === 'room-6';

  // Handle live typing in race (No Backspace needed, direct correction)
  const handleTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (raceState !== 'ACTIVE' || currentPlayer?.isFinished || currentPlayer?.isAbandoned) return;
    if (isPrecisionRoom && precisionFailsRef.current >= 3) return;

    lastStrokeTimeRef.current = Date.now();
    setInactivityCountdown(null);

    const key = e.key;

    if (key === 'Backspace') {
      e.preventDefault();
      if (hasError) {
        setHasError(false);
      }
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey || key.length > 1) return;
    e.preventDefault();

    const isSpaceKey = key === ' ' || e.code === 'Space' || key === '\u200c';
    // Standard mechanical keystroke audio feedback (Local to user only)
    playKeyClickSound(isSpaceKey);

    // Start timing on the player's first keystroke (Typro / Typeo standard)
    if (typingStartTimeRef.current === null) {
      typingStartTimeRef.current = Date.now();
    }

    const expectedChar = targetText[typedCount];
    const isNumbersRoom = 
      room.id.includes('numbers') || 
      room.topic?.includes('اعداد') || 
      room.title?.includes('اعداد') ||
      /^[\d\u06F0-\u06F9\u0660-\u0669\s]+$/.test(targetText);

    // Bidirectional digit normalization supporting English, Persian, and Arabic digits
    const normalizeDigit = (c: string): string => {
      if (!c) return '';
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const arDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      const fIdx = faDigits.indexOf(c);
      if (fIdx !== -1) return String(fIdx);
      const aIdx = arDigits.indexOf(c);
      if (aIdx !== -1) return String(aIdx);
      return c;
    };

    const normKey = normalizeDigit(key);
    const normExpected = normalizeDigit(expectedChar);
    const isDigitTarget = /\d/.test(normExpected);
    const isDigitCode =
      (e.code.startsWith('Numpad') && e.code.length === 7 && e.code.slice(6) === normExpected) ||
      (e.code.startsWith('Digit') && e.code.length === 6 && e.code.slice(5) === normExpected);

    const isDigitMatch = isDigitTarget && (normKey === normExpected || isDigitCode);

    // Persian letter 'پ' multi-layout & Fingilish support:
    // 1. Physical key Backquote (top-left, next to 1 / above Tab): produces ` or ~
    // 2. Physical key Backslash (above / next to Enter): produces \ or |
    // 3. Persian key 'پ'
    // 4. In Persian mode, legacy Arabic mapping 'm' / 'M'
    const isPeMatch = (expectedChar === 'پ') && (
      key === 'پ' ||
      e.code === 'Backquote' ||
      e.code === 'Backslash' ||
      key === '`' || key === '~' ||
      key === '\\' || key === '|' ||
      ((key === 'm' || key === 'M') && room.language === 'fa')
    );

    // In Numbers Room: Space key is never required. If pressed, smoothly ignore without penalty
    if (isNumbersRoom && isSpaceKey) {
      if (expectedChar === ' ') {
        let nxt = typedCount + 1;
        while (nxt < targetText.length && targetText[nxt] === ' ') {
          nxt++;
        }
        setTypedCount(nxt);
      }
      return;
    }

    const normalizeChar = (c: string) => {
      if (!c) return '';
      if (c === '\u200c' || c === '\u200b') return ' ';
      if (c === 'ي') return 'ی';
      if (c === 'ك') return 'ک';
      return c;
    };

    const isExpectedSpace = expectedChar === ' ' || expectedChar === '\u200c';

    const isCorrect =
      key === expectedChar ||
      isDigitMatch ||
      isPeMatch ||
      (isSpaceKey && isExpectedSpace) ||
      (room.language === 'fa' && normalizeChar(key) === normalizeChar(expectedChar));

    if (isCorrect) {
      if (hasError) {
        setHasError(false);
      }
      let nextCount = typedCount + 1;

      // In Numbers Room: automatically skip spaces between number chunks!
      if (isNumbersRoom) {
        while (nextCount < targetText.length && targetText[nextCount] === ' ') {
          nextCount++;
        }
      }

      let finalNextCount = nextCount;
      let triggeredPowerUp = false;

      // Real Power-up auto completion
      if (isPowerUpEnabled && activePowerUpItem && !powerUpTriggeredRef.current && raceState === 'ACTIVE' && !isSpectator) {
        const threshold = activePowerUpItem.thresholdPct; // e.g. 90, 80, 70, 45
        const reqAcc = activePowerUpItem.requireAccuracy100;
        const reqVIP = activePowerUpItem.requireVIP;
        const isSub = typeof window !== 'undefined' ? localStorage.getItem('typro_user_is_subscribed') === 'true' : false;

        const meetsVIP = !reqVIP || isSub;
        const meetsAcc = !reqAcc || errorCount === 0;
        const reachedPct = Math.round((nextCount / targetText.length) * 100);

        if (meetsVIP && meetsAcc && reachedPct >= threshold) {
          triggeredPowerUp = true;
          powerUpTriggeredRef.current = true;
          finalNextCount = targetText.length;
          showToast(`⚡ قابلیت «${activePowerUpItem.name}» فعال شد! خودرو با سرعت نیترو شلیک شد و خط پایان فتح گردید!`);
          try {
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
          } catch {}
        }
      }

      setTypedCount(finalNextCount);
      typedCountRef.current = finalNextCount;
      errorCountRef.current = errorCount;
      const now = Date.now();
      const prevTime = lastStrokeTimeRef.current;
      lastStrokeTimeRef.current = now;

      let deltaMs = prevTime > 0 ? now - prevTime : 240;
      deltaMs = Math.min(650, Math.max(60, deltaMs));
      const instantKeystrokeWpm = 12000 / deltaMs;
      const clampedWpm = Math.min(180, Math.max(15, instantKeystrokeWpm));

      if (smoothSpeedRef.current === 0) {
        smoothSpeedRef.current = clampedWpm;
      } else {
        const alpha = 0.25;
        smoothSpeedRef.current = (1 - alpha) * smoothSpeedRef.current + alpha * clampedWpm;
      }

      keystrokeTimestampsRef.current.push({ time: now, isCorrect: true });

      const progress = Math.min(100, Math.round((finalNextCount / targetText.length) * 100));

      const typingStart = typingStartTimeRef.current || raceStartTimeRef.current || now;
      const isFin = finalNextCount >= targetText.length;
      const finishElapsedSec = Math.max(0.5, (now - typingStart) / 1000);
      const finishElapsedMin = finishElapsedSec / 60;
      const charsPerWord = 5.0;

      // Typeo standard: Instant WPM during race (responsive to current stroke rhythm), and true overall cumulative Net WPM upon finishing
      const liveInstant = triggeredPowerUp ? 95 : Math.round(smoothSpeedRef.current);
      const netChars = Math.max(0, finalNextCount - errorCount);
      const finalCumulativeWpm = Math.max(0, Math.round((netChars / charsPerWord) / finishElapsedMin));
      const netWpm = isFin ? finalCumulativeWpm : (liveInstant > 0 ? liveInstant : finalCumulativeWpm);
      const totalKeys = finalNextCount + errorCount;
      const calcAcc = totalKeys > 0 ? Math.max(0, Math.min(100, Math.round((finalNextCount / totalKeys) * 100))) : 100;

      if (onProgressUpdate) {
        onProgressUpdate(progress, netWpm, calcAcc, errorCount);
      }

      setParticipants((prev) =>
        prev.map((p) => {
          if (isMyUser(p.odUserId)) {
            const isFin = finalNextCount >= targetText.length;
            if (isFin && !p.isFinished && !triggeredPowerUp) {
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });

              // Calculate Hand Score immediately on finish (starts at 40 for 100% accuracy)
              let handScore = 40;
              if (calcAcc >= 100) handScore = 40;
              else if (calcAcc >= 98) handScore = 35;
              else if (calcAcc >= 95) handScore = 30;
              else if (calcAcc >= 90) handScore = 25;
              else if (calcAcc >= 80) handScore = 20;
              else handScore = Math.max(10, Math.round(calcAcc * 0.2));

              awardHandReward(handScore, calcAcc, netWpm);
            }
            const otherFinishedCount = prev.filter((item) => item.isFinished && !isMyUser(item.odUserId)).length;
            const myRank = isFin ? (p.finishPosition || (otherFinishedCount + 1)) : undefined;
            if (isFin) {
              const myId = p.odUserId || p.id;
              if (myId && !finishOrderRef.current.includes(myId)) {
                if (myRank === 1) finishOrderRef.current.unshift(myId);
                else finishOrderRef.current.push(myId);
              }
            }
            return {
              ...p,
              progressPercent: progress,
              wpm: isFin ? (p.isFinished ? p.wpm : netWpm) : netWpm,
              accuracy: calcAcc,
              isFinished: isFin,
              finishPosition: myRank
            };
          }
          return p;
        })
      );
    } else {
      setHasError(true);
      const newErrors = errorCount + 1;

      // Precision Room Mechanic: Max 1 error. On 2nd error, reset both text and car to start!
      // User has 3 mistakes (chances) on each text. On 3rd mistake, attempts exhausted and auto-votes to change text.
      if (isPrecisionRoom && newErrors >= 2) {
        playPrecisionResetSound();
        precisionFailsRef.current += 1;
        const currentFails = precisionFailsRef.current;
        setPrecisionFails(currentFails);

        setTypedCount(0);
        typedCountRef.current = 0;
        setErrorCount(0);
        errorCountRef.current = 0;
        errorIndicesRef.current.clear();
        setErrorIndicesCount(0);
        setHasError(false);
        typingStartTimeRef.current = null;
        keystrokeTimestampsRef.current.push({ time: Date.now() });
        lastStrokeTimeRef.current = Date.now();

        if (onProgressUpdate) {
          onProgressUpdate(0, 0, 100, 0);
        }

        setParticipants((prev) =>
          prev.map((p) =>
            isMyUser(p.odUserId)
              ? { ...p, progressPercent: 0, wpm: 0, accuracy: 100, errors: 0, voteChangeText: currentFails >= 3 }
              : p
          )
        );

        if (currentFails < 3) {
          showToast(`⚠️ ۲ خطا ثبت شد! (اشتباه ${currentFails} از ۳) خودرو به خط شروع بازگشت.`);
          return;
        }

        // 3 mistakes reached on this text!
        showToast('🚫 شما ۳ بار در این متن خطا داشتید؛ فرصت‌های این دور شما به پایان رسید.');
        handleVoteChangeText(true);
        return;
      }

      setErrorCount(newErrors);
      errorCountRef.current = newErrors;
      errorIndicesRef.current.add(typedCount);
      setErrorIndicesCount(errorIndicesRef.current.size);

      const now = Date.now();
      keystrokeTimestampsRef.current.push({ time: now, isCorrect: false });
      lastStrokeTimeRef.current = now;

      // Standard calibrated penalty on mistake (0ms reaction, balanced 2-3 WPM deduction)
      const penalty = Math.min(3, Math.max(1.5, smoothSpeedRef.current * 0.04));
      smoothSpeedRef.current = Math.max(0, smoothSpeedRef.current - penalty);
      const penalizedWpm = Math.round(smoothSpeedRef.current);

      const spot = Math.min(100, Math.round((typedCount / targetText.length) * 100));
      if (!errorSpotsRef.current.includes(spot)) {
        errorSpotsRef.current.push(spot);
      }

      // Recalculate live accuracy and penalized instant speed immediately on error
      const totalKeys = typedCount + newErrors;
      const calcAcc = totalKeys > 0 ? Math.max(0, Math.min(100, Math.round((typedCount / totalKeys) * 100))) : 100;
      const progress = Math.min(100, Math.round((typedCount / targetText.length) * 100));

      if (onProgressUpdate) {
        onProgressUpdate(progress, penalizedWpm, calcAcc, newErrors);
      }

      setParticipants((prev) =>
        prev.map((p) =>
          isMyUser(p.odUserId)
            ? { ...p, wpm: penalizedWpm, accuracy: calcAcc, errors: newErrors }
            : p
        )
      );
    }
  };

  // Global focus & keystroke fallback: Ensures user can immediately type without clicking the text box
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isCurrentlySpectator) return;
      if (raceState !== 'ACTIVE' || roundIntermissionSeconds !== null || resultsReviewRemaining !== null || (isPrecisionRoom && precisionFailsRef.current >= 3)) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
        activeEl !== inputRef.current
      ) {
        // User is typing in chat or another input, do not intercept
        return;
      }

      if (activeEl !== inputRef.current) {
        inputRef.current?.focus();
        handleTyping(e as any);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCurrentlySpectator, raceState, roundIntermissionSeconds, resultsReviewRemaining, handleTyping]);

  // Real-time speed ticker for player (100% authentic Net WPM matching Typro standard)
  useEffect(() => {
    if (raceState !== 'ACTIVE' || currentPlayer?.isFinished) return;

    const interval = setInterval(() => {
      const count = typedCountRef.current;
      const errors = errorCountRef.current;
      if (count === 0 || !typingStartTimeRef.current) return;

      const now = Date.now();
      const elapsedSec = (now - typingStartTimeRef.current) / 1000;
      const effectiveSec = Math.max(1.0, elapsedSec);
      const totalElapsedMin = effectiveSec / 60;

      // Cumulative Net WPM matching typing calculations exactly (no countdown leakage or artificial suppression)
      const netChars = Math.max(0, count - errors);
      const realWpm = Math.max(0, Math.round((netChars / 5) / totalElapsedMin));

      setParticipants((prev) =>
        prev.map((p) =>
          isMyUser(p.odUserId) && !p.isFinished
            ? { ...p, wpm: realWpm }
            : p
        )
      );
    }, 250);

    return () => clearInterval(interval);
  }, [raceState, currentPlayer?.isFinished, currentUserId]);


  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Minimum 100 coins required to send chat in Live Race
    const currentCoins = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_coins') || '0') : 0;
    if (currentCoins < 100) {
      showToast(`⚠️ امکان ارسال پیام در رقابت زنده تا زمانی که سکه‌تان به ۱۰۰ نرسیده است وجود ندارد. (موجودی فعلی: ${currentCoins} سکه)`);
      return;
    }

    const msg = chatInput.trim();
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // 1. Trigger speech bubble above player's car for exactly 2 seconds
    triggerSpeechBubble(currentUserId, msg);

    // 2. Broadcast via socket
    if (onSendMessage) {
      onSendMessage(msg);
    }

    // 3. Add to chat drawer with timestamp
    const nowTs = Date.now();
    const newMsg = {
      id: `local-${nowTs}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUserId,
      sender: resolvedUserName,
      text: msg,
      time: timeStr,
      createdAt: nowTs
    };
    processedChatIdsRef.current.add(newMsg.id);
    setChatMessages((prev) => [...prev, newMsg]);

    setChatInput('');
  };

  // Quick emoji / phrase send (bypasses coin gate for quick reactions)
  const sendQuickMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    triggerSpeechBubble(currentUserId, text);
    if (onSendMessage) onSendMessage(text);
    const nowTs = Date.now();
    const newMsg = {
      id: `qr-${nowTs}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUserId,
      sender: resolvedUserName,
      text,
      time: timeStr,
      createdAt: nowTs
    };
    processedChatIdsRef.current.add(newMsg.id);
    setChatMessages((prev) => [...prev, newMsg]);
    setEmojiPickerOpen(false);
  };

  // Profile popup helper: send coins / diamonds to another player
  const handleSendGifts = (targetUserId: string) => {
    const coins = parseInt(sendCoins || '0', 10);
    const diamonds = parseInt(sendDiamonds || '0', 10);
    if (coins <= 0 && diamonds <= 0) { showToast('مقدار سکه یا الماس را وارد کنید.'); return; }
    const myCoins = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_coins') || '0') : 0;
    const myDiamonds = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_diamonds') || '0') : 0;
    if (coins > myCoins) { showToast(`موجودی سکه کافی نیست (موجودی: ${myCoins})`); return; }
    if (diamonds > myDiamonds) { showToast(`موجودی الماس کافی نیست (موجودی: ${myDiamonds})`); return; }
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_coins', String(myCoins - coins));
      localStorage.setItem('typro_user_diamonds', String(myDiamonds - diamonds));
    }
    setSendCoins('');
    setSendDiamonds('');
    setProfilePopupUserId(null);
    showToast(`${coins > 0 ? `${coins} سکه` : ''}${coins > 0 && diamonds > 0 ? ' و ' : ''}${diamonds > 0 ? `${diamonds} الماس` : ''} با موفقیت ارسال شد! 🎁`);
  };

  // Calculate live position & dynamic stats
  const sortedByProgress = [...participants].sort((a, b) => {
    if (a.isFinished && b.isFinished && a.finishPosition && b.finishPosition) {
      return a.finishPosition - b.finishPosition;
    }
    if (a.isFinished && !b.isFinished) return -1;
    if (!a.isFinished && b.isFinished) return 1;
    return (b.progressPercent || 0) - (a.progressPercent || 0);
  });
  const myRank = Math.max(1, sortedByProgress.findIndex((p) => isMyUser(p.odUserId)) + 1);
  const totalAttemptedKeys = typedCount + errorCount;
  const liveAccuracy = totalAttemptedKeys > 0
    ? Math.max(0, Math.min(100, Math.round((typedCount / totalAttemptedKeys) * 100)))
    : 100;
  const liveScore = Math.max(0, Math.round((typedCount * 10) + ((currentPlayer?.wpm || 0) * 15) - (errorCount * 25)));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3.5 font-sans rounded-3xl bg-slate-50 p-3 sm:p-5 border border-slate-200/90 shadow-lg text-slate-800 relative" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/50 animate-in fade-in slide-in-from-bottom-3 text-xs font-bold">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Row: Controls, Text Change, Chat & Exit */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Text change */}
          {onRequestTextChange && (
            <button
              onClick={() => handleVoteChangeText(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200 cursor-pointer"
              title="درخواست توافقی تغییر متن"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>تعویض متن</span>
            </button>
          )}

          {/* Chat */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              chatOpen ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>چت ({chatMessages.length})</span>
          </button>

          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              isAudioMutedState
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
            }`}
            title={isAudioMutedState ? 'صداهای مسابقه قطع است (کلیک برای فعال‌سازی)' : 'صداهای مسابقه فعال است (کلیک برای قطع صدا)'}
          >
            {isAudioMutedState ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                <span>صدا: قطع</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>صدا: فعال</span>
              </>
            )}
          </button>
        </div>

        {/* Exit */}
        <button
          onClick={handleExitWithPurge}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition border border-rose-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج از مسابقه</span>
        </button>
      </div>

      {/* Spectator Mode Active Banner */}
      {isCurrentlySpectator && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white font-bold text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-purple-500/40 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-300 animate-pulse shrink-0" />
            <span>شما هم‌اکنون به عنوان «تماشاگر» در حال مشاهده این مسابقه هستید. به محض خالی شدن ظرفیت یا با کلیک زیر وارد پیست می‌شوید.</span>
          </div>
          {onToggleSpectator && (
            <button
              onClick={onToggleSpectator}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>درخواست ورود به پیست مسابقه</span>
            </button>
          )}
        </div>
      )}

      {/* Guest Notice Banner */}
      {!user && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-900 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span>برای ثبت لول‌ها و ذخیره شدن سکه و الماس‌ها ثبت نام کن</span>
          </div>
          <Link
            href="/login?tab=register"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition shrink-0 shadow-xs flex items-center gap-1"
          >
            <span>ثبت نام سریع</span>
          </Link>
        </div>
      )}



      {/* Vote Notice Notification */}
      {voteNotice && (
        <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{voteNotice}</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      )}


      {/* 3. Physical Race Track Card & Typing Input */}
      <div className="w-full bg-white rounded-3xl p-3 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        {/* Active Typing Input Area (HUD شفاف و روشن، ارتفاع ۱۰۰٪ ثابت بدون تکان خوردن) */}
        {raceState === 'ACTIVE' && (
          <div
            onClick={() => !isCurrentlySpectator && inputRef.current?.focus()}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-colors relative shadow-xs min-h-[160px] flex flex-col justify-between ${
              isCurrentlySpectator
                ? 'bg-slate-100/90 border-slate-300 opacity-90 cursor-not-allowed'
                : 'bg-white border-slate-200 hover:border-slate-300 focus-within:border-blue-500 cursor-text'
            }`}
          >
            {isCurrentlySpectator && (
              <div className="mb-2 text-xs font-bold text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>کادر تایپ برای تماشاگران غیرفعال است (در حال مشاهده بلادرنگ مسابقه رانندگان پیست).</span>
              </div>
            )}

            {/* Real-time Dynamic Typing HUD: Speed, Accuracy, Errors, Progress */}
            {!isCurrentlySpectator && (
              <div className="flex flex-wrap items-center justify-between pb-2.5 mb-3 border-b border-slate-100 text-xs font-bold text-slate-600 gap-2 select-none">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5" title="سرعت لحظه‌ای تایپ بر حسب کلمه در دقیقه">
                    <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>سرعت:</span>
                    <strong className="font-mono text-sm font-black text-blue-600 tabular-nums">
                      {currentPlayer?.wpm || 0}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5" title="درصد دقت بر اساس خطاهای تایپ شده">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>دقت:</span>
                    <strong className={`font-mono text-sm font-black tabular-nums transition-colors ${
                      liveAccuracy < 90 ? 'text-rose-600' : liveAccuracy < 98 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {liveAccuracy}٪
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5" title="تعداد کلیدهای اشتباه">
                    <AlertCircle className={`w-4 h-4 shrink-0 ${errorCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span>خطاها:</span>
                    <strong className={`font-mono text-sm font-black tabular-nums ${errorCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {errorCount}
                    </strong>
                  </span>
                  {isPrecisionRoom && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 shrink-0" title="فرصت‌های مجاز دقت در این متن (۳ اشتباه = تعویض)">
                      <span className="text-purple-700 font-bold">فرصت دقت:</span>
                      <span className="flex items-center gap-1 font-mono font-black text-xs">
                        {[1, 2, 3].map((slot) => {
                          const isLost = precisionFails >= slot;
                          return (
                            <span
                              key={slot}
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                isLost
                                  ? 'bg-rose-100 text-rose-600 border-rose-300'
                                  : 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                              }`}
                            >
                              {isLost ? '✕' : slot}
                            </span>
                          );
                        })}
                      </span>
                      {precisionFails >= 3 && (
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md font-bold mr-1">
                          پایان ۳ فرصت
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">پیشرفت متن:</span>
                  <strong className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 tabular-nums">
                    {Math.min(100, Math.round((typedCount / Math.max(1, targetText.length)) * 100))}٪
                  </strong>
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              autoFocus={!isCurrentlySpectator}
              readOnly={isCurrentlySpectator || (isPrecisionRoom && precisionFails >= 3) || roundIntermissionSeconds !== null || resultsReviewRemaining !== null}
              onKeyDown={!isCurrentlySpectator && !(isPrecisionRoom && precisionFails >= 3) && roundIntermissionSeconds === null && resultsReviewRemaining === null ? handleTyping : undefined}
              className="absolute inset-0 opacity-0 w-full h-full cursor-default"
              aria-label="Race typing input"
            />
            <div
              className="text-base sm:text-lg md:text-xl font-bold leading-relaxed select-none whitespace-pre-wrap min-h-[64px]"
              dir={room.language === 'fa' ? 'rtl' : 'ltr'}
            >
              {targetText.split('').map((char, i) => {
                const isCursor = i === typedCount;
                const isTyped = i < typedCount;
                const hadError = errorIndicesRef.current.has(i);

                let customColor = displayConfig.defaultTextColor || '#020617';
                let bgClass = '';
                if (isCursor && hasError) {
                  customColor = displayConfig.errorColor || '#e11d48';
                  bgClass = 'bg-rose-100 rounded-xs';
                } else if (isCursor) {
                  customColor = displayConfig.defaultTextColor || '#020617';
                  bgClass = '';
                } else if (isTyped && hadError) {
                  customColor = displayConfig.errorColor || '#e11d48';
                  bgClass = 'bg-rose-100/80 text-rose-600 rounded-xs font-bold';
                } else if (isTyped) {
                  customColor = displayConfig.highlightColor || '#2563eb';
                }

                return (
                  <span
                    key={i}
                    style={{ color: customColor }}
                    className={`relative transition-none font-bold ${bgClass}`}
                  >
                    {isCursor && (
                      <span
                        style={{
                          backgroundColor: hasError
                            ? (displayConfig.errorColor || '#e11d48')
                            : (displayConfig.highlightColor || '#2563eb')
                        }}
                        className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full pointer-events-none shadow-xs"
                      />
                    )}
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Track Headers: Start on LEFT, Finish on RIGHT */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-100 pb-2.5 px-1" dir="ltr">
          <span className="text-blue-600 flex items-center gap-1.5 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
            <span>🚦 شروع (START)</span>
          </span>

          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline-block">
            🏁 پیست آسفالت گرندپری مسابقات زنده تایپرو
          </span>

          <span className="text-emerald-600 flex items-center gap-1.5 font-mono font-bold">
            <span>🏁 خط پایان (FINISH)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          </span>
        </div>

        {/* 4. ACTIVE DEDICATED LANES ONLY (حداکثر ۸ راننده فعال همزمان روی آسفالت) */}
        <div className="space-y-3.5 race-track-physical-direction pt-2" dir="ltr">
          {activeRacers.map((participant, index) => {
            const isMe = isMyUser(participant.odUserId);
            const progress = participant.progressPercent || 0;

            const lvl = isMe
              ? (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_level') || (user?.level || '1')) : (user?.level || 1))
              : ((participant.level && participant.level > 0)
                  ? participant.level
                  : (typeof window !== 'undefined'
                      ? Number(localStorage.getItem(`typro_user_level_${participant.odUserId}`) || '1')
                      : 1));

            const pXp = isMe
              ? (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_xp') || (user?.xp !== undefined ? user.xp : ((lvl - 1) * 100))) : ((lvl - 1) * 100))
              : (((participant as any).xp !== undefined && (participant as any).xp > 0)
                  ? (participant as any).xp
                  : (typeof window !== 'undefined'
                      ? Number(localStorage.getItem(`typro_user_xp_${participant.odUserId}`) || ((lvl - 1) * 100))
                      : ((lvl - 1) * 100)));

            return (
              <div key={participant.id || index} className="flex items-center gap-1.5 sm:gap-2 w-full">
                {/* ACTIVE ASPHALT ROAD LANE (ارتفاع استاندارد عمودی و بیشترین طول در حالت افقی) */}
                <div className="relative flex-1 h-14 sm:h-16 rounded-2xl border-2 border-slate-700/80 shadow-md flex items-center px-2 transition-all">
                  {/* Asphalt Background & Road markings */}
                  <div
                    className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none"
                    style={{
                      backgroundImage: 'url(/images/race/asphalt_road.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'repeat-x',
                    }}
                  >
                    {/* Ambient depth lighting */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/35" />

                    {/* Road boundary white lines */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40" />
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/40" />

                    {/* Yellow dashed centerline */}
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-b-2 border-dashed border-amber-400/85 shadow-[0_0_6px_rgba(251,191,36,0.65)]" />

                    {/* Start Line on LEFT */}
                    <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 rounded-l-[14px] opacity-95" />

                    {/* Finish Line on RIGHT */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-3.5 rounded-r-[14px] border-l border-white/40 shadow-xs"
                      style={{
                        backgroundImage: 'repeating-conic-gradient(#0f172a 0% 25%, #ffffff 0% 50%)',
                        backgroundPosition: '0 0, 3px 3px',
                        backgroundSize: '6px 6px'
                      }}
                      title="خط پایان مسابقه"
                    />
                  </div>

                  {/* Driver Name & Rank Badge placed floating cleanly above track lane */}
                  <div
                    className="absolute left-2.5 -top-2.5 z-25 flex items-center gap-1.5 select-none"
                    dir="ltr"
                  >
                    <span
                      onClick={() => handleDriverNameClick(participant)}
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border transition cursor-pointer shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 font-black ring-1 ring-amber-400/50'
                          : 'bg-slate-900/95 text-slate-200 border-slate-700 hover:border-cyan-400 hover:text-cyan-300'
                      }`}
                      dir="rtl"
                      title={`کلیک برای مشاهده پروفایل و دستاوردهای ${participant.name}`}
                    >
                      {isMe ? resolvedUserName : participant.name} {isMe ? '(شما)' : ''}
                    </span>

                    {/* Rank / Medal badge when finished */}
                    {participant.isFinished && (() => {
                      const rank = getParticipantRank(participant);
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black flex items-center gap-1 shadow-md border animate-in zoom-in-75 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-900 border-slate-300'
                            : rank === 3
                            ? 'bg-amber-700 text-white border-amber-600'
                            : 'bg-emerald-600 text-white border-emerald-500'
                        }`} dir="rtl">
                          {rank === 1 ? '🥇 مقام اول' : rank === 2 ? '🥈 مقام دوم' : rank === 3 ? '🥉 مقام سوم' : `🏁 مقام ${rank}`}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Stationary Gaming Level Badge on Left (کاملاً ثابت در اول مسیر، چسبیده پشت اسکین، بدون کوچک‌ترین حرکت) */}
                  <div
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 select-none flex items-center"
                    dir="ltr"
                  >
                    <div className="flex items-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                      <GamingLevelBadge
                        level={lvl}
                        xp={pXp}
                        size="md"
                        showStars={true}
                        interactive={true}
                        onClick={() => setLevelShowcaseOpen(true)}
                      />
                    </div>
                  </div>

                  {/* Vehicle Traveling from Left to Right (شروع حرکت دقیقاً چسبیده به نشان لول بدون تداخل) */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex items-center gap-1.5 z-20 ${!isMe ? 'cursor-pointer' : ''}`}
                    style={{
                      left: `calc(74px + ${progress} * (100% - 150px) / 100)`
                    }}
                    title={`${isMe ? resolvedUserName : participant.name} - ${progress}% (${participant.wpm || 0} WPM)`}
                    onClick={!isMe ? () => handleVehicleClick(participant) : undefined}
                  >
                    {/* Speech Bubble (Semi-transparent white glassmorphic) */}
                    {activeBubbles[participant.odUserId] && (
                      <div 
                        className="absolute -top-11 sm:-top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in zoom-in-75 fade-in slide-in-from-bottom-2 duration-200"
                        dir="rtl"
                      >
                        <div className="relative px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] sm:text-[11px] shadow-xl border border-white/80 whitespace-nowrap max-w-[200px] truncate flex items-center gap-1.5 ring-1 ring-slate-900/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
                          <span className="truncate">{activeBubbles[participant.odUserId].text}</span>
                        </div>
                        <div className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-white/90 mx-auto -mt-[1px] drop-shadow-xs" />
                      </div>
                    )}

                    {/* Finish & Score / Next Round Speech Bubble (حباب پیام انتهای خط پایان بدون پرش و تکان خوردن لاین‌ها) */}
                    {!activeBubbles[participant.odUserId] && participant.isFinished && (() => {
                      const rank = getParticipantRank(participant);
                      return (
                        <div 
                          className="absolute -top-12 sm:-top-13 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in zoom-in-90 fade-in slide-in-from-bottom-2 duration-200"
                          dir="rtl"
                        >
                          <div className={`relative px-3 py-1 rounded-2xl font-black text-[10.5px] sm:text-xs shadow-2xl border-2 whitespace-nowrap flex items-center gap-1.5 ${
                            rank === 1
                              ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-amber-300 border-amber-400 shadow-amber-500/25 ring-2 ring-amber-400/30'
                              : rank === 2
                              ? 'bg-slate-900 text-slate-100 border-slate-300 shadow-slate-500/20'
                              : rank === 3
                              ? 'bg-slate-900 text-amber-200 border-amber-600 shadow-amber-700/20'
                              : 'bg-slate-900 text-white border-emerald-400 shadow-emerald-500/20'
                          }`}>
                            <span className="text-sm shrink-0">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏁'}
                            </span>
                            
                            {isMe ? (
                              roundIntermissionSeconds !== null ? (
                                <span className="text-cyan-300 font-extrabold flex items-center gap-1 animate-pulse">
                                  <span>شروع دست بعد:</span>
                                  <span className="font-mono font-black text-amber-400 text-xs sm:text-sm">{roundIntermissionSeconds}</span>
                                  <span>ثانیه</span>
                                </span>
                              ) : resultsReviewRemaining !== null ? (
                                <span className="text-amber-300 font-bold flex items-center gap-1">
                                  <span>+{lastRoundEarned || 40} سکه و امتیاز ({rank === 1 ? 'رتبه اول 🥇' : rank === 2 ? 'رتبه دوم 🥈' : `رتبه ${rank}`})</span>
                                  <span className="text-slate-400 text-[9px] font-mono">({resultsReviewRemaining}ث)</span>
                                </span>
                              ) : (
                                <span className="text-amber-300 font-bold">
                                  +{lastRoundEarned || 40} سکه و امتیاز ({rank === 1 ? 'رتبه اول 🥇' : rank === 2 ? 'رتبه دوم 🥈' : `رتبه ${rank}`}) 🎉
                                </span>
                              )
                            ) : (
                              <span className="font-bold">
                                {rank === 1
                                  ? 'قهرمان پیست 🥇 (مقام اول)'
                                  : rank === 2
                                  ? 'مقام دوم 🥈'
                                  : rank === 3
                                  ? 'مقام سوم 🥉'
                                  : `مقام ${rank}`}
                              </span>
                            )}

                            {roundIntermissionSeconds === null && (
                              <span className="font-mono text-[9px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded-lg border border-cyan-500/40">
                                {participant.wpm || (isMe ? (currentPlayer?.wpm || 0) : 0)} WPM
                              </span>
                            )}
                          </div>
                          <div className={`w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] mx-auto -mt-[1px] ${
                            rank === 1
                              ? 'border-t-amber-400'
                              : rank === 2
                              ? 'border-t-slate-300'
                              : rank === 3
                              ? 'border-t-amber-600'
                              : 'border-t-emerald-400'
                          }`} />
                        </div>
                      );
                    })()}

                    <AnimatedVehicleSkin
                      skinId={isMe ? selectedSkinId : (participant.skinId || 'skin-paykan')}
                      size="race"
                      isMoving={raceState === 'ACTIVE' && (progress > 0 || isMe)}
                      wpm={participant.wpm || (isMe ? (currentPlayer?.wpm || 0) : 0)}
                      showNitro={raceState === 'ACTIVE'}
                    />
                    <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded shadow-md shrink-0 border ${
                      participant.isFinished 
                        ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                        : isMe 
                        ? 'bg-blue-600 text-white border-blue-400' 
                        : 'bg-slate-900/90 text-amber-300 border-slate-700'
                    }`}>
                      {participant.isFinished 
                        ? (() => {
                            const rank = getParticipantRank(participant);
                            return rank === 1 ? '🥇 ۱' : rank === 2 ? '🥈 ۲' : rank === 3 ? '🥉 ۳' : `مقام ${rank}`;
                          })()
                        : `${progress}%`}
                    </span>
                  </div>

                  {/* Fixed Stationary Booster Icon in Lane (کاملاً ثابت در جای خود روی جاده، بدون حرکت با اسکین) */}
                  {isMe && activePowerUpItem && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 z-25 pointer-events-auto"
                      style={{
                        left: `${Math.min(88, Math.max(15, (activePowerUpItem.thresholdPct || 90) * 0.86))}%`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePowerUp();
                        }}
                        className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md flex items-center justify-center transition-all shadow-xs cursor-pointer border active:scale-90 ${
                          isPowerUpEnabled
                            ? 'bg-rose-50/95 border-rose-300 text-rose-600 hover:bg-rose-100 ring-2 ring-rose-400/30'
                            : 'bg-slate-100/90 border-slate-300 text-slate-400 hover:bg-slate-200 opacity-50'
                        }`}
                        title={`${activePowerUpItem.name} (${activePowerUpItem.thresholdPct}٪): ${
                          isPowerUpEnabled ? 'فعال (کلیک برای قطع)' : 'قطع شده (کلیک برای وصل)'
                        }`}
                      >
                        <Zap
                          className={`w-3 h-3 ${
                            isPowerUpEnabled ? 'fill-rose-500 text-rose-600 animate-pulse' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* TELEMETRY STATS PILL (عرض کاملاً ثابت و ایستا تا جاده هنگام اضافه شدن ارقام هرگز کوچک نشود) */}
                <div
                  className="w-[136px] sm:w-[140px] shrink-0 flex items-center justify-between px-2 py-1 text-[11px] select-none bg-slate-50/95 rounded-full border border-slate-200/90 whitespace-nowrap shadow-2xs overflow-hidden"
                  dir="rtl"
                  title={`آمار لاین ${index + 1}`}
                >
                  <div className="flex items-center gap-1 shrink-0" title="سرعت کلمه در دقیقه">
                    <Timer className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="font-mono font-black text-xs text-blue-600 tabular-nums">
                      {isMe ? (currentPlayer?.wpm || 0) : (participant.wpm || 0)}
                    </span>
                  </div>

                  <span className="text-slate-300 text-[10px] select-none">|</span>

                  <div className="flex items-center gap-0.5 shrink-0" title="درصد دقت">
                    <span className="text-[9.5px] text-slate-500 font-bold">دقت:</span>
                    <span className="font-mono font-black text-xs text-emerald-600 tabular-nums">
                      {isMe ? liveAccuracy : (participant.accuracy ?? 100)}%
                    </span>
                  </div>

                  <span className="text-slate-300 text-[10px] select-none">|</span>

                  <div className="flex items-center gap-0.5 shrink-0" title="تعداد خطاهای تایپی">
                    <span className="text-[9.5px] text-slate-500 font-bold">خطا:</span>
                    <span className={`font-mono font-black text-xs tabular-nums ${
                      (isMe ? errorCount : (participant.errors || 0)) > 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {isMe ? errorCount : (participant.errors || 0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        </div>

      {/* 5. QUICK MESSAGE BAR (باکس نوشتن متن زیر کادر مسابقه برای پیام سریع) */}
      {(() => {
        const currentCoins = typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_coins') || '0') : 0;
        const canSendChat = currentCoins >= 100;

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-2 shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">پیام سریع:</span>
            </div>

            {canSendChat ? (
              <form onSubmit={sendChatMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="پیام سریع بنویسید (۲ ثانیه بالای خودرو نمایش داده می‌شود و در چت ثبت می‌گردد)..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال</span>
                </button>
              </form>
            ) : (
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>ارسال پیام در رقابت زنده تا زمانی که سکه‌تان به ۱۰۰ نرسد غیرفعال است.</span>
                </span>
                <span className="text-[11px] font-mono bg-white text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                  موجودی شما: {currentCoins} از ۱۰۰ سکه
                </span>
              </div>
            )}

            {/* دکمه مشاهده کل پیام‌های دوستان */}
            <button
              type="button"
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition border shrink-0 cursor-pointer ${
                chatOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title="مشاهده تمام پیام‌های دوستان در چت"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">مشاهده پیام‌ها</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {chatMessages.length}
              </span>
            </button>
          </div>
        );
      })()}

      {/* 6. Real-time Full Chat Drawer (مشاهده کل پیام‌های دوستان در اتاق) */}
      {chatOpen && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>کل پیام‌های دوستان و شرکت‌کنندگان ({chatMessages.length} پیام)</span>
            </span>
            <button
              onClick={() => setChatOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-0.5 rounded-md hover:bg-slate-100"
            >
              بستن چت ✕
            </button>
          </div>

          <div className="h-44 overflow-y-auto space-y-2 text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10 space-y-1">
                <MessageSquare className="w-6 h-6 text-slate-300 mx-auto" />
                <p>هنوز پیامی ارسال نشده است.</p>
                <p className="text-[11px] text-slate-400">با نوشتن در باکس پیام سریع، اولین پیام را برای دوستان ارسال کنید!</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={msg.id || i} className="p-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{msg.sender}</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{msg.time}</span>
                  </div>
                  <p className="text-slate-800 text-xs pr-2.5 font-medium leading-relaxed">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Emoji Reactions Row */}
          <div className="border-t border-slate-100 pt-2 space-y-2">
            <p className="text-[10px] text-slate-400 font-bold">واکنش سریع:</p>
            <div className="flex flex-wrap gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => sendQuickMessage(emoji)}
                  className="text-base px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 border border-slate-200 hover:border-blue-300 transition cursor-pointer"
                  title={`ارسال ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {QUICK_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => sendQuickMessage(phrase)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition cursor-pointer"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SPECTATORS GALLERY (جایگاه تماشاگران پیست مسابقه - خارج از کادر پیست با تم کاملاً سفید) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
              <Eye className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <span>جایگاه تماشاگران پیست</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {spectators.length} تماشاگر
                </span>
              </h4>
              <p className="text-[10.5px] text-slate-500">
                افرادی که ظرفیت ۸ راننده برایشان تکمیل بوده یا خود خواسته به عنوان تماشاگر نظاره‌گر هستند. با خروج هر راننده، نخستین تماشاگر صف خودکار به پیست وارد می‌شود.
              </p>
            </div>
          </div>

          {onToggleSpectator && (
            <button
              type="button"
              onClick={onToggleSpectator}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 ${
                isCurrentlySpectator
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isCurrentlySpectator ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>ورود به پیست / صف شرکت در مسابقه</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>تماشاگر شدن (مشاهده مسابقه از بیرون)</span>
                </>
              )}
            </button>
          )}
        </div>

        {spectators.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
            هم‌اکنون تمامی کاربران در حال رانندگی روی پیست هستند و تماشاگری در این اتاق حضور ندارد.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {spectators.map((spec, sIdx) => {
              const isSpecMe = isMyUser(spec.odUserId);
              const sLvl = isSpecMe
                ? (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_level') || '1') : 1)
                : (spec.level || 1);

              return (
                <div
                  key={spec.id || sIdx}
                  onClick={() => handleDriverNameClick(spec)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center ${
                    isSpecMe
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Spectator Avatar / Skin preview */}
                  <div className="h-8 flex items-center justify-center">
                    <AnimatedVehicleSkin
                      skinId={isSpecMe ? selectedSkinId : (spec.skinId || 'skin-paykan')}
                      size="sm"
                      isMoving={false}
                      wpm={0}
                      showNitro={false}
                    />
                  </div>

                  <div className="w-full">
                    <div className="text-[10.5px] font-black text-slate-800 truncate max-w-full">
                      {isSpecMe ? resolvedUserName : spec.name} {isSpecMe ? '(شما)' : ''}
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <GamingLevelBadge level={sLvl} size="xs" showStars={false} />
                    </div>
                  </div>

                  <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 border border-slate-200">
                    تماشاگر #{sIdx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* ========================================================================= */}
      {/* 7. FULL-SCREEN TRANSPARENT HIGHLIGHT COUNTDOWN (ثانیه شمار شفاف حالت هایلایتی کل صفحه) */}
      {/* بدون نمایش سرعت، دقت و رتبه؛ برای هر دست و هر دو بازیکن، ثانیه‌شمار شفاف روی کل صفحه فعال می‌شود */}
      {/* ========================================================================= */}
      {roundIntermissionSeconds !== null && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-300"
          dir="rtl"
        >
          {/* Luminous cyan/blue aura highlight effect behind center */}
          <div className="absolute w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-radial from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg mx-auto">
            {/* Glowing Circular Countdown Ring (Typo.ir style) */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing glow rings */}
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-cyan-400/30 animate-ping pointer-events-none" />
              <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-blue-400/40 pointer-events-none" />

              {/* Center Dial */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-900/85 border-4 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.5)] backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 to-transparent pointer-events-none" />

                {/* Big Countdown Number */}
                <span 
                  key={roundIntermissionSeconds}
                  className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_4px_16px_rgba(6,182,212,0.6)] animate-in zoom-in-75 duration-200"
                >
                  {roundIntermissionSeconds}
                </span>
                <span className="text-[11px] font-bold text-cyan-300/80 mt-1">ثانیه تا استارت</span>
              </div>
            </div>

            {/* Countdown Footer Notice - Explicitly requested by user */}
            <div className="text-base sm:text-lg font-black text-cyan-200 tracking-wide drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)] animate-pulse bg-slate-900/80 px-6 py-2.5 rounded-2xl border border-cyan-400/40 shadow-lg">
              آماده مسابقه برای دسته بعدی شو!
            </div>
          </div>
        </div>
      )}

      {/* ── Player Profile Popup ──────────────────────────────────────────────── */}
      {profilePopupUserId && (() => {
        const target = participants.find((p) => p.odUserId === profilePopupUserId);
        if (!target) return null;
        // Prefer participant.level if >0, else localStorage fallback
        const tLevel = (target.level && target.level > 0)
          ? target.level
          : (typeof window !== 'undefined'
              ? Number(localStorage.getItem(`typro_user_level_${profilePopupUserId}`) || '1')
              : 1);
        const tName = target.name || '—';
        const tUsername = target.odUserId;
        const initials = tName.trim().charAt(0).toUpperCase();
        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setProfilePopupUserId(null)}
          >
            <div
              className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 w-full max-w-xs space-y-4 animate-in zoom-in-90 duration-200"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setProfilePopupUserId(null)}
                className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Avatar + Name */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {initials}
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-slate-900">{tName}</p>
                  <p className="text-xs text-slate-500 font-medium">@{tUsername}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${getLevelStyle(tLevel)}`}>
                  Lv.{tLevel}
                </span>
              </div>

              <hr className="border-slate-100" />

              {/* Send Coins / Diamonds */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span>🎁</span> ارسال هدیه به {tName}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm">🪙</span>
                    <input
                      type="number"
                      min={0}
                      value={sendCoins}
                      onChange={(e) => setSendCoins(e.target.value)}
                      placeholder="سکه"
                      className="w-full text-xs pr-8 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-400 transition font-bold"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm">💎</span>
                    <input
                      type="number"
                      min={0}
                      value={sendDiamonds}
                      onChange={(e) => setSendDiamonds(e.target.value)}
                      placeholder="الماس"
                      className="w-full text-xs pr-8 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-400 transition font-bold"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSendGifts(profilePopupUserId)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  ارسال هدیه
                </button>
              </div>

              <hr className="border-slate-100" />

              {/* Emoji Reaction */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-500" /> واکنش ایموجی به خودرو {tName}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        triggerSpeechBubble(profilePopupUserId, emoji);
                        setProfilePopupUserId(null);
                      }}
                      className="text-lg px-2 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-200 hover:border-amber-300 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Error Toast in Empty Space (ثابت در لایه شناور، بدون تغییر ساختار DOM، ۰ پیکسل لرزش یا تغییر کادر) */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-rose-600 text-white px-4 py-2.5 rounded-2xl shadow-lg border border-rose-400 text-xs font-bold pointer-events-none select-none transition-all duration-150 max-w-[calc(100vw-3rem)] ${
          hasError && raceState === 'ACTIVE'
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }`}
        aria-live="assertive"
      >
        <AlertCircle className="w-4 h-4 shrink-0 text-white" />
        <span>نویسه اشتباه است! کلید صحیح را فشار دهید تا پیش بروید (نیازی به Backspace نیست).</span>
      </div>

      {/* 8. Public Profile Modal (Strictly hides coins/private data) */}
      <PublicProfileModal
        isOpen={!!selectedPublicProfile}
        onClose={() => setSelectedPublicProfile(null)}
        profile={selectedPublicProfile}
      />

      {/* 9. Vehicle Action Modal (Tip coins + Floating emoji reactions) */}
      <VehicleActionModal
        isOpen={!!selectedVehicleDriver}
        onClose={() => setSelectedVehicleDriver(null)}
        targetDriver={selectedVehicleDriver}
        currentUserCoins={currentUserCoins || (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_coins') || '0') : 0)}
        onSendTip={handleSendTipAction}
        onSendReaction={handleSendReactionAction}
      />

      {/* 10. Level Roadmap Showcase Modal (1 to 1,000,000) */}
      <LevelShowcaseModal
        isOpen={levelShowcaseOpen}
        onClose={() => setLevelShowcaseOpen(false)}
        currentXp={(user?.xp) || (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_xp') || '0') : 0)}
      />
    </div>
  );
}