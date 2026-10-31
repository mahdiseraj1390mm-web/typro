import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اشتراک تایپرو | خرید اشتراک ویژه، دوره‌های پیشرفته و مدرک معتبر تایپ',
  description: 'خرید اشتراک تایپرو: دسترسی نامحدود به تمامی سطوح آموزش تایپ ده انگشتی، مسابقات اختصاصی، اسکین‌های طلایی خودروها، آزمون‌های رسمی و دریافت گواهینامه معتبر مهارت تایپ.',
  keywords: [
    'اشتراک تایپرو',
    'تایپرو',
    'خرید اشتراک تایپرو',
    'پلن های تایپرو',
    'اشتراک ویژه تایپ',
    'آموزش تایپ ده انگشتی',
    'بهترین سامانه تایپ ده انگشتی',
    'مدرک تایپ معتبر'
  ],
  alternates: {
    canonical: 'https://typro.ir/subscription',
  },
  openGraph: {
    title: 'اشتراک تایپرو | دسترسی ویژه به آکادمی و مسابقات تایپ',
    description: 'با تهیه اشتراک تایپرو مهارت تایپ ده انگشتی خود را به سطح حرفه‌ای برسانید.',
    url: 'https://typro.ir/subscription',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website',
  },
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
