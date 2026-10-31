'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  Mail,
  ChevronDown,
  RotateCcw,
  Zap,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  link?: { href: string; label: string };
  time: string;
}

const SUPPORT_EMAIL = 'mahdimahdipour67787@gmail.com';

const QUICK_QUESTIONS = [
  'هزینه و نحوه خرید اشتراک پرو چطوره؟',
  'نقشه حرارتی کیبورد (Heatmap) چیه؟',
  'چطور در مسابقه زنده شرکت کنم؟',
  'آکادمی دروس و سطوح تایپ چطوریه؟',
  'بخش فریلنسرها و استخدام تایپیست چطوره؟',
  'چطور پیشرفت و رکوردهام ذخیره بشه؟',
  'تورنمنت‌ها و براکت‌ها کی برگزار میشن؟',
  'کلوپ‌ها و نبرد تیمی چه امکاناتی دارند؟',
];

export default function HomeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'سلام! 👋 من دستیار هوشمند تایپرو هستم. می‌توانید هر سوالی درباره تب‌ها، مسابقات، آکادمی، اشتراک پرو، نقشه حرارتی، فریلنسرها یا جوایز سایت دارید بپرسید تا راهنمایی‌تان کنم.',
      time: 'هم‌اکنون',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages, isTyping]);

  // Comprehensive AI Rule Engine for Typro
  const generateBotReply = (userQuery: string): { text: string; link?: { href: string; label: string } } => {
    const raw = userQuery.trim();
    const q = raw.toLowerCase();

    // 1. Incomprehensible Check (گنگ، کاراکترهای بی‌معنی، چرت و پرت، حروف تکراری کیبورد)
    const isGibberish =
      raw.length <= 1 ||
      /^[^a-zA-Z\u0600-\u06FF0-9]+$/.test(raw) || // only punctuation
      /^(.)\1{4,}$/.test(raw) || // same char repeated 5+ times
      /^(asdf|qwer|zxcv|jkl;|سیش|ضصث|قثغ|کگمنت|asd|dsa|hjk|dfg)+$/i.test(raw) ||
      (raw.length < 4 && !['سلام', 'درود', 'کمک', 'تست', 'وام', 'پول', 'سکه'].includes(raw));

    if (isGibberish) {
      return {
        text: `سوال شما مفهوم نبود. لطفاً سوال‌تان را واضح‌تر در مورد بخش‌ها و امکانات سایت مطرح فرمایید، یا به این جیمیل پیام دهید:\n📧 ${SUPPORT_EMAIL}`,
      };
    }

    // 2. Greetings
    if (
      q === 'سلام' ||
      q === 'سلام علیکم' ||
      q === 'درود' ||
      q === 'سلام وقت بخیر' ||
      q === 'صبح بخیر' ||
      q === 'عصر بخیر' ||
      q === 'شب بخیر'
    ) {
      return {
        text: 'سلام و درود! خوش آمدید. هر سوالی درباره امکانات و تب‌های پلتفرم تایپرو دارید بفرمایید تا دقیق راهنمایی‌تان کنم.',
      };
    }

    // 3. Subscription, Card Payment, 150k Price & Receipt Upload
    if (
      q.includes('اشتراک') ||
      q.includes('پرو') ||
      q.includes('قیمت') ||
      q.includes('هزینه') ||
      q.includes('خرید') ||
      q.includes('کارت به کارت') ||
      q.includes('شماره کارت') ||
      q.includes('فیش') ||
      q.includes('واریز') ||
      q.includes('۱۵۰') ||
      q.includes('150') ||
      q.includes('vip')
    ) {
      return {
        text: `💳 اشتراک تایپرو پرو (یک‌ماهه) به مبلغ ۱۵۰,۰۰۰ تومان (۱۵۰ تومن) است.\n\nبرای خرید و ارتقا:\n۱. به صفحه اشتراک بروید و روی «ارتقا به اشتراک پرو» کلیک کنید.\n۲. مبلغ ۱۵۰ هزار تومان را به شماره کارت ۶۲۱۹۸۶۱۴۷۳۸۱۸۲۶۷ واریز کنید.\n۳. عکس فیش واریزی و کد پیگیری را آپلود کرده و دکمه «درخواست برای فعال شدن اشتراک» را بزنید.\n۴. پس از بررسی ادمین، اشتراک فعال می‌شود. (در صورت عدم واریز، درخواست با دلیل مربوطه رد می‌شود).`,
        link: { href: '/subscription', label: 'صفحه ارتقاء به اشتراک پرو' },
      };
    }

    // 4. Keyboard Heatmap & Typing DNA
    if (
      q.includes('نقشه حرارتی') ||
      q.includes('هیت مپ') ||
      q.includes('هیت‌مپ') ||
      q.includes('heatmap') ||
      q.includes('typing dna') ||
      q.includes('dna') ||
      q.includes('ژنتیک تایپ') ||
      q.includes('کلید های ضعیف') ||
      q.includes('کلیدهای ضعیف') ||
      q.includes('خطای کلید') ||
      q.includes('عضلانی')
    ) {
      return {
        text: `🔥 تحلیل عمیق Typing DNA و نقشه حرارتی کیبورد (Heatmap) در تب پیشرفت و بخش هوش مصنوعی قرار دارد.\n\nاین قابلیت برای کاربران دارای اشتراک پرو کاملاً فعال و آنلاک است و میزان خطای تک‌تک کلیدها و بالانس عضلانی دست چپ و راست را نمایش می‌دهد. برای کاربران عادی با پیام «اشتراک تایپرو را تهیه کن» همراه با دکمه ارتقا نمایش داده می‌شود.`,
        link: { href: '/reports/intelligence', label: 'ورود به نقشه حرارتی کیبورد' },
      };
    }

    // 5. Typing Tests & Speed / Accuracy
    if (
      q.includes('آزمون') ||
      q.includes('تست تایپ') ||
      q.includes('سرعت تایپ') ||
      q.includes('wpm') ||
      q.includes('دقت') ||
      q.includes('تایمر') ||
      q.includes('استاندارد ایران') ||
      q.includes('چالش روزانه')
    ) {
      return {
        text: `⏱️ آزمون‌های تایپرو سرعت واقعی (WPM) و دقت شما را بدون تقلب ارزیابی می‌کنند.\nمی‌توانید در آزمون‌های سریع ۶۰ ثانیه‌ای، متون استاندارد فارسی (ISIRI 9147) یا چالش روزانه شرکت کرده و رکورد خود را ثبت کنید.`,
        link: { href: '/typing-test', label: 'شروع آزمون تایپ استاندارد' },
      };
    }

    // 6. Live Race, Rooms & Capacity 0 of 8
    if (
      q.includes('مسابقه زنده') ||
      q.includes('پیست') ||
      q.includes('لایو ریس') ||
      q.includes('اتاق') ||
      q.includes('روم') ||
      q.includes('ماشین') ||
      q.includes('خودرو') ||
      q.includes('موتور') ||
      q.includes('اسکین') ||
      q.includes('ظرفیت') ||
      q.includes('ربات')
    ) {
      return {
        text: `🏎️ پیست رقابت زنده (Live Race) امکان رقابت آنلاین و همزمان با سایر کاربران با خودروها و موتورهای اسپرت را فراهم می‌کند.\n• تمامی مسابقات ۱۰۰٪ با انسان‌های واقعی است (بدون ربات).\n• ظرفیت هر اتاق حداکثر ۸ نفر بوده و در صورت خالی بودن دقیقاً «۰ از ۸» نمایش می‌یابد.`,
        link: { href: '/live-race', label: 'ورود به پیست رقابت زنده' },
      };
    }

    // 7. Lessons Academy
    if (
      q.includes('درس') ||
      q.includes('دروس') ||
      q.includes('آموزش') ||
      q.includes('آکادمی') ||
      q.includes('ده انگشتی') ||
      q.includes('ده‌انگشتی') ||
      q.includes('یادگیری') ||
      q.includes('حروف') ||
      q.includes('انگشت')
    ) {
      return {
        text: `📚 آکادمی جامع تایپرو شامل بیش از ۲۶۰ درس منظم از کلیدهای شاخص پایه تا متون پیشرفته است:\n• سطح ۱ (مقدماتی): ۱۰۰٪ رایگان و عمومی\n• سطوح ۲ و ۳ (مبتدی و پیشرفته): نیازمند اشتراک تایپرو پرو\n• بعد از هر ۳ درس یک بازی مهارتی برای تثبیت حافظه عضلانی قرار دارد.`,
        link: { href: '/lessons', label: 'فهرست کامل دروس آکادمی' },
      };
    }

    // 8. Skill Games
    if (
      q.includes('بازی') ||
      q.includes('گیم') ||
      q.includes('سقوط کلمات') ||
      q.includes('wordfall') ||
      q.includes('موشک') ||
      q.includes('پدافند') ||
      q.includes('بالن')
    ) {
      return {
        text: `🎮 تالار بازی‌های مهارتی شامل ۴ بازی تعاملی جذاب (سقوط کلمات، تعقیب موشک، پدافند هوایی و ترکاندن بالن‌ها) است که بدون کادر ورودی و با کلید Space آغاز شده و بازتاب سرعت و تسلط شما را بالا می‌برند.`,
        link: { href: '/games', label: 'ورود به تالار بازی‌های مهارتی' },
      };
    }

    // 9. Tournaments & Brackets
    if (
      q.includes('تورنمنت') ||
      q.includes('براکت') ||
      q.includes('حذفی') ||
      q.includes('مسابقه هفتگی') ||
      q.includes('شنبه') ||
      q.includes('پنجشنبه')
    ) {
      return {
        text: `🏆 تورنمنت‌ها و براکت‌های حذفی دوتایی تایپرو به صورت هفتگی برگزار خواهند شد.\nثبت‌نام در پنج‌شنبه و جمعه انجام شده و مسابقات شنبه‌ها بر اساس نظرسنجی کاربران (بعدازظهر یا شب) برگزار می‌شود. افراد غیرواقعی حذف شده و این بخش به زودی در آپدیت بعدی فعال می‌گردد.`,
        link: { href: '/tournaments', label: 'صفحه تورنمنت‌ها و براکت‌ها' },
      };
    }

    // 10. Clubs & Team Battles
    if (
      q.includes('کلوپ') ||
      q.includes('کلوب') ||
      q.includes('تیم') ||
      q.includes('نبرد تیمی') ||
      q.includes('خزانه') ||
      q.includes('چت تیمی')
    ) {
      return {
        text: `🛡️ در بخش کلوپ‌ها می‌توانید کلوب رسمی خود را تاسیس کرده یا به تیم‌ها ملحق شوید:\n• شرکت در جنگ‌های تیمی ۴۸ ساعته با جوایز سکه\n• اهدای سکه به خزانه مشترک جهت فعال‌سازی بوست‌ها\n• چت اختصاصی برای هماهنگی با هم‌تیمی‌ها.`,
        link: { href: '/clubs', label: 'مشاهده کلوپ‌ها و لیگ تیمی' },
      };
    }

    // 11. Rivals & Head-to-Head Duels
    if (
      q.includes('هماورد') ||
      q.includes('رقیب') ||
      q.includes('دوئل') ||
      q.includes('دعوت') ||
      q.includes('تن به تن') ||
      q.includes('شرط بندی') ||
      q.includes('شرط‌بندی')
    ) {
      return {
        text: `⚔️ در صفحه هماوردی و رقیب هفتگی می‌توانید به سایر کاربران واقعی دعوت دوئل بفرستید:\n• امکان تعیین سکه شرط‌بندی\n• به محض قبول دعوت و آنلاین بودن دو طرف، مسابقه همگام دوئل آغاز می‌شود\n• نمایش عکس واقعی پروفایل کاربران.`,
        link: { href: '/rivals', label: 'صفحه هماوردان و دوئل زنده' },
      };
    }

    // 12. Leaderboards & Rankings
    if (
      q.includes('رتبه') ||
      q.includes('رتبه‌بندی') ||
      q.includes('لیدربرد') ||
      q.includes('مشاهیر') ||
      q.includes('لیگ') ||
      q.includes('گرندمستر') ||
      q.includes('جدول')
    ) {
      return {
        text: `🥇 تالار مشاهیر و رتبه‌بندی کشوری تایپرو، برترین تایپیست‌های واقعی را در لیگ‌های مختلف (از برنز تا گرندمستر) بر پایه WPM خالص و بالاترین دقت رده‌بندی می‌کند. تمامی رکوردهای فیک پاکسازی شده‌اند.`,
        link: { href: '/rankings', label: 'جدول رتبه‌بندی و مشاهیر' },
      };
    }

    // 13. Freelancers & Typing Jobs
    if (
      q.includes('فریلنسر') ||
      q.includes('کارفرما') ||
      q.includes('پروژه') ||
      q.includes('استخدام') ||
      q.includes('سفارش') ||
      q.includes('کسب درآمد') ||
      q.includes('درآمد') ||
      q.includes('امانی')
    ) {
      return {
        text: `💼 در بخش فریلنسرها، تمام پروفایل‌ها ۱۰۰٪ واقعی هستند:\n• تایپیست‌ها رزومه رسمی، نمونه‌کار و شماره تماس خود را ثبت می‌کنند.\n• کارفرمایان می‌توانند با پرداخت امن امانی (Escrow) پروژه‌های تایپ فارسی، انگلیسی و فرمول را با اطمینان سفارش دهند.`,
        link: { href: '/freelancers', label: 'بازار کار و فریلنسرهای تایپ' },
      };
    }

    // 14. Reports & Analytics
    if (
      q.includes('گزارش') ||
      q.includes('آمار') ||
      q.includes('نمودار') ||
      q.includes('روند') ||
      q.includes('عملکرد')
    ) {
      return {
        text: `📊 گزارش‌های آماری جامع عملکرد شما را در ۴ بازه زمانی دقیق تحلیل می‌کنند:\n• ۲۴ ساعت شبانه‌روز\n• هفته جاری (شنبه تا جمعه)\n• ۴ هفته ماه\n• ۱۲ ماه سال خورشیدی\nتمامی نمودارها بر پایه آزمون‌ها و مسابقات واقعی ثبت‌شده خود شما رسم می‌شوند.`,
        link: { href: '/reports', label: 'مشاهده گزارش‌های آماری' },
      };
    }

    // 15. Achievements & Badges
    if (
      q.includes('مدال') ||
      q.includes('نشان') ||
      q.includes('دستاورد') ||
      q.includes('badge') ||
      q.includes('شایستگی')
    ) {
      return {
        text: `🏅 نشان‌های شایستگی نخبگان (Elite Badges) برای تمامی کاربران از صفر شروع شده و با ثبت رکوردهای سرعت، دقت، پایداری و استمرار روزانه جوایز سکه و XP دریافت خواهید کرد.`,
        link: { href: '/achievements', label: 'مشاهده مدال‌ها و دستاوردها' },
      };
    }

    // 16. Chests, Missions, Cups & Levels
    if (
      q.includes('صندوقچه') ||
      q.includes('مأموریت') ||
      q.includes('ماموریت') ||
      q.includes('کاپ') ||
      q.includes('لول') ||
      q.includes('سطح') ||
      q.includes('سکه') ||
      q.includes('الماس')
    ) {
      return {
        text: '🎁 در بخش اقتصاد و جوایز (/earn) می‌توانید صندوقچه‌های واقعی روزانه، هفتگی، ماهانه و سالانه را گشایش کرده، مأموریت‌های فعالیتی را انجام دهید و با جمع‌آوری کاپ به لیگ‌های بالاتر صعود کنید.',
        link: { href: '/earn', label: 'صندوقچه‌ها و مأموریت‌های پاداش' },
      };
    }

    // 17. Mechanical Keyboards Store
    if (
      q.includes('کیبورد مکانیکی') ||
      q.includes('فروشگاه کیبورد') ||
      q.includes('سوئیچ') ||
      q.includes('خرید کیبورد')
    ) {
      return {
        text: '⌨️ بخش فروشگاه کیبوردهای مکانیکی و لوازم تخصصی تایپ در حال تکمیل است و به زودی در آپدیت بعدی سایت همراه با تخفیف‌های ویژه رونمایی خواهد شد.',
        link: { href: '/store/keyboards', label: 'ویترین کیبوردهای مکانیکی' },
      };
    }

    // 18. Verified Certificates
    if (
      q.includes('مدرک') ||
      q.includes('گواهی') ||
      q.includes('گواهینامه') ||
      q.includes('استعلام') ||
      q.includes('سرتیفیکیت')
    ) {
      return {
        text: '📜 صدور گواهینامه‌های رسمی و دوزبانه تایپرو با بارکد QR و کد رمزنگاری SHA-256 در آپدیت بعدی سایت به زودی برای فارغ‌التحصیلان آزمون‌های استخدامی فعال می‌گردد.',
        link: { href: '/certificates', label: 'صفحه گواهینامه‌های معتبر' },
      };
    }

    // 19. Profile & Avatar Upload
    if (
      q.includes('پروفایل') ||
      q.includes('عکس') ||
      q.includes('آواتار') ||
      q.includes('تغییر نام')
    ) {
      return {
        text: '👤 در صفحه پروفایل من (/profile) می‌توانید اطلاعات شخصی را ویرایش کرده و تصویر پروفایل واقعی خود را آپلود کنید تا در بخش هماوردی و رتبه‌بندی‌ها به نمایش درآید. در صورت عدم انتخاب، کادر عکس خالی خواهد بود.',
        link: { href: '/profile', label: 'ورود به پروفایل کاربری' },
      };
    }

    // 20. Save Progress & Login
    if (
      q.includes('ذخیره') ||
      q.includes('ثبت نام') ||
      q.includes('ثبت‌نام') ||
      q.includes('ورود') ||
      q.includes('اکانت') ||
      q.includes('حساب کاربری') ||
      q.includes('لاگین')
    ) {
      return {
        text: `⚠️ توجه مهم: برای اینکه تمامی دروس گذرانده‌شده، ستاره‌ها، تحلیل کلیدهای ضعیف، رکوردهای لیگ، مدال‌ها، سکه‌ها و کاپ‌های شما برای همیشه حفظ شوند، باید در سایت ثبت‌نام کنید؛ در غیر این صورت با بستن مرورگر پیشرفت شما بازنشانی خواهد شد.`,
        link: { href: '/login', label: 'ثبت‌نام یا ورود به حساب' },
      };
    }

    // 21. General Out-of-Scope Fallback (سوالات نامربوط به امکانات سایت)
    return {
      text: 'لطفاً سوالات‌تان را در مورد امکانات سایت بپرسید.',
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateBotReply(messageText);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply.text,
        link: reply.link,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'گفتگو بازنشانی شد. چطور می‌توانم در مورد بخش‌ها و امکانات تایپرو کمکتان کنم؟',
        time: 'هم‌اکنون',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 group cursor-pointer"
          title="پشتیبان هوشمند تایپرو"
          dir="rtl"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg">
              🤖
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-blue-600 animate-pulse" />
          </div>
          <div className="text-right">
            <span className="text-xs font-black block tracking-tight">راهنما و پشتیبان تایپرو</span>
            <span className="text-[10px] text-blue-100 font-medium block">پاسخ به سوالات کل بخش‌های سایت</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
        </button>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 font-sans"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl border border-white/15">
                  🤖
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">پشتیبان هوشمند سایت تایپرو</h3>
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
                    آنلاین
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">راهنمای جامع تمام تب‌ها و امکانات</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="پاکسازی و شروع مجدد"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="بستن پنجره"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Question Chips Carousel */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/70 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0 text-xs">
            <span className="text-[11px] font-black text-slate-400 shrink-0 ml-1">پیشنهاد:</span>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold border border-slate-200 hover:border-blue-200 transition text-[11px] shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-900 text-amber-300 font-black'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : '🤖'}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>

                  {/* Optional Action Link Button */}
                  {msg.link && (
                    <div className="pt-1.5">
                      <Link
                        href={msg.link.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[11px] border border-blue-200 transition"
                      >
                        <span>{msg.link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] text-left font-mono ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pr-10 animate-pulse">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>در حال نوشتن پاسخ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Support Email Notice Bar */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>پشتیبانی مستقیم:</span>
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-mono text-blue-600 hover:underline font-bold text-[10px]"
              dir="ltr"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="سوال خود درباره هر بخش سایت را بنویسید..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:bg-white text-xs text-slate-900 transition font-sans"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer shrink-0"
              title="ارسال پیام"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
