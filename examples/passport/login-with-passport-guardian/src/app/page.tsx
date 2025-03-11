'use client';

import { Button, Card, Heading, Stack, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <Stack direction="column" gap="medium" className="max-w-4xl mx-auto p-6">
      <Heading size="large">Guardian Integration with Passport</Heading>
      <p>This example demonstrates how to use Guardian client features with Immutable Passport SDK.</p>
      
      <Card className="p-6">
        <Stack direction="column" gap="medium">
          <Heading size="medium">Guardian Features</Heading>
          <p>Guardian provides security features for evaluating transactions and messages before they are processed.</p>
          
          <Button rc={<NextLink href="/guardian-transactions" />} size="medium">
            Transaction Evaluation Demo
          </Button>
          
          <Button rc={<NextLink href="/guardian-messages" />} size="medium">
            Message Signing with Guardian
          </Button>
          
          <Button rc={<NextLink href="/logout" />} size="medium">
            Logout
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
} 