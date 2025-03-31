'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';
import { Heading, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function Redirect() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function handleLoginCallback() {
      try {
        setIsProcessing(true);
        
        // In PKCE flow, loginCallback will:
        // 1. Extract the authorization code from the URL
        // 2. Retrieve the previously stored code verifier
        // 3. Exchange the code + verifier for access and refresh tokens
        // 4. Store the tokens securely
        await passportInstance.loginCallback();
        
        // Redirect to the main feature page after successful authentication
        router.push('/login-with-passport-pkce');
      } catch (err: any) {
        console.error('Login callback error:', err);
        
        // Provide more specific error messages based on the error type
        if (err.message?.includes('code_verifier')) {
          setError('PKCE verification failed: Code verifier missing or invalid');
        } else if (err.message?.includes('invalid_grant')) {
          setError('Invalid authorization code. The code may have expired or already been used.');
        } else {
          setError(`Failed to process login: ${err.message || 'Unknown error'}`);
        }
        
        setIsProcessing(false);
      }
    }

    handleLoginCallback();
  }, [router]);

  if (error) {
    return (
      <>
        <Heading size="medium" className="mb-1">
          Authentication Error
        </Heading>
        <p className="mb-1">{error}</p>
        <Link rc={<NextLink href="/" />}>Return to Home</Link>
      </>
    );
  }

  return (
    <>
      <Heading size="medium" className="mb-1">
        Redirecting...
      </Heading>
      <p className="mb-1">You are being redirected after authentication. Processing PKCE token exchange...</p>
      <p>Please wait...</p>
    </>
  );
} 