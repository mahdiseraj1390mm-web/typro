'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Swords, Check, X, Clock, Activity, Trophy, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Friend {
  id: string;
  name: string;
  level: number;
  wpm: number;
  online: boolean;
  activity: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([
    { id: 'f-1', name: 'مهدی کاظمی', level: 34, wpm: 72, online: true, activity: 'در حال مسابقه در اتاق ۱' },
    { id: 'f-2', name: 'فاطمه صادقی', level: 25, wpm: 60, online: true, activity: 'در حال تمرین کلیدهای ضعیف' },
    { id: 'f-3', name: 'حسین مرادی', level: 29, wpm: 65, online: false, activity: 'آخرین حضور: ۱ ساعت پیش' },
  ]);

  const [requests, setRequests] = useState([
    { id: 'req-1', name: 'نیما سهرابی', level: 28, wpm: 64 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [challengeFriend, setChallengeFriend] = useState<Friend | null>(null);
  const [selectedTrackMode, setSelectedTrackMode] = useState<'standard' | 'desert' | 'cyber'>('standard');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    showToast(`✅ درخواست دوستی برای «${searchQuery.trim()}» با موفقیت ارسال شد.`);
    setSearchQuery('');
  };

  const handleAccept = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setFriends([
      ...friends,
      { id: req.id, name: req.name, level: req.level, wpm: req.wpm, online: true, activity: 'به تازگی به دوستان اضافه شد' },
    ]);
    setRequests(requests.filter((r) => r.id !== id));
    showToast(`🤝 درخواست دوستی «${req.name}» پذیرفته شد.`);
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    showToast('درخواست رد شد.');
  };

  const handleRemoveFriend = (id: string) => {
    const f = friends.find((fr) => fr.id === id);
    setFriends(friends.filter((fr) => fr.id !== id));
    if (f) showToast(`کاربر «${f.name}» از لیست دوستان حذف شد.`);
  };

  const handleSendChallenge = () => {
    if (!challengeFriend) return;
    showToast(`⚔️ دعوت‌نامه مسابقه تن‌به‌تن برای «${challengeFriend.name}» ارسال شد.`);
    setChallengeFriend(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>بخش ۹۹ پروپوزال: ارتباطات و مسابقات دوستانه</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            لیست دوستان و فعالیت‌ها (Friends & Rivals)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            دوستان خود را پیدا کنید، وضعیت زنده تمرین آنها را ببینید و مستقیماً به نبرد سرعت و دقت تایپ دعوت کنید.
          </p>
        </div>

        {/* Add friend search */}
        <form onSubmit={handleSendFriendRequest} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="نام کاربری دوست..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-48 sm:w-60"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>افزودن</span>
          </button>
        </form>
      </div>

      {/* Pending Friend Requests (Section 99) */}
      {requests.length > 0 && (
        <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 space-y-4">
          <h3 className="font-bold text-xs text-amber-900">
            درخواست‌های دوستی در انتظار تایید ({requests.length})
          </h3>
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="bg-white p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm">
                    {r.name[0]}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{r.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      سطح {r.level} • رکورد {r.wpm} WPM
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(r.id)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                    title="پذیرش"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="رد"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>دوستان من ({friends.length} نفر)</span>
        </h2>

        <div className="space-y-3">
          {friends.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/60 transition"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-base text-slate-800 shadow-xs">
                    {f.name[0]}
                  </div>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white absolute -bottom-1 -right-1 ${
                      f.online ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">{f.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                      سطح {f.level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({f.online ? 'آنلاین' : 'آفلاین'})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">{f.activity}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                  {f.wpm} WPM
                </span>
                <button
                  onClick={() => setChallengeFriend(f)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>دعوت به مسابقه</span>
                </button>
                <button
                  onClick={() => handleRemoveFriend(f.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-white transition"
                  title="حذف از دوستان"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge / Duel Modal */}
      {challengeFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-base text-slate-900">
                  دعوت به نبرد تایپ تن‌به‌تن
                </h3>
              </div>
              <button
                onClick={() => setChallengeFriend(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-red-200 flex items-center justify-center font-bold text-red-600 text-lg shadow-xs">
                {challengeFriend.name[0]}
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 block">
                  {challengeFriend.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  سطح {challengeFriend.level} • میانگین سرعت: {challengeFriend.wpm} WPM
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                انتخاب پیست مسابقه:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { id: 'standard', label: 'پیست استاندارد' },
                  { id: 'desert', label: 'کویری ایران' },
                  { id: 'cyber', label: 'سایبرپانک' },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSelectedTrackMode(track.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedTrackMode === track.id
                        ? 'border-red-600 bg-red-50 text-red-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {track.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChallengeFriend(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
              >
                انصراف
              </button>
              <Link
                href="/live-race"
                onClick={handleSendChallenge}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm"
              >
                <Swords className="w-4 h-4" />
                <span>ورود مستقیم به اتاق مسابقه</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
