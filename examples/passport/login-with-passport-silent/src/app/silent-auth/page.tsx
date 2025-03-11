'use client';

import { Button, Card, Divider, Stack } from '@biom3/react';
import { useCallback, useEffect, useState } from 'react';
import { passportInstance } from '../utils/setupDefault';
import Link from 'next/link';

export default function SilentAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Function to check if the user is already logged in
  const checkLoginStatus = useCallback(async () => {
    try {
      const isAuthenticated = await passportInstance.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated) {
        const userProfile = await passportInstance.getUserInfo();
        setUserInfo(userProfile);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Error checking login status:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, []);

  // Function to handle silent login
  const handleSilentLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Attempt to login with useSilentLogin option
      const userProfile = await passportInstance.login({ useSilentLogin: true });
      
      if (userProfile) {
        setIsLoggedIn(true);
        setUserInfo(userProfile);
        setLastRefreshed(new Date());
      } else {
        // If silent login fails, inform user that manual login is required
        setError('Silent login failed. You need to login manually.');
      }
    } catch (err) {
      console.error('Silent login error:', err);
      setError(err instanceof Error ? err.message : 'Silent authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle manual login (fallback)
  const handleManualLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Regular login (will open popup)
      const userProfile = await passportInstance.login();
      
      if (userProfile) {
        setIsLoggedIn(true);
        setUserInfo(userProfile);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh the token
  const handleTokenRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Force a token refresh
      await passportInstance.logout({ silent: true });
      const userProfile = await passportInstance.login({ useSilentLogin: true });
      
      if (userProfile) {
        setUserInfo(userProfile);
        setLastRefreshed(new Date());
      } else {
        setError('Token refresh failed. Try logging in again.');
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      setError(err instanceof Error ? err.message : 'Token refresh failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return (
    <Stack gap="l" alignItems="center">
      <h1>Silent Authentication Example</h1>
      
      <Card>
        <Stack gap="m">
          <h2>Authentication Status</h2>
          <p>Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}</p>
          
          {error && (
            <p style={{ color: 'red' }}>Error: {error}</p>
          )}
          
          {!isLoggedIn ? (
            <Stack direction="row" gap="m">
              <Button 
                variant="primary" 
                onClick={handleSilentLogin} 
                disabled={isLoading}
              >
                {isLoading ? 'Trying Silent Login...' : 'Try Silent Login'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleManualLogin} 
                disabled={isLoading}
              >
                Manual Login (Fallback)
              </Button>
            </Stack>
          ) : (
            <Stack gap="m">
              <h3>User Information</h3>
              <p>ID: {userInfo?.sub}</p>
              <p>Email: {userInfo?.email}</p>
              <p>Last token refresh: {lastRefreshed?.toLocaleString()}</p>
              
              <Button
                variant="secondary"
                onClick={handleTokenRefresh}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing Token...' : 'Manually Refresh Token'}
              </Button>
            </Stack>
          )}
        </Stack>
      </Card>
      
      <Divider />
      
      <Stack direction="row" gap="m">
        <Link href="/">
          <Button variant="tertiary">Back to Home</Button>
        </Link>
        <Link href="/logout">
          <Button variant="secondary">Logout</Button>
        </Link>
      </Stack>
    </Stack>
  );
} 