# Passport SDK Login/Identity Example App with Next.js

## Introduction

This example app demonstrates how to retrieve and display user information after a successful login using Immutable's Passport SDK in a Next.js application. The app shows how to access different types of user data including profile information, linked addresses, and authentication tokens.

You can find the source code for this example app on [GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs).

## SDK Integration Walkthrough

The example app showcases the following Passport SDK features:

* Retrieving user profile information
* Getting linked addresses for a user
* Obtaining and verifying ID and access tokens

### Retrieving User Information with Passport

[View this feature on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport)

This feature demonstrates how to retrieve a user's profile information after they have logged in with Passport. The user profile includes details such as email, nickname, and a unique identifier (sub).

```typescript
// Connecting with Passport and getting user info
const provider = await passportInstance.connectEvm();
const accounts = await provider.request({ method: 'eth_requestAccounts' });

// Get user profile information
const userProfileData = await passportInstance.getUserInfo();
```

The code above connects to the user's wallet via Passport's EVM provider, requests the user's accounts, and then fetches their profile information. The user profile data can include email, nickname, and a unique identifier (sub).

### Retrieving Linked Addresses with Passport

[View this feature on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport)

This feature shows how to retrieve all blockchain addresses linked to a user's Passport account. This is useful for applications that need to know all wallets associated with a user.

```typescript
// Connecting with Passport
const provider = await passportInstance.connectEvm();
const accounts = await provider.request({ method: 'eth_requestAccounts' });

// Get linked addresses
const addresses = await passportInstance.getLinkedAddresses();
```

After connecting to the user's wallet, the application retrieves all the addresses linked to the user's Passport account. This allows applications to recognize the user across different wallets they may use.

### Verifying Tokens with Next.js

[View this feature on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs)

This feature demonstrates how to obtain authentication tokens (ID token and access token) which can be used to authenticate the user with backend services or verify their identity.

```typescript
// Connecting with Passport
const provider = await passportInstance.connectEvm();
const accounts = await provider.request({ method: 'eth_requestAccounts' });

// Get ID token
const idToken = await passportInstance.getIdToken();

// Get access token
const accessToken = await passportInstance.getAccessToken();
```

The ID token contains claims about the identity of the user, while the access token grants access to protected resources. These tokens can be used for authentication and authorization in your application's backend services.

## Running the App

To run this example app locally, follow these steps:

1. Clone the repository from [GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs)

2. Set up your environment:
   - Create an account on [Immutable Hub](https://hub.immutable.com/) if you don't have one
   - Create an application in Immutable Hub to get your publishable key and client ID
   - Set up your redirect URIs in the Hub dashboard

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your publishable key from Immutable Hub to the `.env` file
   - Update the client ID and redirect URIs if needed

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Summary

This example app demonstrates how to integrate Immutable's Passport SDK into a Next.js application to:

1. Retrieve user profile information after login
2. Get a list of blockchain addresses linked to the user's account
3. Obtain authentication tokens for securing backend services

By following this tutorial, you should be able to implement these features in your own application, providing a seamless blockchain authentication experience for your users. 