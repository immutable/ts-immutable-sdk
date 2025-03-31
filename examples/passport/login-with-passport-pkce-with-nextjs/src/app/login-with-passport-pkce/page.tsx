'use client';
import React, { useEffect, useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassportPKCE() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check authentication status by trying to get the id token
        // If it succeeds, the user is logged in
        const accessToken = await passportInstance.getAccessToken();
        setIsLoggedIn(!!accessToken);

        if (accessToken) {
          const userProfile = await passportInstance.getUserInfo();
          setUserInfo(userProfile);
        }
      } catch (err) {
        console.error('Error checking login status:', err);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // The PKCE flow is handled automatically by the SDK when usePKCE is set to true
      // in the passport configuration. The SDK will:
      // 1. Generate a code verifier (random string)
      // 2. Derive a code challenge from the verifier using SHA-256
      // 3. Include the code challenge in the authorization request
      // 4. Store the code verifier to be used during token exchange
      await passportInstance.login();
      
      // Note: After successful authentication, the user will be redirected
      // to the redirect URI, where loginCallback() will exchange the
      // authorization code for tokens using the stored code verifier
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  if (isLoggedIn && userInfo) {
    return (
      <>
        <Heading size="medium" className="mb-1">
          Successfully logged in with PKCE flow
        </Heading>
        
        <Table className="mb-1">
          <Table.Head>
            <Table.Row>
              <Table.Cell>Attribute</Table.Cell>
              <Table.Cell>Value</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell><b>Email</b></Table.Cell>
              <Table.Cell>{userInfo.email || 'N/A'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell><b>Nickname</b></Table.Cell>
              <Table.Cell>{userInfo.nickname || 'N/A'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell><b>Sub</b></Table.Cell>
              <Table.Cell>{userInfo.sub || 'N/A'}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        
        <Button size="medium" onClick={handleLogout} className="mb-1">Logout</Button>
        <br />
        <Link rc={<NextLink href="/" />}>Return to Home</Link>
      </>
    );
  }

  return (
    <>
      <Heading size="medium" className="mb-1">
        Login with Passport PKCE Authentication
      </Heading>
      <p className="mb-1">
        This example demonstrates the PKCE (Proof Key for Code Exchange) login flow.
        PKCE adds an extra layer of security by using a code verifier and challenge
        to prevent authorization code interception attacks.
      </p>
      <Button 
        size="medium" 
        onClick={handleLogin} 
        disabled={isLoading}
        className="mb-1">
        {isLoading ? 'Loading...' : 'Login with Passport'}
      </Button>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Home</Link>
    </>
  );
} 