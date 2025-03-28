# Login with Passport Provider Announce Example

This example demonstrates how to use the Passport Provider Announce feature with Next.js. The Provider Announce feature allows your application to be notified about wallet provider events and changes, following the EIP-6963 standard for wallet discovery.

## Setup

1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/passport/login-with-passport-provider-announce-with-nextjs
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Copy `.env.example` to `.env` and add your Passport credentials:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` to add your Publishable Key and Client ID.

## Environment Variables

- `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your Immutable Passport publishable API key from Hub
- `NEXT_PUBLIC_CLIENT_ID`: Your Immutable Passport client ID from Hub

## Running the Example

```bash
pnpm dev
```

The example will be available at `http://localhost:3000`.

## Running Tests

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Provider Announce Feature

The Provider Announce feature integrates with the EIP-6963 standard, which enables web applications to discover compatible wallet providers. When using Passport's `connectEvm()` method, you can specify whether to announce the provider:

```typescript
// Connect to EVM with provider announce enabled (default is true)
const provider = await passportInstance.connectEvm({
  announceProvider: true
});
```

The provider announce feature enables:

1. **Wallet Discovery** - Makes the wallet provider discoverable by other applications and browser extensions
2. **Event Notifications** - Listen for and respond to wallet events:
   - `accountsChanged` - Triggered when the user switches accounts
   - `chainChanged` - Triggered when the user changes the network
   - `disconnect` - Triggered when the wallet is disconnected

### Listening for Provider Events

Once connected, you can set up event listeners:

```typescript
// Listen for account changes
provider.on('accountsChanged', (accounts) => {
  console.log('Account changed:', accounts[0]);
});

// Listen for chain changes
provider.on('chainChanged', (chainId) => {
  console.log('Chain changed:', chainId);
});

// Listen for disconnect events
provider.on('disconnect', () => {
  console.log('Provider disconnected');
});
```

## Cleanup Best Practices

When using the Provider Announce feature, ensure you remove event listeners when your component unmounts to prevent memory leaks:

```typescript
useEffect(() => {
  let provider;
  
  const connect = async () => {
    provider = await passportInstance.connectEvm();
    
    // Set up listeners
    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);
  };
  
  connect();
  
  return () => {
    // Cleanup listeners
    if (provider) {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
      provider.removeListener('disconnect', handleDisconnect);
    }
  };
}, []);
```

## EIP-6963 Specification

The Ethereum Improvement Proposal 6963 (EIP-6963) defines a standard for wallets to announce themselves to applications and for applications to discover the wallets. This improves the user experience by allowing multiple wallets to coexist without conflicts and enables a more seamless integration between dApps and wallets.

## References

- [Official Immutable Documentation](https://docs.immutable.com)
- [Passport SDK Documentation](https://docs.immutable.com/docs/x/passport)
- [EIP-6963 Specification](https://eips.ethereum.org/EIPS/eip-6963)