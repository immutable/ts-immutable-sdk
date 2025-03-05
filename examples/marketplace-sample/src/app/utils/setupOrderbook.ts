import { Orderbook } from '@imtbl/orderbook';
import { Environment } from '@imtbl/sdk/config';
import { BlockchainData } from '@imtbl/blockchain-data';

// Initialize the BlockchainData SDK
const blockchainData = new BlockchainData({
  baseConfig: {
    environment: Environment.SANDBOX
  }
});

// Initialize the base Orderbook SDK
const orderbookBase = new Orderbook({
  baseConfig: {
    environment: Environment.SANDBOX
  }
});

// Add type definitions to help TypeScript understand the structure
type OrderbookSDK = {
  getAllClients: () => { blockchainData: typeof blockchainData };
  getOrderById: (params: { orderId: string; chainName: string }) => Promise<any>;
  listOrders: (params: any) => Promise<any>;
  getOrder: (params: any) => Promise<any>;
  fulfillOrder: (params: any) => Promise<any>;
  cancelOrders: (params: any) => Promise<any>;
  listTrades: (params: any) => Promise<any>;
}

// Create a wrapper SDK that adds the methods we need
export const orderbookSDK: OrderbookSDK = {
  // Wrapper methods that call the appropriate Orderbook SDK methods
  getOrder: (params: any) => {
    console.log("Getting order:", params);
    return orderbookBase.getListing(params.orderId);
  },
  
  listOrders: (params: any) => {
    console.log("Listing orders with params:", JSON.stringify(params, null, 2));
    return orderbookBase.listListings(params);
  },
  
  listTrades: (params: any) => {
    console.log("Listing trades with params:", params);
    return orderbookBase.listTrades(params);
  },
  
  fulfillOrder: (params: any) => {
    console.log("Fulfilling order:", params);
    const { orderId, takerAddress, takerFees, amountToFill, tokenId } = params;
    return orderbookBase.fulfillOrder(orderId, takerAddress, takerFees || [], amountToFill, tokenId);
  },
  
  cancelOrders: (params: any) => {
    console.log("Cancelling orders:", params);
    const { orderIds, accountAddress, signature } = params;
    return orderbookBase.cancelOrders(orderIds, accountAddress, signature);
  },
  
  // Custom methods
  getOrderById: (params: { orderId: string; chainName: string }) => {
    console.log("Getting order by ID:", params.orderId);
    return orderbookBase.getListing(params.orderId);
  },
  
  // Method to get all clients
  getAllClients: () => {
    return { blockchainData };
  }
};

// Export the getAllClients function for convenience
export const getAllClients = orderbookSDK.getAllClients;
