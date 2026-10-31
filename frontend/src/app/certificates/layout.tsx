import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آزمون رسمی و دریافت مدرک تایپ معتبر با کد استعلام آنلاین | تایپرو',
  description: 'دریافت مدرک تایپ ده انگشتی رسمی با ثبت بارکد و شناسه استعلام آنلاین کشوری، ویژه رزومه کاری، سازمان‌ها و آزمون‌های استخدامی کشوری در سامانه تایپرو.',
  keywords: [
    'مدرک تایپ',
    'مدرک تایپ ده انگشتی',
    'گواهینامه تایپ',
    'مدرک تایپ برای استخدام',
    'استعلام مدرک تایپ',
    'آزمون رسمی تایپ',
    'تایپرو مدرک تایپ'
  ],
  alternates: {
    canonical: 'https://typro.ir/certificates'
  },
  openGraph: {
    title: 'دریافت مدرک تایپ معتبر | تایپرو',
    description: 'آزمون استاندارد و صدور آنی گواهینامه مهارت تایپ ده انگشتی با کد رهگیری رسمی.',
    url: 'https://typro.ir/certificates',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website'
  }
};

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
