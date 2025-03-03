'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      // #doc passport-get-id-token
      const idToken = await passportInstance.getIdToken();
      // #enddoc passport-get-id-token
      // #doc passport-get-access-token
      const accessToken = await passportInstance.getAccessToken();
      // #enddoc passport-get-access-token
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        setIdToken(idToken || null);
        setAccessToken(accessToken || null);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
    }
  };

  const tableStyle: React.CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Verify Tokens with NextJS
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithPassport}
        disabled={isLoggedIn}>
        {isLoggedIn ? 'Logged In' : 'Login'}
      </Button>

      <div style={tableStyle}>
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
            <Table.Row>
              <Table.Cell><b>ID Token</b></Table.Cell>
              <Table.Cell style={{ wordBreak: 'break-word' }}>{idToken || 'N/A'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell><b>Access Token</b></Table.Cell>
              <Table.Cell style={{ wordBreak: 'break-word' }}>{accessToken || 'N/A'}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}