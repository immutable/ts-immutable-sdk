import { CreateTransferResponse, CreateTransferResponseV1, NftTransferDetails, StarkSigner, TransfersApi, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { PassportConfiguration } from '../config';
import { UserWithEtherKey } from '../types';
type TransferRequest = {
    request: UnsignedTransferRequest;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    transfersApi: TransfersApi;
    passportConfig: PassportConfiguration;
};
type BatchTransfersParams = {
    request: Array<NftTransferDetails>;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    transfersApi: TransfersApi;
};
export declare const transfer: ({ request, transfersApi, starkSigner, user, passportConfig }: TransferRequest) => Promise<CreateTransferResponseV1>;
export declare function batchNftTransfer({ user, starkSigner, request, transfersApi, }: BatchTransfersParams): Promise<CreateTransferResponse>;
export {};
