import { blockchainData } from "@imtbl/sdk";
import { client } from "../lib";

export async function refreshNFTMetadata(
  chainName: string,
  contractAddress: string,
  newName: string
): Promise<blockchainData.Types.MetadataRefreshRateLimitResult> {
  const nftMetadata: blockchainData.Types.RefreshMetadataByTokenID[] = [
    {
      name: newName,
      animation_url: null,
      image: null,
      external_url: null,
      youtube_url: null,
      description: null,
      attributes: [
        {
          trait_type: 'Power',
          value: 'Happy',
        },
      ],
      token_id: '1',
    },
  ];

  return await client.refreshNFTMetadata({
    chainName,
    contractAddress,
    refreshNFTMetadataByTokenIDRequest: {
      nft_metadata: nftMetadata,
    },
  });
};
