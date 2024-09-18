import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function listCollections(
  chainName: string
): Promise<blockchainData.Types.ListCollectionsResult> {
  return await client.listCollections({
    chainName,
  });
}
