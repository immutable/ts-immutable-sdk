'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';
import { UserProfile } from '@imtbl/sdk/passport';

export default function PassportSetupDefaultPage() {
  // Use the specific instance directly
  const specificInstance = passportInstance;

  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Function to check for session and fetch info if present
  const checkSession = useCallback(async () => {
    if (!isClientReady) return;
    setLoading(true);
    setError(null); // Clear previous errors on check
    try {
      // Attempt to get user info to check for an active session
      const user = await specificInstance.getUserInfo();
      if (user) {
        // Session exists
        const linkedAddresses = await specificInstance.getLinkedAddresses();
        setUserInfo(user);
        setWalletAddress(linkedAddresses[0] || null);
        setIsSessionActive(true);
      } else {
        // No user info means no active session for this instance
        setIsSessionActive(false);
        setUserInfo(null);
        setWalletAddress(null);
      }
    } catch (err: any) {
      // Treat errors during check as no active session
      console.warn('checkSession error (likely no session or auth required): ', err.message);
      setIsSessionActive(false);
      setUserInfo(null);
      setWalletAddress(null);
      // Do not set main error state here, as it might just mean user needs to login
    } finally {
      setLoading(false);
    }
  }, [isClientReady, specificInstance]);

  // Check env vars and initial session state on mount
  useEffect(() => {
    setError(null);
    if (!process.env.NEXT_PUBLIC_CLIENT_ID || !process.env.NEXT_PUBLIC_PUBLISHABLE_KEY) {
      setError('Config Error: Client ID or Publishable Key missing.');
    } else {
      // Set client ready
      setIsClientReady(true);
    }

    const handleAuthComplete = (event: MessageEvent) => {
      if (event.origin === window.origin && event.data === 'authComplete') {
        setTimeout(() => {
          checkSession();
        }, 200);
      }
    };
    window.addEventListener('message', handleAuthComplete);

    return () => {
      window.removeEventListener('message', handleAuthComplete);
    };
  }, [checkSession]);

  // Effect to run checkSession once client is ready
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
      setIsSessionActive(false); // Ensure session state is false on login error
    } finally {
      // Ensure loading is always stopped after the login attempt finishes
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
      setIsSessionActive(false); // Update session state
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
      <Heading size="medium" className="mb-1">Passport Setup: Default Configuration</Heading>
      <p className="mb-1">
        Testing Passport behavior using the <strong>Default Configuration</strong> configuration.
      </p>

      {/* Configuration Error */}
      {!isClientReady && error && (
        <p className="mb-1" style={{ color: 'red' }}>
          <strong>Configuration Error:</strong> {error}
        </p>
      )}

      {isClientReady && (
        <>
          <div className="mb-1">
            {/* Show Login only if no active session */}
            {!isSessionActive && (
              <Button onClick={handleLogin} disabled={loading} className="mb-1">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            )}
            {/* Show Logout only if session is active */}
            {isSessionActive && (
              <Button onClick={handleLogout} disabled={loading} className="mb-1">
                {loading ? 'Logging out...' : 'Logout'}
              </Button>
            )}
          </div>

          {/* Informational message when session is active */}
          {isSessionActive && (
            <p className="mb-1" style={{ fontStyle: 'italic', color: '#6c757d' }}>
               An existing session was detected. Please <strong>Logout</strong> first to test the specific <strong>Login</strong> behavior for this configuration.
             </p>
          )}

          {/* General Loading Indicator */}
          {loading && <p className="mb-1">Loading...</p>}

          {/* Error display (only show if not loading) */}
          {error && !loading && (
            <p className="mb-1" style={{ color: 'red' }}>
              <strong>Error:</strong> {error}
            </p>
          )}

          {/* Show user info only if a session is active */}
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
          <Link rc={<NextLink href="/" />}>Return to Examples</Link>
        </>
      )}
    </>
  );
} 