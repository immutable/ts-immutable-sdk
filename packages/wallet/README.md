# @imtbl/wallet

The Immutable Wallet SDK provides an EIP-1193 compliant Ethereum provider for interacting with Immutable's zkEVM blockchain. It handles authentication, transaction signing, and wallet management.

## Installation

```bash
npm install @imtbl/wallet
# or
yarn add @imtbl/wallet
# or
pnpm add @imtbl/wallet
```

## Quick Start

The simplest way to get started is with the default authentication:

```typescript
import { connectWallet } from '@imtbl/wallet';

// Uses default Immutable-hosted authentication
const provider = await connectWallet();

// Request accounts (triggers login if needed)
const accounts = await provider.request({ method: 'eth_requestAccounts' });
console.log('Connected:', accounts[0]);
```

## Integration Options

The wallet package supports three authentication modes:

| Option | Use Case | Package |
|--------|----------|---------|
| **Option 1: Default Auth** | Simplest setup, uses built-in Auth class | `@imtbl/wallet` only |
| **Option 2: NextAuth Integration** | Server-side session management with Next.js | `@imtbl/wallet` + `@imtbl/auth-next-client` |
| **Option 3: Using @imtbl/auth Directly** | Full control over authentication | `@imtbl/wallet` + `@imtbl/auth` |

---

## Option 1: Default Authentication

Uses the built-in `@imtbl/auth` instance. Best for simple applications or when you don't need server-side session management.

```typescript
import { connectWallet } from '@imtbl/wallet';

// Basic setup - uses default Immutable authentication
const provider = await connectWallet({
  clientId: 'your-client-id', // Optional, uses defaults if not provided
});

// Request accounts triggers the login flow
const accounts = await provider.request({ method: 'eth_requestAccounts' });
```

### With Custom Chain Configuration

```typescript
import { connectWallet, IMMUTABLE_ZKEVM_TESTNET_CHAIN } from '@imtbl/wallet';

const provider = await connectWallet({
  chains: [IMMUTABLE_ZKEVM_TESTNET_CHAIN],
  initialChainId: 13473, // Testnet chain ID
});
```

---

## Option 2: NextAuth Integration (Recommended for Next.js)

For Next.js applications using NextAuth for server-side session management, use `@imtbl/auth-next-client` which provides a `getUser` function compatible with the wallet.

### Setup

1. **Install dependencies:**

```bash
npm install @imtbl/wallet @imtbl/auth-next-client @imtbl/auth-next-server next-auth@5
```

2. **Configure NextAuth server-side** (see `@imtbl/auth-next-server` documentation)

3. **Use in your React components:**

```tsx
'use client';

import { connectWallet } from '@imtbl/wallet';
import { useImmutableSession } from '@imtbl/auth-next-client';
import { useState } from 'react';

export function WalletConnect() {
  const { getUser, isAuthenticated } = useImmutableSession();
  const [provider, setProvider] = useState(null);

  const handleConnect = async () => {
    // Pass getUser directly from useImmutableSession
    const walletProvider = await connectWallet({
      getUser,  // <-- This is all you need!
    });

    // Request accounts to trigger login/registration
    const accounts = await walletProvider.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log('Connected:', accounts[0]);
    setProvider(walletProvider);
  };

  return (
    <button onClick={handleConnect} disabled={!isAuthenticated}>
      Connect Wallet
    </button>
  );
}
```

### Key Benefits of NextAuth Integration

- **Server-side session management**: Tokens are stored securely on the server
- **Automatic token refresh**: Tokens are refreshed automatically via NextAuth callbacks
- **SSR compatibility**: Session data available during server-side rendering
- **Unified auth state**: Single source of truth for authentication across your app

### How It Works

The `useImmutableSession` hook returns a `getUser` function that:
1. Reads the current session from NextAuth
2. Returns user data with fresh tokens
3. Supports `forceRefresh` to trigger server-side token refresh when needed

```typescript
const { getUser } = useImmutableSession();

// Normal call - returns cached session data instantly
const user = await getUser();

// Force refresh - triggers server-side token refresh
const freshUser = await getUser(true);
```

---

## Option 3: Using @imtbl/auth Directly

For applications that need full control over authentication but aren't using NextAuth:

```typescript
import { connectWallet } from '@imtbl/wallet';
import { Auth } from '@imtbl/auth';

// Create your own Auth instance
const auth = new Auth({
  clientId: 'your-client-id',
  redirectUri: 'https://your-app.com/callback',
  // ... other options
});

// Create a getUser function
const getUser = async (forceRefresh?: boolean) => {
  if (forceRefresh) {
    return auth.forceUserRefresh();
  }
  return auth.getUser();
};

// Pass to connectWallet
const provider = await connectWallet({ getUser });
```

---

## API Reference

### `connectWallet(options?)`

Creates an EIP-1193 compliant provider for Immutable zkEVM.

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `getUser` | `(forceRefresh?: boolean) => Promise<User \| null>` | Function to get current user with tokens. If not provided, uses default auth. |
| `clientId` | `string` | Immutable client ID. Required when using default auth. |
| `chains` | `ChainConfig[]` | Chain configurations. Defaults to testnet + mainnet. |
| `initialChainId` | `number` | Initial chain to connect to. Defaults to first chain. |
| `popupOverlayOptions` | `PopupOverlayOptions` | Options for login popup overlays. |
| `announceProvider` | `boolean` | Whether to announce via EIP-6963. Defaults to `true`. |

#### Returns

`Promise<ZkEvmProvider>` - An EIP-1193 compliant provider.

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

// Sign message
const signature = await provider.request({
  method: 'personal_sign',
  params: ['0x...message', '0x...address'],
});
```

---

## Chain Configuration

### Preset Chains

```typescript
import { 
  IMMUTABLE_ZKEVM_MAINNET_CHAIN,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN,
  DEFAULT_CHAINS,
} from '@imtbl/wallet';

// Use testnet only
const provider = await connectWallet({
  chains: [IMMUTABLE_ZKEVM_TESTNET_CHAIN],
});

// Use both (default)
const provider = await connectWallet({
  chains: DEFAULT_CHAINS, // [testnet, mainnet]
});
```

### Custom Chain Configuration

```typescript
const customChain: ChainConfig = {
  chainId: 13473,
  chainName: 'Immutable zkEVM Testnet',
  rpcUrl: 'https://rpc.testnet.immutable.com',
  relayerUrl: 'https://relayer.testnet.immutable.com',
  apiUrl: 'https://api.sandbox.immutable.com',
  // Optional Magic TEE config for dev environments
  magicPublishableApiKey: 'pk_...',
  magicProviderId: '...',
};
```

---

## Events

The provider emits standard EIP-1193 events:

```typescript
provider.on('accountsChanged', (accounts: string[]) => {
  console.log('Accounts changed:', accounts);
});

provider.on('chainChanged', (chainId: string) => {
  console.log('Chain changed:', chainId);
});

provider.on('disconnect', (error: Error) => {
  console.log('Disconnected:', error);
});
```

---

## Error Handling

```typescript
import { connectWallet } from '@imtbl/wallet';

try {
  const provider = await connectWallet({ getUser });
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
} catch (error) {
  if (error.message.includes('Popup closed')) {
    console.log('User cancelled login');
  } else if (error.message.includes('Unauthorized')) {
    console.log('User not authenticated - call eth_requestAccounts first');
  } else {
    console.error('Wallet error:', error);
  }
}
```

---

## TypeScript

Full TypeScript support is included:

```typescript
import type { 
  ConnectWalletOptions, 
  ChainConfig, 
  GetUserFunction,
  ZkEvmProvider,
} from '@imtbl/wallet';
```

---

## Related Packages

| Package | Description |
|---------|-------------|
| [`@imtbl/auth`](../auth/README.md) | Core authentication with client-side session management |
| [`@imtbl/auth-next-server`](../auth-next-server/README.md) | NextAuth server-side configuration |
| [`@imtbl/auth-next-client`](../auth-next-client/README.md) | NextAuth client-side hooks and components |
