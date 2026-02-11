# Passport Wallets with Next JS

To run this example you can 

```
cd examples/passport/wallets-connect-with-nextjs
pnpm install
pnpm dev
```

browse to `http://localhost:3000` to see the full list of examples.

## Examples

1. **Connect with EIP-1193** - Standard Ethereum provider
2. **Connect with EtherJS** - Using ethers.js library
3. **Connect with Wagmi** - Using wagmi library
4. **🆕 Connect with Auth-Next (Default Auth)** - Zero-config auth with `@imtbl/auth-next-client` + `@imtbl/wallet`

## Required Environment Variables

### For Passport SDK Examples (EIP-1193, EtherJS, Wagmi)
- NEXT_PUBLIC_PUBLISHABLE_KEY // replace with your publishable API key from Hub
- NEXT_PUBLIC_CLIENT_ID // replace with your client ID from Hub

### For Auth-Next Example (Default Auth)
- AUTH_SECRET // required for NextAuth.js (min 32 characters)
- No other variables needed! ClientId and redirectUri are auto-detected.

## Auth-Next Default Auth

The `/connect-with-auth-next` route demonstrates:
- Zero-config authentication using `@imtbl/auth-next-client` and `@imtbl/auth-next-server`
- Integration with `@imtbl/wallet` using the `getUser` function from `useImmutableSession()`
- Auto-detection of clientId (sandbox vs production based on hostname)
- Auto-derivation of redirectUri (from `window.location.origin`)
- Full wallet connection flow without manual configuration