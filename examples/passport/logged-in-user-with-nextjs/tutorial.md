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

### Linked Addresses with Passport

Retrieves all blockchain addresses associated with the logged-in user's Passport account.

```typescript title="Get Linked Addresses" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx"
const addresses = await passportInstance.getLinkedAddresses();
```
After connecting to Passport and logging in, this code retrieves all blockchain addresses linked to the user's Passport account. These addresses can represent different wallets that the user has associated with their Immutable account.

### User Profile Information

Fetches the user's profile details like email, nickname, and unique identifier.

```typescript title="Get User Info" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx"
const userProfileData = await passportInstance.getUserInfo();
```
This function retrieves the user's profile information from Passport, including their email, nickname, and unique subject identifier. The app then displays this information in a table format.

### Token Verification

Retrieves and explains the purpose of ID and access tokens for the authenticated user.

```typescript title="Get Tokens" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx"
const idToken = await passportInstance.getIdToken();

// Get Access Token
const accessToken = await passportInstance.getAccessToken();
```
These functions retrieve the ID token and access token for the authenticated user. The ID token contains user identity information, while the access token is used for authorization when making API requests to Immutable services. These tokens can be verified on the client side to ensure they are valid.

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