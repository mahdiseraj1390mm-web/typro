'use client';

import React, { useState } from 'react';
import { MessageSquare, Star, Bug, Lightbulb, CheckCircle2, Send } from 'lucide-react';

export default function FeedbackPage() {
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'feature' | 'general'>('suggestion');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitted(true);
    setText('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          صدای کاربران تایپرو
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          ارسال بازخورد، پیشنهاد یا گزارش باگ (Feedback)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          دیدگاه‌های شما مستقیماً توسط تیم مهندسی تایپرو بررسی شده و در نسخه‌های هفتگی اعمال می‌شود.
        </p>
      </div>

      {/* Feedback Form (Section 125) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>بازخورد ارزشمند شما با موفقیت ثبت شد و در اولویت بررسی قرار گرفت. با سپاس از شما!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          {/* Category Chips */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">نوع پیام</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'suggestion', label: 'پیشنهاد بهبود', icon: <Lightbulb className="w-4 h-4 text-amber-500" /> },
                { id: 'bug', label: 'گزارش باگ و خطا', icon: <Bug className="w-4 h-4 text-red-500" /> },
                { id: 'feature', label: 'درخواست قابلیت جدید', icon: <Star className="w-4 h-4 text-blue-500" /> },
                { id: 'general', label: 'نظر کلی', icon: <MessageSquare className="w-4 h-4 text-emerald-500" /> },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as any)}
                  className={`p-3 rounded-2xl border transition flex items-center gap-2 font-bold text-xs justify-center ${
                    category === c.id
                      ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">امتیاز شما به تجربه کاربری تایپرو</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Message */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">شرح بازخورد یا توضیح خطا</label>
            <textarea
              required
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="نظرات، پیشنهادات یا باگ مشاهده‌شده را با جزئیات بنویسید..."
              className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4 ml-1" />
              <span>ارسال بازخورد به تیم فنی</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
