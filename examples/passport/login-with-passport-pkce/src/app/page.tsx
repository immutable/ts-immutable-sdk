'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <>
      <Heading 
        size="medium" 
        className="mb-1">
        PKCE Flow Authentication Example
      </Heading>
      <h2>Secure authentication for public clients</h2>
      <p>This example demonstrates using the PKCE (Proof Key for Code Exchange) flow with Immutable Passport, which provides enhanced security for public clients and protection against CSRF attacks.</p>
      
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/login-with-pkce" />}>
        Login with PKCE Flow
      </Button>
    </>
  );
} 