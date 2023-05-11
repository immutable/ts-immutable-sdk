import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { ProviderConfiguration } from 'config';
import { connect } from './metaMask';
import {
  connect as buildImxSigner,
  disconnect as disconnectImxSigner,
} from '../imx-wallet/imxWallet';
import { GenericIMXProvider } from '../genericImxProvider';
import { ImxSigner } from '../imx-wallet/ImxSigner';
import {
  ProviderError,
  ProviderErrorType,
  withProviderError,
} from '../errors/providerError';

export class MetaMaskIMXProvider extends GenericIMXProvider {
  private static imxSigner: ImxSigner;

  constructor(
    config: ProviderConfiguration,
    ethSigner: EthSigner,
    starkSigner: StarkSigner,
  ) {
    super(config, ethSigner, starkSigner);
  }

  public static async connect(
    config: ProviderConfiguration,
  ): Promise<MetaMaskIMXProvider> {
    return await withProviderError<MetaMaskIMXProvider>(
      async () => {
        const metaMaskProvider = await connect({
          chainID: config.immutableXConfig.ethConfiguration.chainID,
        });
        this.imxSigner = await buildImxSigner(
          metaMaskProvider,
          config.baseConfig.environment,
        );
        return new MetaMaskIMXProvider(
          config,
          metaMaskProvider.getSigner(),
          this.imxSigner,
        );
      },
      { type: ProviderErrorType.WALLET_CONNECTION_ERROR },
    );
  }

  public static async disconnect(): Promise<void> {
    if (!this.imxSigner) {
      throw new ProviderError(
        'Attempted to disconnect from the MetaMask IMX provider without an established connection',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR,
      );
    }

    return withProviderError<void>(
      async () => {
        await disconnectImxSigner(this.imxSigner);
      },
      { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR },
    );
  }

  public static async signMessage(message: string): Promise<string> {
    if (!this.imxSigner) {
      throw new ProviderError(
        'Attempted to sign a message with the MetaMask IMX provider without an established connection',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR,
      );
    }

    return withProviderError<string>(
      async () => await this.imxSigner.signMessage(message),
      { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR },
    );
  }
}
