'use client';
import React from 'react';
import { Button, Heading, Stack, Text } from '@biom3/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Stack direction="column" alignItems="center" gap="large">
      <Heading size="xlarge">Immutable Passport Event Handling</Heading>
      
      <Stack direction="column" alignItems="center" gap="medium">
        <Text variant="body1">
          This example demonstrates how to implement event handling with the Immutable Passport SDK.
        </Text>
        <Text variant="body1">
          Learn how to properly listen for events like connection state changes, chain changes, and account changes.
        </Text>
      </Stack>
      
      <Stack direction="column" alignItems="center" gap="medium">
        <Link href="/event-handling" passHref>
          <Button variant="primary" size="large">
            View Event Handling Example
          </Button>
        </Link>
      </Stack>

      <Stack direction="column" alignItems="center" gap="small">
        <Text variant="body2">
          All examples include proper event cleanup and best practices for event handling.
        </Text>
      </Stack>
    </Stack>
  );
} 