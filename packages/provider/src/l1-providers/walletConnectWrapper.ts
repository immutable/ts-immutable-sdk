import { ProviderConfiguration } from 'config';
import { Web3Provider } from '@ethersproject/providers';
import { connect } from './walletConnect';
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
import { WalletConnectParams } from './types';

export class WalletConnectIMXProvider extends GenericIMXProvider {
  private static imxSigner: ImxSigner;

  private static wcProvider: Web3Provider;

  public static async connect(
    config: ProviderConfiguration,
    walletConnectConfig: WalletConnectParams,
  ): Promise<WalletConnectIMXProvider> {
    return await withProviderError<WalletConnectIMXProvider>(
      async () => {
        const walletConnectProvider = await connect(walletConnectConfig);
        console.log('building IMX Signer');
        this.imxSigner = await buildImxSigner(
          walletConnectProvider,
          config.baseConfig.environment,
        );
        this.wcProvider = walletConnectProvider;
        console.log(this.imxSigner);
        return new WalletConnectIMXProvider(
          config,
          walletConnectProvider.getSigner(),
          this.imxSigner,
        );
      },
      { type: ProviderErrorType.WALLET_CONNECTION_ERROR },
    );
  }

  public static async disconnect(): Promise<void> {
    console.log(this.imxSigner);
    if (!this.imxSigner) {
      throw new ProviderError(
        'Attempted to disconnect from the WalletConnectIMX provider without an established connection',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR,
      );
    }

    console.log(this.wcProvider);

    // The underlying provider here is an EthereumProvider from WalletConnect which does have a disconenct function
    await (this.wcProvider.provider as any).disconnect();

    return withProviderError<void>(
      async () => {
        await disconnectImxSigner(this.imxSigner);
      },
      { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR },
    );
  }

  public static async signMessage(message: string): Promise<string> {
    console.log(this.imxSigner);
    if (!this.imxSigner) {
      throw new ProviderError(
        'Attempted to sign a message with the WalletConnectIMX provider without an established connection',
        ProviderErrorType.PROVIDER_CONNECTION_ERROR,
      );
    }

    return withProviderError<string>(
      async () => await this.imxSigner.signMessage(message),
      { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR },
    );
  }
}
