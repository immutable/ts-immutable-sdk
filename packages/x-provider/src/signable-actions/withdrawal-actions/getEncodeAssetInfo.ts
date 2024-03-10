import { imx } from '@imtbl/generated-clients';
import { ImmutableXConfiguration } from '@imtbl/x-client';

export async function getEncodeAssetInfo(
  assetType: string,
  tokenType: imx.EncodeAssetRequestTokenTypeEnum,
  config: ImmutableXConfiguration,
  tokenData?: imx.EncodeAssetTokenData,
): Promise<imx.EncodeAssetResponse> {
  const encodingApi = new imx.EncodingApi(config.apiConfiguration);
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
