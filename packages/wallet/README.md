# @imtbl/wallet

The Immutable Wallet SDK provides an EIP-1193 compliant Ethereum provider for interacting with Immutable's zkEVM and other supported blockchains. It handles authentication, transaction signing, wallet management, and external wallet linking out of the box.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Using External Auth Packages](#using-external-auth-packages)
- [API Reference](#api-reference)
- [Chain Configuration](#chain-configuration)
- [Wallet Linking](#wallet-linking)
- [EIP-6963 Provider Discovery](#eip-6963-provider-discovery)
- [Events](#events)
- [Error Handling](#error-handling)
- [TypeScript](#typescript)
- [Related Packages](#related-packages)

## Installation

```bash
npm install @imtbl/wallet
# or
yarn add @imtbl/wallet
# or
pnpm add @imtbl/wallet
```

## Quick Start

Connect to Immutable zkEVM with just a few lines of code:

```typescript
import { connectWallet } from '@imtbl/wallet';

// Create a wallet provider
const provider = await connectWallet();

// Request accounts (triggers login if user is not authenticated)
const accounts = await provider.request({ method: 'eth_requestAccounts' });
console.log('Connected:', accounts[0]);

// Send a transaction
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    to: '0x...',
    value: '0x...',
  }],
});
```

That's it! The wallet handles authentication, user registration, and transaction signing automatically.

## Configuration Options

### Custom Client ID

```typescript
const provider = await connectWallet({
  clientId: 'your-client-id',
});
```

### Chain Selection

```typescript
import { 
  connectWallet, 
  IMMUTABLE_ZKEVM_MAINNET_CHAIN,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN,
} from '@imtbl/wallet';

// Connect to mainnet
const provider = await connectWallet({
  chains: [IMMUTABLE_ZKEVM_MAINNET_CHAIN],
});

// Connect to testnet (default)
const provider = await connectWallet({
  chains: [IMMUTABLE_ZKEVM_TESTNET_CHAIN],
});
```

### Popup Overlay Options

```typescript
const provider = await connectWallet({
  popupOverlayOptions: {
    disableGenericPopupOverlay: true,
    disableBlockedPopupOverlay: true,
  },
});
```

---

## Using External Auth Packages

By default, `@imtbl/wallet` handles authentication internally. However, if your application already uses Immutable's auth packages for session management, you can integrate them with the wallet.

| Package | Use Case |
|---------|----------|
| `@imtbl/auth-next-client` | Next.js apps with server-side session management |
| `@imtbl/auth` | Non-Next.js apps needing custom auth control |

### With @imtbl/auth-next-client (Next.js)

If you're using NextAuth for server-side session management, pass the `getUser` function from `useImmutableSession`:

**Install dependencies:**

```bash
npm install @imtbl/wallet @imtbl/auth-next-client @imtbl/auth-next-server next-auth@5
```

**Integrate with the wallet:**

```tsx
'use client';

import { connectWallet } from '@imtbl/wallet';
import { useImmutableSession } from '@imtbl/auth-next-client';
import { useState } from 'react';

export function WalletConnect() {
  const { getUser } = useImmutableSession();
  const [provider, setProvider] = useState(null);

  const handleConnect = async () => {
    // Pass getUser to share session with the wallet
    const walletProvider = await connectWallet({ getUser });

    const accounts = await walletProvider.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log('Connected:', accounts[0]);
    setProvider(walletProvider);
  };

  return <button onClick={handleConnect}>Connect Wallet</button>;
}
```

**Benefits:**
- Server-side session management with secure token storage
- Automatic token refresh via NextAuth callbacks
- SSR compatibility
- Single source of truth for authentication state

### With @imtbl/auth (Direct)

For applications needing full control over authentication without NextAuth:

**Install dependencies:**

```bash
npm install @imtbl/wallet @imtbl/auth
```

**Integrate with the wallet:**

```typescript
import { connectWallet } from '@imtbl/wallet';
import { Auth } from '@imtbl/auth';

// Create your Auth instance
const auth = new Auth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  // ... other options
});

// Create a getUser function that wraps your Auth instance
const getUser = async (forceRefresh?: boolean) => {
  if (forceRefresh) {
    return auth.forceUserRefresh();
  }
  return auth.getUser();
};

// Pass to connectWallet
const provider = await connectWallet({ getUser });
```

**When to use this approach:**
- You need custom login/logout flows
- You want to manage auth state outside the wallet
- You're integrating with an existing auth system

---

## API Reference

### `connectWallet(options?)`

Creates an EIP-1193 compliant provider for Immutable zkEVM or other supported chains.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientId` | `string` | Auto-detected | Immutable client ID |
| `chains` | `ChainConfig[]` | `[testnet, mainnet]` | Chain configurations |
| `initialChainId` | `number` | First chain | Initial chain to connect to |
| `popupOverlayOptions` | `PopupOverlayOptions` | - | Options for login popup overlays |
| `announceProvider` | `boolean` | `true` | Whether to announce via EIP-6963 |
| `feeTokenSymbol` | `string` | `'IMX'` | Preferred token symbol for relayer fees |
| `jsonRpcReferrer` | `string` | - | Referrer URL sent with JSON-RPC requests |
| `crossSdkBridgeEnabled` | `boolean` | `false` | Enable cross-SDK bridge mode |
| `forceScwDeployBeforeMessageSignature` | `boolean` | `false` | Force SCW deployment before message signature |
| `getUser` | `GetUserFunction` | Internal | Custom function to get user (for external auth integration) |

#### Returns

`Promise<Provider>` - An EIP-1193 compliant provider.

### Provider Methods

The returned provider supports standard Ethereum JSON-RPC methods:

```typescript
// Get accounts (triggers login if needed)
const accounts = await provider.request({ method: 'eth_requestAccounts' });

// Get current accounts (returns empty if not connected)
const accounts = await provider.request({ method: 'eth_accounts' });

// Get chain ID
const chainId = await provider.request({ method: 'eth_chainId' });

// Send transaction
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    to: '0x...',
    value: '0x...',
    data: '0x...',
  }],
});

// Sign message (personal_sign)
const signature = await provider.request({
  method: 'personal_sign',
  params: ['0x...message', '0x...address'],
});

// Sign typed data (EIP-712)
const signature = await provider.request({
  method: 'eth_signTypedData_v4',
  params: ['0x...address', JSON.stringify(typedData)],
});
```

---

## Chain Configuration

### Chain ID Constants

```typescript
import {
  IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID,  // 13371
  IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID,  // 13473
  ARBITRUM_ONE_CHAIN_ID,              // 42161
  ARBITRUM_SEPOLIA_CHAIN_ID,          // 421614
} from '@imtbl/wallet';
```

### Preset Chain Configurations

#### Immutable zkEVM

```typescript
import { 
  IMMUTABLE_ZKEVM_MAINNET_CHAIN,  // Mainnet config
  IMMUTABLE_ZKEVM_TESTNET_CHAIN,  // Testnet config
  DEFAULT_CHAINS,                  // [testnet, mainnet]
} from '@imtbl/wallet';

// Use testnet only
const provider = await connectWallet({
  chains: [IMMUTABLE_ZKEVM_TESTNET_CHAIN],
});

// Use mainnet only
const provider = await connectWallet({
  chains: [IMMUTABLE_ZKEVM_MAINNET_CHAIN],
});

// Use both (default)
const provider = await connectWallet({
  chains: DEFAULT_CHAINS,
});
```

#### Arbitrum (Multi-chain Support)

```typescript
import {
  ARBITRUM_ONE_CHAIN,      // Arbitrum One Mainnet
  ARBITRUM_SEPOLIA_CHAIN,  // Arbitrum Sepolia Testnet
} from '@imtbl/wallet';

// Connect to Arbitrum One
const provider = await connectWallet({
  chains: [ARBITRUM_ONE_CHAIN],
});
```

### Chain Presets (Spread-friendly)

```typescript
import {
  IMMUTABLE_ZKEVM_MAINNET,     // { chains: [mainnet] }
  IMMUTABLE_ZKEVM_TESTNET,     // { chains: [testnet] }
  IMMUTABLE_ZKEVM_MULTICHAIN,  // { chains: [testnet, mainnet] }
  ARBITRUM_ONE,                // { chains: [arbitrum one] }
  ARBITRUM_SEPOLIA,            // { chains: [arbitrum sepolia] }
} from '@imtbl/wallet';

// Easy to spread into connectWallet
const provider = await connectWallet({
  ...IMMUTABLE_ZKEVM_MAINNET,
});
```

### Custom Chain Configuration

```typescript
import type { ChainConfig } from '@imtbl/wallet';

const customChain: ChainConfig = {
  chainId: 13473,
  name: 'Immutable zkEVM Testnet',
  rpcUrl: 'https://rpc.testnet.immutable.com',
  relayerUrl: 'https://api.sandbox.immutable.com/relayer-mr',
  apiUrl: 'https://api.sandbox.immutable.com',
  passportDomain: 'https://passport.sandbox.immutable.com',
  // Optional: Magic TEE config for dev environments
  magicPublishableApiKey: 'pk_...',
  magicProviderId: '...',
  magicTeeBasePath: 'https://tee.express.magiclabs.com',
  // Optional: Fee token (defaults to 'IMX')
  feeTokenSymbol: 'IMX',
};
```

### Chain Registry Utilities

```typescript
import { getChainConfig, getEvmChainFromChainId } from '@imtbl/wallet';

// Get chain config by chain ID
const config = getChainConfig(13371); // Returns IMMUTABLE_ZKEVM_MAINNET_CHAIN

// Get EVM chain type from chain ID
const evmChain = getEvmChainFromChainId(13371); // Returns EvmChain.ZKEVM
```

---

## Wallet Linking

Link external wallets (e.g., MetaMask, hardware wallets) to a user's Immutable Passport account.

### Get Linked Addresses

Retrieve all wallet addresses linked to the current user's account:

```typescript
import { getLinkedAddresses } from '@imtbl/wallet';
import { Auth } from '@imtbl/auth';
import { MultiRollupApiClients, createConfig } from '@imtbl/generated-clients';

const auth = new Auth({ /* ... */ });
const apiConfig = createConfig({ basePath: 'https://api.immutable.com' });
const apiClient = new MultiRollupApiClients({
  indexer: apiConfig,
  orderBook: apiConfig,
  passport: apiConfig,
});

const linkedAddresses = await getLinkedAddresses(auth, apiClient);
console.log('Linked wallets:', linkedAddresses);
// ['0x1234...', '0x5678...']
```

### Link External Wallet

Link a new external wallet to the user's account:

```typescript
import { linkExternalWallet } from '@imtbl/wallet';
import type { LinkWalletParams, LinkedWallet } from '@imtbl/wallet';

// 1. Get a signature from the external wallet
const walletAddress = '0x...'; // Address from MetaMask/external wallet
const nonce = 'unique-nonce-123'; // Generate a unique nonce
const message = `Link wallet ${walletAddress} with nonce ${nonce}`;

// Sign the message with the external wallet (e.g., using ethers.js or viem)
const signature = await externalWallet.signMessage(message);

// 2. Link the wallet
const params: LinkWalletParams = {
  type: 'metamask', // Wallet type identifier
  walletAddress,
  signature,
  nonce,
};

const linkedWallet: LinkedWallet = await linkExternalWallet(
  auth,
  apiClient,
  params
);

console.log('Linked wallet:', linkedWallet);
// {
//   address: '0x...',
//   type: 'metamask',
//   created_at: '2024-01-01T00:00:00Z',
//   updated_at: '2024-01-01T00:00:00Z',
//   clientName: 'your-client'
// }
```

### Linking Errors

The wallet linking API may return specific error codes:

| Error Code | Description |
|------------|-------------|
| `ALREADY_LINKED` | This wallet is already linked to an account |
| `MAX_WALLETS_LINKED` | Maximum number of linked wallets reached |
| `DUPLICATE_NONCE` | The nonce has already been used |
| `VALIDATION_ERROR` | Invalid signature or parameters |

---

## EIP-6963 Provider Discovery

The wallet automatically announces itself via [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) for wallet discovery by dApps.

### Automatic Announcement

By default, `connectWallet` announces the provider:

```typescript
const provider = await connectWallet();
// Provider is automatically announced via EIP-6963
```

### Disable Announcement

```typescript
const provider = await connectWallet({
  announceProvider: false, // Don't announce via EIP-6963
});
```

### Manual Announcement

```typescript
import { announceProvider, passportProviderInfo } from '@imtbl/wallet';

// Manually announce a provider
announceProvider({
  info: passportProviderInfo,
  provider: yourProvider,
});
```

### Provider Info

```typescript
import { passportProviderInfo } from '@imtbl/wallet';

console.log(passportProviderInfo);
// {
//   uuid: '...',
//   name: 'Immutable Passport',
//   icon: '...',
//   rdns: 'com.immutable.passport'
// }
```

---

## Events

The provider emits standard EIP-1193 events:

```typescript
// Account changes
provider.on('accountsChanged', (accounts: string[]) => {
  console.log('Accounts changed:', accounts);
});

// Chain changes
provider.on('chainChanged', (chainId: string) => {
  console.log('Chain changed:', chainId);
});

// Disconnection
provider.on('disconnect', (error: Error) => {
  console.log('Disconnected:', error);
});

// Remove listener
provider.removeListener('accountsChanged', handler);
```

---

## Error Handling

### WalletError

The SDK throws `WalletError` for wallet-related errors:

```typescript
import { connectWallet, WalletError, WalletErrorType } from '@imtbl/wallet';

try {
  const provider = await connectWallet();
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
} catch (error) {
  if (error instanceof WalletError) {
    switch (error.type) {
      case WalletErrorType.NOT_LOGGED_IN_ERROR:
        console.log('User is not logged in');
        break;
      case WalletErrorType.WALLET_CONNECTION_ERROR:
        console.log('Failed to connect wallet:', error.message);
        break;
      case WalletErrorType.TRANSACTION_REJECTED:
        console.log('User rejected the transaction');
        break;
      case WalletErrorType.UNAUTHORIZED:
        console.log('Unauthorized - call eth_requestAccounts first');
        break;
      case WalletErrorType.GUARDIAN_ERROR:
        console.log('Guardian validation failed');
        break;
      case WalletErrorType.INVALID_CONFIGURATION:
        console.log('Invalid wallet configuration');
        break;
      case WalletErrorType.SERVICE_UNAVAILABLE_ERROR:
        console.log('Service temporarily unavailable');
        break;
      default:
        console.error('Wallet error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Types

| Error Type | Description |
|------------|-------------|
| `NOT_LOGGED_IN_ERROR` | User is not authenticated |
| `WALLET_CONNECTION_ERROR` | Failed to connect or link wallet |
| `TRANSACTION_REJECTED` | User rejected a transaction |
| `UNAUTHORIZED` | Operation requires authentication |
| `GUARDIAN_ERROR` | Guardian (security) validation failed |
| `INVALID_CONFIGURATION` | Invalid wallet configuration |
| `SERVICE_UNAVAILABLE_ERROR` | Backend service unavailable |

### JSON-RPC Errors

For low-level RPC errors:

```typescript
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from '@imtbl/wallet';

// Standard provider error codes (EIP-1193)
ProviderErrorCode.USER_REJECTED_REQUEST  // 4001
ProviderErrorCode.UNAUTHORIZED           // 4100
ProviderErrorCode.UNSUPPORTED_METHOD     // 4200
ProviderErrorCode.DISCONNECTED           // 4900

// Standard RPC error codes
RpcErrorCode.INVALID_REQUEST             // -32600
RpcErrorCode.METHOD_NOT_FOUND            // -32601
RpcErrorCode.INVALID_PARAMS              // -32602
RpcErrorCode.INTERNAL_ERROR              // -32603
```

---

## TypeScript

Full TypeScript support is included:

```typescript
import type { 
  // Connection options
  ConnectWalletOptions,
  ChainConfig,
  PopupOverlayOptions,
  
  // Provider types
  Provider,
  RequestArguments,
  
  // User types
  GetUserFunction,
  User,
  UserProfile,
  UserZkEvm,
  
  // Wallet linking
  LinkWalletParams,
  LinkedWallet,
  
  // Transaction types
  TypedDataPayload,
  MetaTransaction,
  RelayerTransaction,
  RelayerTransactionStatus,
  FeeOption,
  
  // Event types
  WalletEventMap,
  ProviderEventMap,
  AccountsChangedEvent,
  
  // EIP-6963
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from '@imtbl/wallet';
```

---

## Advanced Usage

### Direct Provider Access

For advanced use cases, you can access the provider classes directly:

```typescript
import { ZkEvmProvider } from '@imtbl/wallet';
```

### Relayer Client

For direct relayer interaction:

```typescript
import { RelayerClient } from '@imtbl/wallet';
```

### Wallet Helpers

Utility functions for wallet operations:

```typescript
import * as walletHelpers from '@imtbl/wallet';
```

---

## Related Packages

### Optional Auth Integrations

These packages are only needed if you want to manage authentication separately from the wallet:

| Package | Description |
|---------|-------------|
| [`@imtbl/auth-next-client`](../auth-next-client/README.md) | NextAuth client-side hooks for Next.js apps |
| [`@imtbl/auth-next-server`](../auth-next-server/README.md) | NextAuth server-side configuration |
| [`@imtbl/auth`](../auth/README.md) | Core authentication for custom auth flows |

### Other Immutable Packages

| Package | Description |
|---------|-------------|
| [`@imtbl/generated-clients`](../generated-clients/README.md) | API clients for Immutable services |
| [`@imtbl/metrics`](../metrics/README.md) | Metrics and analytics utilities |
