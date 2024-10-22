'use client';

import { Heading, Button } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <div className="flex-container">
      <Heading className="mb-1">Identity with NextJS Examples</Heading>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/login-with-nextjs" />}>
        Login with NextJS
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/logged-in-user-with-nextjs" />}>
        Passport Methods
      </Button>
    </div>
  );
}
