/**
 * Marketplace Configuration
 * 
 * This file contains configuration settings for the NFT marketplace,
 * including fee structures, supported chains, and other marketplace parameters.
 */

// Marketplace fee recipient address (replace with your actual fee recipient address)
export const FEE_RECIPIENT_ADDRESS = '0xFeeRecipientAddress';

// Fee structure
export const FEES = {
  // Maker fees are paid by sellers when their NFT is sold
  MAKER: {
    PERCENTAGE: 2.5, // 2.5% fee for sellers
  },
  
  // Taker fees are paid by buyers when they purchase an NFT
  TAKER: {
    PERCENTAGE: 1.0, // 1.0% fee for buyers
  }
};

// Supported blockchain networks
export const SUPPORTED_CHAINS = {
  DEFAULT: 'imtbl-zkevm-testnet',
  ETHEREUM: 'ethereum',
  IMTBL_ZKEVM: 'imtbl-zkevm',
  IMTBL_ZKEVM_TESTNET: 'imtbl-zkevm-testnet'
};

// Default order expiry time (30 days in milliseconds)
export const DEFAULT_ORDER_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

// Marketplace display settings
export const DISPLAY_SETTINGS = {
  ITEMS_PER_PAGE: 20,
  MAX_DESCRIPTION_LENGTH: 150,
  DEFAULT_IMAGE: '/placeholder-nft.png'
};

// NFT types supported by the marketplace
export const SUPPORTED_NFT_TYPES = ['ERC721', 'ERC1155'];

// Default currency for the marketplace (ETH)
export const DEFAULT_CURRENCY = {
  TYPE: 'ERC20',
  CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000', // ETH address
  SYMBOL: 'ETH',
  DECIMALS: 18
};

// Fee configuration
export const FEE_CONFIG = {
  MARKETPLACE_FEE_PERCENTAGE: 2.5, // 2.5% marketplace fee
  CREATOR_ROYALTY_PERCENTAGE: 5.0, // 5% creator royalty
  GAS_ESTIMATE_ETH: 0.001 // Estimated gas cost in ETH
};

// Function to calculate maker fee amount
export const calculateMakerFee = (price: string): string => {
  const priceValue = parseFloat(price);
  const feePercentage = FEES.MAKER.PERCENTAGE / 100;
  return (priceValue * feePercentage).toString();
};

// Function to calculate taker fee amount
export const calculateTakerFee = (price: string): string => {
  const priceValue = parseFloat(price);
  const feePercentage = FEES.TAKER.PERCENTAGE / 100;
  return (priceValue * feePercentage).toString();
};

/**
 * Calculate the total cost for a buyer including fees
 * @param price The base price of the NFT in ETH
 * @returns The total cost including fees
 */
export const calculateBuyerCost = (price: string): string => {
  const basePrice = parseFloat(price);
  const marketplaceFee = basePrice * (FEE_CONFIG.MARKETPLACE_FEE_PERCENTAGE / 100);
  const royaltyFee = basePrice * (FEE_CONFIG.CREATOR_ROYALTY_PERCENTAGE / 100);
  const totalCost = basePrice + marketplaceFee + royaltyFee + FEE_CONFIG.GAS_ESTIMATE_ETH;
  
  return totalCost.toFixed(6);
};

/**
 * Calculate the seller proceeds after fees
 * @param price The listing price of the NFT in ETH
 * @returns The amount the seller will receive after fees
 */
export const calculateSellerProceeds = (price: string): string => {
  const basePrice = parseFloat(price);
  const marketplaceFee = basePrice * (FEE_CONFIG.MARKETPLACE_FEE_PERCENTAGE / 100);
  const royaltyFee = basePrice * (FEE_CONFIG.CREATOR_ROYALTY_PERCENTAGE / 100);
  const sellerProceeds = basePrice - marketplaceFee - royaltyFee;
  
  return sellerProceeds.toFixed(6);
}; 