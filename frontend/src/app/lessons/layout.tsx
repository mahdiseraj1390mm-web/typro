import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آموزش تایپ ده انگشتی رایگان | دروس استاندارد یادگیری تایپ سریع | تایپرو',
  description: 'کامل‌ترین دوره آموزش تایپ و یادگیری تایپ ده انگشتی در تایپرو. بیش از ۲۵۰ درس تعاملی استاندارد برای تسلط سریع بر صفحه کلید فارسی و انگلیسی، تقویت حافظه عضلانی انگشتان و صدور کارنامه و مدرک معتبر.',
  keywords: [
    'آموزش تایپ ده انگشتی',
    'یادگیری تایپ',
    'آموزش تایپ',
    'تایپ ده انگشتی',
    'تایپ',
    'یادگیری تایپ ده انگشتی',
    'آموزش تایپ ده انگشتی رایگان',
    'دروس آموزش تایپ',
    'تمرین تایپ ده انگشتی',
    'آموزش کار با صفحه کلید',
    'تایپ سریع',
    'تایپرو'
  ],
  alternates: {
    canonical: 'https://typro.ir/lessons'
  },
  openGraph: {
    title: 'آموزش تایپ ده انگشتی و دروس یادگیری تایپ | تایپرو',
    description: '۲۵۰ درس استاندارد آموزش تایپ ده انگشتی از سطح مبتدی تا پیشرفته در تایپرو.',
    url: 'https://typro.ir/lessons',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website'
  }
};

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
