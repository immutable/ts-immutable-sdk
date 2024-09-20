import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function createMintRequestWithTokenIdAndMetadataAndAmount(
  chainName: string,
  contractAddress: string,
  owner_address: string,
  reference_id: string,
  token_id: string,
  amount: string
): Promise<blockchainData.Types.CreateMintRequestResult> {
  return await client.createMintRequest({
    chainName,
    contractAddress,
    createMintRequestRequest: {
      assets: [
        {
          owner_address,
          reference_id,
          token_id,
          amount,
        },
      ],
    },
  });
}
