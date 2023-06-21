import { ImmutableConfiguration } from '@imtbl/config';
import { CryptoFiatModuleConfiguration } from 'types';

/**
 * Class representing the configuration for the CryptoFiatModule.
 */
export class CryptoFiatConfiguration {
  public baseConfig: ImmutableConfiguration;

  /**
   * Creates an instance of CryptoFiatConfiguration.
   */
  constructor({ baseConfig }: CryptoFiatModuleConfiguration) {
    this.baseConfig = baseConfig;
  }
}
