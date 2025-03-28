'use client';

import React, { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault';
import { Heading } from '@biom3/react';

export default function Redirect() {
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
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
        });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Heading size="medium">Logged in</Heading>
    </div>
  );
} 