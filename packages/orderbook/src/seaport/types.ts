import { Seaport as SeaportLib } from '@opensea/seaport-js';

export type OrderComponents = Parameters<SeaportLib['signOrder'][0]>;

export type OrderParameters = Omit<OrderComponents, 'counter'>;

export type OfferItem = OrderParameters['offer'][0];

export type ConsiderationItem = OrderParameters['consideration'][0];

export type FulfillmentOrderDetails = Parameters<SeaportLib['fulfillOrders']>[0]['fulfillOrderDetails'][0];

export type CreateOrderInput = Parameters<SeaportLib['createOrder']>[0];

export type ConsiderationInputItem = CreateOrderInput['consideration'][0];

export type CreateInputItem = CreateOrderInput['offer'][0];

export type InputCriteria = Parameters<SeaportLib['fulfillOrder']>[0]['offerCriteria'][0];

export type TipInputItem = Parameters<SeaportLib['fulfillOrder']>[0]['tips'][0];

export type CreateBulkOrdersReturnType = ReturnType<SeaportLib['createBulkOrders']>;

export type CreateOrderReturnType = ReturnType<SeaportLib['createOrder']>;

export type ApprovalAction = CreateOrderReturnType['actions'][0];

export type CreateBulkOrdersAction = CreateBulkOrdersReturnType['actions'][0];

export type CreateOrderAction = CreateOrderReturnType['actions'][0];
