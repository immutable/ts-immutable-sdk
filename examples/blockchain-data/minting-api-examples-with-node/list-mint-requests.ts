import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function listMintRequests(
  chainName: string,
  contractAddress: string,
): Promise<blockchainData.Types.ListMintRequestsResult> {
  return await client.listMintRequests({ chainName, contractAddress });
}
