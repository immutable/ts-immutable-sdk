'use client';

import { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
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
  // Render the view for the login popup after the login is complete
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged in</h1>
    </div>
  );
}