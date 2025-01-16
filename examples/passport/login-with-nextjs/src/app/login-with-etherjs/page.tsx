'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers'; // Make sure ethers.js is installed
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

  const loginWithEthersjs = useCallback(async () => {
    if (!passportInstance) return;

    try {
      // #doc passport-login-with-ethersjs
      const passportProvider = passportInstance.connectEvm();
      const web3Provider = new ethers.providers.Web3Provider(passportProvider);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      // #enddoc passport-login-with-ethersjs
      if (accounts && accounts.length > 0) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null); // Store the first account address
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport with Ethers.js:', error);
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <>
      <Heading size="medium" className="mb-1">
        Login with EtherJS
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithEthersjs}
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
            <Table.Cell>{accountAddress || 'No Address'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}