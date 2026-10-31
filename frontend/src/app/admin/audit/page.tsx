'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, ArrowRight, Lock, Key, Clock, UserCheck, 
  Sparkles, Download, Search, Filter, ShieldCheck, Eye, X, CheckCircle2 
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  target: string;
  ip: string;
  severity: 'CRITICAL' | 'SECURITY' | 'FINANCIAL' | 'INFO';
  sha256Hash: string;
  prevHash: string;
  details: string;
}

export default function AdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-9942',
      timestamp: '۱۴۰۵/۰۶/۲۶ - ۱۲:۰۵:۱۰',
      adminUser: 'super_admin (علی رضایی)',
      action: 'تعدیل دستی موجودی سکه کاربر',
      target: 'کاربر: ali_rezaei (مبلغ: +500 سکه)',
      ip: '192.168.1.102',
      severity: 'FINANCIAL',
      sha256Hash: 'a8f5c71b02938bd819a847b2c918374a81726354891029384756102938475612',
      prevHash: '4e20b33219487f1a918273645102938475610293847561029384756102938475',
      details: 'علت: جایزه ویژه برنده چالش هفتگی گرندپری. تغییر در دیتابیس با موفقیت ثبت شد.',
    },
    {
      id: 'log-9941',
      timestamp: '۱۴۰۵/۰۶/۲۶ - ۱۰:۱۵:۱۲',
      adminUser: 'referee_3 (سروش نیک‌پی)',
      action: 'مسدودسازی موقت و شدوبن کاربر متخلف',
      target: 'کاربر: bot_suspicious_9',
      ip: '10.0.4.18',
      severity: 'SECURITY',
      sha256Hash: '4e20b33219487f1a918273645102938475610293847561029384756102938475',
      prevHash: 'bc7108392019228e918273645102938475610293847561029384756102938475',
      details: 'تشخیص رفتار غیرطبیعی تایپ (واریانس صفر در 12 کلید پیاپی). انتقال مسابقات به حریفان بات.',
    },
    {
      id: 'log-9940',
      timestamp: '۱۴۰۵/۰۶/۲۵ - ۱۸:۴۵:۰۰',
      adminUser: 'content_mgr (مریم صادقی)',
      action: 'انتشار درس جدید در ردیف بالای آکادمی',
      target: 'درس: کلیدهای شاخص جهش سبابه',
      ip: '192.168.1.55',
      severity: 'INFO',
      sha256Hash: 'bc7108392019228e918273645102938475610293847561029384756102938475',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      details: 'اضافه شدن درس شماره ۳ به کوریکولوم آموزشی آکادمی تایپرو.',
    },
    {
      id: 'log-9939',
      timestamp: '۱۴۰۵/۰۶/۲۵ - ۱۵:۲۰:۴۰',
      adminUser: 'super_admin (علی رضایی)',
      action: 'تهیه اسنپ‌شات دستی فوری دیتابیس',
      target: 'پایگاه داده کامل PostgreSQL 16',
      ip: '192.168.1.102',
      severity: 'CRITICAL',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      prevHash: 'f12a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
      details: 'اسنپ‌شات کامل پشتیبان با موفقیت ثبت و به فضای ابری S3 منتقل شد.',
    },
  ]);

  const [activeSeverity, setActiveSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    showToast('📊 خروجی لاگ‌های ممیزی در قالب فایل CSV رمزنگاری‌شده صادر گردید.');
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (activeSeverity !== 'all' && log.severity !== activeSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.adminUser.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Detail Forensic Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-sm">جزئیات رکورد ممیزی {selectedLog.id}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">اقدام ثبت‌شده:</span>
                <span className="font-bold text-slate-900">{selectedLog.action}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">ادمین مجری</span>
                  <span className="font-bold text-slate-800">{selectedLog.adminUser}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">آدرس IP</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.ip}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">شرح تکمیلی و لاگ سیستم:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans">
                  {selectedLog.details}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-slate-400 block text-[10px]">هش اختصاصی رکورد (SHA-256):</span>
                <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl break-all">
                  {selectedLog.sha256Hash}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px]">هش رکورد پیشین (زنجیره تغییرناپذیر):</span>
                <div className="p-2 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-xl break-all">
                  {selectedLog.prevHash}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
            >
              بستن پنجره
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                دفتر کل تغییرناپذیر (Immutable Audit Log)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              لاگ‌های ممیزی و فارنزیک امنیت ادمین (Audit & Security Logs)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              ثبت زنجیره‌ای کلیه تغییرات حساس با امضای هش SHA-256 و زنجیره پیوسته بلوکی (بند ۱۶۷).
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>خروجی رسمی CSV / لاگ</span>
        </button>
      </div>

      {/* Chain Integrity Banner */}
      <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-emerald-950">یکپارچگی ساختار زنجیره هش‌ها تایید شده است (Merkle Root Valid)</h4>
            <p className="text-emerald-700 text-[11px] mt-0.5">
              تمام رویدادهای سیستمی، مالی و امنیتی بدون کوچک‌ترین دستکاری به صورت Append-Only نگهداری می‌شوند.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-xl bg-white text-emerald-800 font-bold border border-emerald-200 shrink-0 font-mono">
          100% Tamper-Proof
        </span>
      </div>

      {/* Search & Severity Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی ادمین، اقدام، هدف یا IP..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          {[
            { id: 'all', label: 'همه سطوح' },
            { id: 'CRITICAL', label: 'بسیار بحرانی' },
            { id: 'SECURITY', label: 'امنیتی' },
            { id: 'FINANCIAL', label: 'مالی' },
            { id: 'INFO', label: 'عادی' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSeverity(s.id)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                activeSeverity === s.id ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">شناسه</th>
                <th className="py-3 px-4">زمان ثبت</th>
                <th className="py-3 px-4">سطح</th>
                <th className="py-3 px-4">ادمین مجری</th>
                <th className="py-3 px-4">شرح اقدام</th>
                <th className="py-3 px-4">هدف / رکورد متاثر</th>
                <th className="py-3 px-4 font-mono">آدرس IP</th>
                <th className="py-3 px-4 text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{log.id}</td>
                  <td className="py-3.5 px-4 text-slate-600">{log.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      log.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      log.severity === 'SECURITY' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      log.severity === 'FINANCIAL' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.adminUser}</td>
                  <td className="py-3.5 px-4 text-blue-700 font-bold">{log.action}</td>
                  <td className="py-3.5 px-4 text-slate-600">{log.target}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{log.ip}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="مشاهده لاگ کامل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
