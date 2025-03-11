'use client';

import { Stack } from '@biom3/react';
import { useEffect, useState } from 'react';
import { passportInstance } from '../utils/setupDefault';
import { useRouter } from 'next/navigation';

export default function Redirect() {
  const [status, setStatus] = useState('Processing login...');
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setStatus('Finalizing authentication...');
        
        // Process the redirect
        await passportInstance.loginCallback();
        
        // Redirect back to the main app
        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => {
          router.push('/silent-auth');
        }, 1500);
      } catch (error) {
        console.error('Authentication failed:', error);
        setStatus(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Redirect to the main page after a delay
        setTimeout(() => {
          router.push('/silent-auth');
        }, 3000);
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <Stack gap="l" alignItems="center" justifyContent="center">
      <h1>Immutable Passport Authentication</h1>
      <h2>{status}</h2>
    </Stack>
  );
} 