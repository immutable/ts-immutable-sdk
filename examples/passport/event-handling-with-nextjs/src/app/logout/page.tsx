'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Stack } from '@biom3/react';
import { passportInstance } from '../utils/setupDefault';

// Simple loading indicator component to replace Spinner
const LoadingIndicator = ({ size = 'medium' }) => {
  const style = {
    display: 'inline-block',
    width: size === 'large' ? '40px' : size === 'medium' ? '30px' : '20px',
    height: size === 'large' ? '40px' : size === 'medium' ? '30px' : '20px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
  
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
      }} />
      <div style={style} data-testid="loading-indicator" data-size={size}></div>
    </>
  );
};

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [logoutComplete, setLogoutComplete] = useState(false);

  useEffect(() => {
    async function completeLogout() {
      try {
        if (!passportInstance) {
          throw new Error('Passport not initialized');
        }

        // Use type assertion to tell TypeScript that passportInstance has a logoutCallback method
        const passport = passportInstance as any;
        // This handles any cleanup required after redirecting from the logout endpoint
        await passport.logoutCallback();
        setLogoutComplete(true);
      } catch (err) {
        console.error('Logout error:', err);
        setError(`Logout failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    completeLogout();
  }, []);

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <Stack direction="column" gap="large" alignItems="center" style={{ padding: '2rem' }}>
      <Heading size="xxLarge">Logout</Heading>
      
      {!logoutComplete && !error && (
        <Stack direction="column" gap="medium" alignItems="center">
          <LoadingIndicator size="large" />
          <p>Completing logout process...</p>
        </Stack>
      )}
      
      {logoutComplete && (
        <Stack direction="column" gap="medium" alignItems="center">
          <p>You have been successfully logged out.</p>
          <Button variant="primary" onClick={handleReturnHome}>
            Return to Home
          </Button>
        </Stack>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: '#FFEBEE', 
          color: '#B71C1C', 
          padding: '1rem', 
          borderRadius: '4px',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h3>Logout Error</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={handleReturnHome}>
            Return to Home
          </Button>
        </div>
      )}
    </Stack>
  );
} 