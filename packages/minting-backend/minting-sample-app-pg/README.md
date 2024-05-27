## Minting backend sample using PG

This sample app uses Immutable minting backend SDK to manage minting. This repo assumes Postgres as database and fastify as webserver.

## Get Started

### Install dependency

```bash
npm i # with nodejs version >= 20
```

### expose local port for webhook

You can use services like below to expose ports locally.

- https://ngrok.com/
- localtunnel

Please make sure the url with port 3000 exposed is set up in the webhook section in [Immutable Hub](hub.immmutable.com).

### run server

```bash
# Replace the contract address and api key from hub in the command below
COLLECTION_ADDRESS={your_nft_contract_address} IM_API_KEY={your_api_key} npm run dev
```

This will start a fastify server at port 3000.

Make sure to trigger the confirmation event again on webhook page via hub if you have missed it the first time.

### mint

Replace YOUR_WALLET_ADDRESS with your NFT recipient's wallet address. You can get a random eth address from [here](https://vanity-eth.tk/).

```
curl -X POST -H "Content-Type: application/json" -d '{"mintTo": "YOUR_WALLET_ADDRESS"}' http://localhost:3000/mint
```
