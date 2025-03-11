'use client';
import { Button, Stack } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <Stack direction="column" alignItems="center" gap="spacing5">
      <h1>Cross-SDK Bridge Example</h1>
      <p>This example demonstrates how to use the Cross-SDK Bridge feature</p>
      <p>This feature enables data persistence across different SDK instances using IndexedDB</p>
      
      <Button
        className="mb-1"
        size="medium"
        rc={<NextLink href="/login-with-bridge" />}>
        Try Cross-SDK Bridge
      </Button>
      
      <h2>What does this example show?</h2>
      <ul>
        <li>How to enable the Cross-SDK Bridge feature</li>
        <li>How data persists across different SDK instances</li>
        <li>IndexedDB storage integration</li>
      </ul>
    </Stack>
  );
} 