'use client';
import React, { useEffect, useState } from 'react';
import { Box, Heading, Stack, Button } from '@biom3/react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function Logout() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clean up any tokens
        await passportInstance.logout();
        // We're already on the logout page as configured in the SDK
      } catch (err) {
        console.error('Logout error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error during logout');
      }
    };

    handleLogout();
  }, [router]);

  const goToHome = () => {
    router.push('/');
  };

  if (error) {
    return (
      <Box>
        <Stack gap="x4" alignItems="center">
          <Heading size="xLarge">Logout Error</Heading>
          <p>{error}</p>
          <Button onClick={goToHome}>Return Home</Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="x4" alignItems="center">
        <Heading size="xLarge">Logged Out</Heading>
        <p>You have been successfully logged out.</p>
        <Button onClick={goToHome}>Return Home</Button>
      </Stack>
    </Box>
  );
} 