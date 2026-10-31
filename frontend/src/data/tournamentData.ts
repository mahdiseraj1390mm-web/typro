export interface TournamentPlayer {
  id: string;
  name: string;
  avatar?: string;
  carSkin?: string;
  city?: string;
  avgWpm: number;
  accuracy: number;
  preferredSlot: 'afternoon' | 'night';
  isUser?: boolean;
  status: 'registered' | 'checked_in' | 'eliminated' | 'champion';
  registeredAt?: string;
}

export interface BracketMatch {
  id: string;
  roundKey:
    | 'winners_qf'
    | 'winners_sf'
    | 'winners_final'
    | 'losers_r1'
    | 'losers_r2'
    | 'losers_final'
    | 'grand_final';
  roundNameFa: string;
  bracketType: 'winners' | 'losers' | 'grand_final';
  p1: TournamentPlayer;
  p2: TournamentPlayer;
  p1Score?: number; // WPM
  p2Score?: number; // WPM
  p1Accuracy?: number;
  p2Accuracy?: number;
  winnerId?: string;
  status: 'upcoming' | 'live' | 'completed';
  scheduledTime?: string;
  spectatorsCount?: number;
}

export interface WeeklyTournamentConfig {
  id: string;
  title: string;
  weekNumber: number;
  seasonFa: string;
  typingText: string;
  prizePool: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  forcedPhase: 'auto' | 'registration' | 'live' | 'completed';
  votesAfternoon: number;
  votesNight: number;
  afternoonTimeLabel: string;
  nightTimeLabel: string;
  minRequiredPlayers: number;
  registeredPlayers: TournamentPlayer[];
  matches: BracketMatch[];
  champion?: TournamentPlayer;
  lastUpdated: string;
}

export const MIN_TOURNAMENT_PARTICIPANTS = 10;

/**
 * Creates empty placeholder player for bracket slots
 */
export function createSlotPlaceholder(slotNumber: number): TournamentPlayer {
  return {
    id: `slot-${slotNumber}`,
    name: `جایگاه شماره ${slotNumber} (در انتظار ثبت‌نام)`,
    city: 'ثبت‌نام نشده',
    avgWpm: 0,
    accuracy: 0,
    preferredSlot: 'night',
    status: 'registered',
  };
}

/**
 * Generates matches based on real registered players
 */
export function generateDynamicBracket(players: TournamentPlayer[]): BracketMatch[] {
  // If fewer than 10 players, generate bracket with registered players and placeholders for remaining slots
  const totalSlots = Math.max(8, Math.ceil(Math.max(players.length, MIN_TOURNAMENT_PARTICIPANTS) / 2) * 2);
  const seeded: TournamentPlayer[] = [];

  for (let i = 0; i < totalSlots; i++) {
    if (players[i]) {
      seeded.push(players[i]);
    } else {
      seeded.push(createSlotPlaceholder(i + 1));
    }
  }

  const isReady = players.length >= MIN_TOURNAMENT_PARTICIPANTS;

  // Winners Quarter-Finals (4 matches)
  const wqf1: BracketMatch = {
    id: 'wqf-1',
    roundKey: 'winners_qf',
    roundNameFa: 'یک‌چهارم برندگان - بازی ۱',
    bracketType: 'winners',
    p1: seeded[0],
    p2: seeded[1],
    status: isReady ? 'upcoming' : 'upcoming',
    scheduledTime: 'شنبه - راند اول',
    spectatorsCount: 0,
  };
  const wqf2: BracketMatch = {
    id: 'wqf-2',
    roundKey: 'winners_qf',
    roundNameFa: 'یک‌چهارم برندگان - بازی ۲',
    bracketType: 'winners',
    p1: seeded[2],
    p2: seeded[3],
    status: 'upcoming',
    scheduledTime: 'شنبه - راند اول',
    spectatorsCount: 0,
  };
  const wqf3: BracketMatch = {
    id: 'wqf-3',
    roundKey: 'winners_qf',
    roundNameFa: 'یک‌چهارم برندگان - بازی ۳',
    bracketType: 'winners',
    p1: seeded[4],
    p2: seeded[5],
    status: 'upcoming',
    scheduledTime: 'شنبه - راند اول',
    spectatorsCount: 0,
  };
  const wqf4: BracketMatch = {
    id: 'wqf-4',
    roundKey: 'winners_qf',
    roundNameFa: 'یک‌چهارم برندگان - بازی ۴',
    bracketType: 'winners',
    p1: seeded[6],
    p2: seeded[7],
    status: 'upcoming',
    scheduledTime: 'شنبه - راند اول',
    spectatorsCount: 0,
  };

  // Winners Semi-Finals (2 matches)
  const wsf1: BracketMatch = {
    id: 'wsf-1',
    roundKey: 'winners_sf',
    roundNameFa: 'نیمه‌نهایی برندگان - بازی ۱',
    bracketType: 'winners',
    p1: { ...createSlotPlaceholder(1), name: 'برنده بازی ۱ یک‌چهارم' },
    p2: { ...createSlotPlaceholder(2), name: 'برنده بازی ۲ یک‌چهارم' },
    status: 'upcoming',
    scheduledTime: 'شنبه - راند دوم',
    spectatorsCount: 0,
  };
  const wsf2: BracketMatch = {
    id: 'wsf-2',
    roundKey: 'winners_sf',
    roundNameFa: 'نیمه‌نهایی برندگان - بازی ۲',
    bracketType: 'winners',
    p1: { ...createSlotPlaceholder(3), name: 'برنده بازی ۳ یک‌چهارم' },
    p2: { ...createSlotPlaceholder(4), name: 'برنده بازی ۴ یک‌چهارم' },
    status: 'upcoming',
    scheduledTime: 'شنبه - راند دوم',
    spectatorsCount: 0,
  };

  // Winners Final (1 match)
  const wf1: BracketMatch = {
    id: 'wf-1',
    roundKey: 'winners_final',
    roundNameFa: 'فینال برندگان (Winners Final)',
    bracketType: 'winners',
    p1: { ...createSlotPlaceholder(1), name: 'برنده نیمه‌نهایی ۱' },
    p2: { ...createSlotPlaceholder(2), name: 'برنده نیمه‌نهایی ۲' },
    status: 'upcoming',
    scheduledTime: 'شنبه - راند سوم',
    spectatorsCount: 0,
  };

  // Losers Round 1 (2 matches)
  const lr1: BracketMatch = {
    id: 'lr-1',
    roundKey: 'losers_r1',
    roundNameFa: 'شانس مجدد - راند ۱ (بازی ۱)',
    bracketType: 'losers',
    p1: { ...createSlotPlaceholder(1), name: 'بازنده بازی ۱ یک‌چهارم' },
    p2: { ...createSlotPlaceholder(2), name: 'بازنده بازی ۲ یک‌چهارم' },
    status: 'upcoming',
    scheduledTime: 'شنبه - بازندگان',
    spectatorsCount: 0,
  };
  const lr2: BracketMatch = {
    id: 'lr-2',
    roundKey: 'losers_r1',
    roundNameFa: 'شانس مجدد - راند ۱ (بازی ۲)',
    bracketType: 'losers',
    p1: { ...createSlotPlaceholder(3), name: 'بازنده بازی ۳ یک‌چهارم' },
    p2: { ...createSlotPlaceholder(4), name: 'بازنده بازی ۴ یک‌چهارم' },
    status: 'upcoming',
    scheduledTime: 'شنبه - بازندگان',
    spectatorsCount: 0,
  };

  // Losers Round 2 (2 matches)
  const lr21: BracketMatch = {
    id: 'lr2-1',
    roundKey: 'losers_r2',
    roundNameFa: 'شانس مجدد - راند ۲ (بازی ۱)',
    bracketType: 'losers',
    p1: { ...createSlotPlaceholder(1), name: 'برنده بازی ۱ شانس مجدد' },
    p2: { ...createSlotPlaceholder(2), name: 'بازنده نیمه‌نهایی ۱ برندگان' },
    status: 'upcoming',
    scheduledTime: 'شنبه - بازندگان',
    spectatorsCount: 0,
  };
  const lr22: BracketMatch = {
    id: 'lr2-2',
    roundKey: 'losers_r2',
    roundNameFa: 'شانس مجدد - راند ۲ (بازی ۲)',
    bracketType: 'losers',
    p1: { ...createSlotPlaceholder(3), name: 'برنده بازی ۲ شانس مجدد' },
    p2: { ...createSlotPlaceholder(4), name: 'بازنده نیمه‌نهایی ۲ برندگان' },
    status: 'upcoming',
    scheduledTime: 'شنبه - بازندگان',
    spectatorsCount: 0,
  };

  // Losers Final (1 match)
  const lf1: BracketMatch = {
    id: 'lf-1',
    roundKey: 'losers_final',
    roundNameFa: 'فینال شانس مجدد (Losers Final)',
    bracketType: 'losers',
    p1: { ...createSlotPlaceholder(1), name: 'برنده راند ۲ شانس مجدد' },
    p2: { ...createSlotPlaceholder(2), name: 'بازنده فینال برندگان' },
    status: 'upcoming',
    scheduledTime: 'شنبه - ماقبل فینال',
    spectatorsCount: 0,
  };

  // Grand Final
  const gf1: BracketMatch = {
    id: 'gf-1',
    roundKey: 'grand_final',
    roundNameFa: 'فینال بزرگ قهرمانی (Grand Final)',
    bracketType: 'grand_final',
    p1: { ...createSlotPlaceholder(1), name: 'قهرمان براکت برندگان' },
    p2: { ...createSlotPlaceholder(2), name: 'قهرمان براکت شانس مجدد' },
    status: 'upcoming',
    scheduledTime: 'شنبه - فینال پایانی',
    spectatorsCount: 0,
  };

  return [wqf1, wqf2, wqf3, wqf4, wsf1, wsf2, wf1, lr1, lr2, lr21, lr22, lf1, gf1];
}

export const INITIAL_WEEKLY_TOURNAMENT: WeeklyTournamentConfig = {
  id: 'typro-week-39',
  title: 'جام قهرمانی هفتگی تایپرو (هفته ۳۹)',
  weekNumber: 39,
  seasonFa: 'پاییز ۱۴۰۵',
  typingText:
    'مهارت تایپ ده‌انگشتی، پلی استوار میان اندیشه و دنیای دیجیتال است. تسلط بر صفحه‌کلید، تمرکز لحظه‌ای و هماهنگی دقیق عصب و بینایی، جایگاه ویژه‌ای در مسابقات رسمی ورزش‌های الکترونیک دارد. هر کلیدی که فشرده می‌شود گامی به سوی اوج سرعت و کمال دقت است.',
  prizePool: '۵۰,۰۰۰,۰۰۰ تومان + تندیس قهرمانی',
  firstPrize: '۲۵,۰۰۰,۰۰۰ تومان + پوسته اختصاصی شاهنامه',
  secondPrize: '۱۵,۰۰۰,۰۰۰ تومان + اشتراک ۶ ماهه VIP',
  thirdPrize: '۱۰,۰۰۰,۰۰۰ تومان + ۵,۰۰۰ سکه تایپرو',
  forcedPhase: 'auto',
  minRequiredPlayers: MIN_TOURNAMENT_PARTICIPANTS,
  votesAfternoon: 0, // آرای واقعی با ثبت‌نام کاربران شروع می‌شود
  votesNight: 0,     // آرای واقعی با ثبت‌نام کاربران شروع می‌شود
  afternoonTimeLabel: 'بعدازظهر (ساعت ۱۷:۰۰ الی ۱۹:۰۰)',
  nightTimeLabel: 'شب (ساعت ۲۱:۰۰ الی ۲۳:۰۰)',
  registeredPlayers: [], // هیچ فرد فیک و غیرواقعی قرار ندارد؛ تنها کاربران ثبت‌نامی واقعی اضافه می‌شوند
  matches: generateDynamicBracket([]),
  champion: undefined, // چون هنوز دوره‌ای برگزار نشده، قهرمان فیک وجود ندارد
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'typro_weekly_tournament_config';

/**
 * Returns current phase of the weekly cycle:
 * - 'registration': Thursday (4) and Friday (5)
 * - 'live': Saturday (6)
 * - 'completed': Sunday (0), Monday (1), Tuesday (2), Wednesday (3)
 */
export function getCalculatedWeeklyPhase(forcedPhase?: string): 'registration' | 'live' | 'completed' {
  if (forcedPhase && forcedPhase !== 'auto') {
    return forcedPhase as 'registration' | 'live' | 'completed';
  }
  const day = new Date().getDay(); // 0 = Sun, 4 = Thu, 5 = Fri, 6 = Sat
  if (day === 4 || day === 5) {
    return 'registration';
  }
  if (day === 6) {
    return 'live';
  }
  return 'completed';
}

/**
 * Determines whether match will be afternoon or night based on votes
 */
export function getWinningSlot(config: WeeklyTournamentConfig): {
  slot: 'afternoon' | 'night';
  label: string;
  votes: number;
  totalVotes: number;
  percentage: number;
} {
  const total = (config.votesAfternoon || 0) + (config.votesNight || 0);
  if (total === 0) {
    return {
      slot: 'night',
      label: 'در انتظار اولین رأی ثبت‌نام‌کنندگان (شب یا بعدازظهر)',
      votes: 0,
      totalVotes: 0,
      percentage: 0,
    };
  }

  const isNightWinning = (config.votesNight || 0) >= (config.votesAfternoon || 0);
  const winningVotes = isNightWinning ? config.votesNight : config.votesAfternoon;
  const pct = Math.round((winningVotes / total) * 100);

  return {
    slot: isNightWinning ? 'night' : 'afternoon',
    label: isNightWinning ? config.nightTimeLabel : config.afternoonTimeLabel,
    votes: winningVotes,
    totalVotes: total,
    percentage: pct,
  };
}

/**
 * Retrieves the stored weekly tournament config or fallback
 */
export function getStoredTournamentConfig(): WeeklyTournamentConfig {
  if (typeof window === 'undefined') return INITIAL_WEEKLY_TOURNAMENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        // Ensure no leftover mock fake players
        if (
          Array.isArray(parsed.registeredPlayers) &&
          parsed.registeredPlayers.some((p: any) => p.name === 'محمدرضا کاظمی' || p.name === 'علی رضایی')
        ) {
          // Reset to clean state without fake people
          const cleaned = {
            ...parsed,
            registeredPlayers: parsed.registeredPlayers.filter((p: any) => p.isUser),
            champion: undefined,
          };
          cleaned.matches = generateDynamicBracket(cleaned.registeredPlayers);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read weekly tournament config from storage:', err);
  }
  return INITIAL_WEEKLY_TOURNAMENT;
}

/**
 * Saves tournament config to localStorage and dispatches a broadcast event for live reactive updates
 */
export function saveStoredTournamentConfig(config: WeeklyTournamentConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...config, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('typro_tournament_updated'));
  } catch (err) {
    console.error('Failed to save weekly tournament config to storage:', err);
  }
}
