# @imtbl/wallet

Minimal wallet package for Immutable zkEVM. Provides an EIP-1193 compatible provider that can be used standalone (zero config) or with authenticated user for enhanced functionality.

## Installation

```bash
npm install @imtbl/wallet
# or
pnpm add @imtbl/wallet
# or
yarn add @imtbl/wallet
```

## Usage

### Zero Config (Standalone)

Works immediately without any configuration:

```typescript
import { Wallet } from '@imtbl/wallet';

const wallet = new Wallet();
const provider = await wallet.connect();

// Use with viem
import { createWalletClient, custom } from 'viem';
const client = createWalletClient({
  transport: custom(provider),
});

// Use with ethers
import { BrowserProvider } from 'ethers';
const ethersProvider = new BrowserProvider(provider);
```

### With Authentication (Enhanced Features)

Pass an authenticated user from `@imtbl/auth` for enhanced features:

```typescript
import { Auth } from '@imtbl/auth';
import { Wallet } from '@imtbl/wallet';

// Authenticate first
const auth = new Auth({ clientId: '...', redirectUri: '...' });
await auth.login();
const user = await auth.getUser();

// Create wallet with auth context
const wallet = new Wallet({ authenticatedUser: user });
const provider = await wallet.connect();

// Now has enhanced features (user context, linked wallets via Passport)
```

### Basic Wallet Operations

```typescript
const wallet = new Wallet();
const provider = await wallet.connect();

// Get wallet address
const address = await wallet.getAddress();

// Get chain ID
const chainId = await wallet.getChainId();

// Check connection
const isConnected = await wallet.isConnected();

// Use EIP-1193 methods
const accounts = await provider.request({ method: 'eth_requestAccounts' });
const balance = await provider.request({
  method: 'eth_getBalance',
  params: [accounts[0], 'latest'],
});
```

## API Reference

### `Wallet`

#### Constructor

```typescript
new Wallet(config?: WalletConfig)
```

If `config` is omitted, works in zero-config mode. Pass `authenticatedUser` for enhanced features.

#### Methods

- `connect(options?: ConnectOptions): Promise<Provider>` - Connects and returns EIP-1193 provider
- `getAddress(): Promise<string>` - Gets connected wallet address
- `getChainId(): Promise<number>` - Gets current chain ID
- `isConnected(): Promise<boolean>` - Checks if wallet is connected

### Types

- `Provider` - EIP-1193 compatible provider interface
- `RequestArguments` - JSON-RPC request format
- `WalletConfig` - Optional configuration
- `ConnectOptions` - Connection options
- `AuthenticatedUser` - Authenticated user from `@imtbl/auth`

## EIP-1193 Compatibility

The provider returned by `connect()` is fully EIP-1193 compatible and works with:

- **viem** - `createWalletClient({ transport: custom(provider) })`
- **ethers** - `new BrowserProvider(provider)`
- **web3.js** - `new Web3(provider)`
- Any library that supports EIP-1193

## License

Apache-2.0

