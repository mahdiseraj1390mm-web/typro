'use client';

import React from 'react';
import Link from 'next/link';
import { Keyboard, Shield, Award, Terminal, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 mt-auto shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/images/typro-logo.png"
                  alt="لوگوی تایپرو Typro.ir"
                  className="w-full h-full object-contain select-none drop-shadow-xs"
                />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                تایپرو<span className="text-blue-600 font-mono text-base mr-1">.ir</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              پلتفرم جامع آموزش تایپ ده‌انگشتی، رقابت‌های آنلاین اتومبیل‌رانی تایپ، تحلیل هوشمند عصب-عضلانی و بازار کار تخصصی فریلنسری.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>پایگاه داده امن و داده‌های مهارتی معتبر</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              آموزش و یادگیری
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/typing-test" className="text-slate-600 hover:text-blue-600 transition font-medium">تست تایپ استاندارد</Link></li>
              <li><Link href="/lessons?lang=fa" className="text-slate-600 hover:text-blue-600 transition font-medium">آکادمی تایپ فارسی</Link></li>
              <li><Link href="/lessons?lang=en" className="text-slate-600 hover:text-blue-600 transition font-medium">آکادمی تایپ انگلیسی</Link></li>
              <li><Link href="/practice" className="text-slate-600 hover:text-blue-600 transition font-medium">تمرینات تطبیقی و کلیدهای سخت</Link></li>
              <li><Link href="/write" className="text-slate-600 hover:text-blue-600 transition font-medium">ویرایشگر تایپرو رایت</Link></li>
              <li><Link href="/schools" className="text-slate-600 hover:text-blue-600 transition font-medium">سامانه مدارس و کلاس‌ها</Link></li>
            </ul>
          </div>

          {/* Competition & Gamification */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              مسابقات و اقتصاد
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/live-race" className="text-slate-600 hover:text-blue-600 transition font-medium">پیست مسابقه زنده (Live Race)</Link></li>
              <li><Link href="/rooms" className="text-slate-600 hover:text-blue-600 transition font-medium">اتاق‌های عمومی و اختصاصی</Link></li>
              <li><Link href="/tournaments" className="text-slate-600 hover:text-blue-600 transition font-medium">جدول تورنمنت‌ها و فصل‌ها</Link></li>
              <li><Link href="/store/skins" className="text-slate-600 hover:text-blue-600 transition font-medium">صفحه اسکین‌ها</Link></li>
              <li><Link href="/store/keyboards" className="text-slate-600 hover:text-blue-600 transition font-medium">کیبوردهای مکانیکی استاندارد</Link></li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              پلتفرم و ارتباطات
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/guide" className="text-slate-600 hover:text-blue-600 transition font-medium">راهنمای استقرار انگشتان</Link></li>
              <li><Link href="/certificates" className="text-slate-600 hover:text-blue-600 transition font-medium">استعلام اصالت مدارک</Link></li>
              <li><Link href="/freelancers" className="text-slate-600 hover:text-blue-600 transition font-medium">بازار تایپیست‌ها</Link></li>
              <li><Link href="/terms" className="text-slate-600 hover:text-blue-600 transition font-medium">قوانین و حریم خصوصی</Link></li>
              <li><Link href="/support" className="text-slate-600 hover:text-blue-600 transition font-medium">پشتیبانی و تیکتینگ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© تمامی حقوق برای پلتفرم تایپ ده‌انگشتی Typro.ir محفوظ است.</p>
          <div className="flex items-center gap-1">
            <span>طراحی‌شده با استانداردهای مهندسی مدرن برای فارسی‌زبانان</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
