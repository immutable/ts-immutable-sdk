# Login with Passport PKCE Example

This example demonstrates how to implement login with Immutable Passport using the PKCE (Proof Key for Code Exchange) flow in a Next.js application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=your-client-id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your-publishable-key
   ```

## Environment Variables

- `NEXT_PUBLIC_CLIENT_ID`: Your client ID from Immutable Hub
- `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your publishable API key from Immutable Hub

## Usage

Run the development server:

```bash
npm run dev
```

Visit http://localhost:3000 to view the example app.

## PKCE Authentication Flow

PKCE (Proof Key for Code Exchange) is an extension to the authorization code flow that provides additional security for public clients that cannot securely store client secrets. This flow:

1. Generates a code verifier and code challenge
2. Sends the code challenge with the authorization request
3. Exchanges the authorization code along with the code verifier for tokens

## Important Notes

- Make sure your application's redirect URIs are properly configured in the Immutable Hub
- The PKCE flow is particularly important for client-side applications where a client secret cannot be securely stored

## Testing

To run end-to-end tests:

```bash
npm run test
```

## Additional Resources

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/users/passport)
- [PKCE Flow Explanation](https://oauth.net/2/pkce/) 