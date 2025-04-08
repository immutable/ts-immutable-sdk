'use client';

import { useEffect } from 'react';
import { Stack, Body, Heading } from '@biom3/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      router.push('/event-handling');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Stack>
      <Heading size="medium">You have been logged out</Heading>
      <Body>Redirecting back to the app...</Body>
    </Stack>
  );
} 