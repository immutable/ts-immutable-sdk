import { connect } from './metaMask';
import {
  connect as buildStarkSigner,
  disconnect as disconnectStarkSigner,
} from '../imx-wallet/imxWallet';
import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { GenericIMXProvider } from '../genericImxProvider';
import { StarkSigner } from '../imx-wallet/StarkSigner';
import {
  ProviderError,
  ProviderErrorType,
  withProviderError,
} from '../errors/providerError';
import { ProviderConfiguration } from 'config';

export class MetaMaskIMXProvider extends GenericIMXProvider {
  private static starkSigner: StarkSigner;

  constructor(
    config: ProviderConfiguration,
    ethSigner: EthSigner,
    starkSigner: StarkSigner
  ) {
    super(config, ethSigner, starkSigner);
  }

  public static async connect(
    config: ProviderConfiguration
  ): Promise<MetaMaskIMXProvider> {
    return await withProviderError<MetaMaskIMXProvider>(
      async () => {
        const metaMaskProvider = await connect({
          chainID: config.immutableXConfig.ethConfiguration.chainID,
        });
        this.starkSigner = await buildStarkSigner(
          metaMaskProvider,
          config.baseConfig.environment
        );
        return new MetaMaskIMXProvider(
          config,
          metaMaskProvider.getSigner(),
          this.starkSigner
        );
      },
      { type: ProviderErrorType.WALLET_CONNECTION_ERROR }
    );
  }

  public static async disconnect(): Promise<void> {
    if (!this.starkSigner) {
      throw new ProviderError(
        'Attempted to disconnect from the MetaMask IMX provider without an established connection',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR
      );
    }

    return withProviderError<void>(
      async () => {
        await disconnectStarkSigner(this.starkSigner);
      },
      { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR }
    );
  }

  public static async signMessage(message: string): Promise<string> {
    if (!this.starkSigner) {
      throw new ProviderError(
        'Attempted to sign a message with the MetaMask IMX provider without an established connection',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR
      );
    }

    return withProviderError<string>(
      async () => {
        return await this.starkSigner.signMessage(message);
      },
      { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR }
    );
  }
}
