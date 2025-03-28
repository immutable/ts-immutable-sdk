'use client';
import React, { useState, useEffect } from 'react';
import { Button, Heading, Box, Stack } from '@biom3/react';
import { useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassportGuardian() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        if (!passportInstance) return;
        const accessToken = await passportInstance.getAccessToken();
        setIsLoggedIn(!!accessToken);
      } catch (err) {
        console.error('Error checking login status:', err);
        setError(err instanceof Error ? err.message : 'Error checking authentication status');
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!passportInstance) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Login with Guardian authentication method
      // The actual implementation for Guardian login with Passport
      await passportInstance.login();
      // After successful login, the user will be redirected to the redirect URI
      // configured in the Passport instance
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during login');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!passportInstance) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await passportInstance.logout();
      setIsLoggedIn(false);
      setIsLoading(false);
      // User will be redirected to the logout redirect URI
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during logout');
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Stack gap="x4" alignItems="center">
        <Heading size="xLarge">Login with Passport Guardian</Heading>
        
        {error && (
          <Box sx={{ 
            backgroundColor: 'var(--biome-color-negative100)', 
            borderRadius: 'var(--biome-radius-medium)', 
            padding: 'var(--biome-space-x3)'
          }}>
            <p style={{ color: 'var(--biome-color-negative500)' }}>{error}</p>
          </Box>
        )}
        
        {isLoading ? (
          <div>Loading...</div>
        ) : isLoggedIn ? (
          <Stack gap="x4" alignItems="center">
            <p>You are currently logged in with Passport Guardian.</p>
            <Button onClick={handleLogout} variant="secondary">Logout</Button>
          </Stack>
        ) : (
          <Stack gap="x4" alignItems="center">
            <p>Authenticate with Immutable Passport using Guardian.</p>
            <p>Guardian is a key management system that works with your Passport wallet. It uses a 2-of-2 multisig approach with a User Key (stored on your device) and a Guardian Key (stored by Immutable) to secure your assets.</p>
            <Button onClick={handleLogin}>Login with Guardian</Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
} 