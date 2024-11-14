import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function searchNFTs(
  chainName: string,
  contractAddress: string[],
): Promise<blockchainData.Types.SearchNFTsResult> {
  return await client.searchNFTs({
    chainName,
    contractAddress,
  });
}
