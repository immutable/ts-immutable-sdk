import { CancelOrderResponse, CreateOrderResponse, GetSignableCancelOrderRequest, OrdersApi, StarkSigner, UnsignedOrderRequest } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
type CancelOrderParams = {
    request: GetSignableCancelOrderRequest;
    ordersApi: OrdersApi;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
};
type CreateOrderParams = {
    request: UnsignedOrderRequest;
    ordersApi: OrdersApi;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
};
export declare function createOrder({ starkSigner, user, request, ordersApi, }: CreateOrderParams): Promise<CreateOrderResponse>;
export declare function cancelOrder({ user, starkSigner, request, ordersApi, }: CancelOrderParams): Promise<CancelOrderResponse>;
export {};
