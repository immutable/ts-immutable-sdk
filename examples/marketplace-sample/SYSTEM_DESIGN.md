# NFT Marketplace System Design

## Overview

This marketplace will allow users to:
- Browse and search NFTs in different markets
- View their own collections in a dashboard
- Sell their NFTs
- Buy NFTs at market price
- Place bids on NFTs (lower than market price)
- Manage fees for makers and takers

## System Architecture

### Frontend (Next.js with React)
- **Pages**
  - Home/Landing Page
  - Marketplace (NFT listings by market)
  - User Dashboard (collections, purchased items, sold items)
  - NFT Detail Page (view single NFT with buy/bid options)
  - Sell Page (create listings)
  - Profile Page (user info, wallet balance)

- **Components**
  - Navbar and Authentication
  - NFT Card Component
  - NFT Grid/List Views
  - Filter and Search Components
  - Buy/Bid Modal
  - Listing Creator
  - Collection Viewer

### Backend Services
The system will primarily use the Immutable SDK directly from the frontend:
- **Passport** for user authentication and wallet connection
- **Orderbook** for listing creation, order management, bids and fulfillment
- **Blockchain Data** for retrieving NFT information and history

No separate backend is required as the SDK provides all necessary functionality directly.

### Database
No separate database needed - the data is stored on-chain and accessed through the SDK.

## User Flows

### Authentication Flow
1. User connects wallet through Passport
2. App retrieves and stores user's address
3. User can then access protected features (buying, selling, dashboard)

### Browsing Flow
1. User lands on marketplace page
2. User can filter NFTs by collection, price, etc.
3. User can search for specific NFTs
4. User can click on an NFT to view details

### Buying Flow
1. User views NFT details
2. User selects "Buy Now" option
3. Confirmation modal appears with price details (including fees)
4. User confirms transaction
5. Transaction is processed through Orderbook
6. User receives NFT in their wallet

### Bidding Flow
1. User views NFT details
2. User selects "Place Bid" option
3. User enters bid amount (lower than asking price)
4. Confirmation modal shows bid details (including fees)
5. User confirms bid
6. Bid is placed through Orderbook
7. Seller can accept or reject bid

### Selling Flow
1. User goes to Dashboard or Sell page
2. User selects NFT from their collection
3. User sets price and duration
4. User confirms listing
5. Listing is created through Orderbook
6. NFT appears in marketplace

## Fee Structure

### Maker Fees
- Applied to sellers who create listings
- Percentage-based fee calculated on the sale price
- Configurable by platform admin

### Taker Fees
- Applied to buyers who fulfill orders
- Percentage-based fee calculated on the purchase price
- Configurable by platform admin

### Royalty Fees
- Automatically calculated and distributed to original creators
- Managed by the Orderbook SDK

## Technical Implementation Details

### Authentication
- Use Passport for wallet connection and authentication
- Store user state in React context for global access

### Order Management
- Use Orderbook SDK for all order operations:
  - Creating listings (sell orders)
  - Placing bids (buy orders)
  - Fulfilling orders
  - Cancelling orders

### NFT Data Retrieval
- Use Blockchain Data SDK for retrieving user's NFTs and collection data
- Implement pagination for efficient data loading

### UI Components
- Use both Biom3/React components and custom Tailwind components
- Implement responsive design for all screen sizes
- Use black and white theme with accents

## Future Enhancements
- Implementation of collections with bulk buying/selling
- Activity feed showing recent sales and price history
- Notifications for bid acceptances, sales, etc.
- Advanced analytics for sellers
- Social features and sharing options 