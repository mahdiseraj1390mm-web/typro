import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تایپرو رایت (Typro Write) | ابزار هوشمند تایپ، نگارش و تبدیل صوت به متن',
  description: 'تایپرو رایت: کامل‌ترین محیط تایپ هوشمند و نگارش متون فارسی و انگلیسی. امکان تایپ صوتی، تبدیل عکس و سند به متن، غلط‌یابی خودکار و شمارش دقیق کلمات در سامانه تایپرو.',
  keywords: [
    'تایپرو رایت',
    'تایپرو',
    'تایپ',
    'نرم افزار تایپ',
    'تایپ صوتی',
    'تبدیل صوت به متن',
    'تبدیل عکس به متن',
    'ویرایشگر تایپ',
    'تایپ سریع و دقیق'
  ],
  alternates: {
    canonical: 'https://typro.ir/write',
  },
  openGraph: {
    title: 'تایپرو رایت (Typro Write) | ابزار پیشرفته تایپ هوشمند',
    description: 'ابزار حرفه‌ای نگارش، تایپ صوتی و تبدیل متن در سامانه تایپرو.',
    url: 'https://typro.ir/write',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website',
  },
};

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
