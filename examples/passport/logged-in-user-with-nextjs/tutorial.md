# User Information After Logging In with Passport and Next.js

## Introduction
This example app demonstrates how to access user information after a user has logged in using Immutable's Passport service in a Next.js application. It showcases how to retrieve various user details like profile information, linked addresses, and authentication tokens after authentication.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs)

## Features Overview
- Retrieving user profile information after authentication
- Obtaining linked blockchain addresses for a logged-in user
- Fetching and using authentication tokens (ID token and access token)

## SDK Integration Details

### **Retrieve User Profile Information**
[Retrieve a user's profile data from Passport](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx)

Implementation:
```typescript
const userProfileData = await passportInstance.getUserInfo();
```

Explanation: After a successful login, this feature retrieves the user's profile information including email, nickname, and subject identifier using the `getUserInfo()` method from the Passport SDK. This data can be used to display personalized content to the user or for user identification purposes.

### **Get Linked Blockchain Addresses**
[Fetch a user's linked blockchain addresses](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx)

Implementation:
```typescript
const addresses = await passportInstance.getLinkedAddresses();
```

Explanation: This feature retrieves all blockchain addresses linked to the user's Passport account using the `getLinkedAddresses()` method. This is particularly useful when building applications that need to interact with multiple blockchain networks or when users have multiple addresses on the same network.

### **Access Authentication Tokens**
[Retrieve authentication tokens for backend verification](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx)

Implementation:
```typescript
// Get ID token
const idToken = await passportInstance.getIdToken();

// Get access token
const accessToken = await passportInstance.getAccessToken();
```

Explanation: This feature demonstrates how to obtain both ID and access tokens from Passport. The ID token contains claims about the user's identity, while the access token grants permissions to access protected resources. These tokens can be used for authenticating API requests and verifying user identity on the backend.

## Running the App

### Prerequisites
- Node.js 18 or newer
- pnpm
- Immutable Hub account for API keys ([Set up in Immutable Hub](https://hub.immutable.com))

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

3. Create a `.env` file by copying the example:
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
NEXT_PUBLIC_CLIENT_ID=<YOUR_CLIENT_ID>
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Summary
This example demonstrates key features of the Passport SDK for retrieving user information after authentication in a Next.js application. By implementing these features, developers can create personalized experiences for their users, interact with blockchain addresses, and secure their applications with proper authentication token handling.

The example showcases a clean integration pattern that separates concerns and maintains a clear user interface, making it easy to understand and implement in your own applications. 