import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listFilters(
  chainName: string,
  contractAddress: string,
): Promise<blockchainData.Types.ListFiltersResult> {
  return await client.listFilters({
    chainName,
    contractAddress,
  });
}
