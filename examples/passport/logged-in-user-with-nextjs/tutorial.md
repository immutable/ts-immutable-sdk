<div class="display-none">

# User Information after Logging In with NextJS

This example app demonstrates how to retrieve and display user information after a successful login using Immutable Passport in a NextJS application. It showcases several key Passport features for accessing user data.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs)

</div>

## Features Overview

- Retrieving linked addresses associated with a user's Passport account
- Fetching user profile information from Passport
- Retrieving and verifying authentication tokens (ID and access tokens)

## SDK Integration Details

### Linked Addresses with Passport
- **Feature Name**: Get Linked Addresses
- **Source Code**: [linked-addresses-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx)
- **Implementation**:
```typescript
const addresses = await passportInstance.getLinkedAddresses();
```
- **Explanation**: After connecting to Passport and logging in, this code retrieves all blockchain addresses linked to the user's Passport account. These addresses can represent different wallets that the user has associated with their Immutable account.

### User Profile Information
- **Feature Name**: Get User Info
- **Source Code**: [user-info-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx)
- **Implementation**:
```typescript
const userProfileData = await passportInstance.getUserInfo();
```
- **Explanation**: This function retrieves the user's profile information from Passport, including their email, nickname, and unique subject identifier. The app then displays this information in a table format.

### Token Verification
- **Feature Name**: Retrieve Authentication Tokens
- **Source Code**: [verify-tokens-with-nextjs/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx)
- **Implementation**:
```typescript
const idToken = await passportInstance.getIdToken();
const accessToken = await passportInstance.getAccessToken();
```
- **Explanation**: These functions retrieve the ID token and access token for the authenticated user. The ID token contains user identity information, while the access token is used for authorization when making API requests to Immutable services. These tokens can be verified on the client side to ensure they are valid.

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