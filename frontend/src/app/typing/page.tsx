'use client';

import React, { useState } from 'react';
import TypingEngine from '@/components/typing/TypingEngine';
import { 
  Keyboard, Clock, FileText, Shuffle, Settings2, Sparkles, 
  CheckCircle2, BookOpen, Code2, Heart, HelpCircle, ShieldCheck 
} from 'lucide-react';

export default function FreeTypingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'fa' | 'en'>('fa');
  const [selectedCategory, setSelectedCategory] = useState<'tech' | 'poetry' | 'wisdom' | 'code'>('tech');
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [customInputText, setCustomInputText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const presetTexts = {
    fa: {
      tech: [
        'معماری نرم‌افزارهای مدرن بر تفکیک دقیق وظایف، کاهش وابستگی‌ها و پایداری کلاستر استوار است.',
        'یادگیری ماشین و پردازش زبان طبیعی ابزارهای اساسی برای تحلیل عمیق داده‌های متنی به شمار می‌آیند.',
        'سرعت پردازش الگوریتم‌های هوش مصنوعی با بهره‌گیری از شتاب‌دهنده‌های گرافیکی به شکلی چشمگیر افزایش یافته است.',
      ],
      poetry: [
        'بنی آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند؛ چو عضوی به درد آورد روزگار، دگر عضوها را نماند قرار.',
        'سعدیا مرد نکونام نمیرد هرگز؛ مرده آن است که نامش به نکویی نبرند.',
        'توانا بود هر که دانا بود؛ ز دانش دل پیر برنا بود. از این پرده برتر سخنگاه نیست.',
        'بشنو این نی چون شکایت می کند، از جدایی ها حکایت می کند؛ سینه خواهم شرحه شرحه از فراق، تا بگویم شرح درد اشتیاق.',
        'تن آدمی شریف است به جان آدمیت، نه همین لباس زیباست نشان آدمیت.',
        'تو مگو همه به جنگند و ز صلح من چه آید، تو یکی نه ای هزاری تو چراغ خود برافروز.',
        'از علی آموز اخلاص عمل، شیر حق را دان منزه از دغل.',
        'درخت دوستی بنشان که کام دل به بار آرد، نهال دشمنی برکن که رنج بی شمار آرد.',
      ],
      wisdom: [
        'علم و پژوهش آشکارترین وسیله عزت و قدرت یک کشور است؛ روی دیگر دانایی، توانایی است.',
        'آینده از آن جوانان با ایمان، پرامید و پرتلاش این مرز و بوم است که با علم و عمل قله ها را فتح می کنند.',
        'امیدآفرینی و حرکت رو به جلو در گرو شناخت توانمندی های درونی و اعتماد به نیروی پرشور جوانان است.',
        'مهمترین سرمایه یک ملت، نیروی انسانی بااستعداد، باایمان، خستگی ناپذیر و مصمم به ساختن فردایی آباد است.',
        'آرامش ذهن و تسلط بر اعصاب، زیربنای تصمیم گیری های خردمندانه در بحران های پیچیده است.',
        'تمدن کهن ایران همواره کانون پرورش دانشمندان، شعرا و مروج فرهنگ مهر و دادگری در تاریخ بوده است.',
        'کار و تلاش مجاهدانه کلید گشایش درهای پیشرفت، خودکفایی و عزت روزافزون برای میهن است.',
      ],
      code: [
        'function calculateWpm(keystrokes: number, seconds: number): number { return Math.round((keystrokes / 5) / (seconds / 60)); }',
        'const isPersianChar = (char: string) => /^[\u0600-\u06FF\s]+$/.test(char);',
      ],
    },
    en: {
      tech: [
        'Software architecture is about making fundamental structural choices that are costly to change once implemented.',
        'Distributed systems must gracefully handle network partitions and latency spikes across multiple cloud regions.',
      ],
      poetry: [
        'Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler.',
        'Shall I compare thee to a summer day? Thou art more lovely and more temperate.',
      ],
      wisdom: [
        'Discipline is the bridge between distant aspirations and tangible daily accomplishments.',
        'Consistency beats intermittent bursts of intensity in every intellectual and physical discipline.',
      ],
      code: [
        'export async function fetchData<T>(url: string): Promise<T> { const res = await fetch(url); return res.json(); }',
        'type UserRole = "SuperAdmin" | "Referee" | "Instructor" | "Typist";',
      ],
    },
  };

  const [activeText, setActiveText] = useState(presetTexts.fa.tech[0]);

  const handleRandomizePreset = () => {
    const pool = presetTexts[selectedLanguage][selectedCategory];
    const nextText = pool[Math.floor(Math.random() * pool.length)];
    setActiveText(nextText);
    showToast('🎲 متن جدید با موفقیت بارگذاری شد.');
  };

  const handleSelectCategory = (cat: 'tech' | 'poetry' | 'wisdom' | 'code') => {
    setSelectedCategory(cat);
    const pool = presetTexts[selectedLanguage][cat];
    setActiveText(pool[0]);
    showToast(`دسته انتخابی به «${cat === 'tech' ? 'فناوری' : cat === 'poetry' ? 'ادبیات' : cat === 'wisdom' ? 'حکمت' : 'کدنویسی'}» تغییر یافت.`);
  };

  const handleApplyCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputText.trim()) {
      setActiveText(customInputText.trim());
      setMode('preset');
      showToast('✅ متن سفارشی شما با موفقیت در محیط تمرین مستقر شد.');
    }
  };

  const charCount = activeText.length;
  const wordCount = activeText.trim() ? activeText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.ceil((wordCount / 50) * 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              بوم تمرین نامحدود (Free Typing Sandbox)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            تایپ آزاد، سفارشی و تخصصی
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            بدون استرس زمان و رتبه، با دسته‌بندی‌های موضوعی یا متن‌های دلخواه خود به تقویت ریتم ضربه‌زنی بپردازید.
          </p>
        </div>

        {/* Language & Custom Text Switchers */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                setSelectedLanguage('fa');
                setActiveText(presetTexts.fa[selectedCategory][0]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedLanguage === 'fa' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              فارسی
            </button>
            <button
              onClick={() => {
                setSelectedLanguage('en');
                setActiveText(presetTexts.en[selectedCategory][0]);
              }}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedLanguage === 'en' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={() => setMode(mode === 'preset' ? 'custom' : 'preset')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              mode === 'custom'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{mode === 'custom' ? 'بستن ورودی دلخواه' : 'آپلود متن دلخواه'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Text Metrics */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          {[
            { id: 'tech', label: 'فناوری و الگوریتم', icon: Sparkles },
            { id: 'poetry', label: 'شعر و ادبیات پارسی', icon: BookOpen },
            { id: 'wisdom', label: 'حکمت و انگیزشی', icon: Heart },
            { id: 'code', label: 'کد و دستورات نر‌م‌افزار', icon: Code2 },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition shrink-0 ${
                  isSelected ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Telemetry Summary */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span>کلمات: <strong className="text-slate-800 font-mono">{wordCount}</strong></span>
          <span>•</span>
          <span>کاراکترها: <strong className="text-slate-800 font-mono">{charCount}</strong></span>
          <span>•</span>
          <span>تخمین زمان: <strong className="text-blue-600 font-mono">{estimatedSeconds} ثانیه</strong></span>
        </div>
      </div>

      {/* Custom Text Ingestion Form */}
      {mode === 'custom' && (
        <form onSubmit={handleApplyCustomText} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>متن یا قطعه‌شعر دلخواه خود را الصاق (Paste) نمایید:</span>
          </h3>
          <textarea
            rows={4}
            required
            value={customInputText}
            onChange={(e) => setCustomInputText(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans"
            placeholder="متن، مقاله یا فصل کتاب مورد نظرتان را اینجا بنویسید یا الصاق کنید..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMode('preset')}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              اعمال و شروع تمرین تایپ
            </button>
          </div>
        </form>
      )}

      {/* Typing Engine */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <TypingEngine
          key={`${selectedLanguage}-${selectedCategory}-${activeText.slice(0, 15)}`}
          targetText={activeText}
          language={selectedLanguage}
          allowChangeText={true}
          onTextChangeRequest={handleRandomizePreset}
          title="بوم تایپ آزاد و شخصی‌سازی شده"
        />
      </div>

      {/* Typography & ISIRI 9147 Tip Banner */}
      <div className="bg-blue-50/60 rounded-3xl p-4 sm:p-5 border border-blue-100 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-blue-950">انطباق ۱۰۰٪ با استاندارد ملی ایران ISIRI 9147</h4>
            <p className="text-blue-700 text-[11px] mt-0.5">
              جهت درج استاندارد نیم‌فاصله در خط فارسی، از کلید میانبر <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-200 font-mono">Shift + Space</kbd> یا <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-200 font-mono">Ctrl + Shift + 2</kbd> استفاده نمایید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
