'use client';

import { useState, useCallback } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDevnet';
import { passport } from '@imtbl/sdk';
import jwt_decode from 'jwt-decode';

interface IdTokenPayload {
  sub?: string;
  [key: string]: any;
}

export default function UserProfileInfo() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const [passportId, setPassportId] = useState<string | null>(null);
  const [devrevToken, setDevrevToken] = useState<string | null>(null);

  const loginWithIdentiy = useCallback(async () => {
    if (!passportInstance) return;
    try {
      // #doc passport-login-without-wallet
      const profile: passport.UserProfile | null = await passportInstance.login();
      // #enddoc passport-login-without-wallet
      if (profile) {
        const accessToken = await passportInstance.getAccessToken();

        if (accessToken) {
          console.log(accessToken);
          const decodedToken = jwt_decode<IdTokenPayload>(accessToken);
          setPassportId(decodedToken.sub || null);
          console.log(decodedToken);
        }

        // Make API call with access token
        if (accessToken) {
          try {
            const response = await fetch('http://localhost:8070/v1/support/devrev/token', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              mode: 'cors'
            });
            const data = await response.json();
            console.log('Support API Response:', data);
            setDevrevToken(data.access_token || null);

            // Decode and log DevRev token claims
            if (data.access_token) {
              const decodedDevRevToken = jwt_decode<IdTokenPayload>(data.access_token);
              console.log('DevRev Token Claims:', {
                sub: decodedDevRevToken.sub,
                aud: decodedDevRevToken.aud,
                exp: decodedDevRevToken.exp,
                iat: decodedDevRevToken.iat,
                iss: decodedDevRevToken.iss,
                jti: decodedDevRevToken.jti,
                'http://devrev.ai/clientid': decodedDevRevToken['http://devrev.ai/clientid'],
                'http://devrev.ai/devrev_don': decodedDevRevToken['http://devrev.ai/devrev_don'],
                'http://devrev.ai/devrevid': decodedDevRevToken['http://devrev.ai/devrevid'],
                'http://devrev.ai/displayname': decodedDevRevToken['http://devrev.ai/displayname'],
                'http://devrev.ai/email': decodedDevRevToken['http://devrev.ai/email'],
                'http://devrev.ai/is_verified': decodedDevRevToken['http://devrev.ai/is_verified'],
                'http://devrev.ai/parent_jti': decodedDevRevToken['http://devrev.ai/parent_jti'],
                'http://devrev.ai/revuid': decodedDevRevToken['http://devrev.ai/revuid'],
                'http://devrev.ai/session_tokentype': decodedDevRevToken['http://devrev.ai/session_tokentype'],
                'http://devrev.ai/tokentype': decodedDevRevToken['http://devrev.ai/tokentype']
              });
            }
          } catch (error) {
            console.error('Error calling support API:', error);
            setDevrevToken(null);
          }
        }

        setIsLoggedIn(true);
        setEmail(profile.email || 'No Email');
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
        Login Devnet with Identity Only
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
            <Table.Cell><b>Passport ID</b></Table.Cell>
            <Table.Cell>{passportId || 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}