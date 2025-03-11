# Provider Announcement Example for Immutable Passport SDK

This example demonstrates the EIP-6963 provider announcement feature for Immutable Passport SDK. It showcases wallet discovery integration and provider configuration options.

## What is EIP-6963?

[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) is an Ethereum standard for wallet discovery and interoperability. It allows dapps to discover all available Ethereum provider interfaces in a browser environment and enables multiple wallets to co-exist. 

This example demonstrates how Immutable Passport implements the EIP-6963 standard, allowing it to:

1. Announce itself as a provider via the Web3 Provider API
2. Be discovered by dapps that support the EIP-6963 standard 
3. Coexist with other wallets in the same browser environment

## Features

- **Provider Announcement**: Immutable Passport announces itself as a wallet provider
- **Wallet Discovery**: Detects and displays other announced wallet providers
- **Provider Configuration**: Demonstrates different provider announcement options
- **Authentication Flow**: Shows login and logout functionality with the announced provider

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Immutable Hub developer account with a configured application

### Setup

1. Clone the repository
2. Navigate to the example directory:
```bash
cd examples/passport/login-with-passport-provider-announce
```

3. Install dependencies:
```bash
pnpm install
```

4. Create a `.env.local` file from `.env.example` and fill in your configuration:
```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

5. Start the development server:
```bash
pnpm dev
```

6. Open your browser to http://localhost:3000

## Usage

1. On the main page, click "Provider Announcement Demo"
2. Use the "Announce Provider Only" button to announce Passport as a provider without logging in
3. Check the "Wallet Discovery" section to see announced providers (including Passport and any other wallets that support EIP-6963)
4. Use the "Login with Provider" button to authenticate using Passport
5. Use the "Logout" button to log out

## How It Works

### Provider Announcement

The example demonstrates using the `connectEvm` method with the `announceProvider` option:

```typescript
// Announce provider only without login
await passportInstance.connectEvm({
  announceProvider: true
});
```

By default, the `announceProvider` parameter is set to `true`, so Passport will announce itself as a provider when you connect to EVM. You can disable this behavior by setting it to `false`.

### Wallet Discovery

The example also shows how to listen for provider announcements from other wallets:

```typescript
// Listen for EIP-6963 provider announcements
window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement);
window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));
```

When a wallet that implements EIP-6963 is available, it will respond to the `eip6963:requestProvider` event by dispatching an `eip6963:announceProvider` event with its provider information.

## Additional Resources

- [EIP-6963 Specification](https://eips.ethereum.org/EIPS/eip-6963)
- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport) 