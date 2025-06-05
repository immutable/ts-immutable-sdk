<div class="display-none">

# Logged-in User with NextJS

</div>

This example app demonstrates how to access user information and manage linked addresses after a user has logged in with Immutable Passport in a NextJS application. It showcases several key Passport SDK features including retrieving user information, accessing linked addresses, verifying tokens, and linking external wallets.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Linked Addresses with Passport**: Retrieve and display all addresses linked to a user's Passport account
- **User Info with Passport**: Access and display user profile information including email and nickname
- **Verify Tokens with NextJS**: Obtain and display ID and access tokens for authentication
- **Link External Wallet**: Connect and link an external wallet (like MetaMask) to a Passport account

## SDK Integration Details

### Linked Addresses with Passport

The Passport SDK provides a method to retrieve all addresses linked to a user's Passport account. This is useful for applications that need to know all the wallets associated with a user.

```typescript title="Linked Addresses with Passport" manualLink="https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/linked-addresses-with-passport/page.tsx"
// After connecting to Passport
const addresses = await passportInstance.getLinkedAddresses();
setLinkedAddresses(addresses || []);
```

This code retrieves all addresses linked to the user's Passport account and stores them in state. The `getLinkedAddresses()` method returns an array of addresses that can be used to identify the user across different wallets.

### User Info with Passport

The Passport SDK allows you to retrieve user profile information after authentication. This includes details like email, nickname, and a unique identifier.

```typescript title="User Info with Passport" manualLink="https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/user-info-with-passport/page.tsx"
// After connecting to Passport
const userProfileData = await passportInstance.getUserInfo();
setUserProfile(userProfileData || null);
```

The `getUserInfo()` method returns an object containing user profile information. This data can be used to personalize the user experience or for user identification purposes.

### Verify Tokens with NextJS

The Passport SDK provides methods to obtain ID and access tokens that can be used for authentication and authorization in your application.

```typescript title="Verify Tokens with NextJS" manualLink="https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/verify-tokens-with-nextjs/page.tsx"
// After connecting to Passport
const idToken = await passportInstance.getIdToken();
const accessToken = await passportInstance.getAccessToken();
setIdToken(idToken || null);
setAccessToken(accessToken || null);
```

These tokens can be used to authenticate API requests or to verify the user's identity. The ID token contains user information, while the access token is used to access protected resources.

### Link External Wallet

The Passport SDK allows users to link external wallets (like MetaMask) to their Passport account. This enables users to use multiple wallets with a single Passport account.

```typescript title="Link External Wallet" manualLink="https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/logged-in-user-with-nextjs/src/app/link-external-wallet/page.tsx"
// Generate a nonce for the signature
const nonce = generateNonce();
// Ensure addresses are in the correct format - lowercase 0x-prefixed
const metamaskAddress = externalWalletAddress.toLowerCase() as `0x${string}`;
const passportAddress = accountAddress.toLowerCase() as `0x${string}`;

// Create the data to be signed
const dataToSign = {
  types: {
    EIP712Domain: [
      {
        name: "chainId",
        type: "uint256"
      }
    ],
    LinkWallet: [
      {
        name: "walletAddress",
        type: "address"
      },
      {
        name: "immutablePassportAddress",
        type: "address"
      },
      {
        name: "condition",
        type: "string"
      },
      {
        name: "nonce",
        type: "string"
      }
    ]
  },
  primaryType: "LinkWallet",
  domain: {
    chainId: 1, // Must be set to 1 for Ethereum Mainnet
  },
  message: {
    walletAddress: metamaskAddress,
    immutablePassportAddress: passportAddress,
    condition: "I agree to link this wallet to my Immutable Passport account.",
    nonce
  }
}

// Request signature from MetaMask
signature = await window.ethereum.request({
  method: 'eth_signTypedData_v4',
  params: [metamaskAddress, JSON.stringify(dataToSign)]
});

// Link the wallet using the Passport SDK
const result = await passportInstance.linkExternalWallet({
  type: "External",
  walletAddress: metamaskAddress,
  signature,
  nonce
});
```

This process involves:
1. Generating a nonce for security
2. Creating a structured message to be signed
3. Requesting a signature from the external wallet (MetaMask)
4. Using the Passport SDK to link the wallet with the signature

## Running the App

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- An Immutable Hub account for environment setup
- MetaMask browser extension (for the link external wallet feature)

### Setup and Run

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the example directory
   - Add your Immutable Hub credentials:
     ```
     NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
     NEXT_PUBLIC_CLIENT_ID=your_client_id
     ```

4. Run the development server:
   ```bash
   cd examples/passport/logged-in-user-with-nextjs
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Summary

This example app demonstrates how to use the Passport SDK to access user information and manage linked addresses in a NextJS application. It showcases several key features including retrieving user information, accessing linked addresses, verifying tokens, and linking external wallets. These features can be integrated into your own applications to provide a seamless authentication and user management experience. 