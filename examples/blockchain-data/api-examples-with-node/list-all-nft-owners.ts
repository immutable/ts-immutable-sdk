import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listAllNFTOwners(): Promise<blockchainData.Types.ListNFTOwnersResult> {
  return await client.listAllNFTOwners({
    chainName: 'imtbl-zkevm-testnet',
  });
}
