'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, BookOpen, Trophy, Shield, Wallet } from 'lucide-react';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'مسابقات و پیست زنده',
      question: 'قانون ۵ ثانیه عدم فعالیت در مسابقات زنده چگونه عمل می‌کند؟',
      answer: 'مطابق بند ۵۴ مستند، در صورتی که یک کاربر بیش از ۴ ثانیه هیچ کلیدی را فشار ندهد، یک شمارش معکوس ۵ ثانیه‌ای به وی نشان داده می‌شود. اگر تایپ از سر گرفته نشود، کاربر به عنوان انصرافی علامت خورده و اتاق بدون معطلی سایر رقبا به کار خود ادامه می‌دهد.',
    },
    {
      category: 'مسابقات و پیست زنده',
      question: 'جهت فیزیکی حرکت خودروها در پیست مسابقه به چه سمتی است؟',
      answer: 'بر اساس بند ۶۰ مستند فنی، جهت فیزیکی مسابقه منحصراً راست به چپ (RIGHT → LEFT) است. خط استارت در سمت راست و خط پایان در سمت چپ قرار دارد و سر خودروها همواره به سمت چپ (پایان) است. حالت RTL هرگز این جهت را معکوس نمی‌کند.',
    },
    {
      category: 'آکادمی و تایپ',
      question: 'چرا در صورت خطا، امکان پیشروی در متن وجود ندارد؟',
      answer: 'تایپرو از موتور تایپ سخت‌گیرانه (Strict Typing Engine) بهره می‌برد. برای ایجاد حافظه عضلانی دقیق، نویسه غلط بلافاصله قرمز شده و نشانگر قفل می‌شود تا با فشردن کلید Backspace اصلاح گردد.',
    },
    {
      category: 'مدارک و اعتبارسنجی',
      question: 'شرایط صدور گواهینامه رسمی بین‌المللی تایپرو چیست؟',
      answer: 'گواهینامه رسمی نیاز به حداقل آزمون ۶۰ ثانیه‌ای با حداقل دقت ۹۷٪ و حداقل سرعت ۳۰ کلمه در دقیقه دارد. برای هر مدرک یک هش کریپتوگرافیک SHA-256 و بارکد QR یکتا صادر شده که اصالت آن در سامانه قابل استعلام است.',
    },
    {
      category: 'اقتصاد و فریلنسری',
      question: 'سیستم پرداخت امن امانی (Escrow) فریلنسری چگونه تضمین می‌شود؟',
      answer: 'هنگام ثبت سفارش تایپ، وجه پروژه در حساب امن امانی تایپرو نگهداری می‌شود. تنها زمانی وجه به کیف پول فریلنسر منتقل می‌شود که کارفرما کیفیت و تحویل کار را تایید نماید.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-slate-200 pb-6 space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
          <HelpCircle className="w-4 h-4" />
          <span>پایگاه دانش و پرسش‌های متداول</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          پرسش‌های متداول (FAQ)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          پاسخ به سوالات متداول درباره قوانین مسابقات، شیوه آموزش، مدارک و اقتصاد تایپرو
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-right p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {faq.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{faq.question}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
