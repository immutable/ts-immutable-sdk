# Orderbook

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Quick Start Guide](#quick-start-guide)
- [Demo Scripts](#demo-scripts)
- [About](#about)

### Pre-requisites

Install dependencies for the workspace

```bash
yarn install
```

### Quick Start Guide

All commands below need to be run in the context of the `orderbook` package where this README is located. Read more about context [here](../../README.md#context).

Running in `dev` mode:

```bash
yarn dev
```

Building to `./dist` directory with javascript output:

```bash
yarn build
```

Running all orderbook demos (these rely on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
yarn run:demo
```

Running the orderbook expiry demo (this relies on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
yarn run:demo-expiry
```

Running the orderbook order fulfillment demo (this relies on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
yarn run:demo-fulfill
```

Running the orderbook bulk orders fulfillment demo (this relies on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
yarn run:demo-fulfill-bulk
```

Running all tests:

```bash
yarn test
```

Running changed tests in watch mode:

```bash
yarn test:watch
```

Running E2E tests (these rely on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
yarn test:e2e
```

Linting:

```bash
yarn lint
```

Linting and attempting to auto-fix issues:

```bash
yarn lint:fix
```

Typechecking:

```bash
yarn typecheck
```

Generating types from the `./abi/*.json` files to `./src/typechain/types`:

```bash
yarn generate-types
```

### Demo Scripts

The demo scripts and e2e test scripts mentioned above rely on an `.env` file that specifies the following properties:

```bash
ACCOUNT_1=
ACCOUNT_2=
RPC_ENDPOINT=
ORDERBOOK_MR_API_URL=
SEAPORT_CONTRACT_ADDRESS=
ZONE_CONTRACT_ADDRESS=
```

* ACCOUNT_1 and ACCOUNT_2 are private keys for funded accounts to be used in the demo scripts
* RPC_ENDPOINT is the target zkEVM environment's RPC URL
* ORDERBOOK_MR_API_URL is the exposed URL for the API
* SEAPORT_CONTRACT_ADDRESS and ZONE_CONTRACT_ADDRESS depend on the address of the deployed contracts

An example `.env.example` file is provided in the root of the `orderbook` package, where this README is located, that can be used as a baseline for creating the `.env` file.

### About

This package contains the Typescript SDK for the zkEVM Order Book. It is used to interact with the zkEVM Order Book API and provides a number of methods for placing, fulfilling and cancelling listings. The SDK is initialized with a configuration object that specifies the target environment and other necessary parameters.

Initializing the SDK can be achieved by specifying the target environment in the constructor:

```typescript
new Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
})
```

The `*.demo.ts` and `*.e2e.ts` files in the `./test` folder have a number of practical examples of how the SDK is used for placing, fulfilling and cancelling listings and can be used as a point of reference. 

All content in src/openapi/sdk is auto-generated.

[Read more about the orderbook package here](../../README.md#orderbook)
