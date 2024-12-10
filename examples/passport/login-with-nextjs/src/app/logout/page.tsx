'use client';

import { Heading, Button, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function LoggedOutPage() {
  return (
    <>
      <Heading size="medium" className="mb-1">
        Successfully Logged Out
      </Heading>

      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}