'use client';

import { IMXProvider } from '@/context/imx';
import { PassportProvider } from '@/context/passport';
import { ZkEVMProvider } from '@/context/zkevm';
import { BiomeCombinedProviders, Stack } from '@biom3/react';
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
          <Stack>
            <IMXProvider>
              <ZkEVMProvider>
                <PassportProvider>
                  {children}
                </PassportProvider>
              </ZkEVMProvider>
            </IMXProvider>
          </Stack>
        </BiomeCombinedProviders>
      </body>
    </html>
  )
} 