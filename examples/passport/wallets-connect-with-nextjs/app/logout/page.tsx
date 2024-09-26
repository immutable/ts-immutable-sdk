'use client';

import { Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function Logout() {
  // render the view for after the logout is complete
  return (
    <>
    <Heading className="mb-1">Logged Out</Heading>
    <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
