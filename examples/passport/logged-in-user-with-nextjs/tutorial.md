# Logged-in User Data with Next.js

This tutorial demonstrates how to retrieve and display user information, linked addresses, and verify tokens after login with Immutable Passport in a Next.js application.

## Introduction

The Logged-in User Data with Next.js example app showcases how to work with user data after successful authentication with Immutable Passport. The app demonstrates three key post-login features:

- Retrieving and displaying user profile information
- Getting a list of linked wallet addresses
- Retrieving and verifying ID and access tokens

This example serves as a reference implementation for developers who need to access user data after authentication in their Next.js applications.

## Prerequisites

To run this example, you'll need:

- Node.js (v18 or later)
- npm, yarn, or pnpm for package management
- An Immutable Developer Hub account
- A registered application with Client ID and Publishable Key from the Immutable Developer Hub
- Basic familiarity with Next.js and React

## Project Structure

```
logged-in-user-with-nextjs/
├── src/
│   ├── app/
│   │   ├── user-info-with-passport/     # User profile info implementation
│   │   ├── linked-addresses-with-passport/ # Linked addresses implementation
│   │   ├── verify-tokens-with-nextjs/   # Token verification implementation
│   │   ├── redirect/                    # Redirect handler for authentication flow
│   │   ├── utils/                       # Setup utilities and configurations
│   │   │   └── setupDefault.ts          # Default Passport configuration
│   │   ├── page.tsx                     # Main navigation page
│   │   └── layout.tsx                   # App layout with providers
├── .env.example                         # Example environment variables
├── package.json                         # Project dependencies
└── tsconfig.json                        # TypeScript configuration
```

## Code Walkthrough

### SDK Integration Walkthrough

#### Initializing the Passport SDK

The Immutable Passport SDK is initialized in the `src/app/utils/setupDefault.ts` file:

```typescript
import { config, passport } from '@imtbl/sdk';

export const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX, // or config.Environment.PRODUCTION
      publishableKey:
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || '<YOUR_PUBLISHABLE_KEY>',
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '<YOUR_CLIENT_ID>',
    redirectUri: 'http://localhost:3000/redirect',
    logoutRedirectUri: 'http://localhost:3000/logout',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
});
```

This configuration initializes the Passport instance with the necessary parameters for authentication and user data access.

#### Retrieving User Profile Information

The user profile information retrieval is implemented in `src/app/user-info-with-passport/page.tsx`. After successful login, you can retrieve the user's profile information:

```typescript
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    // Retrieve user profile information
    const userProfileData = await passportInstance.getUserInfo();
    
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
      setUserProfile(userProfileData || null);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

The `getUserInfo()` method returns an object containing user information such as email, nickname, and subject identifier (sub). This information is displayed in a table format to show the user's profile details.

#### Getting Linked Addresses

The linked addresses retrieval is demonstrated in `src/app/linked-addresses-with-passport/page.tsx`. After authentication, you can get a list of wallet addresses linked to the user's Immutable Passport account:

```typescript
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
      
      // Retrieve linked addresses
      const addresses = await passportInstance.getLinkedAddresses();
      
      setLinkedAddresses(addresses || []);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

The `getLinkedAddresses()` method returns an array of addresses associated with the user's account. This is useful for applications that need to verify wallet ownership or provide wallet-specific functionality.

#### Retrieving and Verifying Tokens

The token verification feature is implemented in `src/app/verify-tokens-with-nextjs/page.tsx`. This component demonstrates how to retrieve the ID token and access token:

```typescript
const loginWithPassport = async () => {
  if (!passportInstance) return;
  try {
    const provider = await passportInstance.connectEvm();
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    // Retrieve ID token
    const idToken = await passportInstance.getIdToken();
    
    // Retrieve access token
    const accessToken = await passportInstance.getAccessToken();
    
    if (accounts) {
      setIsLoggedIn(true);
      setAccountAddress(accounts[0] || null);
      setIdToken(idToken || null);
      setAccessToken(accessToken || null);
    }
  } catch (error) {
    console.error('Error connecting to Passport:', error);
    setIsLoggedIn(false);
  }
};
```

These tokens are important for:
- **ID Token**: Contains user identity information and can be verified for authentication purposes
- **Access Token**: Used for making authorized API requests to Immutable services

The tokens can be displayed for debugging purposes or used in API calls requiring authentication.

### Navigation Structure

The main page (`src/app/page.tsx`) provides navigation buttons to the three different examples:

```typescript
export default function Home() {
  return (<>
      <Heading size="medium" className="mb-1">
        User Information after Logging In with NextJS
      </Heading>
      <Button className="mb-1" size="medium" 
        rc={<NextLink href="/linked-addresses-with-passport" />}>
        Linked Addresses with Passport
      </Button> 
      <Button className="mb-1" size="medium" 
        rc={<NextLink href="/user-info-with-passport" />}>
        User Info with Passport
      </Button> 
      <Button className="mb-1" size="medium" 
        rc={<NextLink href="/verify-tokens-with-nextjs" />}>
        Verify Tokens with NextJS
      </Button> 
  </>);
}
```

This structure allows users to navigate between different user data retrieval examples easily.

### Environment Configuration

The application uses environment variables for configuration. Required variables are defined in `.env.example`:

```
NEXT_PUBLIC_CLIENT_ID="your-client-id"
NEXT_PUBLIC_PUBLISHABLE_KEY="your-publishable-key"
```

To run the application, you need to:
1. Copy `.env.example` to `.env.local`
2. Replace placeholder values with your actual Client ID and Publishable Key from the Immutable Developer Hub

## Running the App

Follow these steps to run the example locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Create a `.env.local` file with your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID="your-client-id"
   NEXT_PUBLIC_PUBLISHABLE_KEY="your-publishable-key"
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser
6. Try the different examples using the navigation buttons

## Summary

This example demonstrates how to work with user data after authentication with Immutable Passport in a Next.js application:

- **User Profile Information**: Retrieve and display user details such as email and nickname
- **Linked Addresses**: Get a list of wallet addresses associated with the user's account
- **Token Verification**: Retrieve and display ID and access tokens for authentication and API calls

The example provides a foundation for implementing user-related features in your Immutable-powered applications. By understanding these patterns, you can enhance your application with user-specific functionality while ensuring proper authentication and authorization. 