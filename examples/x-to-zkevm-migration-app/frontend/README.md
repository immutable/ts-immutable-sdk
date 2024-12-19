# IMX to zkEVM Migration Frontend

This React application allows users to migrate their NFTs from Immutable X to Immutable zkEVM. It provides a user-friendly interface to connect wallets, view NFTs, and initiate migrations.

## Features

- **Login with Passport or Link for IMX**: Securely connect your wallet using Immutable Passport or Link for Immutable X.
- **Login with Passport for zkEVM**: Connect your wallet using Immutable Passport for zkEVM.
- **Stage Assets for Migration**: Stage your assets before initiating the migration process.
- **Migrate All NFTs**: Click "Migrate All" to burn all staged assets on Immutable X and mint them on zkEVM.

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
   yarn install
   ```

2. **Set up environment variables**:
   Update the following in `.env`:
   ```bash
    NEXT_PUBLIC_IMX_ENV=sandbox
    NEXT_PUBLIC_BURN_ADDRESS=0x0000000000000000000000000000000000000000 # or whatever the burn address is
    NEXT_PUBLIC_PUBLISHABLE_KEY=
    NEXT_PUBLIC_CLIENT_ID=
    NEXT_PUBLIC_API_KEY=
    NEXT_PUBLIC_IMX_COLLECTION_ADDRESS= # Add your IMX collection address
    NEXT_PUBLIC_ZKEVM_COLLECTION_ADDRESS= # Add your zkEVM collection address
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

## Usage

1. **Connect Wallet**
   - Click "Connect Wallet" to authenticate using Link or Passport for IMX
   - Approve the connection request
   - For zkEVM, click "Connect Wallet" to authenticate using Passport only

2. **View Your NFTs**
   - **IMX NFTs**: Shows your available NFTs for migration
   - **zkEVM NFTs**: Shows your NFTs on zkEVM network

3. **Migrate NFTs**
   - Stage your NFTs for migration
   - Click "Migrate All" to initiate the transfer to the burn address
   - The backend will detect the burns and mint on zkEVM
   - New NFTs will appear in the zkEVM tab once minted

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
