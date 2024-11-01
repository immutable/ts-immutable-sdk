'use client';

import { usePassport } from '@/context/passport';
import { Heading, Button, Link } from '@biom3/react';
import NextLink from 'next/link';

export default function PassportMethods() {
  const {
    getIdToken,
    getAccessToken,
    getLinkedAddresses,
    getUserInfo,
  } = usePassport();

  return (
    <div className="flex-container">
      <Heading className="mb-1">Passport Methods</Heading>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={getIdToken}>
        Get ID Token
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={getAccessToken}>
        Get Access Token
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={getLinkedAddresses}>
        Get Linked Addresses
      </Button>
      <Button       
        className="mb-1"
        size="medium" 
        onClick={getUserInfo}>
        Get User Info
      </Button>
      <br />
    <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </div>
    );
}