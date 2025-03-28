'use client';

import React from 'react';
import { Heading, Button, Stack } from '@biom3/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Stack direction="column" gap="small" alignItems="center">
      <Heading size="medium" className="mb-1">
        Passport Provider Announce Examples
      </Heading>
      
      <p>
        This example demonstrates how to use the Passport Provider Announce feature with Next.js.
      </p>

      <Stack direction="column" gap="small" alignItems="center" className="mb-1">
        <Link href="/login-with-passport-provider-announce">
          <Button variant="primary">Login with Passport Provider Announce</Button>
        </Link>
      </Stack>
    </Stack>
  );
} 