'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        Checkout SDK Connect
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/connect-with-metamask" />}>
        Connect with MetaMask
      </Button> 
  </>);
}
