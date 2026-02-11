# Default Auth Test App

Test application for `@imtbl/auth-next-client` and `@imtbl/auth-next-server` with default auth configuration.

## Setup

```bash
# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local

# Run dev server
pnpm dev
```

## Testing

This app tests:
- ✅ Zero-config setup (no clientId or redirectUri required)
- ✅ Auto-detection of clientId (sandbox vs production)
- ✅ Auto-derivation of redirectUri
- ✅ useLogin hook with optional config
- ✅ useLogout hook with optional config
- ✅ Custom config overrides

## URLs

- Home: http://localhost:3000
- Callback: http://localhost:3000/callback
- Auth API: http://localhost:3000/api/auth
