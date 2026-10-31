'use client';

import LevelUpCelebrationModal from '@/components/common/LevelUpCelebrationModal';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LiveRaceTrack from '@/components/race/LiveRaceTrack';
import AnimatedVehicleSkin from '@/components/race/AnimatedVehicleSkin';
import LeaderboardView from '@/components/race/LeaderboardView';
import LevelShowcaseModal from '@/components/race/LevelShowcaseModal';
import PublicProfileModal, { PublicUserProfile } from '@/components/race/PublicProfileModal';
import { ALL_SKINS, SKIN_CATEGORIES, SkinItem, SkinCategoryType, getSkinById } from '@/lib/skins';
import { RaceRoomData, RaceParticipant } from '@/types';
import { 
  Trophy, Users, Zap, Shield, HelpCircle, Plus, Search, Filter, 
  Lock, Unlock, Play, ArrowRight, Sparkles, CheckCircle2, AlertCircle, 
  Palette, Video, Coins, Gem, Check, Server, Radio, Flame, Gauge, Flag, ChevronLeft, Eye, Crown, Banknote
} from 'lucide-react';
import CurrencyHUD, { CoinBadge, DiamondBadge } from '@/components/common/CurrencyHUD';
import { useRaceSocket } from '@/hooks/useRaceSocket';
import { useAuth } from '@/context/AuthContext';

interface RoomDef {
  id: string; // Dedicated Server Channel ID (e.g. room-1, room-2)
  title: string;
  topic: string;
  mode: string;
  language: 'fa' | 'en';
  capacity: number;
  onlineUsers: number;
  activeRacers: number;
  averageWpm: number;
  trackTheme: string;
  status: 'ACTIVE' | 'COUNTDOWN' | 'LOBBY';
  isPrivate: boolean;
  pinCode?: string;
  hasBots: boolean;
  hostName: string;
  text: string;
  participants: RaceParticipant[];
}

export interface PowerUpItem {
  id: string;
  name: string;
  thresholdPct: number;
  requireAccuracy100: boolean;
  requireVIP: boolean;
  priceCoins: number;
  priceDiamonds: number;
  desc: string;
  badge: string;
}

export const POWER_UPS_LIST: PowerUpItem[] = [
  {
    id: 'powerup-auto-90',
    name: 'بوستر نیترو ۹۰٪ (تکمیل ۱۰٪ پایانی)',
    thresholdPct: 90,
    requireAccuracy100: false,
    requireVIP: false,
    priceCoins: 300,
    priceDiamonds: 5,
    desc: 'با تایپ ۹۰٪ متن مسابقه، ۱۰٪ باقی‌مانده به طور خودکار تکمیل شده و خودرو با سرعت نیترو خط پایان را فتح می‌کند.',
    badge: '۹۰٪ خودکار',
  },
  {
    id: 'powerup-precision-80',
    name: 'نیترو دقت ۸۰٪ (تایپ بدون خطا)',
    thresholdPct: 80,
    requireAccuracy100: true,
    requireVIP: false,
    priceCoins: 600,
    priceDiamonds: 15,
    desc: 'در صورت تایپ ۸۰٪ متن با دقت ۱۰۰٪ (بدون خطا)، ۲۰٪ باقی‌مانده متن خودکار شلیک می‌گردد.',
    badge: '۸۰٪ بی خطا',
  },
  {
    id: 'powerup-precision-70',
    name: 'توربو دقت ۷۰٪ (تکمیل ۳۰٪ پایانی)',
    thresholdPct: 70,
    requireAccuracy100: true,
    requireVIP: false,
    priceCoins: 1200,
    priceDiamonds: 35,
    desc: 'با تایپ ۷۰٪ متن با دقت ۱۰۰٪، ۳۰٪ باقی‌مانده به صورت توربوشارژ خودکار شلیک می‌شود.',
    badge: '۷۰٪ بی خطا',
  },
  {
    id: 'powerup-vip-45',
    name: 'سوپر توربو اولترا ۴۵٪ (ویژه مشترکین VIP)',
    thresholdPct: 45,
    requireAccuracy100: true,
    requireVIP: true,
    priceCoins: 2500,
    priceDiamonds: 70,
    desc: 'قدرتمندترین قابلیت پیست! نیازمند اشتراک ویژه VIP + سکه و الماس. با تایپ ۴۵٪ متن بدون خطا، ۵۵٪ باقی‌مانده خودکار شلیک می‌گردد!',
    badge: '۴۵٪ VIP اولترا',
  },
];

export default function LiveRacePage() {
  const { user } = useAuth();
  const [guestId, setGuestId] = useState<string>('guest-init');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let gid = localStorage.getItem('typro_guest_id');
      if (!gid) {
        gid = `guest-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        localStorage.setItem('typro_guest_id', gid);
      }
      setGuestId(gid);
    }
  }, []);

  const currentUserId = user?.id || guestId;

  // Sub-navigation under Live Race: rooms, leaderboard, powerups catalog, or levels map
  const [mainTab, setMainTab] = useState<'rooms' | 'leaderboard' | 'powerups' | 'levels'>('rooms');
  const [selectedLeaderboardUser, setSelectedLeaderboardUser] = useState<PublicUserProfile | null>(null);
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);
  const [isSpectatorMode, setIsSpectatorMode] = useState<boolean>(false);

  // SSR-safe Economy & Skins & Powerups state
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userDiamonds, setUserDiamonds] = useState<number>(0);
  const [userBanknotes, setUserBanknotes] = useState<number>(0);
  const [userXp, setUserXp] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [equippedSkinId, setEquippedSkinId] = useState<string>('skin-vw-beetle');
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['skin-vw-beetle', 'skin-paykan']);
  const [activeSkinCategory, setActiveSkinCategory] = useState<SkinCategoryType>('all');

  const [equippedPowerUpId, setEquippedPowerUpId] = useState<string>('powerup-auto-90');
  const [ownedPowerUpIds, setOwnedPowerUpIds] = useState<string[]>(['powerup-auto-90']);

  // Synchronize client storage & guest/user skins after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ensure at least 2 default skins available (Beetle & Paykan)
      const DEFAULT_SKIN_1 = 'skin-vw-beetle';
      const DEFAULT_SKIN_2 = 'skin-paykan';
      const savedOwned = localStorage.getItem('typro_owned_skins');
      let owned: string[] = savedOwned ? JSON.parse(savedOwned) : [DEFAULT_SKIN_1, DEFAULT_SKIN_2];
      if (!owned.includes(DEFAULT_SKIN_1)) owned.unshift(DEFAULT_SKIN_1);
      if (!owned.includes(DEFAULT_SKIN_2)) owned.push(DEFAULT_SKIN_2);
      setOwnedSkins(owned);
      localStorage.setItem('typro_owned_skins', JSON.stringify(owned));

      const savedSkin = localStorage.getItem('typro_equipped_skin');
      if (savedSkin && owned.includes(savedSkin)) {
        setEquippedSkinId(savedSkin);
      } else {
        setEquippedSkinId(DEFAULT_SKIN_1);
        localStorage.setItem('typro_equipped_skin', DEFAULT_SKIN_1);
      }
    }

    const syncEconomy = () => {
      if (typeof window === 'undefined') return;
      const c = user && typeof user.coins === 'number'
        ? user.coins
        : Number(localStorage.getItem('typro_user_coins') || '0');

      const d = user && typeof user.diamonds === 'number'
        ? user.diamonds
        : Number(localStorage.getItem('typro_user_diamonds') || '0');

      const effectiveXp = user && typeof user.xp === 'number'
        ? user.xp
        : Number(localStorage.getItem('typro_user_xp') || '0');

      const effectiveLvl = user && typeof user.level === 'number'
        ? user.level
        : Math.max(1, Math.floor(effectiveXp / 100) + 1);

      localStorage.setItem('typro_user_coins', String(c));
      localStorage.setItem('typro_user_diamonds', String(d));
      localStorage.setItem('typro_user_xp', String(effectiveXp));
      localStorage.setItem('typro_user_level', String(effectiveLvl));

      setUserCoins(c);
      setUserDiamonds(d);
      setUserXp(effectiveXp);
      setUserLevel(effectiveLvl);
    };

    syncEconomy();
    window.addEventListener('storage', syncEconomy);
    window.addEventListener('typro_economy_updated', syncEconomy);
    window.addEventListener('focus', syncEconomy);
    return () => {
      window.removeEventListener('storage', syncEconomy);
      window.removeEventListener('typro_economy_updated', syncEconomy);
      window.removeEventListener('focus', syncEconomy);
    };
  }, [user]);

  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typro_profile_name');
      if (saved) return saved;
      const savedUser = localStorage.getItem('typro_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u.displayName) return u.displayName;
        } catch {}
      }
    }
    return user?.displayName || 'کاربر تایپرو';
  });

  useEffect(() => {
    if (user?.displayName) {
      setProfileName(user.displayName);
    }
  }, [user?.displayName]);

  // Listen to profile updates live across windows & components
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('typro_profile_name');
        if (saved) setProfileName(saved);
      }
    };
    window.addEventListener('storage', handleProfileUpdate);
    window.addEventListener('typro_profile_avatar_updated', handleProfileUpdate);
    window.addEventListener('typro_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('storage', handleProfileUpdate);
      window.removeEventListener('typro_profile_avatar_updated', handleProfileUpdate);
      window.removeEventListener('typro_profile_updated', handleProfileUpdate);
    };
  }, []);

  // Drivers who are not logged in MUST enter live competition as "مهمان"
  const isGuest = !user;
  const resolvedDriverName = isGuest ? 'مهمان' : (user?.displayName || profileName || 'کاربر تایپرو');

  const currentUser = {
    id: user?.id || currentUserId,
    name: resolvedDriverName,
    level: user ? (user.level || 1) : 1,
    skinId: equippedSkinId,
    isGuest,
  };

  // Dedicated single-server rooms: ZERO BOTS, 100% real human participants, starting at 0 of 8 capacity
  const initialRooms: RoomDef[] = [
    {
      id: 'room-1',
      title: 'اتاق ۱: کورس سرعتی متون فناوری و هوش مصنوعی',
      topic: 'فناوری و مهارت',
      mode: '60Classic',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Cyber City',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false, // ZERO BOTS
      hostName: 'سرور متمرکز رقابت زنده تایپرو (Node #1)',
      text: "تایپ ده انگشتی سرعت تفکر را دوچندان می کند.",
      participants: [],
    },
    {
      id: 'room-2',
      title: 'اتاق ۲: رقابت ادبیات کهن و گلستان سعدی',
      topic: 'ادبیات کهن',
      mode: 'Perfect Race',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Persian-inspired',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false, // ZERO BOTS
      hostName: 'سرور متمرکز رقابت زنده تایپرو (Node #2)',
      text: "بنی آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند.",
      participants: [],
    },
    {
      id: 'room-3',
      title: 'Room 3: Fullstack Devs English Typing Sprint',
      topic: 'Computer Science',
      mode: '15Sprint',
      language: 'en',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Space Odyssey',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false, // ZERO BOTS
      hostName: 'Typro Central Race Server (Global Node #3)',
      text: "Clean code always looks like it was written by someone who cares.",
      participants: [],
    },
    {
      id: 'room-4',
      title: 'اتاق ۴: دوئل استقامتی اشعار کهن شاهنامه فردوسی',
      topic: 'ادبیات کهن فارسی',
      mode: 'Marathon',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Historic Persepolis',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false, // ZERO BOTS
      hostName: 'سرور متمرکز رقابت زنده تایپرو (Node #4)',
      text: "به نام خداوند جان و خرد کزین برتر اندیشه برنگذرد.",
      participants: [],
    },
    {
      id: 'room-5',
      title: 'اتاق ۵ (دقت فارسی): پیست تمرکز و دقت بالا (حداکثر ۱ خطا)',
      topic: 'دقت و تمرکز (سقف ۲ خطا)',
      mode: 'Precision',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Neon Precision Arena',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور متمرکز رقابت زنده تایپرو (Node #5 Precision)',
      text: "دقت و تمرکز در تایپ پیوند میان اندیشه و کلمات را استوار و جاودانه می سازد.",
      participants: [],
    },
    {
      id: 'room-6',
      title: 'Room 6 (English Precision): High Accuracy Sprint (Max 1 Error)',
      topic: 'Precision Sprint (Max 2 Errors)',
      mode: 'Precision',
      language: 'en',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Cyber Grid Precision',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'Typro Central Race Server (Global Node #6 Precision)',
      text: "Precision beats speed; flawless accuracy is the true foundation of typing mastery.",
      participants: [],
    },
    {
      id: 'room-scientific',
      title: 'اتاق علمی: کورس دانش، فیزیک و علوم شگفت‌انگیز',
      topic: 'علمی و اکتشافات',
      mode: '60Classic',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Space Odyssey',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور دانش و علوم تایپرو (Node Science)',
      text: "نظریه نسبیت عام انیشتین گرانش را حاصل انحنای فضا و زمان در حضور جرم می داند.",
      participants: [],
    },
    {
      id: 'room-historical',
      title: 'اتاق تاریخی: رقابت تمدن‌های کهن و رویدادهای سرنوشت‌ساز',
      topic: 'تاریخ و تمدن',
      mode: '60Classic',
      language: 'fa',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Historic Persepolis',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور تمدن و تاریخ تایپرو (Node History)',
      text: "منشور کوروش بزرگ کهن ترین بیانیه حقوق بشر جهان در احترام به آزادی و عقاید ملت ها است.",
      participants: [],
    },
    {
      id: 'room-numbers',
      title: 'اتاق اعداد: چالش پد عددی و تایپ سرعتی ارقام (بدون کلید فاصله)',
      topic: 'تایپ اعداد',
      mode: 'Numbers',
      language: 'en',
      capacity: 8,
      onlineUsers: 0,
      activeRacers: 0,
      averageWpm: 0,
      trackTheme: 'Neon Precision Arena',
      status: 'LOBBY',
      isPrivate: false,
      hasBots: false,
      hostName: 'سرور پد عددی تایپرو (Node Numbers)',
      text: "98866 556954 594544 1436244 575270 867 69642 5587 3561537 466 44492 544567 964 565",
      participants: [],
    },
  ];

  // Skin Items in Live Race Store (Proposal Catalog)
  const storeSkins: SkinItem[] = ALL_SKINS;

  const [rooms, setRooms] = useState<RoomDef[]>(initialRooms);

  // Poll real authoritative rooms and capacities from backend (/api/race/rooms)
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/race/rooms');
        if (res.ok) {
          const liveRooms: any[] = await res.json();
          if (isMounted && Array.isArray(liveRooms) && liveRooms.length > 0) {
            setRooms((prev) =>
              prev.map((r) => {
                const live = liveRooms.find((lr) => lr.id === r.id);
                if (live) {
                  return {
                    ...r,
                    onlineUsers: live.onlineUsers ?? 0,
                    activeRacers: live.activeRacers ?? 0,
                    status: live.status || r.status,
                    text: live.text || r.text,
                    currentRound: live.currentRound || 1,
                    participants: live.participants || [],
                  };
                }
                return r;
              })
            );
          }
        }
      } catch {}
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // selectedRoom is STRICTLY null on page load so user ALWAYS sees the rooms list first
  const [selectedRoom, setSelectedRoom] = useState<RaceRoomData | null>(null);

  // Filters and lobby search state
  const [activeTab, setActiveTab] = useState<'all' | 'fa' | 'en' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [passwordModalRoom, setPasswordModalRoom] = useState<RoomDef | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Redirect ?tab=skins directly to dedicated Store Skins page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'skins') {
        window.location.href = '/store/skins';
      }
    }
  }, []);

  // Shared WebSocket connection for the selected room server
  const {
    isConnected,
    isSpectator: socketIsSpectator,
    promotedNotification,
    setPromotedNotification,
    toggleSpectator: socketToggleSpectator,
    raceState,
    countdown,
    roundRemainingSeconds,
    intermissionSeconds,
    currentRound,
    roomText,
    participants: liveParticipants,
    chatMessages: socketChatMessages,
    raceError,
    sendProgress,
    requestTextChange,
    sendChat,
    latestTip,
    latestReaction,
    sendTip,
    sendReaction,
  } = useRaceSocket({
    roomId: selectedRoom?.id || '',
    user: currentUser,
    enabled: Boolean(selectedRoom),
  });

  // Handle spectator promotion toast
  useEffect(() => {
    if (promotedNotification) {
      alert('🎉 نوبت شما فرا رسید! به عنوان راننده اصلی به پیست مسابقه منتقل شدید. آماده حرکت باشید!');
      setPromotedNotification(false);
    }
  }, [promotedNotification, setPromotedNotification]);

  // Duplicate Session Error Modal State
  const [duplicateSessionError, setDuplicateSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (raceError && raceError.code === 'DUPLICATE_SESSION') {
      setSelectedRoom(null);
      setDuplicateSessionError(raceError.message);
    }
  }, [raceError]);

  // Update room with synchronized live state from that room's authoritative server
  useEffect(() => {
    if (selectedRoom && isConnected) {
      setSelectedRoom((prev) => (prev ? {
        ...prev,
        participants: liveParticipants.length > 0 ? liveParticipants : prev.participants,
        state: (raceState as any) || prev.state,
        countdownSeconds: countdown,
        roundRemainingSeconds,
        intermissionSeconds,
        currentRound,
        text: roomText || prev.text,
      } : null));
    }
  }, [isConnected, liveParticipants, raceState, countdown, roundRemainingSeconds, intermissionSeconds, currentRound, roomText]);

  const handleEnterRoom = (roomDef: RoomDef) => {
    const isFull = (roomDef.onlineUsers >= roomDef.capacity) || (roomDef.participants.length >= roomDef.capacity);
    const isAlreadyParticipant = roomDef.participants.some(p => p.odUserId === currentUserId || (user?.id && p.odUserId === user.id));
    const entersAsSpectator = isFull && !isAlreadyParticipant;

    const raceRoom: RaceRoomData = {
      id: roomDef.id,
      title: roomDef.title,
      language: roomDef.language,
      topic: roomDef.topic,
      mode: roomDef.mode,
      maxScore: 30,
      capacity: roomDef.capacity,
      state: 'ACTIVE',
      text: roomDef.text, // Guaranteed identical server text for all racers in this room
      countdownSeconds: 0,
      trackTheme: roomDef.trackTheme,
      participants: roomDef.participants.map((p) =>
        p.odUserId === currentUserId || p.odUserId === currentUser.id ? { ...p, name: resolvedDriverName, skinId: equippedSkinId } : p
      ),
    };
    setSelectedRoom(raceRoom);
    setIsSpectatorMode(entersAsSpectator);

    if (entersAsSpectator) {
      showToast(`👁️ شما به عنوان «تماشاگر» وارد سرور «${roomDef.id}» شدید (ظرفیت ۸ راننده تکمیل است).`);
    } else {
      showToast(`⚡ متصل به سرور اختصاصی «${roomDef.id}» — همگام‌سازی بلادرنگ و آماده تایپ پیوسته بدون ثانیه‌شمار.`);
    }
  };

  const handleRoomClick = (roomDef: RoomDef) => {
    if (roomDef.isPrivate) {
      setPasswordModalRoom(roomDef);
      setEnteredPin('');
      setPinError(null);
    } else {
      handleEnterRoom(roomDef);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalRoom) return;

    if (passwordModalRoom.pinCode && enteredPin.trim() === passwordModalRoom.pinCode) {
      const targetRoom = passwordModalRoom;
      setPasswordModalRoom(null);
      handleEnterRoom(targetRoom);
    } else {
      setPinError('رمز عبور وارد شده نادرست است! لطفاً پین ۴ رقمی معتبر را وارد کنید.');
    }
  };

  const handleExitRace = () => {
    setSelectedRoom(null);
    showToast('شما از مسابقه خارج شدید و به لابی اتاق‌ها بازگشتید.');
  };

  const handleTextChange = () => {
    if (isConnected) {
      requestTextChange();
    }
  };

  // Buy or Equip Skin inside Live Race
  const handleBuyOrEquipSkin = (skin: SkinItem) => {
    if (equippedSkinId === skin.id) {
      showToast(`پوسته «${skin.name}» هم‌اکنون برای مسابقات زنده شما فعال است.`);
      return;
    }

    if (ownedSkins.includes(skin.id)) {
      setEquippedSkinId(skin.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_equipped_skin', skin.id);
      }
      showToast(`✅ پوسته «${skin.name}» برای خودروی مسابقه شما مجهز شد.`);
      return;
    }

    if (userCoins < skin.priceCoins) {
      showToast(`⚠️ موجودی سکه کافی نیست! شما به ${skin.priceCoins - userCoins} سکه دیگر نیاز دارید.`);
      return;
    }

    const newCoins = userCoins - skin.priceCoins;
    const newDiamonds = Math.max(0, userDiamonds - skin.priceDiamonds);
    const newOwned = [...ownedSkins, skin.id];

    setUserCoins(newCoins);
    setUserDiamonds(newDiamonds);
    setOwnedSkins(newOwned);
    setEquippedSkinId(skin.id);

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_coins', String(newCoins));
      localStorage.setItem('typro_user_diamonds', String(newDiamonds));
      localStorage.setItem('typro_owned_skins', JSON.stringify(newOwned));
      localStorage.setItem('typro_equipped_skin', skin.id);
    }
    showToast(`🎉 تبریک! پوسته متحرک «${skin.name}» با موفقیت خریداری و مجهز گردید.`);
  };

  // Buy or Equip Power-up inside Live Race
  const handleBuyOrEquipPowerUp = (item: PowerUpItem) => {
    if (equippedPowerUpId === item.id) {
      setEquippedPowerUpId('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('typro_equipped_powerup');
        localStorage.removeItem('typro_equipped_powerup_id');
        window.dispatchEvent(new Event('typro_powerup_updated'));
      }
      showToast(`✕ قابلیت «${item.name}» قطع شد و از حالت مجهز خارج گردید.`);
      return;
    }

    if (ownedPowerUpIds.includes(item.id)) {
      setEquippedPowerUpId(item.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typro_equipped_powerup', JSON.stringify(item));
        localStorage.setItem('typro_equipped_powerup_id', item.id);
        window.dispatchEvent(new Event('typro_powerup_updated'));
      }
      showToast(`✅ قابلیت «${item.name}» برای مسابقات شما مجهز گردید.`);
      return;
    }

    if (item.requireVIP) {
      const isSub = typeof window !== 'undefined' ? localStorage.getItem('typro_user_is_subscribed') === 'true' : false;
      if (!isSub) {
        showToast('⚠️ قابلیت اولترا ۴۵٪ علاوه بر سکه و الماس، نیازمند داشتن «اشتراک ویژه VIP» می‌باشد.');
        return;
      }
    }

    if (userCoins < item.priceCoins) {
      showToast(`⚠️ موجودی سکه کافی نیست! شما به ${item.priceCoins - userCoins} سکه دیگر نیاز دارید.`);
      return;
    }
    if (item.priceDiamonds && userDiamonds < item.priceDiamonds) {
      showToast(`⚠️ موجودی الماس کافی نیست! شما به ${item.priceDiamonds - userDiamonds} الماس دیگر نیاز دارید.`);
      return;
    }

    const newCoins = userCoins - item.priceCoins;
    const newDiamonds = Math.max(0, userDiamonds - (item.priceDiamonds || 0));
    const newOwned = [...ownedPowerUpIds, item.id];

    setUserCoins(newCoins);
    setUserDiamonds(newDiamonds);
    setOwnedPowerUpIds(newOwned);
    setEquippedPowerUpId(item.id);

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_user_coins', String(newCoins));
      localStorage.setItem('typro_user_diamonds', String(newDiamonds));
      localStorage.setItem('typro_owned_powerup_ids', JSON.stringify(newOwned));
      localStorage.setItem('typro_equipped_powerup', JSON.stringify(item));
      localStorage.setItem('typro_equipped_powerup_id', item.id);
    }
    showToast(`🎉 تبریک! قابلیت ویژه «${item.name}» با موفقیت خریداری و مجهز شد.`);
  };

  // Filter rooms in lobby
  const filteredRooms = rooms.filter((r) => {
    if (activeTab === 'fa' && r.language !== 'fa') return false;
    if (activeTab === 'en' && r.language !== 'en') return false;
    if (activeTab === 'private' && !r.isPrivate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.hostName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredSkins = storeSkins.filter((s) => {
    if (activeSkinCategory === 'all') return true;
    return s.category === activeSkinCategory;
  });

  return (
    <div
      className={`${
        selectedRoom
          ? 'max-w-[1720px] px-2 sm:px-4 py-4 space-y-5'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8'
      } mx-auto font-sans transition-all duration-300`}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Duplicate Session Alert Modal */}
      {duplicateSessionError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                خطای سشن همزمان (ورود چندگانه)
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                {duplicateSessionError}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 text-right leading-relaxed">
              ⚠️ برای حفظ عدالت و شفافیت رقابت‌ها، هر کاربر فقط می‌تواند در لحظه در یک مسابقه فعال حضور داشته باشد. لطفاً تب قبلی مرورگر را ببندید یا مسابقه آن را تمام کنید.
            </div>

            <button
              type="button"
              onClick={() => setDuplicateSessionError(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-md cursor-pointer"
            >
              متوجه شدم و بازگشت به لابی
            </button>
          </div>
        </div>
      )}

      {/* Password Modal for Private Rooms */}
      {passwordModalRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">ورود به سرور اختصاصی اتاق</h3>
                <p className="text-xs text-slate-500">پین ۴ رقمی اتاق را وارد کنید</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              این سرور توسط <strong className="text-slate-800">{passwordModalRoom.hostName}</strong> محافظت شده است. (رمز نمونه برای تست: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">1234</code>)
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  پین کد ورودی:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="مثال: 1234"
                  autoFocus
                  className="w-full text-center text-lg tracking-widest font-mono px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                {pinError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalRoom(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
                >
                  اتصال به سرور اتاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 1: ACTIVE RACE IN ROOM */}
      {selectedRoom ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleExitRace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition border border-slate-200 shadow-xs"
            >
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              <span>خروج و بازگشت به لابی مسابقات</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>سرور رقابت زنده: <strong className="text-slate-900">{selectedRoom.id}</strong> • ظرفیت ۸ راننده</span>
            </div>
          </div>

          <LiveRaceTrack
            room={selectedRoom}
            currentUserId={currentUserId}
            userName={profileName}
            isSpectator={socketIsSpectator || isSpectatorMode}
            onExit={handleExitRace}
            onRequestTextChange={handleTextChange}
            onProgressUpdate={sendProgress}
            onSendMessage={sendChat}
            isConnected={isConnected}
            socketChatMessages={socketChatMessages}
            latestTip={latestTip}
            latestReaction={latestReaction}
            onSendTip={sendTip}
            onSendReaction={sendReaction}
            currentUserCoins={userCoins}
            onToggleSpectator={socketToggleSpectator}
          />
        </div>
      ) : (
        /* VIEW 2: LIVE RACE LOBBY (Always shown first when opening Live Race) */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-500/20">
            {/* Atmospheric Ambient Glows & Speed Lines */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    شبکه مسابقات زنده فعال
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-black border border-blue-400/30">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    تک‌سرورهای مستقل برای هر پیست
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  میدان رقابت زنده اتومبیل‌رانی <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">تایپرو</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
                  با تایپ سریع و بدون غلط، اتومبیل خود را در پیست به جلو برانید. هر اتاق به یک سرور اختصاصی متصل است و چنانچه مسابقه در جریان باشد، بلافاصله از ادامه دور وارد رقابت خواهید شد.
                </p>

                {/* Quick Telemetry Bar */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>جوایز نقدی هر مسابقه: سکه و الماس</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1.5 text-sky-300">
                    <Zap className="w-3.5 h-3.5" />
                    <span>تجهیز آنی اسکین در تمامی پیست‌ها</span>
                  </div>
                </div>
              </div>

              {/* Luxury Currency HUD Card */}
              <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  موجودی کیف پول و سطح شما:
                </span>
                <CurrencyHUD
                  coins={userCoins}
                  diamonds={userDiamonds}
                  xp={userXp}
                  level={userLevel}
                  size="lg"
                  variant="glass"
                  className="bg-slate-900/60 border-slate-700/60 shadow-2xl"
                />
                {!user && (
                  <div className="mt-1.5 p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-amber-200 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg max-w-md">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                      <span className="text-[11px] leading-tight">برای ثبت لول‌ها و ذخیره شدن سکه و الماس‌ها ثبت نام کن</span>
                    </div>
                    <Link
                      href="/login?tab=register"
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-[11px] transition shrink-0 shadow-md flex items-center gap-1"
                    >
                      <span>ثبت نام</span>
                      <ArrowRight className="w-3 h-3 text-slate-950 rotate-180" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs: Only Rooms & Skins Store */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
            <button
              onClick={() => setMainTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap btn-spring ${
                mainTab === 'rooms'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>اتاق‌های مسابقه زنده ({rooms.length} سرور فعال)</span>
            </button>

            <button
              onClick={() => setMainTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap btn-spring ${
                mainTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>🏆 برترین‌ها (رتبه‌بندی و لول‌ها)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">ویژه</span>
            </button>

            <button
              onClick={() => setMainTab('levels')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap btn-spring ${
                mainTab === 'levels'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>نقشه لول‌ها (تا ۱,۰۰۰,۰۰۰)</span>
            </button>

            <button
              onClick={() => setMainTab('powerups')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition whitespace-nowrap btn-spring ${
                mainTab === 'powerups'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>قابلیت‌های ویژه رقابتی (Power-ups)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold animate-pulse">جدید</span>
            </button>

            <Link
              href="/replay"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition whitespace-nowrap btn-spring"
            >
              <Video className="w-4 h-4 text-blue-600" />
              <span>بازپخش مسابقات</span>
            </Link>

            <Link
              href="/rooms/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 mr-auto transition whitespace-nowrap btn-spring"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>ایجاد سرور اتاق جدید</span>
            </Link>
          </div>

          {/* TAB CONTENT: LEADERBOARD VIEW */}
          {mainTab === 'leaderboard' && (
            <LeaderboardView
              onSelectUser={(u) => setSelectedLeaderboardUser(u)}
              currentUserXp={(user?.xp) || (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_xp') || '0') : 0)}
              currentUserId={user?.id || currentUserId}
            />
          )}

          {/* TAB CONTENT: ROOMS LOBBY */}
          {mainTab === 'rooms' && (
            <div className="space-y-6">
              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    همه سرورهای اتاق ({rooms.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('fa')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'fa'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    فارسی ({rooms.filter((r) => r.language === 'fa').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('en')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'en'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    انگلیسی ({rooms.filter((r) => r.language === 'en').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('private')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'private'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    رمزدار و اختصاصی ({rooms.filter((r) => r.isPrivate).length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی اتاق، موضوع یا شناسه..."
                    className="w-full text-xs pr-9 pl-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    {/* Top ambient color accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 opacity-80" />

                    <div className="space-y-4">
                      {/* Server & Status Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white flex items-center gap-1.5 shadow-xs">
                          <Server className="w-3.5 h-3.5 text-sky-400" />
                          <span>سرور {room.id}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {room.status === 'ACTIVE' ? (
                            <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              <span>دور فعال (ورود مستقیم)</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-black border border-blue-200">
                              <span>آماده استارت دست</span>
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold">
                            {room.language === 'fa' ? 'فارسی' : 'ENG'}
                          </span>
                        </div>
                      </div>

                      {/* Room Title & Theme */}
                      <div>
                        <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition leading-snug">
                          {room.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold">
                            موضوع: <strong className="text-slate-800">{room.topic}</strong>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200/60">
                            پیست: {room.trackTheme}
                          </span>
                        </div>
                      </div>

                      {/* Server Synchronized Text Preview */}
                      <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-100 text-xs text-slate-700 leading-relaxed relative">
                        <div className="text-[10px] font-black text-slate-400 mb-1 flex items-center gap-1">
                          <Flag className="w-3 h-3 text-blue-500" />
                          <span>متن هماهنگ سرور برای تمام رقبا:</span>
                        </div>
                        <p className="line-clamp-2 font-medium">{room.text}</p>
                      </div>
                    </div>

                    {/* Footer Metrics & Launch Button */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ظرفیت:</span>
                          <span className="font-mono text-slate-900 font-black text-sm">
                            {(Array.isArray(room.participants) ? room.participants.length : (room.onlineUsers || 0)).toLocaleString('fa-IR')} از {room.capacity.toLocaleString('fa-IR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 font-mono text-xs font-black text-blue-700">
                          <Gauge className="w-3.5 h-3.5 text-blue-600" />
                          <span>{room.averageWpm} WPM</span>
                        </div>
                      </div>

                      {room.participants.length >= room.capacity || room.onlineUsers >= room.capacity ? (
                        <button
                          disabled
                          onClick={() => handleRoomClick(room)}
                          className="w-full py-3 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>ظرفیت سرور تکمیل است (پر)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoomClick(room)}
                          className={`w-full py-3 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-98 ${
                            room.status === 'ACTIVE'
                              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 shadow-emerald-500/25'
                              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110 shadow-blue-500/25'
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{room.status === 'ACTIVE' ? 'پیوستن به مسابقه از ادامه دور 🏎️' : 'ورود به پیست مسابقه 🏁'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: POWER-UPS CATALOG */}
          {mainTab === 'powerups' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/30 flex items-center gap-1.5 w-fit">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    ارتقای قدرت اتومبیل‌رانی و خودکارسازی تایپ
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    قابلیت‌های ویژه رقابتی (Power-ups & Nitro Boosters)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                    قابلیت‌های پروپزال که با تایپ دقیق یا درصد مشخصی از متن، قسمت باقی‌مانده متن را به صورت شگفت‌انگیز خودکار تایپ کرده و خودروی شما را با نیترو به خط پایان می‌رساند.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 shrink-0">
                  <CurrencyHUD
                    coins={userCoins}
                    diamonds={userDiamonds}
                    level={user ? (user.level || 1) : 1}
                    size="md"
                    variant="glass"
                  />
                </div>
              </div>

              {/* Power-ups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {POWER_UPS_LIST.map((item) => {
                  const isEquipped = equippedPowerUpId === item.id;
                  const isOwned = ownedPowerUpIds.includes(item.id);
                  const isSub = typeof window !== 'undefined' ? localStorage.getItem('typro_user_is_subscribed') === 'true' : false;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-3xl border p-6 flex flex-col justify-between space-y-4 transition-all duration-300 hover:shadow-xl ${
                        isEquipped
                          ? 'border-amber-500 ring-2 ring-amber-200 shadow-lg'
                          : 'border-slate-200 hover:border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                              {item.requireVIP ? <Crown className="w-5 h-5 text-amber-600" /> : <Zap className="w-5 h-5 text-amber-500" />}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-base text-slate-900">{item.name}</h3>
                              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                {item.badge}
                              </span>
                            </div>
                          </div>

                          {isEquipped && (
                            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>مجهز در مسابقات</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {item.desc}
                        </p>

                        {/* Conditions and Requirements */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-slate-600 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>شرایط فعال‌سازی در پیست:</span>
                            <span className="text-slate-900 font-black">
                              {item.requireAccuracy100 ? `تایپ تا ${item.thresholdPct}٪ متن با دقت ۱۰۰٪ (بدون خطا)` : `رسیدن به ${item.thresholdPct}٪ از متن مسابقه`}
                            </span>
                          </div>

                          {item.requireVIP && (
                            <div className="flex items-center gap-2 text-purple-700 font-extrabold bg-purple-50 p-2 rounded-xl border border-purple-200">
                              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>نیازمند داشتن اشتراک ویژه VIP (فعال در حساب)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Currency Price Badges */}
                        <div className="flex items-center gap-2">
                          <CoinBadge amount={item.priceCoins} size="sm" variant="solid" />
                          {item.priceDiamonds && item.priceDiamonds > 0 && (
                            <DiamondBadge amount={item.priceDiamonds} size="sm" variant="solid" />
                          )}
                        </div>

                        <button
                          onClick={() => handleBuyOrEquipPowerUp(item)}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-98 cursor-pointer ${
                            isEquipped
                              ? 'bg-amber-100 hover:bg-rose-50 text-amber-900 hover:text-rose-700 border border-amber-300 hover:border-rose-300'
                              : isOwned
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                          }`}
                        >
                          {isEquipped ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>فعال است (کلیک برای قطع)</span>
                            </>
                          ) : isOwned ? (
                            <span>تجهیز برای مسابقه</span>
                          ) : (
                            <span>خرید و تجهیز آنی</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rules Notice */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>معماری سرورهای آنلاین رقابت زنده:</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong>یک سرور واحد برای هر اتاق:</strong> تمام تایپیست‌های حاضر در هر اتاق به یک وب‌سوکت و متن واحد متصل هستند و از ادامه با هم تایپ می‌کنند.
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong>اسکین‌های تجهیز شده:</strong> پوسته انتخابی شما در فروشگاه اسکین فوراً در تمامی مسابقات آنلاین لاین شما اعمال می‌گردد.
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong>اصلاح خطا بدون Backspace:</strong> در هنگام اشتباه، مکان‌نما روی حرف مانده و با زدن کلید درست بلافاصله جلو می‌رود.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Level Roadmap Showcase Modal */}
      <LevelShowcaseModal
        isOpen={mainTab === 'levels'}
        onClose={() => setMainTab('rooms')}
        currentXp={(user?.xp) || (typeof window !== 'undefined' ? Number(localStorage.getItem('typro_user_xp') || '0') : 0)}
      />

      {/* Leaderboard User Public Profile Modal */}
      <PublicProfileModal
        isOpen={!!selectedLeaderboardUser}
        onClose={() => setSelectedLeaderboardUser(null)}
        profile={selectedLeaderboardUser}
      />

      {/* Level-Up Celebration Modal (اعلان شیک ارتقای لول) */}
      <LevelUpCelebrationModal
        isOpen={celebrationLevel !== null}
        onClose={() => setCelebrationLevel(null)}
        newLevel={celebrationLevel || 1}
      />
    </div>
  );
}