import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listNFTsByCollection(
  contractAddress: string,
  tokenId: string[],
): Promise<blockchainData.Types.ListNFTsResult> {
  return await client.listNFTs({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
    tokenId,
  });
}
