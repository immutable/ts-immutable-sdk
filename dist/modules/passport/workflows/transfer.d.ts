import { CreateTransferResponse, CreateTransferResponseV1, NftTransferDetails, StarkSigner, TransfersApi, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
type TrasferRequest = {
    request: UnsignedTransferRequest;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    transfersApi: TransfersApi;
};
type BatchTransfersParams = {
    request: Array<NftTransferDetails>;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    transfersApi: TransfersApi;
};
export declare const transfer: ({ request, transfersApi, starkSigner, user, }: TrasferRequest) => Promise<CreateTransferResponseV1>;
export declare function batchNftTransfer({ user, starkSigner, request, transfersApi, }: BatchTransfersParams): Promise<CreateTransferResponse>;
export {};
