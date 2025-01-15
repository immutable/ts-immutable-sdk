'use client';

import { useState, useCallback } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';
import { passport } from '@imtbl/sdk';

export default function UserProfileInfo() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);

  const loginWithIdentiy = useCallback(async () => {
    if (!passportInstance) return;
    try {
      // #doc passport-login-without-wallet
      const profile: passport.UserProfile | null = await passportInstance.login();
      // #enddoc passport-login-without-wallet
      if (profile) {
        console.log(profile.email);
        console.log(profile.sub);
        setIsLoggedIn(true);
        setEmail(profile.email || 'No Email');
        setSub(profile.sub || 'No Subject');
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport', error);
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <>
      <Heading size="medium" className="mb-1">
        Login with Identity Only
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithIdentiy}
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
            <Table.Cell><b>Email</b></Table.Cell>
            <Table.Cell>{email || 'No Email'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Subject (sub)</b></Table.Cell>
            <Table.Cell>{sub || 'No Subject'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}