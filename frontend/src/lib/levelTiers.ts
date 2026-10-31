export interface BadgeStage {
  id: number; // 1 to 500
  nameFa: string;
  nameEn: string;
  realmIdx: number; // 0 to 9
  realmNameFa: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  image: string;
  shape: 'shield' | 'round' | 'chevron' | 'wings' | 'crown' | 'emerald' | 'sapphire' | 'ruby' | 'quantum' | 'cosmic';
  tierTierInRealm: number; // 1 to 50
}

export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 1000000;
export const TOTAL_STAGES = 500;
export const LEVELS_PER_STAGE = 2000; // 1,000,000 / 500 = 2,000 levels per stage!

export const REALM_NAMES_FA = [
  'سپرهای برنز و آهن چکش‌خورده',
  'نشان‌ها و شورون‌های استیل نظامی',
  'شوالیه‌های نقره و شمشیرهای بال‌دار',
  'قهرمانان طلای ۲۴ عیار خورشیدی',
  'تاج‌های پلاتینیوم سلطنتی',
  'نگین‌های زمرد شفق قطبی',
  'یاقوت کبود و بلورهای یخی',
  'شهریاران آمیتیست و یاقوت سرخ',
  'منشورهای سایبر کوانتوم هولوگرافیک',
  'خدایان کیهانی و اربابان کهکشان بی‌نهایت',
];

export const REALM_CONFIGS = [
  {
    nameFa: 'سپرهای برنز و آهن چکش‌خورده',
    color: '#EA580C',
    border: '#FB923C',
    glow: 'rgba(234, 88, 12, 0.55)',
    bg: 'from-orange-500/15 via-amber-500/5 to-white',
    shape: 'shield' as const,
    subTitlesFa: [
      'برنز نوآموز',
      'برنز سپردار',
      'برنز چکش‌خورده',
      'برنز کهنه‌سرباز',
      'برنز نخبه',
      'آهن دلاور',
      'آهن جنگاور',
      'آهن پیشرو',
      'آهن فرمانده',
      'آهن فاتح',
    ],
  },
  {
    nameFa: 'نشان‌ها و شورون‌های استیل نظامی',
    color: '#64748B',
    border: '#94A3B8',
    glow: 'rgba(148, 163, 184, 0.55)',
    bg: 'from-slate-400/20 via-slate-200/10 to-white',
    shape: 'chevron' as const,
    subTitlesFa: [
      'استیل درجه ۳',
      'استیل درجه ۲',
      'استیل درجه ۱',
      'شورون نظامی استیل',
      'سرجوخه استیل',
      'گروهبان استیل',
      'افسر استیل',
      'سرگرد استیل',
      'سرهنگ استیل',
      'سپهبد استیل نظامی',
    ],
  },
  {
    nameFa: 'شوالیه‌های نقره و شمشیرهای بال‌دار',
    color: '#0284C7',
    border: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.6)',
    bg: 'from-sky-500/20 via-blue-500/5 to-white',
    shape: 'wings' as const,
    subTitlesFa: [
      'شوالیه نقره پایه',
      'شمشیردار نقره‌ای',
      'نگهبان نقره',
      'مدافع شوالیه نقره',
      'شوالیه شمشیر بال‌دار',
      'دلاور نقره‌ای بال‌دار',
      'شوالیه کریستال نقره',
      'شوالیه ارشد بال‌دار',
      'شهسوار نقره خورشید',
      'فرمانروای شوالیه‌های نقره',
    ],
  },
  {
    nameFa: 'قهرمانان طلای ۲۴ عیار خورشیدی',
    color: '#D97706',
    border: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.65)',
    bg: 'from-amber-400/25 via-yellow-500/10 to-white',
    shape: 'crown' as const,
    subTitlesFa: [
      'طلای درخشان پایه',
      'طلای ناب شوالیگی',
      'طلای ۲۴ عیار خورشیدی',
      'نشان طلاپور پیروز',
      'پهلوان طلای آفتاب',
      'قهرمان خورشید طلایی',
      'شمشیر زرین قهرمانی',
      'طلای سلطنتی جاودان',
      'پیشوای طلای ۲۴ عیار',
      'امپراتور قهرمانان طلای خورشید',
    ],
  },
  {
    nameFa: 'تاج‌های پلاتینیوم سلطنتی',
    color: '#0EA5E9',
    border: '#7DD3FC',
    glow: 'rgba(14, 165, 233, 0.65)',
    bg: 'from-cyan-500/20 via-sky-500/10 to-white',
    shape: 'round' as const,
    subTitlesFa: [
      'پلاتینیوم بلورین',
      'تاجدار پلاتینیوم پایه',
      'افسر پلاتینیوم سلطنتی',
      'دیهیم پلاتینیوم',
      'نگهدارنده تاج پلاتین',
      'تاج پلاتینیوم شاهین',
      'شهریار پلاتینیوم والا',
      'تاجدار اعظم پلاتینیوم',
      'سلطان پلاتینیوم کهن',
      'شاهنشاه پلاتینیوم سلطنتی',
    ],
  },
  {
    nameFa: 'نگین‌های زمرد شفق قطبی',
    color: '#059669',
    border: '#34D399',
    glow: 'rgba(16, 185, 129, 0.65)',
    bg: 'from-emerald-500/20 via-teal-500/10 to-white',
    shape: 'emerald' as const,
    subTitlesFa: [
      'زمرد شفق قطبی',
      'بلور زمرد یشم',
      'نگین زمرد سبز',
      'زمرد آئورا درخشان',
      'نگهبان زمرد شفق',
      'کیمیاگر زمرد سبز',
      'استاد نگین زمرد',
      'فرمانروای شفق قطبی',
      'زمرد جاودانه قطب',
      'خداوندگار زمرد شفق',
    ],
  },
  {
    nameFa: 'یاقوت کبود و بلورهای یخی',
    color: '#2563EB',
    border: '#60A5FA',
    glow: 'rgba(37, 99, 235, 0.7)',
    bg: 'from-blue-600/20 via-indigo-500/10 to-white',
    shape: 'sapphire' as const,
    subTitlesFa: [
      'یاقوت کبود آسمان',
      'بلور یخ یاقوتی',
      'یاقوت لاجورد عمیق',
      'یخ‌شکن یاقوت کبود',
      'نگین اقیانوس یاقوت',
      'شهریار یاقوت کبود',
      'بلور جاودان یخ کبود',
      'سرور یاقوت کهکشانی',
      'یاقوت کبود سلطنتی',
      'فرمانروای بلورهای یخ و یاقوت',
    ],
  },
  {
    nameFa: 'شهریاران آمیتیست و یاقوت سرخ',
    color: '#E11D48',
    border: '#FB7185',
    glow: 'rgba(225, 29, 72, 0.7)',
    bg: 'from-rose-500/20 via-red-500/10 to-white',
    shape: 'ruby' as const,
    subTitlesFa: [
      'یاقوت سرخ آذرین',
      'آمیتیست بنفش',
      'یاقوت ارغوانی شاهوار',
      'نگین سرخ آتشین',
      'شهریار آمیتیست سرخ',
      'شوالیه یاقوت شعله‌ور',
      'فرمانده یاقوت خونین',
      'امپراتور آمیتیست والا',
      'یاقوت سرخ آتشفشانی',
      'شهریار اعظم یاقوت سرخ',
    ],
  },
  {
    nameFa: 'منشورهای سایبر کوانتوم هولوگرافیک',
    color: '#7C3AED',
    border: '#C084FC',
    glow: 'rgba(124, 58, 237, 0.75)',
    bg: 'from-purple-500/25 via-violet-500/10 to-white',
    shape: 'quantum' as const,
    subTitlesFa: [
      'سایبر کوانتوم پایه',
      'منشور کوانتومی هولوگرافیک',
      'پردازنده سایبر نئون',
      'امواج سایبر کوانتوم',
      'شتاب‌دهنده ذرات سایبر',
      'منشور فوتونیک کوانتوم',
      'هکر واقعیت کوانتومی',
      'ماتریس سایبر پیشرفته',
      'معمار کوانتوم سایبری',
      'فرمانروای سایبر کوانتوم',
    ],
  },
  {
    nameFa: 'خدایان کیهانی و اربابان کهکشان بی‌نهایت',
    color: '#DB2777',
    border: '#F472B6',
    glow: 'rgba(219, 39, 119, 0.8)',
    bg: 'from-pink-500/25 via-fuchsia-500/10 to-white',
    shape: 'cosmic' as const,
    subTitlesFa: [
      'ستاره کیهانی آغازین',
      'تپ‌اختر کیهان کهکشانی',
      'ابَرنواختر کیهانی',
      'نگهبان کهکشان بی‌نهایت',
      'ارباب سحابی‌های نور',
      'خالق ستارگان کیهان',
      'فرمانروای کهکشان ابدی',
      'خدای کیهانی کهکشان',
      'حاکم ماده تاریک و کیهان',
      'ارباب مطلق کهکشان بی‌نهایت',
    ],
  },
];

export const SUB_TIER_PALETTES = REALM_CONFIGS.map((r) => ({
  name: r.subTitlesFa[0],
  color: r.color,
  border: r.border,
  glow: r.glow,
  bg: r.bg,
}));

export const BADGE_STAGES: BadgeStage[] = Array.from({ length: TOTAL_STAGES }, (_, i) => {
  const id = i + 1; // 1 to 500
  const realmIdx = Math.min(9, Math.floor(i / 50)); // 0 to 9
  const tierInRealm = (i % 50) + 1; // 1 to 50
  const subTierIdx = Math.min(9, Math.floor((tierInRealm - 1) / 5)); // 0 to 9 (advances every 5 stages)
  const minLevel = i === 0 ? 1 : i * LEVELS_PER_STAGE;
  const maxLevel = (i + 1) * LEVELS_PER_STAGE - 1;

  const realmConfig = REALM_CONFIGS[realmIdx];
  const subTitle = realmConfig.subTitlesFa[subTierIdx];

  // Exact 1 to 100 badge image from the 10x10 poster:
  // Row = realmIdx (0 to 9), Col = subTierIdx (0 to 9)
  const badgeNumber = Math.min(100, Math.max(1, (realmIdx * 10) + subTierIdx + 1));

  return {
    id,
    nameFa: `رتبه ${id} • ${subTitle}`,
    nameEn: `Stage ${id} • ${subTitle}`,
    realmIdx,
    realmNameFa: realmConfig.nameFa,
    minLevel,
    maxLevel: id === 500 ? MAX_LEVEL : maxLevel,
    color: realmConfig.color,
    borderColor: realmConfig.border,
    glowColor: realmConfig.glow,
    bgGradient: realmConfig.bg,
    image: `/images/ranks/badge_${badgeNumber}.webp`,
    shape: realmConfig.shape,
    tierTierInRealm: tierInRealm,
  };
});

/**
 * Calculate level from XP.
 * 0 - 99 XP = Level 1
 * 100 - 199 XP = Level 2
 * Level = Math.floor(xp / 100) + 1 (capped at 1,000,000)
 */
export function calculateLevelFromXp(xp: number): number {
  if (!xp || xp < 0) return 1;
  const lvl = Math.floor(xp / XP_PER_LEVEL) + 1;
  return Math.min(MAX_LEVEL, Math.max(1, lvl));
}

/**
 * Calculate total XP required to reach a specific level
 */
export function calculateXpForLevel(level: number): number {
  const boundedLevel = Math.min(MAX_LEVEL, Math.max(1, level));
  return (boundedLevel - 1) * XP_PER_LEVEL;
}

/**
 * Get the exact badge stage (1 to 500) for a given level
 */
export function getBadgeStageForLevel(level: number): BadgeStage {
  const boundedLevel = Math.min(MAX_LEVEL, Math.max(1, level));
  const stageIdx = Math.min(TOTAL_STAGES - 1, Math.floor((boundedLevel - 1) / LEVELS_PER_STAGE));
  return BADGE_STAGES[stageIdx] || BADGE_STAGES[0];
}

export const getLevelTier = getBadgeStageForLevel;

/**
 * Calculate 1 to 5 stars for progression inside the current 2,000 level stage
 */
export function getSubTierStars(level: number, stage: BadgeStage): number {
  const range = stage.maxLevel - stage.minLevel + 1;
  const progressInStage = Math.max(0, level - stage.minLevel);
  const ratio = progressInStage / range;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.8) return 4;
  return 5;
}

/**
 * Get full progression state from total XP
 */
export function getFullLevelProgress(xp: number) {
  const level = calculateLevelFromXp(xp);
  const stage = getBadgeStageForLevel(level);
  const stars = getSubTierStars(level, stage);

  const xpCurrentLevelStart = calculateXpForLevel(level);
  const xpCurrentLevelProgress = Math.max(0, xp - xpCurrentLevelStart);
  const progressPercent = Math.min(100, Math.round((xpCurrentLevelProgress / XP_PER_LEVEL) * 100));

  const isMaxLevel = level >= MAX_LEVEL;
  const nextLevelXp = isMaxLevel ? 0 : XP_PER_LEVEL - xpCurrentLevelProgress;

  return {
    level,
    stage,
    stars,
    progressPercent,
    xp,
    currentXp: xp,
    xpCurrentLevelProgress,
    nextLevelXp,
    isMaxLevel,
  };
}

/**
 * Format large numbers cleanly and gracefully in Persian without breaking UI layouts.
 * - Under 10,000,000: full comma-separated Persian digits (e.g. ۱۰۱,۰۶۴)
 * - 10M to 999M: e.g. ۲۵ میلیون
 * - 1B to 999B: e.g. ۳.۵ میلیارد
 * - 1T+: e.g. ۱.۲ تریلیون
 */
export function formatTyproNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '۰';
  const val = Number(num);
  if (isNaN(val) || val < 0) return '۰';
  if (val >= 1_000_000_000_000) {
    const t = val / 1_000_000_000_000;
    return (t >= 100 ? Math.round(t) : Number(t.toFixed(1))).toLocaleString('fa-IR') + ' تریلیون';
  }
  if (val >= 1_000_000_000) {
    const b = val / 1_000_000_000;
    return (b >= 100 ? Math.round(b) : Number(b.toFixed(1))).toLocaleString('fa-IR') + ' میلیارد';
  }
  if (val >= 10_000_000) {
    const m = val / 1_000_000;
    return (m >= 100 ? Math.round(m) : Number(m.toFixed(1))).toLocaleString('fa-IR') + ' میلیون';
  }
  return Math.floor(val).toLocaleString('fa-IR');
}

