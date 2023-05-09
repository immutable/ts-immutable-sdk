import { CryptoFiatModuleConfiguration } from 'types';

/**
 * Class representing the configuration for the CryptoFiatModule.
 */
export class CryptoFiatConfiguration {
  private apiKey?: string;

  /**
   * Creates an instance of CryptoFiatConfiguration.
   * @param {CryptoFiatModuleConfiguration} config - Object with Configuration options.
   */
  constructor(config: CryptoFiatModuleConfiguration) {
    this.apiKey = config.apiKey;
  }

  /**
   * Returns the API key required to access the CryptoFiatModule.
   * @returns {string|undefined} - Returns the API key.
   */
  public getApiKey(): string | undefined {
    return this.apiKey;
  }
}
