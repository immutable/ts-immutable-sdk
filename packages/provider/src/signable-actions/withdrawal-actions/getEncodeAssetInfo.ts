import {
  EncodeAssetRequestTokenTypeEnum,
  EncodeAssetResponse,
  EncodeAssetTokenData,
  ImmutableXConfiguration,
} from '@imtbl/core-sdk';
import { EncodingApi } from '@imtbl/core-sdk';

export async function getEncodeAssetInfo(
  assetType: string,
  tokenType: EncodeAssetRequestTokenTypeEnum,
  config: ImmutableXConfiguration,
  tokenData?: EncodeAssetTokenData
): Promise<EncodeAssetResponse> {
  const encodingApi = new EncodingApi(config.apiConfiguration);
  const result = await encodingApi.encodeAsset({
    assetType,
    encodeAssetRequest: {
      token: {
        type: tokenType,
        ...(tokenData && { data: tokenData }),
      },
    },
  });
  return result.data;
}
