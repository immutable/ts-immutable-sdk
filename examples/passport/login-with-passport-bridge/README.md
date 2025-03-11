# Cross-SDK Bridge Example for Immutable Passport

This example demonstrates how to use the Cross-SDK Bridge feature of Immutable Passport, which enables data persistence across different SDK instances.

## Features

- **Cross-SDK Bridge Implementation**: Shows how to enable and configure the Cross-SDK Bridge feature
- **IndexedDB Integration**: Demonstrates how Passport uses IndexedDB for data storage
- **Data Persistence**: Shows how authentication state and user data persists across different SDK instances
- **Multiple IndexedDB Instances**: Demonstrates communication between different IndexedDB instances

## Setup Instructions

1. Configure your environment variables in `.env` (copy from `.env.example`):
   ```
   NEXT_PUBLIC_PUBLISHABLE_KEY=<your-publishable-key>
   NEXT_PUBLIC_CLIENT_ID=<your-client-id>
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Run the development server:
   ```
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How the Cross-SDK Bridge Works

The Cross-SDK Bridge feature is enabled by setting `crossSdkBridgeEnabled: true` in the Passport configuration. This instructs Passport to:

1. Use IndexedDB (via localforage) for storage instead of localStorage
2. Maintain data persistence across different SDK instances
3. Enable a more reliable storage mechanism for shared environments

This is particularly useful for:
- Applications that need to maintain state across multiple SDK instances
- Cross-domain applications where data sharing is required
- Integration with other systems that need access to the same authentication data

## Testing

Run the unit tests with:

```
pnpm test
```

## Implementation Details

The key implementation aspects of this example include:

- Setting `crossSdkBridgeEnabled: true` in the Passport configuration
- Using localforage to interact with the IndexedDB storage
- Creating multiple IndexedDB instances to demonstrate cross-instance data access
- Managing authentication state persistence across page reloads

## Code Structure

- `src/app/utils/setupDefault.ts` - Passport SDK configuration with Cross-SDK Bridge enabled
- `src/app/login-with-bridge/page.tsx` - Main implementation of the Cross-SDK Bridge feature
- `src/app/redirect/page.tsx` - Handles the OAuth redirect after login
- `src/app/logout/page.tsx` - Handles logout functionality 