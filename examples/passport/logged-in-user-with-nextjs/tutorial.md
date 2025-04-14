<div class="display-none">

# User Information after Logging In with NextJS

</div>

This example app demonstrates how to retrieve and display user information after a successful login using Immutable Passport in a NextJS application. It showcases several key Passport features for accessing user data.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- Retrieving linked addresses associated with a user's Passport account
- Fetching user profile information from Passport
- Retrieving and verifying authentication tokens (ID and access tokens)

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
const accessToken = await passportInstance.getAccessToken();
```
These functions retrieve the ID token and access token for the authenticated user. The ID token contains user identity information, while the access token is used for authorization when making API requests to Immutable services. These tokens can be verified on the client side to ensure they are valid.

## Running the App

### Prerequisites
- Node.js and pnpm installed on your system
- A publishable API key from [Immutable Hub](https://hub.immutable.com)

### Steps to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/passport/logged-in-user-with-nextjs
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file based on the `.env.example` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Immutable Hub publishable key:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_here
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## Summary

This example app demonstrates how to retrieve and display user information after a successful login with Immutable Passport in a NextJS application. It covers three key aspects of user data: linked blockchain addresses, user profile information, and authentication tokens. By exploring this example, developers can understand how to implement these features in their own applications to provide user-specific functionality after authentication. 