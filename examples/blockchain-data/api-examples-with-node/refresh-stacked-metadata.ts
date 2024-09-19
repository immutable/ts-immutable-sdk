import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function refreshStackedMetadata(
  chainName: string,
  contractAddress: string,
  newName: string
): Promise<blockchainData.Types.MetadataRefreshRateLimitResult> {
  return await client.refreshStackedMetadata({
    chainName,
    contractAddress,
    refreshMetadataByIDRequest: {
      metadata: [
        {
          name: newName,
          animation_url: null,
          image: null,
          external_url: null,
          youtube_url: null,
          description: null,
          attributes: [],
          metadata_id: '1',
        },
      ],
    },
  });
};
