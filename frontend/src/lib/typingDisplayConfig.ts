export interface TypingDisplayConfig {
  boxWidth: 'compact' | 'medium' | 'wide' | 'ultrawide' | 'full';
  boxHeight: 'compact' | 'standard' | 'tall';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  defaultTextColor: string;
  highlightColor: string;
  errorColor: string;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  multilineLines: number;

  // تنظیمات جریان دو مرحله‌ای صفحه تست تایپ (قابل کنترل در پنل ادمین)
  showPreTestSetupPage: boolean; // آیا صفحه تنظیمات اولیه قبل از آزمون باز شود
  defaultLanguage: 'fa' | 'en' | 'code'; // زبان یا دسته‌بندی پیش‌فرض
  defaultDurationMinutes: number; // مدت زمان پیش‌فرض (۱ یا ۳ یا ۵ دقیقه)
  showVideoRecordButton: boolean; // نمایش دکمه ضبط ویدیو در صفحه اول
  showStandardBanner: boolean; // نمایش بنر استاندارد مهندسی ISIRI 9147 در صفحه اول
}

export const DEFAULT_TYPING_DISPLAY_CONFIG: TypingDisplayConfig = {
  boxWidth: 'medium', // افقی متوسط و متعادل (نه خیلی بزرگ نه خیلی کوچک، متناسب با چشم)
  boxHeight: 'standard', // ارتفاع استاندارد بدون پهن شدن عمودی
  fontSize: 'md',
  defaultTextColor: '#020617', // مشکی پررنگ و کاملاً خوانا
  highlightColor: '#2563eb', // آبی مشخص و استاندارد
  errorColor: '#e11d48', // قرمز
  lineSpacing: 'relaxed',
  multilineLines: 3,

  showPreTestSetupPage: true, // نمایش صفحه انتخاب قبل از ورود به کادر متمرکز آزمون
  defaultLanguage: 'fa',
  defaultDurationMinutes: 1,
  showVideoRecordButton: true,
  showStandardBanner: true,
};

const STORAGE_KEY = 'typro_typing_display_config';

export function getTypingDisplayConfig(): TypingDisplayConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_TYPING_DISPLAY_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TYPING_DISPLAY_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TYPING_DISPLAY_CONFIG, ...parsed };
  } catch {
    return DEFAULT_TYPING_DISPLAY_CONFIG;
  }
}

export function saveTypingDisplayConfig(config: TypingDisplayConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('typro_display_config_changed', { detail: config }));
  } catch (err) {
    console.error('Failed to save typing display config:', err);
  }
}
