'use client';

import { useEffect, useState } from 'react';
import { passportInstance } from '../utils/setupDefault';

export default function Redirect() {
  const [status, setStatus] = useState<string>('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get state from URL for validation
    const urlParams = new URLSearchParams(window.location.search);
    const stateFromUrl = urlParams.get('state');
    
    const handleCallback = async () => {
      if (!passportInstance) {
        setStatus('Passport instance not initialized');
        return;
      }
      
      try {
        // Handle the callback which completes the PKCE flow
        await passportInstance.loginCallback();
        setStatus('Authentication successful');
        
        // If there's a window opener (popup scenario), send message and close
        if (window.opener) {
          window.opener.postMessage({
            type: 'authComplete',
            state: stateFromUrl
          }, window.origin);
          window.close();
        } else {
          // If not in a popup, redirect back to the main page after a short delay
          setTimeout(() => {
            window.location.href = '/login-with-pkce';
          }, 2000);
        }
      } catch (error) {
        console.error('Error in login callback:', error);
        setStatus('Authentication failed');
        setError('Error handling login callback');
      }
    };
    
    handleCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{status}</h1>
      {error && <p className="text-red-500">{error}</p>}
      <p>You will be redirected automatically...</p>
    </div>
  );
} 