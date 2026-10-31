'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  UserCircle,
  Ban,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  X,
  ChevronDown,
  Coins,
  Gem,
  Star,
  Phone,
  Mail,
  Calendar,
  Building2,
  MapPin,
  Info,
  AlertTriangle,
  Sparkles,
  UserPlus,
  RefreshCw,
  Crown,
  Check,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ─────────────────────────────── Types ─────────────────────────────── */

interface LessonProgressRecord {
  id: string;
  title?: string;
  stars?: number;
  wpm?: number;
  accuracy?: number;
  completedAt: string;
}

interface ManagedUser {
  id: string;
  username: string;
  displayName: string;
  mobile: string;
  password: string;
  email?: string;
  gender?: string;
  workplace?: string;
  workplaceAddress?: string;
  bio?: string;
  level: number;
  xp: number;
  coins: number;
  diamonds: number;
  status: 'active' | 'suspended';
  subscription?: string;
  isSubscribed?: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  joinedDate: string;
  liveRoomBanUntil?: string;
  featureRestrictions?: string[];
  isOnline?: boolean;
  lastActivePath?: string;
  lastActiveAt?: number;
  completedLessons?: LessonProgressRecord[];
  lastLessonTitle?: string;
}

type ModalMode = 'add' | 'edit' | 'profile' | 'restrict' | 'delete' | 'subscription' | 'xp' | 'lessons' | null;

const SUBSCRIPTION_PLANS = [
  { id: 'VIP طلایی', name: 'VIP طلایی' },
  { id: 'VIP پلاتینیوم', name: 'VIP پلاتینیوم' },
  { id: 'الماس ویژه', name: 'الماس ویژه' },
  { id: 'اشتراک ماهانه', name: 'اشتراک ماهانه' },
  { id: 'اشتراک ۳ ماهه (فصل)', name: 'اشتراک ۳ ماهه (فصل)' },
  { id: 'اشتراک سالانه', name: 'اشتراک سالانه' },
  { id: 'مادام‌العمر', name: 'مادام‌العمر (VIP ابدی)' },
];

const SUBSCRIPTION_DURATIONS = [
  { label: '۳۰ روز (۱ ماه)', days: 30 },
  { label: '۶۰ روز (۲ ماه)', days: 60 },
  { label: '۹۰ روز (۳ ماه)', days: 90 },
  { label: '۱۸۰ روز (۶ ماه)', days: 180 },
  { label: '۳۶۵ روز (۱ سال)', days: 365 },
  { label: 'مادام‌العمر', days: 9999 },
];

const FEATURE_LIST: { key: string; label: string }[] = [
  { key: 'typing-test', label: 'تست تایپ' },
  { key: 'lessons', label: 'دروس آموزشی' },
  { key: 'store', label: 'فروشگاه' },
  { key: 'live-race', label: 'مسابقه زنده' },
  { key: 'earn', label: 'کسب درآمد' },
];

const BAN_DURATIONS: { label: string; value: string }[] = [
  { label: '۵ دقیقه', value: '5m' },
  { label: '۳۰ دقیقه', value: '30m' },
  { label: '۱ ساعت', value: '1h' },
  { label: '۱ روز', value: '1d' },
  { label: '۱ هفته', value: '1w' },
  { label: '۱ ماه', value: '1mo' },
  { label: '۱ سال', value: '1y' },
  { label: 'دائمی', value: 'permanent' },
];

const LS_ADMIN_USERS = 'typro_admin_users';
const LS_REG_USERS = 'typro_registered_users';

/* ─────────────────────────────── Helpers ─────────────────────────────── */

function getBanExpiry(duration: string): string {
  if (duration === 'permanent') {
    return new Date(9999, 11, 31).toISOString();
  }
  const now = new Date();
  const map: Record<string, number> = {
    '5m': 5 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1mo': 30 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  return new Date(now.getTime() + (map[duration] ?? 0)).toISOString();
}

function formatBanDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (d.getFullYear() >= 9999) return 'دائمی';
  return d.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
}

function isBanned(banUntil?: string): boolean {
  if (!banUntil) return false;
  return new Date(banUntil) > new Date();
}

function loadUsers(): ManagedUser[] {
  try {
    const admin: ManagedUser[] = JSON.parse(localStorage.getItem(LS_ADMIN_USERS) || '[]');
    const reg: any[] = JSON.parse(localStorage.getItem(LS_REG_USERS) || '[]');
    const currentUserRaw = localStorage.getItem('typro_user');
    const extraUsers: any[] = [];
    if (currentUserRaw) {
      try {
        const u = JSON.parse(currentUserRaw);
        if (u && u.username) extraUsers.push(u);
      } catch {}
    }

    const existingKeys = new Set(admin.map((u) => u.id || u.username || u.mobile));
    const merged: ManagedUser[] = [...admin];

    const allSources = [...reg, ...extraUsers];
    for (const r of allSources) {
      if (!r || (!r.id && !r.username && !r.mobile)) continue;
      const key = r.id || r.username || r.mobile;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        merged.push({
          id: r.id || `reg-${Date.now()}-${Math.random()}`,
          username: r.username || (r.mobile ? `user_${r.mobile.slice(-4)}` : 'user'),
          displayName: r.displayName || r.name || r.username || 'کاربر جدید',
          mobile: r.mobile || '',
          password: r.password || '••••••',
          email: r.email,
          gender: r.gender,
          workplace: r.workplace,
          workplaceAddress: r.workplaceAddress,
          bio: r.bio,
          level: r.level ?? 1,
          xp: r.xp ?? (r.level ? (r.level - 1) * 100 : 0),
          coins: r.coins ?? 0,
          diamonds: r.diamonds ?? 0,
          status: 'active',
          subscription: r.subscriptionPlan || r.subscription || (r.isSubscribed ? 'VIP' : 'رایگان'),
          isSubscribed: !!r.isSubscribed || (!!r.subscription && r.subscription !== 'رایگان'),
          subscriptionPlan: r.subscriptionPlan || r.subscription,
          subscriptionExpiresAt: r.subscriptionExpiresAt,
          joinedDate: r.joinedDate || new Date().toISOString().slice(0, 10),
          featureRestrictions: [],
        });
      }
    }
    return merged;
  } catch {
    return [];
  }
}

function saveAdminUsers(users: ManagedUser[]) {
  try {
    localStorage.setItem(LS_ADMIN_USERS, JSON.stringify(users));
  } catch {}
}

/* ─────────────────────────────── Sub-components ─────────────────────────────── */

function StatusBadge({ status }: { status: ManagedUser['status'] }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ' +
        (status === 'active'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-rose-100 text-rose-800')
      }
    >
      {status === 'active' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {status === 'active' ? 'فعال' : 'معلق'}
    </span>
  );
}

function PasswordCell({ pw }: { pw: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-xs text-slate-700">
        {show ? pw : '••••••••'}
      </span>
      <button
        onClick={() => setShow((s) => !s)}
        className="text-slate-400 hover:text-slate-600"
        title={show ? 'پنهان کردن' : 'نمایش رمز'}
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function formatTimeAgo(ts?: number): string {
  if (!ts) return 'نامشخص';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'هم‌اکنون';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} دقیقه پیش`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} روز پیش`;
}

function getPageName(path?: string): string {
  if (!path) return 'صفحه اصلی';
  if (path === '/') return 'صفحه اصلی';
  if (path.startsWith('/live-race')) return 'مسابقه زنده';
  if (path.startsWith('/typing-test')) return 'تست تایپ';
  if (path.startsWith('/lessons')) return 'آکادمی دروس';
  if (path.startsWith('/quran')) return 'تایپ قرآن';
  if (path.startsWith('/admin')) return 'پنل مدیریت';
  if (path.startsWith('/profile')) return 'پروفایل';
  if (path.startsWith('/store')) return 'فروشگاه';
  if (path.startsWith('/games')) return 'بازی‌ها';
  if (path.startsWith('/subscription')) return 'خرید اشتراک';
  return path;
}

/* ─────────────────────────────── Main Component ─────────────────────────────── */

export default function AdminUsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<ManagedUser | null>(null);

  /* form state */
  const [form, setForm] = useState<Partial<ManagedUser>>({});
  const [showFormPw, setShowFormPw] = useState(false);

  /* restriction state */
  const [banDuration, setBanDuration] = useState('1d');
  const [featureChecks, setFeatureChecks] = useState<Record<string, boolean>>({});

  /* delete confirm */
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  /* XP & Level Modal State */
  const [xpUser, setXpUser] = useState<ManagedUser | null>(null);
  const [targetXp, setTargetXp] = useState<number>(0);
  const [isSavingXp, setIsSavingXp] = useState(false);

  /* Lessons Progress Modal State */
  const [lessonsUser, setLessonsUser] = useState<ManagedUser | null>(null);

  /* ── Load on mount & Poll live status ── */
  useEffect(() => {
    const local = loadUsers();
    setUsers(local);

    // Sync any local users to server
    if (local.length > 0) {
      fetch('/api/admin/sync-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: local }),
      }).catch(() => {});
    }

    const loadServerUsers = () => {
      fetch('/api/admin/users')
        .then((res) => (res.ok ? res.json() : []))
        .then((backendUsers: any[]) => {
          if (Array.isArray(backendUsers) && backendUsers.length > 0) {
            setUsers((prev) => {
              const prevMap = new Map(prev.map((u) => [u.id || u.username || u.mobile, u]));
              return backendUsers.map((bu) => {
                const key = bu.id || bu.username || bu.mobile;
                const existing = prevMap.get(key);
                return {
                  id: bu.id || existing?.id || `usr-${Date.now()}`,
                  username: bu.username || existing?.username || 'user',
                  displayName: bu.displayName || existing?.displayName || bu.username || 'کاربر سیستم',
                  mobile: bu.mobile || existing?.mobile || '',
                  password: existing?.password || '••••••',
                  email: bu.email || existing?.email,
                  gender: bu.gender || existing?.gender,
                  workplace: bu.workplace || existing?.workplace,
                  workplaceAddress: bu.workplaceAddress || existing?.workplaceAddress,
                  bio: bu.bio || existing?.bio,
                  level: bu.level ?? existing?.level ?? 1,
                  xp: bu.xp ?? existing?.xp ?? 0,
                  coins: bu.coins ?? existing?.coins ?? 0,
                  diamonds: bu.diamonds ?? existing?.diamonds ?? 0,
                  status: bu.isBanned ? 'suspended' : (existing?.status || 'active'),
                  subscription: bu.subscriptionPlan || bu.subscription || (bu.isSubscribed ? 'VIP' : 'رایگان'),
                  isSubscribed: Boolean(bu.isSubscribed),
                  subscriptionPlan: bu.subscriptionPlan,
                  subscriptionExpiresAt: bu.subscriptionExpiresAt,
                  joinedDate: existing?.joinedDate || new Date().toISOString().slice(0, 10),
                  featureRestrictions: existing?.featureRestrictions || [],
                  isOnline: Boolean(bu.isOnline),
                  lastActivePath: bu.lastActivePath || '/',
                  lastActiveAt: bu.lastActiveAt,
                  completedLessons: bu.completedLessons || [],
                  lastLessonTitle: bu.lastLessonTitle,
                };
              });
            });
          }
        })
        .catch(() => {});
    };

    loadServerUsers();
    // Poll real-time online status and active pages every 15 seconds
    const interval = setInterval(loadServerUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ── Toast helper ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Persist whenever users change ── */
  useEffect(() => {
    if (users.length > 0) saveAdminUsers(users);
  }, [users]);

  /* subscription modal state */
  const [subPlan, setSubPlan] = useState('VIP طلایی');
  const [subDays, setSubDays] = useState(30);
  const [subCustomDays, setSubCustomDays] = useState('');
  const [subActive, setSubActive] = useState(true);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  /* ── Open modal helpers ── */
  const openAdd = () => {
    setForm({
      level: 1,
      coins: 0,
      diamonds: 0,
      status: 'active',
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    setShowFormPw(false);
    setModal('add');
  };

  const openEdit = (u: ManagedUser) => {
    setSelected(u);
    setForm({ ...u });
    setShowFormPw(false);
    setModal('edit');
  };

  const openProfile = (u: ManagedUser) => {
    setSelected(u);
    setModal('profile');
  };

  const openSubscription = (u: ManagedUser) => {
    setSelected(u);
    const hasActiveSub = !!u.isSubscribed || (!!u.subscription && u.subscription !== 'رایگان');
    setSubActive(hasActiveSub);
    setSubPlan(u.subscriptionPlan || (u.subscription && u.subscription !== 'رایگان' ? u.subscription : 'VIP طلایی'));
    setSubDays(30);
    setSubCustomDays('');
    setModal('subscription');
  };

  const handleSaveSubscription = async () => {
    if (!selected) return;
    setIsSubmittingSub(true);
    const finalDays = subCustomDays && parseInt(subCustomDays) > 0 ? parseInt(subCustomDays) : subDays;
    const finalPlan = subPlan;
    const active = subActive;

    const expiresAt = active
      ? (finalDays >= 9999 ? new Date(9999, 11, 31).toISOString() : new Date(Date.now() + finalDays * 24 * 60 * 60 * 1000).toISOString())
      : undefined;

    // 1. Update backend API
    try {
      await fetch(`/api/admin/users/${selected.id}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: finalPlan, days: finalDays, active }),
      });
    } catch (e) {
      console.warn('Backend subscription update failed (saving locally):', e);
    }

    // 2. Update local state
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selected.id
          ? {
              ...u,
              subscription: active ? finalPlan : 'رایگان',
              subscriptionPlan: active ? finalPlan : 'رایگان',
              isSubscribed: active,
              subscriptionExpiresAt: expiresAt,
            }
          : u
      )
    );

    // 3. Update localStorage users
    try {
      const regRaw = localStorage.getItem('typro_registered_users');
      if (regRaw) {
        const reg = JSON.parse(regRaw);
        const updated = reg.map((r: any) =>
          r.id === selected.id || r.username === selected.username || r.mobile === selected.mobile
            ? { ...r, subscription: active ? finalPlan : 'رایگان', isSubscribed: active, subscriptionPlan: active ? finalPlan : 'رایگان', subscriptionExpiresAt: expiresAt }
            : r
        );
        localStorage.setItem('typro_registered_users', JSON.stringify(updated));
      }
    } catch {}

    // 4. If current session matches this user, update active user tokens/session
    try {
      const curId = localStorage.getItem('typro_user_id');
      const curUsername = localStorage.getItem('typro_username');
      if (curId === selected.id || curUsername === selected.username || (selected.mobile && localStorage.getItem('typro_profile_phone') === selected.mobile)) {
        if (active) {
          localStorage.setItem('typro_user_is_subscribed', 'true');
          localStorage.setItem('typro_user_subscription', finalPlan);
          if (expiresAt) localStorage.setItem('typro_user_sub_expires_at', expiresAt);
        } else {
          localStorage.removeItem('typro_user_is_subscribed');
          localStorage.removeItem('typro_user_subscription');
          localStorage.removeItem('typro_user_sub_expires_at');
        }
        const userObjRaw = localStorage.getItem('typro_user');
        if (userObjRaw) {
          const uObj = JSON.parse(userObjRaw);
          uObj.isSubscribed = active;
          uObj.subscription = active ? finalPlan : 'رایگان';
          uObj.subscriptionPlan = active ? finalPlan : 'رایگان';
          uObj.subscriptionExpiresAt = expiresAt;
          localStorage.setItem('typro_user', JSON.stringify(uObj));
        }
        window.dispatchEvent(new Event('typro_economy_updated'));
      }
    } catch {}

    setIsSubmittingSub(false);
    showToast(active ? `👑 اشتراک ${finalPlan} برای کاربر @${selected.username} فعال شد.` : `اشتراک کاربر @${selected.username} غیرفعال شد.`);
    closeModal();
  };

  const openXpEdit = (u: ManagedUser) => {
    setSelected(u);
    setXpUser(u);
    setTargetXp(u.xp ?? ((u.level || 1) - 1) * 100);
    setModal('xp');
  };

  const openLessonsView = (u: ManagedUser) => {
    setSelected(u);
    setLessonsUser(u);
    setModal('lessons');
  };

  const handleSaveXp = async () => {
    if (!xpUser) return;
    setIsSavingXp(true);
    const newXp = Math.min(1_000_000_000, Math.max(0, targetXp));
    const newLevel = Math.min(1_000_000, Math.max(1, Math.floor(newXp / 100) + 1));

    try {
      const res = await fetch(`/api/admin/users/${xpUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: newXp, level: newLevel }),
      });
      if (!res.ok) throw new Error('خطا در ذخیره امتیاز');

      setUsers((prev) =>
        prev.map((u) => (u.id === xpUser.id ? { ...u, xp: newXp, level: newLevel } : u))
      );

      // Immediately synchronize local storage & UI if this is the current active session
      const isCurrentUser = user && (user.id === xpUser.id || user.username === xpUser.username || user.mobile === xpUser.mobile);
      if (isCurrentUser) {
        localStorage.setItem('typro_user_xp', String(newXp));
        localStorage.setItem('typro_user_level', String(newLevel));
        try {
          const rawUser = localStorage.getItem('typro_user');
          if (rawUser) {
            const uObj = JSON.parse(rawUser);
            uObj.xp = newXp;
            uObj.level = newLevel;
            localStorage.setItem('typro_user', JSON.stringify(uObj));
          }
        } catch {}
      }
      window.dispatchEvent(new Event('typro_economy_updated'));
      window.dispatchEvent(new Event('storage'));

      showToast(`🎉 امتیاز کاربر @${xpUser.username} به ${newXp.toLocaleString('fa-IR')} XP (سطح ${newLevel}) بروزرسانی شد.`);
      closeModal();
    } catch (e: any) {
      showToast('خطا در ذخیره امتیاز: ' + (e.message || ''));
    } finally {
      setIsSavingXp(false);
    }
  };

  const openRestrict = (u: ManagedUser) => {
    setSelected(u);
    setBanDuration('1d');
    const checks: Record<string, boolean> = {};
    FEATURE_LIST.forEach((f) => {
      checks[f.key] = (u.featureRestrictions ?? []).includes(f.key);
    });
    setFeatureChecks(checks);
    setModal('restrict');
  };

  const openDelete = (u: ManagedUser) => {
    setSelected(u);
    setDeleteConfirmText('');
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  /* ── CRUD ── */
  const handleAdd = () => {
    if (!form.username || !form.mobile || !form.password) {
      showToast('❌ نام کاربری، شماره و رمز عبور الزامی هستند.');
      return;
    }
    const newUser: ManagedUser = {
      id: `adm-${Date.now()}`,
      username: form.username!,
      displayName: form.displayName || form.username!,
      mobile: form.mobile!,
      password: form.password!,
      email: form.email,
      level: form.level ?? 1,
      xp: form.xp ?? ((form.level ? form.level - 1 : 0) * 100),
      coins: form.coins ?? 0,
      diamonds: form.diamonds ?? 0,
      status: 'active',
      joinedDate: new Date().toISOString().slice(0, 10),
      featureRestrictions: [],
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`✅ کاربر @${newUser.username} اضافه شد.`);
    closeModal();

    // Persist to backend
    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(() => {});
  };

  const handleEdit = () => {
    if (!selected) return;
    const newXp = Math.min(1_000_000_000, Math.max(0, form.xp !== undefined ? Number(form.xp) : (selected.xp ?? 0)));
    const newLevel = Math.min(1_000_000, Math.max(1, form.level !== undefined ? Number(form.level) : Math.floor(newXp / 100) + 1));

    const updatedForm = {
      ...form,
      xp: newXp,
      level: newLevel,
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selected.id
          ? {
              ...u,
              username: form.username ?? u.username,
              displayName: form.displayName ?? u.displayName,
              mobile: form.mobile ?? u.mobile,
              password: form.password ?? u.password,
              email: form.email ?? u.email,
              level: newLevel,
              xp: newXp,
              coins: form.coins ?? u.coins,
              diamonds: form.diamonds ?? u.diamonds,
              status: form.status ?? u.status,
              gender: form.gender ?? u.gender,
              workplace: form.workplace ?? u.workplace,
              workplaceAddress: form.workplaceAddress ?? u.workplaceAddress,
              bio: form.bio ?? u.bio,
            }
          : u
      )
    );
    showToast(`✅ اطلاعات و امتیاز کاربر @${form.username} با موفقیت ذخیره شد.`);
    closeModal();

    // Immediately synchronize local storage & UI if this is the current active session
    const isCurrentUser = user && (user.id === selected.id || user.username === selected.username || user.mobile === selected.mobile);
    if (isCurrentUser) {
      localStorage.setItem('typro_user_xp', String(newXp));
      localStorage.setItem('typro_user_level', String(newLevel));
      if (form.coins !== undefined) localStorage.setItem('typro_user_coins', String(form.coins));
      if (form.diamonds !== undefined) localStorage.setItem('typro_user_diamonds', String(form.diamonds));
      try {
        const rawUser = localStorage.getItem('typro_user');
        if (rawUser) {
          const uObj = JSON.parse(rawUser);
          uObj.xp = newXp;
          uObj.level = newLevel;
          if (form.coins !== undefined) uObj.coins = form.coins;
          if (form.diamonds !== undefined) uObj.diamonds = form.diamonds;
          localStorage.setItem('typro_user', JSON.stringify(uObj));
        }
      } catch {}
    }
    window.dispatchEvent(new Event('typro_economy_updated'));
    window.dispatchEvent(new Event('storage'));

    // Persist to backend API & users.json
    fetch(`/api/admin/users/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedForm),
    }).catch(() => {});
  };

  const handleDelete = () => {
    if (!selected || deleteConfirmText !== selected.username) {
      showToast('❌ نام کاربری تأیید با مقدار وارد شده مطابقت ندارد.');
      return;
    }
    const targetId = selected.id;
    setUsers((prev) => prev.filter((u) => u.id !== targetId));
    try {
      localStorage.removeItem(`typro_user_restrictions_${targetId}`);
      localStorage.removeItem(`typro_user_live_ban_${targetId}`);
    } catch {}
    showToast(`🗑️ کاربر @${selected.username} حذف شد.`);
    closeModal();

    // Persist to backend
    fetch(`/api/admin/users/${targetId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const handleSaveRestrictions = () => {
    if (!selected) return;
    const restricted = FEATURE_LIST.filter((f) => featureChecks[f.key]).map((f) => f.key);

    // Save live ban
    if (banDuration) {
      const expiry = getBanExpiry(banDuration);
      try {
        localStorage.setItem(`typro_user_live_ban_${selected.id}`, expiry);
      } catch {}
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selected.id ? { ...u, liveRoomBanUntil: expiry, featureRestrictions: restricted } : u
        )
      );
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selected.id ? { ...u, featureRestrictions: restricted } : u
        )
      );
    }

    // Save feature restrictions
    try {
      localStorage.setItem(`typro_user_restrictions_${selected.id}`, JSON.stringify(restricted));
    } catch {}

    showToast(`🔒 محدودیت‌های کاربر @${selected.username} اعمال شد.`);
    closeModal();
  };

  /* ── Filtered list ── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      u.mobile.includes(q)
    );
  });

  /* ─────────────────────────────── Render ─────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-[100] flex items-center gap-2 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <Link href="/admin" className="text-xs text-blue-600 hover:underline">
              ← بازگشت به داشبورد مدیریت
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              مدیریت کاربران
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              مشاهده، ویرایش، محدودیت و حذف کاربران سیستم تایپرو
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setUsers(loadUsers());
                showToast('🔄 لیست کاربران بازخوانی شد.');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              بازخوانی
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow"
            >
              <UserPlus className="w-4 h-4" />
              افزودن کاربر
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام کاربری، نام یا شماره..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'کل کاربران', val: users.length, color: 'blue', Icon: Users },
            {
              label: 'فعال',
              val: users.filter((u) => u.status === 'active').length,
              color: 'emerald',
              Icon: CheckCircle2,
            },
            {
              label: 'معلق',
              val: users.filter((u) => u.status === 'suspended').length,
              color: 'rose',
              Icon: XCircle,
            },
            {
              label: 'ممنوع از اتاق زنده',
              val: users.filter((u) => isBanned(u.liveRoomBanUntil)).length,
              color: 'amber',
              Icon: Ban,
            },
          ].map(({ label, val, color, Icon }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-3`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-${color}-100`}
              >
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900">{val}</div>
                <div className="text-[10px] text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">نام و شناسه</th>
                  <th className="py-3 px-4 font-bold">شماره موبایل</th>
                  <th className="py-3 px-4 font-bold text-center">
                    <span className="flex items-center gap-1 justify-center text-indigo-600 font-black">
                      <Award className="w-3.5 h-3.5" />
                      امتیاز (XP) و سطح
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold text-center">
                    <span className="flex items-center gap-1 justify-center text-emerald-600 font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      وضعیت زنده و صفحه
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold text-center">
                    <span className="flex items-center gap-1 justify-center text-blue-600 font-bold">
                      <BookOpen className="w-3.5 h-3.5" />
                      پیشرفت دروس
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold text-center">
                    <span className="flex items-center gap-1 justify-center">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      دارایی (سکه / الماس)
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold text-center">وضعیت</th>
                  <th className="py-3 px-4 font-bold text-center">
                    <span className="flex items-center gap-1 justify-center">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      اشتراک
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold text-center">محدودیت‌ها</th>
                  <th className="py-3 px-4 font-bold text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-400 text-sm">
                      هیچ کاربری یافت نشد.
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.displayName}</div>
                      <div className="font-mono text-blue-600 text-[10px]">@{u.username}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.mobile}</td>
                    
                    {/* XP & Level Cell (Click to Edit) */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openXpEdit(u)}
                        className="group inline-flex flex-col items-center p-1.5 rounded-xl hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
                        title="کلیک برای ویرایش و کم/زیاد کردن امتیاز و سطح"
                      >
                        <div className="flex items-center gap-1 font-black text-xs text-indigo-700 font-mono">
                          <Award className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition" />
                          <span>{(u.xp ?? 0).toLocaleString('fa-IR')} XP</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold mt-0.5">
                          سطح {u.level ?? 1}
                        </span>
                      </button>
                    </td>

                    {/* Real-time Online Presence & Active Page */}
                    <td className="py-3 px-4 text-center">
                      {u.isOnline ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="max-w-[130px] truncate" title={u.lastActivePath}>
                            آنلاین در {getPageName(u.lastActivePath)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-medium">
                          {u.lastActiveAt ? `آفلاین (${formatTimeAgo(u.lastActiveAt)})` : 'آفلاین'}
                        </div>
                      )}
                    </td>

                    {/* Real Lesson Progress */}
                    <td className="py-3 px-4 text-center">
                      {u.completedLessons && u.completedLessons.length > 0 ? (
                        <button
                          onClick={() => openLessonsView(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                          title="مشاهده جزییات دروس پاس شده"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{u.completedLessons.length.toLocaleString('fa-IR')} درس تکمیل</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">بدون درس</span>
                      )}
                    </td>

                    {/* Coins & Diamonds */}
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold text-amber-600 font-mono text-[11px]">
                        {u.coins.toLocaleString('fa-IR')} سکه
                      </div>
                      <div className="font-bold text-violet-600 font-mono text-[10px]">
                        {u.diamonds.toLocaleString('fa-IR')} الماس
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.isSubscribed || (u.subscription && u.subscription !== 'رایگان') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                          <Crown className="w-3 h-3 text-amber-600" />
                          {u.subscriptionPlan || u.subscription || 'VIP'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-100">
                          رایگان
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center space-y-1">
                      {isBanned(u.liveRoomBanUntil) && (
                        <span className="inline-block bg-rose-100 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          ممنوع اتاق زنده
                        </span>
                      )}
                      {(u.featureRestrictions ?? []).length > 0 && (
                        <span className="inline-block bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          محدودیت امکانات
                        </span>
                      )}
                      {!isBanned(u.liveRoomBanUntil) && (u.featureRestrictions ?? []).length === 0 && (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openXpEdit(u)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-xs transition border border-indigo-200"
                          title="ویرایش و کم/زیاد کردن امتیاز XP و سطح"
                        >
                          <Award className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => openSubscription(u)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:shadow-xs transition border border-amber-200"
                          title="مدیریت اشتراک کاربر"
                        >
                          <Crown className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => openProfile(u)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="مشاهده پروفایل"
                        >
                          <UserCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openRestrict(u)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                          title="اعمال محدودیت"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="حذف کاربر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-[11px] text-slate-400">
            نمایش {filtered.length} از {users.length} کاربر
          </div>
        </div>
      </div>

      {/* ═══════════════════ ADD MODAL ═══════════════════ */}
      {modal === 'add' && (
        <ModalWrapper title="افزودن کاربر جدید" onClose={closeModal}>
          <UserForm
            form={form}
            setForm={setForm}
            showPw={showFormPw}
            setShowPw={setShowFormPw}
            includeCoins
          />
          <ModalFooter
            onCancel={closeModal}
            onConfirm={handleAdd}
            confirmLabel="افزودن"
            confirmClass="bg-blue-600 hover:bg-blue-700 text-white"
          />
        </ModalWrapper>
      )}

      {/* ═══════════════════ EDIT MODAL ═══════════════════ */}
      {modal === 'edit' && selected && (
        <ModalWrapper
          title={`ویرایش کاربر @${selected.username}`}
          onClose={closeModal}
          wide
        >
          <UserForm
            form={form}
            setForm={setForm}
            showPw={showFormPw}
            setShowPw={setShowFormPw}
            includeCoins
            includeExtra
          />
          <ModalFooter
            onCancel={closeModal}
            onConfirm={handleEdit}
            confirmLabel="ذخیره تغییرات"
            confirmClass="bg-emerald-600 hover:bg-emerald-700 text-white"
          />
        </ModalWrapper>
      )}

      {/* ═══════════════════ DELETE CONFIRM MODAL ═══════════════════ */}
      {modal === 'delete' && selected && (
        <ModalWrapper title="تأیید حذف کاربر" onClose={closeModal}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700">
                <p className="font-bold mb-1">این عمل غیرقابل بازگشت است!</p>
                <p>
                  کاربر <strong>@{selected.username}</strong> و تمام داده‌های مرتبط با او از سیستم حذف
                  خواهند شد.
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                برای تأیید، نام کاربری را تایپ کنید:
                <span className="text-rose-600 mr-1 font-mono">{selected.username}</span>
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="نام کاربری را وارد کنید..."
              />
            </div>
          </div>
          <ModalFooter
            onCancel={closeModal}
            onConfirm={handleDelete}
            confirmLabel="حذف کاربر"
            confirmClass="bg-rose-600 hover:bg-rose-700 text-white"
          />
        </ModalWrapper>
      )}

      {/* ═══════════════════ RESTRICT MODAL ═══════════════════ */}
      {modal === 'restrict' && selected && (
        <ModalWrapper
          title={`محدودیت‌های کاربر @${selected.username}`}
          onClose={closeModal}
          wide
        >
          <div className="space-y-6">
            {/* Live room ban */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-sm text-slate-800">محدودیت اتاق زنده</span>
              </div>
              {isBanned(selected.liveRoomBanUntil) && (
                <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  ممنوعیت فعلی تا: <strong>{formatBanDate(selected.liveRoomBanUntil!)}</strong>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BAN_DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setBanDuration(d.value)}
                    className={
                      'py-2 px-3 rounded-xl border text-xs font-bold transition ' +
                      (banDuration === d.value
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100')
                    }
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature restrictions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-sm text-slate-800">محدودیت امکانات</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FEATURE_LIST.map((f) => (
                  <label
                    key={f.key}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={!!featureChecks[f.key]}
                      onChange={(e) =>
                        setFeatureChecks((prev) => ({ ...prev, [f.key]: e.target.checked }))
                      }
                      className="w-4 h-4 accent-amber-600 shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-700">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <ModalFooter
            onCancel={closeModal}
            onConfirm={handleSaveRestrictions}
            confirmLabel="اعمال محدودیت‌ها"
            confirmClass="bg-amber-600 hover:bg-amber-700 text-white"
          />
        </ModalWrapper>
      )}

      {/* ═══════════════════ PROFILE PANEL ═══════════════════ */}
      {modal === 'profile' && selected && (
        <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Panel header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">پروفایل کامل کاربر</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Identity card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white space-y-1">
                <div className="text-lg font-black">{selected.displayName}</div>
                <div className="font-mono text-blue-200 text-sm">@{selected.username}</div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selected.status} />
                  {isBanned(selected.liveRoomBanUntil) && (
                    <span className="inline-block bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      ممنوع اتاق زنده
                    </span>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="space-y-2">
                {[
                  { Icon: Phone, label: 'موبایل', val: selected.mobile },
                  { Icon: Mail, label: 'ایمیل', val: selected.email || '—' },
                  {
                    Icon: Calendar,
                    label: 'تاریخ عضویت',
                    val: selected.joinedDate,
                  },
                  { Icon: Info, label: 'جنسیت', val: selected.gender || '—' },
                  { Icon: Building2, label: 'محل کار', val: selected.workplace || '—' },
                  {
                    Icon: MapPin,
                    label: 'آدرس',
                    val: selected.workplaceAddress || '—',
                  },
                ].map(({ Icon, label, val }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400">{label}</div>
                      <div className="text-xs font-bold text-slate-800">{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {selected.bio && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 mb-1">بیوگرافی</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{selected.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'لول', val: selected.level, color: 'blue', Icon: Star },
                  {
                    label: 'سکه',
                    val: selected.coins.toLocaleString('fa-IR'),
                    color: 'amber',
                    Icon: Coins,
                  },
                  {
                    label: 'الماس',
                    val: selected.diamonds.toLocaleString('fa-IR'),
                    color: 'violet',
                    Icon: Gem,
                  },
                ].map(({ label, val, color, Icon }) => (
                  <div
                    key={label}
                    className={`p-3 rounded-2xl text-center bg-${color}-50 border border-${color}-100`}
                  >
                    <Icon className={`w-5 h-5 text-${color}-500 mx-auto mb-1`} />
                    <div className={`text-base font-black text-${color}-700`}>{val}</div>
                    <div className="text-[10px] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              {/* Subscription */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 mb-1">اشتراک</div>
                <div className="text-xs font-bold text-slate-800">
                  {selected.subscription || 'رایگان'}
                </div>
              </div>

              {/* Live room ban info */}
              {isBanned(selected.liveRoomBanUntil) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-[10px] text-rose-500 mb-1 font-bold">ممنوعیت اتاق زنده تا:</div>
                  <div className="text-xs font-bold text-rose-700">
                    {formatBanDate(selected.liveRoomBanUntil!)}
                  </div>
                </div>
              )}

              {/* Feature restrictions */}
              {(selected.featureRestrictions ?? []).length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] text-amber-600 mb-2 font-bold">امکانات محدود شده:</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.featureRestrictions!.map((k) => (
                      <span
                        key={k}
                        className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      >
                        {FEATURE_LIST.find((f) => f.key === k)?.label ?? k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Password (admin view) */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div className="text-[10px] text-slate-400 mb-1">رمز عبور (فقط مدیر)</div>
                <PasswordCell pw={selected.password} />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => {
                    closeModal();
                    openSubscription(selected);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 transition"
                >
                  <Crown className="w-4 h-4 text-amber-600" />
                  اشتراک
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openEdit(selected);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  ویرایش
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openRestrict(selected);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  <Shield className="w-4 h-4" />
                  محدودیت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ SUBSCRIPTION MODAL ═══════════════════ */}
      {modal === 'subscription' && selected && (
        <ModalWrapper
          title={`مدیریت اشتراک مستقیم: ${selected.displayName}`}
          onClose={closeModal}
          wide
        >
          <div className="space-y-5">
            {/* User Overview */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-white font-black text-sm shadow-sm">
                  <Crown className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selected.displayName}</div>
                  <div className="text-xs font-mono text-slate-500">
                    @{selected.username} {selected.mobile ? `(${selected.mobile})` : ''}
                  </div>
                </div>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-400 block mb-0.5">وضعیت اشتراک:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    selected.isSubscribed || (selected.subscription && selected.subscription !== 'رایگان')
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  {selected.subscriptionPlan || selected.subscription || 'رایگان'}
                </span>
              </div>
            </div>

            {/* Toggle Active/Inactive */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl">
              <div>
                <div className="font-bold text-xs text-slate-800">فعال بودن اشتراک ویژه برای کاربر</div>
                <div className="text-[11px] text-slate-400">
                  با فعال کردن این گزینه، کاربر دسترسی کامل به مزایای اشتراک انتخابی خواهد داشت
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={subActive}
                  onChange={(e) => setSubActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {subActive && (
              <>
                {/* Select Plan Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    نوع اشتراک (پلن):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSubPlan(plan.id)}
                        className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                          subPlan === plan.id
                            ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Crown
                            className={`w-4 h-4 ${
                              subPlan === plan.id ? 'text-amber-600' : 'text-slate-400'
                            }`}
                          />
                          <span className="text-xs">{plan.name}</span>
                        </div>
                        {subPlan === plan.id && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    مدت زمان اشتراک:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBSCRIPTION_DURATIONS.map((dur) => (
                      <button
                        key={dur.days}
                        type="button"
                        onClick={() => {
                          setSubDays(dur.days);
                          setSubCustomDays('');
                        }}
                        className={`p-2.5 rounded-xl border text-center transition text-xs ${
                          subDays === dur.days && !subCustomDays
                            ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Days Input */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">یا تعداد روز دلخواه:</span>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      placeholder="مثلاً: ۴۵ روز"
                      value={subCustomDays}
                      onChange={(e) => setSubCustomDays(e.target.value)}
                      className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400">روز</span>
                  </div>
                </div>

                {/* Expiry summary */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-600">تاریخ پایان اعتبار بعد از ذخیره:</span>
                  <span className="font-bold text-blue-700">
                    {(subCustomDays ? parseInt(subCustomDays) : subDays) >= 9999
                      ? 'مادام‌العمر (بدون انقضا)'
                      : new Date(
                          Date.now() +
                            (subCustomDays && parseInt(subCustomDays) > 0
                              ? parseInt(subCustomDays)
                              : subDays) *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                  </span>
                </div>
              </>
            )}

            <ModalFooter
              onCancel={closeModal}
              onConfirm={handleSaveSubscription}
              confirmLabel={isSubmittingSub ? 'در حال ذخیره...' : 'ثبت و اعمال اشتراک'}
              confirmClass="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm"
            />
          </div>
        </ModalWrapper>
      )}

      {/* ── MODAL: EDIT XP & LEVEL ── */}
      {modal === 'xp' && xpUser && (
        <ModalWrapper
          title={`ویرایش و تنظیم امتیاز (XP) و سطح: ${xpUser.displayName} (@${xpUser.username})`}
          onClose={closeModal}
        >
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">امتیاز و لول فعلی کاربر:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-black text-indigo-700 font-mono">
                    {(xpUser.xp ?? 0).toLocaleString('fa-IR')} XP
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900 text-xs font-black">
                    سطح {xpUser.level ?? 1}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Input exact XP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                مقدار جدید امتیاز کل (XP):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={targetXp}
                  onChange={(e) => setTargetXp(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 text-base font-black text-slate-900 font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثلاً: 2500"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">XP</span>
              </div>
            </div>

            {/* Quick Increment/Decrement Buttons */}
            <div>
              <span className="block text-xs font-bold text-slate-600 mb-2">تغییر سریع امتیاز (کم / زیاد):</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: '+۱۰۰', delta: 100 },
                  { label: '+۵۰۰', delta: 500 },
                  { label: '+۱,۰۰۰', delta: 1000 },
                  { label: '+۲,۵۰۰', delta: 2500 },
                  { label: '-۱۰۰', delta: -100 },
                  { label: '-۵۰۰', delta: -500 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => setTargetXp((prev) => Math.max(0, prev + btn.delta))}
                    className={`py-2 px-2 rounded-xl text-xs font-black border transition ${
                      btn.delta > 0
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Level Calculation Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-bold block mb-1">
                پیش‌نمایش سطح پس از ذخیره:
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    سطح {Math.max(1, Math.floor(targetXp / 100) + 1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({targetXp % 100} / 100 XP در این سطح)
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600">
                  فرمول: هر ۱۰۰ امتیاز = ۱ لول
                </span>
              </div>
            </div>

            <ModalFooter
              onCancel={closeModal}
              onConfirm={handleSaveXp}
              confirmLabel={isSavingXp ? 'در حال ذخیره...' : 'ذخیره و اعمال امتیاز جدید'}
              confirmClass="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm"
            />
          </div>
        </ModalWrapper>
      )}

      {/* ── MODAL: USER COMPLETED LESSONS PROGRESS ── */}
      {modal === 'lessons' && lessonsUser && (
        <ModalWrapper
          title={`کارنامه و تاریخچه دروس: ${lessonsUser.displayName} (@${lessonsUser.username})`}
          onClose={closeModal}
          wide
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                <span className="text-[10px] text-blue-600 font-bold">تعداد دروس گذرانده شده</span>
                <div className="text-xl font-black text-blue-950 font-mono mt-0.5">
                  {(lessonsUser.completedLessons?.length || 0).toLocaleString('fa-IR')} درس
                </div>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
                <span className="text-[10px] text-amber-600 font-bold">آخرین فعالیت کاربر</span>
                <div className="text-xs font-black text-amber-950 truncate mt-1" title={lessonsUser.lastActivePath}>
                  {lessonsUser.isOnline ? `آنلاین در ${getPageName(lessonsUser.lastActivePath)}` : (lessonsUser.lastActiveAt ? formatTimeAgo(lessonsUser.lastActiveAt) : 'آفلاین')}
                </div>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[10px] text-purple-600 font-bold">آخرین عنوان درس</span>
                <div className="text-xs font-black text-purple-950 truncate mt-1">
                  {lessonsUser.lastLessonTitle || (lessonsUser.completedLessons?.[lessonsUser.completedLessons.length - 1]?.title) || '—'}
                </div>
              </div>
            </div>

            {/* Lessons Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">عنوان درس</th>
                    <th className="py-2.5 px-3 font-bold text-center">امتیاز و ستاره</th>
                    <th className="py-2.5 px-3 font-bold text-center">سرعت (WPM)</th>
                    <th className="py-2.5 px-3 font-bold text-center">دقت</th>
                    <th className="py-2.5 px-3 font-bold text-left">تاریخ تکمیل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!lessonsUser.completedLessons || lessonsUser.completedLessons.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        این کاربر هنوز درسی را در سامانه به پایان نرسانده است.
                      </td>
                    </tr>
                  ) : (
                    lessonsUser.completedLessons.map((l, idx) => (
                      <tr key={l.id + '-' + idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {l.title || `درس شماره ${l.id}`}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-amber-500 font-mono font-black text-xs">
                            {'⭐'.repeat(Math.min(5, Math.max(1, l.stars || 3)))}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                          {l.wpm || '—'} WPM
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600 font-mono">
                          {l.accuracy ? `${l.accuracy}٪` : '۱۰۰٪'}
                        </td>
                        <td className="py-2.5 px-3 text-left font-mono text-[11px] text-slate-500">
                          {l.completedAt ? new Date(l.completedAt).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

/* ─────────────────────────────── Shared Modal Shell ─────────────────────────────── */

function ModalWrapper({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div
        className={
          'bg-white rounded-3xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] ' +
          (wide ? 'max-w-2xl' : 'max-w-md')
        }
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-base text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmClass,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmClass: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
      >
        انصراف
      </button>
      <button
        onClick={onConfirm}
        className={`px-5 py-2 rounded-xl text-xs font-bold transition ${confirmClass}`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

/* ─────────────────────────────── User Form ─────────────────────────────── */

function UserForm({
  form,
  setForm,
  showPw,
  setShowPw,
  includeCoins = false,
  includeExtra = false,
}: {
  form: Partial<ManagedUser>;
  setForm: React.Dispatch<React.SetStateAction<Partial<ManagedUser>>>;
  showPw: boolean;
  setShowPw: (v: boolean) => void;
  includeCoins?: boolean;
  includeExtra?: boolean;
}) {
  const field = (
    label: string,
    key: keyof ManagedUser,
    type: string = 'text',
    placeholder: string = ''
  ) => (
    <div key={key}>
      <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>
      <input
        type={type}
        value={(form[key] as string | number) ?? ''}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))
        }
        placeholder={placeholder}
        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('نام کاربری', 'username', 'text', 'مثال: ali_rezaei')}
        {field('نام نمایشی', 'displayName', 'text', 'نام کامل')}
        {field('شماره موبایل', 'mobile', 'text', '09xxxxxxxxx')}
        {field('ایمیل', 'email', 'email', 'example@mail.com')}
      </div>

      {/* Password field */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">رمز عبور</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="رمز عبور..."
            className="w-full px-3 py-2 pl-10 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Coins / Diamonds / XP / Level */}
      {includeCoins && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-amber-700 block mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3" /> سکه
            </label>
            <input
              type="number"
              value={form.coins ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, coins: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-violet-700 block mb-1 flex items-center gap-1">
              <Gem className="w-3 h-3" /> الماس
            </label>
            <input
              type="number"
              value={form.diamonds ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, diamonds: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-purple-700 block mb-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-600" /> امتیاز (XP)
            </label>
            <input
              type="number"
              value={form.xp ?? 0}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setForm((p) => ({
                  ...p,
                  xp: val,
                  level: Math.max(1, Math.floor(val / 100) + 1),
                }));
              }}
              min={0}
              className="w-full px-3 py-2 text-xs border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono font-bold text-purple-900"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-blue-700 block mb-1 flex items-center gap-1">
              <Star className="w-3 h-3" /> سطح / لول
            </label>
            <input
              type="number"
              value={form.level ?? 1}
              onChange={(e) => setForm((p) => ({ ...p, level: Number(e.target.value) }))}
              min={1}
              className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            />
          </div>
        </div>
      )}

      {/* Status */}
      {includeExtra && (
        <>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">وضعیت حساب</label>
            <div className="relative">
              <select
                value={form.status ?? 'active'}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value as ManagedUser['status'] }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="active">فعال</option>
                <option value="suspended">معلق</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field('جنسیت', 'gender', 'text', 'مرد / زن')}
            {field('محل کار', 'workplace', 'text', 'نام شرکت یا سازمان')}
            {field('آدرس محل کار', 'workplaceAddress', 'text', 'آدرس...')}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">بیوگرافی</label>
            <textarea
              value={form.bio ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="درباره کاربر..."
            />
          </div>
        </>
      )}
    </div>
  );
}
