# Login with Passport PKCE Example (Next.js)

This example demonstrates how to implement the Proof Key for Code Exchange (PKCE) login flow with the Immutable Passport SDK in a Next.js application.

## What is PKCE?

PKCE (pronounced "pixy") is an extension to the OAuth authorization code flow that provides additional security for public clients such as single-page applications. It helps protect against authorization code interception attacks by adding an additional layer of security.

### How PKCE Works

1. **Code Verifier Generation**: The client creates a cryptographically random string known as the "code verifier"
2. **Code Challenge Creation**: The client derives a "code challenge" from the code verifier using SHA-256 hashing
3. **Authorization Request**: The client includes the code challenge in the authorization request
4. **Authorization Response**: The server returns an authorization code as usual
5. **Token Exchange**: When exchanging the authorization code for tokens, the client includes the original code verifier (not the challenge)
6. **Verification**: The server derives the challenge from the verifier and compares it to the original challenge to validate the request

## Features

- Secure authentication with PKCE flow
- User profile information retrieval
- Logout functionality
- Proper token management

## Setup

1. Install dependencies:
   ```
   pnpm install
   ```

2. Copy `.env.example` to `.env` and configure the following variables:
   ```
   NEXT_PUBLIC_CLIENT_ID=your-client-id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your-publishable-key
   ```

3. Run the development server:
   ```
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `NEXT_PUBLIC_CLIENT_ID`: Your Immutable Passport Client ID from Hub
- `NEXT_PUBLIC_PUBLISHABLE_KEY`: Your Immutable Passport Publishable Key from Hub

## Implementation Details

In current versions of the Immutable Passport SDK, PKCE is enabled by default for all web applications for enhanced security. No additional configuration is required.

The standard Passport configuration will automatically handle the PKCE flow:

```typescript
export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  redirectUri: 'http://localhost:3000/redirect',
  logoutRedirectUri: 'http://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});
```

The SDK automatically handles:
- Generating a secure code verifier
- Creating the code challenge using SHA-256
- Including the challenge in the authorization request
- Storing the verifier for token exchange
- Using the verifier during the token exchange in `loginCallback()`

## Important Files

- `src/app/utils/setupDefault.ts`: SDK initialization with PKCE enabled
- `src/app/login-with-passport-pkce/page.tsx`: PKCE login implementation
- `src/app/redirect/page.tsx`: Authentication callback handler
- `src/app/logout/page.tsx`: Logout implementation

## Best Practices

- Always clean up authentication tokens during logout
- Implement proper error handling for all login and authentication operations
- Use secure storage for tokens
- Handle redirect properly after authentication
- Never store or expose the code verifier in URLs or logs

## Troubleshooting

- If you encounter CORS errors, make sure you've added the correct redirect URLs in the Immutable Hub console
- Check that your client ID and publishable key are correct
- Ensure your application is registered with the correct redirect URIs in the Immutable Hub
- If authentication fails during token exchange, verify that the code verifier is being preserved between requests

## References

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [PKCE OAuth Extension](https://oauth.net/2/pkce/)
- [RFC 7636: PKCE](https://tools.ietf.org/html/rfc7636)
- [Next.js Documentation](https://nextjs.org/docs)

## Testing

This example includes comprehensive end-to-end tests using Playwright to verify the PKCE authentication workflow. The tests cover:

1. Basic page rendering and navigation
2. UI component verification
3. PKCE-specific information display
4. Redirect and logout page functionality

### Running Tests

To run the tests:

```bash
# Install dependencies first
pnpm install

# Start the development server (in a separate terminal)
pnpm dev

# Run the tests
pnpm test
```

For detailed manual testing instructions, see [MANUAL_TESTING.md](./MANUAL_TESTING.md)

For validation documentation and test coverage information, see [VALIDATION.md](./VALIDATION.md)

### Coverage Reports

To generate a test coverage report:

```bash
pnpm test:coverage
```

This will generate HTML, text, and lcov coverage reports to help identify any untested areas of the codebase.

### Test Structure

- `tests/login-pkce.spec.js`: Main test file for PKCE login functionality
- `tests/coverage-helper.js`: Helper file to ensure all relevant files are included in coverage reports

### Manual Testing Checklist

When manually testing the PKCE login flow, verify the following:

1. **Home Page**
   - Page loads correctly with title and description
   - Login button is visible and clickable
   - PKCE information is properly displayed

2. **Login Page**
   - Login page displays correctly with proper title
   - Login button functions properly
   - Navigation back to home works as expected

3. **Authentication Process**
   - Login initiates the PKCE flow
   - Redirect page displays correctly during authentication
   - Token exchange completes successfully
   - User information is displayed after successful login

4. **Logout Process**
   - Logout button triggers proper logout flow
   - Tokens are properly cleared
   - Logout page displays correctly
   - Navigation from logout page works as expected 