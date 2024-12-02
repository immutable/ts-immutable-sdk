'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      // Attempt to log in
      const userProfile = await passportInstance.login({
        useCachedSession: false, // Modify based on your requirement
        useSilentLogin: false, // Modify based on your requirement
        anonymousId: '', // Provide if needed
      });

      if (userProfile) {
        setIsLoggedIn(true); // Set logged in state if login is successful
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
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}