'use client';
import React from 'react';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <>
      <Heading 
        size="medium" 
        className="mb-1">
        Login with Passport Bridge
      </Heading>
      <p className="mb-1">
        This example demonstrates how to authenticate users using the Passport Bridge feature of the Immutable Passport SDK.
      </p>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/login-with-passport-bridge" />}>
        Login with Passport Bridge
      </Button>
    </>
  );
} 