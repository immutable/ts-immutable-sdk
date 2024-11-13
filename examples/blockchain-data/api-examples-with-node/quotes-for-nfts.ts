import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function quotesForNFTs(
  chainName: string,
  contractAddress: string,
  tokenId: string[],
): Promise<blockchainData.Types.QuotesForNFTsResult> {
  return await client.quotesForNFTs({
    chainName,
    contractAddress,
    tokenId,
  });
}
