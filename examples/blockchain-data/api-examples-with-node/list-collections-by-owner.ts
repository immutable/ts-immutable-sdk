import { blockchainData } from "@imtbl/sdk";

import { client } from "../lib";

export async function listCollectionsByNFTOwner(
  chainName: string,
  accountAddress: string
): Promise<blockchainData.Types.ListCollectionsResult> {
  // #doc blockchain-data-api-list-collections-by-nft-owner
  return await client.listCollectionsByNFTOwner({
    chainName,
    accountAddress,
  });
  // #enddoc blockchain-data-api-list-collections-by-nft-owner
}
