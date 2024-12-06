'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

type UserProfile = {
  email?: string;
  nickname?: string;
  sub: string;
};

export default function LoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = passportInstance.connectEvm();
      // #doc passport-get-user-info
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      // #enddoc passport-get-user-info
      const userProfileData = await passportInstance.getUserInfo();
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        setUserProfile(userProfileData || null);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        User Info with Passport
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
          <Table.Row>
            <Table.Cell><b>User Profile</b></Table.Cell>
            <Table.Cell>
              {userProfile ? (
                <>
                  {userProfile.email ? <div>Email: {userProfile.email}</div> : null}
                  {userProfile.nickname ? <div>Nickname: {userProfile.nickname}</div> : null}
                  <div>Sub: {userProfile.sub}</div>
                </>
              ) : 'N/A'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}