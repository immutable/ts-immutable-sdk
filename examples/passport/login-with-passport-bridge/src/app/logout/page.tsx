'use client';

import { useEffect, useState } from 'react';
import { Button, Stack } from '@biom3/react';
import NextLink from 'next/link';

export default function Logout() {
  const [message, setMessage] = useState<string>('Logout successful!');

  return (
    <Stack direction="column" alignItems="center" gap="spacing5">
      <h1>Logged Out</h1>
      <p>{message}</p>
      <p>You have been successfully logged out of Immutable Passport.</p>
      
      <Button
        className="mb-1"
        size="medium"
        rc={<NextLink href="/" />}>
        Return to Home
      </Button>
    </Stack>
  );
} 