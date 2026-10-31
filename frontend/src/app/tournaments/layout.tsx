import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'رقابت تایپ و تورنمنت‌های مسابقه زنده کشوری | تایپرو',
  description: 'در بزرگترین رقابت تایپ و تورنمنت‌های مسابقه زنده آنلاین تایپرو شرکت کنید! رقابت بر سر جوایز نقدی، کاپ قهرمانی کشوری و رنکینگ سریع‌ترین تایپیست‌های ایران.',
  keywords: [
    'رقابت تایپ',
    'مسابقه زنده',
    'مسابقه زنده تایپ',
    'تورنمنت تایپ',
    'مسابقات تایپ کشوری',
    'تایپ ده انگشتی',
    'تایپ سریع و دقیق',
    'تایپرو'
  ],
  alternates: {
    canonical: 'https://typro.ir/tournaments',
  },
  openGraph: {
    title: 'رقابت تایپ و تورنمنت‌های مسابقه زنده | تایپرو',
    description: 'هیجان رقابت تایپ آنلاین و بردن جوایز قهرمانی در تایپرو.',
    url: 'https://typro.ir/tournaments',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website',
  },
};

export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
