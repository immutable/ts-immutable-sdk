<div class="display-none">

# User Information after Logging In with NextJS

</div>

This example demonstrates how to access user information after a successful login with Immutable Passport in a Next.js application. It shows how to retrieve user profile data, linked addresses, auth tokens, and link external wallets after authentication.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Retrieving linked addresses from a Passport user
- Accessing user profile information after login
- Getting and verifying ID and access tokens
- Linking external wallets to a Passport account

## SDK Integration Details

### Retrieving Linked Addresses
**Feature Name**: Get Linked Addresses - Retrieves all blockchain addresses linked to the user's Passport account.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx)

**Implementation**:
```typescript
const addresses = await passportInstance.getLinkedAddresses();
```

**Explanation**: After a user logs in with Passport, this code retrieves all blockchain addresses associated with their account. These addresses can be used to identify the user across different blockchain networks supported by Immutable.

### Accessing User Profile Information
**Feature Name**: Get User Info - Retrieves the user's profile information from Passport.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx)

**Implementation**:
```typescript
const userProfileData = await passportInstance.getUserInfo();
```

**Explanation**: This code fetches the user's profile information from Passport after successful authentication. The profile data includes details such as email, nickname, and a unique subject identifier, which can be used to identify the user in your application.

### Getting Authentication Tokens
**Feature Name**: Get ID and Access Tokens - Retrieves authentication tokens from Passport.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx)

**Implementation**:
```typescript
// Get ID Token
const idToken = await passportInstance.getIdToken();

// Get Access Token
const accessToken = await passportInstance.getAccessToken();
```

**Explanation**: These tokens are essential for authenticating requests to Immutable services. The ID token contains verified user information, while the access token provides authorization to access protected resources and APIs.

### Linking External Wallets
**Feature Name**: Link External Wallet - Connects and links an external wallet (like MetaMask) to a Passport account.

**Source Code**: [source code file](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/link-external-wallet/page.tsx)

**Implementation**:
```typescript
// Link an external wallet to the Passport account
const result = await passportInstance.linkExternalWallet({
  type: "External",
  walletAddress: metamaskAddress,
  signature,
  nonce
});
```

**Explanation**: This feature allows users to link their existing external wallets (like MetaMask) to their Passport account. The process involves generating a typed data signature with the external wallet to prove ownership, then sending this signature along with the wallet address to the Passport service for linking.

## Running the App

### Prerequisites
- Node.js 18 or later
- [pnpm](https://pnpm.io/) installed
- An Immutable Hub account to create a Passport application
- Environment variables set up in `.env` file (see `.env.example`)

For environment setup with Immutable Hub, visit the [Immutable Developer Hub](https://hub.immutable.com/).

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the example directory based on `.env.example`:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Summary

This example demonstrates how to integrate Immutable Passport with a Next.js application and access user data after authentication. It shows how to retrieve linked addresses, user profile information, authentication tokens, and link external wallets to a Passport account. These features provide a comprehensive way to manage user identity and authentication in blockchain applications built with Immutable. 