// Typro.ir - Vehicle Skins Data & Categories
// Aligned with Section 84 & 85 of Typro Specification

export type SkinCategoryType = 
  | 'all'
  | 'supercars'
  | 'motorcycles'
  | 'classic_iranian'
  | 'cyber';

export interface SkinCategoryDef {
  id: SkinCategoryType;
  nameFa: string;
  emoji: string;
  description: string;
}

export const SKIN_CATEGORIES: SkinCategoryDef[] = [
  { id: 'all', nameFa: 'همه پوسته‌ها', emoji: '🌟', description: 'مشاهده تمام وسایل نقلیه و سوپراسپرت‌های بازی' },
  { id: 'supercars', nameFa: 'سوپرکارها و هایپرکارها', emoji: '🏎️', description: 'پورشه، ب‌ام‌و، میتسوبیشی و شاسی‌بلندهای اسپرت' },
  { id: 'motorcycles', nameFa: 'موتورسیکلت‌های سنگین', emoji: '🏍️', description: 'هوندا CB300، هوندا CBR ریسینگ، سوزوکی GSX، کاوازاکی H2 و دوکاتی' },
  { id: 'classic_iranian', nameFa: 'کلاسیک و شهری', emoji: '🚗', description: 'بیتل کلاسیک و خودروهای محبوب شهری' },
];

export type VehicleVisualType = 'car' | 'motorcycle' | 'cyber';

export interface SkinItem {
  id: string;
  name: string;
  englishName: string;
  category: Exclude<SkinCategoryType, 'all'>;
  visualType: VehicleVisualType;
  tier: 'عادی' | 'کمیاب' | 'حماسی' | 'افسانه‌ای';
  tierEnglish: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  priceCoins: number;
  priceDiamonds: number;
  description: string;
  tagline: string;
  colorGradient: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  emoji: string;
  realImage?: string;
  raceImage?: string;
  features: string[];
}

export const ALL_SKINS: SkinItem[] = [
  // ============================================================
  // 1. خودروها و سوپراسپرت‌ها (Cars & Sports)
  // ============================================================
  {
    id: 'skin-porsche',
    name: 'پورشه ۹۱۱ توربو سفید اسپرت',
    englishName: 'Porsche 911 Turbo White',
    category: 'supercars',
    visualType: 'car',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 75000,
    priceDiamonds: 150,
    description: 'شاهکار اسپرت آلمانی با رینگ‌های مشکی فورج، کالیپرهای ترمز زرد، اسپویلر عقب و چسبندگی بی‌نظیر روی پیست.',
    tagline: 'اوج شتاب، هندلینگ بی‌نقص و پادشاهی در لاین مسابقه',
    colorGradient: 'from-slate-100 via-slate-300 to-slate-800',
    primaryColor: '#f8fafc',
    secondaryColor: '#334155',
    accentColor: '#eab308',
    glowColor: 'rgba(248, 250, 252, 0.5)',
    emoji: '🏎️',
    realImage: '/1.png',
    raceImage: '/images/skins/race/porsche_911.png',
    features: ['عکس واقعی پورشه ۹۱۱ بدون پس‌زمینه', 'حالت نیم‌رخ افقی رو به خط پایان', 'پرتاب آتش اگزوز در سرعت بالای ۵۰', 'رینگ‌های اسپرت مسابقه']
  },
  {
    id: 'skin-bmw-m6',
    name: 'ب‌ام‌و M6 گرن‌کوپه مشکی فورج',
    englishName: 'BMW M6 Gran Coupe Black',
    category: 'supercars',
    visualType: 'car',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 85000,
    priceDiamonds: 175,
    description: 'گرن‌کوپه پرچمدار باواریا با رنگ مشکی متالیک زغالی، کالیپرهای ترمز آبی ام‌پاور و پیشرانه توئین‌توربو پرقدرت.',
    tagline: 'ترکیب اصالت باواریایی با غرشی سهمگین در خط مستقیم',
    colorGradient: 'from-zinc-800 via-zinc-900 to-black',
    primaryColor: '#18181b',
    secondaryColor: '#27272a',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    emoji: '🏎️',
    realImage: '/4.png',
    raceImage: '/images/skins/race/bmw_m6.png',
    features: ['عکس واقعی ب‌ام‌و M6 بدون پس‌زمینه', 'نیم‌رخ افقی مماس بر لاین', 'آتش توربوشارژ در سرعت بالای ۵۰', 'خطوط تهاجمی M-Power']
  },
  {
    id: 'skin-mitsubishi',
    name: 'میتسوبیشی ASX قرمز متالیک',
    englishName: 'Mitsubishi ASX Red Metallic',
    category: 'supercars',
    visualType: 'car',
    tier: 'حماسی',
    tierEnglish: 'Epic',
    priceCoins: 35000,
    priceDiamonds: 75,
    description: 'کراس‌اوور ژاپنی خوش‌ساخت با رنگ یاقوتی براق، رینگ‌های دو رنگ برش الماس و شتاب مطمئن در مسابقات زنده.',
    tagline: 'چابک، بادوام و مطمئن در طولانی‌ترین رقابت‌های تایپ',
    colorGradient: 'from-red-600 via-rose-700 to-red-950',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#f1f5f9',
    glowColor: 'rgba(220, 38, 38, 0.45)',
    emoji: '🚗',
    realImage: '/2.png',
    raceImage: '/images/skins/race/mitsubishi_asx.png',
    features: ['عکس واقعی میتسوبیشی بدون پس‌زمینه', 'نمای جانبی افقی رو به جلو', 'شتاب بالا در رقابت آنلاین', 'آتش توربو در شتاب ۵۰+']
  },
  {
    id: 'skin-bmw-x6',
    name: 'ب‌ام‌و X6 پرفورمنس سفید',
    englishName: 'BMW X6 Performance White',
    category: 'supercars',
    visualType: 'car',
    tier: 'حماسی',
    tierEnglish: 'Epic',
    priceCoins: 50000,
    priceDiamonds: 100,
    description: 'شاسی‌بلند کوپه قدرتمند با خطوط تهاجمی سقف، باله اسپرت عقب، رینگ‌های ۵ پره فورج و ابهت خاص در جاده.',
    tagline: 'عظمت و سرعت مافوق تصور روی خط شروع مسابقه',
    colorGradient: 'from-slate-100 via-slate-200 to-zinc-900',
    primaryColor: '#f1f5f9',
    secondaryColor: '#0f172a',
    accentColor: '#0284c7',
    glowColor: 'rgba(241, 245, 249, 0.45)',
    emoji: '🏎️',
    realImage: '/6.png',
    raceImage: '/images/skins/race/bmw_x6.png',
    features: ['عکس واقعی ب‌ام‌و X6 بدون پس‌زمینه', 'نیم‌رخ افقی به سمت خط پایان', 'پرتاب آتش از خروجی اگزوز دوبل', 'پایداری عالی در لاین']
  },
  {
    id: 'skin-kia-sportage',
    name: 'کیا اسپورتیج شاسی‌بلند سفید مدرن',
    englishName: 'Kia Sportage White Modern SUV',
    category: 'supercars',
    visualType: 'car',
    tier: 'کمیاب',
    tierEnglish: 'Rare',
    priceCoins: 20000,
    priceDiamonds: 50,
    description: 'شاسی‌بلند مدرن با چراغ‌های بومرنگی تیز، سقف مشکی پانوراما، رینگ‌های آیرودینامیک و سواری نرم.',
    tagline: 'استایل آینده‌نگرانه با کارایی بالا در تمرین‌های گروهی',
    colorGradient: 'from-slate-200 via-gray-300 to-slate-800',
    primaryColor: '#e2e8f0',
    secondaryColor: '#1e293b',
    accentColor: '#f97316',
    glowColor: 'rgba(226, 232, 240, 0.4)',
    emoji: '🚗',
    realImage: '/5.png',
    raceImage: '/images/skins/race/kia_sportage.png',
    features: ['عکس واقعی کیا اسپورتیج بدون پس‌زمینه', 'افقی و تراز روی زمین مسابقه', 'آتش اگزوز در سرعت بالای ۵۰', 'چراغ‌های خطی مدرن']
  },
  {
    id: 'skin-vw-beetle',
    name: 'فولکس‌واگن بیتل کلاسیک (استارتر پیش‌فرض)',
    englishName: 'Volkswagen Beetle Classic (Default Starter)',
    category: 'classic_iranian',
    visualType: 'car',
    tier: 'عادی',
    tierEnglish: 'Common',
    priceCoins: 0,
    priceDiamonds: 0,
    description: 'اسکین پیش‌فرض و رایگان برای همه کاربران تایپرو. با این خودرو شروع کنید و بیشتر بیاموزید!',
    tagline: 'رایگان برای همه — شروع سفر تایپرو با بیتل کلاسیک',
    colorGradient: 'from-stone-600 via-stone-700 to-stone-900',
    primaryColor: '#57534e',
    secondaryColor: '#1c1917',
    accentColor: '#ef4444',
    glowColor: 'rgba(87, 83, 78, 0.45)',
    emoji: '🚗',
    realImage: '/3.png',
    raceImage: '/images/skins/race/vw_beetle.png',
    features: ['رایگان برای همه کاربران ✓', 'اسکین پیش‌فرض مسابقات', 'باله اسپرت مسابقه', 'آتش اگزوز در شتاب ۵۰+']
  },


  // ============================================================
  // 2. موتورسیکلت‌های سنگین (Superbikes & Motorcycles)
  // ============================================================
  {
    id: 'skin-honda-cbr-red',
    name: 'موتورسیکلت هوندا CBR300R قرمز ریسینگ',
    englishName: 'Honda CBR300R Red Racing',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 55000,
    priceDiamonds: 110,
    description: 'سوپربایک آیرودینامیک با فیرینگ کامل مسابقه‌ای قرمز آتشین، اگزوز کروم استیل، دیسک‌های برمبو و تک‌چرخ هیجانی.',
    tagline: 'غرش انجین مسابقه‌ای هوندا با شتاب آتشین در لاین رقابت',
    colorGradient: 'from-rose-600 via-red-700 to-red-950',
    primaryColor: '#e11d48',
    secondaryColor: '#991b1b',
    accentColor: '#fbbf24',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    emoji: '🏍️',
    realImage: '/mo2.png',
    raceImage: '/images/skins/race/honda_cbr300_red.png',
    features: ['عکس واقعی هوندا CBR بدون پس‌زمینه', 'تک‌چرخ زدن دیدنی در سرعت بالای ۵۰', 'پرتاب آتش از خروجی اگزوز', 'نیم‌رخ افقی مماس بر آسفالت']
  },
  {
    id: 'skin-suzuki-gsx-blue',
    name: 'موتورسیکلت سوزوکی GSX-S آبی متالیک',
    englishName: 'Suzuki GSX-S Blue Metallic',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 75000,
    priceDiamonds: 150,
    description: 'استریت‌فایتر جسور ژاپنی با باک فیروزه‌ای متالیک، دوشاخ طلایی، انجین ۴ سیلندر خشمگین و تک‌چرخ تماشایی.',
    tagline: 'سرعت و قدرت مطلق با رنگ آبی الکتریکی در لاین مسابقه',
    colorGradient: 'from-cyan-500 via-blue-600 to-blue-950',
    primaryColor: '#0284c7',
    secondaryColor: '#1e3a8a',
    accentColor: '#f59e0b',
    glowColor: 'rgba(2, 132, 199, 0.5)',
    emoji: '🏍️',
    realImage: '/mo5.png',
    raceImage: '/images/skins/race/suzuki_gsxs_blue.png',
    features: ['عکس واقعی سوزوکی GSX بدون پس‌زمینه', 'تک‌چرخ زدن در سرعت بالای ۵۰', 'آتش اگزوز در شتاب بالا', 'جهت افقی رو به خط پایان']
  },
  {
    id: 'skin-honda-cb-black',
    name: 'موتورسیکلت هوندا CB300R مشکی مات',
    englishName: 'Honda CB300R Matte Black',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'حماسی',
    tierEnglish: 'Epic',
    priceCoins: 38000,
    priceDiamonds: 80,
    description: 'نیکدبایک مدرن با رنگ مشکی مات تهاجمی، شاسی مشبک لوله‌ای، هدلایت دایره‌ای ال‌ای‌دی و تک‌چرخ جسورانه.',
    tagline: 'ابهت تیره، شتاب آنی و فرمان‌پذیری خارق‌العاده',
    colorGradient: 'from-zinc-700 via-zinc-800 to-black',
    primaryColor: '#27272a',
    secondaryColor: '#09090b',
    accentColor: '#e4e4e7',
    glowColor: 'rgba(39, 39, 42, 0.45)',
    emoji: '🏍️',
    realImage: '/mo4.png',
    raceImage: '/images/skins/race/honda_cb300_black.png',
    features: ['عکس واقعی هوندا CB مشکی بدون پس‌زمینه', 'تک‌چرخ هیجانی در سرعت بالای ۵۰', 'آتش اگزوز اسپرت', 'طراحی مینیمال و دارک']
  },
  {
    id: 'skin-honda-cb-white',
    name: 'موتورسیکلت هوندا CB300F سفید اسپرت',
    englishName: 'Honda CB300F White Sport',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'کمیاب',
    tierEnglish: 'Rare',
    priceCoins: 22000,
    priceDiamonds: 55,
    description: 'موتور شهری خوش‌دست با باک سفید برفی، دیسک‌های خنک‌شونده، اگزوز استیل و شتاب عالی در استارت مسابقه.',
    tagline: 'چابک‌ترین موتورسیکلت برای شروع طوفانی در پیست',
    colorGradient: 'from-slate-100 via-slate-300 to-slate-800',
    primaryColor: '#f1f5f9',
    secondaryColor: '#1e293b',
    accentColor: '#dc2626',
    glowColor: 'rgba(241, 245, 249, 0.4)',
    emoji: '🏍️',
    realImage: '/mo1.png',
    raceImage: '/images/skins/race/honda_cb300_white.png',
    features: ['عکس واقعی هوندا CB سفید بدون پس‌زمینه', 'تک‌چرخ دیدنی در سرعت ۵۰+', 'رو به خط پایان سمت راست', 'آتش خروجی اگزوز']
  },
  {
    id: 'skin-suzuki-bking',
    name: 'سوزوکی بی‌کینگ ۱۳۰۰ نقره‌ای متالیک',
    englishName: 'Suzuki B-King 1300 Silver',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 110000,
    priceDiamonds: 220,
    description: 'هیولای نیکد ژاپنی با انجین قدرتمند هایابوسا، اگزوزهای دوبل زیر زین، شاسی آلومینیومی و تک‌چرخ سهمگین.',
    tagline: 'پادشاه خیابان‌ها با شتاب باورنکردنی و ابهت بی‌پایان',
    colorGradient: 'from-slate-300 via-zinc-400 to-zinc-900',
    primaryColor: '#e2e8f0',
    secondaryColor: '#334155',
    accentColor: '#f59e0b',
    glowColor: 'rgba(226, 232, 240, 0.5)',
    emoji: '🏍️',
    realImage: '/بیکینگ.png',
    raceImage: '/images/skins/race/suzuki_bking.png',
    features: ['عکس واقعی سوزوکی بی‌کینگ بدون پس‌زمینه', 'انجین هایابوسا با تک‌چرخ ۵۰+', 'آتش اگزوز دوبل پرقدرت', 'نیم‌رخ افقی مماس بر زمین']
  },
  {
    id: 'skin-ducati-pramac',
    name: 'دوکاتی پانیگاله پراماک ریسینگ',
    englishName: 'Ducati Panigale Pramac Racing',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 130000,
    priceDiamonds: 260,
    description: 'شاهکار موتو‌جی‌پی ایتالیا با طرح مسابقه‌ای فیروزه‌ای پراماک، تک‌دوشاخ عقب، بالچه‌های آیرودینامیک فیبر کربن.',
    tagline: 'آدرنالین خالص پیست‌های جهانی با بالاترین تکنولوژی موتو جی‌پی',
    colorGradient: 'from-cyan-400 via-teal-600 to-slate-950',
    primaryColor: '#06b6d4',
    secondaryColor: '#0f172a',
    accentColor: '#10b981',
    glowColor: 'rgba(6, 182, 212, 0.55)',
    emoji: '🏍️',
    realImage: '/دوکاتی.png',
    raceImage: '/images/skins/race/ducati_pramac.png',
    features: ['اسکین واقعی دوکاتی موتو جی‌پی', 'طرح پراماک ریسینگ بدون بک‌گراند', 'تک‌چرخ زدن فوق‌سریع در شتاب ۵۰+', 'آتش آتشین از اگزوز مسابقه']
  },
  {
    id: 'skin-kawasaki-z1000',
    name: 'کاوازاکی Z1000 استریت‌فایتر سبز شوگومی',
    englishName: 'Kawasaki Z1000 Sugomi Green',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 85000,
    priceDiamonds: 170,
    description: 'درنده ژاپنی با فلسفه طراحی شوگومی، رگه‌های سبز کاوازاکی، هدلایت‌های دوگانه خشمگین و ۴ اگزوز اسپرت.',
    tagline: 'نگاه درنده و شتاب آنی که هیچ رقیبی جلودار آن نیست',
    colorGradient: 'from-emerald-500 via-green-600 to-zinc-950',
    primaryColor: '#10b981',
    secondaryColor: '#052e16',
    accentColor: '#4ade80',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    emoji: '🏍️',
    realImage: '/زد هزار.png',
    raceImage: '/images/skins/race/kawasaki_z1000.png',
    features: ['عکس واقعی کاوازاکی Z1000 بدون پس‌زمینه', 'سبک استریت‌فایتر با تک‌چرخ زدن', 'آتش خروجی در سرعت بالای ۵۰', 'جهت رو به خط پایان']
  },
  {
    id: 'skin-suzuki-gsxr',
    name: 'سوزوکی GSX-R 1000 سوپربایک ریسینگ آبی',
    englishName: 'Suzuki GSX-R 1000 Blue Racing',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 95000,
    priceDiamonds: 190,
    description: 'افسانه مسابقات با فیرینگ آبی و سفید ریسینگ، نشان معروف R قرمز، ترمزهای مسابقه‌ای و چسبندگی میخکوب‌کننده.',
    tagline: 'قهرمان پیست‌های سرعت با غرش هیجان‌انگیز ۴ سیلندر خطی',
    colorGradient: 'from-blue-500 via-blue-700 to-slate-950',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e3a8a',
    accentColor: '#ef4444',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    emoji: '🏍️',
    realImage: '/سوزوکی.png',
    raceImage: '/images/skins/race/suzuki_gsxr.png',
    features: ['عکس واقعی سوزوکی ریسینگ بدون بک‌گراند', 'تک‌چرخ زدن در سرعت ۵۰+', 'پرتاب آتش از لوله اگزوز', 'نیم‌رخ افقی مماس بر آسفالت']
  },
  {
    id: 'skin-honda-cb1300',
    name: 'هوندا CB1300 سوپرفور سفید قرمز اصیل',
    englishName: 'Honda CB1300 Super Four White/Red',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'حماسی',
    tierEnglish: 'Epic',
    priceCoins: 65000,
    priceDiamonds: 130,
    description: 'اسطوره کلاسیک ژاپنی با باک سفید و خطوط قرمز آتشین، انجین ۱۳۰۰ سی‌سی عظیم، کمک‌فنرهای گازی و صدای بم ناب.',
    tagline: 'اصالت ماندگار و قدرت بی‌پایان در خط مستقیم مسابقه',
    colorGradient: 'from-slate-100 via-rose-500 to-red-900',
    primaryColor: '#f8fafc',
    secondaryColor: '#dc2626',
    accentColor: '#fbbf24',
    glowColor: 'rgba(220, 38, 38, 0.45)',
    emoji: '🏍️',
    realImage: '/سی بی.png',
    raceImage: '/images/skins/race/honda_cb1300.png',
    features: ['عکس واقعی هوندا CB1300 بدون پس‌زمینه', 'تک‌چرخ اصیل در سرعت بالای ۵۰', 'اگزوز غران با پرتاب آتش', 'رو به خط پایان مسابقه']
  },
  {
    id: 'skin-kawasaki-h2',
    name: 'کاوازاکی نینجا H2 سوپرشارژ کربن',
    englishName: 'Kawasaki Ninja H2 Supercharged',
    category: 'motorcycles',
    visualType: 'motorcycle',
    tier: 'افسانه‌ای',
    tierEnglish: 'Legendary',
    priceCoins: 150000,
    priceDiamonds: 300,
    description: 'شاهکار سوپرشارژر جهان با فیرینگ کربن مات، شاسی مشبک سبز فسفری، بالچه‌های آیرودینامیک و شتاب مافوق‌صوت.',
    tagline: 'سریع‌ترین هیولای تاریخ با صدای سوت مهیب سوپرشارژر',
    colorGradient: 'from-zinc-700 via-zinc-900 to-black',
    primaryColor: '#18181b',
    secondaryColor: '#15803d',
    accentColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.55)',
    emoji: '🏍️',
    realImage: '/کاوازکی.png',
    raceImage: '/images/skins/race/kawasaki_h2.png',
    features: ['عکس واقعی کاوازاکی نینجا H2 سوپرشارژ', 'بدون پس‌زمینه در مسابقه زنده', 'تک‌چرخ زدن مهیج در سرعت ۵۰+', 'زبانه کشیدن آتش اگزوز']
  },

];

// Compatibility aliases for any previously selected skin IDs
const SKIN_ALIASES: Record<string, string> = {
  'skin-ferrari': 'skin-porsche',
  'skin-lamborghini': 'skin-porsche',
  'skin-paykan': 'skin-vw-beetle',
  'skin-camaro': 'skin-bmw-m6',
  'skin-mustang': 'skin-mitsubishi',
  'skin-audi-r8': 'skin-bmw-x6',
  'skin-mclaren': 'skin-bmw-m6',
  'skin-bmw-m5': 'skin-bmw-m6',
  'skin-dena': 'skin-bmw-m6',
  'skin-peugeot': 'skin-vw-beetle',
  'skin-samand': 'skin-kia-sportage',
  'skin-yamaha-r1': 'skin-suzuki-gsx-blue',
  'skin-ducati': 'skin-honda-cbr-red',
  'skin-harley': 'skin-honda-cb-black',
  'skin-cg125': 'skin-honda-cb-white',
  'skin-ninja-h2': 'skin-kawasaki-h2',
  'skin-steve-minecart': 'skin-porsche',
  'skin-creeper-kart': 'skin-bmw-m6',
  'skin-minecraft-anime': 'skin-porsche',
  'skin-minecraft-penguin': 'skin-kawasaki-h2',
  'skin-mc-gladiator': 'skin-porsche',
  'skin-mc-patrick': 'skin-bmw-m6',
  'skin-mc-anime': 'skin-porsche',
  'skin-mc-goth': 'skin-bmw-x6',
  'skin-mc-angel': 'skin-porsche',
  'skin-mc-neko': 'skin-mitsubishi',
  'skin-mc-ender': 'skin-bmw-x6',
  'skin-mc-cat-gauntlet': 'skin-vw-beetle',
  'skin-mc-ninja-penguin': 'skin-kawasaki-h2'
};

// ─── Default Starter Skin ───────────────────────────────────────────────────
export const DEFAULT_SKIN_ID = 'skin-vw-beetle';

export function getSkinById(skinId: string): SkinItem {
  const resolvedId = SKIN_ALIASES[skinId] || skinId;
  return ALL_SKINS.find((s) => s.id === resolvedId) || ALL_SKINS.find((s) => s.id === DEFAULT_SKIN_ID) || ALL_SKINS[0];
}

// Returns true if this skin should be unlocked by default for all users (free/starter)
export function isSkinFreeDefault(skinId: string): boolean {
  return skinId === DEFAULT_SKIN_ID;
}
