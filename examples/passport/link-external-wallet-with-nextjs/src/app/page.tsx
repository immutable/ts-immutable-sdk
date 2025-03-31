'use client';
import React from 'react';
import { Button, Stack, Heading } from '@biom3/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Stack gap="lg" alignItems="center" style={{ padding: '2rem', maxWidth: '800px', textAlign: 'center' }}>
      <Heading size="medium" className="mb-1">
        Immutable Passport SDK - Link External Wallet Example
      </Heading>
      
      <p>
        This example demonstrates how to link external wallets with the Immutable Passport SDK.
        Linking external wallets allows users to connect their existing wallets to their Passport account.
      </p>
      
      <Link href="/link-external-wallet" passHref>
        <Button variant="primary">Link External Wallet Example</Button>
      </Link>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/redirect" passHref>
          <Button variant="secondary">Redirect Page</Button>
        </Link>
        <Link href="/logout" passHref>
          <Button variant="secondary">Logout Page</Button>
        </Link>
      </div>
    </Stack>
  );
} 