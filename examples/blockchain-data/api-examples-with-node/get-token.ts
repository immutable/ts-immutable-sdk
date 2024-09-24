import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export async function getToken(
  contractAddress: string,
): Promise<blockchainData.Types.GetTokenResult> {
  return await client.getToken({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
  });
}
