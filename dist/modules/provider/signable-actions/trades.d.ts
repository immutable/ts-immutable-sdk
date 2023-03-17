import { CreateTradeResponse, GetSignableTradeRequest } from 'types';
import { Signers } from './types';
import { Configuration } from 'config';
type createTradeWorkflowParams = {
    signers: Signers;
    request: GetSignableTradeRequest;
    config: Configuration;
};
export declare function createTrade({ signers: { ethSigner, starkExSigner }, request, config, }: createTradeWorkflowParams): Promise<CreateTradeResponse>;
export {};
