'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Bot, Shield, BookOpen, Trophy, Send } from 'lucide-react';

export default function AboutPage() {
  const [messages, setMessages] = useState<{ sender: 'assistant' | 'user'; text: string }[]>([
    {
      sender: 'assistant',
      text: 'سلام! من دستیار هوشمند تایپرو (Typro Assistant) هستم. هر سوالی درباره دوره‌ها، قوانین مسابقه آنلاین یا نحوه یادگیری سریع تایپ ده‌انگشتی دارید، از من بپرسید.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Instant smart answers based on knowledge base
    setTimeout(() => {
      let reply = 'پلتفرم Typro.ir با ترکیب متدولوژی عصب-عضلانی ردیف پایه و مسابقات اتومبیل‌رانی آنلاین، به شما کمک می‌کند سرعت تایپ خود را ۳ برابر کنید.';
      if (userMsg.includes('مسابقه') || userMsg.includes('جهت')) {
        reply = 'در مسابقات زنده تایپرو، جهت فیزیکی حرکت اتومبیل‌ها از راست به چپ (RIGHT → LEFT) است و سرعت خودرو مستقیماً از ضربه‌زنی صحیح شما در کیبورد مشتق می‌شود.';
      } else if (userMsg.includes('خطا') || userMsg.includes('بک اسپیس') || userMsg.includes('قفل')) {
        reply = 'طبق قوانین سخت‌گیرانه تایپ، کاراکتر اشتباه قرمز شده و تا زمان پاک کردن آن با کلید Backspace، امکان پیشروی به حروف بعدی وجود ندارد تا حافظه عضلانی دقیق شکل بگیرد.';
      } else if (userMsg.includes('مدرک') || userMsg.includes('گواهینامه')) {
        reply = 'پس از رسیدن به سرعت و دقت استاندارد در آزمون‌های تاییدشده، یک مدرک رسمی دیجیتال با بارکد QR اختصاصی در صفحه /certificates برای شما صادر می‌شود.';
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          درباره اکوسیستم تایپرو
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          پیشرفته‌ترین پلتفرم آموزش و مسابقات تایپ ده‌انگشتی
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          تایپرو (Typro.ir) یک پلتفرم جامع مهندسی‌شده است که آموزش آکادمیک، رقابت‌های ورزش الکترونیک (Esports)، تحلیل عصب‌شناختی Typing DNA و بازار کار فریلنسری را در یک ساختار یکپارچه پیوند می‌دهد.
        </p>
      </div>

      {/* Pillars Grid (Section 123: Mission, Vision, Tech, AI, Community) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            🎯
          </div>
          <h3 className="font-extrabold text-base text-slate-900">ماموریت ما</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ارتقای بهره‌وری دیجیتال کاربران فارسی‌زبان و ایجاد استانداردهای نوین سرعت و دقت در نگارش متون علمی، ادبی و اداری.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            ⚡
          </div>
          <h3 className="font-extrabold text-base text-slate-900">فناوری هوشمند</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            استفاده از سیستم بلادرنگ WebSockets، موتور تطبیقی تحلیل کلیدهای ضعیف و استانداردهای غیرقابل تقلب در ثبت رکوردها.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            🤝
          </div>
          <h3 className="font-extrabold text-base text-slate-900">جامعه و کارآفرینی</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            اتصال تایپیست‌های برتر به کارفرمایان در بازار تخصصی فریلنسری با سیستم رتبه‌بندی و نمره اعتماد (Trust Score).
          </p>
        </div>
      </div>

      {/* Typro Assistant Chatbot (Section 123: Typro Assistant answers product questions) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">دستیار هوشمند تایپرو (Typro Assistant)</h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>پاسخگوی آنلاین به پرسش‌های شما درباره سایت</span>
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پرسش خود را درباره امکانات تایپرو بنویسید..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4 ml-1" />
            <span>ارسال</span>
          </button>
        </form>
      </div>
    </div>
  );
}
