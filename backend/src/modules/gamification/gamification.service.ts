import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Optional, Inject } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'speed' | 'accuracy' | 'endurance' | 'quran' | 'social';
  icon: string;
  rewardXp: number;
  rewardDiamonds: number;
}

export interface LeagueTier {
  id: string;
  name: string;
  nameFa: string;
  minWpm: number;
  color: string;
  membersCount: number;
  weeklyPrize: string;
}

@Injectable()
export class GamificationService {
  private achievements: Achievement[] = [
    {
      id: 'ach-first-blood',
      title: 'اولین نبرد پیست',
      description: 'شرکت در اولین مسابقه زنده اتومبیل‌رانی تایپرو و عبور از خط پایان',
      category: 'social',
      icon: 'Flag',
      rewardXp: 100,
      rewardDiamonds: 5,
    },
    {
      id: 'ach-speed-demon',
      title: 'دیو سرعت (۱۰۰+ WPM)',
      description: 'رسیدن به سرعت ثبت شده ۱۰۰ کلمه در دقیقه با حداقل دقت ۹۸٪ در آزمون رسمی',
      category: 'speed',
      icon: 'Zap',
      rewardXp: 500,
      rewardDiamonds: 25,
    },
    {
      id: 'ach-perfect-100',
      title: 'تمرکز مطلق (دقت ۱۰۰٪)',
      description: 'تایپ بی‌نقص یک متن حداقل ۵۰۰ کاراکتری بدون حتی ۱ خطای ثبت شده',
      category: 'accuracy',
      icon: 'Target',
      rewardXp: 250,
      rewardDiamonds: 10,
    },
    {
      id: 'ach-quran-scholar',
      title: 'کاتب وحی',
      description: 'تکمیل تایپ تمام آیات جزء ۳۰ قرآن کریم با رعایت دقیق اعراب و حرکات',
      category: 'quran',
      icon: 'BookOpen',
      rewardXp: 1000,
      rewardDiamonds: 50,
    },
    {
      id: 'ach-streak-30',
      title: 'تداوم پولادین (۳۰ روز متوالی)',
      description: 'حفظ زنجیره تمرین روزانه بدون وقفه به مدت ۳۰ روز در سامانه',
      category: 'endurance',
      icon: 'Flame',
      rewardXp: 750,
      rewardDiamonds: 30,
    },
  ];

  private leagues: LeagueTier[] = [
    {
      id: 'league-grandmaster',
      name: 'Grandmaster',
      nameFa: 'لیگ گرندمستر (ابرقهرمانان)',
      minWpm: 100,
      color: '#DC2626',
      membersCount: 14,
      weeklyPrize: '۵,۰۰۰,۰۰۰ تومان وجه نقد + پوسته افسانه‌ای طلایی',
    },
    {
      id: 'league-master',
      name: 'Master',
      nameFa: 'لیگ مستر',
      minWpm: 80,
      color: '#9333EA',
      membersCount: 42,
      weeklyPrize: '۲,۰۰۰,۰۰۰ تومان وجه نقد + ۵۰ الماس',
    },
    {
      id: 'league-diamond',
      name: 'Diamond',
      nameFa: 'لیگ الماس',
      minWpm: 65,
      color: '#2563EB',
      membersCount: 120,
      weeklyPrize: '۱,۰۰۰,۰۰۰ تومان + ۳۰ الماس',
    },
    {
      id: 'league-platinum',
      name: 'Platinum',
      nameFa: 'لیگ پلاتین',
      minWpm: 50,
      color: '#0891B2',
      membersCount: 350,
      weeklyPrize: '۵۰۰,۰۰۰ تومان + ۲۰ الماس',
    },
    {
      id: 'league-gold',
      name: 'Gold',
      nameFa: 'لیگ طلا',
      minWpm: 35,
      color: '#D97706',
      membersCount: 890,
      weeklyPrize: '۱۰ الماس + ۵۰۰ سکه',
    },
    {
      id: 'league-silver',
      name: 'Silver',
      nameFa: 'لیگ نقره',
      minWpm: 20,
      color: '#64748B',
      membersCount: 2400,
      weeklyPrize: '۵ الماس + ۲۵۰ سکه',
    },
  ];

  constructor(@Optional() private readonly authService?: AuthService) {}

  getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  getUserAchievements(userId: string) {
    // Returns unlocked and locked achievements with progress
    return this.achievements.map((ach, index) => ({
      ...ach,
      isUnlocked: index < 2, // Sample user has first 2 unlocked
      unlockedAt: index < 2 ? '2026-08-20' : null,
      progressPercent: index < 2 ? 100 : index === 2 ? 75 : index === 3 ? 30 : 10,
    }));
  }

  getLeagues(): LeagueTier[] {
    return this.leagues;
  }

  getUserProgress(userId: string) {
    return {
      userId,
      level: 28,
      xp: 14200,
      nextLevelXp: 16000,
      streakDays: 12,
      currentLeague: 'Diamond',
      currentRank: 7,
      totalRacesWon: 34,
      totalCertificates: 1,
    };
  }

  getLeaderboard(period: string = 'day') {
    let usersList: any[] = [];
    if (this.authService) {
      usersList = this.authService.getAllUsers();
    }
    if (!usersList || usersList.length === 0) {
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'users.json'),
        path.join(process.cwd(), 'backend', 'data', 'users.json'),
        path.resolve(__dirname, '..', '..', '..', 'data', 'users.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          try {
            usersList = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          } catch (e) {}
        }
      }
    }

    if (!Array.isArray(usersList) || usersList.length === 0) {
      return [];
    }

    // STRICTLY REAL NORMAL USERS ONLY - EXCLUDE ADMINS & MANAGERS
    const mapped = usersList
      .filter((u) => {
        if (!u || (!u.displayName && !u.username)) return false;
        // Strictly exclude system administrators and general managers
        if (
          u.role === 'SUPER_ADMIN' ||
          u.role === 'ADMIN' ||
          u.id === 'usr-admin' ||
          u.username === 'typro_admin' ||
          (u.displayName && (u.displayName.includes('مدیر کل') || u.displayName.includes('ادمین')))
        ) {
          return false;
        }
        return true;
      })
      .map((u) => {
        // Enforce 1:1 Coin-to-XP baseline parity: Points (XP) equal coins unless spent
        const userCoins = Number(u.coins) || 0;
        const recordedXp = Number(u.xp) || ((Number(u.level) || 1) - 1) * 100;
        const effectiveXp = Math.max(recordedXp, userCoins);
        const level = Math.max(1, Math.floor(effectiveXp / 100) + 1);
        // Strictly return real recorded stats. If not recorded yet, return 0 (no fake 65 / 98.5 defaults)
        const wpm = (u.wpm !== undefined && u.wpm !== null && u.wpm !== '') ? Number(u.wpm) : (u.bestWpm ? Number(u.bestWpm) : 0);
        const accuracy = (u.accuracy !== undefined && u.accuracy !== null && u.accuracy !== '') ? Number(u.accuracy) : (u.bestAccuracy ? Number(u.bestAccuracy) : 0);
        return {
          id: u.id,
          rank: 0,
          displayName: u.displayName || u.username,
          username: u.username || 'user',
          avatar: u.avatar || '',
          level,
          xp: effectiveXp,
          wpm,
          accuracy,
          racesWon: Number(u.racesWon) || 0,
          bio: u.bio || '',
        };
      });

    // Sort descending by XP, then Level
    mapped.sort((a, b) => b.xp - a.xp || b.level - a.level);
    return mapped.map((u, idx) => ({ ...u, rank: idx + 1 }));
  }
  recordProgress(dto: {
    userId?: string;
    username?: string;
    displayName?: string;
    earnedXp?: number;
    earnedCoins?: number;
    earnedDiamonds?: number;
    wonRace?: boolean;
    wpm?: number;
    accuracy?: number;
    lessonId?: string;
    lessonTitle?: string;
    stars?: number;
    currentPath?: string;
  }) {
    if (this.authService) {
      return this.authService.recordUserProgress(dto);
    }

    let usersList: any[] = [];
    let targetPath = path.join(process.cwd(), 'data', 'users.json');
    const altPath = path.join(process.cwd(), 'backend', 'data', 'users.json');

    if (!fs.existsSync(targetPath) && fs.existsSync(altPath)) {
      targetPath = altPath;
    }

    if (fs.existsSync(targetPath)) {
      try {
        usersList = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (e) {
        usersList = [];
      }
    }

    if (!Array.isArray(usersList)) {
      usersList = [];
    }

    let userIdx = -1;
    if (dto.userId) {
      userIdx = usersList.findIndex((u) => u.id === dto.userId || u.username === dto.userId);
    }
    if (userIdx === -1 && dto.username) {
      userIdx = usersList.findIndex((u) => u.username === dto.username);
    }
    if (userIdx === -1 && dto.displayName) {
      userIdx = usersList.findIndex((u) => u.displayName === dto.displayName);
    }

    let user: any = null;
    if (userIdx !== -1) {
      user = usersList[userIdx];
    } else if (dto.userId || dto.username || dto.displayName) {
      const nowTs = Date.now().toString();
      user = {
        id: dto.userId || ('usr-' + nowTs),
        username: dto.username || ('user_' + nowTs.slice(-4)),
        displayName: dto.displayName || dto.username || 'کاربر تایپرو',
        role: 'USER',
        xp: 0,
        level: 1,
        racesWon: 0,
        bestWpm: 0,
        bestAccuracy: 0,
      };
      usersList.push(user);
    }

    if (user) {
      const currentXp = Math.max(Number(user.xp) || 0, Number(user.coins) || 0);
      const addedXp = Math.max(0, Number(dto.earnedXp) || 0);
      const newXp = currentXp + addedXp;
      const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

      user.xp = newXp;
      user.level = newLevel;
      // 1:1 Coins with Points: به ازای هر امتیاز، دقیقاً همان قدر هم سکه دریافت می‌شود
      const addedCoins = Math.max(0, Number(dto.earnedCoins) || addedXp || 0);
      if (addedCoins > 0) {
        user.coins = (Number(user.coins) || 0) + addedCoins;
      }

      if (dto.wonRace) {
        user.racesWon = (Number(user.racesWon) || 0) + 1;
      }

      if (dto.wpm && Number(dto.wpm) > 0) {
        user.wpm = Number(dto.wpm);
        if (!user.bestWpm || Number(dto.wpm) > Number(user.bestWpm)) {
          user.bestWpm = Number(dto.wpm);
        }
      }

      if (dto.accuracy && Number(dto.accuracy) > 0) {
        user.accuracy = Number(dto.accuracy);
        if (!user.bestAccuracy || Number(dto.accuracy) > Number(user.bestAccuracy)) {
          user.bestAccuracy = Number(dto.accuracy);
        }
      }

      if (dto.earnedDiamonds && Number(dto.earnedDiamonds) > 0) {
        user.diamonds = (Number(user.diamonds) || 0) + Number(dto.earnedDiamonds);
      }

      try {
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(targetPath, JSON.stringify(usersList, null, 2), 'utf8');
      } catch (e) {
        console.error('Failed to save user progress to users.json:', e);
      }

      return {
        success: true,
        xp: user.xp,
        level: user.level,
        coins: user.coins || 0,
        diamonds: user.diamonds || 0,
        racesWon: user.racesWon || 0,
      };
    }

    return { success: false, message: 'User not found' };
  }
}
