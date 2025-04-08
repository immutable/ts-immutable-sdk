'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../utils/wrapper';

function LogoutContent() {
  const router = useRouter();
  const { setIsAuthenticated, setUserInfo } = useAppContext();

  useEffect(() => {
    // Clear authentication state
    setIsAuthenticated(false);
    setUserInfo(null);
    
    // Redirect to homepage
    router.push('/');
  }, [router, setIsAuthenticated, setUserInfo]);

  return (
    <div className="container">
      <h1>Logging out...</h1>
    </div>
  );
}

export default function Logout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogoutContent />
    </Suspense>
  );
} 