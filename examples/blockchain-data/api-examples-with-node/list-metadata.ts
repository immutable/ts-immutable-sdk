import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function listMetadata(
  chainName: string,
  contractAddress: string
): Promise<blockchainData.Types.ListMetadataResult> {
  // #doc blockchain-data-api-list-metadata
  return await client.listNFTMetadataByContractAddress({
    chainName,
    contractAddress,
  });
  // #enddoc blockchain-data-api-list-metadata
}
