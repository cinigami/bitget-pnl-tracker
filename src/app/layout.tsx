import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TradesProvider } from '@/context/TradesContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bitget PnL Tracker',
  description: 'Track your trading performance week-by-week with screenshot-based OCR import',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-950 text-dark-100 antialiased`}>
        <TradesProvider>{children}</TradesProvider>
      </body>
    </html>
  );
}
