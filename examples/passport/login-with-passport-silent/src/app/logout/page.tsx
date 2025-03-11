'use client';

import { Button, Stack } from '@biom3/react';
import { useEffect, useState } from 'react';
import { passportInstance } from '../utils/setupDefault';
import Link from 'next/link';

export default function Logout() {
  const [status, setStatus] = useState('Processing logout...');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Logout silently (without redirecting to logout URL)
        await passportInstance.logout({ silent: true });
        setStatus('Logged out successfully!');
        setIsComplete(true);
      } catch (err) {
        console.error('Logout error:', err);
        setError(err instanceof Error ? err.message : 'Logout failed');
        setIsComplete(true);
      }
    };

    performLogout();
  }, []);

  return (
    <Stack gap="l" alignItems="center">
      <h1>Immutable Passport Logout</h1>
      
      <Stack gap="m" alignItems="center">
        <h2>{status}</h2>
        
        {error && (
          <p style={{ color: 'red' }}>Error: {error}</p>
        )}
        
        {isComplete && (
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        )}
      </Stack>
    </Stack>
  );
} 