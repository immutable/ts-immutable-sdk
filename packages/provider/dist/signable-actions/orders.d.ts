import { CancelOrderResponse, CreateOrderResponse, GetSignableCancelOrderRequest, UnsignedOrderRequest } from "types";
import { Signers } from "./types";
import { Configuration } from "@imtbl/config";
type CreateOrderWorkflowParams = {
    signers: Signers;
    request: UnsignedOrderRequest;
    config: Configuration;
};
type CancelOrderWorkflowParams = {
    signers: Signers;
    request: GetSignableCancelOrderRequest;
    config: Configuration;
};
export declare function createOrder({ signers, request, config, }: CreateOrderWorkflowParams): Promise<CreateOrderResponse>;
export declare function cancelOrder({ signers, request, config, }: CancelOrderWorkflowParams): Promise<CancelOrderResponse>;
export {};
