import { Injectable } from '@nestjs/common';

export interface ContentItem {
  id: string;
  title: string;
  category: 'quran' | 'hadith' | 'literature' | 'science' | 'technology' | 'code' | 'martyrs';
  text: string;
  language: 'fa' | 'en';
  difficulty: 'easy' | 'medium' | 'hard';
  surahNumber?: number;
  ayahNumber?: number;
  translationFa?: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  author?: string;
}

@Injectable()
export class ContentService {
  private contentItems: ContentItem[] = [
    {
      id: 'cnt-quran-1',
      title: 'سوره مبارکه اخلاص',
      category: 'quran',
      text: 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      language: 'fa',
      difficulty: 'easy',
      surahNumber: 112,
      ayahNumber: 1,
      translationFa: 'بگو او خدای یکتاست، خدای بی‌نیاز، نه زاده و نه زاییده شده، و هیچ همتایی ندارد.',
      status: 'published',
    },
    {
      id: 'cnt-tech-1',
      title: 'معماری مدرن وب و تایپ ده‌انگشتی',
      category: 'technology',
      text: 'تسلط بر کلیدهای میانبر و تایپ بدون نگاه به صفحه‌کلید، راندمان حل مسئله در برنامه‌نویسی را تا ۳۰۰ درصد ارتقا می‌دهد.',
      language: 'fa',
      difficulty: 'medium',
      status: 'published',
    },
    {
      id: 'cnt-lit-1',
      title: 'گلستان سعدی - در سیرت پادشاهان',
      category: 'literature',
      text: 'بنی‌آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند. چو عضوی به درد آورد روزگار، دگر عضوها را نماند قرار.',
      language: 'fa',
      difficulty: 'medium',
      status: 'published',
    },
    {
      id: 'cnt-en-1',
      title: 'Algorithm Design & Speed',
      category: 'code',
      text: 'Efficient data structures and optimized algorithms form the core foundations of scalable software engineering.',
      language: 'en',
      difficulty: 'hard',
      status: 'published',
    },
  ];

  getAll(category?: string, language?: string): ContentItem[] {
    return this.contentItems.filter((item) => {
      if (category && item.category !== category) return false;
      if (language && item.language !== language) return false;
      return true;
    });
  }

  getById(id: string): ContentItem | undefined {
    return this.contentItems.find((c) => c.id === id);
  }

  create(item: Omit<ContentItem, 'id'>): ContentItem {
    const newItem: ContentItem = {
      ...item,
      id: `cnt-${Date.now()}`,
    };
    this.contentItems.push(newItem);
    return newItem;
  }
}
