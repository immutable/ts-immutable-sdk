# Immutable Passport Event Handling Example (Next.js)

This example demonstrates how to implement proper event handling with the Immutable Passport SDK in a Next.js application. It covers connecting to Passport, setting up event listeners, handling different types of events, and properly cleaning up listeners when components unmount.

## Features

- Connection state handling and UI updates
- Event listener registration and cleanup
- Support for all standard Passport events:
  - `connect` - Triggered when connection is established
  - `disconnect` - Triggered when disconnected
  - `accountsChanged` - Triggered when the current account changes
  - `chainChanged` - Triggered when the blockchain network changes
- Event logging with UI display
- Comprehensive error handling
- Complete authentication flow with login, callback, and logout

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd examples/passport/event-handling-with-nextjs
```

2. **Install dependencies**

```bash
npm install
```

3. **Set environment variables**

Create a `.env.local` file in the root directory and add your Immutable Hub credentials:

```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key_from_hub
NEXT_PUBLIC_CLIENT_ID=your_client_id_from_hub
```

4. **Run the development server**

```bash
npm run dev
```

5. **Access the application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Implementation Details

### Event Handling

The example demonstrates proper event handling techniques:

```typescript
// Setup event listeners when the component mounts
useEffect(() => {
  // Check if provider exists before setting up event listeners
  if (!passportInstance.provider) {
    console.warn('Provider not available');
    return;
  }

  // Setup event handlers
  const handleConnectEvent = () => {
    setIsConnected(true);
    addEventLog('connect', 'Connected to Passport');
  };

  const handleDisconnectEvent = () => {
    setIsConnected(false);
    setCurrentAccount(null);
    setCurrentChainId(null);
    addEventLog('disconnect', 'Disconnected from Passport');
  };

  // Register event listeners
  try {
    passportInstance.provider.on('connect', handleConnectEvent);
    passportInstance.provider.on('disconnect', handleDisconnectEvent);
    passportInstance.provider.on('accountsChanged', handleAccountsChanged);
    passportInstance.provider.on('chainChanged', handleChainChanged);
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }

  // Critical: Clean up event listeners when component unmounts
  return () => {
    try {
      if (passportInstance.provider) {
        passportInstance.provider.removeListener('connect', handleConnectEvent);
        passportInstance.provider.removeListener('disconnect', handleDisconnectEvent);
        passportInstance.provider.removeListener('accountsChanged', handleAccountsChanged);
        passportInstance.provider.removeListener('chainChanged', handleChainChanged);
      }
    } catch (error) {
      console.error('Error cleaning up event listeners:', error);
    }
  };
}, []);
```

### Best Practices Demonstrated

1. **Safety checks before adding event listeners**
   - Always check if provider exists before adding listeners
   - Use try/catch blocks for error handling

2. **Proper cleanup in `useEffect` return function**
   - Remove all event listeners when component unmounts
   - Check if provider still exists before attempting to remove listeners
   - Use the same handler references for both adding and removing listeners

3. **Handling connection state**
   - Track and display connection state in UI
   - Handle disconnection gracefully

4. **Event logging**
   - Log events with timestamps
   - Display in the UI for user feedback

## Common Issues and Troubleshooting

### "Provider not available" warning
- This occurs when trying to access the provider before it's initialized
- Solution: Add appropriate checks before accessing the provider

### Events not firing
- Verify that you're using the correct event names
- Check that the provider is properly connected
- Ensure event handlers have the correct signature

### Memory leaks
- Always clean up event listeners in the `useEffect` return function
- Use the same handler reference for both adding and removing listeners

## Testing

This example includes comprehensive tests for the event handling functionality:

```bash
npm test
```

## References

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/tools/passport/)
- [Immutable Passport Events Reference](https://docs.immutable.com/docs/zkEVM/tools/passport/events/)
- [Next.js Documentation](https://nextjs.org/docs) 