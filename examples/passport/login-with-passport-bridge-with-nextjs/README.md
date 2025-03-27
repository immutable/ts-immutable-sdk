# Passport SDK Login with Passport Bridge Example App

This example app demonstrates how to use the Passport Bridge feature of the Immutable Passport SDK for authentication in a Next.js application. The Passport Bridge facilitates secure authentication between your application and the Immutable platform.

This example app runs on Immutable Testnet. To use this code on Immutable zkEVM Mainnet, make sure you instantiate the SDK with the Mainnet configuration.

## Getting Started

Install your dependencies:

```bash
pnpm install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- `NEXT_PUBLIC_PUBLISHABLE_KEY` - Your publishable API key from Hub
- `NEXT_PUBLIC_CLIENT_ID` - Your client ID from Hub

## Running the App

Run the app locally:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the example app.

## Building for Production

Build the application:

```bash
pnpm build
```

## Running Tests

Execute the end-to-end tests:

```bash
pnpm test
```

For test coverage:

```bash
pnpm test:coverage
```

## Passport Bridge Authentication

The Passport Bridge feature provides a streamlined authentication flow:

1. Initialize the Passport SDK with appropriate configuration
2. Trigger the login flow with Passport Bridge
3. Handle the authentication callback
4. Access user identity information and wallet details
5. Implement proper logout functionality

For more information, refer to the [official Immutable documentation](https://docs.immutable.com).

## Common Issues and Troubleshooting

- Ensure your client ID and publishable key are correctly set in the environment variables
- Verify that your redirect URIs are properly configured in the Hub dashboard
- Check browser console for any error messages during the authentication flow
- Make sure your application's domain matches the ones registered in the Hub dashboard

## Cleanup Best Practices

When implementing the Passport Bridge in your own application:

- Always handle authentication errors gracefully
- Provide clear feedback to users during the authentication process
- Implement proper token cleanup during logout
- Use optional chaining when accessing potentially undefined properties
- Wrap authentication setup and teardown in try/catch blocks 