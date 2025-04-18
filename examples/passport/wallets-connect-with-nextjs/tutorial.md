<div class="display-none">

# Wallets Connect with Next.js

</div>

This example app demonstrates how to integrate Immutable Passport with different wallet connection methods in a Next.js application. It showcases three different approaches to connect with Passport: using EIP-1193, using ethers.js, and using Wagmi.

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/wallets-connect-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Connect with EIP-1193**: Connect to Immutable Passport using the EIP-1193 standard interface
- **Connect with ethers.js**: Connect to Immutable Passport using ethers.js BrowserProvider
- **Connect with Wagmi**: Connect to Immutable Passport using the Wagmi library

## SDK Integration Details

### Connect with EIP-1193

This implementation demonstrates how to connect to Immutable Passport using the EIP-1193 standard interface. It first fetches the Passport provider using `passportInstance.connectEvm()`. To trigger the login flow, it calls the `request` method with `eth_requestAccounts`. The implementation also listens for the `ACCOUNTS_CHANGED` event to update the UI when the connected accounts change.

Fetch the Passport provider from the Passport instance:

```typescript title="Create Passport provider" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-eip1193/page.tsx"
// fetch the Passport provider from the Passport instance
const [passportProvider, setPassportProvider] = useState<Provider>();

useEffect(() => {
  const fetchPassportProvider = async () => {
    const passportProvider = await passportInstance.connectEvm();
    setPassportProvider(passportProvider);
  };
  fetchPassportProvider();
}, []);
```

Call `eth_requestAccounts` to trigger the Passport login flow:

```typescript title="Request accounts" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-eip1193/page.tsx"
// calling eth_requestAccounts triggers the Passport login flow
const accounts = await passportProvider?.request({ method: 'eth_requestAccounts' });
```

Listen to the `ACCOUNTS_CHANGED` event and update the accounts state when it changes:

```typescript title="Handle account changes" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-eip1193/page.tsx"
// listen to the ACCOUNTS_CHANGED event and update the accounts state when it changes
passportProvider?.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts: string[]) => {
  setAccountsState(accounts);
});
```

### Connect with ethers.js

This implementation shows how to connect to Immutable Passport using ethers.js. It first fetches the Passport provider using `passportInstance.connectEvm()`, then creates an ethers.js `BrowserProvider` by passing the Passport provider to it. To trigger the login flow, it calls the `send` method on the browser provider with `eth_requestAccounts`. This approach allows developers to use the familiar ethers.js API while still connecting through Passport.

Fetch the Passport provider and create the ethers.js `BrowserProvider`:
```typescript title="Create Passport provider and BrowserProvider" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-etherjs/page.tsx"

// fetch the Passport provider from the Passport instance
const [passportProvider, setPassportProvider] = useState<Provider>();

useEffect(() => {
  const fetchPassportProvider = async () => {
    const passportProvider = await passportInstance.connectEvm();
    setPassportProvider(passportProvider);
  };
  fetchPassportProvider();
}, []);

const browserProvider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);
```

Call `eth_requestAccounts` via the `BrowserProvider`:
```typescript title="Request accounts via ethers.js" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-etherjs/page.tsx"

// calling eth_requestAccounts triggers the Passport login flow
const accounts = await browserProvider.send('eth_requestAccounts', []);
```

### Connect with Wagmi

This implementation demonstrates how to connect to Immutable Passport using the Wagmi library. It first initializes Passport by calling `passportInstance.connectEvm()`, which makes Passport available as a connector option to Wagmi. The app then filters the available connectors to show only Passport and uses Wagmi's `connect` function to connect to it. For logout, it first disconnects from Wagmi and then calls `passportInstance.logout()`. This approach allows developers to use the comprehensive Wagmi hooks API with Passport.

Initialize Passport for Wagmi compatibility (`page.tsx`):
```typescript title="Initialize Passport for Wagmi" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-wagmi/page.tsx"
// Main page setup
useEffect(() => {
  const init = async () => {
    // calling connectEVM() makes Passport available as an option to Wagmi
    await passportInstance.connectEvm();
  }
  
  init();
}, []);
```

Filter connectors and connect using Wagmi (`wallet-options.tsx`):
```typescript title="Filter and connect Wagmi" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-wagmi/wallet-options.tsx"
// filter the available connectors to show only Passport
setFilteredConnectors(connectors.filter((connector) => 
  connector.name.includes('Immutable Passport')));

// connect Wagmi to Passport
connect({ connector });
```

Disconnect Wagmi and logout Passport (`account.tsx`):
```typescript title="Disconnect Wagmi and logout" manualLink="https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-connect-with-nextjs/app/connect-with-wagmi/account.tsx"
// In account.tsx
// disconnect Wagmi from Passport
disconnect();
// logout from Passport
await passportInstance.logout();
```

## Running the App

### Prerequisites

- Node.js 18 or higher
- pnpm
- An account on [Immutable Hub](https://hub.immutable.com) for environment setup

### Setup Environment Variables

1. Create a `.env` file in the root directory based on the `.env.example` file
2. Set your `NEXT_PUBLIC_CLIENT_ID` and `NEXT_PUBLIC_PUBLISHABLE_KEY` values from Immutable Hub

### Installation and Running

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   ```

2. Navigate to the example app directory:
   ```bash
   cd ts-immutable-sdk/examples/passport/wallets-connect-with-nextjs
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Summary

This example app demonstrates three different approaches for connecting to Immutable Passport in a Next.js application:

1. Using the EIP-1193 standard interface
2. Using ethers.js BrowserProvider
3. Using the Wagmi library

Each method has its advantages depending on your specific needs and existing codebase. The EIP-1193 approach is the most direct, ethers.js provides a familiar API for blockchain developers, and Wagmi offers a comprehensive hooks API for React applications. By understanding these different integration methods, developers can choose the approach that best fits their application requirements. 