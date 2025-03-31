'use client';

import React, { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault';
import { Heading, Card, Stack, Body } from '@biom3/react';

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      passportInstance.loginCallback()
        .then(() => {
          console.log('Login callback successful');
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
        });
    }
  }, []);

  return (
    <Stack gap="xl" alignItems="center" justifyContent="center" className="w-full max-w-4xl min-h-screen">
      <Card className="w-full p-6">
        <Stack gap="md" alignItems="center">
          <Heading size="medium">Processing Login</Heading>
          <div className="w-8 h-8 border-4 border-t-blue-500 border-r-blue-500 border-b-blue-200 border-l-blue-200 rounded-full animate-spin"></div>
          <Body>Completing authentication process...</Body>
        </Stack>
      </Card>
    </Stack>
  );
} 