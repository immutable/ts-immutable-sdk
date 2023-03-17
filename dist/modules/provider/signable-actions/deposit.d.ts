import { TokenAmount } from 'types';
import { Signers } from './types';
import { Configuration } from 'config';
type DepositParams = {
    signers: Signers;
    deposit: TokenAmount;
    config: Configuration;
};
export declare function deposit({ signers, deposit, config }: DepositParams): Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
export {};
