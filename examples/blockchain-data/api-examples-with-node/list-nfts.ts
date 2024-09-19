import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listAllNFTs(): Promise<blockchainData.Types.ListNFTsResult> {
  return await client.listAllNFTs({
    chainName: 'imtbl-zkevm-testnet',
  });
}
