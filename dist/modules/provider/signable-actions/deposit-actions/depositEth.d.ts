import { ETHAmount } from '@imtbl/core-sdk';
import { Configuration } from 'config';
import { TransactionResponse } from '@ethersproject/providers';
import { EthSigner } from 'types';
export declare function depositEth(signer: EthSigner, deposit: ETHAmount, config: Configuration): Promise<TransactionResponse>;
