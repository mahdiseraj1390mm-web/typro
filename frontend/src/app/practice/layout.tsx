import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تمرینات تایپ هوشمند و تقویت کلیدهای ضعیف | تایپرو',
  description: 'مجموعه تمرینات تایپ پیشرفته، رفع نقاط ضعف انگشتان، تمرین تایپ کلمات سخت، علائم نگارشی و اعداد برای تسلط کامل بر کیبورد ده‌انگشتی.',
  keywords: [
    'تمرینات تایپ',
    'تمرین تایپ',
    'تمرین تایپ ده انگشتی',
    'تقویت سرعت تایپ',
    'تمرین کلیدهای کیبورد',
    'افزایش دقت تایپ',
    'تایپرو تمرین'
  ],
  alternates: {
    canonical: 'https://typro.ir/practice'
  },
  openGraph: {
    title: 'تمرینات تایپ هوشمند | تایپرو',
    description: 'تمرینات هدفمند برای تقویت حافظه عضلانی انگشتان و رفع خطاهای تایپ.',
    url: 'https://typro.ir/practice',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website'
  }
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
