import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function getMetadata(
  chainName: string,
  contractAddress: string,
  metadataId: string
): Promise<blockchainData.Types.GetMetadataResult> {
  // #doc blockchain-data-api-get-metadata
  return await client.getMetadata({
    chainName,
    contractAddress,
    metadataId,
  });
  // #enddoc blockchain-data-api-get-metadata
}
