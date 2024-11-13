import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listStacks(
  chainName: string,
  stackId: string[],
): Promise<blockchainData.Types.StackBundle[]> {
  return await client.listStacks({
    chainName,
    stackId,
  });
}
