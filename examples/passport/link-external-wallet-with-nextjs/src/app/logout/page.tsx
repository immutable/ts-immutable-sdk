'use client';
import React, { useEffect, useState } from 'react';
import { Button, Stack, Heading } from '@biom3/react';
import Link from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LogoutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear any local storage or cookies related to authentication
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('id_token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error during logout:', err);
        setError('There was an issue during logout.');
        setLoading(false);
      }
    };

    handleLogout();
  }, []);

  if (loading) {
    return (
      <Stack gap="lg" alignItems="center" style={{ padding: '2rem' }}>
        <div className="loading-spinner"></div>
        <p>Logging out...</p>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" alignItems="center" style={{ padding: '2rem', maxWidth: '800px', textAlign: 'center' }}>
      <Heading size="medium" className="mb-1">
        Logged Out Successfully
      </Heading>
      <p>
        You have been successfully logged out from your Passport account.
      </p>
      <Link href="/" passHref>
        <Button variant="primary">Return to Home</Button>
      </Link>
    </Stack>
  );
} 