'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  MessageSquare,
  Star,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Download,
  Send,
  X,
  Sparkles,
  Paperclip,
  Check,
  Plus,
  UserCheck,
  DollarSign,
  UploadCloud,
  Layers,
  HelpCircle,
  Banknote
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export interface OrderItem {
  id: string;
  title: string;
  category: 'typing_fa' | 'typing_en' | 'math_formula' | 'audio_transcription' | 'rewriting';
  categoryFa: string;
  employerId: string;
  employerName: string;
  freelancerId?: string;
  freelancerName?: string;
  amountToman: number;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Submitted' | 'Revision' | 'Completed' | 'Disputed' | 'Cancelled';
  statusFa: string;
  createdAt: string;
  deadlineDays: number;
  deadlineDate: string;
  wordCountOrDuration: string;
  description?: string;
  files: { name: string; size: string; type: string; url?: string }[];
  escrowRef: string;
  escrowStatus: 'Held' | 'Released' | 'Refunded' | 'Disputed';
  rating?: number;
  reviewComment?: string;
  revisionNotes?: string;
  disputeReason?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'freelancer' | 'admin';
  senderName: string;
  text: string;
  time: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Registered typists for selecting freelancer
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Modals & Drawers state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrderForEscrow, setSelectedOrderForEscrow] = useState<OrderItem | null>(null);
  const [escrowRating, setEscrowRating] = useState<number>(5);
  const [escrowFeedback, setEscrowFeedback] = useState<string>('کیفیت متن بسیار عالی و دقیق بود.');

  const [selectedOrderForRevision, setSelectedOrderForRevision] = useState<OrderItem | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<string>('');

  const [selectedOrderForDispute, setSelectedOrderForDispute] = useState<OrderItem | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');

  const [activeChatOrder, setActiveChatOrder] = useState<OrderItem | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [newMessageText, setNewMessageText] = useState<string>('');

  const [detailsModalOrder, setDetailsModalOrder] = useState<OrderItem | null>(null);

  // New order form fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'typing_fa' | 'typing_en' | 'math_formula' | 'audio_transcription' | 'rewriting'>('typing_fa');
  const [newWordCount, setNewWordCount] = useState('۳,۵۰۰ کلمه');
  const [newAmountToman, setNewAmountToman] = useState('۲۸۰,۰۰۰');
  const [newDeadlineDays, setNewDeadlineDays] = useState('۳');
  const [newSelectedFreelancer, setNewSelectedFreelancer] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFileAttached, setNewFileAttached] = useState<{ name: string; size: string; type: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');

  // Load real orders from backend API and LocalStorage
  const loadOrders = async () => {
    let apiOrders: OrderItem[] = [];
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        apiOrders = await res.json();
      }
    } catch {}

    let localOrders: OrderItem[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('typro_real_orders');
        if (saved) localOrders = JSON.parse(saved);
      } catch {}
    }

    // Merge API & Local without duplicate IDs
    const mergedMap = new Map<string, OrderItem>();
    apiOrders.forEach((o) => mergedMap.set(o.id, o));
    localOrders.forEach((o) => mergedMap.set(o.id, o));

    const finalOrders = Array.from(mergedMap.values());
    setOrders(finalOrders);

    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_real_orders', JSON.stringify(finalOrders));
    }
  };

  // Load registered typists from LocalStorage / Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUsers = localStorage.getItem('typro_registered_users');
        if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));
      } catch {}
    }
    loadOrders();

    const handleUpdate = () => loadOrders();
    window.addEventListener('typro_orders_updated', handleUpdate);
    return () => window.removeEventListener('typro_orders_updated', handleUpdate);
  }, []);

  const statuses = [
    { key: 'all', label: 'همه سفارش‌ها' },
    { key: 'Pending', label: 'در انتظار تایید' },
    { key: 'Accepted', label: 'پذیرفته‌شده' },
    { key: 'In Progress', label: 'در حال انجام' },
    { key: 'Submitted', label: 'تحویل داده‌شده' },
    { key: 'Revision', label: 'درخواست اصلاح' },
    { key: 'Completed', label: 'تکمیل‌شده' },
    { key: 'Disputed', label: 'داوری و اختلاف' },
  ];

  const filtered = orders.filter((o) => activeFilter === 'all' || o.status === activeFilter);

  // Category labels helper
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'typing_fa': return 'تایپ متنی فارسی';
      case 'typing_en': return 'تایپ متنی انگلیسی';
      case 'math_formula': return 'تایپ فرمول‌های ریاضی و جدول';
      case 'audio_transcription': return 'پیاده‌سازی صوت و ویدئو';
      case 'rewriting': return 'بازنویسی و تایپ متون دست‌نویس';
      default: return 'پروژه تایپ و پیاده‌سازی';
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string, statusFa: string) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">⏳ {statusFa}</span>;
      case 'Accepted':
      case 'In Progress':
        return <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black">⚙️ {statusFa}</span>;
      case 'Submitted':
        return <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-black">📥 {statusFa}</span>;
      case 'Revision':
        return <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-black">↺ {statusFa}</span>;
      case 'Completed':
        return <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">✅ {statusFa}</span>;
      case 'Disputed':
        return <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black">⚖️ {statusFa}</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">❌ {statusFa}</span>;
      default:
        return <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">{statusFa}</span>;
    }
  };

  // Create real order submission handler
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('لطفاً عنوان سفارش پروژه را وارد کنید.');
      return;
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const escrowCode = `ESC-${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    let freelancerName = 'سپردن به انتخاب مجرب‌ترین تایپیست تایپرو';
    let freelancerId = '';
    if (newSelectedFreelancer) {
      const found = registeredUsers.find((u) => u.id === newSelectedFreelancer || u.displayName === newSelectedFreelancer);
      if (found) {
        freelancerName = found.displayName || found.username;
        freelancerId = found.id;
      }
    }

    const newOrderObj: OrderItem = {
      id: orderId,
      title: newTitle.trim(),
      category: newCategory,
      categoryFa: getCategoryLabel(newCategory),
      employerId: user?.id || 'user-emp-01',
      employerName: user?.displayName || user?.username || 'کارفرمای محترم',
      freelancerId,
      freelancerName,
      amountToman: Number(newAmountToman.replace(/[^0-9]/g, '')) || 250000,
      status: 'Pending',
      statusFa: 'در انتظار تایید و تخصیص',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      deadlineDays: Number(newDeadlineDays) || 3,
      deadlineDate: `${newDeadlineDays} روز پس از تایید`,
      wordCountOrDuration: newWordCount.trim() || '۳,۵۰۰ کلمه',
      description: newDescription.trim(),
      files: newFileAttached ? [newFileAttached] : [{ name: 'project_sample.docx', size: '2.4 MB', type: 'docx' }],
      escrowRef: escrowCode,
      escrowStatus: 'Held',
    };

    // Send to NestJS Backend
    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderObj),
      });
    } catch {}

    const updated = [newOrderObj, ...orders];
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_real_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('typro_orders_updated'));
    }

    setCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    showToast(`سفارش پروژه جدید «${newOrderObj.title}» با کد ${orderId} با موفقیت ثبت شد.`);
  };

  // Escrow Release Execution
  const handleConfirmReleaseEscrow = async () => {
    if (!selectedOrderForEscrow) return;

    const updatedOrders = orders.map((o) => {
      if (o.id === selectedOrderForEscrow.id) {
        return {
          ...o,
          status: 'Completed' as const,
          statusFa: 'تکمیل‌شده و تسویه شده',
          escrowStatus: 'Released' as const,
          rating: escrowRating,
          reviewComment: escrowFeedback,
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_real_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('typro_orders_updated'));
    }

    try {
      await fetch(`${API_BASE}/orders/${selectedOrderForEscrow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          statusFa: 'تکمیل‌شده و تسویه شده',
          escrowStatus: 'Released',
          rating: escrowRating,
          reviewComment: escrowFeedback,
        }),
      });
    } catch {}

    setSelectedOrderForEscrow(null);
    showToast(`مبلغ امانی سفارش ${selectedOrderForEscrow.id} با موفقیت آزادسازی شد.`);
  };

  // Submit Revision Handler
  const handleConfirmRevision = async () => {
    if (!selectedOrderForRevision) return;

    const updatedOrders = orders.map((o) => {
      if (o.id === selectedOrderForRevision.id) {
        return {
          ...o,
          status: 'Revision' as const,
          statusFa: 'درخواست اصلاح',
          revisionNotes,
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_real_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('typro_orders_updated'));
    }

    try {
      await fetch(`${API_BASE}/orders/${selectedOrderForRevision.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Revision',
          statusFa: 'درخواست اصلاح',
          revisionNotes,
        }),
      });
    } catch {}

    setSelectedOrderForRevision(null);
    setRevisionNotes('');
    showToast(`درخواست اصلاح برای سفارش ${selectedOrderForRevision.id} ارسال شد.`);
  };

  // Submit Dispute Handler
  const handleConfirmDispute = async () => {
    if (!selectedOrderForDispute) return;

    const updatedOrders = orders.map((o) => {
      if (o.id === selectedOrderForDispute.id) {
        return {
          ...o,
          status: 'Disputed' as const,
          statusFa: 'داوری و اختلاف',
          disputeReason,
          escrowStatus: 'Disputed' as const,
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_real_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('typro_orders_updated'));
    }

    try {
      await fetch(`${API_BASE}/orders/${selectedOrderForDispute.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Disputed',
          statusFa: 'داوری و اختلاف',
          disputeReason,
          escrowStatus: 'Disputed',
        }),
      });
    } catch {}

    setSelectedOrderForDispute(null);
    setDisputeReason('');
    showToast(`پرونده اختلاف و داوری برای سفارش ${selectedOrderForDispute.id} تشکیل گردید.`);
  };

  // Send Chat Message Handler
  const handleSendMessage = () => {
    if (!activeChatOrder || !newMessageText.trim()) return;

    const orderId = activeChatOrder.id;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: user?.displayName || 'کارفرما',
      text: newMessageText.trim(),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newMsg],
    }));

    setNewMessageText('');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-black flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                سامانه ضمانت امانی و رهگیری چرخه سفارشات (ESCROW PROTECTION)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              سفارش‌های پروژه‌های تایپ و پیاده‌سازی
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
              وجه سفارش تا زمان تایید رضایت شما در حساب امن امانی تایپرو محفوظ است و پس از ارزیابی کیفیت آزاد می‌گردد.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition shadow-lg shadow-blue-500/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سفارش جدید پروژه</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Status Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st.key}
              onClick={() => setActiveFilter(st.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition whitespace-nowrap ${
                activeFilter === st.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st.label}
              {st.key !== 'all' && (
                <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px]">
                  {orders.filter((o) => o.status === st.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Real Orders List or Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">هیچ پروژه یا سفارشی ثبت نشده است</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                همه سفارش‌های تایپ متنی، فرمول‌نویسی ریاضی و پیاده‌سازی فایل‌های صوتی به صورت واقعی و با سیستم ضمانت امانی تایپرو ثبت می‌گردند.
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت نخستین سفارش پروژه</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                      {ord.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">کد امانی: {ord.escrowRef}</span>
                    <span className="text-[11px] font-bold text-slate-400">تایپیست مجری: <strong className="text-slate-800">{ord.freelancerName || 'در انتظار تخصیص'}</strong></span>
                  </div>

                  <div>{getStatusBadge(ord.status, ord.statusFa)}</div>
                </div>

                {/* Main Body */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">{ord.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      دسته‌بندی: <span className="text-blue-600 font-bold">{ord.categoryFa || getCategoryLabel(ord.category)}</span>
                      {ord.description && <span className="mr-3 text-slate-400">| توضیحات: {ord.description}</span>}
                    </p>
                  </div>

                  {/* Financial & Metric info */}
                  <div className="flex items-center gap-6 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">مبلغ امانی پروژه</span>
                      <strong className="text-slate-900 font-black text-sm">{ord.amountToman.toLocaleString('fa-IR')} تومان</strong>
                    </div>
                    <div className="w-px h-7 bg-slate-200" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">حجم پروژه / مهلت</span>
                      <span className="text-slate-700 font-extrabold">{ord.wordCountOrDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Rating if Completed */}
                {ord.status === 'Completed' && ord.rating && (
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: ord.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span>{ord.reviewComment}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700">وجه با موفقیت به فریلنسر تسویه شد</span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailsModalOrder(ord)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>مشاهده فایل‌ها و جزئیات</span>
                    </button>

                    <button
                      onClick={() => setActiveChatOrder(ord)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>چت با مجری</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status === 'Submitted' && (
                      <>
                        <button
                          onClick={() => setSelectedOrderForEscrow(ord)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>آزادسازی امن وجه (تایید)</span>
                        </button>
                        <button
                          onClick={() => setSelectedOrderForRevision(ord)}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>درخواست اصلاح</span>
                        </button>
                      </>
                    )}

                    {ord.status !== 'Completed' && ord.status !== 'Disputed' && ord.status !== 'Cancelled' && (
                      <button
                        onClick={() => setSelectedOrderForDispute(ord)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ثبت اختلاف</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE NEW ORDER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">ثبت سفارش جدید پروژه تایپ و پیاده‌سازی</h3>
                  <p className="text-xs text-slate-500 font-medium">سفارش شما در سیستم ثبت شده و حساب امانی فعال می‌گردد</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block">عنوان دقیق سفارش پروژه *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: پیاده‌سازی فایل صوتی مصاحبه پژوهشی (۴۵ دقیقه)"
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 block">نوع و دسته‌بندی پروژه</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold bg-slate-50"
                  >
                    <option value="typing_fa">تایپ متنی فارسی</option>
                    <option value="typing_en">تایپ متنی انگلیسی</option>
                    <option value="math_formula">تایپ فرمول ریاضی و جدول</option>
                    <option value="audio_transcription">پیاده‌سازی صوت و ویدئو</option>
                    <option value="rewriting">بازنویسی متون دست‌نویس</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 block">حجم پروژه (کلمات / دقیقه)</label>
                  <input
                    type="text"
                    value={newWordCount}
                    onChange={(e) => setNewWordCount(e.target.value)}
                    placeholder="مثلاً: ۵,۰۰۰ کلمه"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 block">مبلغ امانی پروژه (تومان)</label>
                  <input
                    type="text"
                    value={newAmountToman}
                    onChange={(e) => setNewAmountToman(e.target.value)}
                    placeholder="مثلاً: ۳۵۰,۰۰۰"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-black text-blue-700 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800 block">مهلت تحویل (تعداد روز)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDeadlineDays}
                    onChange={(e) => setNewDeadlineDays(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block">انتخاب مجری / تایپیست (اختیاری)</label>
                <select
                  value={newSelectedFreelancer}
                  onChange={(e) => setNewSelectedFreelancer(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium bg-slate-50"
                >
                  <option value="">سپردن به انتخاب مجرب‌ترین تایپیست تایپرو (پیش‌فرض)</option>
                  {registeredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName || u.username} ({u.mobile || u.email || 'تایپیست تاییدشده'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block">توضیحات و دستورالعمل سفارش</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="توضیحات تکمیلی مانند فونت درخواستی، نحوه تایپ کلمات کلیدی، فایل صوتی و..."
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>

              {/* File Upload simulator */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 font-bold">
                    {newFileAttached ? newFileAttached.name : 'ضمیمه کردن فایل پروژه (صوت / سند)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewFileAttached({ name: 'project_audio_sample.mp3', size: '18 MB', type: 'audio' })}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                >
                  {newFileAttached ? 'تغییر فایل' : 'انتخاب فایل'}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20"
                >
                  ثبت سفارش و فعال‌سازی سپرده امانی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Files Modal */}
      {detailsModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {detailsModalOrder.id}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{detailsModalOrder.title}</h3>
              </div>
              <button
                onClick={() => setDetailsModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">مبلغ امانی:</span>
                  <strong className="text-slate-900 font-black">{detailsModalOrder.amountToman.toLocaleString('fa-IR')} تومان</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">کد پیگیری امانی:</span>
                  <span className="font-mono text-slate-800 font-bold">{detailsModalOrder.escrowRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاریخ ثبت سفارش:</span>
                  <span className="text-slate-800 font-bold">{detailsModalOrder.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">مجری تخصیص‌یافته:</span>
                  <span className="text-blue-700 font-bold">{detailsModalOrder.freelancerName || 'در انتظار تخصیص'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800">فایل‌های ضمیمه سفارش:</h4>
                {detailsModalOrder.files.map((f, i) => (
                  <div key={i} className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-bold text-slate-800 block">{f.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{f.size}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`فایل ${f.name} آماده دانلود می‌باشد.`)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailsModalOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESCROW RELEASE CONFIRMATION MODAL */}
      {selectedOrderForEscrow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">آزادسازی وجه حساب امانی</h3>
                <p className="text-xs text-slate-500 font-medium">مبلغ به حساب مجری واریز می‌شود</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                با تایید این مرحله، کیفیت متون تایپ‌شده مورد تایید شما قرار گرفته و مبلغ <strong>{selectedOrderForEscrow.amountToman.toLocaleString('fa-IR')} تومان</strong> به مجری تسویه می‌گردد.
              </p>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block">امتیاز شما به مجری (از ۱ تا ۵ ستاره):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEscrowRating(st)}
                      className={`p-2 rounded-xl border transition ${
                        escrowRating >= st ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block">نظر و بازخورد شما:</label>
                <textarea
                  rows={2}
                  value={escrowFeedback}
                  onChange={(e) => setEscrowFeedback(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedOrderForEscrow(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReleaseEscrow}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20"
              >
                تایید نهایی و آزادسازی وجه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION REQUEST MODAL */}
      {selectedOrderForRevision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">ثبت درخواست اصلاح پروژه</h3>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-extrabold text-slate-800 block">موارد نیازمند اصلاح و بازبینی را ذکر کنید:</label>
              <textarea
                rows={3}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="مثلاً: لطفاً قسمت جدول صفحه ۳ دوباره با فونت دقیق‌تر اصلاح شود."
                className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrderForRevision(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmRevision}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md"
              >
                ارسال به مجری
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {selectedOrderForDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">ثبت اختلاف و درخواست داوری</h3>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-500">پرونده جهت بررسی هیئت داوری تایپرو ارجاع داده خواهد شد.</p>
              <label className="font-extrabold text-slate-800 block">علت اصلی اعلام اختلاف:</label>
              <textarea
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="شرح دقیق دلایل عدم رضایت یا عدم تحویل متون..."
                className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-rose-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrderForDispute(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmDispute}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                ارجاع به هیئت داوری
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT DRAWER */}
      {activeChatOrder && (
        <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl border-r border-slate-200 flex flex-col">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-black text-xs sm:text-sm">چت با مجری ({activeChatOrder.freelancerName || 'تایپیست'})</h3>
                <span className="text-[10px] text-slate-400 font-mono">سفارش {activeChatOrder.id}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveChatOrder(null)}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
            {(chatMessages[activeChatOrder.id] || [
              { id: '1', sender: 'freelancer', senderName: activeChatOrder.freelancerName || 'مجری', text: 'سلام، فایل‌های پروژه در حال آماده‌سازی و بررسی اولیه هستند.', time: '۱۰:۰۰' }
            ]).map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'mr-auto items-end' : 'ml-auto items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl font-medium leading-relaxed ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 text-xs">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
