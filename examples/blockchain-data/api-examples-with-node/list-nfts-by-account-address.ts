import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listNFTsByAccountAddress(
  chainName: string,
  contractAddress: string,
  accountAddress: string,
): Promise<blockchainData.Types.ListNFTsByOwnerResult> {
  return await client.listNFTsByAccountAddress({
    chainName,
    contractAddress,
    accountAddress,
  });
}
