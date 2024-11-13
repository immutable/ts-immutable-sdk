import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function quotesForStacks(
  chainName: string,
  contractAddress: string,
): Promise<blockchainData.Types.ListMetadataResult> {
  return await client.listNFTMetadataByContractAddress({
    chainName,
    contractAddress,
  });
}
