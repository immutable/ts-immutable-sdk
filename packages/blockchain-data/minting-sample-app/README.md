## About

This sample app showcases async minting using [Immutable sdk](https://www.npmjs.com/package/@imtbl/sdk) to interact with 
[Immutable Minting API](https://docs.immutable.com/docs/zkEVM/products/minting/minting-api) on Immutable Zkevm.

## Get Started

### pre-requisites

Make sure docker is available on your host.

Follow, [Minting API pre-requisites](https://docs.immutable.com/docs/zkEVM/products/minting/minting-api#minting-api-prerequisites) to get

- your contract address
- secret API key
- publishable key

### Add environment variables
Edit [development.env](./env/development.env) file to include values from above steps.

### Run

#### docker
`docker compose up --build`

All environment variables in [docker-compose.yml](./docker-compose.yml) will override [development.env](./env/development.env)

#### or locally
Without the postgres instance from [docker-compose.yml](./docker-compose.yml), your database needs to be seeded with tables needed for this sample app. Please run [seed.sql](../sdk/src//minting/persistence/pg/seed.sql) first.

Then `npm run dev`

## Architecture
This sample app asynchronously mints asset to hide blockchain latency from end users. It records mint, run a background job to issue these mints and update mint result using webhook.

- `/api/mint` in [server.ts](./src/server.ts) - This endpoint records a mint inside database (sdk method `recordMint`). Please protect this endpoint with your authentication method and go through FIXMEs in the file to make it cater for your use case.
- [index.ts](./src/index.ts) - `submitMintingRequests` function is called inside this file to continuously check for newly recorded mints and send them to Minting API.
- `/api/process_webhook_event` - handle webhook events for issued minting requests.

## persistence
Postgres is the default and currently only supported database at the moment.
The minting sdk exposes an [interface](../sdk/src/minting/persistence/type.ts) for persistence so that other type of databases can be supported in the future. PR welcome.
