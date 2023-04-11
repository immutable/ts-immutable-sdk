import { CancelOrderResponse, CreateOrderResponse, GetSignableCancelOrderRequest, OrdersApi, StarkSigner, UnsignedOrderRequest } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
import { PassportConfiguration } from '../config';
type CancelOrderParams = {
    request: GetSignableCancelOrderRequest;
    ordersApi: OrdersApi;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    passportConfig: PassportConfiguration;
};
type CreateOrderParams = {
    request: UnsignedOrderRequest;
    ordersApi: OrdersApi;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    passportConfig: PassportConfiguration;
};
export declare function createOrder({ starkSigner, user, request, ordersApi, passportConfig, }: CreateOrderParams): Promise<CreateOrderResponse>;
export declare function cancelOrder({ user, starkSigner, request, ordersApi, passportConfig, }: CancelOrderParams): Promise<CancelOrderResponse>;
export {};
