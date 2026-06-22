import type { Metadata, Viewport } from 'next';
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-noto-sans',
  display: 'swap',
  preload: false,
});

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: '武侠学堂 · Wǔxiá Xuétáng — Aprenda Mandarim',
  description:
    'RPG educativo para aprender Mandarim (HSK1-HSK4) através de uma aventura épica de kung fu e cultura chinesa.',
  keywords: ['mandarim', 'chinês', 'HSK', 'RPG', 'aprender', 'kung fu', 'Choy Lay Fut'],
  authors: [{ name: 'SEPLAG' }],
  openGraph: {
    title: '武侠学堂 · Aprenda Mandarim',
    description: 'Aventura RPG para aprender Mandarim',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d1117',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${notoSans.variable} ${notoSerif.variable}`}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="bg-ink-950 text-parchment-100 antialiased">
        {children}
      </body>
    </html>
  );
}
