'use client';

import { usePassport } from '@/context/passport';
import { Heading, Button, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function LoginWithNextJS() {
  const {
    login,
    logout,
    logoutSilent,
    loginWithoutWallet,
    loginWithEthersjs,
  } = usePassport();

  return (
    <div className="flex-container">
      <Heading className="mb-1">Login with NextJS</Heading>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={login}>
        Login
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={loginWithoutWallet}>
        Login without Wallet
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={loginWithEthersjs}>
        Login with EthersJS
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={logout}>
        Logout
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={logoutSilent}>
        Logout in Silent Mode
      </Button>
      <br />
    <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </div>
    );
  }