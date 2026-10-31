import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تست سرعت تایپ | تست تایپ آنلاین ده انگشتی فارسی و انگلیسی (WPM) | تایپرو',
  description: 'تست سرعت تایپ آنلاین و سنجش کلمات در دقیقه (WPM) در تایپرو. دقیق‌ترین آزمون تست تایپ ۱ تا ۵ دقیقه‌ای، محاسبه درصد دقت، آنالیز کلیدهای ضعیف و رده‌بندی کشوری.',
  keywords: [
    'تست تایپ',
    'تایپ',
    'تایپ ده انگشتی',
    'تست تایپ آنلاین',
    'تست سرعت تایپ',
    'مرجع تخصصی تایپ',
    'آموزش تایپ',
    'آموزش تایپ ده انگشتی',
    'صفحه کلید',
    'رقابت زنده',
    'سنجش سرعت تایپ WPM',
    'تایپرو'
  ],
  alternates: {
    canonical: 'https://typro.ir/typing-test'
  },
  openGraph: {
    title: 'تست تایپ آنلاین سریع و دقیق | سامانه تایپرو',
    description: 'سرعت تایپ ده انگشتی خودت را در ۱ دقیقه بسنج و در رنکینگ کشوری تایپرو رکورد بزن.',
    url: 'https://typro.ir/typing-test',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website'
  }
};

export default function TypingTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
