// Typro.ir - Constants, Key Mappings and Initial Content Pool
import { LessonItem } from '@/types';

export const FINGER_MAP: Record<string, { hand: 'left' | 'right'; finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'; nameFa: string }> = {
  // English QWERTY - Left Hand
  '`': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  '~': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  '1': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  '!': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  'q': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  'a': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  'z': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },

  '2': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  '@': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  'w': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  's': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  'x': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },

  '3': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  '#': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'e': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'd': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'c': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },

  '4': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  '$': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  '5': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  '%': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'r': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  't': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'f': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'g': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'v': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'b': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },

  // English QWERTY - Right Hand
  '6': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  '^': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  '7': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  '&': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'y': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'u': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'h': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'j': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'n': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'm': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },

  '8': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  '*': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  'i': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  'k': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  ',': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  '<': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },

  '9': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  '(': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  'o': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  'l': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  '.': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  '>': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },

  '0': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  ')': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '-': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '_': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '=': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '+': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'p': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '[': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  ']': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '{': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '}': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  ';': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  ':': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  "'": { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '"': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '/': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '?': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '\\': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '|': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },

  // Persian Standard Layout (ISIRI 9147) - Left Hand
  '۱': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  'ض': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  'ش': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },
  'ظ': { hand: 'left', finger: 'pinky', nameFa: 'انگشت کوچک چپ' },

  '۲': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  'ص': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  'س': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },
  'ط': { hand: 'left', finger: 'ring', nameFa: 'انگشت حلقه چپ' },

  '۳': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'ث': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'ی': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'ي': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },
  'ز': { hand: 'left', finger: 'middle', nameFa: 'انگشت میانی چپ' },

  '۴': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  '۵': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'ق': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'ف': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'ب': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'ل': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'ر': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },
  'ذ': { hand: 'left', finger: 'index', nameFa: 'انگشت اشاره چپ' },

  // Persian Standard Layout - Right Hand
  '۶': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  '۷': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'غ': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'ع': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'ا': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'آ': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'ت': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'د': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },
  'پ': { hand: 'right', finger: 'index', nameFa: 'انگشت اشاره راست' },

  '۸': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  'ه': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  'ن': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },
  'و': { hand: 'right', finger: 'middle', nameFa: 'انگشت میانی راست' },

  '۹': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  'خ': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  'م': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  'ء': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },
  'ئ': { hand: 'right', finger: 'ring', nameFa: 'انگشت حلقه راست' },

  '۰': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'ح': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'ج': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'چ': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'ک': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'ك': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'گ': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  '؟': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'ژ': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },
  'ـ': { hand: 'right', finger: 'pinky', nameFa: 'انگشت کوچک راست' },

  // Space
  ' ': { hand: 'right', finger: 'thumb', nameFa: 'شست' }
};

export const INITIAL_LESSONS: LessonItem[] = [
  {
    id: 'fa-f-01',
    title: 'Home Row Foundation (ت و ب)',
    titleFa: 'پایگاه ردیف میانی: کلیدهای شاخص (ت و ب)',
    level: 'foundation',
    language: 'fa',
    category: 'fundamentals',
    content: 'ت ت ت ب ب ب تب تب بت بت تت بب تب تب بت بت',
    targetWpm: 18,
    targetAccuracy: 95,
    focusKeys: ['ت', 'ب', ' '],
    isFixed: true
  },
  {
    id: 'fa-f-02',
    title: 'Home Row Extended (ش س ی ب ل ا ت ن م ک)',
    titleFa: 'تسلط بر ردیف میانی کیبورد فارسی',
    level: 'foundation',
    language: 'fa',
    category: 'fundamentals',
    content: 'شین سین یا با لام الف تا نون میم کاف تماس بستان',
    targetWpm: 22,
    targetAccuracy: 96,
    focusKeys: ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک'],
    isFixed: true
  },
  {
    id: 'fa-b-lit-01',
    title: 'Persian Literature - Saadi',
    titleFa: 'گلستان سعدی',
    level: 'beginner',
    language: 'fa',
    category: 'literature',
    content: 'بنی آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند. چو عضوی به درد آورد روزگار، دگر عضوها را نماند قرار.',
    targetWpm: 28,
    targetAccuracy: 98,
    focusKeys: ['ب', 'ن', 'ی', 'آ', 'د', 'م'],
    isFixed: true
  },
  {
    id: 'fa-adv-tech-01',
    title: 'Technology & AI',
    titleFa: 'فناوری و هوش مصنوعی',
    level: 'advanced',
    language: 'fa',
    category: 'technology',
    content: 'توسعه الگوریتم های هوش مصنوعی نیازمند تحلیل عمیق داده ها، معماری پردازشی مقیاس پذیر و درک ساختارهای محاسباتی نوین است.',
    targetWpm: 40,
    targetAccuracy: 98,
    focusKeys: [],
    isFixed: true
  },
  {
    id: 'en-f-01',
    title: 'English Home Row Anchors (F and J)',
    titleFa: 'کلیدهای تکیه گاه ردیف خانه (F و J)',
    level: 'foundation',
    language: 'en',
    category: 'fundamentals',
    content: 'fff jjj fj fj jf jf ff jj fjf jfj fff jjj fjfj',
    targetWpm: 20,
    targetAccuracy: 95,
    focusKeys: ['f', 'j', ' '],
    isFixed: true
  },
  {
    id: 'en-b-01',
    title: 'English Common Words',
    titleFa: 'کلمات پرکاربرد انگلیسی',
    level: 'beginner',
    language: 'en',
    category: 'fundamentals',
    content: 'the quick brown fox jumps over the lazy dog and runs away fast',
    targetWpm: 35,
    targetAccuracy: 97,
    focusKeys: [],
    isFixed: true
  }
];

import TYPING_POOL_JSON from '@/data/typingPool.json';

export interface TypingTestItem {
  id: string;
  topic: string;
  subCategory?: string;
  language: 'fa' | 'en' | 'code';
  difficulty: string;
  length: string;
  lineCount?: number;
  text: string;
}

export const TYPING_TEST_POOL: TypingTestItem[] = TYPING_POOL_JSON as TypingTestItem[];

export const VEHICLE_SKINS = [
  { id: 'skin-ferrari', nameFa: 'فراری فرمول F8', nameEn: 'Ferrari F8 Formula', category: 'Supercars', color: '#dc2626', speedBonus: 0, unlocked: false, price: 1600 },
  { id: 'skin-yamaha-r1', nameFa: 'یاماها R1 مسابقه‌ای', nameEn: 'Yamaha YZF-R1', category: 'Motorcycles', color: '#2563eb', speedBonus: 0, unlocked: false, price: 1250 },
  { id: 'skin-paykan', nameFa: 'پیکان جوانان گوجه‌ای', nameEn: 'Paykan Javanan 57', category: 'Classic & National', color: '#e11d48', speedBonus: 0, unlocked: false, price: 950 },
  { id: 'skin-dena', nameFa: 'دنا پلاس توربو', nameEn: 'Dena Plus Turbo', category: 'Classic & National', color: '#2563eb', speedBonus: 0, unlocked: true },
  { id: 'skin-steve-minecart', nameFa: 'استیو ماینکرفت و ماین‌کارت', nameEn: 'Minecraft Steve Minecart', category: 'Minecraft & Fantasy', color: '#0ea5e9', speedBonus: 0, unlocked: false, price: 1300 },
  { id: 'skin-cyber-phantom', nameFa: 'سایبر فانتوم ۲۰۲۶', nameEn: 'Cyber Phantom 2026', category: 'Cyber & Sci-Fi', color: '#9333ea', speedBonus: 0, unlocked: true }
];
