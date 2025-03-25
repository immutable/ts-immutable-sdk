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

export default function RedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!passportInstance) {
          throw new Error('Passport not initialized');
        }

        // Use type assertion to tell TypeScript that passportInstance has a loginCallback method
        const passport = passportInstance as any;
        // Handle the callback from the Passport auth flow
        await passport.loginCallback();
        
        // Redirect to the main event handling page
        router.push('/event-handling');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(`Authentication failed: ${err instanceof Error ? err.message : String(err)}`);
        setProcessing(false);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <Stack direction="column" gap="large" alignItems="center" style={{ padding: '2rem' }}>
      <Heading size="xxLarge">Authentication</Heading>
      
      {processing && !error && (
        <Stack direction="column" gap="medium" alignItems="center">
          <LoadingIndicator size="large" />
          <p>Processing your authentication, please wait...</p>
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
          <h3>Authentication Error</h3>
          <p>{error}</p>
          <p>
            Please try to <a href="/" style={{ color: '#0D47A1', textDecoration: 'underline' }}>
              return to the home page
            </a> and connect again.
          </p>
        </div>
      )}
    </Stack>
  );
} 