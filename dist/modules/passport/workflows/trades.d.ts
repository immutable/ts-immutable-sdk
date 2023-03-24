import { CreateTradeResponse, GetSignableTradeRequest, StarkSigner, TradesApi } from "@imtbl/core-sdk";
import { UserWithEtherKey } from "../types";
type CreateTradeParams = {
    request: GetSignableTradeRequest;
    tradesApi: TradesApi;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
};
export declare function createTrade({ request, tradesApi, user, starkSigner }: CreateTradeParams): Promise<CreateTradeResponse>;
export {};
