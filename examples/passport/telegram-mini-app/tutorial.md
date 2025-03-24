# Telegram Mini App with Passport SDK

## Introduction
This example demonstrates how to integrate Immutable Passport into a Telegram Mini App using the device flow authentication method. It showcases a simple NFT transfer application that allows users to authenticate with Passport and transfer NFTs between addresses, all within a Telegram Mini App context.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app)

## Features Overview
- Device Flow Authentication with Passport in a Telegram Mini App
- NFT Transfers with Passport wallet

## SDK Integration Details

### Device Flow Authentication
**Feature Name**: Device flow authentication allows users to authenticate with Passport in environments where redirects are not supported, such as Telegram Mini Apps.

**Source Code**: [Connect.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app/app/components/Connect.tsx)

**Implementation**:
```tsx
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

**Explanation**: 
This implementation uses the device flow authentication method from Passport SDK for authentication within a Telegram Mini App. When a user clicks the "Sign in with Passport" button, the `loginWithDeviceFlow` method is called, which returns parameters including a URL that the user needs to visit. The Telegram SDK's `openLink` function is used to open this URL, where the user completes their authentication. The application then polls for completion using `loginWithDeviceFlowCallback` with the device code and interval. Once authenticated, the app connects to the EVM provider and retrieves the user's wallet address.

### NFT Transfers
**Feature Name**: NFT transfers allow users to transfer their NFTs to other addresses directly from within a Telegram Mini App.

**Source Code**: [TransferAsset.tsx](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/telegram-mini-app/app/components/TransferAsset.tsx)

**Implementation**:
```tsx
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

**Explanation**:
This implementation handles NFT transfers using the Ethereum contract interaction pattern. After authenticating with Passport, users can input a collection address, token ID, and recipient address to transfer an NFT. The application uses ethers.js to create a contract instance with the `safeTransferFrom` method, which is the standard ERC-721 method for NFT transfers. The signer, obtained from the provider initialized during authentication, signs the transaction. Upon successful transfer, the UI updates to show a success message.

## Running the App

### Prerequisites
- Node.js (v18 or higher)
- pnpm installed
- [Immutable Hub](https://hub.immutable.com/) account for environment setup

### Environment Setup
1. Create an application in [Immutable Hub](https://hub.immutable.com/)
2. Configure the application with appropriate redirect URIs
3. Copy the `.env.example` file to `.env.local` and fill in the following variables:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_REDIRECT_URI=your_redirect_uri
   NEXT_PUBLIC_LOGOUT_REDIRECT_URI=your_logout_redirect_uri
   ```

### Steps to Run Locally
1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/passport/telegram-mini-app
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```
5. The application will be available at `http://localhost:3000`

## Summary
This example demonstrates how to integrate Immutable Passport into a Telegram Mini App environment using the device flow authentication method. It showcases how to authenticate users and enable NFT transfers within the Telegram platform, providing a streamlined Web3 experience without requiring users to leave the Telegram app. The device flow authentication is particularly important for Telegram Mini Apps as it supports environments where traditional redirect-based authentication methods are not feasible. 