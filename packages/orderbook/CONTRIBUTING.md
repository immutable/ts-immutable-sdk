# Order Book

## Table of Contents

- [Quick Start Guide](#quick-start-guide)
- [Demo Scripts](#demo-scripts)

### Quick Start Guide

All commands below need to be run in the context of the `orderbook` package where this README is located. Read more about context [here](../../README.md#context).

Running all orderbook demos (these rely on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
pnpm run:demo
```

Running the orderbook expiry demo (this relies on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
pnpm run:demo-expiry
```

Running the orderbook order fulfillment demo (this relies on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
pnpm run:demo-fulfill
```

Running the orderbook bulk orders fulfillment demo (this relies on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
pnpm run:demo-fulfill-bulk
```

Running E2E tests (these rely on the `.env` file explained in the [demo script section](#demo-scripts)):

```bash
pnpm test:e2e
```

Generating types from the `./abi/*.json` files to `./src/typechain/types`:

```bash
pnpm generate-types
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

The `*.demo.ts` and `*.e2e.ts` files in the `./test` folder have a number of practical examples of how the SDK is used for placing, fulfilling and cancelling listings and can be used as a point of reference. 

All content in src/openapi/sdk is auto-generated.
