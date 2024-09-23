import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export async function listChains(
  request: blockchainData.Types.ListChainsRequestParams,
): Promise<blockchainData.Types.ListChainsResult> {
  return await client.listChains(request);
}
