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
        Event Handling with NextJS
      </Heading>
      <p className="mb-1">
        This example demonstrates how to handle events with the Immutable Passport SDK.
      </p>
      <Button       
        className="mb-1"
        size="medium" 
        rc={<NextLink href="/event-handling" />}>
        Try Event Handling
      </Button> 
    </>
  );
} 