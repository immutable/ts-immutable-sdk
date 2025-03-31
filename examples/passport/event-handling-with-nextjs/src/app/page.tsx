'use client';
import React from 'react';
import { Button, Heading, Stack } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <Stack gap="md" alignItems="flex-start" className="w-full max-w-3xl mx-auto">
      <Heading size="medium" className="mb-1">
        Event Handling with NextJS
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        rc={<NextLink href="/event-handling" />}>
        Event Handling Example
      </Button>
      <Button
        className="mb-1"
        size="medium"
        variant="secondary"
        rc={<NextLink href="/logout" />}>
        Logout Example
      </Button>
    </Stack>
  );
} 