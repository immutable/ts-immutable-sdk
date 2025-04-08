import React from 'react';
import { AppWrapper } from './utils/wrapper';
import './globals.css';

export const metadata = {
  title: 'Passport Setup Options Example',
  description: 'Explore different setup options for Immutable Passport',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
} 