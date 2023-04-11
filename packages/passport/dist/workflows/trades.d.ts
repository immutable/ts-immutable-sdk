import { CreateTradeResponse, GetSignableTradeRequest, StarkSigner, TradesApi } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
import { PassportConfiguration } from '../config';
type CreateTradeParams = {
    request: GetSignableTradeRequest;
    tradesApi: TradesApi;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    passportConfig: PassportConfiguration;
};
export declare function createTrade({ request, tradesApi, user, starkSigner, passportConfig, }: CreateTradeParams): Promise<CreateTradeResponse>;
export {};
