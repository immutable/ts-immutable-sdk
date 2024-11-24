# Immutable X to zkEVM NFT Migration App

A sample application demonstrating how to migrate NFTs from Immutable X to Immutable zkEVM. The app consists of a frontend for users to initiate migrations and a backend service that handles the migration process.

**Important Note:** This application is for demonstration purposes only and is not intended for production use. It is essential to consider the idempotency of handling burn events to ensure that duplicate events do not result in unintended consequences. Additionally, implementing backend data models to track migrations is crucial to prevent them from being forgotten in case webhooks fail to process due to any reason.

## Overview

This application demonstrates:
1. How to transfer (burn) NFTs on Immutable X
2. How to listen for transfer events via webhooks
3. How to mint equivalent NFTs on Immutable zkEVM

### Flow
1. User connects their wallet on the frontend
2. User selects an NFT from the monitored collection to migrate
3. Frontend initiates a transfer to the burn address (0x0000000000000000000000000000000000000000)
4. Backend receives the transfer webhook
5. Backend creates and submits a mint request for an equivalent NFT on zkEVM
6. User receives their new NFT on zkEVM

## Prerequisites

- NodeJS >= v20
- Docker
- An Immutable X collection for testing
- A deployed zkEVM collection for minting
- Enabled [minting api](https://docs.immutable.com/docs/zkEVM/products/minting/minting-api#minting-api-prerequisites) for your zkEVM contract
- Immutable Hub account with:
  - API key
  - Webhook configuration for transfer and mint events

## Project Structure

```
x-to-zkevm-migration-app/
├── backend/           # Webhook listener and minting service
│   └── README.md     # Backend setup instructions
└── frontend/         # User interface for migration
    └── README.md     # Frontend setup instructions
```

## Getting Started

1. Set up the backend:
```bash
cd backend
# Follow instructions in backend/README.md
```

2. Set up the frontend:
```bash
cd frontend
# Follow instructions in frontend/README.md
```

3. Configure your collections:
   - Set up your Immutable X collection address in both frontend and backend
   - Set up your zkEVM collection address in the backend
   - Configure webhooks in Immutable Hub to point to your backend

## Testing

1. Start both frontend and backend services
2. Connect your wallet on the frontend
3. Select an NFT from your Immutable X collection
4. Initiate the migration (this will transfer the NFT to the burn address)
5. Backend will automatically handle the minting on zkEVM
6. Check your wallet for the new NFT on zkEVM (it should show in your zkEVM assets section of the UI)

## Development

- Backend: Fastify + PostgreSQL
- Frontend: React + Immutable SDK
- Uses minting-backend module for zkEVM minting

## Environment Setup

Each service (frontend and backend) has its own environment configuration. See their respective README files for details.

## Architecture

```
User
 │
 ├─► Frontend (React)
 │    │
 │    └─► Passport SDK ──► Transfer to Burn Address
 │
 └─► Backend (Fastify)
      │
      ├─► Webhook Handler
      │    └─► Transfer Event Detection
      │
      └─► Minting Backend
           └─► zkEVM Mint Request
```
