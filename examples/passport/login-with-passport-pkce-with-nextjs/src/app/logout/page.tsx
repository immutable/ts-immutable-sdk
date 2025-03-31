'use client';

import React, { useEffect } from 'react';
import { Heading, Link, Stack } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoggedOutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        // #doc passport-pkce-logout
        await passportInstance.logout();
        // #enddoc passport-pkce-logout
        console.log('Logged out successfully');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };

    handleLogout();
  }, []);

  return (
    <Stack alignItems="center" gap="4">
      <Heading size="medium" className="mb-1">
        Successfully Logged Out
      </Heading>

      <NextLink href="/" passHref legacyBehavior>
        <Link>Return to Home</Link>
      </NextLink>
    </Stack>
  );
} 