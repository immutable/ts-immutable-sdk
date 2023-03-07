import { ERC20Amount } from '@imtbl/core-sdk';
import { EthSigner } from "types";
import { Configuration } from 'config';
import { TransactionResponse } from '@ethersproject/providers';
export declare function depositERC20(signer: EthSigner, deposit: ERC20Amount, config: Configuration): Promise<TransactionResponse>;
