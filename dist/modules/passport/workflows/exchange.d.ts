import { CreateTransferResponseV1, ExchangesApi, StarkSigner, UnsignedExchangeTransferRequest } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
type TransfersParams = {
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    request: UnsignedExchangeTransferRequest;
    exchangesApi: ExchangesApi;
};
export declare function exchangeTransfer({ user, starkSigner, request, exchangesApi, }: TransfersParams): Promise<CreateTransferResponseV1>;
export {};
