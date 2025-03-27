'use client';

import React, { useState, useEffect } from 'react';
import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassportPKCE() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        if (!passportInstance) return;
        
        // Use getUserInfo to check if the user is authenticated
        const userInfo = await passportInstance.getUserInfo();
        const isUserLoggedIn = !!userInfo;
        setIsLoggedIn(isUserLoggedIn);
        
        if (isUserLoggedIn) {
          try {
            // Get wallet address using connectEvm
            const provider = await passportInstance.connectEvm();
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
            }
          } catch (walletError) {
            console.error('Error retrieving wallet address:', walletError);
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setError('Failed to check login status');
      }
    }
    
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!passportInstance) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Initiate the PKCE login flow
      // This will redirect the user to the Immutable Passport login page
      await passportInstance.login();
      
      // Note: The code execution won't reach here immediately as the login flow involves a redirect
      // The redirect callback handler in the redirect page will complete the authentication process
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Login with Passport PKCE
      </Heading>
      <div className="flex flex-col items-center gap-4">
        <Button 
          onClick={handleLogin} 
          disabled={isLoggedIn || isLoading}
        >
          {isLoggedIn ? 'Logged In' : isLoading ? 'Loading...' : 'Login with Passport'}
        </Button>
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <table>
          <tbody>
            <tr>
              <td><b>Is Logged In</b></td>
              <td>{isLoggedIn ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td><b>Account Address</b></td>
              <td>{address || 'Not logged in'}</td>
            </tr>
          </tbody>
        </table>
        
        <Link rc={<NextLink href="/" />}>Return to Examples</Link>
      </div>
    </>
  );
} 