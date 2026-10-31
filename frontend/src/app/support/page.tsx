'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, MessageSquare, Send, CheckCircle2, ChevronDown, 
  Sparkles, Paperclip, Clock, ShieldCheck, LifeBuoy, AlertCircle, FileText 
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: 'در حال بررسی' | 'پاسخ داده شده' | 'بسته شده';
  updatedAt: string;
}

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('فنی و باگ پلتفرم');
  const [priority, setPriority] = useState('عادی');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [activeTickets, setActiveTickets] = useState<Ticket[]>([
    {
      id: 'TCK-8812',
      subject: 'عدم ثبت امتیاز مسابقه زنده لیگ پلاتین',
      category: 'فنی و مسابقات',
      priority: 'فوری',
      status: 'پاسخ داده شده',
      updatedAt: 'امروز، ۱۰:۴۵',
    },
    {
      id: 'TCK-8790',
      subject: 'درخواست صدور نسخه فیزیکی گواهینامه طلایی',
      category: 'مدارک و گواهینامه‌ها',
      priority: 'عادی',
      status: 'در حال بررسی',
      updatedAt: 'دیروز، ۱۵:۲۰',
    },
  ]);

  const faqs = [
    {
      q: 'آیا تایپرو برای مبتدیان کامل بدون هیچ سابقه تایپ مناسب است؟',
      a: 'بله کاملاً. آکادمی تایپرو از مرحله صفر (استقرار انگشتان اشاره روی کلیدهای شاخص «ت» و «ب» با برجستگی فیزیکی) شروع می‌شود و به صورت گام‌به‌گام شما را به یک تایپیست حرفه‌ای تبدیل می‌کند.'
    },
    {
      q: 'چرا در صورت خطا، اجازه رفتن به کاراکتر بعدی را ندارم؟',
      a: 'این یک قانون سخت‌گیرانه مهندسی‌شده در تایپرو است؛ در روش لمسی استاندارد، ثبت خطا در حافظه عضلانی آسیب‌زننده است. بنابراین با کلید Backspace فوراً خطای قرمز رنگ را اصلاح می‌کنید تا الگوی ضربه‌زنی صحیح تثبیت شود.'
    },
    {
      q: 'قوانین مسابقه زنده اتومبیل‌رانی چگونه است؟',
      a: 'مسابقه در پیست اختصاصی از سمت راست به چپ حرکت می‌کند و پیشرفت خودرو دقیقاً بر مبنای تایپ کلمات صحیح متن است. در صورتی که کاربری بیش از ۵ ثانیه توقف کند، اتاق معطل او نمانده و مسابقه بدون وقفه ادامه می‌یابد.'
    },
    {
      q: 'استعلام اصالت گواهینامه‌ها چگونه انجام می‌شود؟',
      a: 'کلیه گواهینامه‌های صادره دارای کد رهگیری یکتا و بارکد QR متصل به پایگاه داده مرکزی تغییرناپذیر با امضای هش SHA-256 هستند که سازمان‌ها و کارفرمایان می‌توانند در صفحه verify آن را استعلام نمایند.'
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTck: Ticket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category,
      priority,
      status: 'در حال بررسی',
      updatedAt: 'هم‌اکنون',
    };

    setActiveTickets([newTck, ...activeTickets]);
    setSubject('');
    setMessage('');
    setAttachedFile(null);
    showToast(`✅ تیکت شما با شناسه پیگیری ${newTck.id} ثبت گردید و به دپارتمان تخصصی ارجاع شد.`);
  };

  const handleSimulateAttach = () => {
    setAttachedFile('screenshot_bug_report.png');
    showToast('📎 فایل اسکرین‌شات پیوست گردید.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            مرکز پشتیبانی، پایگاه دانش و ارتباط ۲۴/۷
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          مرکز پشتیبانی، سوالات متداول و ثبت تیکت (Support Desk)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          پاسخ به سوالات فنی و اداری، پیگیری مشکلات مالی و ارتباط مستقیم با مهندسان پلتفرم تایپرو (بند ۱۲۴).
        </p>
      </div>

      {/* SLA & Service Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-500 block">پاسخگویی تضمین‌شده (SLA)</span>
          <p className="text-base font-black text-slate-900 font-mono">کمتر از ۲ ساعت</p>
          <span className="text-[11px] text-slate-400">در تمامی روزهای هفته و تعطیلات</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-500 block">پشتیبانی تیکتینگ ۲۴ ساعته</span>
          <p className="text-base font-black text-emerald-600">پایش آنلاین سیستم</p>
          <span className="text-[11px] text-slate-400">اتصال بلادرنگ به تیم فنی</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-500 block">داوری اختلافات امانی (Escrow)</span>
          <p className="text-base font-black text-indigo-600">داوری بی‌طرفانه حقوقی</p>
          <span className="text-[11px] text-slate-400">بررسی سوابق تایپ سفارشات</span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-extrabold text-base text-slate-900 mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>پرسش‌های متداول کاربران (FAQ)</span>
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>
              {openFaq === i && (
                <div className="p-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Tickets List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>تیکت‌های فعال شما در سامانه ({activeTickets.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">شناسه</th>
                <th className="py-3 px-4">موضوع تیکت</th>
                <th className="py-3 px-4">دپارتمان</th>
                <th className="py-3 px-4">اولویت</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4">آخرین بروزرسانی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{t.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{t.subject}</td>
                  <td className="py-3.5 px-4 text-slate-600">{t.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.priority === 'فوری' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'پاسخ داده شده' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      t.status === 'در حال بررسی' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{t.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Submission Form (Section 124) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>ثبت تیکت پشتیبانی جدید</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">کارشناسان ما حداکثر طی ۲ ساعت کاری به پیام شما پاسخ خواهند داد.</p>
        </div>

        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">موضوع پیام</label>
            <input
              type="text"
              required
              placeholder="مثال: عدم فعال‌سازی اشتراک پس از کسر وجه بانکی"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">دپارتمان مربوطه</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
              >
                <option value="فنی و باگ پلتفرم">پشتیبانی فنی و گزارش باگ</option>
                <option value="مالی و درگاه بانکی">امور مالی، شارژ کیف پول و تسویه‌حساب</option>
                <option value="مسابقات و رنکینگ">داوری مسابقات زنده و تورنمنت‌ها</option>
                <option value="آکادمی و آزمون‌ها">آزمون‌های استاندارد و صدور مدارک</option>
                <option value="سفارشات فریلنسری">حل اختلاف و داوری سفارشات امانی</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">اولویت رسیدگی</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
              >
                <option value="عادی">عادی (پاسخگویی تا ۲ ساعت)</option>
                <option value="متوسط">متوسط</option>
                <option value="فوری">فوری و حیاتی</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">شرح کامل پیام یا شرح مشکل</label>
            <textarea
              rows={4}
              required
              placeholder="لطفاً جزئیات مشکل، پیام خطا و مراحل رخ دادن آن را به دقت شرح دهید..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans"
            />
          </div>

          {/* Attachment button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateAttach}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>پیوست تصویر یا لاگ خطا</span>
              </button>
              {attachedFile && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{attachedFile}</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>ارسال تیکت به پشتیبانی</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
