import { connect } from './metaMask';
import { connect as buildImxSigner } from '../imx-wallet/imxWallet';
import { Configuration } from 'config';
import { EthSigner, StarkSigner } from 'types';
import { GenericIMXProvider } from '../genericImxProvider';

export class MetaMaskProvider extends GenericIMXProvider {
    constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner) {
        super(config, ethSigner, starkExSigner);
    }

    public static async connect(config: Configuration): Promise<MetaMaskProvider> {
        const starkExConfig = config.getStarkExConfig();
        const metaMaskProvider = await connect({chainID: starkExConfig.ethConfiguration.chainID});
        const imxSigner = await buildImxSigner(metaMaskProvider, starkExConfig.env);
        return new MetaMaskProvider(config, metaMaskProvider.getSigner(), imxSigner);
    }
}
