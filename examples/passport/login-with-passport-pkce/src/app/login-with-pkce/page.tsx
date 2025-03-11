'use client';

import { useState, useEffect } from 'react';
import { Button, Heading, Table, Link, Card } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPKCE() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate random state parameter for CSRF protection
  const generateState = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        if (passportInstance) {
          const isAuthenticated = await passportInstance.isAuthenticated();
          setIsLoggedIn(isAuthenticated);
          
          if (isAuthenticated) {
            const provider = await passportInstance.connectEvm();
            const accounts = await provider.request({ method: 'eth_accounts' });
            setAccountAddress(accounts[0] || null);
            
            // Get user info
            try {
              const userProfile = await passportInstance.getUserInfo();
              setUserInfo(userProfile);
            } catch (profileError) {
              console.error('Error getting user profile:', profileError);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setError('Failed to check authentication status');
      }
    };
    
    checkLoginStatus();
  }, []);

  const loginWithPKCE = async () => {
    if (!passportInstance) return;
    
    try {
      // Generate and store state parameter for CSRF protection
      const stateParam = generateState();
      setState(stateParam);
      
      // Pass state parameter to login method for CSRF protection
      await passportInstance.login({
        pkce: true, // Explicitly enable PKCE flow
        state: stateParam, // Pass state parameter for CSRF validation
      });
      
      // The rest of the login flow will be handled by the redirect page
    } catch (error) {
      console.error('Error initiating PKCE login:', error);
      setError('Failed to initiate login process');
    }
  };

  const logout = async () => {
    if (!passportInstance) return;
    
    try {
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAccountAddress(null);
      setUserInfo(null);
      setState(null);
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout');
    }
  };

  return (
    <Card padding="medium" className="max-w-2xl w-full">
      <Heading size="medium" className="mb-1">
        PKCE Flow Authentication
      </Heading>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <p className="mb-4">
        This example demonstrates the PKCE (Proof Key for Code Exchange) flow, which provides enhanced security 
        for public clients by using a code verifier and challenge. It also implements state validation to protect
        against CSRF attacks.
      </p>
      
      {isLoggedIn ? (
        <Button
          className="mb-4"
          size="medium"
          onClick={logout}>
          Logout
        </Button>
      ) : (
        <Button
          className="mb-4"
          size="medium"
          onClick={loginWithPKCE}>
          Login with PKCE
        </Button>
      )}

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Attribute</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Authentication Status</b></Table.Cell>
            <Table.Cell>{isLoggedIn ? 'Authenticated' : 'Not Authenticated'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Account Address</b></Table.Cell>
            <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
          </Table.Row>
          {state && (
            <Table.Row>
              <Table.Cell><b>State Parameter (CSRF Protection)</b></Table.Cell>
              <Table.Cell>{state}</Table.Cell>
            </Table.Row>
          )}
          {userInfo && (
            <>
              <Table.Row>
                <Table.Cell><b>User ID</b></Table.Cell>
                <Table.Cell>{userInfo.sub || 'N/A'}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell><b>Email</b></Table.Cell>
                <Table.Cell>{userInfo.email || 'N/A'}</Table.Cell>
              </Table.Row>
            </>
          )}
        </Table.Body>
      </Table>
      
      <div className="mt-4">
        <Link rc={<NextLink href="/" />}>Return to Home</Link>
      </div>
    </Card>
  );
} 