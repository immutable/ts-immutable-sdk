'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        User Information after Logging In with NextJS
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/linked-addresses-with-passport" />}>
        Linked Addresses with Passport
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/user-info-with-passport" />}>
        User Info with Passport
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/verify-tokens-with-nextjs" />}>
        Verify Tokens with NextJS
      </Button> 
  </>);
}
