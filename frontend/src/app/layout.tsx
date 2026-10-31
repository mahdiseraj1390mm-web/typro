import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { AuthProvider } from '@/context/AuthContext';
import AmbientBackground from '@/components/layout/AmbientBackground';
import GlobalTrafficTracker from '@/components/common/GlobalTrafficTracker';
import GlobalAdminMessageModal from '@/components/common/GlobalAdminMessageModal';

export const metadata: Metadata = {
  metadataBase: new URL('https://typro.ir'),
  title: {
    default: 'آموزش تایپ ده انگشتی | یادگیری تایپ سریع، تست سرعت و رقابت آنلاین | تایپرو',
    template: '%s | تایپرو - آموزش تایپ ده انگشتی و تست سرعت'
  },
  description: 'تایپرو مرجع اصلی آموزش تایپ ده انگشتی و یادگیری تایپ سریع در ایران. آموزش رایگان تایپ فارسی و انگلیسی از صفر تا صد، ۲۵۰ درس استاندارد، تست سرعت تایپ آنلاین (WPM)، رقابت زنده اتومبیل‌رانی و اعطای مدرک رسمی.',
  keywords: [
    'تایپ ده انگشتی',
    'آموزش تایپ ده انگشتی',
    'یادگیری تایپ',
    'آموزش تایپ',
    'تایپ',
    'یادگیری تایپ ده انگشتی',
    'آموزش تایپ سریع',
    'تست تایپ',
    'تست سرعت تایپ',
    'تست تایپ آنلاین',
    'تایپ فارسی ده انگشتی',
    'آموزش تایپ ده انگشتی رایگان',
    'آموزش کار با صفحه کلید',
    'تمرین تایپ ده انگشتی',
    'مسابقه تایپ',
    'رقابت زنده تایپ',
    'تایپرو',
    'Typro.ir'
  ],
  authors: [{ name: 'تایپرو - Typro.ir' }],
  creator: 'تایپرو',
  publisher: 'Typro.ir',
  applicationName: 'تایپرو | سامانه جامع آموزش تایپ ده انگشتی',
  alternates: {
    canonical: 'https://typro.ir',
    languages: {
      'fa-IR': 'https://typro.ir'
    }
  },
  verification: {
    google: 'rm63mXyx_B6eN-m_MCdYPwG84GzD5SboFxjIrL5WVt8',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'آموزش تایپ ده انگشتی و یادگیری تایپ سریع | تایپرو',
    description: 'کامل‌ترین سامانه آموزش تایپ ده انگشتی رایگان، تست سرعت آنلاین، مسابقه زنده اتومبیل‌رانی و تسلط کامل بر صفحه کلید.',
    url: 'https://typro.ir',
    siteName: 'تایپرو | Typro.ir',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: '/images/typro-logo.png',
        width: 800,
        height: 800,
        alt: 'لوگوی رسمی تایپرو - مرجع تخصصی تایپ و آموزش تایپ ده انگشتی در ایران'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تایپ: کامل‌ترین سامانه آموزش تایپ ده انگشتی و تست سرعت آنلاین | تایپرو',
    description: 'تایپرو کامل‌ترین سامانه آموزش تایپ ده انگشتی، تست سرعت تایپ آنلاین (WPM)، رقابت زنده اتومبیل‌رانی و تسلط بر صفحه کلید.',
    images: ['/images/typro-logo.png']
  }
};

// Rich Structured Data Schema (JSON-LD) for Maximum Google Authority & Rank #1 Position
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://typro.ir/#website',
      url: 'https://typro.ir',
      name: 'تایپرو: سامانه تخصصی آموزش تایپ ده انگشتی و تست سرعت تایپ',
      alternateName: ['تایپرو', 'Typro', 'Typro.ir', 'آموزش تایپ ده انگشتی', 'تست تایپ'],
      description: 'کامل‌ترین سامانه آموزش تایپ ده انگشتی، تست تایپ سریع، رقابت زنده اتومبیل‌رانی و تسلط بر صفحه کلید در ایران',
      inLanguage: 'fa-IR',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://typro.ir/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'ItemList',
      '@id': 'https://typro.ir/#sitelinks',
      name: 'بخش‌های برتر سامانه تایپرو برای جستجوی گوگل',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'آموزش تایپ ده انگشتی و دروس آکادمی',
          description: '۲۵۰ درس تعاملی استاندارد تقویت حافظه عضلانی انگشتان بدون نگاه به کیبورد',
          url: 'https://typro.ir/lessons',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'تست سرعت تایپ آنلاین ده انگشتی WPM',
          description: 'سنجش دقیق سرعت و دقت تایپ ده انگشتی فارسی و انگلیسی در ۱ دقیقه',
          url: 'https://typro.ir/typing-test',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'راهنمای جامع یادگیری تایپ ده انگشتی',
          description: 'اصول ارگونومی، کلیدهای شاخص ف و ت و متدهای افزایش سرعت تایپ',
          url: 'https://typro.ir/guide',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'رقابت و مسابقه زنده تایپ اتومبیل‌رانی',
          description: 'مسابقه زنده چندنفره تایپ ده انگشتی در پیست‌های سرعت خودرویی آنلاین',
          url: 'https://typro.ir/live-race',
        },
        {
          '@type': 'SiteNavigationElement',
          position: 5,
          name: 'ویرایشگر هوشمند تایپرو رایت',
          description: 'دستیار تایپ پیشرفته، اصلاح نیم‌فاصله خودکار و ویراستاری متن',
          url: 'https://typro.ir/write',
        },
      ],
    },
    {
      '@type': 'HowTo',
      '@id': 'https://typro.ir/#howto-touch-typing',
      name: 'چگونه تایپ ده انگشتی یاد بگیریم؟ (راهنمای یادگیری تایپ سریع در ۵ مرحله)',
      description: 'مراحل گام‌به‌گام یادگیری تایپ ده انگشتی بدون نگاه کردن به صفحه کلید با اصول حافظه عضلانی در تایپرو.',
      totalTime: 'P14D',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'قرار دادن انگشتان روی ردیف پایگاه (Home Row)',
          text: 'انگشتان اشاره هر دو دست را روی کلیدهای شاخص برجسته ف (دست چپ) و ت (دست راست) قرار دهید و سایر انگشتان را روی کلیدهای مجاور بگذارید.',
          url: 'https://typro.ir/guide'
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'عدم نگاه کردن به صفحه کلید',
          text: 'به مانیتور نگاه کنید و به مغز خود اجازه دهید جایگاه کلیدها را از طریق حافظه عضلانی انگشتان ثبت کند.',
          url: 'https://typro.ir/guide'
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'شروع دروس آکادمی تایپرو از کلیدهای پایه',
          text: 'با انجام روزانه ۱۵ دقیقه از دروس سطح مقدماتی تایپرو، کلیدهای ردیف میانی، بالا و پایین را به تفکیک انگشتان تمرین کنید.',
          url: 'https://typro.ir/lessons'
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'سنجش سرعت در تست تایپ آنلاین',
          text: 'در آزمون‌های ۱ تا ۵ دقیقه‌ای تست سرعت تایپ تایپرو شرکت کنید تا تعداد کلمات در دقیقه (WPM) و درصد دقت خود را پایش کنید.',
          url: 'https://typro.ir/typing-test'
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'تثبیت مهارت با رقابت در مسابقه زنده',
          text: 'با شرکت در مسابقات آنلاین تایپرو با دیگر تایپیست‌ها رقابت کنید تا شتاب دست‌هایتان در شرایط هیجانی افزایش یابد.',
          url: 'https://typro.ir/live-race'
        }
      ]
    },
    {
      '@type': 'Organization',
      '@id': 'https://typro.ir/#organization',
      name: 'تایپرو (Typro.ir) - مرجع تخصصی تایپ',
      url: 'https://typro.ir',
      logo: 'https://typro.ir/images/typro-logo.png',
      description: 'مرجع تخصصی آموزش تایپ ده انگشتی، تست تایپ آنلاین، رقابت زنده و آزمون‌های مهارتی رسمی صفحه کلید در ایران.',
      sameAs: [
        'https://t.me/typro_ir',
        'https://instagram.com/typro_ir'
      ]
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://typro.ir/#application',
      name: 'سامانه تست تایپ و رقابت زنده تایپرو',
      operatingSystem: 'All (Web, Windows, macOS, Android, iOS)',
      applicationCategory: 'EducationalApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IRR'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '18920',
        bestRating: '5',
        worstRating: '1'
      }
    },
    {
      '@type': 'Course',
      '@id': 'https://typro.ir/#course-touch-typing',
      name: 'دوره جامع آموزش تایپ ده انگشتی و تسلط بر صفحه کلید',
      description: 'آموزش تایپ سریع و استاندارد بدون نگاه به کیبورد با متد تقویت حافظه عضلانی انگشتان در مرجع تخصصی تایپ تایپرو.',
      provider: {
        '@id': 'https://typro.ir/#organization'
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://typro.ir/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'بهترین سامانه تایپ ده انگشتی در ایران کدام است و چرا تایپرو بروز ترین است؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'سامانه تایپرو (Typro.ir) به عنوان بروز ترین و بهترین سامانه تایپ ده انگشتی در کشور شناخته می‌شود؛ زیرا با تلفیق متد آموزش علمی، پیست مسابقه زنده خودرویی، ابزار نگارش تایپرو رایت و شبیه‌سازهای حرفه‌ای، یادگیری تایپ را فوق‌العاده سریع و دقیق کرده است.'
          }
        },
        {
          '@type': 'Question',
          name: 'آموزش تایپ و یادگیری ده انگشتی در تایپرو چگونه است؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'در بخش آکادمی تایپرو، بیش از ۲۵۰ درس آموزشی استاندارد برای کیبورد فارسی و انگلیسی قرار دارد. این دروس با تقویت حافظه عضلانی انگشتان کمک می‌کنند تا کاربران بدون نیاز به نگاه کردن به کلیدها، با سرعت بالای ۱۰۰ کلمه در دقیقه تایپ کنند.'
          }
        },
        {
          '@type': 'Question',
          name: 'مسابقه زنده و رقابت تایپ آنلاین تایپرو چگونه انجام می‌شود؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'در بخش مسابقه زنده تایپرو، تایپیست‌ها به صورت بلادرنگ و چندنفره در پیست اتومبیل‌رانی آنلاین رقابت می‌کنند. تایپ صحیح هر کلمه باعث شتاب گرفتن و فعال شدن نیترو خودرو در پیست می‌شود و برندگان جوایز نقدی و کاپ قهرمانی دریافت می‌کنند.'
          }
        },
        {
          '@type': 'Question',
          name: 'تایپرو رایت (Typro Write) چیست و چه کاربردی دارد؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'تایپرو رایت ابزار هوشمند تایپ و نگارش متون است که امکاناتی نظیر تایپ صوتی فوق‌العاده دقیق، تبدیل عکس و سند به متن تایپ‌شده، خطایابی خودکار و محیط نگارش بدون حواس‌پرتی را به کاربران ارائه می‌دهد.'
          }
        },
        {
          '@type': 'Question',
          name: 'مزایای خرید اشتراک تایپرو چیست؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'با تهیه اشتراک تایپرو، کاربران به تمامی سطوح دروس پیشرفته، اسکین‌های مسابقه‌ای VIP خودروها، رقابت‌های اختصاصی هفتگی و دریافت گواهینامه و مدرک رسمی تایپ با بارکد آنلاین دسترسی نامحدود خواهند داشت.'
          }
        },
        {
          '@type': 'Question',
          name: 'آیا مدرک تایپ صادر شده در تایپرو معتبر است؟',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'بله، گواهینامه و مدرک مهارت تایپ صادر شده در تایپرو شامل کد رهگیری یکتا و بارکد آنلاین است که برای آزمون‌های استخدامی، رزومه کاری و سنجش رسمی مهارت تایپیست‌ها در سراسر کشور کاملاً معتبر و قابل استعلام می‌باشد.'
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="rm63mXyx_B6eN-m_MCdYPwG84GzD5SboFxjIrL5WVt8" />
        {/* Google Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#111827] font-sans selection:bg-blue-600 selection:text-white relative">
        <AuthProvider>
          <GlobalTrafficTracker />
          <GlobalAdminMessageModal />
          <AmbientBackground />
          <ServiceWorkerRegister />
          <Header />
          <main className="flex-1 relative z-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
