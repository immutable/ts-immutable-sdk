import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export const listCollectionsByNFTOwner = async (
  accountAddress: string,
): Promise<blockchainData.Types.ListCollectionsResult> => {
  return await client.listCollectionsByNFTOwner({
    chainName: 'imtbl-zkevm-testnet',
    accountAddress,
  });
};
