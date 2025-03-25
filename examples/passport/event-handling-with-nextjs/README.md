# Immutable Passport Event Handling Example

This example demonstrates how to handle various events from the Immutable Passport SDK in a Next.js application. Learn how to properly set up event listeners, respond to different event types, and maintain proper cleanup.

## Features

- Real-time event monitoring for Passport provider events
- Complete event lifecycle management (setup and cleanup)
- Responsive UI that displays event information
- Chain switching functionality demonstration
- Comprehensive error handling

## Events Demonstrated

- `connect`: Triggered when the provider connects to the network
- `disconnect`: Triggered when the provider disconnects
- `accountsChanged`: Triggered when the user switches accounts or permissions change
- `chainChanged`: Triggered when the user switches networks
- `message`: Triggered when the provider receives a message

## Prerequisites

Before running this example, you'll need:

1. Node.js (v18 or higher)
2. An Immutable Hub account with:
   - A registered application with Client ID
   - A publishable API key

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

Replace the placeholder values with your actual credentials from Immutable Hub.

## Installation

Install the dependencies:

```bash
pnpm install
```

## Running the Example

Start the development server:

```bash
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage Instructions

1. **Connect Your Wallet**:
   - Click "Connect with Passport" to initiate authentication
   - Approve the connection in the Passport popup

2. **Observe Events**:
   - After connecting, the "Event History" section will display real-time events
   - Each event shows a timestamp and relevant data

3. **Trigger Events**:
   - Use "Switch Chain" to toggle between chains (triggers chainChanged event)
   - Disconnect to trigger the disconnect event
   - Switch accounts in Passport to trigger accountsChanged event

4. **Error Handling**:
   - Try various error scenarios to see how the app handles them
   - Error messages are displayed prominently for user feedback

## Project Structure

- `/src/app/page.tsx` - Main landing page
- `/src/app/event-handling/page.tsx` - Core event handling implementation
- `/src/app/redirect/page.tsx` - OAuth2 redirect handler
- `/src/app/logout/page.tsx` - Logout functionality
- `/src/app/utils/setupDefault.ts` - Passport SDK initialization
- `/src/app/utils/wrapper.tsx` - App context wrapper
- `/src/app/tests/unit/passport.test.js` - Unit tests

## Best Practices Demonstrated

### Event Listener Setup

```typescript
// Add event listeners
provider.on('connect', handleConnect);
provider.on('disconnect', handleDisconnect);
provider.on('accountsChanged', handleAccountsChanged);
provider.on('chainChanged', handleChainChanged);
provider.on('message', handleMessage);
```

### Proper Cleanup

```typescript
// Cleanup function to remove event listeners
return () => {
  provider.removeListener('connect', handleConnect);
  provider.removeListener('disconnect', handleDisconnect);
  provider.removeListener('accountsChanged', handleAccountsChanged);
  provider.removeListener('chainChanged', handleChainChanged);
  provider.removeListener('message', handleMessage);
};
```

### Error Handling

```typescript
try {
  // SDK operations here
} catch (error) {
  console.error('Error:', error);
  setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
}
```

## Common Issues and Troubleshooting

- **Provider Not Available**: If the Passport provider is not available, ensure you've correctly initialized the SDK in `setupDefault.ts`.
- **Event Listeners Not Working**: Make sure you're adding listeners after confirming the provider exists.
- **Authentication Issues**: Verify your Client ID and redirect URIs in the Immutable Hub dashboard.
- **Chain Switching Errors**: Some networks might not be supported by the user's wallet.

## Additional Resources

- [Immutable SDK Documentation](https://docs.immutable.com/docs/zkEVM/sdks)
- [Immutable Passport Guide](https://docs.immutable.com/docs/zkEVM/products/passport)
- [EIP-1193 Provider Events](https://eips.ethereum.org/EIPS/eip-1193)

## Testing

Run the tests with:

```bash
pnpm run test
```

The test suite covers all major components and event handling functionality. 