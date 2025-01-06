'use client';

import { BackendProvider } from '@/context/backend';
import { IMXProvider } from '@/context/imx';
import { LinkProvider } from '@/context/link';
import { PassportProvider } from '@/context/passport';
import { ZkEVMProvider } from '@/context/zkevm';
import { BiomeCombinedProviders } from '@biom3/react';
import { Inter } from 'next/font/google';
import React from 'react';
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
        <BackendProvider>
          <BiomeCombinedProviders>
            <LinkProvider>
              <IMXProvider>
                <ZkEVMProvider>
                  <PassportProvider>
                    {children}
                  </PassportProvider>
                </ZkEVMProvider>
              </IMXProvider>
            </LinkProvider>
          </BiomeCombinedProviders>
        </BackendProvider>
      </body>
    </html>
  )
} 