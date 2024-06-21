import { ethers } from 'ethers';
import { FactoryConfiguration } from './config';
import { PRESETS } from './constants/presets';
import { FactoryError, FactoryErrorType, withFactoryError } from './errors';
import { GetPresetsRequest, GetPresetsResponse } from './types';

/**
 * Represents a factory
 */
export class Factory {
  private config: FactoryConfiguration;

  constructor(config: FactoryConfiguration) {
    this.config = config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getPresets(req: GetPresetsRequest): Promise<GetPresetsResponse> {
    await this.validateChainConfiguration();
    return { presets: PRESETS };
  }

  // Query the chain providers to ensure the chainID is as expected by the SDK.
  // This is to prevent the SDK from being used on the wrong chain, especially after a chain reset.
  private async validateChainConfiguration(): Promise<void> {
    const errMessage = 'Please upgrade to the latest version of the Factory SDK or provide valid configuration';

    const network = await withFactoryError<ethers.providers.Network>(
      async () => this.config.provider.getNetwork(),
      FactoryErrorType.PROVIDER_ERROR,
    );
    if (network.chainId.toString() !== this.config.factoryInstance.chainID) {
      throw new FactoryError(
        `Provider chainID ${network.chainId} does not match expected chainID ${this.config.factoryInstance.chainID}. ${errMessage}`,
        FactoryErrorType.UNSUPPORTED_ERROR,
      );
    }
  }
}
