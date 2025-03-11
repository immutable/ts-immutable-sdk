'use client';

import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <Heading size="large" className="mb-1">
        Passport SDK Event Handling Examples
      </Heading>
      
      <h2 className="mb-1">Available Examples:</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link rc={<NextLink href="/events" />}>
          <Button size="medium">Event Handling Demo</Button>
        </Link>
      </div>
    </div>
  );
} 