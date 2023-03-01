import {
  EncodeAssetRequestTokenTypeEnum,
  EncodeAssetResponse,
  EncodingApi,
  EncodeAssetTokenData,
} from '../../../../types';

export async function getEncodeAssetInfo(
  assetType: string,
  tokenType: EncodeAssetRequestTokenTypeEnum,
  encodingApi: EncodingApi,
  tokenData?: EncodeAssetTokenData,
): Promise<EncodeAssetResponse> {
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
