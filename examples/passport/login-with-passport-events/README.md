# Passport SDK - Event Handling Example

This example demonstrates how to implement and handle events with the Immutable Passport SDK in a Next.js application.

## Features

- **Event Monitoring**: Listen to and log various Passport SDK events
- **Login with Passport**: Implement basic login functionality
- **Logout**: Implement logout functionality
- **Event Logging**: Display a real-time log of events occurring during authentication
- **Account Status**: Track and display account information

## Events Demonstrated

This example showcases how to work with the following Passport provider events:

- `connect`: Triggered when a user successfully logs in
- `disconnect`: Triggered when a user logs out
- `accountsChanged`: Triggered when the connected account changes

## Implementation Details

The example uses type assertions to access internal properties of the Passport instance, specifically the provider object that emits events. Events are logged in a table that displays:

- The timestamp of each event
- The type of event
- Any associated data with the event

## Running the Example

1. Clone the repository
2. Navigate to the example directory:
   ```
   cd examples/passport/login-with-passport-events
   ```
3. Install dependencies:
   ```
   pnpm install
   ```
4. Create a `.env.local` file based on `.env.example` and add your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   ```
5. Start the development server:
   ```
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

To run the unit tests for this example:

```
pnpm test
```

## Important Notes

- This example accesses internal provider properties using type assertions, which may change in future SDK versions.
- Proper cleanup of event listeners is implemented in the `useEffect` cleanup function to prevent memory leaks.
- The event logging is limited to the 10 most recent events for performance reasons. 