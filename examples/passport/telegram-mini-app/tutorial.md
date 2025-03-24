<div class="display-none">

# Telegram Mini App with Immutable Passport

This tutorial demonstrates how to integrate Immutable Passport into a Telegram Mini App, enabling authentication and NFT transfers within the Telegram ecosystem.

</div>

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Device Flow Authentication**: Implements a secure login method designed for Telegram Mini Apps, ensuring support across all devices
- **NFT Transfers**: Demonstrates how to transfer NFT assets to other wallet addresses from within a Telegram Mini App

## SDK Integration Details

### Device Flow Authentication

**Feature Name**: Device Flow Authentication is a login flow designed for devices where the user might have limited input capabilities or when redirects aren't possible. In this context, it's used because Telegram Mini Apps have special requirements for opening external links.

**Source Code**: [Connect.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/telegram-mini-app/app/components/Connect.tsx)

**Implementation**:
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

**Explanation**: The application uses the device flow authentication method, which is ideal for Telegram Mini Apps. When a user clicks the "Sign in with Passport" button, the app first calls `loginWithDeviceFlow()` to get authentication parameters. It then opens the authentication URL using Telegram's `WebApp.openLink()` function, which handles external links in a Telegram-friendly way. After the user completes authentication in this external window, the app calls `loginWithDeviceFlowCallback()` to wait for and confirm the successful authentication. Finally, it connects to the EVM network and retrieves the user's wallet address for further interactions.

### NFT Transfers

**Feature Name**: NFT Transfer allows users to transfer NFT assets to other wallet addresses directly from within the Telegram Mini App.

**Source Code**: [TransferAsset.tsx](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/telegram-mini-app/app/components/TransferAsset.tsx)

**Implementation**:
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

**Explanation**: After a user has authenticated, they can transfer NFT assets to other addresses. The app presents a form where users can input the collection address, token ID, and recipient address. When the user submits this information, the app creates a contract instance using ethers.js with a minimal ABI that includes only the `safeTransferFrom` function. It then gets the signer from the provider (which was initialized during authentication) and calls the transfer function. The app displays success or error messages based on the transaction result.

## Running the App

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) package manager
- An Immutable Hub account for creating application credentials [Immutable Hub Dashboard](https://hub.immutable.com/)

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/telegram-mini-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the following values:
     ```
     # The Client ID of your application in Hub
     NEXT_PUBLIC_CLIENT_ID=your-client-id
     # The redirect URI configured in your application in Hub
     NEXT_PUBLIC_REDIRECT_URI=your-redirect-uri
     # The logout redirect URI configured in your application in Hub
     NEXT_PUBLIC_LOGOUT_REDIRECT_URI=your-logout-redirect-uri
     ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. To test as a Telegram Mini App:
   - Use Telegram's [Bot Father](https://t.me/BotFather) to create a bot
   - Configure your Mini App and point it to your local development URL or a hosted version
   - Test your Mini App through the bot in Telegram

## Summary

This example demonstrates how to integrate Immutable Passport's authentication and NFT transfer capabilities within a Telegram Mini App environment. It showcases the use of device flow authentication, which is specially designed for contexts like Telegram where traditional redirect flows might not be optimal. The app provides a simple interface for users to connect their wallets and transfer NFT assets to other addresses, all within the Telegram ecosystem.

The integration pattern shown here can be adapted for other mini-app environments or contexts where standard redirect-based authentication might not be feasible. 