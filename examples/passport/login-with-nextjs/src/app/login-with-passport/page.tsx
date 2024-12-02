'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);


  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts) {
        setIsLoggedIn(true); // Set logged in state if login is successful
        setAccountAddress(accounts[0] || null); 
      } else {
        setIsLoggedIn(false); // Ensure logged out state if necessary
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false); // Ensure correct state on error
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Login with Passport
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithPassport}
        disabled={isLoggedIn}>
        {isLoggedIn ? 'Logged In' : 'Login'}
      </Button>

      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Attribute</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Is Logged In</b></Table.Cell>
            <Table.Cell>{isLoggedIn ? 'Yes' : 'No'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Account Address</b></Table.Cell>
            <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}