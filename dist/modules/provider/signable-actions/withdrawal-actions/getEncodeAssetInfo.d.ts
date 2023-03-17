import { EncodeAssetRequestTokenTypeEnum, EncodeAssetResponse, EncodeAssetTokenData, ImmutableXConfiguration } from 'types';
export declare function getEncodeAssetInfo(assetType: string, tokenType: EncodeAssetRequestTokenTypeEnum, config: ImmutableXConfiguration, tokenData?: EncodeAssetTokenData): Promise<EncodeAssetResponse>;
