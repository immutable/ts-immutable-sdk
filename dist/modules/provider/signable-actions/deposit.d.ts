import { TokenAmount } from 'types';
import { Signers } from './types';
import { Configuration } from 'config';
export declare function deposit(signers: Signers, deposit: TokenAmount, config: Configuration): Promise<import("@ethersproject/abstract-provider").TransactionResponse>;
