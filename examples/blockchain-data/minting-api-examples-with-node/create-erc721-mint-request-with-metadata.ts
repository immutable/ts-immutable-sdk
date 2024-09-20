import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function createMintRequestWithTokenIdAndMetadata(
  chainName: string,
  contractAddress: string,
  owner_address: string,
  reference_id: string,
  token_id: string
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
          metadata: {
            name: "Brown Dog Green Car",
            description: "This NFT is a Brown Dog in a Green Car",
            image: "https://mt-test-2.s3.ap-southeast-2.amazonaws.com/BDGC.png",
            external_url: null,
            animation_url: null,
            youtube_url: null,
            attributes: [
              {
                trait_type: "Pet",
                value: "Dog",
              },
              {
                trait_type: "Pet Colour",
                value: "Brown",
              },
              {
                trait_type: "Vehicle",
                value: "Car",
              },
              {
                trait_type: "Vehicle Colour",
                value: "Green",
              },
            ],
          },
        },
        {
          owner_address,
          reference_id,
          token_id,
          metadata: {
            name: "Brown Dog Red Car",
            description: "This NFT is a Brown Dog in a Red Car",
            image: "https://mt-test-2.s3.ap-southeast-2.amazonaws.com/BDRC.png",
            external_url: null,
            animation_url: null,
            youtube_url: null,
            attributes: [
              {
                trait_type: "Pet",
                value: "Dog",
              },
              {
                trait_type: "Pet Colour",
                value: "Brown",
              },
              {
                trait_type: "Vehicle",
                value: "Car",
              },
              {
                trait_type: "Vehicle Colour",
                value: "Red",
              },
            ],
          },
        },
      ],
    },
  });
}
