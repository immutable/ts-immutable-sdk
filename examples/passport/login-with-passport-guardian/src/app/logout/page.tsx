'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Heading, Stack, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function Logout() {
  const [logoutStatus, setLogoutStatus] = useState<string>('');

  // Logout function
  const handleLogout = async () => {
    if (!passportInstance) return;

    try {
      setLogoutStatus('Logging out...');
      
      await passportInstance.logout();
      
      setLogoutStatus('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Stack direction="column" gap="medium" className="max-w-4xl mx-auto p-6">
      <Heading size="large">Logout</Heading>
      
      <Card className="p-6">
        <Stack direction="column" gap="medium">
          <Heading size="medium">Logout from Passport</Heading>
          <p>Click the button below to log out from your Passport account.</p>
          
          <Button
            className="mb-4"
            size="medium"
            onClick={handleLogout}>
            Logout
          </Button>
          
          {logoutStatus && (
            <div className="border rounded p-3 bg-gray-100">
              <p>{logoutStatus}</p>
            </div>
          )}
        </Stack>
      </Card>
      
      <Link rc={<NextLink href="/" />}>Return to Home</Link>
    </Stack>
  );
} 