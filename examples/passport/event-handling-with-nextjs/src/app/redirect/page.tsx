'use client';

import { useEffect, useState } from 'react';
import { Stack, Body, Heading } from '@biom3/react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function RedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Handle the redirect
        await passportInstance.loginCallback();
        router.push('/event-handling');
      } catch (e: any) {
        console.error('Error handling redirect', e);
        setError(e.message || 'An unknown error occurred during login');
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <Stack>
      <Heading size="medium">Processing login...</Heading>
      {error && <Body color="danger">{error}</Body>}
    </Stack>
  );
} 