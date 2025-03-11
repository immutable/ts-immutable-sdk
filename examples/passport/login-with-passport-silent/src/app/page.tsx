'use client';

import { Button, Card, Stack } from '@biom3/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Stack gap="l" alignItems="center">
      <h1>Immutable Passport Silent Authentication Example</h1>
      <Card>
        <Stack>
          <h2>Silent Authentication</h2>
          <p>
            This example demonstrates how to implement silent authentication with the Immutable Passport SDK.
            Silent authentication attempts to login without user interaction by automatically refreshing tokens in the background.
          </p>
          <Link href="/silent-auth">
            <Button variant="primary">Try Silent Authentication</Button>
          </Link>
        </Stack>
      </Card>
      <Stack direction="row" gap="m">
        <Link href="/logout">
          <Button variant="secondary">Logout</Button>
        </Link>
      </Stack>
    </Stack>
  );
} 