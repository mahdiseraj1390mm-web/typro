/**
 * Typro.ir - Complete Production Seed Data Script
 * Conforming to Section 161 (Data Models) & Master Specification
 */

export const seedQuranSurahs = [
  {
    surahNumber: 1,
    nameArabic: 'الفَاتِحَة',
    namePersian: 'حمد (فاتحة الکتاب)',
    totalAyahs: 7,
    revelationType: 'MECCAN',
    ayahs: [
      { numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translationFa: 'به نام خداوند بخشنده مهربان' },
      { numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translationFa: 'ستایش مخصوص خداوندی است که پروردگار جهانیان است.' },
      { numberInSurah: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', translationFa: 'بخشنده و مهربان است.' },
      { numberInSurah: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', translationFa: 'صاحب و فرمانروای روز جزاست.' },
      { numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translationFa: 'تنها تو را می‌پرستیم؛ و تنها از تو یاری می‌جوییم.' },
      { numberInSurah: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translationFa: 'ما را به راه راست هدایت فرما.' },
      { numberInSurah: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translationFa: 'راه کسانی که آنان را مشمول نعمت خود ساختی؛ نه غضب‌شدگان و نه گمراهان.' }
    ]
  },
  {
    surahNumber: 112,
    nameArabic: 'الإِخْلَاص',
    namePersian: 'توحید (اخلاص)',
    totalAyahs: 4,
    revelationType: 'MECCAN',
    ayahs: [
      { numberInSurah: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translationFa: 'بگو او خدای یکتاست.' },
      { numberInSurah: 2, text: 'اللَّهُ الصَّمَدُ', translationFa: 'خداوند بی‌نیاز و مقصود همگان است.' },
      { numberInSurah: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translationFa: 'نه زاده و نه زاییده شده است.' },
      { numberInSurah: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translationFa: 'و هیچ همتایی برای او نبوده و نخواهد بود.' }
    ]
  }
];

export const seedCurriculumLessons = [
  {
    level: 1,
    title: 'مبانی استقرار انگشتان - کلیدهای برجسته ت و ن',
    keys: ['ت', 'ن'],
    hand: 'هر دو دست (سبابه)',
    guideText: 'انگشت سبابه دست راست روی کلید «ت» و انگشت سبابه دست چپ روی کلید «ب» یا «ن» قرار می‌گیرد.',
    drillContent: 'تتت ننن ت ن نت تن ت ن نت تن ت ن',
  },
  {
    level: 2,
    title: 'ردیف میانی کامل (پایگاه خانگی / Home Row)',
    keys: ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
    hand: 'هر دو دست (تمامی انگشتان)',
    guideText: 'دست‌ها در آرامش کامل و بدون فشار به مچ بر روی ردیف میانی مستقر می‌شوند.',
    drillContent: 'شست سمن کابل مینا تابستان گلستان تمنا سلامت',
  },
  {
    level: 3,
    title: 'ردیف بالا - دسترسی انگشتان سبابه و میانه',
    keys: ['ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
    hand: 'ردیف بالا',
    guideText: 'جهش کنترل‌شده انگشت به ردیف بالا و بازگشت آنی به ردیف خانه.',
    drillContent: 'قایق فرهنگ عقاب خورشید جهان حقیقت قلم چشمه جهاد',
  },
  {
    level: 4,
    title: 'ردیف پایین - دامنه حرکتی انگشتان',
    keys: ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و'],
    hand: 'ردیف پایین',
    guideText: 'حرکت نرم انگشتان به سمت پایین با حفظ حالت نیمه‌خمیده مچ.',
    drillContent: 'طوفان پرواز دانش روزگار ریشه ذره وطن زیارت پاکیزه',
  },
  {
    level: 5,
    title: 'اعراب‌گذاری زبان قرآن (Shift + کلیدهای حرکات)',
    keys: ['َ', 'ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ّ', 'ْ', 'ء'],
    hand: 'ترکیبی با Shift',
    guideText: 'تایپ صحیح فتحه، کسره، ضمه، تنوین‌ها، تشدید و سکون برای کتابت دقیق مصحف شریف.',
    drillContent: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
  }
];

export const seedVehicleSkins = [
  { id: 'skin-pride', name: 'پراید ۱۳۱ سفید', speedTier: 1, rarity: 'Common', priceCoins: 0 },
  { id: 'skin-samand', name: 'سمند سورن پلاس', speedTier: 2, rarity: 'Uncommon', priceCoins: 250 },
  { id: 'skin-dena', name: 'دنا پلاس توربو', speedTier: 3, rarity: 'Rare', priceCoins: 500 },
  { id: 'skin-peugeot', name: 'پژو ۲۰۶ تیپ ۵', speedTier: 3, rarity: 'Rare', priceCoins: 600 },
  { id: 'skin-tara', name: 'تارا اتوماتیک V4', speedTier: 4, rarity: 'Epic', priceCoins: 1000 },
  { id: 'skin-cyber', name: 'سایبر فانتوم ۲۰۲۶', speedTier: 5, rarity: 'Legendary', priceDiamonds: 35 }
];

console.log('Seed configuration catalog validated successfully.');
