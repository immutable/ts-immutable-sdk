# IMX to zkEVM Migration Frontend

This React application allows users to migrate their NFTs from Immutable X to Immutable zkEVM. It provides a user-friendly interface to connect wallets, view NFTs, and initiate migrations.

## Features

- **Login with Passport**: Securely connect your wallet using Immutable Passport.
- **View Immutable X Assets**: Display NFTs available for migration from Immutable X.
- **View zkEVM Assets**: Display NFTs on zkEVM, including those migrated from Immutable X.
- **Migrate NFTs**: Initiate a burn on Immutable X and mint the equivalent NFT on zkEVM.

## Prerequisites

- Node.js 20+
- Backend service running (see ../backend/README.md)
- Immutable Hub account with:
  - Client ID for Passport
  - API Key 
  - Publishable Key

## Setup

1. **Install dependencies**:
   At the root of the repo, run the following if you haven't already.
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   Update the following in `.env`:
   ```bash
    NEXT_PUBLIC_IMX_ENV=sandbox
    NEXT_PUBLIC_BURN_ADDRESS=0x0000000000000000000000000000000000000000 # or whatever the burn address is
    NEXT_PUBLIC_PUBLISHABLE_KEY=
    NEXT_PUBLIC_CLIENT_ID=
    NEXT_PUBLIC_API_KEY=
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

## Usage

1. **Connect Wallet**
   - Click "Connect Wallet" to authenticate using Passport
   - Approve the connection request

2. **View Your NFTs**
   - **IMX NFTs**: Shows your available NFTs for migration
   - **zkEVM NFTs**: Shows your NFTs on zkEVM network

3. **Migrate NFTs**
   - Select an NFT from your IMX collection
   - Click "Migrate" to initiate the transfer to the burn address
   - The backend will detect the burn and mint on zkEVM
   - New NFT will appear in the zkEVM tab once minted

## Development

The application uses:
- **Next.js** for the framework
- **Immutable SDK** for blockchain interactions
- **Passport** for wallet connection
- **Biom3** for styling

## Important Notes

- Ensure the backend service is running to handle the migration process
- The burn address is set to 0x0000000000000000000000000000000000000000
- Migration is a one-way process
- Backend must be configured to monitor the correct IMX collection address
