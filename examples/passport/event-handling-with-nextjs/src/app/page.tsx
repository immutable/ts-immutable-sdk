'use client';

import React from 'react';
import { Button, Heading, Stack } from '@biom3/react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Stack direction="column" gap="large" alignItems="center" style={{ padding: '2rem', maxWidth: '800px' }}>
      <Heading size="xxLarge">Immutable Passport Event Handling</Heading>
      
      <p>
        This example demonstrates how to use event handling with the Immutable Passport SDK.
        Learn how to properly set up and respond to provider events like:
      </p>
      
      <ul style={{ listStyleType: 'disc', paddingLeft: '2rem', alignSelf: 'flex-start' }}>
        <li>Connection events (connect, disconnect)</li>
        <li>Account changes (accountsChanged)</li>
        <li>Chain changes (chainChanged)</li>
        <li>Other Passport events</li>
      </ul>
      
      <p>
        Events are an important part of building responsive web3 applications that maintain
        state synchronization with the blockchain and wallet status.
      </p>
      
      <Link href="/event-handling" passHref>
        <Button variant="primary" size="large">
          Try Event Handling Demo
        </Button>
      </Link>

      <p>
        You can also check the following pages:
      </p>

      <Stack direction="row" gap="medium">
        <Link href="/redirect" passHref>
          <Button variant="secondary">Redirect Page</Button>
        </Link>
        <Link href="/logout" passHref>
          <Button variant="secondary">Logout Page</Button>
        </Link>
      </Stack>
    </Stack>
  );
} 