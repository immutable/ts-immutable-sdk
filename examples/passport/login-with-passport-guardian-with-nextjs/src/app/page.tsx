'use client';
import React from 'react';
import Link from 'next/link';
import { Button, Heading, Box, Stack } from '@biom3/react';

export default function Home() {
  return (
    <main className="main">
      <Box>
        <Stack gap="x4" alignItems="center">
          <Heading size="xxLarge">Passport SDK Examples</Heading>
          <Heading size="xLarge">Login with Passport Guardian</Heading>
          
          <p>
            This example demonstrates how to implement authentication using Immutable Passport with Guardian.
          </p>

          <Stack direction="row" gap="x2">
            <Link href="/login-with-passport-guardian">
              <Button>Login with Passport Guardian</Button>
            </Link>
          </Stack>
        </Stack>
      </Box>
    </main>
  );
} 