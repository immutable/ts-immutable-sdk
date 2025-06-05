<div class="display-none">

# Passport Wallet Message Signing with Next.js

</div>

This example demonstrates how to use the Passport SDK to sign messages using two different standards:
- EIP-712 Typed Data Signing
- ERC-191 Personal Signing

<div class="button-component">

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/wallets-signing-with-nextjs) <span class="button-component-arrow">→</span>

</div>

## Features Overview

- **Sign with EIP-712**: Sign structured, typed data according to the EIP-712 standard with Passport wallets
- **Sign with ERC-191**: Sign personal messages according to the ERC-191 standard with Passport wallets

## SDK Integration Details

### Sign with EIP-712

EIP-712 Typed Data Signing allows users to sign structured, typed data in a readable format.
This section shows how to use Passport to sign structured, typed data adhering to the EIP-712 standard, presenting the data in a human-readable format within the signing prompt.


First, we need to create a Passport provider and connect it to the browser's Ethereum provider:

```typescript title="Create Passport provider" reference=examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#passport-wallets-nextjs-sign-eip712-create
// fetch the Passport provider from the Passport instance
const [passportProvider, setPassportProvider] = useState<Provider>();

useEffect(() => {
  const fetchPassportProvider = async () => {
    const passportProvider = await passportInstance.connectEvm();
    setPassportProvider(passportProvider);
  };
  fetchPassportProvider();
}, []);

// create the BrowserProvider using the Passport provider
const browserProvider = useMemo(() => passportProvider ? 
  new BrowserProvider(passportProvider) : undefined, 
  [passportProvider]);
```

To sign a typed data message, the app:

1. Creates a structured typed data payload using the EIP-712 format
2. Uses the Passport provider to sign the message

```typescript title="Sign EIP-712 message" reference=examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#passport-wallets-nextjs-sign-eip712-signmessage
const signMessage = async () => {
  if (!browserProvider) return;

  // set signed state message to pending in the view
  setSignedMessageState('pending signature');

  // fetch the signer from the BrowserProvider
  const signer = await browserProvider.getSigner();

  // set the chainId
  const chainId = 13473; // zkEVM testnet

  // set the sender address
  const address = await signer.getAddress();

  // get our message payload - including domain, message and types
  const etherMailTypedPayload = getEtherMailTypedPayload(chainId, address)

  setParams([
    address,
    etherMailTypedPayload
  ])

  try {
    // attempt to sign the message, this brings up the passport popup
    const signature = await passportProvider?.request({
      method: 'eth_signTypedData_v4',
      params: [address, etherMailTypedPayload],
    })
    
    setSignature(signature)
    setSignedMessageState('user successfully signed message');

  } catch (error: any) {
    // Handle user denying signature
    if (error.code === 4001) {
      // if the user declined update the signed message to declined in the view
      setSignedMessageState('user declined to sign');
    } else {
      // if something else went wrong, update the generic error with message in the view
      setSignedMessageState(`something went wrong - ${error.message}`);
      console.log(error);
    }
  }
};
```

To verify the signature:

```typescript title="Verify EIP-712 signature" reference=examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#passport-wallets-nextjs-sign-eip712-verifysignature
const isValidTypedDataSignature = async (
  address: string, //The Passport wallet address returned from eth_requestAccounts
  payload: string, //The stringified payload
  signature: string, //The signature
  zkEvmProvider: passport.Provider, // can be any provider, Passport or not
) => {
  const typedPayload: passport.TypedDataPayload = JSON.parse(payload);
  const types = { ...typedPayload.types };
  // Ethers auto-generates the EIP712Domain type in the TypedDataEncoder, and so it needs to be removed
  delete types.EIP712Domain;

  //The hashed string
  const digest = TypedDataEncoder.hash(
    typedPayload.domain,
    types,
    typedPayload.message,
  );
  return isValidSignature(address, digest, signature, zkEvmProvider);
};
```

### Sign with ERC-191

ERC-191 Personal Signing allows users to sign simple text messages.
This section demonstrates signing simple string messages using the ERC-191 standard (often referred to as `personal_sign`).


Similar to the EIP-712 implementation, we first set up the Passport provider:

```typescript title="Create Passport provider" reference=examples/passport/wallets-signing-with-nextjs/app/sign-with-erc191/page.tsx#passport-wallets-nextjs-sign-erc191-create

// fetch the Passport provider from the Passport instance
const [passportProvider, setPassportProvider] = useState<Provider>();

useEffect(() => {
  const fetchPassportProvider = async () => {
    const passportProvider = await passportInstance.connectEvm();
    setPassportProvider(passportProvider);
  };
  fetchPassportProvider();
}, []);

// create the BrowserProvider using the Passport provider
const browserProvider = useMemo(() => passportProvider ? 
  new BrowserProvider(passportProvider) : undefined, 
  [passportProvider]);
```

To sign a personal message:

```typescript title="Sign personal message (ERC-191)" reference=examples/passport/wallets-signing-with-nextjs/app/sign-with-erc191/page.tsx#passport-wallets-nextjs-sign-erc191-signmessage
const signMessage = async () => {
  if (!browserProvider) return;

  // set signed state message to pending in the view
  setSignedMessageState('pending signature');

  // fetch the signer from the BrowserProvider
  const signer = await browserProvider.getSigner();

  const address = await signer.getAddress();
  setAddress(address);

  // Create the message to be signed
  // Please note there is a 500 character limit for the message
  const message = 'this is a personal sign message';

  setPersonalMessage(message);

  try {
    if (!signer) {
      throw new Error('No signer found');
    }

    // attempt to sign the message, this brings up the passport popup
    const signature = await signer.signMessage(message);
    setSignature(signature);
    // if successful update the signed message to successful in the view
    setSignedMessageState('user successfully signed message');

  } catch (error: any) {
    // Handle user denying signature
    if (error.code === -32003) {
      // if the user declined update the signed message to declined in the view
      setSignedMessageState('user declined to sign');
    } else {
      // if something else went wrong, update the generic error with message in the view
      setSignedMessageState(`something went wrong - ${error.message}`);
      console.log(error)
    }
  }
};
```

To verify the signature:

```typescript title="Verify personal signature (ERC-191)" reference=examples/passport/wallets-signing-with-nextjs/app/sign-with-erc191/page.tsx#passport-wallets-nextjs-sign-erc191-verifysignature
const isValidERC191Signature = async (
  address: string, // The wallet address returned from eth_requestAccounts
  payload: string, // The message string
  signature: string, // The signature
  zkEvmProvider: passport.Provider, // Can be any provider, Passport or not
) => {
  const digest = hashMessage(payload);

  return isValidSignature(address, digest, signature, zkEvmProvider);
};
```

## Running the App

### Prerequisites

1. Node.js (v18 or later)
2. pnpm installed globally
3. Immutable Hub account for environment setup. [Visit Immutable Hub](https://hub.immutable.com/)

### Setting up the Environment

1. Copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```

2. Configure your Hub application:
   - Add `http://localhost:3000/redirect` as a redirect URI
   - Add `http://localhost:3000/logout` as a logout URI

### Running Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open your browser to http://localhost:3000

## Summary

This example demonstrates how to implement both EIP-712 typed data signing and ERC-191 personal message signing with the Passport SDK in a Next.js application. The implementation showcases:

- How to initialize and connect the Passport provider
- How to request user accounts
- How to sign structured typed data (EIP-712)
- How to sign personal messages (ERC-191)
- How to verify signatures for both standards

These implementations can be adapted for various use cases such as user authentication, transaction signing, and other scenarios requiring cryptographic proof of user intent. 