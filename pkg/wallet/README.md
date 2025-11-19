# @imtbl/wallet

EIP-1193 compatible wallet provider for Immutable zkEVM. Works standalone (zero-config) or with authentication for enhanced features.

## Installation

```bash
npm install @imtbl/wallet
# or
pnpm add @imtbl/wallet
# or
yarn add @imtbl/wallet
```

## Quick Start

### Zero Config (Standalone)

```typescript
import { connectWallet } from '@imtbl/wallet';

// Works immediately - uses default Immutable chains
const provider = await connectWallet();

// Use with any EIP-1193 compatible library
const accounts = await provider.request({ method: 'eth_requestAccounts' });
```

### With Authentication

```typescript
import { Auth } from '@imtbl/auth';
import { connectWallet } from '@imtbl/wallet';

const auth = new Auth({ clientId: '...', redirectUri: '...' });

// Pass auth client - login handled automatically when needed
const provider = await connectWallet({ auth });

// User will be prompted to login automatically
const accounts = await provider.request({ method: 'eth_requestAccounts' });
```

## Usage Examples

### With viem

```typescript
import { connectWallet } from '@imtbl/wallet';
import { createWalletClient, custom } from 'viem';

const provider = await connectWallet();
const client = createWalletClient({
  transport: custom(provider),
});

const accounts = await client.requestAddresses();
const balance = await client.getBalance({ address: accounts[0] });
```

### With ethers

```typescript
import { connectWallet } from '@imtbl/wallet';
import { BrowserProvider } from 'ethers';

const provider = await connectWallet();
const ethersProvider = new BrowserProvider(provider);

const signer = await ethersProvider.getSigner();
const address = await signer.getAddress();
const balance = await ethersProvider.getBalance(address);
```

### Custom Chain Configuration

```typescript
const provider = await connectWallet({
  chains: [{
    chainId: 13371,
    rpcUrl: 'https://rpc.immutable.com',
    relayerUrl: 'https://api.immutable.com/relayer-mr',
    apiUrl: 'https://api.immutable.com',
    name: 'Immutable zkEVM',
  }],
  initialChainId: 13371,
});
```

### Sending Transactions

```typescript
const provider = await connectWallet({ auth });

// Request accounts (triggers login if needed)
const accounts = await provider.request({ method: 'eth_requestAccounts' });

// Send transaction
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: accounts[0],
    to: '0x...',
    value: '0x0',
    data: '0x...',
  }],
});
```

### Signing Messages

```typescript
// Sign personal message (ERC-191)
const signature = await provider.request({
  method: 'personal_sign',
  params: ['0x48656c6c6f20576f726c64', accounts[0]],
});

// Sign typed data (EIP-712)
const typedDataSignature = await provider.request({
  method: 'eth_signTypedData_v4',
  params: [accounts[0], {
    domain: { name: 'MyApp', version: '1', chainId: 13371 },
    types: { Message: [{ name: 'content', type: 'string' }] },
    message: { content: 'Hello World' },
  }],
});
```

## API Reference

### `connectWallet`

```typescript
function connectWallet(config?: WalletConfig): Promise<Provider>
```

Creates and returns an EIP-1193 compatible provider.

**Config Options:**
- `chains?: ChainConfig[]` - Chain configurations (defaults to Immutable testnet + mainnet)
- `initialChainId?: number` - Initial chain ID (defaults to first chain)
- `auth?: Auth` - Auth client for automatic login
- `popupOverlayOptions?: { disableGenericPopupOverlay?: boolean; disableBlockedPopupOverlay?: boolean }` - Overlay options
- `announceProvider?: boolean` - Announce via EIP-6963 (default: `true`)

### `Provider` (EIP-1193)

The returned provider implements the standard EIP-1193 interface:

```typescript
interface Provider {
  request(args: RequestArguments): Promise<any>;
  on(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
}
```

**Supported Methods:**
- `eth_requestAccounts` - Request wallet connection (triggers login if needed)
- `eth_accounts` - Get connected accounts
- `eth_sendTransaction` - Send transaction
- `eth_sign` - Sign message (deprecated, use `personal_sign`)
- `personal_sign` - Sign personal message (ERC-191)
- `eth_signTypedData_v4` - Sign typed data (EIP-712)
- `eth_chainId` - Get current chain ID
- `wallet_switchEthereumChain` - Switch chain
- `eth_getBalance` - Get balance
- `eth_call` - Call contract
- `eth_getTransactionReceipt` - Get transaction receipt
- `im_signEjectionTransaction` - Sign ejection transaction (wallet recovery)
- `im_addSessionActivity` - Add session activity (analytics)

**Events:**
- `accountsChanged` - Emitted when accounts change

## Architecture

### Zero Config Mode

When no auth client is provided, the wallet works in read-only mode:
- Can query chain state (`eth_call`, `eth_getBalance`, etc.)
- Cannot send transactions or sign messages
- Login is required for signing operations

### Authenticated Mode

When an auth client is provided:
- Login is triggered automatically when signing operations are requested
- Magic TEE signer is initialized automatically
- Wallet address is registered automatically on first use
- Full transaction and signing capabilities available

### Meta-Transactions

All transactions are sent as meta-transactions through Immutable's relayer:
1. Transaction is validated by Guardian API
2. Transaction is signed with Sequence signature format
3. Transaction is submitted via relayer
4. Relayer handles gas fees (paid in IMX token)

## EIP-1193 Compatibility

The provider is fully EIP-1193 compatible and works with:
- **viem** - `createWalletClient({ transport: custom(provider) })`
- **ethers** - `new BrowserProvider(provider)`
- **web3.js** - `new Web3(provider)`
- Any library that supports EIP-1193

## License

Apache-2.0
