# User Information after Logging In with NextJS

## Introduction
This example app demonstrates how to retrieve and display user information after a user has successfully logged in using Immutable Passport with a NextJS application. The app showcases how to access user profile data, linked addresses, and authentication tokens through Passport's client-side APIs.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs)

## Features Overview
- Retrieving user profile information via Passport's `getUserInfo` method
- Fetching linked wallet addresses with the `getLinkedAddresses` method
- Accessing authentication tokens (ID token and access token) for verification

## SDK Integration Details

### User Profile Information
**Feature Name**: Get User Info  
**Source Code**: [user-info-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx)  
**Implementation**:
```typescript
const userProfileData = await passportInstance.getUserInfo();
```
**Explanation**: After a user logs in, the application calls the `getUserInfo` method from the Passport instance to retrieve the user's profile information. This includes details such as email, nickname, and a unique subject identifier (sub). The returned data is displayed in a table for the user to view.

### Linked Wallet Addresses
**Feature Name**: Get Linked Addresses  
**Source Code**: [linked-addresses-with-passport/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx)  
**Implementation**:
```typescript
const addresses = await passportInstance.getLinkedAddresses();
```
**Explanation**: This feature demonstrates how to retrieve all wallet addresses linked to a user's Passport account. After successful authentication, the application calls the `getLinkedAddresses` method, which returns an array of Ethereum addresses associated with the user's account. These addresses are displayed in the UI.

### Authentication Token Access
**Feature Name**: Get Authentication Tokens  
**Source Code**: [verify-tokens-with-nextjs/page.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx)  
**Implementation**:
```typescript
const idToken = await passportInstance.getIdToken();
const accessToken = await passportInstance.getAccessToken();
```
**Explanation**: This feature shows how to access the user's authentication tokens after login. The `getIdToken` method retrieves the ID token, which contains claims about the identity of the authenticated user. The `getAccessToken` method fetches the access token, which can be used to access protected resources or APIs. Both tokens are displayed in the UI for demonstration purposes.

## Running the App

### Prerequisites
- Node.js 18 or newer
- pnpm package manager
- An Immutable Hub account for environment setup ([Set up Immutable Hub](https://hub.immutable.com/))
- A Client ID and Publishable Key from Immutable Hub

### Steps to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/logged-in-user-with-nextjs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file and add your values:
     ```
     NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_from_hub
     NEXT_PUBLIC_CLIENT_ID=your_client_id_from_hub
     ```

4. **Register your redirect URI in Immutable Hub**
   - Log in to Immutable Hub
   - Navigate to your application settings
   - Add `http://localhost:3000/redirect` as an authorized redirect URI

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Access the app**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Summary
This example demonstrates how to implement various user information retrieval features using the Immutable Passport SDK in a NextJS application. By following this tutorial, you've learned how to:

- Set up Passport authentication in a NextJS application
- Retrieve user profile information after successful login
- Access linked wallet addresses associated with a user's account
- Obtain and use authentication tokens

These features are essential for building applications that require user authentication and personalized experiences based on user identity within the Immutable ecosystem. 