'use client';

import React from 'react';
import { Lock, Shield, EyeOff, Key } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            حریم خصوصی و امنیت داده‌ها
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          سیاست حفظ حریم خصوصی (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          تعهد ما به امنیت داده‌های بیومتریک تایپ و حفظ محرمانگی کاربران
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>۱. حفاظت از الگوهای تایپی و بیومتریک (Typing DNA)</span>
          </h2>
          <p>
            داده‌های ریتم ضربه‌زنی و تاخیر کلیدها صرفاً برای استخراج نمودارهای آموزشی، هیت‌مپ صفحه‌کلید و جلوگیری از ربات‌های متقلب استفاده می‌شود. هیچ‌یک از متون اختصاصی یا رمزهای عبور کاربران در این پایگاه تحلیل ذخیره نمی‌گردد.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>۲. احراز هویت پیامکی و نشست‌های امن</span>
          </h2>
          <p>
            ورود به سامانه از طریق شماره همراه و پیامک یکبار مصرف (OTP) با انقضای ۲ دقیقه‌ای انجام می‌شود. رمزهای عبور با سالت‌های قوی و هش غیرقابل بازگشت ذخیره شده و هیچ پرسنلی به آنها دسترسی ندارد.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-purple-600" />
            <span>۳. عدم افشا یا فروش داده به اشخاص ثالث</span>
          </h2>
          <p>
            تایپرو هیچ‌گونه داده هویتی، آمار رکوردهای شخصی یا اطلاعات مالی کاربران را در اختیار سازمان‌ها، شرکت‌های تبلیغاتی یا اشخاص ثالث قرار نمی‌دهد.
          </p>
        </section>
      </div>
    </div>
  );
}
