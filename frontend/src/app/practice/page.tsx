'use client';

import React, { useState } from 'react';
import TypingEngine from '@/components/typing/TypingEngine';
import {
  Target,
  Zap,
  RotateCcw,
  Award,
  CheckCircle2,
  Sliders,
  RefreshCw,
  BookOpen,
  Activity,
  HeartPulse,
  BrainCircuit,
  Flame,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DrillPreset {
  id: string;
  title: string;
  desc: string;
  focusKeys: string[];
  content: string;
  category: 'adaptive' | 'bigrams' | 'speed' | 'accuracy' | 'ergonomics' | 'custom';
  tags: string[];
}

const WEAK_KEY_BANK: Record<string, string[]> = {
  'ژ': ['ژاله', 'ژیان', 'ژرف', 'مژده', 'پژوهش', 'واژه', 'ویژه', 'آژیر', 'بیژن', 'دژکوب'],
  'ظ': ['ظرف', 'ظفر', 'ظاهر', 'نظم', 'انتظار', 'حافظ', 'منظور', 'لحاظ', 'مظفر', 'تعظیم'],
  'ض': ['ضیافت', 'ضامن', 'ضبط', 'حضور', 'رضا', 'عوض', 'نبض', 'قضا', 'تضاد', 'مضمون'],
  'غ': ['غبار', 'غنچه', 'غریب', 'باغ', 'فروغ', 'آغاز', 'مغز', 'روغن', 'مرغزار', 'تیغ'],
  'پ': ['پرواز', 'پویا', 'پایدار', 'سپهر', 'پیمان', 'پیام', 'پرچم', 'پناه', 'پیشتاز', 'پردیس'],
  'چ': ['چشمه', 'چراغ', 'کوچه', 'پارچه', 'پیچیده', 'چابک', 'چاره', 'چشم', 'چکاوک', 'کوچ'],
  'گ': ['گلزار', 'گرامی', 'روزگار', 'نگاه', 'آهنگ', 'فرهنگ', 'جایگاه', 'یادگار', 'روزگار', 'شاگرد'],
  'ک': ['کتاب', 'کوشش', 'تکاپو', 'کاروان', 'برکت', 'شکوفا', 'پیکار', 'حرکت', 'کارآفرین', 'کاوش'],
  'ث': ['ثبت', 'مثلث', 'اثر', 'وارث', 'تثبیت', 'ثروت', 'ایثار', 'کوثر', 'پژوهش', 'حدیث'],
  'ص': ['صداقت', 'تصویر', 'فرصت', 'خاص', 'عصر', 'صبر', 'بصیرت', 'صحرا', 'اخلاص', 'منصور'],
  'ط': ['طاقت', 'طلوع', 'طبیعت', 'خاطره', 'خط', 'ارتباط', 'طوفان', 'واسطه', 'شوق', 'طنین'],
  'ذ': ['ذره', 'لذت', 'بذر', 'آذر', 'گذشته', 'پذیرش', 'مذهب', 'نذر', 'جاذبه', 'مقدمات'],
};

const COMMON_BIGRAMS = [
  'بر', 'تر', 'سر', 'در', 'پر', 'مر', 'کر', 'گر', 'ور', 'نر',
  'ان', 'ها', 'می', 'ست', 'ند', 'رد', 'شد', 'به', 'که', 'از'
];

const COMMON_TRIGRAMS = [
  'ترین', 'برای', 'درباره', 'است', 'بودند', 'می‌شود', 'همچنین', 'خواهند', 'شناخت', 'پرواز'
];

const INITIAL_DRILLS: DrillPreset[] = [
  {
    id: 'weak-keys',
    title: 'تمرین کلیدهای پرخطا (Weak Keys)',
    desc: 'تمرکز اختصاصی روی کلیدهای «ژ، ظ، ض، غ، ث» بر اساس تحلیل فراوانی اشتباهات تایپی',
    focusKeys: ['ژ', 'ظ', 'ض', 'غ', 'ث'],
    content: 'ژاله ظرف ضیافت غبار ژیان ظفر ضامن غنچه ژرف ظاهر ضبط غریب پژوهش نظم حضور فروغ ثروت اثر تثبیت',
    category: 'adaptive',
    tags: ['تطبیقی', 'اصلاح خطا'],
  },
  {
    id: 'bigrams-trigrams',
    title: 'توالی دوحرفی و سه‌حرفی (Bigrams & Trigrams)',
    desc: 'تقویت قوی‌ترین زنجیره‌های اتصالی خط فارسی در مغز جهت افزایش جهشی WPM',
    focusKeys: ['ب', 'ر', 'ت', 'س', 'ن', 'د'],
    content: 'بر تر سر در پر مر کر در هر تر بر کر پر گر ور نر مر سر تر در بر سر مر ترین برای درباره است بودند خواهند همچنین شناخت پرواز',
    category: 'bigrams',
    tags: ['حافظه عضلانی', 'زنجیره حروف'],
  },
  {
    id: 'speed-burst',
    title: 'شتاب انفجاری سرعتی (Speed Burst)',
    desc: 'واژه‌های تک‌هجایی پرشتاب و روان در ردیف وسط و پایینی کیبورد برای شکستن سد سرعت',
    focusKeys: ['آ', 'ب', 'د', 'م', 'ر'],
    content: 'آب باد خاک آتش نور ماه مهر تاب روز شب راه دل جان پاک سر یاد بوی گل شاد رود تیر کار بار راز ساز سوز تار مار',
    category: 'speed',
    tags: ['سرعت بالا', 'بدون مکث'],
  },
  {
    id: 'accuracy-mastery',
    title: 'دقت مطلق صد درصدی (Accuracy Mastery)',
    desc: 'متن سنجیده با کلمات هم‌نشین پیچیده و رعایت دقیق نیم‌فاصله، مستلزم صفر درصد خطا',
    focusKeys: ['تمام حروف', 'نیم‌فاصله'],
    content: 'استواری اندیشه و صلابت نگارش، زاده‌ی تمرکز ژرف و پیوستگی ضرب‌آهنگ انگشتان بر لوح کلیدهاست که در آرامش تجلی می‌یابد.',
    category: 'accuracy',
    tags: ['دقت ۱۰۰٪', 'نظم حرکتی'],
  },
  {
    id: 'ergonomics-fatigue',
    title: 'ریکاوری ارگونومی و رفع خستگی (Ergo Recovery)',
    desc: 'متن ملایم با توزیع یکنواخت ضربات بین دو دست چپ و راست برای جلوگیری از سندروم مچ دست (RSI)',
    focusKeys: ['توزیع متقارن دست چپ و راست'],
    content: 'نفس عمیق بکشید شانه‌ها را شل کنید مچ دستان را آزاد بگذارید و با ریتم یکدست و نرم کلیدها را لمس کنید آرامش سرچشمه تمرکز است.',
    category: 'ergonomics',
    tags: ['سلامت مچ دست', 'کاهش تنش'],
  },
];

export default function PracticePage() {
  const [drills, setDrills] = useState<DrillPreset[]>(INITIAL_DRILLS);
  const [selectedDrillId, setSelectedDrillId] = useState<string>('weak-keys');
  const [selectedFocusKeys, setSelectedFocusKeys] = useState<string[]>(['ژ', 'ظ', 'ض', 'غ']);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [completed, setCompleted] = useState(false);
  const [showErgoTip, setShowErgoTip] = useState(true);

  const activeDrill = drills.find((d) => d.id === selectedDrillId) || drills[0];

  const availableKeys = ['ژ', 'ظ', 'ض', 'غ', 'پ', 'چ', 'گ', 'ک', 'ث', 'ص', 'ط', 'ذ'];

  const toggleKey = (key: string) => {
    setSelectedFocusKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGenerateCustomDrill = () => {
    if (selectedFocusKeys.length === 0) return;

    const generatedWords: string[] = [];
    selectedFocusKeys.forEach((key) => {
      const words = WEAK_KEY_BANK[key] || [];
      generatedWords.push(...words);
    });

    const shuffled = [...generatedWords].sort(() => Math.random() - 0.5);
    const content = shuffled.slice(0, 20).join(' ');

    const customDrill: DrillPreset = {
      id: "custom-" + Date.now(),
      title: "دریل تطبیقی کلیدهای (" + selectedFocusKeys.join('، ') + ")",
      desc: "تولید شده توسط موتور هوش‌مصنوعی بر اساس " + selectedFocusKeys.length + " کلید پرچالش انتخابی",
      focusKeys: selectedFocusKeys,
      content,
      category: 'custom',
      tags: ['هوشمند', 'سفارشی'],
    };

    setDrills((prev) => [customDrill, ...prev]);
    setSelectedDrillId(customDrill.id);
    setCompleted(false);
  };

  const handleGenerateBigramTriDrill = () => {
    const shuffledBigrams = [...COMMON_BIGRAMS].sort(() => Math.random() - 0.5).slice(0, 10);
    const shuffledTrigrams = [...COMMON_TRIGRAMS].sort(() => Math.random() - 0.5).slice(0, 8);
    const combined = [...shuffledBigrams, ...shuffledTrigrams].sort(() => Math.random() - 0.5).join(' ');

    const bigramDrill: DrillPreset = {
      id: "bigram-" + Date.now(),
      title: 'دریل تازه توالی‌های پرکاربرد (Bigrams/Trigrams)',
      desc: 'ترکیب پویا از دوحرفی‌ها و سه‌حرفی‌های رایج متون رسمی فارسی',
      focusKeys: ['توالی‌های اتصال'],
      content: combined,
      category: 'bigrams',
      tags: ['پویا', 'اتصال سریع'],
    };

    setDrills((prev) => [bigramDrill, ...prev]);
    setSelectedDrillId(bigramDrill.id);
    setCompleted(false);
  };

  const handleDrillComplete = () => {
    setCompleted(true);
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
  };

  const filteredDrills = activeCategory === 'all' 
    ? drills 
    : drills.filter((d) => d.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            سیستم تمرین هوشمند و تطبیقی (Adaptive Practice & Ergonomics)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          دریل‌های تخصصی تمرین، بایگرام‌ها و ارگونومی تایپ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          این سامانه با تحلیل ماتریس خطاهای تایپ شما (Typing DNA)، برای کلیدهای کم‌سرعت و پرخطا تمرینات جبرانی هوشمند می‌سازد و از خستگی انگشتان ممانعت می‌کند.
        </p>
      </div>

      {/* Ergonomic Health Banner */}
      {showErgoTip && (
        <div className="bg-linear-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 border border-teal-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">توصیه ارگونومی استانداردهای بین‌المللی تایپ</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                زاویه آرنج‌ها را روی ۹۰ درجه تنظیم کنید، مچ‌ها را روی میز تکیه ندهید و هر ۲۰ دقیقه ۳۰ ثانیه انگشتان را باز و بسته نمایید.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowErgoTip(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 self-end sm:self-auto px-3 py-1.5 rounded-lg hover:bg-slate-200/50 transition"
          >
            متوجه شدم
          </button>
        </div>
      )}

      {/* Dynamic Key Focus Generator & Bigram Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Weak Key Selector */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>سازنده هوشمند دریل جبرانی برای کلیدهای پرخطا</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                کلیدهای مد نظرتان را انتخاب کنید تا الگوریتم واژه‌گزینی اختصاصی فعال شود:
              </p>
            </div>

            <button
              onClick={handleGenerateCustomDrill}
              disabled={selectedFocusKeys.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تولید دریل جبرانی</span>
            </button>
          </div>

          {/* Key Selector Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-slate-600 ml-2">حروف پرچالش:</span>
            {availableKeys.map((key) => {
              const isSelected = selectedFocusKeys.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleKey(key)}
                  className={"w-10 h-10 rounded-xl font-bold text-base transition flex items-center justify-center " + (
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  {key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Bigram & Trigram Generator Card */}
        <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <BrainCircuit className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase">توالی‌های طلایی زبان فارسی</span>
            </div>
            <h4 className="font-black text-base text-white">تولید دریل بایگرام و ترایگرام</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              تکرار اتصال‌های پرکاربرد خط فارسی (مانند «تر»، «بر»، «ترین»، «برای») موجب افزایش ۳۰ درصدی سرعت ضربه‌زنی بدون نگاه به کیبورد می‌شود.
            </p>
          </div>

          <button
            onClick={handleGenerateBigramTriDrill}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>تولید دریل توالی‌های پرتکرار</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: 'همه تمرین‌ها' },
          { id: 'adaptive', label: 'تطبیقی و کلیدهای سخت' },
          { id: 'bigrams', label: 'بایگرام و ترایگرام' },
          { id: 'speed', label: 'شتاب سرعتی' },
          { id: 'accuracy', label: 'دقت صد درصدی' },
          { id: 'ergonomics', label: 'ارگونومی و کاهش خستگی' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={"px-4 py-2 rounded-2xl border transition whitespace-nowrap " + (
              activeCategory === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drill Presets Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrills.map((drill) => {
          const isSelected = drill.id === selectedDrillId;
          return (
            <button
              key={drill.id}
              onClick={() => {
                setSelectedDrillId(drill.id);
                setCompleted(false);
              }}
              className={"text-right p-5 rounded-3xl border-2 transition-all space-y-3 flex flex-col justify-between " + (
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900 block">{drill.title}</span>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{drill.desc}</p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-2 w-full border-t border-slate-100">
                {drill.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {completed && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs sm:text-sm font-bold">
              عالی بود! تمرین جبرانی با دقت کامل انجام شد و به حافظه عضلانی شما پیوست.
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-xl">+۳۰ XP</span>
            <span className="bg-amber-500 text-white px-3 py-1 rounded-xl">+۱۰ سکه</span>
          </div>
        </div>
      )}

      {/* Active Drill Typing Engine Player */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 block">دریل فعال انتخابی:</span>
            <h2 className="text-lg font-black text-slate-900">{activeDrill.title}</h2>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            سیستم هوشمند تطبیقی
          </span>
        </div>

        <TypingEngine
          key={activeDrill.id}
          targetText={activeDrill.content}
          language="fa"
          allowChangeText={false}
          title={activeDrill.title}
          isLesson={true}
          onComplete={handleDrillComplete}
        />
      </div>
    </div>
  );
}
