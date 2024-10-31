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
      rc={<NextLink href="/commerce-wallet" />}>
      Mount Commerce Widget: Flow.Wallet
    </Button>
    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-bridge" />}>
      Mount Commerce Widget: Flow.Bridge
    </Button>
    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-add-funds" />}>
      Mount Commerce Widget: Flow.AddFunds
    </Button>
    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-onramp" />}>
      Mount Commerce Widget: Flow.OnRamp
    </Button>
    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-swap" />}>
      Mount Commerce Widget: Flow.Swap
    </Button>
    <Button
      className="mb-1"
      size="medium"
      rc={<NextLink href="/commerce-sale" />}>
      Mount Commerce Widget: Flow.Sale
    </Button>
  </>);
}
