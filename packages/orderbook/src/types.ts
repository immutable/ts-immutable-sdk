import type { OrderComponents } from '@opensea/seaport-js/lib/types';
import { PreparedTransactionRequest, TypedDataDomain, TypedDataField } from 'ethers';
import { Fee as OpenapiFee, OrdersService, OrderStatus } from './openapi/sdk';

// Strictly re-export only the OrderStatusName enum from the openapi types
export { OrderStatusName } from './openapi/sdk';

/* Items */

export interface NativeItem {
  type: 'NATIVE';
  amount: string;
}

export interface ERC20Item {
  type: 'ERC20';
  contractAddress: string;
  amount: string;
}

export interface ERC721Item {
  type: 'ERC721';
  contractAddress: string;
  tokenId: string;
}

export interface ERC1155Item {
  type: 'ERC1155';
  contractAddress: string;
  tokenId: string;
  amount: string;
}

export interface ERC721CollectionItem {
  type: 'ERC721_COLLECTION';
  contractAddress: string;
  amount: string;
}

export interface ERC1155CollectionItem {
  type: 'ERC1155_COLLECTION';
  contractAddress: string;
  amount: string;
}

/* Orders */

export type Order = Listing | Bid | CollectionBid;

export interface Listing extends OrderFields {
  type: 'LISTING';
  sell: (ERC721Item | ERC1155Item)[];
  buy: (NativeItem | ERC20Item)[];
}

export interface Bid extends OrderFields {
  type: 'BID';
  sell: ERC20Item[];
  buy: (ERC721Item | ERC1155Item)[];
}

export interface CollectionBid extends OrderFields {
  type: 'COLLECTION_BID';
  sell: ERC20Item[];
  buy: (ERC721CollectionItem | ERC1155CollectionItem)[];
}

interface OrderFields {
  id: string;
  chain: {
    id: string;
    name: string;
  };
  accountAddress: string;
  fees: Fee[];
  status: OrderStatus;
  fillStatus: {
    numerator: string;
    denominator: string;
  };
  /**
   * Time after which the Order is considered active
   */
  startAt: string;
  /**
   * Time after which the Order is expired
   */
  endAt: string;
  salt: string;
  signature: string;
  orderHash: string;
  protocolData: {
    orderType: 'FULL_RESTRICTED' | 'PARTIAL_RESTRICTED';
    zoneAddress: string;
    counter: string;
    seaportAddress: string;
    seaportVersion: string;
  };
  createdAt: string;
  updatedAt: string;
}

/* Trades */

export interface Trade {
  id: string;
  orderId: string;
  chain: {
    id: string;
    name: string;
  };
  buy: (NativeItem | ERC20Item | ERC721Item | ERC1155Item)[];
  sell: (ERC20Item | ERC721Item | ERC1155Item)[];
  /**
   * @deprecated Use {@linkcode Fees} instead (taker always pays the fees)
   */
  buyerFees: Fee[];
  /**
   * @deprecated Use {@linkcode makerAddress} or {@linkcode takerAddress} instead
   */
  sellerAddress: string;
  /**
   * @deprecated Use {@linkcode makerAddress} or {@linkcode takerAddress} instead
   */
  buyerAddress: string;
  makerAddress: string;
  takerAddress: string;
  /**
   * Fees paid by the taker of the trade
   */
  fees: Fee[];
  /**
   * Time the on-chain event was indexed by the Immutable order book service
   */
  indexedAt: string;
  blockchainMetadata: {
    /**
     * The transaction hash of the trade
     */
    transactionHash: string;
    /**
     * EVM block number (uint64 as string)
     */
    blockNumber: string;
    /**
     * Transaction index in a block (uint32 as string)
     */
    transactionIndex: string;
    /**
     * The log index of the fulfillment event in a block (uint32 as string)
     */
    logIndex: string;
  };
}

/* Fees */

export interface Fee extends FeeValue {
  type: FeeType;
}

export interface FeeValue {
  recipientAddress: string;
  amount: string;
}

export enum FeeType {
  MAKER_ECOSYSTEM = OpenapiFee.type.MAKER_ECOSYSTEM,
  TAKER_ECOSYSTEM = OpenapiFee.type.TAKER_ECOSYSTEM,
  PROTOCOL = OpenapiFee.type.PROTOCOL,
  ROYALTY = OpenapiFee.type.ROYALTY,
}

/* Generic Order Ops */

export interface PrepareOrderResponse {
  actions: Action[];
  orderComponents: OrderComponents;
  orderHash: string;
}

/* Listings Ops */

// Expose the list order filtering and ordering directly from the openAPI SDK, except
// chainName is omitted as its configured as a part of the client
export type ListListingsParams = Omit<
Parameters<typeof OrdersService.prototype.listListings>[0],
'chainName'
>;

export interface ListingResult {
  result: Listing;
}

export interface ListListingsResult {
  page: Page;
  result: Listing[];
}

export interface PrepareListingParams {
  makerAddress: string;
  sell: ERC721Item | ERC1155Item;
  buy: NativeItem | ERC20Item;
  orderStart?: Date;
  orderExpiry?: Date;
}

export type PrepareListingResponse = PrepareOrderResponse;

export interface PrepareBulkListingsParams {
  makerAddress: string;
  listingParams: {
    sell: ERC721Item | ERC1155Item;
    buy: NativeItem | ERC20Item;
    makerFees: FeeValue[];
    orderStart?: Date;
    orderExpiry?: Date;
  }[];
}

export interface PrepareBulkListingsResponse {
  actions: Action[];
  completeListings(signatures: string[]): Promise<BulkListingsResult>;
  /**
   * @deprecated Pass a `string[]` to {@linkcode completeListings} instead to enable
   * smart contract wallets
   */
  completeListings(signature: string): Promise<BulkListingsResult>;
}

export interface CreateListingParams {
  orderComponents: OrderComponents;
  orderHash: string;
  orderSignature: string;
  makerFees: FeeValue[];
}

export interface BulkListingsResult {
  result: {
    success: boolean;
    orderHash: string;
    order?: Listing;
  }[];
}

/* Bid Ops */

// Expose the list order filtering and ordering directly from the openAPI SDK, except
// chainName is omitted as its configured as a part of the client
export type ListBidsParams = Omit<
Parameters<typeof OrdersService.prototype.listBids>[0],
'chainName'
>;

export interface BidResult {
  result: Bid;
}

export interface ListBidsResult {
  page: Page;
  result: Bid[];
}

export interface PrepareBidParams {
  makerAddress: string;
  sell: ERC20Item;
  buy: ERC721Item | ERC1155Item;
  orderStart?: Date;
  orderExpiry?: Date;
}

export type PrepareBidResponse = PrepareOrderResponse;

export interface CreateBidParams {
  orderComponents: OrderComponents;
  orderHash: string;
  orderSignature: string;
  makerFees: FeeValue[];
}

export interface BulkBidsResult {
  result: {
    success: boolean;
    orderHash: string;
    order?: Bid;
  }[];
}

/* Collection Bid Ops */

// Expose the list order filtering and ordering directly from the openAPI SDK, except
// chainName is omitted as its configured as a part of the client
export type ListCollectionBidsParams = Omit<
Parameters<typeof OrdersService.prototype.listCollectionBids>[0],
'chainName'
>;

export interface CollectionBidResult {
  result: CollectionBid;
}

export interface ListCollectionBidsResult {
  page: Page;
  result: CollectionBid[];
}

export interface PrepareCollectionBidParams {
  makerAddress: string;
  sell: ERC20Item;
  buy: ERC721CollectionItem | ERC1155CollectionItem;
  orderStart?: Date;
  orderExpiry?: Date;
}

export type PrepareCollectionBidResponse = PrepareOrderResponse;

export interface CreateCollectionBidParams {
  orderComponents: OrderComponents;
  orderHash: string;
  orderSignature: string;
  makerFees: FeeValue[];
}

export interface BulkCollectionBidsResult {
  result: {
    success: boolean;
    orderHash: string;
    order?: CollectionBid;
  }[];
}

/* Fulfilment Ops */

export interface FulfillmentOrder {
  orderId: string;
  takerFees: FeeValue[];
  amountToFill?: string;
  tokenId?: string;
}

/**
 * @deprecated Use {@linkcode FulfillmentOrder} instead
 */
export interface FulfillmentListing {
  listingId: string;
  takerFees: FeeValue[];
  amountToFill?: string;
}

export type FulfillBulkOrdersResponse =
  | FulfillBulkOrdersInsufficientBalanceResponse
  | FulfillBulkOrdersSufficientBalanceResponse;

export interface FulfillBulkOrdersSufficientBalanceResponse {
  sufficientBalance: true;
  actions: Action[];
  expiration: string;
  fulfillableOrders: Order[];
  unfulfillableOrders: UnfulfillableOrder[];
}

export interface FulfillBulkOrdersInsufficientBalanceResponse {
  sufficientBalance: false;
  fulfillableOrders: Order[];
  unfulfillableOrders: UnfulfillableOrder[];
}

export interface FulfillOrderResponse {
  actions: Action[];
  /**
   * User MUST submit the fulfillment transaction before the expiration
   * Submitting after the expiration will result in a on chain revert
   */
  expiration: string;
  // order might contain updated fee information
  order: Order;
}

export interface UnfulfillableOrder {
  orderId: string;
  tokenId?: string;
  reason: string;
}

/* Order Cancel Ops */

export interface PrepareCancelOrdersResponse {
  signableAction: SignableAction;
}

export interface CancelOrdersOnChainResponse {
  cancellationAction: TransactionAction;
}

/* Trade Ops */

export type ListTradesParams = Omit<
Parameters<typeof OrdersService.prototype.listTrades>[0],
'chainName'
>;

export interface TradeResult {
  result: Trade;
}

export interface ListTradesResult {
  page: Page;
  result: Trade[];
}

/* Action Ops */

export type Action = TransactionAction | SignableAction;

export enum ActionType {
  TRANSACTION = 'TRANSACTION',
  SIGNABLE = 'SIGNABLE',
}

export interface TransactionAction {
  type: ActionType.TRANSACTION;
  purpose: TransactionPurpose;
  buildTransaction: TransactionBuilder;
}

export enum TransactionPurpose {
  APPROVAL = 'APPROVAL',
  FULFILL_ORDER = 'FULFILL_ORDER',
  CANCEL = 'CANCEL',
}

export type TransactionBuilder = () => Promise<PreparedTransactionRequest>;

export interface SignableAction {
  type: ActionType.SIGNABLE;
  purpose: SignablePurpose;
  message: {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    value: Record<string, any>;
  };
}

export enum SignablePurpose {
  /**
   * @deprecated Use {@linkcode CREATE_ORDER} instead
   */
  CREATE_LISTING = 'CREATE_ORDER',
  CREATE_ORDER = 'CREATE_ORDER',
  OFF_CHAIN_CANCELLATION = 'OFF_CHAIN_CANCELLATION',
}

/* Misc */

export interface RoyaltyInfo {
  recipient: string;
  amountRequired: string;
}

export interface Page {
  /**
   * First item as an encoded string
   */
  previousCursor: string | null;
  /**
   * Last item as an encoded string
   */
  nextCursor: string | null;
}

export interface PrepareBulkSeaportOrders {
  actions: Action[];
  preparedOrders: {
    orderComponents: OrderComponents;
    orderHash: string;
  }[];
}
