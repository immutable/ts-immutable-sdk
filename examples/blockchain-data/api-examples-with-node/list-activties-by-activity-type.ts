import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listActivitiesByActivityType(
  contractAddress: string,
  activityType: blockchainData.Types.ActivityType,
): Promise<blockchainData.Types.ListActivitiesResult> {
  return await client.listActivities({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
    activityType,
  });
}
