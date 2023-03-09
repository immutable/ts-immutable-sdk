import { connect } from './metaMask';
import { connect as buildImxSigner, disconnect as disconnectImxSigner } from '../imx-wallet/imxWallet';
import { Configuration } from 'config';
import { EthSigner, StarkSigner } from 'types';
import { GenericIMXProvider } from '../genericImxProvider';
import { ImxSigner } from '../imx-wallet/ImxSigner';
import { ProviderConnectionError } from './types';

export class MetaMaskIMXProvider extends GenericIMXProvider {
    private static imxSigner: ImxSigner;

    constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner) {
        super(config, ethSigner, starkExSigner);
    }

    public static async connect(config: Configuration): Promise<MetaMaskIMXProvider> {
        const starkExConfig = config.getStarkExConfig();
        const metaMaskProvider = await connect({chainID: starkExConfig.ethConfiguration.chainID});
        this.imxSigner = await buildImxSigner(metaMaskProvider, starkExConfig.env);
        return new MetaMaskIMXProvider(config, metaMaskProvider.getSigner(), this.imxSigner);
    }

    public static async disconnect(): Promise<void> {
        await disconnectImxSigner(this.imxSigner);
    }

    public static async signMessage(message: string): Promise<string> {
        if (!this.imxSigner) {
            throw new ProviderConnectionError('Attempted to sign a message with the MetaMask IMX provider without an established connection.');
        }
        return await this.imxSigner.signMessage(message);
    }
}
