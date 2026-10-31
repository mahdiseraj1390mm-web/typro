'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER' | 'ECONOMY_MANAGER' | 'USER';

export interface User {
  id: string;
  mobile: string;
  email?: string;
  googleId?: string;
  username: string;
  displayName: string;
  bio?: string;
  role: UserRole;
  adminTitle?: string;
  permissions?: string[];
  level: number;
  xp: number;
  coins: number;
  diamonds?: number;
  banknotes: number;
  profileCompletion: number;
  avatar?: string;
  workplace?: string;
  gender?: string;
  workplaceAddress?: string;
  isSubscribed?: boolean;
  subscription?: string;
  subscriptionTier?: string;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  isDirectAdmin?: boolean;
  subscriptionMethod?: string;
  rewardsState?: {
    lastDailyChest?: number;
    lastWeeklyChest?: number;
    lastMonthlyChest?: number;
    lastYearlyChest?: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOtp: (mobile: string, code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleData: { email: string; name?: string; googleId?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  requestOtp: (mobile: string) => Promise<{ success: boolean; error?: string }>;
  registerInit: (mobile: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (mobile: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  adminLogin: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4000');

const DEFAULT_ADMIN_USER: User = {
  id: 'usr-admin',
  mobile: '09121112233',
  username: 'typro_admin',
  displayName: 'مدیر ارشد سامانه تایپرو',
  bio: 'مدیریت و نظارت یکپارچه بر سیستم‌های رقابت، اقتصاد و محتوا',
  role: 'SUPER_ADMIN',
  level: 100,
  xp: 100000,
  coins: 50000,
  banknotes: 5000,
  profileCompletion: 100,
};

const DEFAULT_REGULAR_USER: User = {
  id: 'usr-regular',
  mobile: '09120000000',
  username: 'typro_user',
  displayName: 'کاربر تایپرو',
  bio: 'علاقه‌مند به یادگیری تایپ ده‌انگشتی و افزایش سرعت',
  role: 'USER',
  level: 1,
  xp: 0,
  coins: 0,
  diamonds: 0,
  banknotes: 0,
  profileCompletion: 80,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('typro_token');
      const savedUser = localStorage.getItem('typro_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        // Ensure regular user has 0 coins and 0 diamonds initially if mock or newly created
        if (parsed.role === 'USER') {
          if (parsed.displayName && (parsed.displayName === 'علیرضا رضایی' || parsed.displayName === 'علی رضایی' || parsed.displayName.includes('رضایی'))) {
            parsed.displayName = 'کاربر تایپرو';
            localStorage.setItem('typro_profile_name', 'کاربر تایپرو');
          }
          if (parsed.username && (parsed.username === 'ali_speed' || parsed.username === 'ali_rezaei')) {
            parsed.username = 'typro_user';
          }
          localStorage.setItem('typro_user', JSON.stringify(parsed));
        }
        setUser(parsed);

        // Background sync user VIP subscription, XP, Level & notifications from database
        const syncUserFromServer = () => {
          const userIdentifier = parsed.id || parsed.username || parsed.mobile;
          if (!userIdentifier) return;
          fetch(`${API_BASE}/auth/status/${encodeURIComponent(userIdentifier)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((statusData) => {
              if (statusData && typeof statusData === 'object') {
                const isSub = Boolean(statusData.isSubscribed);
                const planName = statusData.subscriptionPlan || statusData.subscription || (isSub ? 'VIP طلایی' : 'رایگان');
                const expiresAt = statusData.subscriptionExpiresAt;
                const isDirect = Boolean(statusData.isDirectAdmin || statusData.subscriptionMethod === 'direct_admin');

                setUser((prev) => {
                  if (!prev) return prev;
                  const newXp = typeof statusData.xp === 'number' ? statusData.xp : prev.xp;
                  const newLevel = typeof statusData.level === 'number' ? statusData.level : (typeof newXp === 'number' ? Math.max(1, Math.floor(newXp / 100) + 1) : prev.level);
                  const newCoins = typeof statusData.coins === 'number' ? statusData.coins : prev.coins;
                  const newDiamonds = typeof statusData.diamonds === 'number' ? statusData.diamonds : prev.diamonds;

                  const merged = {
                    ...prev,
                    xp: newXp,
                    level: newLevel,
                    coins: newCoins,
                    diamonds: newDiamonds,
                    isSubscribed: isSub,
                    subscription: planName,
                    subscriptionPlan: planName,
                    subscriptionTier: statusData.subscriptionTier || (isSub ? 'VIP' : 'FREE'),
                    subscriptionExpiresAt: expiresAt,
                    isDirectAdmin: isDirect,
                    subscriptionMethod: isDirect ? 'direct_admin' : (statusData.subscriptionMethod || prev.subscriptionMethod),
                  };
                  try {
                    localStorage.setItem('typro_user', JSON.stringify(merged));
                  } catch {}
                  return merged;
                });

                if (typeof statusData.xp === 'number') {
                  localStorage.setItem('typro_user_xp', String(statusData.xp));
                  localStorage.setItem('typro_user_level', String(statusData.level || Math.max(1, Math.floor(statusData.xp / 100) + 1)));
                }
                if (typeof statusData.coins === 'number') {
                  localStorage.setItem('typro_user_coins', String(statusData.coins));
                }
                if (typeof statusData.diamonds === 'number') {
                  localStorage.setItem('typro_user_diamonds', String(statusData.diamonds));
                }
                window.dispatchEvent(new Event('typro_economy_updated'));

                if (isSub) {
                  localStorage.setItem('typro_user_is_subscribed', 'true');
                  localStorage.setItem('typro_user_subscription', planName);
                  if (isDirect) {
                    localStorage.setItem('typro_user_is_direct_admin', 'true');
                  }
                  if (expiresAt) {
                    localStorage.setItem('typro_user_sub_expires_at', expiresAt);
                  }
                } else if (statusData.isSubscribed === false) {
                  localStorage.setItem('typro_user_is_subscribed', 'false');
                  localStorage.removeItem('typro_user_subscription');
                  localStorage.removeItem('typro_user_is_direct_admin');
                }

                // Sync notifications from database
                if (Array.isArray(statusData.notifications) && statusData.notifications.length > 0) {
                  try {
                    const rawLocal = localStorage.getItem('typro_user_notifications');
                    const localList = rawLocal ? JSON.parse(rawLocal) : [];
                    const map = new Map();
                    statusData.notifications.forEach((n: any) => map.set(n.id, n));
                    localList.forEach((n: any) => {
                      if (!map.has(n.id)) map.set(n.id, n);
                    });
                    const mergedNotifs = Array.from(map.values());
                    localStorage.setItem('typro_user_notifications', JSON.stringify(mergedNotifs));
                    window.dispatchEvent(new Event('typro_notifications_updated'));
                  } catch {}
                }

                window.dispatchEvent(new Event('typro_subscription_updated'));
              }
            })
            .catch(() => {});
        };

        syncUserFromServer();
        const pollInterval = setInterval(syncUserFromServer, 6000);
        window.addEventListener('focus', syncUserFromServer);

        // ── اسکین‌های پیش‌فرض رایگان: حداقل ۲ اسکین برای کاربر/مهمان ──
        const DEFAULT_SKIN_1 = 'skin-vw-beetle';
        const DEFAULT_SKIN_2 = 'skin-paykan';
        const rawOwned = localStorage.getItem('typro_owned_skins');
        let owned: string[] = rawOwned ? JSON.parse(rawOwned) : [];
        if (!owned.includes(DEFAULT_SKIN_1)) owned.unshift(DEFAULT_SKIN_1);
        if (!owned.includes(DEFAULT_SKIN_2)) owned.push(DEFAULT_SKIN_2);
        localStorage.setItem('typro_owned_skins', JSON.stringify(owned));

        const currentEquipped = localStorage.getItem('typro_equipped_skin');
        if (!currentEquipped) {
          localStorage.setItem('typro_equipped_skin', DEFAULT_SKIN_1);
        }
        // ─────────────────────────────────────────────────────────────────────

      } else {
        // Guest user: preserve earned coins and diamonds

        // Ensure guest user ALSO has at least 2 skins available and 1 selected
        const DEFAULT_SKIN_1 = 'skin-vw-beetle';
        const DEFAULT_SKIN_2 = 'skin-paykan';
        const rawOwned = localStorage.getItem('typro_owned_skins');
        let owned: string[] = rawOwned ? JSON.parse(rawOwned) : [];
        if (!owned.includes(DEFAULT_SKIN_1)) owned.unshift(DEFAULT_SKIN_1);
        if (!owned.includes(DEFAULT_SKIN_2)) owned.push(DEFAULT_SKIN_2);
        localStorage.setItem('typro_owned_skins', JSON.stringify(owned));

        const currentEquipped = localStorage.getItem('typro_equipped_skin');
        if (!currentEquipped) {
          localStorage.setItem('typro_equipped_skin', DEFAULT_SKIN_1);
        }
      }
    } catch (e) {
      console.error('Failed to load auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to economy events (earned coins/xp/diamonds from race rounds & typing tests)
  useEffect(() => {
    const handleEconomyUpdate = () => {
      if (typeof window === 'undefined') return;
      const storedCoins = Number(localStorage.getItem('typro_user_coins') || '0');
      const storedDiamonds = Number(localStorage.getItem('typro_user_diamonds') || '0');
      const storedXp = Number(localStorage.getItem('typro_user_xp') || '0');
      const storedLevel = Number(localStorage.getItem('typro_user_level') || '0');

      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        const newCoins = storedCoins > 0 ? storedCoins : prevUser.coins;
        const newDiamonds = storedDiamonds >= 0 ? storedDiamonds : prevUser.diamonds;
        const newXp = storedXp > 0 ? storedXp : Math.max(prevUser.xp || 0, newCoins);
        const newLevel = storedLevel > 0 ? storedLevel : Math.max(prevUser.level || 1, Math.floor(newXp / 100) + 1);

        const updated = {
          ...prevUser,
          coins: newCoins,
          diamonds: newDiamonds,
          xp: newXp,
          level: newLevel,
        };
        try {
          localStorage.setItem('typro_user', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    };

    window.addEventListener('typro_economy_updated', handleEconomyUpdate);
    window.addEventListener('typro_currency_updated', handleEconomyUpdate);
    window.addEventListener('storage', handleEconomyUpdate);
    return () => {
      window.removeEventListener('typro_economy_updated', handleEconomyUpdate);
      window.removeEventListener('typro_currency_updated', handleEconomyUpdate);
      window.removeEventListener('storage', handleEconomyUpdate);
    };
  }, []);


  const saveSession = (newToken: string, newUser: User) => {
    // Strictly isolate user account data: Use newUser's actual values from database!
    // A fresh/new user starts with 0 coins, 0 diamonds, 0 XP, Level 1.
    const resolvedCoins = typeof newUser.coins === 'number' ? newUser.coins : 0;
    const resolvedDiamonds = typeof newUser.diamonds === 'number' ? newUser.diamonds : 0;
    const resolvedXp = typeof newUser.xp === 'number' ? newUser.xp : resolvedCoins;
    const resolvedLevel = typeof newUser.level === 'number' && newUser.level > 0 ? newUser.level : Math.max(1, Math.floor(resolvedXp / 100) + 1);

    const fullUser: User = {
      ...newUser,
      coins: resolvedCoins,
      diamonds: resolvedDiamonds,
      xp: resolvedXp,
      level: resolvedLevel,
    };

    setToken(newToken);
    setUser(fullUser);

    try {
      localStorage.setItem('typro_token', newToken);
      localStorage.setItem('typro_user', JSON.stringify(fullUser));
      localStorage.setItem('typro_user_coins', String(resolvedCoins));
      localStorage.setItem('typro_user_diamonds', String(resolvedDiamonds));
      localStorage.setItem('typro_user_xp', String(resolvedXp));
      localStorage.setItem('typro_user_level', String(resolvedLevel));
      localStorage.setItem('typro_user_id', fullUser.id);
      localStorage.setItem('typro_username', fullUser.username);
      if (fullUser.displayName) {
        localStorage.setItem('typro_profile_name', fullUser.displayName);
      }

      const isUserSubscribed = Boolean(
        fullUser.isSubscribed ||
        (fullUser.subscription && fullUser.subscription !== 'رایگان') ||
        (fullUser.subscriptionPlan && fullUser.subscriptionPlan !== 'رایگان') ||
        (fullUser.subscriptionExpiresAt && new Date(fullUser.subscriptionExpiresAt).getTime() > Date.now())
      );

      if (isUserSubscribed) {
        localStorage.setItem('typro_user_is_subscribed', 'true');
        localStorage.setItem('typro_user_subscription', fullUser.subscriptionPlan || fullUser.subscription || 'VIP طلایی');
        if (fullUser.subscriptionExpiresAt) {
          localStorage.setItem('typro_user_sub_expires_at', fullUser.subscriptionExpiresAt);
        }
      } else {
        localStorage.removeItem('typro_user_is_subscribed');
        localStorage.removeItem('typro_user_subscription');
        localStorage.removeItem('typro_user_sub_expires_at');
      }

      window.dispatchEvent(new Event('typro_economy_updated'));

      // ── اسکین‌های پیش‌فرض رایگان (حداقل ۲ اسکین) ─────────────────────────
      const DEFAULT_SKIN_1 = 'skin-vw-beetle';
      const DEFAULT_SKIN_2 = 'skin-paykan';
      const rawOwned = localStorage.getItem('typro_owned_skins');
      let owned: string[] = rawOwned ? JSON.parse(rawOwned) : [];
      if (!owned.includes(DEFAULT_SKIN_1)) owned.unshift(DEFAULT_SKIN_1);
      if (!owned.includes(DEFAULT_SKIN_2)) owned.push(DEFAULT_SKIN_2);
      localStorage.setItem('typro_owned_skins', JSON.stringify(owned));

      const currentEquipped = localStorage.getItem('typro_equipped_skin');
      if (!currentEquipped) {
        localStorage.setItem('typro_equipped_skin', DEFAULT_SKIN_1);
      }
      // ─────────────────────────────────────────────────────────────────────

      // ── افزودن/به‌روزرسانی کاربر در لیست ثبت‌نام‌شدگان برای پنل مدیریت ──
      const rawReg = localStorage.getItem('typro_registered_users');
      const regList: any[] = rawReg ? JSON.parse(rawReg) : [];
      const existingIdx = regList.findIndex(
        (u: any) => u.id === fullUser.id || u.mobile === fullUser.mobile || u.username === fullUser.username
      );
      const userRecord = {
        id: fullUser.id,
        username: fullUser.username,
        displayName: fullUser.displayName,
        mobile: fullUser.mobile,
        email: fullUser.email,
        password: '••••••',
        level: fullUser.level || 1,
        coins: fullUser.coins || 0,
        diamonds: fullUser.diamonds || 0,
        status: 'active',
        joinedDate: new Date().toISOString().slice(0, 10),
        gender: fullUser.gender,
        workplace: fullUser.workplace,
        workplaceAddress: fullUser.workplaceAddress,
        bio: fullUser.bio,
      };
      if (existingIdx >= 0) {
        regList[existingIdx] = { ...regList[existingIdx], ...userRecord };
      } else {
        regList.unshift(userRecord);
      }
      localStorage.setItem('typro_registered_users', JSON.stringify(regList));
      // ─────────────────────────────────────────────────────────────────────

    } catch (e) {
      console.error('Failed to persist auth session:', e);
    }
  };

  const logout = () => {
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('typro_token');
      localStorage.removeItem('typro_user');
      localStorage.setItem('typro_user_coins', '0');
      localStorage.setItem('typro_user_diamonds', '0');
      localStorage.setItem('typro_user_xp', '0');
      localStorage.setItem('typro_user_level', '1');
      localStorage.removeItem('typro_profile_name');
      localStorage.removeItem('typro_user_id');
      localStorage.removeItem('typro_username');
      localStorage.removeItem('typro_user_is_subscribed');
      localStorage.removeItem('typro_user_sub_expires_at');
      localStorage.removeItem('typro_races_won');
      localStorage.removeItem('typro_best_wpm');
      localStorage.removeItem('typro_best_accuracy');
      window.dispatchEvent(new Event('typro_economy_updated'));
    } catch (e) {}
  };

  const loginWithPassword = async (identifier: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const data = await res.json();
        saveSession(data.token, data.user);
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.message || 'ورود ناموفق بود.' };
    } catch {
      // Offline fallback for demo accounts
      if (
        (identifier === 'typro_admin' || identifier === '09121112233') &&
        password === 'Typro@Master2026!'
      ) {
        saveSession('mock-admin-token', DEFAULT_ADMIN_USER);
        return { success: true };
      }
      if (
        (identifier === 'typro_user' || identifier === '09120000000') &&
        password === 'user123456'
      ) {
        saveSession('mock-user-token', DEFAULT_REGULAR_USER);
        return { success: true };
      }
      return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
    }
  };

  const adminLogin = async (identifier: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const data = await res.json();
        saveSession(data.token, data.user);
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.message || 'دسترسی مدیریت تایید نشد.' };
    } catch {
      // Offline fallback
      if (
        (identifier === 'typro_admin' || identifier === '09121112233') &&
        password === 'Typro@Master2026!'
      ) {
        saveSession('mock-admin-token', DEFAULT_ADMIN_USER);
        return { success: true };
      }
      return { success: false, error: 'اطلاعات ورود مدیر صحیح نمی‌باشد.' };
    }
  };

  const requestOtp = async (mobile: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      if (res.ok) {
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.message || 'خطا در ارسال کد تایید.' };
    } catch {
      return { success: false, error: 'خطا در برقراری ارتباط با سرور.' };
    }
  };

  const loginWithOtp = async (mobile: string, code: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code }),
      });
      if (res.ok) {
        const data = await res.json();
        saveSession(data.token, data.user);
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.message || 'کد تایید نادرست است.' };
    } catch {
      return { success: false, error: 'خطا در برقراری ارتباط با سرور.' };
    }
  };

  const loginWithGoogle = async ({ email, name, googleId, avatar }: { email: string; name?: string; googleId?: string; avatar?: string }) => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      let loggedUser: User | null = null;
      let loggedToken = `tok_google_${Date.now()}`;

      // 1. Try backend authentication
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, name, googleId, avatar }),
        });
        if (res.ok) {
          const data = await res.json();
          loggedUser = data.user;
          loggedToken = data.token;
        }
      } catch (err) {
        console.warn('Backend google auth unavailable, falling back to persistent client storage', err);
      }

      // 2. Check local account storage by Google email for instant offline/multi-device persistence
      const storageKey = `typro_google_account_${cleanEmail}`;
      const savedGoogleUser = localStorage.getItem(storageKey);

      if (savedGoogleUser) {
        // Retrieve exact same account user had previously with all their coins, diamonds, and stats
        const parsed = JSON.parse(savedGoogleUser);
        loggedUser = {
          ...parsed,
          displayName: name || parsed.displayName,
          avatar: avatar || parsed.avatar,
        };
      } else if (!loggedUser) {
        // Create new account bound to Google with 0 coins and 0 diamonds
        const userPart = cleanEmail.split('@')[0];
        loggedUser = {
          id: `usr-g-${Date.now()}`,
          mobile: '',
          email: cleanEmail,
          googleId: googleId || `gid-${Date.now()}`,
          username: userPart,
          displayName: name || userPart,
          bio: 'کاربر متصل با حساب امن گوگل',
          role: 'USER',
          level: 1,
          xp: 0,
          coins: 0,
          diamonds: 0,
          banknotes: 0,
          profileCompletion: 85,
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        };
      }

      if (!loggedUser) {
        throw new Error('خطا در بارگذاری اطلاعات کاربر');
      }

      // Persist permanently for this Google identity
      localStorage.setItem(storageKey, JSON.stringify(loggedUser));
      saveSession(loggedToken, loggedUser);

      return { success: true };
    } catch (e: any) {
      console.error('Google login error', e);
      return { success: false, error: e?.message || 'خطا در ورود با حساب گوگل' };
    }
  };

  const registerInit = async (mobile: string, username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, username, password }),
      });
      if (res.ok) {
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.message || 'ثبت‌نام ناموفق بود.' };
    } catch {
      return { success: false, error: 'خطا در برقراری ارتباط با سرور.' };
    }
  };

  const forgotPassword = async (mobile: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || `رمز عبور جدید به شماره ${mobile} پیامک شد.` };
      }
      return { success: false, error: data.message || 'خطا در بازیابی رمز عبور.' };
    } catch {
      return { success: false, error: 'خطا در برقراری ارتباط با سرور.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
          identifier: user?.mobile || user?.username,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || 'رمز عبور با موفقیت تغییر یافت.' };
      }
      return { success: false, error: data.message || 'خطا در تغییر رمز عبور.' };
    } catch {
      return { success: false, error: 'خطا در برقراری ارتباط با سرور.' };
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    if (user.email) {
      localStorage.setItem(`typro_google_account_${user.email.toLowerCase().trim()}`, JSON.stringify(updated));
    }
    saveSession(token || 'local-token', updated);

    // Sync to backend if token or mobile exists
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          mobile: updated.mobile,
          displayName: updated.displayName,
          bio: updated.bio,
          avatar: updated.avatar,
          email: updated.email,
        }),
      }).catch(() => {});
    } catch {}
  };

  const isAdmin = Boolean(
    user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'ECONOMY_MANAGER'].includes(user.role)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin,
        isLoading,
        loginWithPassword,
        loginWithOtp,
        loginWithGoogle,
        requestOtp,
        registerInit,
        forgotPassword,
        changePassword,
        adminLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
