import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePassport } from '@imtbl/sdk/passport';

export default function LogoutPage() {
  const router = useRouter();
  const passport = usePassport();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await passport.logout();
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        router.push('/');
      }
    };

    handleLogout();
  }, [passport, router]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Logging Out...</h1>
      <p>Please wait while we log you out.</p>
    </main>
  );
} 