'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Plus,
  Search,
  Filter,
  UserCheck,
  DollarSign,
  ShieldAlert,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Sparkles,
  FileText,
  MessageSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { OrderItem } from '@/app/orders/page';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [assignModalOrder, setAssignModalOrder] = useState<OrderItem | null>(null);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string>('');

  const [disputeModalOrder, setDisputeModalOrder] = useState<OrderItem | null>(null);
  const [disputeDecision, setDisputeDecision] = useState<'release' | 'refund'>('release');
  const [disputeAdminNote, setDisputeAdminNote] = useState<string>('بر اساس ارزیابی هیئت داوری تایپرو، کیفیت تایپ مورد تایید قرار گرفت.');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'typing_fa' | 'typing_en' | 'math_formula' | 'audio_transcription' | 'rewriting'>('typing_fa');
  const [newEmployerName, setNewEmployerName] = useState('امیرحسین رضایی');
  const [newFreelancerName, setNewFreelancerName] = useState('');
  const [newAmountToman, setNewAmountToman] = useState('۳۲۰,۰۰۰');
  const [newWordCount, setNewWordCount] = useState('۴,۲۰۰ کلمه');
  const [newDeadlineDays, setNewDeadlineDays] = useState('۳');
  const [newDescription, setNewDescription] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');

  // Load orders and users
  const loadData = async () => {
    let apiOrders: OrderItem[] = [];
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) apiOrders = await res.json();
    } catch {}

    let localOrders: OrderItem[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('typro_real_orders');
        if (saved) localOrders = JSON.parse(saved);

        const savedUsers = localStorage.getItem('typro_registered_users');
        if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));
      } catch {}
    }

    const mergedMap = new Map<string, OrderItem>();
    apiOrders.forEach((o) => mergedMap.set(o.id, o));
    localOrders.forEach((o) => mergedMap.set(o.id, o));

    const finalOrders = Array.from(mergedMap.values());
    setOrders(finalOrders);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('typro_orders_updated', handleUpdate);
    return () => window.removeEventListener('typro_orders_updated', handleUpdate);
  }, []);

  const saveOrders = async (updated: OrderItem[]) => {
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typro_real_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('typro_orders_updated'));
    }
  };

  // Status Change Handler
  const handleStatusChange = async (orderId: string, newStatus: OrderItem['status'], statusFa: string, extraUpdates: Partial<OrderItem> = {}) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          statusFa,
          ...extraUpdates,
        };
      }
      return o;
    });

    await saveOrders(updated);

    try {
      await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, statusFa, ...extraUpdates }),
      });
    } catch {}

    showToast(`وضعیت سفارش ${orderId} به «${statusFa}» تغییر یافت.`);
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`آیا از حذف کامل سفارش ${orderId} اطمینان دارید؟`)) return;

    const updated = orders.filter((o) => o.id !== orderId);
    await saveOrders(updated);

    try {
      await fetch(`${API_BASE}/orders/${orderId}`, { method: 'DELETE' });
    } catch {}

    showToast(`سفارش ${orderId} با موفقیت حذف گردید.`);
  };

  // Assign Freelancer
  const handleAssignFreelancer = async () => {
    if (!assignModalOrder) return;
    const found = registeredUsers.find((u) => u.id === selectedFreelancerId || u.displayName === selectedFreelancerId);
    const freelancerName = found ? (found.displayName || found.username) : 'تایپیست منتخب مدیریت';

    await handleStatusChange(assignModalOrder.id, 'In Progress', 'در حال انجام', {
      freelancerId: selectedFreelancerId,
      freelancerName,
    });

    setAssignModalOrder(null);
  };

  // Resolve Dispute
  const handleResolveDispute = async () => {
    if (!disputeModalOrder) return;

    if (disputeDecision === 'release') {
      await handleStatusChange(disputeModalOrder.id, 'Completed', 'تکمیل‌شده و تسویه شده (حکم داوری)', {
        escrowStatus: 'Released',
        reviewComment: `[حکم داوری ادمین]: ${disputeAdminNote}`,
      });
    } else {
      await handleStatusChange(disputeModalOrder.id, 'Cancelled', 'لغو و عودت وجه به کارفرما (حکم داوری)', {
        escrowStatus: 'Refunded',
        reviewComment: `[حکم داوری ادمین - عودت]: ${disputeAdminNote}`,
      });
    }

    setDisputeModalOrder(null);
  };

  // Create Order by Admin
  const handleCreateByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const escrowCode = `ESC-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: OrderItem = {
      id: orderId,
      title: newTitle.trim(),
      category: newCategory,
      categoryFa: newCategory === 'typing_fa' ? 'تایپ فارسی' : newCategory === 'typing_en' ? 'تایپ انگلیسی' : newCategory === 'math_formula' ? 'تایپ فرمول ریاضی' : 'پیاده‌سازی صوت',
      employerId: 'admin-usr',
      employerName: newEmployerName.trim() || 'مدیریت تایپرو',
      freelancerId: '',
      freelancerName: newFreelancerName.trim() || 'در انتظار تخصیص',
      amountToman: Number(newAmountToman.replace(/[^0-9]/g, '')) || 300000,
      status: 'Pending',
      statusFa: 'در انتظار تایید و تخصیص',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      deadlineDays: Number(newDeadlineDays) || 3,
      deadlineDate: `${newDeadlineDays} روز پس از تایید`,
      wordCountOrDuration: newWordCount.trim() || '۴,۰۰۰ کلمه',
      description: newDescription.trim(),
      files: [{ name: 'admin_order_spec.docx', size: '1.5 MB', type: 'docx' }],
      escrowRef: escrowCode,
      escrowStatus: 'Held',
    };

    const updated = [newOrder, ...orders];
    await saveOrders(updated);

    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch {}

    setCreateModalOpen(false);
    setNewTitle('');
    showToast(`سفارش جدید ${orderId} توسط مدیر با موفقیت ثبت گردید.`);
  };

  // Filter & Search
  const filteredOrders = orders.filter((o) => {
    const matchFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchSearch =
      searchQuery === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.freelancerName && o.freelancerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.escrowRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Calculate Metrics
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const inProgressCount = orders.filter((o) => o.status === 'In Progress' || o.status === 'Accepted').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const disputedCount = orders.filter((o) => o.status === 'Disputed').length;
  const totalEscrowToman = orders
    .filter((o) => o.escrowStatus === 'Held')
    .reduce((sum, o) => sum + o.amountToman, 0);

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-black flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black border border-sky-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              مرکز نظارت و مدیریت حساب‌های امانی تایپرو (Escrow Control Center)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            مدیریت سفارش‌های پروژه و حساب‌های امانی
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
            تایید پروژه، تخصیص مجری به سفارش، آزادسازی مستقیم وجوه امانی، صدور احکام داوری و لغو سفارش‌های تایپ متنی و پیاده‌سازی صوت.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm transition shadow-md shadow-sky-600/20 active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت سفارش جدید توسط مدیر</span>
        </button>
      </div>

      {/* Analytics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">کل سفارش‌ها</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalOrders}</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 block">در انتظار تایید</span>
          <span className="text-2xl font-black text-amber-900 font-mono">{pendingCount}</span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-blue-800 block">در حال انجام</span>
          <span className="text-2xl font-black text-blue-900 font-mono">{inProgressCount}</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 block">تکمیل و تسویه شده</span>
          <span className="text-2xl font-black text-emerald-900 font-mono">{completedCount}</span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-800 block">داوری و اختلاف</span>
          <span className="text-2xl font-black text-rose-900 font-mono">{disputedCount}</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-sky-400 block">وجوه مسدودی امانی</span>
          <span className="text-sm font-black text-white font-mono">{totalEscrowToman.toLocaleString('fa-IR')} تومان</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: 'all', label: 'همه' },
            { key: 'Pending', label: 'در انتظار' },
            { key: 'In Progress', label: 'در حال انجام' },
            { key: 'Submitted', label: 'تحویل داده‌شده' },
            { key: 'Revision', label: 'اصلاح' },
            { key: 'Completed', label: 'تکمیل‌شده' },
            { key: 'Disputed', label: 'داوری / اختلاف' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setActiveFilter(st.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeFilter === st.key
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو کد سفارش، عنوان، کارفرما..."
            className="w-full text-xs pr-9 pl-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-bold">هیچ سفارشی مطابق فیلتر انتخابی یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                <tr>
                  <th className="p-4">کد سفارش / امانی</th>
                  <th className="p-4">عنوان پروژه</th>
                  <th className="p-4">کارفرما</th>
                  <th className="p-4">تایپیست مجری</th>
                  <th className="p-4">مبلغ امانی</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <span className="font-mono font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {ord.id}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1 font-mono">{ord.escrowRef}</span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="font-bold text-slate-900 block leading-tight">{ord.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{ord.wordCountOrDuration}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{ord.employerName}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-blue-700">{ord.freelancerName || 'در انتظار تخصیص'}</span>
                    </td>
                    <td className="p-4">
                      <strong className="font-black text-slate-900">{ord.amountToman.toLocaleString('fa-IR')} تومان</strong>
                      <span className="block text-[10px] text-slate-400">سپرده امانی</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black border ${
                          ord.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : ord.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.status === 'Disputed'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {ord.statusFa}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Assign Freelancer Button */}
                        <button
                          onClick={() => setAssignModalOrder(ord)}
                          className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 transition"
                          title="تخصیص یا تغییر مجری"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* Release Escrow Button */}
                        {ord.status !== 'Completed' && (
                          <button
                            onClick={() =>
                              handleStatusChange(ord.id, 'Completed', 'تکمیل‌شده و تسویه شده', {
                                escrowStatus: 'Released',
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition"
                            title="آزادسازی مستقیم وجه امانی به مجری"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Resolve Dispute Button */}
                        {ord.status === 'Disputed' && (
                          <button
                            onClick={() => setDisputeModalOrder(ord)}
                            className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                            title="صدور حکم داوری"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Order Button */}
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="px-2 py-1 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="حذف کامل سفارش"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN FREELANCER MODAL */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">تخصیص مجری / تایپیست به سفارش</h3>
              </div>
              <button onClick={() => setAssignModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                سفارش: <strong>{assignModalOrder.title}</strong> ({assignModalOrder.id})
              </p>
              <label className="font-extrabold text-slate-800 block">انتخاب تایپیست مجری از لیست کاربران ثبت‌نامی:</label>
              <select
                value={selectedFreelancerId}
                onChange={(e) => setSelectedFreelancerId(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-bold bg-slate-50"
              >
                <option value="">انتخاب از لیست تایپیست‌های واقعی سامانه...</option>
                {registeredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.username} ({u.mobile || u.email || 'تایپیست فعّال'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssignModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleAssignFreelancer}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/20"
              >
                تخصیص مجری و تایید سفارش
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE RESOLUTION MODAL */}
      {disputeModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-black text-slate-900 text-base">صدور حکم هیئت داوری</h3>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                پرونده اختلاف سفارش: <strong>{disputeModalOrder.title}</strong>
              </p>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block">رای نهایی هیئت داوری:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisputeDecision('release')}
                    className={`p-3 rounded-2xl border text-center font-black transition ${
                      disputeDecision === 'release' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    تایید کیفیت و آزادسازی به مجری
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisputeDecision('refund')}
                    className={`p-3 rounded-2xl border text-center font-black transition ${
                      disputeDecision === 'refund' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ابطال و عودت وجه به کارفرما
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 block">یادداشت و دلیل رای داوری:</label>
                <textarea
                  rows={3}
                  value={disputeAdminNote}
                  onChange={(e) => setDisputeAdminNote(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDisputeModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleResolveDispute}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                ثبت و اجرای رای داوری
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ORDER BY ADMIN MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">ثبت پروژه جدید توسط مدیریت</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateByAdmin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-800 block">عنوان دقیق سفارش پروژه *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="عنوان سفارش..."
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 block">نام کارفرما</label>
                  <input
                    type="text"
                    value={newEmployerName}
                    onChange={(e) => setNewEmployerName(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800 block">مبلغ پروژه (تومان)</label>
                  <input
                    type="text"
                    value={newAmountToman}
                    onChange={(e) => setNewAmountToman(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 font-black text-sky-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black shadow-md shadow-sky-600/20"
                >
                  ثبت سفارش توسط مدیر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
