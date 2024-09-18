import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function getNFT(chainName: string, contractAddress: string, tokenId: string): Promise<blockchainData.Types.GetNFTResult> {
  return await client.getNFT({
    chainName: chainName,
    contractAddress: contractAddress,
    tokenId: tokenId,
  });
}
