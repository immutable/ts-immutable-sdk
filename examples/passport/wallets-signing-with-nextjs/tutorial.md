# Passport Message Signing Example App

## Introduction
This example app demonstrates how to implement message signing and verification using Immutable Passport in a Next.js application. It showcases two different signing methods: EIP-712 typed data signing and ERC-191 personal message signing. The app lets users connect their wallet, sign messages, and verify the signatures on-chain, demonstrating the security and verification capabilities of Immutable Passport.

[View app on Github](https://github.com/immutable/ts-immutable-sdk/tree/main/examples/passport/wallets-signing-with-nextjs)

## Features Overview
- **Message Signing with EIP-712**: Sign structured typed data messages following the EIP-712 standard
- **Message Signing with ERC-191**: Sign personal messages following the ERC-191 standard
- **Signature Verification**: On-chain verification of signed messages using ERC-1271 standard

## SDK Integration Details

### Message Signing with EIP-712

**Feature Name**: [Creating a Provider for EIP-712 Signing](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#L39-L46)

**Implementation**:
```typescript
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
const browserProvider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);
```

**Explanation**: This code initializes the Passport provider, which is essential for EIP-712 message signing. It creates a connection to the Ethereum environment using `connectEvm()` and then wraps the Passport provider with Ethers.js `BrowserProvider` to enable easy interaction with the blockchain.

**Feature Name**: [Requesting User Accounts](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#L55-L57)

**Implementation**:
```typescript
// calling eth_requestAccounts triggers the Passport login flow
const accounts = await browserProvider.send('eth_requestAccounts', []);
```

**Explanation**: This triggers the Passport login flow, allowing users to connect their wallet. Upon successful authentication, the user's wallet address is returned, which is necessary for signing messages.

**Feature Name**: [Signing a Typed Message with EIP-712](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#L86-L125)

**Implementation**:
```typescript
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
      setSignedMessageState('user declined to sign');
    } else {
      setSignedMessageState(`something went wrong - ${error.message}`);
      console.log(error);
    }
  }
};
```

**Explanation**: This function handles the EIP-712 typed data signing process. It creates a structured typed data payload following the EIP-712 standard, which includes domain data, message data, and type definitions. When invoked, it opens the Passport signing popup for the user to approve, and upon approval, returns a cryptographic signature that can be verified on-chain.

**Feature Name**: [Verifying EIP-712 Signatures](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-eip712/page.tsx#L136-L154)

**Implementation**:
```typescript
const isValidTypedDataSignature = async (
  address: string, //The Passport wallet address returned from eth_requestAccounts
  payload: string, //The stringified payload
  signature: string, //The signature
  zkEvmProvider: passport.Provider, // can be any provider, Passport or not
) => {
  const typedPayload: passport.TypedDataPayload = JSON.parse(payload);
  const types = { ...typedPayload.types };
  // @ts-ignore
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

**Explanation**: This function verifies EIP-712 signatures by computing the hash of the typed data payload using `TypedDataEncoder.hash()` and then checking if the signature is valid by calling the `isValidSignature` helper function. The verification happens on-chain using the ERC-1271 standard, which is implemented in Immutable's smart contract wallets.

### Message Signing with ERC-191

**Feature Name**: [Creating a Provider for ERC-191 Signing](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-erc191/page.tsx#L36-L43)

**Implementation**:
```typescript
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

**Explanation**: Similar to the EIP-712 implementation, this code establishes a connection to the Ethereum environment through Passport, which is necessary for ERC-191 personal message signing.

**Feature Name**: [Signing a Personal Message with ERC-191](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-erc191/page.tsx#L80-L117)

**Implementation**:
```typescript
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
      setSignedMessageState('user declined to sign');
    } else {
      setSignedMessageState(`something went wrong - ${error.message}`);
      console.log(error)
    }
  }
};
```

**Explanation**: This function handles personal message signing using the ERC-191 standard. Unlike EIP-712, this method signs a simple text message. When invoked, it opens the Passport signing popup for the user to approve, and upon approval, returns a cryptographic signature that can be verified on-chain.

**Feature Name**: [Verifying ERC-191 Signatures](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/sign-with-erc191/page.tsx#L124-L132)

**Implementation**:
```typescript
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

**Explanation**: This function verifies ERC-191 signatures by hashing the message using `hashMessage()` from ethers.js and then checking if the signature is valid by calling the `isValidSignature` helper function. As with EIP-712, the verification happens on-chain using the ERC-1271 standard.

### Signature Verification Helper

**Feature Name**: [On-Chain Signature Verification](https://github.com/immutable/ts-immutable-sdk/blob/main/examples/passport/wallets-signing-with-nextjs/app/utils/isValidSignature.ts#L10-L24)

**Implementation**:
```typescript
export const isValidSignature = async (
  address: string, // The Passport wallet address returned from eth_requestAccounts
  digest: string | Uint8Array,
  signature: string,
  zkEvmProvider: Provider, // can be any provider, Passport or not
) => {
  const contract = new Contract(
    address,
    ['function isValidSignature(bytes32, bytes) public view returns (bytes4)'],
    new BrowserProvider(zkEvmProvider),
  );

  const isValidSignatureHex = await contract.isValidSignature(digest, signature);
  return isValidSignatureHex === ERC_1271_MAGIC_VALUE;
};
```

**Explanation**: This helper function is used by both EIP-712 and ERC-191 verification to validate signatures on-chain. It uses the ERC-1271 standard interface implemented on Immutable smart contract wallets to verify if a signature is valid for a given message digest. The function returns true if the signature is valid, as indicated by the wallet returning the `ERC_1271_MAGIC_VALUE` constant.

## Running the App

### Prerequisites
- Node.js v16 or later
- pnpm v8 or later
- Immutable Hub account for API keys ([Get started with Immutable Hub](https://hub.immutable.com/))
- A modern web browser

### Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/immutable/ts-immutable-sdk.git
   cd ts-immutable-sdk/examples/passport/wallets-signing-with-nextjs
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the project root by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Immutable API keys to the `.env` file:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

### Using the App

1. Click the "Passport Login" button to connect your wallet through Passport.
2. Once connected, choose either "Sign message with EIP-712" or "Sign message with ERC-191".
3. Click the "Sign Message" button to initiate the signing process.
4. Approve the signature request in the Passport popup.
5. After signing, click "Verify Signature" to validate that the signature is legitimate.
6. Use the "Passport Logout" button to disconnect your wallet when finished.

## Summary

This example app demonstrates how to implement secure message signing and verification using Immutable Passport in a Next.js application. It showcases two different signing standards (EIP-712 and ERC-191) and demonstrates how to verify signatures on-chain using the ERC-1271 standard.

The key takeaways from this example are:
- Passport provides a secure and user-friendly way to handle message signing
- Both structured data (EIP-712) and simple text (ERC-191) messages can be signed
- Signatures can be cryptographically verified on-chain
- Smart contract wallets used by Passport implement the ERC-1271 interface for signature verification

These features provide a foundation for implementing secure, non-custodial authentication, authorizations, and user interactions in your decentralized applications. 