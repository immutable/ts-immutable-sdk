import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import { BiomeCombinedProviders } from '@biom3/react';
import type { Session } from 'next-auth';
import { ImmutableProvider } from '@/context/ImmutableProvider';
import { StatusProvider } from '@/context/StatusProvider';
import { PassportProvider } from '@/context/PassportProvider';

export default function App({ Component, pageProps }: AppProps<{ session?: Session }>) {
  return (
    <StatusProvider>
      <ImmutableProvider session={pageProps.session}>
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



