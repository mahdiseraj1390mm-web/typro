import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'دوره‌های آموزشی تایپ ده انگشتی و یادگیری تایپ سریع | تایپرو',
  description: 'دوره‌های جامع و تخصصی آموزش تایپ ده انگشتی، یادگیری تایپ سریع و دقیق فارسی و انگلیسی، برنامه‌نویسی و آزمون‌های استخدامی در سامانه تایپرو.',
  keywords: [
    'آموزش تایپ',
    'آموزشی تایپ ده انگشتی',
    'یادگیری تایپ',
    'دوره های آموزشی تایپ',
    'تایپ ده انگشتی',
    'بهترین سامانه تایپ ده انگشتی',
    'بروز ترین سامانه تایپ ده انگشتی',
    'تایپرو'
  ],
  alternates: {
    canonical: 'https://typro.ir/courses',
  },
  openGraph: {
    title: 'دوره‌های آموزش تایپ ده انگشتی | تایپرو',
    description: 'یادگیری علمی و گام‌به‌گام تایپ ده انگشتی با دوره‌های استاندارد تایپرو.',
    url: 'https://typro.ir/courses',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website',
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
