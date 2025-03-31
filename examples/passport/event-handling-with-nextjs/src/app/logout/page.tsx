'use client';

import React from 'react';
import { Heading, Link, Stack, Card, Body, Divider } from '@biom3/react';
import NextLink from 'next/link';

export default function LoggedOutPage() {
  return (
    <Stack gap="xl" alignItems="flex-start" className="w-full max-w-4xl">
      <Card className="w-full p-6">
        <Stack gap="md" alignItems="center">
          <Heading size="medium">Successfully Logged Out</Heading>
          <Divider />
          <Body>You have been logged out from Immutable Passport.</Body>
          <Link rc={<NextLink href="/" />}>Return to Examples</Link>
        </Stack>
      </Card>
    </Stack>
  );
} 