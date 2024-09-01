# Next Rainbow Kit

### Pre-requisites

Install dependencies for the sample app

```bash
yarn install
```

### Running the app

**Step 1**

Create a Passport application on Immutable Hub by following [these simple steps](https://docs.immutable.com/docs/zkEVM/products/passport/setup)

**Step 2**

Copy `.env.example` to `.env` and set the `NEXT_PUBLIC_PASSPORT_CLIENT_ID` and `NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY`

```sh
# Passport Client ID (you will find it in the Immutable Hub in the `Passport` section of your project)
NEXT_PUBLIC_PASSPORT_CLIENT_ID=PASSPORT_CLIENT_ID

# Immutable Publishable Key (you will find it in the Immutable Hub in the `API Keys` section of your project)
NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY=IMMUTABLE_PUBLISHABLE_KEY
```

**Step 3**

Run the Rainbow Kit sample app in dev mode

```bash
yarn dev
```
