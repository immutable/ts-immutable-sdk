'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        Login with NextJS
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/login-with-passport" />}>
        Login with Passport
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/login-with-etherjs" />}>
        Login with EtherJS
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/login-with-identity-only" />}>
        Login with Identity only
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/logout-with-redirect-mode" />}>
        Logout with Redirect Mode
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/logout-with-silent-mode" />}>
        Logout with Silent Mode
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/auth-event-handling" />}>
        Auth Event Handling
      </Button> 
  </>);
}