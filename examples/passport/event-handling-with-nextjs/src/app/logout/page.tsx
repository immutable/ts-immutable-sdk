'use client';
import React, { useEffect, useState } from 'react';
import { Button, Heading, Stack, Text } from '@biom3/react';
import Link from 'next/link';

export default function LogoutPage() {
  const [message, setMessage] = useState<string>('You have been logged out successfully.');

  // Add a useEffect that runs once on component mount to confirm logout was complete
  useEffect(() => {
    try {
      // Check if there's any error in the URL
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      
      if (params.error) {
        setMessage(`Logout error: ${params.error_description || params.error}`);
      } else {
        // Successful logout
        setMessage('You have been logged out successfully.');
      }
      
      // Log the logout for demonstration purposes
      console.log('Logout complete, all event listeners have been removed');
      
    } catch (error) {
      console.error('Error during logout processing:', error);
      setMessage('There was an error processing your logout.');
    }
  }, []);

  return (
    <Stack direction="column" alignItems="center" gap="large">
      <Heading size="large">Logged Out</Heading>
      
      <Stack direction="column" alignItems="center" gap="medium">
        <Text variant="body1">{message}</Text>
        
        <Text variant="body2">
          All event listeners have been cleaned up automatically.
        </Text>
      </Stack>
      
      <Stack direction="column" alignItems="center" gap="medium">
        <Link href="/" passHref>
          <Button variant="primary">
            Return to Home
          </Button>
        </Link>
        
        <Link href="/event-handling" passHref>
          <Button variant="secondary">
            Back to Event Handling Example
          </Button>
        </Link>
      </Stack>
    </Stack>
  );
} 