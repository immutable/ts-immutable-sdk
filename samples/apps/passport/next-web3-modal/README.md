# Next Web3 Modal

### Pre-requisites

Install dependencies for the sample app

```bash
yarn install
```

### Running the app

**Step 1**

Create a Passport application on Immutable Hub by following [these simple steps](https://docs.immutable.com/docs/zkEVM/products/passport/setup)

**Step 2**

Update `PUBLISHABLE_KEY` and `CLIENT_ID` in `src/app/passport.ts`

```typescript
// Immutable Publishable Key (you will find it in the Immutable Hub in the `API Keys` section)
const PUBLISHABLE_KEY = 'PUBLISHABLE_KEY';
// Hub Publishable Key (you will find it in the `Passport` section)
const CLIENT_ID = 'CLIENT_ID'; 
```

Update `PROJECT_ID` in `src/app/wagmi.ts`

```typescript
// Get projectId at https://cloud.walletconnect.com
export const PROJECT_ID = 'PROJECT_ID'
```

**Step 3**

Run the Web3 Modal sample app in dev mode

```bash
yarn dev
```
