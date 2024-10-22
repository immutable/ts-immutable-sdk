'use client';

import { usePassport } from '@/context/passport';
import { Heading, Button } from '@biom3/react';

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
        Login Without Wallet
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
    </div>
    );
  }