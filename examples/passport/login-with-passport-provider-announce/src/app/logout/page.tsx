'use client';

import { Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function LoggedOutPage() {
  return (
    <>
      <Heading size="medium" className="mb-1">
        Successfully Logged Out
      </Heading>
      <h3>You have been logged out of Immutable Passport</h3>
      <Link rc={<NextLink href="/" />}>Return to Home</Link>
    </>
  );
} 