import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listNFTOwnersByTokenId(
  contractAddress: string,
  tokenId: string,
): Promise<blockchainData.Types.ListNFTOwnersResult> {
  return await client.listNFTOwners({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
    tokenId,
  });
}
