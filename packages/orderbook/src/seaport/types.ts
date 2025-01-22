import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { ItemType } from './constants';

// Importing types from seaport-js using a relative path (e.g. @opensea/seaport-js/lib/constants)
// can cause issues for consumers of the SDK, e.g: https://github.com/immutable/ts-immutable-sdk/issues/2472.
// To avoid this issue, we've extracted some of the accessible types below, and duplicated others.

type ElementType<T> = T extends (infer U)[] ? U : never;

export type DefaultReturnType<R> = R extends Array<any> ? R[0] : R;

export type OrderComponents = Parameters<SeaportLib['signOrder']>[0];

export type OrderParameters = Omit<OrderComponents, 'counter'>;

export type OfferItem = OrderParameters['offer'][0];

export type ConsiderationItem = OrderParameters['consideration'][0];

export type FulfillmentOrderDetails = Parameters<SeaportLib['fulfillOrders']>[0]['fulfillOrderDetails'][0];

export type OrderWithCounter = Parameters<SeaportLib['fulfillOrder']>[0]['order'];

export type CreateOrderInput = Parameters<SeaportLib['createOrder']>[0];

export type ConsiderationInputItem = CreateOrderInput['consideration'][0];

export type CreateInputItem = CreateOrderInput['offer'][0];

export type InputCriteria = ElementType<Parameters<SeaportLib['fulfillOrder']>[0]['offerCriteria']>;

export type TipInputItem = ElementType<Parameters<SeaportLib['fulfillOrder']>[0]['tips']>;

export type CreateBulkOrdersReturnType = Awaited<ReturnType<SeaportLib['createBulkOrders']>>;

export type CreateOrderReturnType = Awaited<ReturnType<SeaportLib['createOrder']>>;

export type TransactionMethods<T = unknown> = {
  buildTransaction: (overrides?: any) => Promise<any>;
  staticCall: (overrides?: any) => Promise<DefaultReturnType<T>>;
  estimateGas: (overrides?: any) => Promise<bigint>;
  transact: (overrides?: any) => Promise<any>;
};

export type CreateOrderAction = {
  type: 'create';
  getMessageToSign: () => Promise<string>;
  createOrder: () => Promise<OrderWithCounter>;
};

export type ApprovalAction = {
  type: 'approval';
  token: string;
  identifierOrCriteria: string;
  itemType: ItemType;
  operator: string;
  transactionMethods: TransactionMethods;
};

export type ExchangeAction<T = unknown> = {
  type: 'exchange';
  transactionMethods: TransactionMethods<T>;
};

export type CreateBulkOrdersAction = {
  type: 'createBulk';
  getMessageToSign: () => Promise<string>;
  createBulkOrders: () => Promise<OrderWithCounter[]>;
};
