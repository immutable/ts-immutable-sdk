'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Heading, Stack, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleRedirect() {
      if (!passportInstance) {
        setStatus('Error: Passport instance not available');
        return;
      }

      try {
        // Handle the redirect callback
        await passportInstance.loginCallback();
        setStatus('Authentication successful!');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus('Authentication failed');
      }
    }

    handleRedirect();
  }, []);

  return (
    <Stack direction="column" gap="medium" className="max-w-4xl mx-auto p-6">
      <Heading size="large">Authentication Redirect</Heading>
      
      <Card className="p-6">
        <Stack direction="column" gap="medium">
          <Heading size="medium">Status</Heading>
          <p>{status}</p>
          
          {error && (
            <div className="border rounded p-3 bg-red-100">
              <p><b>Error:</b> {error}</p>
            </div>
          )}
          
          <Button rc={<NextLink href="/" />} size="medium">
            Return to Home
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
} 