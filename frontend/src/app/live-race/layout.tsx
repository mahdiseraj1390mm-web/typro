import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'رقابت زنده تایپ یک مسابقه اتومبیل‌رانی آنلاین | مسابقه زنده تایپرو',
  description: 'در رقابت زنده تایپ یک مسابقه اتومبیل‌رانی آنلاین شرکت کنید! مسابقه سرعت چندنفره تایپ ده انگشتی در پیست‌های هیجان‌انگیز، گاز دادن با کیبورد و دریافت جوایز نقدی.',
  keywords: [
    'رقابت زنده',
    'رقابت زنده تایپ',
    'تایپ',
    'تایپ ده انگشتی',
    'مرجع تخصصی تایپ',
    'آموزش تایپ',
    'آموزش تایپ ده انگشتی',
    'صفحه کلید',
    'تست تایپ',
    'مسابقه زنده تایپ',
    'بازی تایپ ماشین',
    'تایپرو'
  ],
  alternates: {
    canonical: 'https://typro.ir/live-race'
  },
  openGraph: {
    title: 'مسابقه زنده تایپ و رقابت تایپ آنلاین اتومبیل‌رانی | تایپرو',
    description: 'در پیست‌های زنده چندنفره تایپرو رقابت کن و با سرعت و دقت بالا کاپ طلا ببر.',
    url: 'https://typro.ir/live-race',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website'
  }
};

export default function LiveRaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
