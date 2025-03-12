# Logged-in User with NextJS Example

## Introduction
This example app demonstrates how to access user information and tokens after a user has logged in via Passport in a NextJS application. It showcases several useful Passport SDK features for retrieving user identity information, linked addresses, and tokens for verification. This example highlights how to integrate Passport authentication within a NextJS application and access various user details after successful authentication.

[View the example app on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs)

## Features Overview
- Retrieving user profile information after login
- Getting linked addresses associated with a user's account
- Retrieving ID and access tokens for verification purposes
- Implementing OAuth redirect flow in NextJS

## SDK Integration Details

### Get User Information
**Link:** [User Info Component](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx)

**Feature Name:** Retrieving User Profile Information

**Implementation:**
```typescript
const userProfileData = await passportInstance.getUserInfo();
```

**Explanation:**
After a user successfully logs in with Passport, you can use the `getUserInfo()` method to retrieve the user's profile information. This method returns an object containing details such as email, nickname, and the subject identifier (sub). This information can be used to personalize the user experience within your application. The example displays this information in a table after the user logs in.

### Get Linked Addresses
**Link:** [Linked Addresses Component](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx)

**Feature Name:** Retrieving Linked Addresses

**Implementation:**
```typescript
const addresses = await passportInstance.getLinkedAddresses();
```

**Explanation:**
The `getLinkedAddresses()` method fetches all blockchain addresses linked to the user's Passport account. This is particularly useful for applications that need to interact with multiple chains or need to know all of a user's connected wallets. The example retrieves and displays these linked addresses after the user authenticates.

### Get ID and Access Tokens
**Link:** [Verify Tokens Component](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx)

**Feature Name:** Retrieving Authentication Tokens

**Implementation:**
```typescript
const idToken = await passportInstance.getIdToken();
const accessToken = await passportInstance.getAccessToken();
```

**Explanation:**
The Passport SDK provides methods to retrieve the ID token and access token after a user has logged in. The ID token contains claims about the user's identity, while the access token is used to authenticate requests to protected resources. These tokens can be used for server-side verification or for making authenticated requests to Immutable APIs. The example shows how to retrieve and display these tokens.

### OAuth Redirect Flow
**Link:** [Redirect Component](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/redirect/page.tsx)

**Feature Name:** Handling OAuth Redirect

**Implementation:**
```typescript
useEffect(() => {
  if (passportInstance) {
    passportInstance.loginCallback()
      .then(() => {
        console.log('Login callback successful');
        if (window.opener) {
          window.opener.postMessage('authComplete', window.origin);
          window.close();
        }
      })
      .catch((error) => {
        console.error('Error in login callback:', error);
      });
  }
}, []);
```

**Explanation:**
The redirect component handles the OAuth callback after a user authenticates with Passport. It uses the `loginCallback()` method to process the authentication response and complete the login flow. This is a crucial part of the OAuth 2.0 authentication flow, where the authorization server redirects back to your application with an authorization code. The example shows how to implement this in a NextJS application, including how to handle the case when the login happens in a popup window.

## Running the App

[View the example app on GitHub](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs)

### Prerequisites
- Node.js 16 or higher
- pnpm
- An Immutable Hub account to obtain required API keys
  - [Sign up for Immutable Hub](https://hub.immutable.com/)

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/logged-in-user-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your Immutable Hub API keys to the `.env` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## Summary
This example demonstrates various methods to access user information after a successful login with Passport in a NextJS application. It showcases how to retrieve user profile information, linked addresses, and authentication tokens, providing a comprehensive implementation of post-authentication features. These features are essential for applications that need to interact with authenticated users and utilize their identity information for personalized experiences or blockchain transactions.

By following this example, developers can understand how to properly integrate Passport authentication in their NextJS applications and access user information in a secure and efficient manner. 