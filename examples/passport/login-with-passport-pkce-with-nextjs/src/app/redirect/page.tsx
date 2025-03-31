'use client';

import React, { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      // #doc passport-pkce-callback
      passportInstance.loginCallback()
      // #enddoc passport-pkce-callback
        .then(() => {
          console.log('Login callback successful');
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          } else {
            window.location.href = '/';
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
          window.location.href = '/';
        });
    }
  }, []);

  return (
    <div className="flex-container">
      <h1>Processing login...</h1>
    </div>
  );
} 