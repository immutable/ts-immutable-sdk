'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@biom3/react';

export default function LogoutPage() {
  const router = useRouter();

  const goToHome = () => {
    router.push('/');
  };

  useEffect(() => {
    // After 3 seconds, redirect to home
    const redirectTimeout = setTimeout(() => {
      goToHome();
    }, 3000);

    return () => {
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div>
      <h1>You have been logged out</h1>
      <p>You will be redirected to the home page in 3 seconds...</p>
      <Button onClick={goToHome} className="mb-1">
        Return to Home Now
      </Button>
    </div>
  );
} 