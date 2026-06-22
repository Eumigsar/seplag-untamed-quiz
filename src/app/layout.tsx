import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const noto  = Noto_Sans_SC({ subsets: ['latin'], weight: ['400','700'], variable: '--font-noto', display: 'swap', preload: false });

export const metadata: Metadata = {
  title: 'Mandarin Academy — Academia dos Mil Hanzi',
  description: 'Aprenda Mandarim em um RPG imersivo. Explore a Academia, conheça o Sifu Li e domine os Hanzi.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0F1E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${noto.variable} font-sans bg-ink text-paper overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
