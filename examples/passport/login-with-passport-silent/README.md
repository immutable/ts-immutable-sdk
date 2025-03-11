# Immutable Passport Silent Authentication Example

This example demonstrates how to implement silent authentication with the Immutable Passport SDK. Silent authentication allows users to be logged in automatically without user interaction by leveraging cached tokens and automatic token refresh.

## Features

- **Silent Login**: Demonstrates using the `useSilentLogin` option to authenticate without user interaction
- **Handling Cached Sessions**: Shows how to check for and utilize cached user sessions
- **Automatic Token Refresh**: Implements manual token refresh to show how tokens are automatically refreshed in the background

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- pnpm package manager

### Installation

1. Clone the repository and navigate to the example directory:
   ```bash
   cd examples/passport/login-with-passport-silent
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file based on `.env.example` and fill in your Passport credentials:
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=your-publishable-key
   NEXT_PUBLIC_CLIENT_ID=your-client-id
   ```

   You can obtain these credentials from the [Immutable Developer Hub](https://hub.immutable.com/).

### Running the Example

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the example in action.

### Testing

Run the tests with:
```bash
pnpm test
```

## How Silent Authentication Works

1. When the user visits the page, the app checks if there's an existing valid session
2. If a session exists, the user is automatically logged in
3. If no session exists or the session is expired but a refresh token is available, the app attempts to silently refresh the token
4. If silent login fails, the user is prompted to log in manually

## Implementation Details

The silent authentication is implemented in the `src/app/silent-auth/page.tsx` file. Key features:

- Uses the `useSilentLogin: true` option when calling `passportInstance.login()`
- Provides fallback to manual login if silent authentication fails
- Demonstrates manual token refresh functionality

## Learn More

For more information about Immutable Passport, check out the [Immutable documentation](https://docs.immutable.com/docs/zkevm/products/passport). 