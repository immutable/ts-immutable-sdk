'use client';

import { IMXProvider } from '@/context/imx';
import { PassportProvider } from '@/context/passport';
import { ZkEVMProvider } from '@/context/zkevm';
import { BiomeCombinedProviders } from '@biom3/react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BiomeCombinedProviders>
          <IMXProvider>
            <ZkEVMProvider>
              <PassportProvider>
                {children}
              </PassportProvider>
            </ZkEVMProvider>
          </IMXProvider>
        </BiomeCombinedProviders>
      </body>
    </html>
  )
} 