'use client';
import { Heading, Button } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <>
      <Heading className="mb-1">Passport Message Signing Examples</Heading>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/sign-with-eip712" />}>
        Sign message with EIP-712
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/sign-with-erc191" />}>
        Sign message with ERC-191
      </Button>
      </>
  );
}
