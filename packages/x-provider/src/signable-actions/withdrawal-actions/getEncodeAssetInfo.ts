import {
  EncodeAssetRequestTokenTypeEnum,
  EncodeAssetResponse,
  EncodeAssetTokenData,
  EncodingApi,
} from '@imtbl/core-sdk';
import { ImmutableXConfiguration } from '@imtbl/x-client';

export async function getEncodeAssetInfo(
  assetType: string,
  tokenType: EncodeAssetRequestTokenTypeEnum,
  config: ImmutableXConfiguration,
  tokenData?: EncodeAssetTokenData,
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
