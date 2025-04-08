'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/event-handling');
  }, [router]);

  return (
    <div>
      <h1>Redirecting to Event Handling Example...</h1>
    </div>
  );
} 