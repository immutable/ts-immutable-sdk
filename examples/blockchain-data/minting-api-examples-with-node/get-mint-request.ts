import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function getMintRequest(
  chainName: string,
  contractAddress: string,
  referenceId: string
): Promise<blockchainData.Types.ListMintRequestsResult> {
  return await client.getMintRequest({ chainName, contractAddress, referenceId });
}
