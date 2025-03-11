'use client';
import { Button, Heading, Stack } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <Stack alignItems="center" spacing="lg">
      <Heading 
        size="medium" 
        className="mb-1">
        Provider Announcement Example
      </Heading>
      <h2>Demonstrates EIP-6963 wallet discovery integration</h2>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/provider-announce" />}>
        Provider Announcement Demo
      </Button>
    </Stack>
  );
} 