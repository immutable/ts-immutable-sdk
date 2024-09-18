import { blockchainData } from "@imtbl/sdk";

import { client } from "../lib";

export async function listCollections(
  chainName: string
): Promise<blockchainData.Types.ListCollectionsResult> {
  // #doc blockchain-data-api-list-collections
  return await client.listCollections({
    chainName,
  });
  // #enddoc blockchain-data-api-list-collections
}
