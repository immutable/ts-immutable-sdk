'use client';
import React, { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      // Handle login callback
      passportInstance.loginCallback()
        .then(() => {
          console.log('Login callback successful');
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
        });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged in</h1>
    </div>
  );
} 