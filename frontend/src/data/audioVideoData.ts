export interface AudioLessonItem {
  id: string;
  title: string;
  category: string;
  categoryFa: string;
  audioPrompt: string;
  audioUrl?: string; // Optional actual audio file URL
  referenceTranscript: string; // The reference text configured in admin panel (hidden by default in blind mode)
  durationEst: string;
  difficulty: 'مقدماتی' | 'متوسط' | 'پیشرفته';
  source?: 'admin' | 'preset';
}

export interface VideoSegmentItem {
  id: string;
  timestamp: string;
  timestampSeconds: number;
  expectedDurationSec: number;
  referenceText: string; // The reference text configured in admin
}

export interface VideoLessonItem {
  id: string;
  title: string;
  genre: string;
  speaker: string;
  totalDuration: string;
  thumbnailGradient: string;
  videoUrl?: string;
  segments: VideoSegmentItem[];
  source?: 'admin' | 'preset';
}

export const INITIAL_AUDIO_LESSONS: AudioLessonItem[] = [
  {
    id: 'lesson-1',
    title: 'سخنان حکیمانه در باب تلاش و پشتکار',
    category: 'wisdom',
    categoryFa: 'اخلاقی و انگیزشی',
    audioPrompt: 'پیاده‌سازی صوت به متن سخنان پندآموز با واژگان روان و انگیزشی',
    referenceTranscript: 'موفقیت پایدار حاصل نظم روزانه و استمرار در کارهای به ظاهر کوچک است.',
    durationEst: '۱۵ ثانیه',
    difficulty: 'مقدماتی',
    source: 'preset',
  },
  {
    id: 'lesson-2',
    title: 'هوش مصنوعی و تحول بنیادین اقتصاد دیجیتال',
    category: 'tech',
    categoryFa: 'فناوری و علمی',
    audioPrompt: 'پیاده‌سازی اصطلاحات تخصصی فناوری و تحلیل داده‌های هوشمند',
    referenceTranscript: 'پیشرفت شتابان مدل‌های هوش مصنوعی نیازمند تسلط انسان بر مهارت‌های ارتباطی و ابزارهای داده‌محور است.',
    durationEst: '۲۵ ثانیه',
    difficulty: 'متوسط',
    source: 'preset',
  },
  {
    id: 'lesson-3',
    title: 'حکمت ۳۱ نهج‌البلاغه: ارکان چهارگانه ایمان و یقین',
    category: 'quran',
    categoryFa: 'معارف و حکمت',
    audioPrompt: 'پیاده‌سازی دقیق متن فصیح و عمیق حکمت‌های علوی',
    referenceTranscript: 'ایمان بر چهار پایه استوار است: بر صبر و یقین و عدل و جهاد.',
    durationEst: '۲۰ ثانیه',
    difficulty: 'مقدماتی',
    source: 'preset',
  },
  {
    id: 'lesson-4',
    title: 'صورت‌جلسه رسمی شورای عالی فناوری اطلاعات',
    category: 'business',
    categoryFa: 'مکاتبات اداری و دادگستری',
    audioPrompt: 'پیاده‌سازی سریع مذاکرات رسمی و مصوبات حقوقی شرکت',
    referenceTranscript: 'تصویب شد بودجه توسعه زیرساخت‌های فناوری اطلاعات در سه‌ماهه سوم سال با اولویت امنیت داده‌ها تخصیص یابد.',
    durationEst: '۳۰ ثانیه',
    difficulty: 'پیشرفته',
    source: 'preset',
  },
];

export const INITIAL_VIDEO_LESSONS: VideoLessonItem[] = [
  {
    id: 'doc-ai',
    title: 'مستند هوش مصنوعی و آینده تحول مشاغل',
    genre: 'علمی و فناوری',
    speaker: 'دکتر علیرضا صدری',
    totalDuration: '۰۲:۳۰',
    thumbnailGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    source: 'preset',
    segments: [
      {
        id: 'seg-1',
        timestamp: '۰۰:۰۸',
        timestampSeconds: 8,
        expectedDurationSec: 12,
        referenceText: 'هوش مصنوعی نه جایگزین انسان، بلکه ابزاری قدرتمند برای گسترش خلاقیت و سرعت بخشیدن به دستاوردهای بشری است.',
      },
      {
        id: 'seg-2',
        timestamp: '۰۰:۳۲',
        timestampSeconds: 32,
        expectedDurationSec: 14,
        referenceText: 'در عصر ماشین‌های خودکار، توانایی پیاده‌سازی سریع اندیشه‌ها به متن، مزیتی راهبردی برای هر متخصص است.',
      },
      {
        id: 'seg-3',
        timestamp: '۰۰:۵۸',
        timestampSeconds: 58,
        expectedDurationSec: 13,
        referenceText: 'سیستم‌های زبانی پیچیده می‌توانند هزاران صفحه داده را در کسری از ثانیه تجزیه و تحلیل نمایند.',
      },
      {
        id: 'seg-4',
        timestamp: '۰۱:۲۵',
        timestampSeconds: 85,
        expectedDurationSec: 15,
        referenceText: 'همگرایی خرد انسان و دقت الگوریتم‌ها، افق‌های نوینی از بهره‌وری دیجیتال را برای سازمان‌ها پدید آورده است.',
      },
    ],
  },
  {
    id: 'ted-focus',
    title: 'سخنرانی تد: قدرت تمرکز عمیق در عصر حواس‌پرتی',
    genre: 'توسعه فردی و مهارت‌های شناختی',
    speaker: 'سارا میرزایی',
    totalDuration: '۰۳:۱۵',
    thumbnailGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    source: 'preset',
    segments: [
      {
        id: 'seg-1',
        timestamp: '۰۰:۱۰',
        timestampSeconds: 10,
        expectedDurationSec: 11,
        referenceText: 'تمرکز عمیق مهارتی نایاب در دنیای پر از اعلان‌ها و پیام‌های بی‌پایان شبکه‌های اجتماعی است.',
      },
      {
        id: 'seg-2',
        timestamp: '۰۰:۴۲',
        timestampSeconds: 42,
        expectedDurationSec: 13,
        referenceText: 'هنگامی که ذهن در سکوت کامل غوطه‌ور می‌شود، قدرت حل مسئله به بالاترین پتانسیل خود می‌رسد.',
      },
      {
        id: 'seg-3',
        timestamp: '۰۱:۱۲',
        timestampSeconds: 72,
        expectedDurationSec: 14,
        referenceText: 'تایپ روان و ناخودآگاه اجازه می‌دهد جریان افکار بدون کوچک‌ترین اصطکاک روی صفحه نقش ببندد.',
      },
      {
        id: 'seg-4',
        timestamp: '۰۱:۴۵',
        timestampSeconds: 105,
        expectedDurationSec: 12,
        referenceText: 'انضباط ذهنی پلی استوار میان اهداف بلندپروازانه و دستاوردهای عینی و پایدار روزمره ماست.',
      },
    ],
  },
];

// Helper to normalize Persian text for fair comparison
export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200C\u200B]/g, ' ') // zero-width spaces to space
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ة]/g, 'ه')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[\u064B-\u065F]/g, '') // remove Arabic vowels/harakat
    .replace(/[.,:؛،!؟()«»"'\-_/\\]/g, ' ') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Levenshtein similarity algorithm
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const s1 = normalizePersianText(str1);
  const s2 = normalizePersianText(str2);

  if (s1 === s2) return 100;
  if (!s1.length || !s2.length) return 0;

  const m = s1.length;
  const n = s2.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = d[m][n];
  const maxLen = Math.max(m, n);
  const similarity = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));
  return similarity;
}

export interface TranscriptionAnalysisResult {
  similarity: number;
  wordCount: number;
  expectedWordCount: number;
  wpm: number;
  missingWords: string[];
  extraWords: string[];
  correctWordsCount: number;
  isPassed: boolean;
  feedback: string;
}

export function analyzeTranscription(
  userText: string,
  referenceText: string,
  timeSpentSeconds: number
): TranscriptionAnalysisResult {
  const normUser = normalizePersianText(userText);
  const normRef = normalizePersianText(referenceText);

  const userWords = normUser ? normUser.split(' ').filter(Boolean) : [];
  const refWords = normRef ? normRef.split(' ').filter(Boolean) : [];

  const similarity = calculateLevenshteinSimilarity(normUser, normRef);

  // Calculate matching words
  const refSet = new Set(refWords);
  const userSet = new Set(userWords);

  const missingWords = refWords.filter((w) => !userSet.has(w));
  const extraWords = userWords.filter((w) => !refSet.has(w));
  const correctWordsCount = userWords.filter((w) => refSet.has(w)).length;

  const minutes = Math.max(0.1, timeSpentSeconds / 60);
  const wpm = Math.round(userWords.length / minutes);

  const isPassed = similarity >= 75;

  let feedback = '';
  if (similarity >= 95) {
    feedback = 'فوق‌العاده و بی‌نقص! تطابق بیش از ۹۵ درصد با صوت ضبط‌شده در پنل مدیریت.';
  } else if (similarity >= 85) {
    feedback = 'بسیار عالی! پیاده‌سازی روان با دقت بالا؛ فقط اندکی خطای نگارشی جزئی وجود دارد.';
  } else if (similarity >= 70) {
    feedback = 'خوب است، اما برخی از واژگان کلیدی جا افتاده یا با املای متفاوت نوشته شده است.';
  } else {
    feedback = 'دقت کمتر از حد انتظار است. پیشنهاد می‌شود یک‌بار دیگر صوت را گوش داده و تایپ کنید.';
  }

  return {
    similarity,
    wordCount: userWords.length,
    expectedWordCount: refWords.length,
    wpm,
    missingWords,
    extraWords,
    correctWordsCount,
    isPassed,
    feedback,
  };
}

// LocalStorage Persistence for Audio Lessons
export function getStoredAudioLessons(): AudioLessonItem[] {
  if (typeof window === 'undefined') return INITIAL_AUDIO_LESSONS;
  try {
    const raw = localStorage.getItem('typro_audio_lessons');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load audio lessons from storage:', e);
  }
  return INITIAL_AUDIO_LESSONS;
}

export function saveStoredAudioLessons(list: AudioLessonItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('typro_audio_lessons', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save audio lessons to storage:', e);
  }
}

// LocalStorage Persistence for Video Lessons
export function getStoredVideoLessons(): VideoLessonItem[] {
  if (typeof window === 'undefined') return INITIAL_VIDEO_LESSONS;
  try {
    const raw = localStorage.getItem('typro_video_lessons');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load video lessons from storage:', e);
  }
  return INITIAL_VIDEO_LESSONS;
}

export function saveStoredVideoLessons(list: VideoLessonItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('typro_video_lessons', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save video lessons to storage:', e);
  }
}
