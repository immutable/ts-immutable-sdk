# Passport Telegram Mini App Tutorial

## Introduction

This example app demonstrates how to integrate the Immutable Passport SDK within a Telegram Mini App environment. It showcases the authentication flow using Passport's device flow mechanism and basic transaction capabilities for transferring NFT assets, all within Telegram's Mini App context.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app)

## Features Overview

- **Device Flow Authentication** - Demonstrates how to authenticate users using Passport's device flow method, which is optimized for Telegram Mini Apps
- **Wallet Integration** - Shows how to connect to a user's wallet and retrieve their wallet address
- **NFT Transfers** - Demonstrates how to perform NFT transfers using the connected wallet

## SDK Integration Details

### Device Flow Authentication

**[Device Flow Authentication](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app/app/components/Connect.tsx)**

The example implements a specialized authentication flow for Telegram Mini Apps using the device flow method:

```typescript
// Use loginWithDeviceFlow as the login method for Telegram Mini App to ensure support for all devices
const deviceFlowParams = await passportInstance.loginWithDeviceFlow();
// Open the device flow url using the openLink function on the telegram sdk
if (typeof window !== 'undefined') {
  WebApp.openLink(deviceFlowParams.url);
}
// Wait for the user to complete the login before calling eth_requestAccounts
await passportInstance.loginWithDeviceFlowCallback(
  deviceFlowParams.deviceCode,
  deviceFlowParams.interval,
);
// Get the provider and call eth_requestAccounts to get the user's wallet address
const provider = await passportInstance.connectEvm();
const [userAddress] = await provider.request({
  method: "eth_requestAccounts",
});
setWalletAddress(userAddress);
```

**Explanation**: The code initiates a device flow authentication process using Passport's `loginWithDeviceFlow` method. It then utilizes Telegram's WebApp SDK to open the authentication URL. After the user completes the authentication in the external browser, the app uses the `loginWithDeviceFlowCallback` to wait for the authentication to complete, then connects to the EVM and retrieves the user's wallet address.

### NFT Transfers

**[NFT Transfer Implementation](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app/app/components/TransferAsset.tsx)**

The example shows how to transfer NFTs using the connected wallet:

```typescript
// Setup the contract ABI with the safeTransferFrom function for transferring assets
const abi = [
  "function safeTransferFrom(address from, address to, uint256 token_id)",
];

// Get the signer from the provider that was initialised in the Connect flow and create a contract instance
const signer = await zkEvmProvider.getSigner();
const contract = new ethers.Contract(collectionAddress, abi, signer);
try {
  // Call the transfer function on the contract
  await contract.safeTransferFrom(walletAddress, toAddress, tokenId);
  setTransferSuccess(true);
} catch (error: any) {
  setErrorMessage(error.message);
}
```

**Explanation**: This code demonstrates how to perform an NFT transfer by using ethers.js to interact with the NFT contract. It creates a contract instance with the minimal ABI needed for the `safeTransferFrom` function, then calls this function with the user's wallet address, recipient address, and token ID to transfer the NFT.

### Passport Configuration

**[Passport SDK Configuration](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app/app/utils.ts)**

The example configures Passport for use in a Telegram Mini App:

```typescript
export const passportInstance = new passport.Passport({
  baseConfig: new ImmutableConfiguration({ environment: Environment.SANDBOX }),
  // The client ID of the application created in Hub
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "<CLIENT_ID>",
  // The redirect URI set in the application created in Hub
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "<REDIRECT_URI>",
  // The logout redirect URI set in the application created in Hub
  logoutRedirectUri: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI || "<LOGOUT_REDIRECT_URI>",
  audience: "platform_api",
  scope: "openid offline_access email transact",
  // Set crossSdkBridgeEnabled to enable pre-approved transactions
  crossSdkBridgeEnabled: true,
});
```

**Explanation**: This configuration sets up the Passport instance with the necessary parameters for operating within a Telegram Mini App environment. It includes client credentials, redirect URIs, and enables the cross-SDK bridge for pre-approved transactions.

## Running the App

### Prerequisites

- Node.js and pnpm installed on your machine
- An Immutable Hub account and application set up (for client credentials)
- Basic understanding of Next.js and React
- [Immutable Hub](https://hub.immutable.com/) account for environment setup

### Steps to Run the App Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/telegram-mini-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the environment file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
4. Update the .env file with your Immutable Hub application credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_REDIRECT_URI=your_redirect_uri
   NEXT_PUBLIC_LOGOUT_REDIRECT_URI=your_logout_redirect_uri
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. The app will be available at http://localhost:3000

## Summary

This example demonstrates how to integrate Immutable Passport into a Telegram Mini App, enabling users to authenticate using the device flow method and perform NFT transfers. The integration showcases how blockchain functionality can be brought to Telegram's Mini App platform, combining the reach of Telegram with the power of Immutable's blockchain infrastructure.

Key takeaways for developers:
- Use the device flow authentication method for the best compatibility with Telegram Mini Apps
- Leverage Telegram's WebApp SDK to handle authentication redirects
- Configure Passport with appropriate credentials and scopes for your application
- Implement NFT transfers using ethers.js and the connected wallet provider 