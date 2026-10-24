import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import ClientProviders from '@/components/providers/ClientProviders';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'OmniMarket — Operations Hub',
  description: 'Dashboard de Analítica E-Commerce en Tiempo Real y Kanban Drag & Drop',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
