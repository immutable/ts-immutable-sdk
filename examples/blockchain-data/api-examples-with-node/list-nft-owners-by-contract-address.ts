import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listNFTOwnersByContractAddress(
  contractAddress: string,
): Promise<blockchainData.Types.ListNFTOwnersResult> {
  return await client.listNFTOwnersByContractAddress({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
  });
}
