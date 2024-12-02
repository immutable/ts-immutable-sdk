'use client';

import { useEffect } from 'react';
import { passportInstance } from '../utils/setupDefault'; // Adjust the path based on your project structure

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      // Perform the login callback to handle the authentication redirect
      passportInstance.loginCallback()
        .then(() => {
          console.log('Login callback successful');
          // Handle post-login actions if needed, like notifying the parent window
          if (window.opener) {
            window.opener.postMessage('authComplete', window.origin);
            window.close();
          }
        })
        .catch((error) => {
          console.error('Error in login callback:', error);
        });
    }
  }, []); // Ensure passportInstance is properly initialized before this component mounts

  // Render the view for the login popup after the login is complete
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged in</h1>
    </div>
  );
}