'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle,
  ChevronLeft,
  BookOpen,
  Star,
  Sparkles,
  X,
  CheckCircle2,
  ListOrdered,
  Zap,
  Target,
  Users
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  durationHours: string;
  level: string;
  category: 'all' | 'foundation' | 'literature' | 'code' | 'esports';
  enrolled: number;
  rating: number;
  badge: string;
  iconColor: string;
  syllabus: { day: string; title: string; goal: string }[];
}

const COURSES: Course[] = [
  {
    id: 'course-mastery-fa',
    title: 'دوره جامع استادی تایپ ده‌انگشتی فارسی در ۱۴ روز',
    description: 'از صفر مطلق تا سرعت ۸۰ کلمه در دقیقه با متد عصب‌شناختی استقرار دست در ردیف پایگاه خانگی (Home Row).',
    lessonsCount: 30,
    durationHours: '۱۲ ساعت',
    level: 'از پایه تا پیشرفته',
    category: 'foundation',
    enrolled: 1420,
    rating: 4.9,
    badge: 'پرطرفدارترین',
    iconColor: 'bg-blue-50 text-blue-600',
    syllabus: [
      { day: 'روز ۱ تا ۳', title: 'استقرار در ردیف میانی (Home Row) و تسلط بر کلیدهای ت و ب', goal: 'دستیابی به ۲۵ WPM با دقت ۹۸٪' },
      { day: 'روز ۴ تا ۷', title: 'صعود به ردیف بالا (ض، ص، ث، ق، ف، غ، ع، ه، خ، ح، ج، چ)', goal: 'دستیابی به ۴۵ WPM' },
      { day: 'روز ۸ تا ۱۱', title: 'ردیف پایین و کلیدهای پرچالش (ظ، ط، ز، ر، ذ، د، پ، و)', goal: 'دستیابی به ۶۰ WPM' },
      { day: 'روز ۱۲ تا ۱۴', title: 'اعداد، علائم نگارشی فارسی، نیم‌فاصله و متون پیوسته', goal: 'دستیابی به ۸۰+ WPM و آزمون فارغ‌التحصیلی' },
    ],
  },
  {
    id: 'course-literature-speed',
    title: 'دوره جامع نگارش و تایپ سرعتی متون ادبی و اداری فارسی',
    description: 'تسلط بر نگارش روان متون حقوقی، اداری، شعر و نثر کهن پارسی همراه با رعایت دقیق نیم‌فاصله و علائم نگارشی.',
    lessonsCount: 24,
    durationHours: '۸ ساعت',
    level: 'متوسط تا پیشرفته',
    category: 'literature',
    enrolled: 890,
    rating: 5.0,
    badge: 'ویژه اداری و نگارش',
    iconColor: 'bg-emerald-50 text-emerald-600',
    syllabus: [
      { day: 'بخش ۱', title: 'کلیدهای میانبر علائم نگارشی فارسی (ویرگول Shift+T، نقطه، دونقطه)', goal: 'نگارش بدون وقفه متون اداری' },
      { day: 'بخش ۲', title: 'تسلط بر نیم‌فاصله استاندارد (Shift+Space و Ctrl+Shift+2)', goal: 'تایپ صحیح ترکیبات فارسی' },
      { day: 'بخش ۳', title: 'تمرین بر روی بوستان، گلستان و شاهنامه فردوسی', goal: 'دقت ۱۰۰ درصدی در کلمات ترکیبی' },
      { day: 'بخش ۴', title: 'سرعت‌گیری در مکاتبات رسمی، گزارش‌ها و صورت‌جلسه‌ها', goal: 'صدور تاییدیه تایپیست حرفه‌ای' },
    ],
  },
  {
    id: 'course-code-fast',
    title: 'تایپ سرعتی برنامه‌نویسان و سمبل‌های کدنویسی',
    description: 'تسلط بر کلیدهای پرکاربرد برنامه‌نویسی ({}, [], <>, =>, $, _) و کلمات کلیدی پایتون، جاوااسکریپت و تایپ‌اسکریپت.',
    lessonsCount: 20,
    durationHours: '۶ ساعت',
    level: 'تخصصی مهندسی',
    category: 'code',
    enrolled: 2150,
    rating: 4.8,
    badge: 'ویژه توسعه‌دهندگان',
    iconColor: 'bg-purple-50 text-purple-600',
    syllabus: [
      { day: 'فصل ۱', title: 'کنترل آکولادها، پرانتزها و کروشه‌ها بدون نگاه به کیبورد', goal: 'کاهش خطاهای سینتکسی در IDE' },
      { day: 'فصل ۲', title: 'نمادهای شرطی و عملگرهای پیشرفته (===, &&, ||, =>, !==)', goal: 'تایپ کد با ریتم روان' },
      { day: 'فصل ۳', title: 'کلمات کلیدی پراستفاده پایتون، تایپ‌اسکریپت و توابع ناهمگام', goal: 'شتاب ۲ برابری کدنویسی' },
      { day: 'فصل ۴', title: 'دریل‌های واقعی ریفکتورینگ و حل مسائل الگوریتمی', goal: 'تسلط به عنوان Senior Typist Coder' },
    ],
  },
  {
    id: 'course-speed-boost',
    title: 'بوت‌کمپ شتاب سرعتی ۱۰۰+ WPM برای لیگ گرندمستر',
    description: 'تکنیک‌های جهش سرعت، کاهش تاخیر عصبی بین دست‌ها و رفع خطاهای پربسامد برای قهرمانی در مسابقات زنده.',
    lessonsCount: 18,
    durationHours: '۱۰ ساعت',
    level: 'فوق حرفه‌ای',
    category: 'esports',
    enrolled: 640,
    rating: 4.9,
    badge: 'سطح المپیاد',
    iconColor: 'bg-amber-50 text-amber-600',
    syllabus: [
      { day: 'هفته ۱', title: 'تکنیک پیش‌خوانی ۲ تا ۳ کلمه جلوتر از محل کرسر (Look-Ahead Buffer)', goal: 'حذف توقف‌های ادراکی مغز' },
      { day: 'هفته ۲', title: 'تقویت انگشتان ضعیف دست چپ و راست (انگشتان کوچک و حلقه)', goal: 'پایداری ریتم در واژگان سخت' },
      { day: 'هفته ۳', title: 'تمرینات سرعتی انفجاری ۵ تا ۱۵ ثانیه‌ای با شتاب ۱۲۰ WPM', goal: 'رسیدن به لیگ گرندمستر' },
      { day: 'هفته ۴', title: 'شبیه‌سازی مسابقات زنده و پیروزی بر بات‌های نخبه پیست', goal: 'کسب جام قهرمانی تایپرو' },
    ],
  },
];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, boolean>>({
    'course-mastery-fa': true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEnroll = (course: Course) => {
    setEnrolledCourses((prev) => ({ ...prev, [course.id]: true }));
    showToast(`🎉 تبریک! شما با موفقیت در «${course.title}» ثبت‌نام شدید.`);
    setSelectedCourseForSyllabus(null);
  };

  const filteredCourses = COURSES.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              دوره‌های ساختاریافته آکادمی مهندسی تایپرو
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            دوره‌های آموزشی تخصصی (Specialized Courses)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            مسیرهای مدون گام‌به‌گام با سرفصل‌های علمی و تقویم آموزشی جهت ارتقای جهشی سرعت تایپ و کسب مدارک تخصصی.
          </p>
        </div>

        <Link
          href="/lessons"
          className="px-5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200 self-start sm:self-center"
        >
          مشاهده تمام دروس آکادمی ←
        </Link>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'all', label: 'همه دوره‌ها' },
          { id: 'foundation', label: 'پایه و اصول ده‌انگشتی' },
          { id: 'literature', label: 'ادبیات و متون اداری' },
          { id: 'code', label: 'تایپ سرعتی برنامه‌نویسان' },
          { id: 'esports', label: 'بوت‌کمپ گرندمستر' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = !!enrolledCourses[course.id];

          return (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {course.badge}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-slate-400 font-normal mr-1">({course.enrolled.toLocaleString('fa-IR')} فراگیر)</span>
                  </div>
                </div>

                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {course.title}
                </h2>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {course.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.lessonsCount} درس استاندارد</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.durationHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedCourseForSyllabus(course)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>مشاهده سرفصل‌ها</span>
                </button>

                {isEnrolled ? (
                  <Link
                    href="/lessons"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ادامه یادگیری</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>ثبت‌نام رایگان</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Course Syllabus & Roadmap */}
      {selectedCourseForSyllabus && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase">سرفصل‌ها و نقشه راه دوره</span>
                <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
                  {selectedCourseForSyllabus.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseForSyllabus(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Syllabus Roadmap Timeline */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {selectedCourseForSyllabus.syllabus.map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                      {s.day}
                    </span>
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {s.goal}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{s.title}</h4>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                مدت دوره: {selectedCourseForSyllabus.durationHours} • {selectedCourseForSyllabus.lessonsCount} درس
              </span>
              <button
                onClick={() => handleEnroll(selectedCourseForSyllabus)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                تایید ثبت‌نام در دوره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
