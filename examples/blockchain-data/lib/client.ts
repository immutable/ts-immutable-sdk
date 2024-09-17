import { blockchainData } from '@imtbl/sdk';
import { config } from './config';

export const client = new blockchainData.BlockchainData(config);
