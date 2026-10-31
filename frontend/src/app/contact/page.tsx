'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            ارتباط مستقیم با تیم تایپرو
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          تماس با ما (Contact Us)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          پرسش‌ها، پیشنهادات تجاری، همکاری‌های سازمانی و مدارس را با ما در میان بگذارید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">پست الکترونیکی</h3>
            <p className="text-xs text-slate-500">پاسخگویی در کمتر از ۲۴ ساعت کاری</p>
            <p className="text-xs font-bold text-blue-600 font-mono">support@typro.ir</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">مرکز تماس و پشتیبانی</h3>
            <p className="text-xs text-slate-500">شنبه تا چهارشنبه، ساعت ۹ الی ۱۷</p>
            <p className="text-xs font-bold text-emerald-600 font-mono">۰۲۱ - ۸۸۸۸۹۹۹۹</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">دفتر مرکزی</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تهران، پارک فناوری پردیس، مجتمع نوآوری دیجیتال تایپرو
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">پیام شما با موفقیت دریافت شد!</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                همکاران ما در واحد پشتیبانی پس از بررسی درخواست، از طریق ایمیل با شما تماس خواهند گرفت.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
              >
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 mb-2">ارسال پیام مستقیم</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="مثال: محمد امینی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">پست الکترونیکی</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موضوع پیام</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="موضوع استعلام یا پیشنهاد..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">متن پیام</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="شرح پیام یا درخواست خود را بنویسید..."
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>ارسال پیام</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
