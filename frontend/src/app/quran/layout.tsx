import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تایپ سوره های کوچک قرآن کریم روان و آسان | تایپرو Typro.ir',
  description: 'آموزش و آزمون کتابت و تایپ سوره‌های کوچک قرآن کریم بدون نیاز به اعراب دشوار. انتخاب سوره و بازه دلخواه از آیه تا آیه، تثبیت حفظ قرآن و تقویت سرعت تایپ.',
  keywords: [
    'تایپ سوره های کوچک قرآن',
    'تایپ قرآن',
    'کتابت قرآن آنلاین',
    'تایپ سوره توحید',
    'تایپ سوره کوثر',
    'تایپ آیه الکرسی',
    'حفظ قرآن با تایپ',
    'تایپ ده انگشتی قرآن',
    'تایپرو قرآن'
  ],
  alternates: {
    canonical: 'https://typro.ir/quran'
  },
  openGraph: {
    title: 'تایپ سوره های کوچک قرآن کریم | تایپرو',
    description: 'سامانه کتابت و تایپ آسان سوره‌های منتخب قرآن کریم با امکان تعیین بازه آیات و صوت تلاوت.',
    url: 'https://typro.ir/quran',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'article'
  }
};

export default function QuranLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
