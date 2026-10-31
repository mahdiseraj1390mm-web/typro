'use client';

export type GameAccessTier = 'free' | 'vip' | 'admin_only' | 'disabled';
export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

export interface GameConfigItem {
  id: string;
  key: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  desc: string;
  icon: string;
  badge: string;
  themeColor: string;
  gradient: string;
  accessTier: GameAccessTier;
  maxDailyPlaysFree: number; // مثلا ۳ بار در روز برای رایگان، نامحدود برای VIP و ادمین
  coinReward: number;
  xpReward: number;
  difficulty: GameDifficulty;
  unlockedUserIds: string[]; // کاربرانی که مدیر کل مستقیماً به آن‌ها دسترسی باز داده است (موبایل یا نام کاربری)
  isActive: boolean;
}

export const DEFAULT_GAMES_CONFIG: GameConfigItem[] = [
  {
    id: 'game-wordfall',
    key: 'wordfall',
    title: 'باران شهاب‌سنگ و کلمات',
    englishTitle: 'Meteor WordFall Arcade',
    subtitle: 'آزمون شتاب، بازتاب و سرعت انگشتان',
    desc: 'کلمات و شهاب‌سنگ‌های نورانی از آسمان فرو می‌ریزند. قبل از برخورد به سطح پایگاه، حروف آن‌ها را تایپ کرده و اهداف را منهدم کنید.',
    icon: '☄️',
    badge: 'محبوب‌ترین آرکید',
    themeColor: '#f59e0b',
    gradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/40 text-amber-900',
    accessTier: 'free',
    maxDailyPlaysFree: 5,
    coinReward: 25,
    xpReward: 40,
    difficulty: 'adaptive',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-defense',
    key: 'defense',
    title: 'پدافند و شلیک لیزری پایگاه',
    englishTitle: 'Laser Defense Base',
    subtitle: 'دفاع سه‌خطه از دروازه تایپ',
    desc: 'اهداف متخاصم در ۳ لاین موازی به سمت سنگر دفاعی شما نزدیک می‌شوند. هر کلمه را دقیق بنویسید تا توپ لیزری شلیک کند.',
    icon: '🛡️',
    badge: 'چالش تمرکز چندطرفه',
    themeColor: '#10b981',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/40 text-emerald-900',
    accessTier: 'free',
    maxDailyPlaysFree: 5,
    coinReward: 30,
    xpReward: 50,
    difficulty: 'medium',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-chaser',
    key: 'chaser',
    title: 'کورس شتاب و نیترو رانندگی',
    englishTitle: 'Nitro Speed Racer',
    subtitle: 'سبقت سرعتی و جا گذاشتن موانع پیست',
    desc: 'با خودروی مسابقه‌ای خود در بزرگراه شتاب بگیرید. هر ۳ کلمه متوالی بدون خطا سوخت نیترو را فعال کرده و شما را به صدر جدول می‌برد.',
    icon: '🏎️',
    badge: 'اشتراک VIP',
    themeColor: '#3b82f6',
    gradient: 'from-blue-500/20 via-sky-500/20 to-indigo-500/20 border-blue-500/40 text-blue-900',
    accessTier: 'vip',
    maxDailyPlaysFree: 2,
    coinReward: 60,
    xpReward: 90,
    difficulty: 'hard',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-bomb',
    key: 'bomb',
    title: 'خنثی‌سازی بمب ساعتی',
    englishTitle: 'Time Bomb Defusal',
    subtitle: 'کنترل اضطراب، سیم‌های انفجاری و دقت ۱۰۰٪',
    desc: 'فتیله بمب ساعتی روشن است و ثانیه‌ها با سرعت سپری می‌شوند. سیم‌های حساس را با تایپ معکوس و دقیق کلمات برش دهید تا انفجار مهار شود.',
    icon: '💣',
    badge: 'اشتراک VIP',
    themeColor: '#ef4444',
    gradient: 'from-red-500/20 via-rose-500/20 to-pink-500/20 border-red-500/40 text-red-900',
    accessTier: 'vip',
    maxDailyPlaysFree: 2,
    coinReward: 75,
    xpReward: 120,
    difficulty: 'hard',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-balloon',
    key: 'balloon',
    title: 'بالن‌های شناور آسمان',
    englishTitle: 'Floating Balloon Pop',
    subtitle: 'آرامش‌بخش، تقویت هماهنگی چشم و صفحه کلید',
    desc: 'بالن‌های رنگارنگ با کلمات کوتاه و متوسط به سمت آسمان بالا می‌روند. قبل از ناپدید شدن در ابرها بالن‌ها را بترکانید و سکه صید کنید.',
    icon: '🎈',
    badge: 'تفریحی و آرامش‌بخش',
    themeColor: '#8b5cf6',
    gradient: 'from-purple-500/20 via-pink-500/20 to-rose-500/20 border-purple-500/40 text-purple-900',
    accessTier: 'free',
    maxDailyPlaysFree: 5,
    coinReward: 20,
    xpReward: 35,
    difficulty: 'easy',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-mining',
    key: 'mining',
    title: 'معدن‌کاوی و استخراج الماس',
    englishTitle: 'Word Miner & Gem Rush',
    subtitle: 'حفاری لایه‌های زمین با کشف طلای مخفی',
    desc: 'با هر کلمه صحیح، یک لایه سنگ را بشکنید و به رگه‌های طلا و الماس برسید. کلمات پیچیده‌تر، جواهرات ارزشمندتری در کوله‌پشتی شما ذخیره می‌کنند.',
    icon: '⛏️',
    badge: 'اشتراک ویژه VIP',
    themeColor: '#0ea5e9',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-sky-500/20 border-cyan-500/40 text-cyan-900',
    accessTier: 'vip',
    maxDailyPlaysFree: 1,
    coinReward: 80,
    xpReward: 130,
    difficulty: 'hard',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-hacker',
    key: 'hacker',
    title: 'هک سایبری و نفوذ به سرور ۳D',
    englishTitle: 'Cyber Hacker Terminal 3D',
    subtitle: 'نفوذ به فایروال‌های ماتریس و شکستن پروتکل‌های امنیتی',
    desc: 'هسته امنیتی شبکه دارای لایه‌های رمزنگاری است. با تایپ پرسرعت رشته‌کدهای عبور، قبل از فعال شدن ردیاب امنیتی، به دیتاسنتر نفوذ کنید.',
    icon: '💻',
    badge: 'استایل ماتریکس VIP',
    themeColor: '#22c55e',
    gradient: 'from-emerald-500/20 via-green-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-900',
    accessTier: 'vip',
    maxDailyPlaysFree: 2,
    coinReward: 85,
    xpReward: 140,
    difficulty: 'hard',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-parkour',
    key: 'parkour',
    title: 'پارکور و دویدن نئونی ۳D',
    englishTitle: 'Cyber Parkour Runner 3D',
    subtitle: 'دویدن بی‌پایان روی پشت‌بام آسمان‌خراش‌های آینده',
    desc: 'روی لبه پشت‌بام‌های مدرن به پیش بدوید؛ هر مانع و پرش بلند نیازمند تایپ سریع واژه‌ای است تا کاراکتر حرکات آکروباتیک نمایشی بزند.',
    icon: '🏃',
    badge: 'آدرنالین خالص',
    themeColor: '#ec4899',
    gradient: 'from-pink-500/20 via-rose-500/20 to-purple-500/20 border-pink-500/40 text-pink-900',
    accessTier: 'free',
    maxDailyPlaysFree: 5,
    coinReward: 40,
    xpReward: 65,
    difficulty: 'adaptive',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-penalty',
    key: 'penalty',
    title: 'ضربات پنالتی فوتبال ۳D',
    englishTitle: 'Penalty Shootout 3D',
    subtitle: 'شوت‌های کات‌دار به کنج دروازه با فریاد گزارشگر',
    desc: 'کنج‌های دروازه را هدف بگیرید؛ واژگان گوشه‌ها با تایپ بی‌نقص شوت‌های مهارنشدنی روانه تور دروازه کرده و استادیوم را به وجد می‌آورند.',
    icon: '⚽',
    badge: 'جام قهرمانی',
    themeColor: '#eab308',
    gradient: 'from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/40 text-amber-900',
    accessTier: 'free',
    maxDailyPlaysFree: 5,
    coinReward: 35,
    xpReward: 60,
    difficulty: 'medium',
    unlockedUserIds: [],
    isActive: true,
  },
  {
    id: 'game-boxing',
    key: 'boxing',
    title: 'نبرد ربات‌های بوکسور ۳D',
    englishTitle: 'Cyber Mech Boxing 3D',
    subtitle: 'مبارزه غول‌های هیدرولیکی در رینگ آینده‌نگرانه',
    desc: 'ربات جنگنده خود را با کلمات ضربتی چپ، راست و آپرکارت کنترل کنید؛ کمبوهای تایپ باعث ناک‌اوت کردن حریف در راند طلایی می‌شوند.',
    icon: '🤖',
    badge: 'مبارزاتی VIP',
    themeColor: '#8b5cf6',
    gradient: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20 border-violet-500/40 text-violet-900',
    accessTier: 'vip',
    maxDailyPlaysFree: 2,
    coinReward: 70,
    xpReward: 110,
    difficulty: 'hard',
    unlockedUserIds: [],
    isActive: true,
  },
];

const STORAGE_KEY = 'typro_admin_games_config';
const USER_PLAYS_KEY = 'typro_user_game_daily_plays';

export function getGamesConfig(): GameConfigItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_GAMES_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GAMES_CONFIG;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GAMES_CONFIG;
  } catch {
    return DEFAULT_GAMES_CONFIG;
  }
}

export function saveGamesConfig(configs: GameConfigItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent('typro_games_config_changed', { detail: configs }));
  } catch (err) {
    console.error('Failed to save games config:', err);
  }
}

// User Daily Plays Tracker
export interface UserDailyPlays {
  date: string;
  plays: Record<string, number>; // gameId -> count
}

export function getUserDailyPlays(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(USER_PLAYS_KEY);
    if (!raw) return {};
    const parsed: UserDailyPlays = JSON.parse(raw);
    if (parsed.date !== today) {
      // New day, reset
      localStorage.setItem(USER_PLAYS_KEY, JSON.stringify({ date: today, plays: {} }));
      return {};
    }
    return parsed.plays || {};
  } catch {
    return {};
  }
}

export function recordUserGamePlay(gameId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const plays = getUserDailyPlays();
    plays[gameId] = (plays[gameId] || 0) + 1;
    localStorage.setItem(USER_PLAYS_KEY, JSON.stringify({ date: today, plays }));
  } catch (err) {
    console.error('Failed to record play:', err);
  }
}

export function canUserPlayGame(
  game: GameConfigItem,
  user: any
): { canPlay: boolean; reason?: 'admin' | 'special_access' | 'vip' | 'free' | 'daily_limit' | 'vip_required' | 'disabled' } {
  // ۱. مدیر کل (SUPER_ADMIN یا ADMIN): دسترسی ۱۰۰٪ بدون هیچ محدودیتی
  if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
    return { canPlay: true, reason: 'admin' };
  }

  // ۲. بررسی غیرفعال بودن بازی توسط ادمین
  if (!game.isActive || game.accessTier === 'disabled') {
    return { canPlay: false, reason: 'disabled' };
  }

  // ۳. بررسی باز بودن بازی به صورت اختصاصی توسط مدیر کل برای این کاربر خاص
  const userIdentifier = user?.mobile || user?.username || '';
  if (userIdentifier && game.unlockedUserIds && game.unlockedUserIds.includes(userIdentifier)) {
    return { canPlay: true, reason: 'special_access' };
  }

  // ۴. کاربر ویژه دارای اشتراک (VIP)
  let isVip = Boolean(
    user && (user.subscriptionTier === 'VIP' || user.subscriptionTier === 'PRO' || user.isVip || user.isSubscribed)
  );

  if (!isVip && typeof window !== 'undefined') {
    const localSub = localStorage.getItem('typro_user_is_subscribed');
    const localPlan = localStorage.getItem('typro_user_subscription');
    if (localSub === 'true' || localPlan === 'premium-monthly' || localPlan === 'premium-yearly') {
      isVip = true;
    }
  }

  if (isVip) {
    return { canPlay: true, reason: 'vip' };
  }

  // ۵. اگر بازی ویژه VIP باشد و کاربر عادی باشد
  if (game.accessTier === 'vip' || game.accessTier === 'admin_only') {
    return { canPlay: false, reason: 'vip_required' };
  }

  // ۶. بررسی سقف بازی روزانه برای کاربران رایگان
  const dailyPlays = getUserDailyPlays();
  const currentCount = dailyPlays[game.id] || 0;
  if (currentCount >= game.maxDailyPlaysFree) {
    return { canPlay: false, reason: 'daily_limit' };
  }

  return { canPlay: true, reason: 'free' };
}
