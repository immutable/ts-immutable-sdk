import { orderbook } from '@imtbl/sdk';
import { Wallet } from 'ethers';
import { actionAll } from './actions';

const orderStatusMap = new Map<string, orderbook.OrderStatusName>([
  ['pending', orderbook.OrderStatusName.PENDING],
  ['active', orderbook.OrderStatusName.ACTIVE],
  ['inactive', orderbook.OrderStatusName.INACTIVE],
  ['filled', orderbook.OrderStatusName.FILLED],
  ['expired', orderbook.OrderStatusName.EXPIRED],
  ['cancelled', orderbook.OrderStatusName.CANCELLED],
]);

export async function waitForOrderToBeOfStatus(
  sdk: orderbook.Orderbook,
  orderId: string,
  status: string,
  attempts = 0,
): Promise<orderbook.Order> {
  if (attempts > 50) {
    throw new Error(`Order ${orderId} never became ${status}`);
  }

  const orderStatus = orderStatusMap.get(status);
  if (!orderStatus) {
    throw new Error(`Unrecognized order status: ${status}`);
  }

  const { result: order } = await sdk.getListing(orderId);
  if (order.status.name === orderStatus) {
    return order;
  }

  // eslint-disable-next-line
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return waitForOrderToBeOfStatus(sdk, orderId, status, attempts + 1);
}

export async function prepareERC721Listing(
  sdk: orderbook.Orderbook,
  offerer: Wallet,
  contractAddress: string,
  testTokenId: string,
  listingPrice: number,
): Promise<orderbook.PrepareListingResponse> {
  return await sdk.prepareListing({
    makerAddress: offerer.address,
    buy: {
      amount: `${listingPrice}`,
      type: 'NATIVE',
    },
    sell: {
      contractAddress,
      tokenId: testTokenId,
      type: 'ERC721',
    },
  });
}

export async function prepareERC1155Listing(
  sdk: orderbook.Orderbook,
  offerer: Wallet,
  contractAddress: string,
  testTokenId: string,
  listingPrice: number,
  amount: string,
): Promise<orderbook.PrepareListingResponse> {
  return await sdk.prepareListing({
    makerAddress: offerer.address,
    buy: {
      amount: `${listingPrice}`,
      type: 'NATIVE',
    },
    sell: {
      contractAddress,
      tokenId: testTokenId,
      type: 'ERC1155',
      amount,
    },
  });
}

export async function createListing(
  sdk: orderbook.Orderbook,
  listing: orderbook.PrepareListingResponse,
  orderSignature: string,
): Promise<orderbook.ListingResult> {
  return await sdk.createListing({
    orderComponents: listing.orderComponents,
    orderHash: listing.orderHash,
    orderSignature,
    makerFees: [],
  });
}

export async function fulfillListing(
  sdk: orderbook.Orderbook,
  listingId: string,
  fulfiller: Wallet,
  unitsToFill?: string,
): Promise<string[]> {
  const fulfillmentResponse = await sdk.fulfillOrder(
    listingId,
    fulfiller.address,
    [],
    unitsToFill,
  );

  return await actionAll(fulfillmentResponse.actions, fulfiller);
}

export async function bulkFulfillListings(
  sdk: orderbook.Orderbook,
  listings: { listingId: string, unitsToFill?: string }[],
  fulfiller: Wallet,
): Promise<string[]> {
  const fulfillmentResponse = await sdk.fulfillBulkOrders(
    listings.map((l) => ({ listingId: l.listingId, amountToFill: l.unitsToFill, takerFees: [] })),
    fulfiller.address,
  );

  if (!fulfillmentResponse.sufficientBalance) {
    throw new Error('Insufficient balance to fulfill orders');
  }

  return await actionAll(fulfillmentResponse.actions, fulfiller);
}

export async function getTrades(
  sdk: orderbook.Orderbook,
  listingId: string,
  fulfiller: Wallet,
): Promise<orderbook.Trade[]> {
  // eslint-disable-next-line no-await-in-loop
  const trades = await sdk.listTrades({
    accountAddress: fulfiller.address,
    sortBy: 'indexed_at',
    sortDirection: 'desc',
    pageSize: 10,
  });

  // eslint-disable-next-line @typescript-eslint/no-loop-func
  return trades.result.filter((t) => t.orderId === listingId);
}
