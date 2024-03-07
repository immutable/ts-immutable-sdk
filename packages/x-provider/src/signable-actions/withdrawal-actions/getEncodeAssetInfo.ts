import {
  EncodeAssetRequestTokenTypeEnum,
  EncodeAssetResponse,
  EncodeAssetTokenData,
} from '@imtbl/core-sdk';
import { imx } from '@imtbl/generated-clients';
import { ImmutableXConfiguration } from '@imtbl/x-client';

export async function getEncodeAssetInfo(
  assetType: string,
  tokenType: EncodeAssetRequestTokenTypeEnum,
  config: ImmutableXConfiguration,
  tokenData?: EncodeAssetTokenData,
): Promise<EncodeAssetResponse> {
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
