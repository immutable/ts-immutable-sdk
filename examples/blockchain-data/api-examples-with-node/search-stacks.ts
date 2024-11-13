import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function searchStacks(
  chainName: string,
  contractAddress: string[],
): Promise<blockchainData.Types.SearchStacksResult> {
  return await client.searchStacks({
    chainName,
    contractAddress,
  });
}
