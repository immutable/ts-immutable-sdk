'use client';

import { Heading, Button, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function LoggedOutPage() {
  return (
    <>
      <Heading size="medium" className="mb-4">
        Successfully Logged Out
      </Heading>
      
      <p className="mb-4">You have been successfully logged out from your Immutable Passport session.</p>
      
      <Button
        className="mb-4"
        size="medium"
        rc={<NextLink href="/login-with-pkce" />}>
        Back to Login
      </Button>
      
      <div>
        <Link rc={<NextLink href="/" />}>Return to Home</Link>
      </div>
    </>
  );
} 