# Immutable Marketplace Sample

This is a full-featured NFT marketplace sample application built with the Immutable SDK. It demonstrates how to build a marketplace where users can buy and sell NFTs using the Immutable Orderbook SDK.

## Features

- **Authentication**: Connect with Immutable Passport for secure authentication
- **Browse Listings**: View all active NFT listings with filtering and sorting options
- **Search**: Find NFTs by name, token ID, or contract address
- **Purchase NFTs**: Buy NFTs directly from the marketplace
- **Create Listings**: Sell your own NFTs by creating new listings
- **Manage Listings**: View and cancel your active listings

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- An Immutable Passport client ID (get one from [Immutable Developer Hub](https://hub.immutable.com))

### Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```

2. Update the `.env` file with your Immutable Passport credentials:
   ```
   NEXT_PUBLIC_CLIENT_ID=your_client_id
   NEXT_PUBLIC_PUBLISHABLE_KEY=your_publishable_key
   ```

### Installation

1. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000/marketplace](http://localhost:3000/marketplace) in your browser to see the marketplace.

## Usage Guide

### Buying NFTs

1. Browse the marketplace listings on the "Buy NFTs" tab
2. Use filters and search to find specific NFTs
3. Click "Purchase" on any NFT you want to buy
4. Confirm the transaction in your wallet

### Selling NFTs

1. Navigate to the "Sell NFTs" tab
2. Connect your wallet if not already connected
3. Select an NFT from your collection
4. Set a price in ETH
5. Click "Create Listing" to list your NFT for sale

### Managing Your Listings

1. Go to the "My Listings" tab to see all your active listings
2. Cancel any listing by clicking the "Cancel Listing" button

## Architecture

This application uses:

- **Next.js**: For the frontend framework
- **Immutable SDK**: For blockchain interactions
  - `@imtbl/orderbook`: For marketplace functionality
  - `@imtbl/passport`: For authentication
- **Tailwind CSS**: For styling
- **Biom3 React**: For UI components

## Customization

### Changing the Environment

By default, the app connects to the Immutable Sandbox environment. To switch to production:

1. Update the environment in `src/app/utils/setupOrderbook.ts`:
   ```typescript
   environment: Environment.PRODUCTION,
   ```

2. Update the environment in `src/app/utils/setupDefault.ts`:
   ```typescript
   environment: config.Environment.PRODUCTION,
   ```

### Styling

The app uses Tailwind CSS for styling. You can customize the look and feel by modifying:

- `tailwind.config.js`: For theme configuration
- CSS classes in the component files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

- [Immutable Developer Documentation](https://docs.immutable.com/)
- [Immutable SDK Reference](https://docs.immutable.com/docs/zkEVM/sdks/typescript)
- [Next.js Documentation](https://nextjs.org/docs)