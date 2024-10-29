'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
    <Heading
      size="medium"
      className="mb-1">
      Checkout SDK Widgets
    </Heading>

    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-connect" />}>
      Mount Commerce Widget: Flow.Connect
    </Button>

    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-bridge" />}>
      Mount Commerce Widget: Flow.Bridge
    </Button>
  </>);
}
