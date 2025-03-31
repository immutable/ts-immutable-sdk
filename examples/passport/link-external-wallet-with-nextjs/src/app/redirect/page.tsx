'use client';
import React, { useEffect, useState } from 'react';
import { Button, Stack, Heading } from '@biom3/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function RedirectPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleLoginCallback = async () => {
      try {
        // Handle the login callback
        await passportInstance.loginCallback();
        router.push('/');
      } catch (err) {
        console.error('Error during login callback:', err);
        setError('Failed to complete authentication. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleLoginCallback();
  }, [router]);

  if (loading) {
    return (
      <Stack gap="lg" alignItems="center" style={{ padding: '2rem' }}>
        <div className="loading-spinner"></div>
        <p>Completing authentication...</p>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap="lg" alignItems="center" style={{ padding: '2rem' }}>
        <Heading size="medium" className="mb-1">Authentication Error</Heading>
        <p>{error}</p>
        <Link href="/" passHref>
          <Button variant="primary">Return to Home</Button>
        </Link>
      </Stack>
    );
  }

  return null;
} 