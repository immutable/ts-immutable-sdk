'use client';

import React from 'react';
import { Button, Heading, Stack } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <Stack alignItems="center" gap="4">
      <Heading
        size="medium"
        className="mb-1"
      >
        Login with Passport PKCE
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        rc={<NextLink href="/login-with-passport-pkce" />}
      >
        Login with Passport PKCE
      </Button>
      <Button
        className="mb-1"
        size="medium"
        rc={<NextLink href="/logout" />}
      >
        Logout
      </Button>
    </Stack>
  );
} 