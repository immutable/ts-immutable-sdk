'use client';
import React, { useEffect, useState } from 'react';
import { Button, Heading, Stack, Text, Spinner } from '@biom3/react';
import { passportInstance } from '../utils/setupDefault';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Handle the authentication callback
    const handleCallback = async () => {
      try {
        // Process the callback from Passport
        await passportInstance.loginCallback();
        setStatus('success');
        
        // Redirect back to the event-handling page after successful login
        setTimeout(() => {
          router.push('/event-handling');
        }, 2000);
      } catch (error) {
        console.error('Authentication callback error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    // Call the callback handler
    handleCallback();
  }, [router]);

  return (
    <Stack direction="column" alignItems="center" gap="large">
      <Heading size="large">Authentication Callback</Heading>
      
      {status === 'loading' && (
        <Stack direction="column" alignItems="center" gap="medium">
          <Spinner size="large" />
          <Text variant="body1">Processing authentication...</Text>
        </Stack>
      )}
      
      {status === 'success' && (
        <Stack direction="column" alignItems="center" gap="medium">
          <Text variant="body1" style={{ color: 'green' }}>
            Authentication successful!
          </Text>
          <Text variant="body2">
            Redirecting you to the event handling page...
          </Text>
        </Stack>
      )}
      
      {status === 'error' && (
        <Stack direction="column" alignItems="center" gap="medium">
          <Text variant="body1" style={{ color: 'red' }}>
            Authentication failed!
          </Text>
          {errorMessage && (
            <Text variant="body2">
              Error: {errorMessage}
            </Text>
          )}
          <Link href="/event-handling" passHref>
            <Button variant="primary">
              Return to Event Handling
            </Button>
          </Link>
        </Stack>
      )}
    </Stack>
  );
} 