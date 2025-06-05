'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstanceWithGenericOverlayDisabled as specificInstance } from '../utils/setupDefault';
import { UserProfile } from '@imtbl/sdk/passport';

export default function PassportSetupGenericOverlayDisabledPage() {
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  const checkSession = useCallback(async () => {
    if (!isClientReady) return;
    setLoading(true);
    setError(null);
    try {
      const user = await specificInstance.getUserInfo();
      if (user) {
        const linkedAddresses = await specificInstance.getLinkedAddresses();
        setUserInfo(user);
        setWalletAddress(linkedAddresses[0] || null);
        setIsSessionActive(true);
      } else {
        setIsSessionActive(false);
        setUserInfo(null);
        setWalletAddress(null);
      }
    } catch (err: any) {
      console.warn('checkSession error: ', err.message);
      setIsSessionActive(false);
      setUserInfo(null);
      setWalletAddress(null);
    } finally {
      setLoading(false);
    }
  }, [isClientReady]);

  useEffect(() => {
    setError(null);
    if (!process.env.NEXT_PUBLIC_CLIENT_ID || !process.env.NEXT_PUBLIC_PUBLISHABLE_KEY) {
      setError('Config Error: Client ID or Publishable Key missing.');
    } else {
      setIsClientReady(true);
    }

    const handleAuthComplete = (event: MessageEvent) => {
      if (event.origin === window.origin && event.data === 'authComplete') {
        setTimeout(checkSession, 200); 
      }
    };
    window.addEventListener('message', handleAuthComplete);
    return () => {
      window.removeEventListener('message', handleAuthComplete);
    };
  }, [checkSession]);

  useEffect(() => {
    if (isClientReady) {
        checkSession();
    }
  }, [isClientReady, checkSession]);

  const handleLogin = async () => {
    if (!isClientReady || isSessionActive) return;
    setLoading(true);
    setError(null);
    try {
      await specificInstance.login(); 
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(`Login Error: ${err.message || err}`);
      setUserInfo(null); 
      setWalletAddress(null); 
      setIsSessionActive(false); 
    } finally {
      await checkSession();
      setLoading(false); 
    }
  };

  const handleLogout = async () => {
    if (!isClientReady) return;
    setLoading(true);
    setError(null);
    try {
      await specificInstance.logout();
      setIsSessionActive(false); 
      setUserInfo(null);
      setWalletAddress(null);
    } catch (err: any) {
      console.error('Logout Error:', err);
      setError(`Logout Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">Passport Setup: Generic Popup Overlay Disabled</Heading>
      <p className="mb-1">Testing Passport behavior using the <strong>Generic Popup Overlay Disabled</strong> configuration.</p>
      {!isClientReady && error && (
        <p className="mb-1" style={{ color: 'red' }}>
          <strong>Configuration Error:</strong> {error}
        </p>
      )}
      {isClientReady && (
        <>
          <div className="mb-1">
            {!isSessionActive && (
              <Button onClick={handleLogin} disabled={loading} className="mb-1">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            )}
            {isSessionActive && (
              <Button onClick={handleLogout} disabled={loading} className="mb-1">
                {loading ? 'Logging out...' : 'Logout'}
              </Button>
            )}
          </div>
          {isSessionActive && (
            <p className="mb-1" style={{ fontStyle: 'italic', color: '#6c757d' }}>
               An existing session was detected. Please <strong>Logout</strong> first to test the specific <strong>Login</strong> behavior for this configuration.
             </p>
          )}
          {loading && <p className="mb-1">Loading...</p>}
          {error && !loading && (
            <p className="mb-1" style={{ color: 'red' }}>
              <strong>Error:</strong> {error}
            </p>
          )}
          {isSessionActive && userInfo && (
            <>
              <Heading size="small" className="mb-1">User Information (from current session)</Heading>
              <Table className="mb-1">
                <Table.Body>
                  <Table.Row>
                    <Table.Cell><b>Email</b></Table.Cell>
                    <Table.Cell>{userInfo.email || 'N/A (Scope likely missing)'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><b>Nickname</b></Table.Cell>
                    <Table.Cell>{userInfo.nickname || 'N/A'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><b>Sub</b></Table.Cell>
                    <Table.Cell>{userInfo.sub}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell><b>Wallet Address</b></Table.Cell>
                    <Table.Cell>{walletAddress || 'N/A'}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </>
          )}
          <Link rc={<NextLink href="/" />} className="mb-1">Return to Examples</Link>
        </>
      )}
    </>
  );
} 