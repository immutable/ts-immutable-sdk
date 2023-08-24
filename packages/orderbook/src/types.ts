import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { PopulatedTransaction, TypedDataDomain, TypedDataField } from 'ethers';
import {
  Fee as OpenapiFee,
  OrdersService,
} from './openapi/sdk';

// Strictly re-export some of the openapi generated types
export {
  OrderStatus,
  ListingResult,
  ListListingsResult,
  Order,
} from './openapi/sdk';

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
  makerFee?: Fee
}

// Expose the list order filtering and ordering directly from the openAPI SDK, except
// chainName is omitted as its configured as a part of the client
export type ListListingsParams = Omit<
Parameters<typeof OrdersService.prototype.listListings>[0],
'chainName'
>;

export enum FeeType {
  MAKER_MARKETPLACE = OpenapiFee.fee_type.MAKER_MARKETPLACE,
  TAKER_MARKETPLACE = OpenapiFee.fee_type.TAKER_MARKETPLACE,
  PROTOCOL = OpenapiFee.fee_type.PROTOCOL,
  ROYALTY = OpenapiFee.fee_type.ROYALTY,
}

export interface Fee {
  type: FeeType;
  recipient: string;
  amount: string;
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
  }
}

export type Action = TransactionAction | SignableAction;

export interface FulfillOrderResponse {
  actions: Action[];
}

export interface CancelOrderResponse {
  unsignedCancelOrderTransaction: PopulatedTransaction;
}
