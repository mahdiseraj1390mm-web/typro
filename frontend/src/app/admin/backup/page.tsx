'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Database, Download, RefreshCcw, ShieldCheck, CheckCircle2, 
  Clock, Sparkles, Server, HardDrive, Cloud, AlertTriangle, X, Check, Lock
} from 'lucide-react';

interface BackupSnapshot {
  id: string;
  type: 'خودکار شبانه' | 'دستی فوری' | 'هفتگی فشرده';
  size: string;
  tables: string;
  date: string;
  sha256: string;
  cloudSync: boolean;
  status: 'سالم' | 'در حال پردازش';
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupSnapshot[]>([
    { 
      id: 'bkp-2026-09-17-0400', 
      type: 'خودکار شبانه', 
      size: '۵۲.۴ مگابایت', 
      tables: 'تمام جداول (کاربران، تراکنش‌ها، ممیزی، سوابق رالی)', 
      date: 'امروز، ساعت ۰۴:۰۰ صبح', 
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      cloudSync: true,
      status: 'سالم' 
    },
    { 
      id: 'bkp-2026-09-16-0400', 
      type: 'خودکار شبانه', 
      size: '۴۸.۱ مگابایت', 
      tables: 'تمام جداول (کاربران، تراکنش‌ها، ممیزی، سوابق رالی)', 
      date: 'دیروز، ساعت ۰۴:۰۰ صبح', 
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      cloudSync: true,
      status: 'سالم' 
    },
    { 
      id: 'bkp-2026-09-10-cold', 
      type: 'هفتگی فشرده', 
      size: '۳۱۵ مگابایت', 
      tables: 'آرشیو جامع فشرده ZSTD پایگاه‌داده PostgreSQL 16', 
      date: '۷ روز پیش', 
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      cloudSync: true,
      status: 'سالم' 
    },
  ]);

  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [restoreModalSnapshot, setRestoreModalSnapshot] = useState<BackupSnapshot | null>(null);
  const [restoreConfirmInput, setRestoreConfirmInput] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Cron schedule state
  const [cronDaily, setCronDaily] = useState(true);
  const [cloudMirror, setCloudMirror] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateBackup = () => {
    setCreating(true);
    setTimeout(() => {
      const newBkp: BackupSnapshot = {
        id: `bkp-manual-${Date.now()}`,
        type: 'دستی فوری',
        size: '۵۲.۸ مگابایت',
        tables: 'پشتیبان کامل فوری پایگاه‌داده PostgreSQL',
        date: 'هم‌اکنون',
        sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        cloudSync: cloudMirror,
        status: 'سالم',
      };
      setBackups([newBkp, ...backups]);
      setCreating(false);
      showToast('✅ اسنپ‌شات جدید با امضای رمزنگاری‌شده SHA-256 با موفقیت ثبت شد.');
    }, 1200);
  };

  const handleDownload = (id: string) => {
    showToast(`⬇️ دانلود فایل رمزنگاری شده ${id}.sql.gz آغاز شد.`);
  };

  const executeRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (restoreConfirmInput !== 'RESTORE') {
      showToast('⚠️ جهت تایید باید کلمه RESTORE را دقیقاً وارد کنید.');
      return;
    }

    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      const targetId = restoreModalSnapshot?.id;
      setRestoreModalSnapshot(null);
      setRestoreConfirmInput('');
      showToast(`🔄 بازیابی دیتابیس به نقطه زمانی ${targetId} با موفقیت کامل انجام شد.`);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Restore Safety Modal */}
      {restoreModalSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">تایید عملیات حساس بازیابی (Disaster Restore)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                بازیابی پایگاه‌داده به نسخه <strong className="text-slate-800 font-mono">{restoreModalSnapshot.id}</strong> وضعیت فعلی داده‌ها را به زمان ثبت این نسخه بازمی‌گرداند.
              </p>
            </div>

            <form onSubmit={executeRestore} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  برای تایید، کلمه <span className="font-mono text-rose-600 font-black">RESTORE</span> را وارد نمایید:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="RESTORE"
                  value={restoreConfirmInput}
                  onChange={(e) => setRestoreConfirmInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-300 text-center font-mono font-black text-sm tracking-wider focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isRestoring || restoreConfirmInput !== 'RESTORE'}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isRestoring ? 'در حال برگرداندن اسنپ‌شات...' : 'تایید و شروع بازیابی'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRestoreModalSnapshot(null);
                    setRestoreConfirmInput('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">← بازگشت به داشبورد ادمین</Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            پشتیبان‌گیری و بازیابی پایگاه‌داده (Backup & Disaster Recovery)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مدیریت اسنپ‌شات‌های خودکار، امضای هش SHA-256، پشتیبان‌گیری در فضای ابری آروان و سیاست بازگشت به نقطه معین (بند ۱۶۰).
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          <span>{creating ? 'در حال تهیه اسنپ‌شات...' : 'تهیه نسخه پشتیبان فوری'}</span>
        </button>
      </div>

      {/* Infrastructure Telemetry & Cron */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">پایگاه داده اصلی</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-black text-slate-900">PostgreSQL 16.4 Cluster</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>اتصال زنده (Latency: 1.2ms)</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">فضای ذخیره‌سازی ابری S3</span>
            <Cloud className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-black text-slate-900">ArvanCloud S3 Bucket</div>
          <div className="text-[11px] text-indigo-600 font-bold">
            همگام‌سازی دوطرفه فعال (AES-256)
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">سیاست نگهداری (Retention)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-black text-slate-900">۳۰ روز نگهداری اسنپ‌شات</div>
          <div className="text-[11px] text-slate-500">
            حذف خودکار نسخه‌های منقضی شده
          </div>
        </div>
      </div>

      {/* Configuration Toggles */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">تنظیمات و زمان‌بندی پشتیبان‌گیری خودکار (Cron Settings)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 block">پشتیبان‌گیری خودکار شبانه (۰۴:۰۰ بامداد)</span>
              <span className="text-[11px] text-slate-400">اجرای CronJob هر روز رأس ساعت ۴</span>
            </div>
            <input
              type="checkbox"
              checked={cronDaily}
              onChange={(e) => setCronDaily(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="font-bold text-slate-800 block">انتقال همزمان به فضای ابری S3</span>
              <span className="text-[11px] text-slate-400">Replication در دیتاسنتر ثانویه</span>
            </div>
            <input
              type="checkbox"
              checked={cloudMirror}
              onChange={(e) => setCloudMirror(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">مدت نگهداری اسنپ‌شات‌ها:</span>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs focus:outline-none"
            >
              <option value={7}>۷ روز</option>
              <option value={14}>۱۴ روز</option>
              <option value={30}>۳۰ روز (پیش‌فرض)</option>
              <option value={90}>۹۰ روز</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>نسخه‌های پشتیبان موجود در سامانه</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">شناسه نسخه و هش</th>
                <th className="py-3 px-4">نوع بک‌آپ</th>
                <th className="py-3 px-4">حجم</th>
                <th className="py-3 px-4">زمان ثبت</th>
                <th className="py-3 px-4">فضای ابری</th>
                <th className="py-3 px-4 text-center">عملیات بازیابی و دانلود</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">{b.id}</div>
                    <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs" title={b.sha256}>
                      SHA: {b.sha256}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px]">
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{b.size}</td>
                  <td className="py-3.5 px-4 text-slate-500">{b.date}</td>
                  <td className="py-3.5 px-4">
                    {b.cloudSync ? (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                        <Cloud className="w-3.5 h-3.5" />
                        <span>همگام</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">محلی</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(b.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>دانلود</span>
                      </button>
                      <button
                        onClick={() => {
                          setRestoreModalSnapshot(b);
                          setRestoreConfirmInput('');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition border border-rose-200"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>بازیابی</span>
                      </button>
                    </div>
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
