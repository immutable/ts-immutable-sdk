import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { BiomeCombinedProviders } from '@biom3/react';
import { ImmutableProvider } from '@/context/ImmutableProvider';
import { StatusProvider } from '@/context/StatusProvider';
import { PassportProvider } from '@/context/PassportProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StatusProvider>
      <ImmutableProvider>
        <PassportProvider>
          <BiomeCombinedProviders>
            {/* @ts-ignore */}
            <Component {...pageProps} />
          </BiomeCombinedProviders>
        </PassportProvider>
      </ImmutableProvider>
    </StatusProvider>
  );
}
