'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';
import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const cleanup = async () => {
      try {
        // Clean up the tokens
        await passportInstance.logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
    };

    cleanup();
  }, []);

  // const handleGoHome = () => {
  //   router.push('/');
  // };

  return (
    <>
      <Heading size="medium" className="mb-1">
        You have been logged out
      </Heading>
      <p className="mb-1">Your session has been terminated and all tokens have been cleared.</p>
      {/* <Button size="medium" onClick={() => handleGoHome()} className="mb-1">Go to Home</Button> */}
      <br />
      <Link rc={<NextLink href="/" />}>Return to Home</Link>
    </>
  );
} 