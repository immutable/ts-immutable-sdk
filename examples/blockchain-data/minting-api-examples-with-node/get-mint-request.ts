import { client } from "../lib";

export async function getMintRequest(
  chainName: string,
  contractAddress: string,
  referenceId: string
) {
  return await client.getMintRequest({ chainName, contractAddress, referenceId });
}
