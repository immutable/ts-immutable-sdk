import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export async function listTokens(): Promise<blockchainData.Types.ListTokensResult> {
  return await client.listTokens({
    chainName: 'imtbl-zkevm-testnet',
  });
}
