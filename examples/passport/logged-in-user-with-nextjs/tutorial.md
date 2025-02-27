# Managing Logged-in User Data with Immutable Passport

This tutorial demonstrates how to manage and access logged-in user data using Immutable Passport in a Next.js application. You'll learn how to retrieve user profile information, manage linked addresses, and handle authentication tokens in a secure and efficient way.

## Overview

This example app showcases three main features:
1. **User Profile Management**: Retrieve and display user information like email and nickname
2. **Linked Addresses**: View and manage blockchain addresses associated with the user's account
3. **Token Verification**: Handle ID and access tokens for authentication and API access

Each feature is implemented as a separate page with its own functionality while sharing common authentication logic.

## Prerequisites

Before starting this tutorial, ensure you have:

- Node.js installed on your system
- An Immutable Hub account
- Basic understanding of React and Next.js
- Your Immutable Hub publishable API key and client ID
- Understanding of JWT tokens and authentication flows
- Familiarity with OAuth2/OpenID Connect concepts

## Project Setup

1. Create a new Next.js project with TypeScript:

```bash
pnpm create next-app@latest passport-logged-in-example --typescript
cd passport-logged-in-example
```

2. Install the required dependencies:

```bash
pnpm add @imtbl/sdk @biom3/react
```

3. Create a `.env` file in your project root:

```env
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
NEXT_PUBLIC_CLIENT_ID=your_client_id_here
```

## Project Structure

The application is organized as follows:

```
src/
├── app/
│   ├── linked-addresses-with-passport/  # Linked addresses management
│   │   └── page.tsx
│   ├── user-info-with-passport/        # User profile information
│   │   └── page.tsx
│   ├── verify-tokens-with-nextjs/      # Token verification
│   │   └── page.tsx
│   ├── utils/
│   │   └── setupDefault.ts             # Passport configuration
│   ├── layout.tsx                      # App layout
│   └── page.tsx                        # Navigation page
```

## Setting up Passport

First, let's configure the Passport instance. Create `src/app/utils/setupDefault.ts`:

```typescript
import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX,
      publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
    redirectUri: 'http://localhost:3000/redirect',
    logoutRedirectUri: 'http://localhost:3000/logout',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
});
```

Key configuration points:
- `environment`: Set to SANDBOX for testing, change to PRODUCTION for live apps
- `scope`: Includes necessary permissions for user data access
- `audience`: Set to 'platform_api' for Immutable API access
- `redirectUri`: Must match the URI configured in your Immutable Hub application

## Creating the Home Page

The home page (`src/app/page.tsx`) provides navigation to different user data management features:

```typescript
'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        User Information after Logging In with NextJS
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/linked-addresses-with-passport" />}>
        Linked Addresses with Passport
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/user-info-with-passport" />}>
        User Info with Passport
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/verify-tokens-with-nextjs" />}>
        Verify Tokens with NextJS
      </Button> 
  </>);
}
```

## Implementing User Profile Information

Create `src/app/user-info-with-passport/page.tsx`:

```typescript
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
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
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
```

## Managing Linked Addresses

Create `src/app/linked-addresses-with-passport/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithPassport() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [linkedAddresses, setLinkedAddresses] = useState<string[]>([]);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        const addresses = await passportInstance.getLinkedAddresses();
        setLinkedAddresses(addresses || []);
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
        Linked Addresses with Passport
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
            <Table.Cell><b>Linked Addresses</b></Table.Cell>
            <Table.Cell>{linkedAddresses.length ? linkedAddresses.join(', ') : 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
```

## Implementing Token Verification

Create `src/app/verify-tokens-with-nextjs/page.tsx`:

```typescript
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
      const idToken = await passportInstance.getIdToken();
      const accessToken = await passportInstance.getAccessToken();
      
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

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
```

## Key Concepts

### 1. User Profile Information

The `getUserInfo()` method provides access to the user's profile information:
- Email address (if available)
- Nickname (if available)
- Subject identifier (sub)
- Other OIDC standard claims

### 2. Linked Addresses

The `getLinkedAddresses()` method returns an array of blockchain addresses that are linked to the user's Passport account. This is useful for:
- Displaying all addresses associated with the user
- Managing multiple wallets
- Cross-chain functionality

### 3. Token Management

Two types of tokens are available:
- **ID Token**: Contains user identity information
- **Access Token**: Used for API authentication

Methods:
- `getIdToken()`: Retrieves the ID token
- `getAccessToken()`: Retrieves the access token

### 4. State Management

The application uses React's useState hook to manage:
- Login status
- User profile data
- Linked addresses
- Authentication tokens
- Account addresses

## Security Best Practices

### Token Handling
1. **Never Store Sensitive Data in Local Storage**
   ```typescript
   // ❌ Don't do this
   localStorage.setItem('accessToken', token);
   
   // ✅ Instead, use state management or secure storage solutions
   const [accessToken, setAccessToken] = useState<string | null>(null);
   ```

2. **Implement Token Refresh Logic**
   ```typescript
   // Example token refresh implementation
   const refreshTokens = async () => {
     try {
       await passportInstance.refreshTokens();
     } catch (error) {
       // Handle refresh error, possibly redirect to login
       console.error('Token refresh failed:', error);
     }
   };
   ```

3. **Secure API Calls**
   ```typescript
   // Example of secure API call with access token
   const makeSecureApiCall = async () => {
     const accessToken = await passportInstance.getAccessToken();
     const response = await fetch('your-api-endpoint', {
       headers: {
         Authorization: `Bearer ${accessToken}`,
       },
     });
     return response.json();
   };
   ```

### Error Handling
Implement comprehensive error handling for all authentication operations:

```typescript
const handleAuthOperation = async () => {
  try {
    // Attempt authentication operation
    await passportInstance.someOperation();
  } catch (error) {
    if (error instanceof passport.PassportError) {
      switch (error.code) {
        case 'token_expired':
          await refreshTokens();
          break;
        case 'user_cancelled':
          // Handle user cancellation
          break;
        default:
          // Handle other errors
          console.error('Authentication error:', error);
      }
    }
  }
};
```

## Advanced Usage

### Custom Hook for Authentication State
Create a reusable hook for managing authentication state:

```typescript
function usePassportAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const profile = await passportInstance.getUserInfo();
        setIsLoggedIn(!!profile);
        setUserProfile(profile);
      } catch (error) {
        setIsLoggedIn(false);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return { isLoggedIn, userProfile, loading };
}
```

### Protected Route Component
Implement a higher-order component for protected routes:

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = usePassportAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <redirect to="/login" />;
  }

  return children;
}
```

## Troubleshooting Guide

### Common Issues

1. **Token Expiration**
   - Symptom: API calls fail with 401 errors
   - Solution: Implement token refresh logic
   - Prevention: Monitor token expiration and refresh proactively

2. **Scope Issues**
   - Symptom: Unable to access certain user data
   - Solution: Verify scope includes all required permissions
   - Example: `scope: 'openid offline_access email transact'`

3. **Redirect URI Mismatch**
   - Symptom: Authentication fails after login attempt
   - Solution: Ensure redirect URI matches Immutable Hub configuration
   - Verification: Check console for redirect-related errors

## Resources

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenID Connect Documentation](https://openid.net/connect/)
- [OAuth2 Best Practices](https://oauth.net/2/) 