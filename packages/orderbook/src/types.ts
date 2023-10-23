import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { PopulatedTransaction, TypedDataDomain, TypedDataField } from 'ethers';
import { Fee as OpenapiFee, OrdersService, OrderStatus } from './openapi/sdk';

// Strictly re-export only the OrderStatusName enum from the openapi types
export { OrderStatusName } from './openapi/sdk';

export interface ERC721Item {
  type: 'ERC721';
  contractAddress: string;
  tokenId: string;
}

export interface ERC20Item {
  type: 'ERC20';
  contractAddress: string;
  amount: string;
}

export interface NativeItem {
  type: 'NATIVE';
  amount: string;
}

export interface RoyaltyInfo {
  recipient: string;
  amountRequired: string;
}

export interface PrepareListingParams {
  makerAddress: string;
  sell: ERC721Item;
  buy: ERC20Item | NativeItem;
  orderExpiry?: Date;
}

export interface PrepareListingResponse {
  actions: Action[];
  orderComponents: OrderComponents;
  orderHash: string;
}

export interface CreateListingParams {
  orderComponents: OrderComponents;
  orderHash: string;
  orderSignature: string;
  makerFees: FeeValue[];
}

// Expose the list order filtering and ordering directly from the openAPI SDK, except
// chainName is omitted as its configured as a part of the client
export type ListListingsParams = Omit<
Parameters<typeof OrdersService.prototype.listListings>[0],
'chainName'
>;

export type ListTradesParams = Omit<
Parameters<typeof OrdersService.prototype.listTrades>[0],
'chainName'
>;

export enum FeeType {
  MAKER_ECOSYSTEM = OpenapiFee.fee_type.MAKER_ECOSYSTEM,
  TAKER_ECOSYSTEM = OpenapiFee.fee_type.TAKER_ECOSYSTEM,
  PROTOCOL = OpenapiFee.fee_type.PROTOCOL,
  ROYALTY = OpenapiFee.fee_type.ROYALTY,
}

export interface FeeValue {
  recipient: string;
  amount: string;
}

export interface Fee extends FeeValue {
  type: FeeType;
}

export enum TransactionPurpose {
  APPROVAL = 'APPROVAL',
  FULFILL_ORDER = 'FULFILL_ORDER',
}

export enum SignablePurpose {
  CREATE_LISTING = 'CREATE_LISTING',
}

export enum ActionType {
  TRANSACTION = 'TRANSACTION',
  SIGNABLE = 'SIGNABLE',
}

export type TransactionBuilder = () => Promise<PopulatedTransaction>;

export interface TransactionAction {
  type: ActionType.TRANSACTION;
  purpose: TransactionPurpose;
  buildTransaction: TransactionBuilder;
}

export interface SignableAction {
  type: ActionType.SIGNABLE;
  purpose: SignablePurpose;
  message: {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    value: Record<string, any>;
  };
}

export type Action = TransactionAction | SignableAction;

export interface FulfillmentListing {
  listingId: string,
  takerFees: Array<FeeValue>
}

export type FulfillBulkOrdersResponse
  = FulfillBulkOrdersInsufficientBalanceResponse | FulfillBulkOrdersSufficientBalanceResponse;

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

export interface UnfulfillableOrder {
  orderId: string,
  reason: string,
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

export interface CancelOrderResponse {
  unsignedCancelOrderTransaction: PopulatedTransaction;
}

export interface Order {
  id: string;
  accountAddress: string;
  buy: (ERC20Item | NativeItem)[];
  sell: ERC721Item[];
  fees: Fee[];
  chain: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  /**
   * Time after which the Order is considered active
   */
  startAt: string;
  /**
   * Time after which the Order is expired
   */
  endAt: string;
  protocolData: {
    orderType: 'FULL_RESTRICTED';
    zoneAddress: string;
    counter: string;
    seaportAddress: string;
    seaportVersion: string;
  };
  salt: string;
  signature: string;
  status: OrderStatus;
}

export interface ListingResult {
  result: Order;
}

export interface ListListingsResult {
  page: Page;
  result: Order[];
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

export interface Trade {
  id: string;
  orderId: string;
  chain: {
    id: string;
    name: string;
  };
  buy: (ERC20Item | NativeItem)[];
  sell: ERC721Item[];
  buyerFees: Fee[];
  sellerAddress: string;
  buyerAddress: string;
  makerAddress: string;
  takerAddress: string;
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

export interface TradeResult {
  result: Trade;
}

export interface ListTradesResult {
  page: Page;
  result: Trade[];
}
