'use client';

import React, { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault'; // Using the default instance for callback handling

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      passportInstance.loginCallback()
        .then(() => {
          // Optional: Close the popup or redirect parent window if needed
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          }
        })
        .catch((error) => {
          console.error('Error during login callback:', error);
          // Handle error appropriately in UI
        });
    }
  }, []);

  return (
    <main>
      <h1>Processing Login...</h1>
      <p>Please wait while we process your login.</p>
    </main>
  );
} 