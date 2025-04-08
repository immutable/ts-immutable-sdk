'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../utils/wrapper';

function RedirectContent() {
  const router = useRouter();
  const { selectedPassportInstance, setIsAuthenticated } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Process the authentication callback
        await selectedPassportInstance.loginCallback();
        setIsAuthenticated(true);
        
        // Redirect back to the setup page that initiated the login
        const savedConfig = localStorage.getItem('passportSetupConfig') || 'standard';
        router.push(`/passport-setup?config=${savedConfig}`);
      } catch (error) {
        console.error('Authentication callback error:', error);
        setError('Authentication failed. Please try again.');
      }
    };

    handleRedirect();
  }, [selectedPassportInstance, setIsAuthenticated, router]);

  return (
    <div className="container">
      <h1>Processing Authentication...</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default function Redirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectContent />
    </Suspense>
  );
} 