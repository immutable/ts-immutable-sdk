import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function listCollectionsByNFTOwner(
  chainName: string,
  accountAddress: string
): Promise<blockchainData.Types.ListCollectionsResult> {
  return await client.listCollectionsByNFTOwner({
    chainName,
    accountAddress,
  });
}
