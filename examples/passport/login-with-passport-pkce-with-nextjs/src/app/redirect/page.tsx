'use client';

import React, { useEffect, useState } from 'react';
import { passportInstance } from '../utils/setupDefault';
import { useRouter } from 'next/navigation';

export default function Redirect() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (passportInstance) {
      // #doc passport-login-callback
      passportInstance.loginCallback()
      // #enddoc passport-login-callback
        .then(() => {
          console.log('Login callback successful');
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          } else {
            // If not opened in a popup, redirect back to the login page
            setTimeout(() => {
              router.push('/login-with-passport-pkce');
            }, 1500); // Short delay to show success message
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
          setError('Authentication failed. Please try again.');
        });
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Authentication Successful</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Redirecting you back to the application...</p>
    </div>
  );
} 