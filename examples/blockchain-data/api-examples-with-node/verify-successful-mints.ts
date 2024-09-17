import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export async function verifySuccessfulMints(
  contractAddress: string,
): Promise<blockchainData.Types.ListActivitiesResult> {
  return await client.listActivities({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
    activityType: blockchainData.Types.ActivityType.Mint,
  });
}
