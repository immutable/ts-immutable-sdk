'use client';

import { useState } from 'react';
import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupLogoutSilent';

export default function SimplifiedLoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
    }
  };

  const logout = async () => {
    if (!passportInstance || !isLoggedIn) return;
    try {
      // #doc passport-silent-logout
      await passportInstance.logout();
      // #enddoc passport-silent-logout
      setIsLoggedIn(false);
      setAccountAddress(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Logout with Silent Mode
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={isLoggedIn ? logout : loginWithPassport}
      >
        {isLoggedIn ? 'Logout' : 'Login'}
      </Button>
      {isLoggedIn && accountAddress && (
        <div>Logged in as: {accountAddress}</div>
      )}
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}