'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        Checkout SDK Connect and Switch Networks
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/switch-with-metamask" />}>
        Switch Network with MetaMask
      </Button> 
  </>);
}
