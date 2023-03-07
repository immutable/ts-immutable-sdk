import { ERC721Token } from '@imtbl/core-sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { Configuration } from 'config';
import { EthSigner } from 'types';
export declare function depositERC721(signer: EthSigner, deposit: ERC721Token, config: Configuration): Promise<TransactionResponse>;
