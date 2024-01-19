import {
  EncodeAssetResponse,
  EncodingApi,
  EncodingApiEncodeAssetRequest,
} from '@imtbl/core-sdk';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import { testConfig } from '../../test/helpers';

jest.mock('@imtbl/core-sdk');

describe('getEncodeAssetInfo', () => {
  let encodeAssetMock: jest.Mock;
  let encodeAssetResponse: EncodeAssetResponse;
  const assetType = 'asset-type';

  beforeEach(() => {
    jest.restoreAllMocks();
    encodeAssetResponse = {
      asset_id: 'asset-id',
      asset_type: assetType,
    };

    encodeAssetMock = jest.fn().mockResolvedValue({
      data: encodeAssetResponse,
    });

    (EncodingApi as jest.Mock).mockReturnValue({
      encodeAsset: encodeAssetMock,
    });
  });

  it('encode asset correctly', async () => {
    const tokenType = 'ERC20';
    const tokenData = { token_address: '0x12as3' };
    const response = await getEncodeAssetInfo(
      assetType,
      tokenType,
      testConfig.immutableXConfig,
      tokenData,
    );

    expect(response).toEqual(encodeAssetResponse);
    expect(encodeAssetMock).toHaveBeenCalledWith({
      assetType,
      encodeAssetRequest: {
        token: {
          type: tokenType,
          data: tokenData,
        },
      },
    } as EncodingApiEncodeAssetRequest);
  });
});
