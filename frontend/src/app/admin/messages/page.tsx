'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Users,
  User,
  Bell,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Crown,
  Eye,
  RefreshCw,
  Clock,
  Layers,
  Radio,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminMessageItem {
  id: string;
  type: 'broadcast' | 'direct';
  targetUserId?: string;
  targetUsername?: string;
  targetDisplayName?: string;
  title: string;
  content: string;
  sender: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  seenCount?: number;
}

interface UserOption {
  id: string;
  username: string;
  displayName: string;
  mobile: string;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessageItem[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'broadcast' | 'direct'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [msgType, setMsgType] = useState<'broadcast' | 'direct'>('broadcast');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [senderName, setSenderName] = useState('مدیر سامانه تایپرو');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [msgRes, usersRes] = await Promise.all([
        fetch('/api/admin/messages'),
        fetch('/api/admin/users')
      ]);

      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      }
      if (usersRes.ok) {
        const uList = await usersRes.json();
        setUsersList(Array.isArray(uList) ? uList : []);
      }
    } catch (e) {
      console.warn('Error loading admin messages data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return usersList.slice(0, 10);
    const q = userSearch.toLowerCase().trim();
    return usersList
      .filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.displayName?.toLowerCase().includes(q) ||
          u.mobile?.includes(q)
      )
      .slice(0, 10);
  }, [usersList, userSearch]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('❌ لطفاً موضوع پیام را وارد کنید.');
      return;
    }
    if (!content.trim()) {
      showToast('❌ لطفاً متن پیام را وارد کنید.');
      return;
    }
    if (msgType === 'direct' && !selectedUser) {
      showToast('❌ لطفاً کاربر مقصد را انتخاب کنید.');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        type: msgType,
        targetUserId: msgType === 'direct' ? selectedUser?.id : undefined,
        targetUsername: msgType === 'direct' ? selectedUser?.username : undefined,
        targetDisplayName: msgType === 'direct' ? selectedUser?.displayName : undefined,
        title: title.trim(),
        content: content.trim(),
        sender: senderName.trim() || 'مدیر سامانه تایپرو',
        priority,
      };

      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('خطا در ارسال پیام');
      const newMsg = await res.json();

      setMessages((prev) => [newMsg, ...prev]);
      setTitle('');
      setContent('');
      setSelectedUser(null);
      setUserSearch('');
      showToast(
        msgType === 'broadcast'
          ? '🎉 پیام سراسری با موفقیت برای تمام کاربران ارسال شد و به عنوان پاپ‌آپ یک‌باره نمایش داده خواهد شد.'
          : `🎉 پیام اختصاصی برای @${selectedUser?.username} ارسال شد و در ورود بعدی به صورت پاپ‌آپ نمایش داده می‌شود.`
      );
    } catch (e: any) {
      showToast('خطا در ارسال پیام: ' + (e.message || ''));
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('خطا در حذف پیام');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('✅ پیام با موفقیت از تاریخچه حذف شد.');
    } catch (e: any) {
      showToast('خطا در حذف پیام: ' + (e.message || ''));
    }
  };

  const displayedMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterType !== 'all' && m.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title?.toLowerCase().includes(q) ||
          m.content?.toLowerCase().includes(q) ||
          m.targetUsername?.toLowerCase().includes(q) ||
          m.targetDisplayName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [messages, filterType, searchQuery]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-white text-sm font-bold shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              مرکز ارتباطات رسمی مدیریت سامانه
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <Bell className="w-7 h-7 text-indigo-400" />
              ارسال پیام و اعلان به کاربران
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              ارسال پیام‌های سراسری (به تمام کاربران) یا خصوصی با نام رسمی «مدیر سامانه تایپرو». پیام ارسالی در اولین ورود کاربر به سامانه دقیقاً یک بار به صورت پاپ‌آپ ظاهر شده و سپس برای همیشه در بخش اعلان‌ها ذخیره می‌گردد.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-xs font-bold transition text-white shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            بروزرسانی داده‌ها
          </button>
        </div>
      </div>

      {/* Main Grid: Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-black text-lg border-b border-slate-100 pb-4">
            <Send className="w-5 h-5 text-indigo-600" />
            <span>تنظیم و ارسال پیام جدید</span>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">مخاطبان پیام:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMsgType('broadcast')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-right ${
                    msgType === 'broadcast'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      msgType === 'broadcast' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">پیام سراسری</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">ارسال به همه کاربران سامانه</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMsgType('direct')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-right ${
                    msgType === 'direct'
                      ? 'bg-purple-50 border-purple-500 text-purple-950 font-black shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      msgType === 'direct' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">پیام خصوصی</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">ارسال اختصاصی به یک کاربر</div>
                  </div>
                </button>
              </div>
            </div>

            {/* User Selector (if direct) */}
            {msgType === 'direct' && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                <label className="block text-xs font-bold text-purple-950">
                  انتخاب کاربر مخاطب:
                </label>
                {selectedUser ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-purple-300">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                        {selectedUser.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{selectedUser.displayName}</div>
                        <div className="text-[10px] text-purple-700 font-mono">@{selectedUser.username} {selectedUser.mobile ? `(${selectedUser.mobile})` : ''}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="تغییر کاربر"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="جستجو بر اساس نام، نام کاربری یا شماره موبایل..."
                        className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                      {filteredUsers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">کاربری یافت نشد.</div>
                      ) : (
                        filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="w-full p-2.5 text-right flex items-center justify-between hover:bg-purple-50 transition"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-800">{u.displayName}</span>
                              <span className="text-[10px] text-slate-400 font-mono mr-2">@{u.username}</span>
                            </div>
                            <span className="text-[10px] text-purple-600 font-bold px-2 py-0.5 rounded bg-purple-50">انتخاب</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sender and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نام فرستنده:</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="مدیر سامانه تایپرو"
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اولویت پیام:</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 bg-white"
                >
                  <option value="normal">عادی (اطلاع‌رسانی عمومی)</option>
                  <option value="important">مهم (توجه ویژه)</option>
                  <option value="urgent">فوری و امنیتی</option>
                </select>
              </div>
            </div>

            {/* Title / Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                موضوع پیام <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: آغاز مسابقات هفتگی تایپرو، تبریک ارتقای لول، تغییرات نسخه جدید..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                متن کامل پیام <span className="text-rose-500">*</span>:
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="متن پیام رسمی را در اینجا تایپ کنید. کاربر به محض باز کردن سایت این پیام را به صورت پاپ‌آپ رسمی مشاهده خواهد کرد..."
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 leading-relaxed resize-y"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'در حال ارسال پیام و اعلان...' : 'ارسال پیام با پاپ‌آپ رسمی'}</span>
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Eye className="w-4 h-4 text-indigo-400" />
              پیش‌نمایش زنده پاپ‌آپ در صفحه کاربر
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              نمایش ۱ بار در اولین ورود
            </span>
          </div>

          {/* Realistic Modal Preview */}
          <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-4 relative">
              {/* Official Seal / Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 block">پیام رسمی سامانه تایپرو</span>
                    <span className="text-xs font-black text-slate-900">{senderName || 'مدیر سامانه تایپرو'}</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                  ✕
                </div>
              </div>

              {/* Subject Badge */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-black border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{title || 'موضوع پیام رسمی'}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70 text-xs text-slate-800 leading-relaxed min-h-[90px] whitespace-pre-wrap">
                {content || 'متن پیام در اینجا به کاربر نمایش داده خواهد شد. این پنجره در اولین ورود کاربر باز می‌شود و با کلیک روی دکمه تایید، پیام به بخش اعلان‌ها منتقل شده و دیگر مجدداً پاپ‌آپ نخواهد شد.'}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between text-slate-500 text-[10px]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>هم‌اکنون</span>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  متوجه شدم و مشاهده در بخش اعلان‌ها
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History of Sent Messages */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              تاریخچه پیام‌های ارسال شده
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              فهرست پیام‌های ارسالی با امکان مشاهده جزییات و حذف پیام
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterType === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                همه ({messages.length})
              </button>
              <button
                onClick={() => setFilterType('broadcast')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterType === 'broadcast' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                سراسری ({messages.filter((m) => m.type === 'broadcast').length})
              </button>
              <button
                onClick={() => setFilterType('direct')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterType === 'direct' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                خصوصی ({messages.filter((m) => m.type === 'direct').length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در پیام‌ها..."
                className="pr-8 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {displayedMessages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {isLoading ? 'در حال دریافت اطلاعات...' : 'هیچ پیامی در این دسته‌بندی یافت نشد.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedMessages.map((msg) => (
              <div key={msg.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        msg.type === 'broadcast'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {msg.type === 'broadcast' ? '🌐 پیام سراسری' : `👤 کاربر: ${msg.targetDisplayName || msg.targetUsername}`}
                    </span>
                    <span className="text-xs font-black text-slate-900">{msg.title}</span>
                    <span className="text-[10px] text-slate-400">فرستنده: {msg.sender}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {msg.content}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>تاریخ ارسال: {new Date(msg.createdAt).toLocaleString('fa-IR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="حذف پیام از سامانه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
