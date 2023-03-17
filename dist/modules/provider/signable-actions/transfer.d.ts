import { CreateTransferResponse, CreateTransferResponseV1, NftTransferDetails, UnsignedTransferRequest } from 'types';
import { Signers } from './types';
import { Configuration } from 'config';
type TransfersWorkflowParams = {
    signers: Signers;
    request: UnsignedTransferRequest;
    config: Configuration;
};
type BatchTransfersWorkflowParams = {
    signers: Signers;
    request: Array<NftTransferDetails>;
    config: Configuration;
};
export declare function transfer({ signers: { ethSigner, starkExSigner }, request, config, }: TransfersWorkflowParams): Promise<CreateTransferResponseV1>;
export declare function batchTransfer({ signers: { ethSigner, starkExSigner }, request, config, }: BatchTransfersWorkflowParams): Promise<CreateTransferResponse>;
export {};
