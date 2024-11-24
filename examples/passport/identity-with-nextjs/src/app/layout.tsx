import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PassportProvider } from '@/context/passport';
import { ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Passport Identity Examples',
  description: 'Examples of how to use Passport\'s Identity features with NextJS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PassportProvider>{children}</PassportProvider>
      </body>
    </html>
  );
}
