import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Configuration } from 'config';
import { ERC20Token } from 'types';
type CompleteERC20WithdrawalWorkflowParams = {
    ethSigner: Signer;
    starkPublicKey: string;
    token: ERC20Token;
    config: Configuration;
};
export declare function completeERC20WithdrawalAction({ ethSigner, starkPublicKey, token, config, }: CompleteERC20WithdrawalWorkflowParams): Promise<TransactionResponse>;
export {};
