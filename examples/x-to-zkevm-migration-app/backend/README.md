# IMX to zkEVM Migration Backend

A sample backend service that listens for NFT transfers to a burn address on Immutable X and automatically creates mint requests for the same NFTs on Immutable zkEVM.

## Overview

This service:
1. Listens for transfer events via webhooks from Immutable X
2. When an NFT is transferred to the burn address (0x0000000000000000000000000000000000000000) from a specified collection
3. Creates a mint request for the same NFT on Immutable zkEVM
4. Uses the minting-backend module to handle the minting process

## Getting Started

### Prerequisites

- NodeJS >= v20
- Docker
- You have ERC721 or ERC1155 deployed
- You have enabled [minting api](https://docs.immutable.com/docs/zkEVM/products/minting/minting-api#minting-api-prerequisites) for your contract.
- Immutable Hub account with:
  - API key
  - Webhook configuration for transfer and mint events

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Update the following variables in `.env`:
```bash
# IMX (L2) configuration
IMX_ENV=sandbox
IMX_API_KEY=your_api_key_here

# Migration configuration
IMX_BURN_ADDRESS=0x0000000000000000000000000000000000000000
IMX_MONITORED_COLLECTION_ADDRESS=your_imx_collection_address
ZKEVM_COLLECTION_ADDRESS=your_zkevm_collection_address
```

### Running with Docker

1. Expose local port:
```bash
docker-compose up --build
```

2. The service will be available at:
```bash
# Expose local port
localhost:3000

# Postgres
localhost:5432
```
## Expose Local Port for Webhooks

You can use services like below to expose ports locally.

- https://ngrok.com/
- localtunnel

Please make sure the url with port 3000 exposed is set up in the webhook section in [Immutable Hub](hub.immmutable.com).

## Webhook Configuration

Configure your webhook endpoint in the [Immutable Hub](https://hub.immutable.com):

1. Navigate to your project's webhook configuration
2. Add webhook endpoint: `http://your-server:3000/webhook`
3. Subscribe to events:
   - `imtbl_x_transfer_created`
   - `imtbl_zkevm_mint_request_updated`

## Testing Locally

1. Start the service:
```bash
docker-compose up --build
```

2. Use ngrok or similar to expose your local endpoint:
```bash
ngrok http 3000
```

3. Update your webhook URL in Immutable Hub to the ngrok URL (e.g. `http://your-server:3000/webhook`)

4. Test a transfer to the burn address from your monitored collection

## Architecture

The service uses:
- Fastify for the web server
- PostgreSQL for persistence via minting-backend
- @imtbl/sdk for Immutable X and zkEVM interactions

### Flow

1. User transfers NFT to burn address on IMX
2. Service receives transfer webhook
3. If transfer matches criteria:
   - Creates mint request for zkEVM
   - Submits mint request via minting backend
4. Minting backend handles the actual minting process
5. Service receives mint status updates via webhook

## Database

The service uses PostgreSQL for persistence. Tables are automatically created on startup:
- Uses minting-backend tables for mint requests
- Automatically applies migrations
