# Passport Event Handling Example

This example demonstrates how to implement event handling with the Immutable Passport SDK in a Next.js application. It shows how to properly set up and manage event listeners for various Passport events, including connection status changes, account changes, and network changes.

## Features

- Connection status monitoring
- Account changes detection
- Network changes detection
- Event logging interface
- Proper cleanup of event listeners
- TypeScript implementation
- Unit tests

## Events Demonstrated

- `connect`: Triggered when successfully connecting to a wallet
- `disconnect`: Triggered when disconnecting from a wallet
- `accountsChanged`: Triggered when the user switches accounts
- `chainChanged`: Triggered when the user switches networks

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file based on `.env.example` and add your configuration:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Running Tests

To run the unit tests:

```bash
pnpm test
```

## Implementation Details

The example demonstrates best practices for:
- Setting up event listeners using React's useEffect hook
- Proper cleanup of event listeners to prevent memory leaks
- Type-safe event handling
- Error handling for connection operations
- UI feedback for various wallet events

## Important Notes

- Event listeners are set up only when the provider is available
- All event listeners are properly cleaned up on component unmount
- The example uses standard HTML heading tags instead of Biom3's Text component
- Error handling is implemented for both connection and disconnection operations
- The UI provides clear feedback for all wallet events 