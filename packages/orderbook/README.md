# Order Book

The SDK for the zkEVM Order Book

## Getting Started

### Configuration

Initializing the SDK can be achieved by specifying the target environment in the constructor:

```
new Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX,
  },
})
```

### Usage

The `*.demo.ts` and `*.e2e.ts` files in the `./test` folder have a number of practical examples of how the SDK is used for placing, fulfilling and cancelling listings.

### Demo Scripts

There are a number a demo scripts. Check the package.json for entries that following this pattern: `yarn run:demo*`. These scripts rely on an `.env` file that specifies the following properties:

```
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

### Testing
#### Unit Tests

`yarn test`

#### E2E Tests

`yarn test:e2e`

The E2E tests rely on the `.env` explained in the demo script section above.

## OpenAPI SDK

All content in src/openapi/sdk is auto-generated.
