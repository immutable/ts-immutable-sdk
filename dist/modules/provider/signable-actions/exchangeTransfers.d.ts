import { CreateTransferResponseV1, UnsignedExchangeTransferRequest } from '../../../types';
import { Signers } from './types';
import { Configuration } from 'config';
type TransfersWorkflowParams = {
    signers: Signers;
    request: UnsignedExchangeTransferRequest;
    config: Configuration;
};
export declare function exchangeTransfers({ signers, request, config, }: TransfersWorkflowParams): Promise<CreateTransferResponseV1>;
export {};
