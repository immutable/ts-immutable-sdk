'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLoginCallback() {
      try {
        if (passportInstance) {
          await passportInstance.loginCallback();
          router.push('/events');
        }
      } catch (error) {
        console.error('Error processing login callback:', error);
        router.push('/');
      }
    }

    handleLoginCallback();
  }, [router]);

  return (
    <div>
      <h1>Processing login...</h1>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
} 