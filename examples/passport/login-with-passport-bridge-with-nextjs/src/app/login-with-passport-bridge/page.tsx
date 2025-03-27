'use client';

import React, { useState, useEffect } from 'react';
import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassportBridge() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        if (!passportInstance) return;
        
        // Check if the user is already authenticated
        const userInfoData = await passportInstance.getUserInfo();
        const isUserLoggedIn = !!userInfoData;
        setIsLoggedIn(isUserLoggedIn);
        
        if (isUserLoggedIn) {
          setUserInfo(userInfoData);
          
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
      
      // Use the Bridge authentication approach
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        
        // After successful login, fetch user info
        const userInfoData = await passportInstance.getUserInfo();
        setUserInfo(userInfoData);
        setIsLoggedIn(true);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!passportInstance) return;
    
    try {
      setIsLoading(true);
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAddress('');
      setUserInfo(null);
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Login with Passport Bridge
      </Heading>
      <div className="flex flex-col items-center gap-4">
        {isLoggedIn ? (
          <Button 
            onClick={handleLogout} 
            disabled={isLoading}
            className="mb-1"
            size="medium"
          >
            {isLoading ? 'Loading...' : 'Logout'}
          </Button>
        ) : (
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="mb-1"
            size="medium"
          >
            {isLoading ? 'Loading...' : 'Login with Passport'}
          </Button>
        )}
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        {isLoggedIn && userInfo && (
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">User Information</h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold">Status</td>
                  <td>{isLoggedIn ? 'Logged In' : 'Not Logged In'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Address</td>
                  <td className="break-all">{address || 'Not available'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Email</td>
                  <td>{userInfo.email || 'Not available'}</td>
                </tr>
                {userInfo.nickname && (
                  <tr>
                    <td className="py-1 font-semibold">Nickname</td>
                    <td>{userInfo.nickname}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <Link rc={<NextLink href="/" />}>Return to Examples</Link>
      </div>
    </>
  );
} 