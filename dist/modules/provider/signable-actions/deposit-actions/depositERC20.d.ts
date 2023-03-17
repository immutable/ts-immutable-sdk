import { ERC20Amount } from '@imtbl/core-sdk';
import { Configuration } from 'config';
import { TransactionResponse } from '@ethersproject/providers';
import { Signers } from '../types';
type DepositERC20Params = {
    signers: Signers;
    deposit: ERC20Amount;
    config: Configuration;
};
export declare function depositERC20({ signers: { ethSigner }, deposit, config, }: DepositERC20Params): Promise<TransactionResponse>;
export {};
