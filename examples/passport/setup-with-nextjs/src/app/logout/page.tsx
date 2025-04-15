'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Since logoutMode is 'silent' in setupDefault for the relevant instances,
    // Passport handles the logout silently.
    // This page exists primarily as the target for logoutRedirectUri.
    // We can redirect the user back to the home page after logout is complete.
    console.log("Logout page reached. Redirecting to home.");
    router.push('/');
  }, [router]);

  return (
    <main>
      <h1>Logging out...</h1>
      <p>You are being logged out.</p>
    </main>
  );
} 