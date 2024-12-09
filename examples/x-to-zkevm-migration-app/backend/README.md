# IMX to zkEVM Migration Backend

A sample backend service that listens for NFT transfers to a burn address on Immutable X and automatically creates mint requests for the same NFTs on Immutable zkEVM.

## Overview

This service:
1. Registers migrations in a migrations table to track the migration process.
2. Listens for transfer events via webhooks from Immutable X
3. When an NFT is transferred to the burn address (0x0000000000000000000000000000000000000000) from a specified collection
4. Creates a mint request for the same NFT on Immutable zkEVM
5. Uses the minting-backend module to handle the minting process

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

1. **Install dependencies:**

At the root of the repo, run the following if you haven't already.
```bash
yarn install
```

2. **Set up environment variables:**

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
1. Make sure you have Docker installed and running.

2. Expose local port:
```bash
docker-compose up --build
```

3. The service will be available at:
```bash
# Expose local port
localhost:3001

# Postgres
localhost:5432
```

## Expose Local Port for Webhooks

You can use services like below to expose ports locally.

- https://ngrok.com/
- localtunnel

Please make sure the url with port 3001 exposed is set up in the webhook section in [Immutable Hub](hub.immmutable.com).

## Webhook Configuration

Configure your webhook endpoint in the [Immutable Hub](https://hub.immutable.com):

1. Navigate to your project's webhook configuration
2. Add webhook endpoint: `http://your-server:3000/webhook`
3. Subscribe to events:
   - `imtbl_x_transfer_created` on the same collection as `IMX_MONITORED_COLLECTION_ADDRESS`
   - `imtbl_zkevm_mint_request_updated` on the same collection as `ZKEVM_COLLECTION_ADDRESS`

## Testing Locally

1. Start the service:
```bash
docker-compose up --build
```

2. Use ngrok or similar to expose your local endpoint:
```bash
ngrok http 3001
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
4. Listens for burn events and verifies corresponding migration in the migrations table before minting.
5. Minting backend handles the actual minting process
6. Updates the migration record when a mint event occurs.

## Database

The service uses PostgreSQL for persistence. Tables are automatically created on startup:
- Uses `im_assets` tables for mint requests
- Includes a `migrations` table to track migration registrations.

## APIs

- **POST /migrations**: API to register a new migration.
- **GET /migrations**: API to retrieve all pending migrations.
