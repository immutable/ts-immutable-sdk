import { connect } from './metaMask';
import { connect as buildImxSigner, disconnect as disconnectImxSigner } from '../imx-wallet/imxWallet';
import { Configuration } from 'config';
import { EthSigner, StarkSigner } from 'types';
import { GenericIMXProvider } from '../genericImxProvider';
import { ImxSigner } from '../imx-wallet/ImxSigner';
import { ProviderError, ProviderErrorType, withProviderError } from '../errors/providerError';

export class MetaMaskIMXProvider extends GenericIMXProvider {
    private static imxSigner: ImxSigner;

    constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner) {
        super(config, ethSigner, starkExSigner);
    }

    public static async connect(config: Configuration): Promise<MetaMaskIMXProvider> {
        const starkExConfig = config.getStarkExConfig();
        return await withProviderError<MetaMaskIMXProvider>(async () => {
            const metaMaskProvider = await connect({chainID: starkExConfig.ethConfiguration.chainID});
            this.imxSigner = await buildImxSigner(metaMaskProvider, starkExConfig.env);
            return new MetaMaskIMXProvider(config, metaMaskProvider.getSigner(), this.imxSigner);
        }, { type: ProviderErrorType.WALLET_CONNECTION_ERROR });
    }

    public static async disconnect(): Promise<void> {
        if (!this.imxSigner) {
            throw new ProviderError('PROVIDER_CONNECTION_ERROR: Attempted to disconnect from the MetaMask IMX provider without an established connection.', ProviderErrorType.PROVIDER_CONNECTION_ERROR)
        }

        return withProviderError<void>(async () => {
            await disconnectImxSigner(this.imxSigner);
        }, { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR });
    }

    public static async signMessage(message: string): Promise<string> {
        if (!this.imxSigner) {
            throw new ProviderError('PROVIDER_CONNECTION_ERROR: Attempted to sign a message with the MetaMask IMX provider without an established connection.', ProviderErrorType.PROVIDER_CONNECTION_ERROR)
        }

        return withProviderError<string>(async () => {
            return await this.imxSigner.signMessage(message);
        }, { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR });
    }
}
