'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        Passport Connect Examples
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/connect-with-eip1193" />}>
        Connect with EIP-1193
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/connect-with-etherjs" />}>
        Connect with EtherJS
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/connect-with-wagmi" />}>
        Connect with Wagmi
      </Button> 
  </>);
}
