# Event Handling with Immutable Passport and Next.js

This example demonstrates how to implement and use event handling functionality with the Immutable Passport SDK in a Next.js application.

## Overview

The Immutable Passport SDK provides event handling capabilities that allow developers to respond to various events during the authentication lifecycle and user interactions. This example shows how to:

- Set up event listeners for Passport SDK events
- Handle login and logout events
- Respond to token refresh events
- Manage authentication state changes
- Implement clean-up practices for event listeners

## Setup

### Prerequisites

- Node.js 18 or higher
- pnpm

### Installation

1. Clone the repository and navigate to this example:

```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk/examples/passport/event-handling-with-nextjs
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file based on the `.env.example` file:

```bash
cp .env.example .env.local
```

4. Add your credentials to the `.env.local` file:

```
NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
NEXT_PUBLIC_CLIENT_ID=<your-client-id>
```

You can obtain these credentials from the [Immutable Developer Hub](https://hub.immutable.com).

### Running the Example

Start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application in action.

## Usage

### Event Handling Types

The Passport SDK provides several events that you can listen to:

1. **Authentication Events**
   - `auth.login.success`: Fired when a user successfully logs in
   - `auth.login.error`: Fired when a login attempt fails
   - `auth.logout.success`: Fired when a user successfully logs out
   - `auth.logout.error`: Fired when a logout attempt fails

2. **Token Events**
   - `auth.token.refresh.success`: Fired when tokens are successfully refreshed
   - `auth.token.refresh.error`: Fired when token refresh fails

3. **State Events**
   - `auth.state.change`: Fired when the authentication state changes

### Code Examples

Below are examples of how to use the event handling functionality:

```typescript
import { passportInstance } from '../utils/setupDefault';

// Basic event listener
passportInstance.on('auth.login.success', (data) => {
  console.log('Login successful:', data);
});

// Handling authentication errors
passportInstance.on('auth.login.error', (error) => {
  console.error('Login failed:', error);
});

// Cleaning up event listeners (important for preventing memory leaks)
const loginSuccessHandler = (data) => {
  console.log('Login successful:', data);
};

passportInstance.on('auth.login.success', loginSuccessHandler);

// When no longer needed:
passportInstance.off('auth.login.success', loginSuccessHandler);

// Using once for one-time event handling
passportInstance.once('auth.token.refresh.success', (data) => {
  console.log('Token refreshed once:', data);
});
```

## Event Cleanup Best Practices

It's important to clean up event listeners when they're no longer needed to prevent memory leaks, especially in React components:

1. **Use Component Lifecycle Methods**: Always remove event listeners in `useEffect` cleanup functions:

```typescript
useEffect(() => {
  const loginHandler = (data) => {
    setIsLoggedIn(true);
  };
  
  passportInstance.on('auth.login.success', loginHandler);
  
  // Return cleanup function
  return () => {
    passportInstance.off('auth.login.success', loginHandler);
  };
}, []);
```

2. **Store Handlers in References**: For complex handlers, store them in refs to ensure the same function reference is used:

```typescript
const loginHandlerRef = useRef((data) => {
  setLoginData(data);
});

useEffect(() => {
  passportInstance.on('auth.login.success', loginHandlerRef.current);
  
  return () => {
    passportInstance.off('auth.login.success', loginHandlerRef.current);
  };
}, []);
```

3. **Batch Event Registration**: Register and unregister related events together:

```typescript
useEffect(() => {
  const handlers = {
    loginSuccess: (data) => setIsLoggedIn(true),
    loginError: (error) => setLoginError(error)
  };
  
  passportInstance.on('auth.login.success', handlers.loginSuccess);
  passportInstance.on('auth.login.error', handlers.loginError);
  
  return () => {
    passportInstance.off('auth.login.success', handlers.loginSuccess);
    passportInstance.off('auth.login.error', handlers.loginError);
  };
}, []);
```

## Common Issues and Troubleshooting

- **Event Not Firing**: Ensure the Passport SDK is properly initialized before setting up event listeners.
- **Memory Leaks**: Always clean up event listeners in component unmount phases.
- **Multiple Event Registrations**: Be careful not to register the same event handler multiple times.
- **Event Handler Context**: Use proper binding or arrow functions to maintain the correct `this` context.

## Testing

Run the test suite to verify the event handling implementation:

```bash
pnpm test
```

For test coverage:

```bash
pnpm test:coverage
```

## References

- [Immutable Passport SDK Documentation](https://docs.immutable.com/docs/passport/)
- [Next.js Documentation](https://nextjs.org/docs) 