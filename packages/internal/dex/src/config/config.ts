import { DexModuleConfiguration } from '../types';
import { ImmutableConfiguration } from '@imtbl/config/src';
import { POLYGON_TESTNET_CHAIN_ID } from '../constants/tokens/polygon';

export class DexConfiguration {
  public baseConfig: ImmutableConfiguration;
  public chainId: number;
  constructor({ baseConfig, overrides }: DexModuleConfiguration) {
    this.baseConfig = baseConfig;
    if (!overrides?.chainId) {
      throw new Error('overrides - chainId cannot be null or empty');
    } else if (overrides?.chainId != POLYGON_TESTNET_CHAIN_ID) {
      throw new Error(
        `overrides - we only support Polygon Testnet Chain Id: ${POLYGON_TESTNET_CHAIN_ID}`
      );
    }

    this.chainId = overrides.chainId;
  }
}
