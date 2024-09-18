import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export async function getCollection(
  contractAddress: string,
): Promise<blockchainData.Types.GetCollectionResult> {
  // #doc blockchain-data-api-get-collection
  return await client.getCollection({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
  });
  // #enddoc blockchain-data-api-get-collection
};
