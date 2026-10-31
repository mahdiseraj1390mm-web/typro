'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, ArrowRight, Key, Check, Users, Lock, Unlock, 
  Sparkles, ShieldCheck, AlertCircle, Edit, Save, Plus, ShieldAlert,
  UserCheck, UserX, Trash2, Eye, EyeOff, Search, Sliders, CheckSquare,
  Square, RefreshCw, X, Award, CheckCircle2, Phone, Mail, UserPlus, Fingerprint
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface GranularPermission {
  id: string;
  module: string;
  moduleFa: string;
  name: string;
  desc: string;
}

export interface SubAdminUser {
  id: string;
  username: string;
  displayName: string;
  mobile: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER' | 'ECONOMY_MANAGER' | 'USER';
  adminTitle?: string;
  permissions?: string[];
  isBanned?: boolean;
  avatar?: string;
  createdAt?: number;
}

export const ALL_PERMISSIONS: GranularPermission[] = [
  // 1. پیشخوان و آمار
  { id: 'dashboard.view', module: 'dashboard', moduleFa: 'پیشخوان کلان', name: 'مشاهده آمار و نمودارها', desc: 'مشاهده آمار لحظه‌ای، بازدیدها و نمودار ترافیک' },
  { id: 'dashboard.export', module: 'dashboard', moduleFa: 'پیشخوان کلان', name: 'خروجی گزارش‌ها', desc: 'دریافت خروجی گزارش‌های تحلیلی و اکسل' },

  // 2. کاربران و امنیت
  { id: 'users.view', module: 'users', moduleFa: 'کاربران و امنیت', name: 'مشاهده فهرست کاربران', desc: 'مشاهده مشخصات هویتی و سوابق کاربران' },
  { id: 'users.create', module: 'users', moduleFa: 'کاربران و امنیت', name: 'افزودن کاربر جدید', desc: 'ثبت کاربر عادی به صورت دستی' },
  { id: 'users.edit', module: 'users', moduleFa: 'کاربران و امنیت', name: 'ویرایش مشخصات و لول', desc: 'تغییر نام، شماره، لول، سکه و اطلاعات کاربر' },
  { id: 'users.ban', module: 'users', moduleFa: 'کاربران و امنیت', name: 'مسدودسازی کاربر (Ban)', desc: 'توقیف و غیرفعال‌سازی دسترسی کاربران متخلف' },
  { id: 'users.delete', module: 'users', moduleFa: 'کاربران و امنیت', name: 'حذف کاربر', desc: 'حذف دائمی کاربر از پایگاه‌داده' },

  // 3. ادمین‌های فرعی و سطوح دسترسی (RBAC)
  { id: 'roles.view', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'مشاهده ادمین‌ها و دسترسی‌ها', desc: 'مشاهده فهرست مدیران فرعی و مجوزها' },
  { id: 'roles.create', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'افزودن ادمین فرعی جدید', desc: 'تعریف ادمین جدید با نام کاربری، رمز و سطح دسترسی' },
  { id: 'roles.edit', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'ویرایش مجوزها و رمز عبور ادمین', desc: 'تغییر سطح دسترسی‌ها و ریست پسورد ادمین‌های فرعی' },
  { id: 'roles.delete', module: 'roles', moduleFa: 'نقش‌ها و ادمین‌های فرعی', name: 'حذف یا عزل ادمین', desc: 'خلع درجه یا حذف حساب ادمین فرعی' },

  // 4. سفارشات تایپ و مبالغ امانی (Escrow)
  { id: 'orders.view', module: 'orders', moduleFa: 'سفارش‌ها و پروژه‌های امانی', name: 'مشاهده سفارش‌ها', desc: 'بررسی پروژه‌های تایپ و قراردادها' },
  { id: 'orders.status', module: 'orders', moduleFa: 'سفارش‌ها و پروژه‌های امانی', name: 'تغییر وضعیت سفارش', desc: 'تایید، رد یا خاتمه سفارشات' },
  { id: 'orders.escrow', module: 'orders', moduleFa: 'سفارش‌ها و پروژه‌های امانی', name: 'تسویه وجوه امانی', desc: 'آزادسازی و تسویه مبالغ امانی مجریان' },

  // 5. مسابقات و اتاق‌های زنده (Live Races)
  { id: 'races.view', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'مشاهده پیست‌ها و اتاق‌ها', desc: 'پایش وضعیت زنده سرورها و مسابقات' },
  { id: 'races.create', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'ایجاد پیست مسابقه', desc: 'تعریف اتاق یا سرور رقابتی جدید' },
  { id: 'races.manage', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'مدیریت و تنظیمات پیست', desc: 'تغییر متون، زمان دورها و ریستارت اتاق' },
  { id: 'races.referee', module: 'races', moduleFa: 'مسابقات و اتاق‌های زنده', name: 'داوری زنده و مداخله', desc: 'اخراج رانندگان متخلف و رفع اشکال مسابقه' },

  // 6. دروس و آکادمی تایپ
  { id: 'lessons.view', module: 'lessons', moduleFa: 'دروس و آکادمی تایپ', name: 'مشاهده ساختار دروس', desc: 'مشاهده متدها و تمرین‌های آموزشی' },
  { id: 'lessons.edit', module: 'lessons', moduleFa: 'دروس و آکادمی تایپ', name: 'ویرایش و افزودن دروس', desc: 'طراحی مراحل، متون تمرین و کلیدهای آکادمی' },

  // 7. محتوای متنی و قرآن CMS
  { id: 'content.view', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'مشاهده بانک متون و قرآن', desc: 'بررسی متون تست تایپ و سوره‌های قرآن' },
  { id: 'content.edit', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'افزودن و ویرایش متون و آیات', desc: 'ورود متون جدید، تصحیح اعراب و اشعار' },
  { id: 'content.texts.race', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'افزودن و مدیریت متون مسابقه زنده', desc: 'امکان افزودن، ویرایش و حذف متون اتاق‌های مسابقه زنده اتومبیل‌رانی' },
  { id: 'content.texts.typing', module: 'content', moduleFa: 'محتوای متنی و قرآن CMS', name: 'افزودن و مدیریت متون تست تایپ', desc: 'امکان افزودن، ویرایش و حذف متون سامانه تست تایپ و رکوردگیری' },

  // 8. بازی‌ها و سرگرمی
  { id: 'games.view', module: 'games', moduleFa: 'بازی‌ها و سرگرمی', name: 'مشاهده فهرست بازی‌ها', desc: 'بررسی وضعیت بازی‌های مهارتی تایپ' },
  { id: 'games.manage', module: 'games', moduleFa: 'بازی‌ها و سرگرمی', name: 'تنظیمات و جوایز بازی‌ها', desc: 'فعال/غیرفعال‌سازی بازی‌ها و ضریب امتیازات' },

  // 9. تورنمنت‌ها و براکت‌ها
  { id: 'tournaments.view', module: 'tournaments', moduleFa: 'تورنمنت‌ها و لیگ‌ها', name: 'مشاهده تورنمنت‌ها', desc: 'مشاهده براکت‌ها، بازیکنان و جوایز هفتگی' },
  { id: 'tournaments.manage', module: 'tournaments', moduleFa: 'تورنمنت‌ها و لیگ‌ها', name: 'برگزاری و قرعه‌کشی تورنمنت', desc: 'زمان‌بندی، ثبت برندگان و اهداء مدال‌ها' },

  // 10. اقتصاد، سکه و اسکین‌ها
  { id: 'economy.view', module: 'economy', moduleFa: 'اقتصاد و اسکین‌ها', name: 'مشاهده تراز اقتصادی', desc: 'بررسی گردش سکه، الماس و خریدها' },
  { id: 'economy.adjust', module: 'economy', moduleFa: 'اقتصاد و اسکین‌ها', name: 'شارژ و کسر ارز بازی', desc: 'افزودن یا کسر دستی سکه و الماس به کاربران' },
  { id: 'economy.skins', module: 'economy', moduleFa: 'اقتصاد و اسکین‌ها', name: 'مدیریت و قیمت‌گذاری اسکین‌ها', desc: 'افزودن و تغییر قیمت خودروها و موتورها' },

  // 11. جوایز و صندوق‌ها
  { id: 'rewards.view', module: 'rewards', moduleFa: 'جوایز و صندوق‌ها', name: 'مشاهده سیستم پاداش', desc: 'مشاهده جوایز روزانه و لاگین' },
  { id: 'rewards.manage', module: 'rewards', moduleFa: 'جوایز و صندوق‌ها', name: 'تنظیم شانس گردونه و هدایا', desc: 'تغییر شانس آیتم‌های گردونه و صندوق‌های جوایز' },

  // 12. اشتراک‌ها و فیش‌های بانکی
  { id: 'subscriptions.view', module: 'subscriptions', moduleFa: 'اشتراک‌ها و فیش‌ها', name: 'مشاهده پلن‌ها و فیش‌های ارسالی', desc: 'بررسی درخواست‌های خرید اشتراک VIP' },
  { id: 'subscriptions.approve', module: 'subscriptions', moduleFa: 'اشتراک‌ها و فیش‌ها', name: 'تایید یا رد فیش‌های بانکی', desc: 'بررسی رسید کارت‌به‌کارت و فعال‌سازی اکانت' },
  { id: 'subscriptions.manage', module: 'subscriptions', moduleFa: 'اشتراک‌ها و فیش‌ها', name: 'اعطای دستی اشتراک VIP', desc: 'تخصیص یا لغو اشتراک طلایی به کاربران' },

  // 13. مرکز فرماندهی سئو
  { id: 'seo.view', module: 'seo', moduleFa: 'سئو و رتبه گوگل', name: 'مشاهده داشبورد سئو', desc: 'مشاهده متاتگ‌ها و کلمات کلیدی' },
  { id: 'seo.edit', module: 'seo', moduleFa: 'سئو و رتبه گوگل', name: 'مدیریت تگ‌ها و سایت‌مپ', desc: 'ویرایش ساختار سئو و توضیحات موتورهای جستجو' },

  // 14. نظارت بر چت‌ها
  { id: 'chat.view', module: 'chat', moduleFa: 'نظارت بر چت‌ها', name: 'مشاهده لاگ پیام‌های چت', desc: 'بررسی گفتگوی لابی و مسابقات زنده' },
  { id: 'chat.moderate', module: 'chat', moduleFa: 'نظارت بر چت‌ها', name: 'مدیریت پیام و مسدودسازی چت', desc: 'حذف پیام نامناسب و بستن چت کاربر' },

  // 15. لاگ‌های امنیتی و ممیزی
  { id: 'audit.view', module: 'audit', moduleFa: 'لاگ‌های امنیتی و ممیزی', name: 'مشاهده لاگ‌های امنیتی', desc: 'بررسی ردپای تغییرات و ورودهای مدیریتی' },

  // 16. پیام‌رسانی و اعلان‌ها
  { id: 'messages.manage', module: 'communication', moduleFa: 'پیام‌رسانی و اعلان‌ها', name: 'ارسال پیام سراسری و خصوصی', desc: 'امکان ارسال پیام رسمی مدیریت به همه کاربران یا کاربر خاص با نمایش پاپ‌آپ' },

  // 16. پشتیبان‌گیری و دیتابیس
  { id: 'backup.manage', module: 'backup', moduleFa: 'پشتیبان‌گیری و دیتابیس', name: 'پشتیبان‌گیری و بازیابی', desc: 'ایجاد نسخه پشتیبان یا بازگردانی فایل‌های دیتابیس' },
];

export default function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [subAdmins, setSubAdmins] = useState<SubAdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'admins' | 'permissions'>('admins');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<SubAdminUser | null>(null);

  // Form State
  const [formDisplayName, setFormDisplayName] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formMobile, setFormMobile] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formAdminTitle, setFormAdminTitle] = useState<string>('مدیر فرعی');
  const [formRole, setFormRole] = useState<'ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER' | 'ECONOMY_MANAGER'>('ADMIN');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<SubAdminUser | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sub-admins');
      if (res.ok) {
        const data = await res.json();
        setSubAdmins(data);
      }
    } catch (err) {
      console.warn('Failed to load sub-admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setFormDisplayName('');
    setFormUsername('');
    setFormPassword('');
    setFormMobile('');
    setFormEmail('');
    setFormAdminTitle('ناظر مسابقات و پیست‌ها');
    setFormRole('ADMIN');
    // Default helpful starter permissions (Dashboard + Races)
    setFormPermissions(['dashboard.view', 'races.view', 'races.manage']);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (admin: SubAdminUser) => {
    setEditingAdmin(admin);
    setFormDisplayName(admin.displayName || '');
    setFormUsername(admin.username || '');
    setFormPassword(''); // blank unless changing
    setFormMobile(admin.mobile || '');
    setFormEmail(admin.email || '');
    setFormAdminTitle(admin.adminTitle || 'مدیر فرعی');
    setFormRole((admin.role as any) || 'ADMIN');
    setFormPermissions(admin.permissions || []);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Toggle single permission
  const handleTogglePerm = (permId: string) => {
    setFormPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Toggle all permissions of a module
  const handleToggleModule = (moduleKey: string) => {
    const modulePermIds = ALL_PERMISSIONS.filter((p) => p.module === moduleKey).map((p) => p.id);
    const allSelected = modulePermIds.every((id) => formPermissions.includes(id));
    if (allSelected) {
      // Unselect all in module
      setFormPermissions((prev) => prev.filter((id) => !modulePermIds.includes(id)));
    } else {
      // Select all in module
      setFormPermissions((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    }
  };

  // Quick Preset Handlers
  const handleSelectAll = () => {
    setFormPermissions(ALL_PERMISSIONS.map((p) => p.id));
  };

  const handleClearAll = () => {
    setFormPermissions([]);
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'race_referee') {
      setFormAdminTitle('داور و ناظر مسابقات زنده');
      setFormPermissions(['dashboard.view', 'races.view', 'races.manage', 'races.referee', 'chat.view', 'chat.moderate', 'users.view', 'users.ban']);
    } else if (presetName === 'content_manager') {
      setFormAdminTitle('مدیر محتوا، دروس و قرآن');
      setFormPermissions(['dashboard.view', 'content.view', 'content.edit', 'lessons.view', 'lessons.edit', 'seo.view', 'seo.edit']);
    } else if (presetName === 'financial_auditor') {
      setFormAdminTitle('حسابرس مالی، سفارشات و فیش‌ها');
      setFormPermissions(['dashboard.view', 'orders.view', 'orders.status', 'orders.escrow', 'subscriptions.view', 'subscriptions.approve', 'economy.view']);
    } else if (presetName === 'support_agent') {
      setFormAdminTitle('کارشناس پشتیبانی و کاربران');
      setFormPermissions(['dashboard.view', 'users.view', 'users.edit', 'chat.view', 'chat.moderate', 'orders.view']);
    }
    showToast(`قالب دسترسی‌های «${presetName}» با موفقیت فعال شد.`);
  };

  // Submit Save
  const handleSaveSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) {
      showToast('⚠️ نام کاربری نمی‌تواند خالی باشد.');
      return;
    }
    if (!editingAdmin && !formPassword.trim()) {
      showToast('⚠️ تعیین گذرواژه برای ادمین جدید الزامی است.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingAdmin) {
        // Edit existing
        const payload: any = {
          displayName: formDisplayName.trim(),
          username: formUsername.trim(),
          mobile: formMobile.trim(),
          email: formEmail.trim(),
          adminTitle: formAdminTitle.trim(),
          role: formRole,
          permissions: formPermissions,
        };
        if (formPassword.trim()) {
          payload.password = formPassword.trim();
        }

        const res = await fetch(`/api/admin/sub-admins/${editingAdmin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast(`✅ دسترسی‌ها و مشخصات ادمین «${formDisplayName || formUsername}» با موفقیت به‌روزرسانی شد.`);
          setIsModalOpen(false);
          fetchSubAdmins();
        } else {
          const err = await res.json();
          showToast(`❌ خطا: ${err.message || 'عملیات با خطا مواجه شد'}`);
        }
      } else {
        // Create new
        const payload = {
          displayName: formDisplayName.trim(),
          username: formUsername.trim(),
          password: formPassword.trim(),
          mobile: formMobile.trim(),
          email: formEmail.trim(),
          adminTitle: formAdminTitle.trim(),
          role: formRole,
          permissions: formPermissions,
        };

        const res = await fetch('/api/admin/sub-admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showToast(`🎉 ادمین فرعی جدید «${formDisplayName || formUsername}» با موفقیت ایجاد و مجوزها فعال شدند.`);
          setIsModalOpen(false);
          fetchSubAdmins();
        } else {
          const err = await res.json();
          showToast(`❌ خطا: ${err.message || 'ثبت ادمین ناموفق بود'}`);
        }
      }
    } catch (err: any) {
      showToast(`❌ خطای غیرمنتظره: ${err?.message || 'برقراری ارتباط با سرور برقرار نشد'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Sub Admin
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/sub-admins/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`🗑️ حساب ادمین «${deleteTarget.displayName || deleteTarget.username}» حذف گردید.`);
        setDeleteTarget(null);
        fetchSubAdmins();
      } else {
        const err = await res.json();
        showToast(`❌ خطا: ${err.message || 'امکان حذف این ادمین وجود ندارد'}`);
      }
    } catch (err: any) {
      showToast(`❌ خطا در حذف: ${err.message}`);
    }
  };

  // Group permissions by module
  const groupedPermissions = React.useMemo(() => {
    const map = new Map<string, { moduleFa: string; items: GranularPermission[] }>();
    for (const p of ALL_PERMISSIONS) {
      if (!map.has(p.module)) {
        map.set(p.module, { moduleFa: p.moduleFa, items: [] });
      }
      map.get(p.module)!.items.push(p);
    }
    return Array.from(map.entries());
  }, []);

  const filteredAdmins = subAdmins.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (a.displayName && a.displayName.toLowerCase().includes(q)) ||
      (a.username && a.username.toLowerCase().includes(q)) ||
      (a.mobile && a.mobile.includes(q)) ||
      (a.adminTitle && a.adminTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans select-none" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-xs transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 font-black text-[10px] tracking-wide">
                RBAC MATRIX & SUB-ADMINS
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-bold text-slate-500">مدیریت مدیران فرعی سامانه</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              تعریف ادمین‌های فرعی و تعیین ریز به ریز سطوح دسترسی
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              مدیر ارشد می‌تواند برای هر ادمین فرعی نام کاربری، رمز و شماره تماس تعریف کرده و مشخص کند دقیقاً به کدام ماژول‌ها و بخش‌های پنل دسترسی داشته باشد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchSubAdmins}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-xs transition"
            title="بروزرسانی لیست ادمین‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 transition active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>افزودن ادمین فرعی جدید</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-bold block">کل مدیران ثبت‌شده</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{subAdmins.length}</span>
            <span className="text-[10px] text-slate-500 font-bold">ادمین فعال</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-bold block">مدیران ارشد (Super Admin)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600 font-mono">
              {subAdmins.filter((a) => a.role === 'SUPER_ADMIN').length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">دسترسی نامحدود</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-bold block">ادمین‌های فرعی تخصصی</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 font-mono">
              {subAdmins.filter((a) => a.role !== 'SUPER_ADMIN').length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">دارای مجوزهای خاص</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-bold block">ماژول‌ها و اختیارات ریز</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{ALL_PERMISSIONS.length}</span>
            <span className="text-[10px] text-slate-500 font-bold">در ۱۶ ماژول مجزا</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>فهرست مدیران و ادمین‌های فرعی ({subAdmins.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'permissions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>کاتالوگ ۱۶ ماژول و مجوزهای جزئی ({ALL_PERMISSIONS.length})</span>
          </button>
        </div>

        {activeTab === 'admins' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، یوزر، موبایل یا سمت..."
              className="w-full text-xs pr-9 pl-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 bg-slate-50 focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* TAB 1: SUB-ADMINS LIST */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">در حال دریافت فهرست ادمین‌ها و مجوزهای امنیتی...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-black text-sm text-slate-800">هیچ ادمینی با این مشخصات یافت نشد</h3>
                <p className="text-xs text-slate-400">می‌توانید با کلیک روی دکمه زیر، اولین ادمین فرعی را ایجاد کنید.</p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition"
              >
                افزودن ادمین فرعی
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAdmins.map((admin) => {
                const isSuper = admin.role === 'SUPER_ADMIN';
                const permCount = isSuper ? ALL_PERMISSIONS.length : (admin.permissions?.length || 0);

                return (
                  <div
                    key={admin.id}
                    className={`bg-white rounded-3xl p-5 border transition-all duration-200 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                      isSuper
                        ? 'border-red-200 hover:border-red-400'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {/* Top Accent Ribbon */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        isSuper
                          ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600'
                      }`}
                    />

                    <div className="space-y-3 pt-1">
                      {/* Avatar, Name & Title */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={admin.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${admin.username}`}
                            alt={admin.displayName}
                            className="w-12 h-12 rounded-2xl bg-slate-100 p-1 border border-slate-200 shadow-xs shrink-0 object-cover"
                          />
                          <div>
                            <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                              <span>{admin.displayName || admin.username}</span>
                              {isSuper && (
                                <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[9px] font-black">
                                  ارشد
                                </span>
                              )}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                              {admin.adminTitle || (isSuper ? 'مدیر کل و مالک سامانه' : 'ادمین فرعی')}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            admin.isBanned
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {admin.isBanned ? 'مسدود شده' : 'فعال'}
                        </span>
                      </div>

                      {/* Credentials Box */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-[11px] text-slate-400 font-bold">نام کاربری (یوزر):</span>
                          <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {admin.username}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-[11px] text-slate-400 font-bold">شماره تماس / موبایل:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {admin.mobile || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Permissions Summary Gauge */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-bold text-slate-500">اختیارات و مجوزهای فعال:</span>
                          <span className="font-mono font-black text-xs text-blue-700">
                            {isSuper ? '۳۸ از ۳۸ (۱۰۰٪ تام)' : `${permCount} از ${ALL_PERMISSIONS.length}`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSuper
                                ? 'bg-gradient-to-r from-red-600 to-rose-500 w-full'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                            }`}
                            style={{ width: `${Math.round((permCount / ALL_PERMISSIONS.length) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Chips of Allowed Modules */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {isSuper ? (
                          <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 text-[10px] font-black border border-red-200/80">
                            ★ دسترسی تام به تمامی ۱۶ ماژول و خزانه‌داری
                          </span>
                        ) : admin.permissions && admin.permissions.length > 0 ? (
                          Array.from(new Set(admin.permissions.map((p) => p.split('.')[0]))).map((modKey) => {
                            const modFa = ALL_PERMISSIONS.find((p) => p.module === modKey)?.moduleFa || modKey;
                            return (
                              <span
                                key={modKey}
                                className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[9.5px] font-bold border border-blue-200/70"
                              >
                                {modFa}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">بدون مجوز دسترسی فعال</span>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditModal(admin)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                        <span>ویرایش دسترسی‌ها و رمز</span>
                      </button>

                      {!isSuper && (
                        <button
                          onClick={() => setDeleteTarget(admin)}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 border border-rose-200"
                          title="حذف ادمین فرعی"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GRANULAR PERMISSIONS DIRECTORY (16 MODULES) */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-xl space-y-2">
            <h2 className="text-lg sm:text-xl font-black">ماتریس کامل ۱۶ ماژول و مجوزهای جزئی سامانه تایپرو</h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              این مجوزها توسط مدیر ارشد به ادمین‌های فرعی اختصاص می‌یابند. چنانچه ادمینی مجوزی را نداشته باشد، دکمه و دسترسی مربوطه در کل پنل برای او مسدود خواهد بود.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groupedPermissions.map(([moduleKey, group]) => (
              <div
                key={moduleKey}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center border border-blue-100">
                      {group.items.length}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{group.moduleFa}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{moduleKey}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.items.map((perm) => (
                    <div
                      key={perm.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{perm.name}</span>
                        <code className="text-[9.5px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                          {perm.id}
                        </code>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-normal">{perm.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUB-ADMIN WITH GRANULAR PERMISSIONS                      */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingAdmin ? `ویرایش ادمین فرعی: ${editingAdmin.displayName || editingAdmin.username}` : 'افزودن ادمین فرعی جدید و تعیین سطح دسترسی'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    مشخصات کاربری، رمز عبور و مجوزهای دقیق دسترسی به بخش‌های مختلف پنل مدیریت
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveSubAdmin} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* SECTION 1: CREDENTIALS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Fingerprint className="w-4 h-4 text-blue-600" />
                  <span>۱. مشخصات کاربری و اطلاعات ورود ادمین فرعی</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {/* Display Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      نام و نام خانوادگی (نمایشی): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      placeholder="مثال: علی رضایی"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 font-medium"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      نام کاربری جهت لاگین (یوزر): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="مثال: ali_admin"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 font-mono font-bold"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {editingAdmin ? 'تغییر رمز عبور (در صورت خالی بودن تغییر نمی‌کند):' : 'گذرواژه ورود (پسورد): *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingAdmin}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={editingAdmin ? 'بدون تغییر (اختیاری)' : 'رمز حداقل ۶ کاراکتر'}
                        className="w-full pr-3 pl-9 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      شماره همراه / تماس: <span className="text-slate-400 text-[10px]">(برای لاگین با شماره)</span>
                    </label>
                    <input
                      type="text"
                      value={formMobile}
                      onChange={(e) => setFormMobile(e.target.value)}
                      placeholder="مثال: 09121234567"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 font-mono font-medium"
                    />
                  </div>

                  {/* Admin Title / Role Description */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      سمت سازمانی / عنوان ادمین:
                    </label>
                    <input
                      type="text"
                      value={formAdminTitle}
                      onChange={(e) => setFormAdminTitle(e.target.value)}
                      placeholder="مثال: ناظر مسابقات زنده پیست"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      پست الکترونیک (ایمیل): <span className="text-slate-400 text-[10px]">(اختیاری)</span>
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="admin@typro.ir"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-red-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: GRANULAR PERMISSION SELECTOR */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>۲. تعیین سطح دسترسی‌ها جزء به جزء و ریز به ریز ({formPermissions.length} مجوز فعال)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      تیک هر بخشی را بزنید، ادمین فرعی به همان ماژول و عملیات دسترسی خواهد داشت.
                    </p>
                  </div>

                  {/* Quick Action Presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10.5px] hover:bg-emerald-100"
                    >
                      انتخاب همه
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10.5px] hover:bg-slate-200"
                    >
                      حذف همه
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('race_referee')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10.5px] hover:bg-blue-100"
                    >
                      قالب ناظر مسابقات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('content_manager')}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10.5px] hover:bg-purple-100"
                    >
                      قالب مدیر محتوا
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('financial_auditor')}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10.5px] hover:bg-amber-100"
                    >
                      قالب مالی و فیش‌ها
                    </button>
                  </div>
                </div>

                {/* 16 Modules Grid with Granular Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedPermissions.map(([moduleKey, group]) => {
                    const modulePermIds = group.items.map((p) => p.id);
                    const selectedCount = modulePermIds.filter((id) => formPermissions.includes(id)).length;
                    const isAllSelected = selectedCount === modulePermIds.length;
                    const isSomeSelected = selectedCount > 0 && !isAllSelected;

                    return (
                      <div
                        key={moduleKey}
                        className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                          selectedCount > 0
                            ? 'border-blue-200 bg-blue-50/20'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {/* Module Header Bar */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <button
                            type="button"
                            onClick={() => handleToggleModule(moduleKey)}
                            className="flex items-center gap-2 font-black text-xs text-slate-800 hover:text-blue-600 cursor-pointer"
                          >
                            <div className="w-5 h-5 rounded-md flex items-center justify-center border text-white transition-colors bg-blue-600 border-blue-600">
                              {isAllSelected ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : isSomeSelected ? (
                                <span className="w-2 h-0.5 bg-white" />
                              ) : (
                                <span className="opacity-0" />
                              )}
                            </div>
                            <span>ماژول {group.moduleFa}</span>
                          </button>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {selectedCount} از {modulePermIds.length} فعال
                          </span>
                        </div>

                        {/* Granular Checkboxes inside this module */}
                        <div className="space-y-1.5 pr-2">
                          {group.items.map((perm) => {
                            const isChecked = formPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2 rounded-xl transition cursor-pointer ${
                                  isChecked
                                    ? 'bg-blue-50/70 text-blue-950 font-bold'
                                    : 'hover:bg-slate-50 text-slate-600 font-medium'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePerm(perm.id)}
                                  className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                                />
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs">{perm.name}</span>
                                    <code className="text-[9px] font-mono text-slate-400">
                                      {perm.id.split('.')[1]}
                                    </code>
                                  </div>
                                  <p className="text-[10.5px] text-slate-400 leading-tight">
                                    {perm.desc}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Submit Footer */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10 shadow-lg">
                <div className="text-xs text-slate-500">
                  <span>تعداد کل دسترسی‌های تعیین‌شده: </span>
                  <strong className="text-slate-900 font-black font-mono">{formPermissions.length}</strong>
                  <span> از {ALL_PERMISSIONS.length} مجوز جزئی</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-md shadow-red-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'در حال ثبت...' : editingAdmin ? 'ذخیره تغییرات دسترسی ادمین' : 'تایید و ایجاد ادمین فرعی'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM DELETE MODAL                                                      */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900">
                حذف حساب ادمین فرعی «{deleteTarget.displayName || deleteTarget.username}»؟
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                با حذف این ادمین، دسترسی ایشان به تمامی بخش‌های پنل مدیریت سلب خواهد شد. آیا مطمئن هستید؟
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-md shadow-rose-600/20"
              >
                بله، حذف کن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
