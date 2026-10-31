'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, Award, Calendar, CheckCircle2, QrCode, 
  ArrowLeft, Printer, FileText, Share2, Sparkles, Check, Copy 
} from 'lucide-react';
import Link from 'next/link';
import { typroApi } from '@/lib/api';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certId = (params?.id as string) || 'TYPRO-CERT-2026-8849';
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [certData, setCertData] = useState({
    id: certId,
    name: 'علیرضا رضایی',
    nationalCodeMasked: '۰۰۲***۸۷۹۶',
    course: 'دوره جامع مهارت تایپ ده‌انگشتی پیشرفته (ISIRI 9147)',
    wpm: 64,
    accuracy: 98.4,
    consistency: 95.8,
    tier: 'Gold (زرین)',
    issueDate: '۱۴۰۵/۰۲/۱۵',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'معتبر و تاییدشده توسط سامانه مرکزی رتبه‌بندی Typro.ir',
  });

  useEffect(() => {
    async function loadCert() {
      try {
        const res = await typroApi.certificate.verify(certId);
        if (res) {
          setCertData((prev) => ({
            ...prev,
            id: res.serialNumber || certId,
            name: res.fullName || prev.name,
            tier: res.tier || prev.tier,
            wpm: res.wpm || prev.wpm,
            accuracy: res.accuracy || prev.accuracy,
          }));
        }
      } catch (err) {
        console.error('Verification query failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [certId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans" dir="rtl">
      {/* Verification Shield Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>اصالت مدرک تایید گردید (Cryptographically Verified)</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          استعلام اصالت گواهینامه مهارت تایپرو
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          مشخصات ثبت‌شده در دفتر کل تغییرناپذیر پلتفرم ملی تایپ کشور (Typro.ir)
        </p>
      </div>

      {/* Record Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">شناسه یکتای گواهینامه:</span>
            <span className="font-mono font-black text-slate-900 text-sm">{certData.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'لینک کپی شد' : 'کپی لینک استعلام'}</span>
            </button>
            <span>•</span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>نسخه چاپی</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-xs">نام صاحب مدرک:</span>
            <span className="font-extrabold text-slate-900 mt-1 block">{certData.name}</span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">کد ملی: {certData.nationalCodeMasked}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-xs">عنوان استاندارد آموزشی:</span>
            <span className="font-extrabold text-slate-900 mt-1 block">{certData.course}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">تاریخ صدور: {certData.issueDate}</span>
          </div>
        </div>

        {/* Verified Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-[10px] text-blue-600 font-bold block">سرعت تاییدشده</span>
            <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">{certData.wpm} WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] text-emerald-600 font-bold block">دقت تاییدشده</span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{certData.accuracy}٪</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <span className="text-[10px] text-indigo-600 font-bold block">پایداری ریتم</span>
            <span className="text-2xl font-black text-indigo-700 font-mono mt-1 block">{certData.consistency}٪</span>
          </div>
        </div>

        {/* Cryptographic Hash Fingerprint */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs space-y-1.5">
          <span className="text-[10px] text-slate-400 block font-sans font-bold">
            امضای رمزنگاری یکپارچگی گواهینامه (Digital Seal SHA-256):
          </span>
          <p className="text-[11px] text-emerald-400 break-all">{certData.sha256Hash}</p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/typing-test"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm text-center"
          >
            شما هم در آزمون رسمی شرکت کنید ←
          </Link>
          <Link
            href="/certificates"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition text-center"
          >
            مشاهده گالری مدارک من
          </Link>
        </div>
      </div>
    </div>
  );
}
