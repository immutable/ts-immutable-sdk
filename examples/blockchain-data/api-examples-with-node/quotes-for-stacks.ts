import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function quotesForStacks(
  chainName: string,
  contractAddress: string,
  stackId: string[],
): Promise<blockchainData.Types.QuotesForStacksResult> {
  return await client.quotesForStacks({
    chainName,
    contractAddress,
    stackId,
  });
}
