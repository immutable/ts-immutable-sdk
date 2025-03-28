'use client';
import React, { useEffect, useState } from 'react';
import { Box, Heading, Stack } from '@biom3/react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await passportInstance.loginCallback();
        router.push('/');
      } catch (err) {
        console.error('Login callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error during login callback');
      }
    };

    handleRedirect();
  }, [router]);

  if (error) {
    return (
      <Box>
        <Stack gap="x4" alignItems="center">
          <Heading size="xLarge">Authentication Error</Heading>
          <p>{error}</p>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="x4" alignItems="center">
        <Heading size="xLarge">Redirecting...</Heading>
        <p>Processing your authentication, please wait.</p>
      </Stack>
    </Box>
  );
} 