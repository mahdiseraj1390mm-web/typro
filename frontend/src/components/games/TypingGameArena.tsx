'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Gamepad2,
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  Shield,
  Award,
  Zap,
  Car,
  Heart,
  Bomb,
  Radio,
  Clock,
  Volume2,
  VolumeX,
  X,
  Keyboard,
  Coins,
  Crown,
  Pickaxe,
  Gauge,
  Terminal,
  Footprints,
  CircleDot,
  Swords,
  Layers,
  Crosshair,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GameCanvas3D from './GameCanvas3D';

export type GameMode =
  | 'wordfall'
  | 'defense'
  | 'chaser'
  | 'bomb'
  | 'balloon'
  | 'mining'
  | 'hacker'
  | 'parkour'
  | 'penalty'
  | 'boxing';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

interface FallingWord {
  id: number;
  word: string;
  x: number; // percentage
  y: number; // percentage
  speed: number;
}

interface DefenseTarget {
  id: number;
  word: string;
  distance: number; // 100 to 0
  lane: number; // 0, 1, 2
}

interface FloatingBalloon {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  color: string;
}

interface TypingGameArenaProps {
  initialMode?: GameMode;
  allowModeSwitch?: boolean;
  isModal?: boolean;
  onClose?: () => void;
  language?: 'fa' | 'en';
  title?: string;
  badge?: string;
}

export default function TypingGameArena({
  initialMode = 'wordfall',
  allowModeSwitch = true,
  isModal = false,
  onClose,
  language = 'fa',
  title,
  badge,
}: TypingGameArenaProps) {
  const [selectedGame, setSelectedGame] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [inputWord, setInputWord] = useState('');
  const [errorChar, setErrorChar] = useState<string | null>(null);
  const [activeTargetId, setActiveTargetId] = useState<number | string | null>(null);
  const [heartDamageAnim, setHeartDamageAnim] = useState(false);
  const [heartGainAnim, setHeartGainAnim] = useState(false);
  const [heartNotification, setHeartNotification] = useState<{ text: string; type: 'gain' | 'loss'; id: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [actionTrigger, setActionTrigger] = useState<{ type: string; payload?: any; id: number } | null>(null);

  // Rewards earned upon conclusion
  const [rewardBreakdown, setRewardBreakdown] = useState<{
    coins: number;
    diamonds: number;
    xp: number;
    isVip: boolean;
    difficultyBonus: string;
  } | null>(null);

  // 1. Word Fall state
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);

  // 2. Defense state
  const [defenseTargets, setDefenseTargets] = useState<DefenseTarget[]>([]);

  // 3. Speed chaser state
  const [chaserSpeedKmH, setChaserSpeedKmH] = useState(185);
  const [chaserObstacle, setChaserObstacle] = useState<{ word: string; dist: number }>({
    word: 'سرعت',
    dist: 80,
  });

  // 4. Bomb Defusal state
  const [bombTimeLeft, setBombTimeLeft] = useState(18.0);
  const [bombWireStage, setBombWireStage] = useState(0);
  const [bombWord, setBombWord] = useState('خنثی');
  const totalWires = 5;

  const wireColors = [
    { name: 'قرمز', hex: '#ef4444' },
    { name: 'آبی', hex: '#06b6d4' },
    { name: 'طلایی', hex: '#f59e0b' },
    { name: 'سبز', hex: '#10b981' },
    { name: 'بنفش', hex: '#a855f7' },
  ];

  // 5. Balloon state
  const [balloons, setBalloons] = useState<FloatingBalloon[]>([]);

  // 6. Mining state with distinct ores
  const oreLevels = useMemo(
    () => [
      { name: 'سنگ آهن و زغال‌سنگ', color: 'from-slate-600 to-zinc-800', hitsReq: 3, gem: 'سنگ آهن', icon: '⛏️' },
      { name: 'رگه طلای خالص', color: 'from-amber-500 to-yellow-600', hitsReq: 4, gem: 'شمش طلا', icon: '🪙' },
      { name: 'ژئود زمرد بلورین', color: 'from-emerald-500 to-teal-700', hitsReq: 4, gem: 'زمرد ناب', icon: '💎' },
      { name: 'الماس کهکشانی سلطنتی', color: 'from-cyan-400 to-blue-600', hitsReq: 5, gem: 'الماس خالص', icon: '✨' },
    ],
    []
  );
  const [currentOreIdx, setCurrentOreIdx] = useState(0);
  const [rockDurability, setRockDurability] = useState(3);
  const [mineDepth, setMineDepth] = useState(120);
  const [mineWord, setMineWord] = useState('الماس');
  const [miningGemsCollected, setMiningGemsCollected] = useState(0);
  const [miningRockTimer, setMiningRockTimer] = useState(8.0);

  // 7. Hacker state
  const [hackerFirewallLevel, setHackerFirewallLevel] = useState(3);
  const [hackerWord, setHackerWord] = useState('پروتکل');
  const [hackerTraceTimer, setHackerTraceTimer] = useState(7.0);

  // 8. Parkour state
  const parkourObstacleList = useMemo(
    () => [
      { name: 'کانال تهویه هوا', icon: '🏢', move: 'پرش گربه‌ای 🏃‍♂️' },
      { name: 'نرده بام مرتفع', icon: '🚧', move: 'وال‌ران آکروباتیک 🧗' },
      { name: 'شکاف بین دو برج', icon: '🏙️', move: 'شیرجه هوایی 🦅' },
    ],
    []
  );
  const [currentObstacleIdx, setCurrentObstacleIdx] = useState(0);
  const [obstacleDistance, setObstacleDistance] = useState(35);
  const [parkourMeters, setParkourMeters] = useState(0);
  const [parkourWord, setParkourWord] = useState('پرش');

  // 9. Penalty Shootout state
  const [penaltyShotsTotal] = useState(5);
  const [penaltyShotsTaken, setPenaltyShotsTaken] = useState(0);
  const [penaltyGoalsScored, setPenaltyGoalsScored] = useState(0);
  const penaltyCornerList = ['کنج راست بالا ↗️', 'کنج چپ بالا ↖️', 'کنج راست پایین ↘️', 'کنج چپ پایین ↙️'];
  const [penaltyTargetCorner, setPenaltyTargetCorner] = useState('کنج راست بالا ↗️');
  const [lastGoalCelebration, setLastGoalCelebration] = useState(false);
  const [penaltyWord, setPenaltyWord] = useState('گل');
  const [penaltyShotTimer, setPenaltyShotTimer] = useState(6.0);

  // 10. Boxing Combat state
  const [boxerOpponentHp, setBoxerOpponentHp] = useState(100);
  const [boxerPlayerHp, setBoxerPlayerHp] = useState(100);
  const [boxerAttackTimer, setBoxerAttackTimer] = useState(3.5);
  const punchTypeList = ['🥊 هوک چپ سرعتی', '💥 آپرکات سنگین چانه', '⚡ ضربه ترکیبی راست'];
  const [boxerMoveType, setBoxerMoveType] = useState('🥊 هوک چپ سرعتی');
  const [boxingRounds, setBoxingRounds] = useState(1);
  const [boxingWord, setBoxingWord] = useState('مشت');

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Speed multiplier based on difficulty
  const speedMultiplier = useMemo(() => {
    if (difficulty === 'hard') return 2.0; // ۲ برابر سریع‌تر
    if (difficulty === 'easy') return 0.55; // آرام و مقدماتی
    return 1.0; // استاندارد
  }, [difficulty]);

  // Synthesized Web Audio
  const playSynthesizedSound = useCallback((type: 'laser' | 'spark' | 'nitro' | 'coin' | 'diamond' | 'pop' | 'tick' | 'boom' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'spark' || type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'nitro') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'diamond') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046, now);
        osc.frequency.setValueAtTime(1318, now + 0.07);
        osc.frequency.setValueAtTime(1567, now + 0.14);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'boom') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {}
  }, [soundEnabled]);

  // Difficulty tailored word pools
  const easyPersianWords = ['آب', 'نان', 'دست', 'پا', 'سر', 'گل', 'نور', 'شب', 'روز', 'ماه', 'تیر', 'باد', 'کوه'];
  const mediumPersianWords = [
    'کتاب', 'قلم', 'دانش', 'سرعت', 'دقت', 'تایپ', 'مهارت', 'پرواز', 'امید',
    'آسمان', 'خورشید', 'ایران', 'فناوری', 'جهان', 'روشن', 'سنگر', 'امواج', 'شکوفا'
  ];
  const hardPersianWords = [
    'الگوریتم', 'میکروپروسسور', 'استراتژیک', 'هوشمندسازی', 'رمزنگاری', 'بیوتکنولوژی',
    'کیهان‌شناسی', 'نانوفناوری', 'ترمودینامیک', 'الکترومغناطیس', 'مغناطیسی', 'پیشرانه'
  ];

  const wordPool = useMemo(() => {
    if (difficulty === 'easy') return easyPersianWords;
    if (difficulty === 'hard') return hardPersianWords;
    return mediumPersianWords;
  }, [difficulty]);

  const balloonColors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const gameTitles: Record<GameMode, { title: string; desc: string; icon: any; color: string; badge: string }> = {
    bomb: {
      title: 'خنثی‌سازی بمب C4 سه‌بعدی',
      desc: 'واحد EOD: انبر سیم‌چین هیدرولیک و ۵ سیم مدار الکترونیکی برای برش اضطراری با تایمر LED.',
      icon: Bomb,
      color: 'text-red-400',
      badge: 'کنترل اضطراب ۳D',
    },
    chaser: {
      title: 'کورس شتاب و نیترو ۳D',
      desc: 'رانندگی در اتوبان با رقبای پیش‌رو، آمپر سرعت، احتراق نیتروژن و سبقت‌های ثانیه‌ای.',
      icon: Car,
      color: 'text-blue-400',
      badge: 'آدرنالین ۳D',
    },
    defense: {
      title: 'پدافند لیزری پایگاه ۳D',
      desc: 'برجک دفاع هوایی ۳D، رهگیری پهپادهای مهاجم فضایی در ۳ باند پروازی و انهدام قبل از اصابت.',
      icon: Shield,
      color: 'text-emerald-400',
      badge: 'تمرکز چندمحوره ۳D',
    },
    wordfall: {
      title: 'سقوط شهاب‌سنگ‌های کهکشانی ۳D',
      desc: 'شکار شهاب‌سنگ‌های آتشین در مدار با سایت نشانه‌گیری هولوگرافیک و متلاشی کردن در اتمسفر.',
      icon: Zap,
      color: 'text-amber-400',
      badge: 'واکنش سریع ۳D',
    },
    mining: {
      title: 'معدنچی کریستال و الماس ۳D',
      desc: 'فرود ضربات سهمگین کلنگ طلایی بر سنگ‌های آهن، رگه‌های طلا و ژئودهای الماس تا ترکیدن صخره.',
      icon: Pickaxe,
      color: 'text-cyan-400',
      badge: 'استخراج منابع ۳D',
    },
    hacker: {
      title: 'نفوذ سایبری به ماتریکس ۳D',
      desc: 'هک هسته مرکزی هوش مصنوعی با پرتوهای شکستن فایروال، رمزگشایی پروتکل‌ها و رخنه به کدهای ریشه.',
      icon: Terminal,
      color: 'text-green-400',
      badge: 'امنیت سایبری ۳D',
    },
    parkour: {
      title: 'دونده پارکور پشت‌بام ۳D',
      desc: 'دویدن روی سقف آسمان‌خراش‌ها، جهش آکروباتیک از روی موانع تهویه هوا و شکاف بین برج‌ها.',
      icon: Footprints,
      color: 'text-pink-400',
      badge: 'چابکی ۳D',
    },
    penalty: {
      title: 'ضربات پنالتی فوتبال ۳D',
      desc: 'شوت‌های کات‌دار به کنج دروازه استادیوم، مصاف تن به تن با شیرجه دروازه‌بان و لرزش تور دروازه.',
      icon: CircleDot,
      color: 'text-amber-400',
      badge: 'دقت ضربه ۳D',
    },
    boxing: {
      title: 'رینگ بوکس و مبارزه ۳D',
      desc: 'مصاف در رینگ با حریف قدرتمند، فرار از مشت‌های سنگین، کمبوهای هوک و آپرکات برای ناک‌اوت (KO).',
      icon: Swords,
      color: 'text-violet-400',
      badge: 'نبرد قهرمانی ۳D',
    },
    balloon: {
      title: 'شکار بالن‌های معلق ۳D',
      desc: 'شناوری ۳D بالن‌ها در آسمان و ابرها؛ نشانه‌گیری و ترکیدن بالن‌ها با افکت ترکش و کنفتی.',
      icon: Sparkles,
      color: 'text-purple-400',
      badge: 'شکار فضایی ۳D',
    },
  };

  // Economy reward distribution
  const awardPlayerEconomy = useCallback((finalScore: number, won: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        const isVip = localStorage.getItem('typro_user_is_subscribed') === 'true';

        // Base reward scaling by difficulty
        const diffMultiplier = difficulty === 'hard' ? 2.5 : difficulty === 'easy' ? 0.75 : 1.0;
        let baseCoins = Math.round(Math.max(20, Math.min(45, (finalScore / 10) + (won ? 15 : 5))) * diffMultiplier);
        let baseDiamonds = won || finalScore >= 120 || difficulty === 'hard' ? (difficulty === 'hard' ? 2 : 1) : 0;
        let baseExp = Math.round(Math.max(35, Math.min(150, finalScore * 1.3)) * diffMultiplier);

        if (isVip) {
          baseCoins *= 2;
          baseDiamonds = Math.max(2, baseDiamonds * 2);
          baseExp = Math.round(baseExp * 1.5);
        }

        const curCoins = Number(localStorage.getItem('typro_user_coins') || '0');
        const curDiamonds = Number(localStorage.getItem('typro_user_diamonds') || '0');

        localStorage.setItem('typro_user_coins', String(curCoins + baseCoins));
        localStorage.setItem('typro_user_diamonds', String(curDiamonds + baseDiamonds));

        setRewardBreakdown({
          coins: baseCoins,
          diamonds: baseDiamonds,
          xp: baseExp,
          isVip,
          difficultyBonus: difficulty === 'hard' ? 'ضریب ۲.۵ برابر پیشرفته (توربو)' : difficulty === 'easy' ? 'سطح مقدماتی' : 'سطح استاندارد',
        });

        window.dispatchEvent(new Event('typro_wallet_updated'));
      } catch {}
    }
  }, [difficulty]);

  const maxLives = difficulty === 'easy' ? 4 : 3;

  const loseLife = useCallback(
    (amount: number = 1) => {
      setHeartDamageAnim(true);
      playSynthesizedSound('boom');
      setHeartNotification({ text: `-${amount} ❤️`, type: 'loss', id: Date.now() });
      setTimeout(() => setHeartDamageAnim(false), 500);
      setTimeout(() => setHeartNotification(null), 1200);

      setLives((prev) => {
        const next = Math.max(0, prev - amount);
        if (next <= 0) {
          setGameOver(true);
          setIsPlaying(false);
          awardPlayerEconomy(score, false);
          return 0;
        }
        return next;
      });
    },
    [playSynthesizedSound, score, awardPlayerEconomy]
  );

  const gainLife = useCallback(
    (amount: number = 1) => {
      setLives((prev) => {
        if (prev >= maxLives) return prev;
        const next = Math.min(maxLives, prev + amount);
        setHeartGainAnim(true);
        playSynthesizedSound('diamond');
        setHeartNotification({ text: `+${amount} ❤️`, type: 'gain', id: Date.now() });
        setTimeout(() => setHeartGainAnim(false), 600);
        setTimeout(() => setHeartNotification(null), 1200);
        return next;
      });
    },
    [maxLives, playSynthesizedSound]
  );

  const handleStartGame = useCallback(() => {
    setIsPlaying(true);
    setScore(0);
    setCombo(1);
    setLives(difficulty === 'easy' ? 4 : 3);
    setGameOver(false);
    setIsVictory(false);
    setInputWord('');
    setErrorChar(null);
    setActiveTargetId(null);
    setRewardBreakdown(null);
    setPenaltyShotTimer(6.0);
    setMiningRockTimer(8.0);
    setHackerTraceTimer(7.0);

    const baseBombTime = difficulty === 'hard' ? 12.0 : difficulty === 'easy' ? 24.0 : 18.0;

    if (selectedGame === 'wordfall') {
      setFallingWords([
        { id: Date.now(), word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 25, y: 18, speed: 0.35 * speedMultiplier },
        { id: Date.now() + 1, word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 50, y: 8, speed: 0.38 * speedMultiplier },
        { id: Date.now() + 2, word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 75, y: 25, speed: 0.4 * speedMultiplier },
      ]);
    } else if (selectedGame === 'defense') {
      setDefenseTargets([
        { id: Date.now(), word: wordPool[Math.floor(Math.random() * wordPool.length)], distance: 88, lane: 0 },
        { id: Date.now() + 1, word: wordPool[Math.floor(Math.random() * wordPool.length)], distance: 75, lane: 1 },
        { id: Date.now() + 2, word: wordPool[Math.floor(Math.random() * wordPool.length)], distance: 92, lane: 2 },
      ]);
    } else if (selectedGame === 'chaser') {
      setChaserSpeedKmH(difficulty === 'hard' ? 240 : 180);
      setChaserObstacle({
        word: wordPool[Math.floor(Math.random() * wordPool.length)],
        dist: 85,
      });
    } else if (selectedGame === 'bomb') {
      setBombTimeLeft(baseBombTime);
      setBombWireStage(0);
      setBombWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    } else if (selectedGame === 'balloon') {
      setBalloons([
        { id: Date.now(), word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 22, y: 70, speed: 0.28 * speedMultiplier, color: balloonColors[0] },
        { id: Date.now() + 1, word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 42, y: 55, speed: 0.3 * speedMultiplier, color: balloonColors[1] },
        { id: Date.now() + 2, word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 62, y: 40, speed: 0.26 * speedMultiplier, color: balloonColors[2] },
        { id: Date.now() + 3, word: wordPool[Math.floor(Math.random() * wordPool.length)], x: 80, y: 25, speed: 0.32 * speedMultiplier, color: balloonColors[3] },
      ]);
    } else if (selectedGame === 'mining') {
      setCurrentOreIdx(0);
      setRockDurability(3);
      setMineDepth(120);
      setMineWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
      setMiningGemsCollected(0);
    } else if (selectedGame === 'hacker') {
      setHackerFirewallLevel(difficulty === 'hard' ? 4 : 3);
      setHackerWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    } else if (selectedGame === 'parkour') {
      setCurrentObstacleIdx(0);
      setObstacleDistance(35);
      setParkourMeters(0);
      setParkourWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    } else if (selectedGame === 'penalty') {
      setPenaltyShotsTaken(0);
      setPenaltyGoalsScored(0);
      setPenaltyTargetCorner('کنج راست بالا ↗️');
      setLastGoalCelebration(false);
      setPenaltyWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    } else if (selectedGame === 'boxing') {
      setBoxerOpponentHp(100);
      setBoxerPlayerHp(100);
      setBoxerAttackTimer(3.5);
      setBoxerMoveType('🥊 هوک چپ سرعتی');
      setBoxingRounds(1);
      setBoxingWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
    }
  }, [selectedGame, wordPool, balloonColors, speedMultiplier, difficulty]);

  // Main game tick loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      // 1. WORDFALL (Meteors)
      if (selectedGame === 'wordfall') {
        setFallingWords((prev) => {
          const updated = prev.map((w) => ({ ...w, y: w.y + w.speed }));
          const escaped = updated.filter((w) => w.y >= 78);
          if (escaped.length > 0) {
            setCombo(1);
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(escaped.length);
          }
          let filtered = updated.filter((w) => w.y < 78);
          if (Math.random() < 0.22 && filtered.length < (difficulty === 'hard' ? 5 : 4)) {
            filtered.push({
              id: Date.now() + Math.random(),
              word: wordPool[Math.floor(Math.random() * wordPool.length)],
              x: Math.floor(Math.random() * 65) + 18,
              y: 5,
              speed: (0.35 + Math.random() * 0.25) * speedMultiplier,
            });
          }
          return filtered;
        });
      }

      // 2. DEFENSE (Anti-Air Turret vs Incoming Drones)
      else if (selectedGame === 'defense') {
        setDefenseTargets((prev) => {
          const updated = prev.map((t) => ({ ...t, distance: t.distance - 0.75 * speedMultiplier }));
          const breached = updated.filter((t) => t.distance <= 10);
          if (breached.length > 0) {
            setCombo(1);
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(breached.length);
          }
          let filtered = updated.filter((t) => t.distance > 10);
          if (Math.random() < 0.2 && filtered.length < (difficulty === 'hard' ? 4 : 3)) {
            const lane = Math.floor(Math.random() * 3);
            filtered.push({
              id: Date.now() + Math.random(),
              word: wordPool[Math.floor(Math.random() * wordPool.length)],
              distance: 95,
              lane,
            });
          }
          return filtered;
        });
      }

      // 3. CHASER (Speed decays if not typing; rival draws near)
      else if (selectedGame === 'chaser') {
        setChaserSpeedKmH((s) => Math.max(75, s - 1.2)); // Slows down when not typing!
        setChaserObstacle((prev) => {
          const nextDist = prev.dist - 0.55 * speedMultiplier;
          if (nextDist <= 8) {
            // Collision with competitor!
            setCombo(1);
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(1);
            return {
              word: wordPool[Math.floor(Math.random() * wordPool.length)],
              dist: 85,
            };
          }
          return { ...prev, dist: nextDist };
        });
      }

      // 4. BOMB DEFUSAL (C4 Ticking LED countdown)
      else if (selectedGame === 'bomb') {
        setBombTimeLeft((prev) => {
          if (prev <= 0.05) {
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(maxLives);
            return 0;
          }
          if (Math.floor(prev * 10) % 10 === 0) playSynthesizedSound('tick');
          return Number((prev - 0.05).toFixed(2));
        });
      }

      // 5. BALLOON POPPER
      else if (selectedGame === 'balloon') {
        setBalloons((prev) => {
          const updated = prev.map((b) => ({ ...b, y: b.y - b.speed }));
          const escaped = updated.filter((b) => b.y <= 12);
          if (escaped.length > 0) {
            setCombo(1);
            loseLife(escaped.length);
          }
          let filtered = updated.filter((b) => b.y > 12);
          if (Math.random() < 0.22 && filtered.length < 5) {
            filtered.push({
              id: Date.now() + Math.random(),
              word: wordPool[Math.floor(Math.random() * wordPool.length)],
              x: Math.floor(Math.random() * 65) + 18,
              y: 80,
              speed: (0.28 + Math.random() * 0.18) * speedMultiplier,
              color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
            });
          }
          return filtered;
        });
      }

      // 6. PARKOUR (Obstacle countdown)
      else if (selectedGame === 'parkour') {
        setObstacleDistance((d) => {
          const next = d - 0.8 * speedMultiplier;
          if (next <= 4) {
            // Stumbled over obstacle!
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(1);
            setCurrentObstacleIdx((i) => (i + 1) % parkourObstacleList.length);
            setParkourWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
            return 35;
          }
          return next;
        });
      }

      // 7. BOXING (Opponent attack wind-up timer)
      else if (selectedGame === 'boxing') {
        setBoxerAttackTimer((t) => {
          const next = t - 0.05 * speedMultiplier;
          if (next <= 0.05) {
            // Opponent unleashes counter-punch!
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(1);
            setBoxerPlayerHp((hp) => Math.max(0, hp - 34));
            return 3.2; // Reset attack timer
          }
          return next;
        });
      }

      // 8. PENALTY (Shot-clock countdown)
      else if (selectedGame === 'penalty') {
        setPenaltyShotTimer((t) => {
          const next = t - 0.05 * speedMultiplier;
          if (next <= 0.05) {
            // Goalkeeper saves shot (timeout)!
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(1);
            setPenaltyWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
            return 6.0;
          }
          return next;
        });
      }

      // 9. MINING (Rock instability cave-in timer)
      else if (selectedGame === 'mining') {
        setMiningRockTimer((t) => {
          const next = t - 0.05 * speedMultiplier;
          if (next <= 0.05) {
            // Rock instability / cave-in tremor!
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(1);
            setMineWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
            return 8.0;
          }
          return next;
        });
      }

      // 10. HACKER (Cyber firewall trace detection timer)
      else if (selectedGame === 'hacker') {
        setHackerTraceTimer((t) => {
          const next = t - 0.05 * speedMultiplier;
          if (next <= 0.05) {
            // Cyber trace counter-attack!
            setActionTrigger({ type: 'base_breached', id: Date.now() });
            loseLife(1);
            setHackerWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
            return 7.0;
          }
          return next;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    gameOver,
    selectedGame,
    wordPool,
    score,
    speedMultiplier,
    awardPlayerEconomy,
    playSynthesizedSound,
    balloonColors,
    difficulty,
    parkourObstacleList,
    loseLife,
    maxLives,
  ]);

  // Word match evaluator
  const evaluateWordInput = useCallback(
    (val: string, targetId?: number | string) => {
      const clean = val.trim();
      if (!clean) return;

      const baseAdded = difficulty === 'hard' ? 25 : difficulty === 'easy' ? 10 : 15;

      // 1. Word Fall (Meteors)
      if (selectedGame === 'wordfall') {
        const matchIdx = fallingWords.findIndex((w) => (targetId ? w.id === targetId : w.word === clean));
        if (matchIdx !== -1) {
          playSynthesizedSound('spark');
          confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
          setActionTrigger({ type: 'destroy_target', payload: { id: fallingWords[matchIdx].id }, id: Date.now() });
          setScore((s) => s + baseAdded * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo === 4 || nextCombo === 6) gainLife(1);
          setFallingWords((prev) => prev.filter((_, i) => i !== matchIdx));
          setInputWord('');
          setErrorChar(null);
          setActiveTargetId(null);
          return;
        }
      }

      // 2. Defense (Anti-Air Turret fires 3D laser bolt at drone)
      else if (selectedGame === 'defense') {
        const matchIdx = defenseTargets.findIndex((t) => (targetId ? t.id === targetId : t.word === clean));
        if (matchIdx !== -1) {
          const target = defenseTargets[matchIdx];
          playSynthesizedSound('laser');
          setActionTrigger({
            type: 'fire_defense_laser',
            payload: { lane: target.lane, id: target.id },
            id: Date.now(),
          });
          setTimeout(() => {
            setActionTrigger({ type: 'destroy_target', payload: { id: target.id }, id: Date.now() });
          }, 120);

          confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
          setScore((s) => s + (baseAdded + 5) * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo === 4 || nextCombo === 6) gainLife(1);
          setDefenseTargets((prev) => prev.filter((_, i) => i !== matchIdx));
          setInputWord('');
          setErrorChar(null);
          setActiveTargetId(null);
          return;
        }
      }

      // 3. Chaser (Nitro Boost & Overtake)
      else if (selectedGame === 'chaser') {
        if (clean === chaserObstacle.word) {
          playSynthesizedSound('nitro');
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
          setActionTrigger({ type: 'nitro_boost', id: Date.now() });
          setScore((s) => s + (baseAdded + 8) * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo === 4 || nextCombo === 6) gainLife(1);
          setChaserSpeedKmH((s) => Math.min(320, s + 28)); // Nitro surge!
          setChaserObstacle({
            word: wordPool[Math.floor(Math.random() * wordPool.length)],
            dist: 95,
          });
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      // 4. Bomb Defusal (Pliers cut wire in 3D)
      else if (selectedGame === 'bomb') {
        if (clean === bombWord) {
          playSynthesizedSound('spark');
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
          setActionTrigger({ type: 'cut_wire', id: Date.now() });

          const added = (baseAdded + 15) * combo;
          setScore((s) => s + added);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          gainLife(1); // Cutting a wire successfully restores a life!
          const nextStage = bombWireStage + 1;
          setBombWireStage(nextStage);

          if (nextStage >= totalWires) {
            playSynthesizedSound('coin');
            confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
            const finalScore = score + added + 300;
            setScore(finalScore);
            setIsVictory(true);
            setGameOver(true);
            setIsPlaying(false);
            awardPlayerEconomy(finalScore, true);
          } else {
            const addedTime = difficulty === 'hard' ? 2.5 : 4.5;
            setBombTimeLeft((t) => Math.min(24, t + addedTime));
            setBombWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
          }
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      // 5. Balloon (Pop 3D Balloon)
      else if (selectedGame === 'balloon') {
        const matchIdx = balloons.findIndex((b) => (targetId ? b.id === targetId : b.word === clean));
        if (matchIdx !== -1) {
          playSynthesizedSound('pop');
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
          setActionTrigger({ type: 'pop_balloon', id: Date.now() });
          setScore((s) => s + baseAdded * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo === 4 || nextCombo === 6) gainLife(1);
          setBalloons((prev) => prev.filter((_, i) => i !== matchIdx));
          setInputWord('');
          setErrorChar(null);
          setActiveTargetId(null);
          return;
        }
      }

      // 6. Mining (Pickaxe swing & distinct ore rocks)
      else if (selectedGame === 'mining') {
        if (clean === mineWord) {
          const nextDurability = rockDurability - 1;
          setActionTrigger({ type: 'strike_rock', id: Date.now() });
          setMiningRockTimer(8.0); // Reset rock instability timer

          if (nextDurability <= 0) {
            playSynthesizedSound('diamond');
            confetti({ particleCount: 55, spread: 75, origin: { y: 0.7 } });
            gainLife(1); // Mining rare gem restores a heart!
            setMiningGemsCollected((g) => g + 1);
            setMineDepth((d) => d + 40);
            setScore((s) => s + 60 * combo);
            setCombo((c) => Math.min(6, c + 1));

            const nextOreIdx = (currentOreIdx + 1) % oreLevels.length;
            setCurrentOreIdx(nextOreIdx);
            setRockDurability(oreLevels[nextOreIdx].hitsReq);
          } else {
            playSynthesizedSound('coin');
            setRockDurability(nextDurability);
            setScore((s) => s + 20 * combo);
          }

          setMineWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      // 7. Hacker (Matrix Cyber Core breach)
      else if (selectedGame === 'hacker') {
        if (clean === hackerWord) {
          playSynthesizedSound('laser');
          confetti({ particleCount: 45, spread: 55, origin: { y: 0.7 } });
          setActionTrigger({ type: 'destroy_target', id: Date.now() });
          setHackerTraceTimer(7.0); // Reset firewall trace timer
          const nextLvl = hackerFirewallLevel - 1;
          if (nextLvl <= 0) {
            setIsVictory(true);
            setGameOver(true);
            setIsPlaying(false);
            awardPlayerEconomy(score + 250, true);
          } else {
            setHackerFirewallLevel(nextLvl);
            gainLife(1); // Cracking a firewall layer restores a heart!
            setScore((s) => s + 40 * combo);
            setHackerWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
          }
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      // 8. Parkour (Rooftop acrobatic leaps)
      else if (selectedGame === 'parkour') {
        if (clean === parkourWord) {
          playSynthesizedSound('nitro');
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
          setActionTrigger({ type: 'parkour_jump', id: Date.now() });
          setParkourMeters((m) => m + 60);
          setScore((s) => s + 35 * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo === 4 || nextCombo === 6) gainLife(1);
          setCurrentObstacleIdx((i) => (i + 1) % parkourObstacleList.length);
          setObstacleDistance(35); // Cleared obstacle!
          setParkourWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      // 9. Penalty Shootout (3D ball flight & goalkeeper dive)
      else if (selectedGame === 'penalty') {
        if (clean === penaltyWord) {
          playSynthesizedSound('coin');
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
          setActionTrigger({ type: 'kick_penalty', id: Date.now() });
          setPenaltyGoalsScored((g) => g + 1);
          setLastGoalCelebration(true);
          setTimeout(() => setLastGoalCelebration(false), 1400);
          setPenaltyShotTimer(6.0); // Reset shot timer

          const nextShots = penaltyShotsTaken + 1;
          setPenaltyShotsTaken(nextShots);
          setScore((s) => s + 45 * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo >= 3) gainLife(1); // Goal streak gives extra heart!

          if (nextShots >= penaltyShotsTotal) {
            setIsVictory(true);
            setGameOver(true);
            setIsPlaying(false);
            awardPlayerEconomy(score + 300, true);
          } else {
            setPenaltyTargetCorner(penaltyCornerList[nextShots % penaltyCornerList.length]);
            setPenaltyWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
          }
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      // 10. Boxing (Combat punch combo & opponent health)
      else if (selectedGame === 'boxing') {
        if (clean === boxingWord) {
          playSynthesizedSound('spark');
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
          setActionTrigger({ type: 'boxing_punch', id: Date.now() });
          setScore((s) => s + 40 * combo);
          const nextCombo = Math.min(6, combo + 1);
          setCombo(nextCombo);
          if (nextCombo === 4 || nextCombo === 6) gainLife(1);
          setBoxerAttackTimer(3.5); // Reset opponent attack timer on hit

          const nextOppHp = boxerOpponentHp - 20;
          if (nextOppHp <= 0) {
            playSynthesizedSound('diamond');
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
            setIsVictory(true);
            setGameOver(true);
            setIsPlaying(false);
            awardPlayerEconomy(score + 350, true);
          } else {
            setBoxerOpponentHp(nextOppHp);
            setBoxerMoveType(punchTypeList[Math.floor(Math.random() * punchTypeList.length)]);
            setBoxingWord(wordPool[Math.floor(Math.random() * wordPool.length)]);
          }
          setInputWord('');
          setErrorChar(null);
          return;
        }
      }

      setInputWord(clean);
    },
    [
      selectedGame,
      fallingWords,
      defenseTargets,
      chaserObstacle,
      bombWord,
      bombWireStage,
      totalWires,
      balloons,
      mineWord,
      rockDurability,
      currentOreIdx,
      oreLevels,
      hackerWord,
      hackerFirewallLevel,
      parkourWord,
      parkourObstacleList,
      penaltyWord,
      penaltyShotsTaken,
      penaltyShotsTotal,
      penaltyCornerList,
      boxingWord,
      boxerOpponentHp,
      punchTypeList,
      combo,
      score,
      wordPool,
      difficulty,
      playSynthesizedSound,
      awardPlayerEconomy,
      gainLife,
    ]
  );

  // Helper to retrieve current main prompt word and action title
  const currentActionMeta = useMemo(() => {
    switch (selectedGame) {
      case 'chaser':
        return {
          title: '🏎️ تزریق نیتروژن و سبقت سرعتی',
          word: chaserObstacle.word,
          color: 'text-cyan-300',
        };
      case 'bomb':
        return {
          title: `⚡ برش سیم شماره ${bombWireStage + 1} (${wireColors[bombWireStage]?.name})`,
          word: bombWord,
          color: 'text-red-400',
        };
      case 'boxing':
        return {
          title: `${boxerMoveType} به حریف`,
          word: boxingWord,
          color: 'text-violet-300',
        };
      case 'penalty':
        return {
          title: `⚽ شوت فنی به ${penaltyTargetCorner}`,
          word: penaltyWord,
          color: 'text-amber-300',
        };
      case 'mining':
        return {
          title: `⛏️ ضربه کلنگ بر ${oreLevels[currentOreIdx].name}`,
          word: mineWord,
          color: 'text-cyan-300',
        };
      case 'parkour':
        return {
          title: `🏃‍♂️ اجرای ${parkourObstacleList[currentObstacleIdx].move}`,
          word: parkourWord,
          color: 'text-pink-300',
        };
      case 'hacker':
        return {
          title: `💻 رخنه به فایروال لایه ${hackerFirewallLevel}`,
          word: hackerWord,
          color: 'text-green-400',
        };
      default:
        return null; // Multi-target games render on targets
    }
  }, [
    selectedGame,
    chaserObstacle.word,
    bombWireStage,
    wireColors,
    bombWord,
    boxerMoveType,
    boxingWord,
    penaltyTargetCorner,
    penaltyWord,
    currentOreIdx,
    oreLevels,
    mineWord,
    currentObstacleIdx,
    parkourObstacleList,
    parkourWord,
    hackerFirewallLevel,
    hackerWord,
  ]);

  // Exact character-by-character typing evaluator with strict error lock
  const processTypingChar = useCallback(
    (char: string) => {
      if (!isPlaying || gameOver) return;

      // 1. Multi-target games: wordfall, balloon, defense
      if (selectedGame === 'wordfall' || selectedGame === 'balloon' || selectedGame === 'defense') {
        const activeTargets: Array<{ id: number | string; word: string }> =
          selectedGame === 'wordfall'
            ? fallingWords
            : selectedGame === 'balloon'
            ? balloons
            : defenseTargets;

        if (activeTargetId === null) {
          const matched = activeTargets.find((t) => t.word.startsWith(char));
          if (matched) {
            setActiveTargetId(matched.id);
            setErrorChar(null);
            playSynthesizedSound('tick');

            if (matched.word.length === 1) {
              evaluateWordInput(matched.word, matched.id);
              setInputWord('');
              setActiveTargetId(null);
            } else {
              setInputWord(char);
            }
          } else {
            playSynthesizedSound('error');
          }
          return;
        }

        const target = activeTargets.find((t) => t.id === activeTargetId);
        if (!target) {
          setActiveTargetId(null);
          setInputWord('');
          setErrorChar(null);
          return;
        }

        const targetChars = Array.from(target.word);
        const curIndex = inputWord.length;
        const expectedChar = targetChars[curIndex];

        if (errorChar !== null) {
          // Strict error lock: do not advance until the error is corrected
          if (char === expectedChar) {
            setErrorChar(null);
            playSynthesizedSound('tick');
            const nextVal = inputWord + char;
            if (nextVal === target.word) {
              evaluateWordInput(nextVal, target.id);
              setInputWord('');
              setActiveTargetId(null);
            } else {
              setInputWord(nextVal);
            }
          } else {
            setErrorChar(char);
            playSynthesizedSound('error');
          }
        } else {
          if (char === expectedChar) {
            playSynthesizedSound('tick');
            const nextVal = inputWord + char;
            if (nextVal === target.word) {
              evaluateWordInput(nextVal, target.id);
              setInputWord('');
              setActiveTargetId(null);
            } else {
              setInputWord(nextVal);
            }
          } else {
            setErrorChar(char);
            playSynthesizedSound('error');
          }
        }
        return;
      }

      // 2. Single-target games
      const targetWord = currentActionMeta?.word;
      if (!targetWord) return;

      const targetChars = Array.from(targetWord);
      const curIndex = inputWord.length;
      const expectedChar = targetChars[curIndex];

      if (errorChar !== null) {
        if (char === expectedChar) {
          setErrorChar(null);
          playSynthesizedSound('tick');
          const nextVal = inputWord + char;
          if (nextVal === targetWord) {
            evaluateWordInput(nextVal);
            setInputWord('');
          } else {
            setInputWord(nextVal);
          }
        } else {
          setErrorChar(char);
          playSynthesizedSound('error');
        }
      } else {
        if (char === expectedChar) {
          playSynthesizedSound('tick');
          const nextVal = inputWord + char;
          if (nextVal === targetWord) {
            evaluateWordInput(nextVal);
            setInputWord('');
          } else {
            setInputWord(nextVal);
          }
        } else {
          setErrorChar(char);
          playSynthesizedSound('error');
        }
      }
    },
    [
      isPlaying,
      gameOver,
      selectedGame,
      fallingWords,
      balloons,
      defenseTargets,
      activeTargetId,
      inputWord,
      errorChar,
      currentActionMeta,
      evaluateWordInput,
      playSynthesizedSound,
    ]
  );

  // Global window keyboard capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      // 1. SPACEBAR
      if (e.code === 'Space' || e.key === ' ') {
        if (!isPlaying || gameOver) {
          e.preventDefault();
          handleStartGame();
          return;
        } else {
          e.preventDefault();
          setInputWord('');
          setErrorChar(null);
          setActiveTargetId(null);
          return;
        }
      }

      // 2. BACKSPACE
      if (e.key === 'Backspace') {
        if (isPlaying && !gameOver) {
          e.preventDefault();
          if (errorChar !== null) {
            setErrorChar(null);
          } else if (inputWord.length > 0) {
            const next = inputWord.slice(0, -1);
            setInputWord(next);
            if (next.length === 0) {
              setActiveTargetId(null);
            }
          }
        }
        return;
      }

      // 3. ESCAPE
      if (e.key === 'Escape') {
        if (isPlaying && !gameOver) {
          e.preventDefault();
          setInputWord('');
          setErrorChar(null);
          setActiveTargetId(null);
        } else if (isModal && onClose) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      // 4. PRINTABLE CHARACTERS
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (isPlaying && !gameOver) {
          e.preventDefault();
          processTypingChar(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, inputWord, errorChar, activeTargetId, handleStartGame, processTypingChar, isModal, onClose]);

  const renderWordHighlight = (target: string, targetId?: number | string) => {
    const isTargeted = currentActionMeta
      ? true
      : activeTargetId != null
      ? activeTargetId === targetId
      : false;

    const chars = Array.from(target);
    const matchedCount = isTargeted ? inputWord.length : 0;

    return (
      <span className="inline-flex items-center justify-center flex-wrap gap-[1px] font-sans dir-rtl select-none">
        {chars.map((char, idx) => {
          if (idx < matchedCount) {
            return (
              <span
                key={idx}
                className="text-emerald-400 font-black drop-shadow-[0_0_10px_rgba(52,211,153,0.95)] transition-none"
              >
                {char}
              </span>
            );
          }

          if (idx === matchedCount && isTargeted) {
            if (errorChar) {
              return (
                <span
                  key={idx}
                  className="text-white bg-rose-600/90 border border-rose-400 shadow-[0_0_15px_rgba(244,63,94,1)] px-1.5 py-0.5 rounded-md animate-pulse scale-110 font-black transition-none"
                  title={`کلید اشتباه: ${errorChar}`}
                >
                  {char}
                </span>
              );
            } else {
              return (
                <span
                  key={idx}
                  className="text-white font-black underline decoration-cyan-400 decoration-[3px] underline-offset-4 animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-none"
                >
                  {char}
                </span>
              );
            }
          }

          return (
            <span
              key={idx}
              className={`${
                isTargeted ? 'text-white/90' : 'text-white/75'
              } font-bold transition-none`}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div
      className={`font-sans select-none text-white ${
        isModal ? 'relative w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'
      }`}
      dir="rtl"
    >
      {/* Top Header & Difficulty Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 border border-purple-400/40 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                {badge || 'تالار بازی‌های آرکید سه‌بعدی تایپرو'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold">
                دید کاملاً آزاد ۳D
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {title || 'آرکید سه‌بعدی و مهارت تایپ ده‌انگشتی'}
            </h2>
          </div>
        </div>

        {/* Difficulty Level Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <span className="text-slate-400 px-2 text-[11px] font-medium hidden sm:inline">سطح سختی:</span>
          {(['easy', 'medium', 'hard'] as const).map((lvl) => {
            const isSelected = difficulty === lvl;
            const labels: Record<GameDifficulty, { name: string; color: string }> = {
              easy: { name: '🟢 سطح ۱: مقدماتی', color: 'bg-emerald-600' },
              medium: { name: '🟡 سطح ۲: متوسط', color: 'bg-amber-600' },
              hard: { name: '🔴 سطح ۳: پیشرفته (۲x)', color: 'bg-red-600' },
            };
            const current = labels[lvl];

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setDifficulty(lvl);
                  if (isPlaying) {
                    setIsPlaying(false);
                    setGameOver(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? `${current.color} text-white font-black shadow-md`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{current.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800/80 p-3 sm:p-5 shadow-2xl flex flex-col space-y-3">
        {/* ══════════════════════════════════════════════════════════════
            3D STAGE CANVAS (EXPANSIVE, UNOBSTRUCTED VIEW)
            ══════════════════════════════════════════════════════════════ */}
        <div className="relative w-full min-h-[520px] sm:min-h-[580px] overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-inner flex flex-col justify-between">
          {/* THREE.JS REAL-TIME 3D CANVAS */}
          <GameCanvas3D
            mode={selectedGame}
            difficulty={difficulty}
            isPlaying={isPlaying}
            score={score}
            combo={combo}
            lives={lives}
            actionTrigger={actionTrigger}
            balloonsData={balloons}
            meteorsData={fallingWords}
            dronesData={defenseTargets}
          />

          {/* ══════════════════════════════════════════════════════════════
              TOP MINIMALIST CORNER STATUS HUD (ZERO CENTER BLOCKAGE)
              ══════════════════════════════════════════════════════════════ */}
          {isPlaying && (
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10 text-xs">
              {/* Top-Right: Game-specific status badge */}
              <div className="flex items-center gap-2">
                {selectedGame === 'bomb' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-red-500/70 shadow-lg flex items-center gap-2">
                    <Bomb className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="font-mono text-red-400 font-black text-sm">
                      {bombTimeLeft.toFixed(1)}s
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      | سیم {bombWireStage + 1} از ۵
                    </span>
                  </div>
                )}

                {selectedGame === 'boxing' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-violet-500/70 shadow-lg flex items-center gap-3">
                    <span className="text-blue-400 font-bold text-[11px]">
                      شما: {boxerPlayerHp}% HP
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-red-400 font-bold text-[11px]">
                      حریف: {boxerOpponentHp}% HP 🥊
                    </span>
                  </div>
                )}

                {selectedGame === 'chaser' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/70 shadow-lg flex items-center gap-3">
                    <span className="font-mono text-cyan-300 font-black text-sm">
                      {Math.round(chaserSpeedKmH)} KM/H
                    </span>
                    <span className="text-amber-400 font-bold text-[10px]">
                      فاصله رقیب: {Math.round(chaserObstacle.dist)}m
                    </span>
                  </div>
                )}

                {selectedGame === 'penalty' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-500/70 shadow-lg flex items-center gap-2">
                    <span className="font-bold text-amber-300">
                      پنالتی {penaltyShotsTaken + 1} از {penaltyShotsTotal} ⚽
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      (گل‌ها: {penaltyGoalsScored})
                    </span>
                  </div>
                )}

                {selectedGame === 'mining' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/70 shadow-lg flex items-center gap-2">
                    <span className="font-bold text-cyan-300">
                      {oreLevels[currentOreIdx].name}
                    </span>
                    <span className="text-amber-400 text-[10px] font-bold">
                      مقاومت: {rockDurability} ضربه
                    </span>
                  </div>
                )}

                {selectedGame === 'parkour' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-pink-500/70 shadow-lg flex items-center gap-2">
                    <span className="font-bold text-pink-300">
                      مسافت: {parkourMeters}m 🏃‍♂️
                    </span>
                    <span className="text-amber-400 text-[10px]">
                      مانع: {Math.round(obstacleDistance)}m
                    </span>
                  </div>
                )}

                {selectedGame === 'hacker' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-green-500/70 shadow-lg flex items-center gap-2 font-mono">
                    <span className="font-bold text-green-400">
                      FIREWALL RING: {hackerFirewallLevel}
                    </span>
                  </div>
                )}

                {selectedGame === 'defense' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/70 shadow-lg flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-300">سپر دفاعی پایگاه فعال</span>
                  </div>
                )}

                {selectedGame === 'balloon' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-purple-500/70 shadow-lg flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-purple-300">بالن‌های فعال در آسمان</span>
                  </div>
                )}

                {selectedGame === 'wordfall' && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-500/70 shadow-lg flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-amber-300">باران شهاب‌سنگ در مدار</span>
                  </div>
                )}
              </div>

              {/* Top-Left: Score, Combo & Dynamic Animated Lives */}
              <div className="flex items-center gap-2.5">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">امتیاز:</span>
                  <span className="font-mono text-amber-400 font-black text-sm">{score}</span>
                  <span className="text-cyan-400 font-mono font-bold text-xs">{combo}x 🔥</span>
                </div>

                <div
                  className={`relative px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border shadow-lg flex items-center gap-1.5 transition-all duration-300 ${
                    heartDamageAnim
                      ? 'border-red-500 shadow-red-500/50 scale-105 animate-bounce'
                      : heartGainAnim
                      ? 'border-emerald-500 shadow-emerald-500/50 scale-105'
                      : lives === 1
                      ? 'border-red-500/80 shadow-red-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Floating heart change notification */}
                  {heartNotification && (
                    <div
                      className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md font-black text-xs shadow-lg animate-bounce pointer-events-none whitespace-nowrap z-30 ${
                        heartNotification.type === 'gain'
                          ? 'bg-emerald-600 text-white border border-emerald-400'
                          : 'bg-red-600 text-white border border-red-400'
                      }`}
                    >
                      {heartNotification.text}
                    </div>
                  )}

                  {[1, 2, 3, 4].slice(0, maxLives).map((h) => {
                    const isAlive = h <= lives;
                    const isDanger = lives === 1 && isAlive;
                    return (
                      <Heart
                        key={h}
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-300 ${
                          isDanger
                            ? 'text-red-500 fill-red-500 scale-125 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,1)]'
                            : isAlive
                            ? 'text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]'
                            : 'text-slate-800 fill-slate-900/60 scale-90'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tactical 3-Lane Defense Radar HUD (Crystal clear target words with real-time keystroke highlight) */}
          {isPlaying && selectedGame === 'defense' && (
            <div className="absolute top-16 inset-x-0 px-3 z-10 pointer-events-none flex justify-center">
              <div className="max-w-2xl w-full grid grid-cols-3 gap-2 pointer-events-auto">
                {[0, 1, 2].map((laneIdx) => {
                  const laneNames = ['لاین راست (۱)', 'لاین وسط (۲)', 'لاین چپ (۳)'];
                  const target = defenseTargets.find((t) => t.lane === laneIdx);
                  const isTargeted = target && activeTargetId === target.id;
                  return (
                    <div
                      key={laneIdx}
                      className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all text-center flex flex-col items-center justify-between shadow-xl ${
                        target
                          ? isTargeted
                            ? 'bg-slate-950/95 border-emerald-400/90 shadow-emerald-500/30 ring-2 ring-emerald-500/60'
                            : 'bg-slate-950/90 border-red-500/80 shadow-red-500/20 ring-1 ring-red-500/50'
                          : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-bold mb-1">
                        <span>{laneNames[laneIdx]}</span>
                        {target && (
                          <span className="font-mono text-amber-400">
                            فاصله: {Math.round(target.distance)}٪
                          </span>
                        )}
                      </div>

                      {target ? (
                        <div className="space-y-1.5 w-full">
                          <div className="font-black text-base sm:text-lg text-white font-sans tracking-wide drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] flex justify-center">
                            {renderWordHighlight(target.word, target.id)}
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-red-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${100 - target.distance}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 py-2 font-medium">مسیر امن ✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating Active Word Targets for Wordfall (Meteors) */}
          {isPlaying && selectedGame === 'wordfall' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {fallingWords.map((w) => {
                const isTargeted = activeTargetId === w.id;
                return (
                  <div
                    key={w.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-2xl flex items-center justify-center pointer-events-auto ${
                      isTargeted
                        ? 'bg-slate-950/95 border-amber-400 ring-2 ring-amber-400/80 scale-110 shadow-amber-500/40 z-20'
                        : 'bg-slate-950/80 border-amber-500/40 shadow-black/60 z-10'
                    }`}
                    style={{ left: `${w.x}%`, top: `${w.y}%` }}
                  >
                    <span className="text-sm sm:text-base tracking-wider font-bold">
                      {renderWordHighlight(w.word, w.id)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Active Word Targets for Balloon Popper */}
          {isPlaying && selectedGame === 'balloon' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {balloons.map((b) => {
                const isTargeted = activeTargetId === b.id;
                return (
                  <div
                    key={b.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-2xl flex items-center justify-center pointer-events-auto ${
                      isTargeted
                        ? 'bg-slate-950/95 border-purple-400 ring-2 ring-purple-400/80 scale-110 shadow-purple-500/40 z-20'
                        : 'bg-slate-950/80 border-purple-500/40 shadow-black/60 z-10'
                    }`}
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  >
                    <span className="text-sm sm:text-base tracking-wider font-bold">
                      {renderWordHighlight(b.word, b.id)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              BOTTOM DOCKED ARCADE COMMAND CONSOLE (CLEAN & NON-INTRUSIVE)
              ══════════════════════════════════════════════════════════════ */}
          {isPlaying && currentActionMeta && (
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none">
              <div className="max-w-xl mx-auto rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl p-3 sm:p-4 flex flex-col items-center text-center space-y-1.5 pointer-events-auto">
                <span className={`text-xs font-bold ${currentActionMeta.color}`}>
                  {currentActionMeta.title}
                </span>
                <span className="text-2xl sm:text-4xl font-mono font-black text-amber-300 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                  {renderWordHighlight(currentActionMeta.word)}
                </span>
              </div>
            </div>
          )}

          {/* Hint for Multi-target 3D games (wordfall, balloon, defense) */}
          {isPlaying && !currentActionMeta && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center z-10 pointer-events-none">
              <div className="px-4 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>کلمات مستقیماً روی اشیاء سه‌بعدی قرار دارند؛ آن‌ها را تایپ کنید تا منهدم شوند</span>
              </div>
            </div>
          )}

          {/* Goal celebration banner for penalty */}
          {lastGoalCelebration && (
            <div className="absolute top-1/3 inset-x-0 flex justify-center z-20 pointer-events-none">
              <div className="px-8 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl shadow-2xl animate-bounce">
                ⚽ گــــــل تماشایی درون دروازه!
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VICTORY / GAME OVER MODAL (BALANCED REWARDS & ECONOMY)
              ══════════════════════════════════════════════════════════════ */}
          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center space-y-5 z-20 animate-in fade-in duration-200 p-6">
              <span className="text-6xl drop-shadow-xl animate-bounce">
                {isVictory || (selectedGame === 'bomb' && bombWireStage >= totalWires) ? '🏆' : '💥'}
              </span>

              <div className="text-center space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {isVictory || (selectedGame === 'bomb' && bombWireStage >= totalWires)
                    ? 'پیروزی در مأموریت! رکورد باشکوه ثبت شد'
                    : 'پایان راند و ثبت رکورد'}
                </h3>
                <p className="text-sm text-slate-300">
                  امتیاز نهایی کسب‌شده:{' '}
                  <span className="text-amber-400 font-mono font-bold text-lg">{score}</span> امتیاز
                </p>
              </div>

              {/* Economy Rewards Box */}
              {rewardBreakdown && (
                <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 max-w-sm w-full space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>پاداش به کیف پول:</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {rewardBreakdown.difficultyBonus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">سکه طلا</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        +{rewardBreakdown.coins}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">الماس درخشان</span>
                      <span className="text-lg font-black text-cyan-400 font-mono">
                        +{rewardBreakdown.diamonds} 💎
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">امتیاز XP</span>
                      <span className="text-lg font-black text-purple-400 font-mono">
                        +{rewardBreakdown.xp}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>بازی مجدد (کلید Space)</span>
                </button>
                {isModal && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    بستن پنجره
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Idle Screen */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 text-slate-400 p-6 z-10">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
                <Gamepad2 className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-md">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-lg font-black text-white">{gameTitles[selectedGame].title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                    {gameTitles[selectedGame].badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {gameTitles[selectedGame].desc}
                </p>
              </div>

              {/* Space start callout */}
              <div
                onClick={handleStartGame}
                className="cursor-pointer group flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-200 hover:bg-blue-600/30 transition shadow-lg mt-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black">
                  برای شروع فوری، کلید{' '}
                  <kbd className="px-2.5 py-1 bg-slate-900 border border-blue-400/50 rounded-lg text-amber-300 font-mono font-black text-xs shadow-xs mx-1">
                    Space (فاصله)
                  </kbd>{' '}
                  را بفشارید
                </span>
                <Play className="w-4 h-4 fill-current text-amber-400 group-hover:scale-110 transition-transform mr-1" />
              </div>
            </div>
          )}
        </div>

        {/* Start bar when idle */}
        {!isPlaying && !gameOver && (
          <div className="pt-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2.5 text-slate-400">
                <Keyboard className="w-4 h-4 text-blue-400" />
                <span>
                  بدون نیاز به کلیک موس — دست‌هایتان را روی کیبورد گذاشته و کلید{' '}
                  <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono font-bold text-xs">
                    Space
                  </kbd>{' '}
                  را بزنید.
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartGame}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>شروع بازی</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Mode Switcher Tab bar if allowed */}
        {allowModeSwitch && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-bold block mb-2">انتخاب بازی ۳D:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  'wordfall',
                  'defense',
                  'chaser',
                  'bomb',
                  'boxing',
                  'penalty',
                  'mining',
                  'parkour',
                  'hacker',
                  'balloon',
                ] as const
              ).map((m) => {
                const conf = gameTitles[m];
                const Icon = conf.icon;
                const isCur = selectedGame === m;

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedGame(m);
                      setIsPlaying(false);
                      setGameOver(false);
                    }}
                    className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2 ${
                      isCur
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCur ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="text-xs truncate">{conf.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
