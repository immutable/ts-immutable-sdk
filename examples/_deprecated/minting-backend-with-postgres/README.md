## Minting backend sample using PG

This sample app uses Immutable minting backend SDK to manage minting. This repo assumes Postgres as database and fastify as webserver.

## Get Started

### pre-requisites
- NodeJS >= v20
- Docker
- You have ERC721 or ERC1155 deployed
- You have enabled [minting api](https://docs.immutable.com/docs/zkEVM/products/minting/minting-api#minting-api-prerequisites) for your contract.

### Install dependency

```bash
npm i
```

### expose local port for webhook

You can use services like below to expose ports locally.

- https://ngrok.com/
- localtunnel

Please make sure the url with port 3000 exposed is set up in the webhook section in [Immutable Hub](hub.immmutable.com).

### Set environment variables
Set `COLLECTION_ADDRESS` and `IM_API_KEY` in the `./.env` file.

### Run the app

```bash
docker compose up --build
```

This will start a fastify server at port 3000 and postgres container.

Make sure to trigger the confirmation event again on webhook page via hub if you have missed it the first time.

### Mint

Replace `YOUR_WALLET_ADDRESS` with your NFT recipient's wallet address in the below command. You can get a random eth address from [here](https://vanity-eth.tk/).

```
curl -X POST -H "Content-Type: application/json" -d '{"mintTo": "YOUR_WALLET_ADDRESS"}' http://localhost:3000/mint
```
