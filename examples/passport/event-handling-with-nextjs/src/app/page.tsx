import { Button } from '@biom3/react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Passport Event Handling Example</h1>
      <p className="mb-8">
        This example demonstrates how to implement event handling with the Immutable Passport SDK.
        You can monitor wallet connections, account changes, and network changes.
      </p>

      <Link href="/event-handling">
        <Button variant="primary">
          Try Event Handling Demo
        </Button>
      </Link>
    </main>
  );
} 