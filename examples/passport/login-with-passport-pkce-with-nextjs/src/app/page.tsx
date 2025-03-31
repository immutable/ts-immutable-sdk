'use client';
import React from 'react';
import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <Heading size="medium" className="mb-1">
        Immutable Passport SDK: Login with PKCE
      </Heading>
      <p className="mb-1">
        This example demonstrates how to implement login using Immutable Passport with PKCE (Proof Key for Code Exchange) flow.
      </p>

      <div className="mb-1">
        <Button size="medium" rc={<NextLink href="/login-with-passport-pkce" />}>
          Login with Passport PKCE
        </Button>
      </div>

      <p>
        PKCE (Proof Key for Code Exchange) is an extension to the OAuth authorization code flow that provides
        additional security for public clients such as single-page applications.
      </p>
    </main>
  );
} 