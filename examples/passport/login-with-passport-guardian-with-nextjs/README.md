# Login with Passport Guardian Example

This example demonstrates how to implement authentication with Immutable Passport Guardian using Next.js.

## Overview

Guardian is a secure authentication method provided by Immutable Passport that allows users to authenticate using their preferred method. This example shows the basic setup and implementation of Guardian authentication.

## Prerequisites

- Node.js 18.x or later
- pnpm (required for installation)

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/immutable/ts-immutable-sdk.git
cd ts-immutable-sdk
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Immutable Hub Client ID and Publishable Key

```
NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_CLIENT_ID=your_client_id
```

4. Run the development server:
```bash
pnpm dev
```

5. Navigate to http://localhost:3000 to see the example app

## Implementation Details

This example will demonstrate:
- Setting up Passport with Guardian authentication
- Implementing the login flow 
- Handling authentication redirects
- Managing user logout

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

### Protecting Manual Edits
If you've made manual edits to a feature implementation that you want to protect:
1. Add the comment `/* MANUALLY EDITED - DO NOT OVERWRITE */` at the top of the file
2. The generator will alert you before overwriting manually edited files

## Common Issues and Troubleshooting

- **Redirect URI mismatch**: Ensure that your redirect URI in Immutable Hub matches the one in your configuration (default: http://localhost:3000/redirect)
- **Invalid client credentials**: Verify your Client ID and Publishable Key are correct
- **Logout issues**: Check that your logout redirect URI is properly configured in Hub

## Clean Up

To properly clean up Passport Guardian authentication:
1. Call `passport.logout()` to remove tokens and session data
2. Redirect users to a logout confirmation page

## References

- [Immutable Passport Documentation](https://docs.immutable.com/docs/zkEVM/products/passport)
- [Next.js Documentation](https://nextjs.org/docs) 