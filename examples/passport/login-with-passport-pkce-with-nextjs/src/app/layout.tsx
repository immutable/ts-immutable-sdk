import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import AppWrapper from './utils/wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Immutable Passport SDK Example',
  description: 'Login with Passport PKCE Example',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
} 