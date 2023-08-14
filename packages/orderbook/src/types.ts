import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { PopulatedTransaction, TypedDataDomain, TypedDataField } from 'ethers';
import { Fee, OrdersService } from 'openapi/sdk';

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
  actions: TransactionAction[];
  typedOrderMessageForSigning: {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    value: Record<string, any>;
  };
  orderComponents: OrderComponents;
  orderHash: string;
}

export interface CreateListingParams {
  orderComponents: OrderComponents;
  orderHash: string;
  orderSignature: string;
  fees?: Array<Fee>
}

// Expose the list order filtering and ordering directly from the openAPI SDK, except
// chainName is omitted as its configured as a part of the client
export type ListListingsParams = Omit<
Parameters<typeof OrdersService.prototype.listListings>[0],
'chainName'
>;

export enum TransactionType {
  APPROVAL = 'APPROVAL',
  FULFILL_ORDER = 'FULFILL_ORDER',
}

export type TransactionBuilder = () => Promise<PopulatedTransaction>;

export interface TransactionAction {
  transactionType: TransactionType;
  buildTransaction: TransactionBuilder;
}

export interface FulfillOrderResponse {
  actions: TransactionAction[];
}

export interface CancelOrderResponse {
  unsignedCancelOrderTransaction: PopulatedTransaction;
}
