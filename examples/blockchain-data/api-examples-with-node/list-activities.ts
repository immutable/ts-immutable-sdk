import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function listActivities(
  chainName: string,
  contractAddress: string,
  pageSize: number
): Promise<blockchainData.Types.ListActivitiesResult> {
  // #doc blockchain-data-api-list-activities
  return await client.listActivities({
    chainName,
    contractAddress,
    pageSize,
  });
  // #enddoc blockchain-data-api-list-activities
}
