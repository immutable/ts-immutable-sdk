import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export async function getCollection(
  contractAddress: string,
): Promise<blockchainData.Types.GetCollectionResult> {
  return await client.getCollection({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
  });
};
