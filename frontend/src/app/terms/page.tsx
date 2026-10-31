'use client';

import React from 'react';
import { ShieldCheck, Scale, AlertTriangle, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            شرایط و قوانین استفاده
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          قوانین و مقررات پلتفرم تایپرو (Terms of Service)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          آخرین به‌روزرسانی: شهریور ۱۴۰۵ | نگارش ۲.۴ مصوب
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>۱. پذیرش شرایط و عدالت رقابتی (Competitive Fairness)</span>
          </h2>
          <p>
            استفاده از خدمات، مسابقات و آموزش‌های وب‌سایت Typro.ir به منزله پذیرش کامل این توافق‌نامه است. رقابت‌ها بر مبنای مهارت واقعی انگشتان، بدون اعمال بوست‌های متقلبانه، اسکریپت‌ها یا شبیه‌سازهای تایپ خودکار طراحی شده‌اند.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>۲. سیاست‌های ضد تقلب (Anti-Cheat Policy - بند ۱۴۵)</span>
          </h2>
          <p>
            سیستم مجهز به الگوریتم‌های تله‌متری تحلیل وقفه زمانی ضربات (Keystroke Jitter) است. هرگونه ورود کلید با فاصله‌های کمتر از ۲۰ میلی‌ثانیه یا انحراف استاندارد غیرطبیعی صفر به عنوان ماکرو یا ربات شناسایی شده و منجر به مسدودسازی دائمی حساب و ابطال گواهی‌های مربوطه خواهد شد.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>۳. قوانین بازار کار و حساب امانی (Escrow System)</span>
          </h2>
          <p>
            تمام مراودات مالی سفارش‌های تایپ فریلنسری تحت نظارت سیستم پرداخت امانی انجام می‌شود. تایپرو سلامت فرآیند مالی، استرداد وجه در صورت عدم تحویل، و واریز دستمزد پس از تایید نهایی کارفرما را تضمین می‌نماید.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>۴. اعتبار قانونی گواهینامه‌های دیجیتال</span>
          </h2>
          <p>
            مدارک صادرشده حاوی امضای رمزنگاری‌شده SHA-256 و بارکد استعلام مستقیم بوده و صرفاً با شرکت در آزمون نظارت‌شده با دقت ۹۷٪ یا بالاتر اعتبار رسمی احراز صلاحیت استخدامی دارند.
          </p>
        </section>
      </div>
    </div>
  );
}
