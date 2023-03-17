import { Configuration } from 'config';
import { EthSigner, StarkSigner } from 'types';
import { GenericIMXProvider } from '../genericImxProvider';
export declare class MetaMaskIMXProvider extends GenericIMXProvider {
    private static imxSigner;
    constructor(config: Configuration, ethSigner: EthSigner, starkExSigner: StarkSigner);
    static connect(config: Configuration): Promise<MetaMaskIMXProvider>;
    static disconnect(): Promise<void>;
    static signMessage(message: string): Promise<string>;
}
