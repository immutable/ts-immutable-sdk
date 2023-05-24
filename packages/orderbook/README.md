# Orderbook

The SDK for the zkEVM orderbook

## OpenAPI SDK

All content in src/openapi/sdk is generated from order-book-mr in engine. It can be replaced at any time

## Getting Started

### Testing
#### Unit Tests

`yarn test`

#### E2E Tests

The E2E tests are run agains the docker-compose stack that can be spun up from `imx-engine/services/order-book-mr`. They are not run on CI.

1. From `imx-engine/services/order-book-mr`, run `./local/start.sh`
2. Populate a .env file at `ts-immutable-sdk/packages/orderbook/.env` with the following values.
    ```
    ACCOUNT_1=
    ACCOUNT_2=
    LOCAL_RPC_ENDPOINT=
    ORDERBOOK_MR_API_URL=
    SEAPORT_CONTRACT_ADDRESS=
    ZONE_CONTRACT_ADDRESS=
    ```

    * ACCOUNT_1 and ACCOUNT_2 are private keys from the local hardhat container that can be any different key available at the start of the log
    * LOCAL_RPC_ENDPOINT is the hardhat container URL, usually http://0.0.0.0:8545
    * ORDERBOOK_MR_API_URL is the exposed URL from the API container, usually http://127.0.0.1:8070
    * SEAPORT_CONTRACT_ADDRESS and ZONE_CONTRACT_ADDRESS can be read from the output of `./local/start.sh`

3. Run the E2Es with `yarn test:e2e`
