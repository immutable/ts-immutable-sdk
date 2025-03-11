# Guardian Integration Example App for Immutable Passport

This example app demonstrates how to use the Guardian client features with Immutable Passport SDK.

## Features

This example showcases:

1. **Guardian Transaction Evaluation** - Demonstrates how the Guardian client evaluates transactions for security before they are processed.
2. **Guardian Message Signing** - Shows how Guardian evaluates message signing requests for security.
3. **Authentication Flow** - Implements a standard Passport authentication flow with redirect handling.
4. **Logout Functionality** - Provides a clean logout experience.

## What is Guardian?

Guardian is a security component within the Immutable Passport SDK that provides:

- Transaction evaluation to protect users from malicious or suspicious transactions
- Message signing evaluation to protect users from potential signature exploits
- Confirmation screens for additional security when needed
- Security features to protect user assets and identity

## Prerequisites

- Node.js 16+
- pnpm

## Setup

1. Clone the repository
2. Create a `.env.local` file based on `.env.example` and fill in your Passport credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=<your-client-id>
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Home Page**: Navigate to the home page to see available Guardian features.

2. **Transaction Evaluation**:
   - Connect your Passport wallet
   - Send a test transaction to see Guardian evaluation in action
   - Watch the transaction flow through Guardian's security evaluation

3. **Message Signing**:
   - Connect your Passport wallet
   - Enter a message to sign
   - Guardian will evaluate the message signing request
   - View the resulting signature

4. **Logout**:
   - Use the logout button to end your session

## Running Tests

```bash
pnpm test
```

## Implementation Details

The example demonstrates:

1. How the Guardian client is automatically initialized with Passport
2. How Guardian evaluates transactions behind the scenes
3. How Guardian evaluates message signing requests
4. Security measures implemented through Guardian

## Resources

- [Immutable Developer Documentation](https://docs.immutable.com)
- [Passport SDK Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [Biom3 React Components](https://docs.immutable.com/docs/zkEVM/products/passport/identity-sdk/auth) 