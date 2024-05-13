# Minting API Backend for conducting a free mint

This project is a backend API for doing a free mint on IMX zkEVM.

## Disclaimer

The sample code provided is for reference purposes only and is not officially supported by Immutable. It has undergone best effort testing by Immutable to ensure basic functionality. However, it is essential that you thoroughly test this sample code within your own environment to confirm its functionality and reliability before deploying it in a production setting. Immutable disclaims any liability for any issues that arise due to the use of this sample code. By using this sample code, you agree to perform due diligence in testing and verifying its suitability for your applications.

## Features

- Uses the Immutable Minting API to ensure that minting is sponsored & transaction life cycle monitoring, nonce management etc. is abstracted.
- Accounts for race conditions by locking the DB during minting for a specific address.
- Records all tokens minted in a DB, both during pending & succeeded states. If the server crashes or a large amount of mints are pending, it's counted in the max supply.
- Ability to allowlist addresses for minting and designate a quantity. For example, an address has the right to mint 5 tokens.
- Webhook support for minting events, no need for polling. Also allows for asynchronous updating from a pending to succeeded or failed state.
- Authenticated requests that are verified from both Passport and from IMX for webhooks, both on subscription & notifications.
- Rich logging using Winston for troubleshooting & debugging.
- Define phases that the mint should occur in, with different max supplies, start times, end times, and whether the phase is allowlisted.

## Setup Instructions

1. Install the dependencies:
   ```
   npm i
   ```
2. Copy the example environment file and fill it with your API key, and DB path(should be `file:./allowList.db`):
   ```
   cp .env.example .env
   ```
3. Make sure to configure `src/config.ts` with your collection address after deploying the contract on hub.immutable.com. Pay specific attention to the mintPhases parameter:
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
4. Populate your metadata in `tokens/metadata` with the format of filename being {tokenid} and the metadata format following [this](https://docs.immutable.com/docs/zkEVM/products/minting/metadata/format) format. There's already examples in the folder for a project called copypasta.
5. Run the DB migrations:
   ```
   npx prisma migrate dev
   ```
6. Load your database, https://sqlitebrowser.org/ is great for this. You can also write a script that uses the Prisma client to load the database. Make sure you have your address allowlisted, and quantity is 1, isLocked is 0, hasMinted is 0.

7. Run the development server:

   ```
   npm start
   ```

8. Create your webhook at https://hub.immutable.com/, use localtunnel for testing webhooks locally:

   ```
   npx localtunnel --port 3000
   ```

   Use the above URL for the webhook endpoint with the path `/webhook`. For example: `https://ten-rooms-vanish.loca.lt/webhook`.

## To-Do List

- [ ] Make sure addresses are lowercased before entering DB or when coming out
- [ ] Return a proper response for a tokenID is already minted
- [ ] Return a proper response for not being in certain allowlist phases etc.
- [ ] Account for getting a webhook return with a token that hasn't been entered into the mintedTokens DB but has indeed been minted
- [ ] Consider switching to Pino instead of Winston for logging
- [ ] Troubleshoot why all console.log are not showing up in the console with logger.info
- [ ] Add color coding to success or failure in the logs
- [ ] Generally type more things like the mint requests etc.
- [ ] Consider adding batching functions. This will require ways to batch mint requests together, but also a way of checking a UUID not for a single mint but several.
- [ ] Add ERC1155 support once the minting API is ready
- [ ] Add the ability to choose whether you want mintByQuantity or mintByID

## Tech Stack

- Prisma ORM
- sqlite3
