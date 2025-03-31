# Passport SDK Login with PKCE Example App

This example app demonstrates how to implement login with Passport using the PKCE (Proof Key for Code Exchange) flow in a Next.js application.

This example app runs on Immutable Testnet. To use this code on Immutable zkEVM Mainnet make sure you instantiate the SDK with the Mainnet configuration.

## Getting Started

Install your dependencies:

```bash
pnpm install
```

Copy over the `.env.example` file to `.env` and fill in the required environment variables.

## Required Environment Variables

- NEXT_PUBLIC_PUBLISHABLE_KEY - Replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID - Replace with your client ID from Hub

Run the app locally:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## PKCE Flow

The PKCE flow is an OAuth 2.0 extension that provides additional security for public clients and is recommended for single-page applications or mobile apps. 

This example demonstrates:
1. Initiating the PKCE login flow
2. Handling the callback from Passport
3. Retrieving user information
4. Logging out the user 

## Feature Management

### Adding New Features
To add a new feature implementation to this example app:
1. Run the {feature name} generator prompt
2. Specify the new feature name when prompted
3. The generator will create a new feature implementation at `src/app/{feature name}/page.tsx`
4. Update any navigation components to include the new feature

### Updating Features
To update an existing feature implementation:
1. Run the {feature name} generator prompt
2. Specify the existing feature name to update
3. The generator will update the implementation while preserving app-specific customizations 