import { DexModuleConfiguration } from '../types';
import { ImmutableConfiguration } from '@imtbl/config/src';

export class DexConfiguration {
  public baseConfig: ImmutableConfiguration;

  public chainId: number;
  constructor({ baseConfig, overrides }: DexModuleConfiguration) {
    this.baseConfig = baseConfig;

    if (!overrides || !overrides.chainId) {
      throw new Error('you need to provide a chain id');
    }

    this.chainId = overrides.chainId;
  }
}
