import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function getNFT(chainName: string, contractAddress: string, tokenId: string): Promise<blockchainData.Types.GetNFTResult> {
  // #doc blockchain-data-api-get-nft
  return await client.getNFT({
    chainName: chainName,
    contractAddress: contractAddress,
    tokenId: tokenId,
  });
  // #enddoc blockchain-data-api-get-nft
}
