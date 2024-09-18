import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export const listCollections = async (): Promise<blockchainData.Types.ListCollectionsResult> => {
  return await client.listCollections({
    chainName: 'imtbl-zkevm-testnet',
  });
};
