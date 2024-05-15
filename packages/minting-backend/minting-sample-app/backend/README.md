# Minting API Backend for conducting a free mint

This project is a backend API for doing a free mint on IMX zkEVM.

## Disclaimer

The sample code provided is for reference purposes only. It has undergone best effort testing by Immutable to ensure basic functionality. However, it is essential that you thoroughly test this sample code within your own environment to confirm its functionality and reliability before deploying it in a production setting. Immutable disclaims any liability for any issues that arise due to the use of this sample code. By using this sample code, you agree to perform due diligence in testing and verifying its suitability for your applications.

## Features

- Uses the Immutable Minting API to ensure that minting is sponsored on top of transaction life cycle monitoring, nonce management etc. is abstracted.
- Async Minting by 1. store minting intention, 2. submit minting to Immutable Minting API in background, 3. listening to webhook for minting status.
- Passport authentication.
- Define phases that the mint should occur in, start times and end times.
- Ability to allowlist addresses for minting for different phases

## Setup Instructions

1. Install the dependencies:
   ```
   npm i
   ```
2. Copy the example environment file and fill it with your API key, and DB path(should be `file:./allowList.db`):
   ```
   cp .env.example .env
   ```
3. Make sure to configure `src/config.ts` with collection address etc after deploying the contract on hub.immutable.com. Pay specific attention to the mintPhases parameter:
   ```
   mintPhases: [
     {
       name: "Presale",
       startTime: 1629913600,
       endTime: 1629999999,
       maxSupply: 1000,
       enableAllowList: true,
     },
     {
       name: "Public Sale",
       startTime: 1630000000,
       endTime: 1719292800,
       maxSupply: 9000,
       enableAllowList: false,
       maxPerWallet: 2,
     }],
   ```
Keep in mind that you can configure a single phase if you're not planning a phased approach but just a start/end time.
   
This sample app only support the same metadata for all the mints. it is defined in the `metadata` field in the same `src/config.ts` file. Please make amend logic inside `server.ts` for calls to `mintingBackend.recordMint` to give metadata per token.

4. Run the DB migrations:
   ```
   npx prisma migrate dev
   ```

5. Load your database, https://sqlitebrowser.org/ is great for this. You can also write a script that uses the Prisma client to load the database. Make sure you have your address allowlisted, and quantity is 1, isLocked is 0, hasMinted is 0.

6. Run the development server:

   ```
   npm start
   ```

7. Create your webhook at https://hub.immutable.com/, use localtunnel for testing webhooks locally:

   ```
   npx localtunnel --port 3000
   ```

   Use the above URL for the webhook endpoint with the path `/webhook`. For example: `https://ten-rooms-vanish.loca.lt/webhook`.

8. Use Postgresql instead of SQLite
This example uses SQLite as database for its portability and self-contain-ness.
However, ** please do not use SQLite in production ** for its weak support of concurrency.

We recommend using postgres for the persistance. Immutable's sdk provides a postgres persistence for this purpose. You can replace `mintingBackend.mintingPersistencePrismaSqlite` with `mintingBackend.mintingPersistencePg` in the `server.ts` and change prisma schema according to the one provided by our sdk: [Postgres seed.sql](https://github.com/immutable/ts-immutable-sdk/blob/main/packages/minting-backend/sdk/src/minting/persistence/pg/seed.sql).


## To-Do List
- [ ] Add ERC1155 support once the minting API is ready
- [ ] Add the ability to choose whether you want mintByQuantity or mintByID
- [ ] this sample app will be ported over to use postgres in the future.