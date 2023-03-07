import { Configuration } from 'config';
import { EthSigner, StarkSigner } from 'types';
import { GenericIMXProvider } from '../genericImxProvider';
export declare class MetaMaskProvider extends GenericIMXProvider {
    constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner);
    static connect(config: Configuration): Promise<MetaMaskProvider>;
}
