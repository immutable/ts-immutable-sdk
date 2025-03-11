'use client';

import { useEffect, useState } from 'react';
import { Button, Stack } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  const [message, setMessage] = useState<string>('Processing login...');
  const [isLoginComplete, setIsLoginComplete] = useState<boolean>(false);

  useEffect(() => {
    const processRedirect = async () => {
      try {
        // Handle the redirect callback
        await passportInstance.loginCallback();
        setMessage('Login successful!');
        setIsLoginComplete(true);
      } catch (error) {
        console.error('Error handling redirect:', error);
        setMessage('Login failed. Please try again.');
        setIsLoginComplete(true);
      }
    };

    processRedirect();
  }, []);

  return (
    <Stack direction="column" alignItems="center" gap="spacing5">
      <h1>Login Redirect</h1>
      <p>{message}</p>
      
      {isLoginComplete && (
        <Button
          className="mb-1"
          size="medium"
          rc={<NextLink href="/login-with-bridge" />}>
          Continue to Example
        </Button>
      )}
    </Stack>
  );
} 