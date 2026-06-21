import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="bg-ink-950 text-parchment-100 antialiased">
        {children}
      </body>
    </html>
  );
}
