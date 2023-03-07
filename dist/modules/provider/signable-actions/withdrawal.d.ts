import { TokenAmount, AnyToken } from 'types';
import { Signers } from './types';
import { Configuration } from 'config';
type CompleteWithdrawalParams = {
    signers: Signers;
    starkPublicKey: string;
    token: AnyToken;
    config: Configuration;
};
type PrepareWithdrawalParams = {
    signers: Signers;
    withdrawal: TokenAmount;
    config: Configuration;
};
export declare function prepareWithdrawal({ signers, withdrawal, config, }: PrepareWithdrawalParams): Promise<import("@imtbl/core-sdk").CreateWithdrawalResponse>;
export declare function completeWithdrawal({ signers: { ethSigner }, starkPublicKey, token, config, }: CompleteWithdrawalParams): Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
export {};
