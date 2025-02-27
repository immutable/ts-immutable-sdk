# Implementing Authentication with Immutable Passport in Next.js

This tutorial walks you through implementing various authentication methods using Immutable Passport in a Next.js application. You'll learn how to implement different login approaches, handle logout scenarios, and manage authentication state.

## Prerequisites

Before starting this tutorial, ensure you have:

- Node.js installed on your system
- An Immutable Hub account
- Basic understanding of React and Next.js
- Your Immutable Hub publishable API key and client ID

## Project Setup

1. Create a new Next.js project with TypeScript:

```bash
pnpm create next-app@latest passport-login-example --typescript
cd passport-login-example
```

2. Install the required dependencies:

```bash
pnpm add @imtbl/sdk @biom3/react ethers
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
│   ├── login-with-passport/
│   │   └── page.tsx
│   ├── login-with-etherjs/
│   │   └── page.tsx
│   ├── login-with-identity-only/
│   │   └── page.tsx
│   ├── logout-with-redirect-mode/
│   │   └── page.tsx
│   ├── logout-with-silent-mode/
│   │   └── page.tsx
│   ├── utils/
│   │   └── setupDefault.ts
│   ├── layout.tsx
│   └── page.tsx
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

## Creating the Home Page

The home page (`src/app/page.tsx`) provides navigation to different authentication examples:

```typescript
'use client';
import { Button, Heading } from '@biom3/react';
import NextLink from 'next/link';

export default function Home() {
  return (<>
      <Heading 
      size="medium" 
      className="mb-1">
        Login with NextJS
      </Heading>
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/login-with-passport" />}>
        Login with Passport
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/login-with-etherjs" />}>
        Login with EtherJS
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/login-with-identity-only" />}>
        Login with Identity only
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/logout-with-redirect-mode" />}>
        Logout with Redirect Mode
      </Button> 
      <Button       
      className="mb-1"
      size="medium" 
      rc={<NextLink href="/logout-with-silent-mode" />}>
        Logout with Silent Mode
      </Button> 
  </>);
}
```

## Implementing Standard Passport Login

Create `src/app/login-with-passport/page.tsx`:

```typescript
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
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
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
```

## Implementing Identity-Only Login

Create `src/app/login-with-identity-only/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LoginWithIdentityOnly() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const loginWithIdentity = async () => {
    if (!passportInstance) return;
    try {
      const userProfile = await passportInstance.connectIdentity();
      if (userProfile) {
        setIsLoggedIn(true);
        setUserInfo(userProfile);
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
        Login with Identity Only
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithIdentity}
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
          {userInfo && (
            <>
              <Table.Row>
                <Table.Cell><b>Email</b></Table.Cell>
                <Table.Cell>{userInfo.email}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell><b>User ID</b></Table.Cell>
                <Table.Cell>{userInfo.sub}</Table.Cell>
              </Table.Row>
            </>
          )}
        </Table.Body>
      </Table>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
```

## Implementing Logout Modes

### Redirect Mode Logout

Create `src/app/logout-with-redirect-mode/page.tsx`:

```typescript
'use client';

import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LogoutWithRedirectMode() {
  const logout = async () => {
    if (!passportInstance) return;
    try {
      await passportInstance.logout({
        redirectMode: true
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Logout with Redirect Mode
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={logout}>
        Logout
      </Button>
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
```

### Silent Mode Logout

Create `src/app/logout-with-silent-mode/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button, Heading, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function LogoutWithSilentMode() {
  const [logoutStatus, setLogoutStatus] = useState<string>('');

  const logout = async () => {
    if (!passportInstance) return;
    try {
      await passportInstance.logout({
        redirectMode: false
      });
      setLogoutStatus('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      setLogoutStatus('Logout failed');
    }
  };

  return (
    <>
      <Heading size="medium" className="mb-1">
        Logout with Silent Mode
      </Heading>
      <Button
        className="mb-1"
        size="medium"
        onClick={logout}>
        Logout
      </Button>

      {logoutStatus && (
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell><b>Status</b></Table.Cell>
              <Table.Cell>{logoutStatus}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      )}
      <br />
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}
```

## Key Concepts

### 1. Passport Configuration

The Passport instance is configured with your Immutable Hub credentials and environment settings. Key configuration options include:
- Environment (SANDBOX/PRODUCTION)
- Client ID and Publishable Key
- Redirect URIs for login and logout
- Scope for authentication

### 2. Authentication Methods

The example demonstrates three authentication approaches:
- **Standard Passport Login**: Full wallet connection with EVM provider
- **Identity-Only Login**: Authentication without wallet connection
- **EtherJS Integration**: Custom integration with EtherJS

### 3. Logout Modes

Two logout modes are demonstrated:
- **Redirect Mode**: Redirects to a specified URL after logout
- **Silent Mode**: Performs logout without redirection

### 4. State Management

The application uses React's useState hook to manage:
- Login status
- User information
- Account addresses
- Logout status

## Testing the Application

1. Start the development server:

```bash
pnpm dev
```

2. Open http://localhost:3000 in your browser

3. Test different authentication methods:
   - Try standard Passport login to connect your wallet
   - Test identity-only login for basic authentication
   - Experiment with both logout modes

## Common Issues and Solutions

1. **Connection Fails**
   - Verify your Immutable Hub credentials
   - Check that you're using the correct environment
   - Ensure redirect URIs match your Hub configuration

2. **Logout Issues**
   - For redirect mode, verify the logout redirect URI
   - For silent mode, ensure proper error handling
   - Check browser console for detailed error messages

3. **State Management**
   - Verify state updates after login/logout
   - Check for proper error handling
   - Monitor console for state-related issues

## Next Steps

1. Add persistent authentication state
2. Implement protected routes
3. Add user profile management
4. Integrate with smart contracts
5. Add transaction signing capabilities

## Resources

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [Next.js Documentation](https://nextjs.org/docs)
- [EtherJS Documentation](https://docs.ethers.org/) 