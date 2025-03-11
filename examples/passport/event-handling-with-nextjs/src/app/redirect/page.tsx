import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePassport } from '@imtbl/sdk/passport';

export default function RedirectPage() {
  const router = useRouter();
  const passport = usePassport();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await passport.loginCallback();
        router.push('/event-handling');
      } catch (error) {
        console.error('Login callback error:', error);
        router.push('/');
      }
    };

    handleRedirect();
  }, [passport, router]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Processing Login...</h1>
      <p>Please wait while we complete your authentication.</p>
    </main>
  );
} 