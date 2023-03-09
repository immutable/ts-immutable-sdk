import { StarkSigner } from 'types';
export declare class ImxSigner implements StarkSigner {
    private publicAddress;
    private iframe;
    constructor(publicAddress: string, iframe: HTMLIFrameElement);
    getAddress(): string;
    signMessage(rawMessage: string): Promise<string>;
    getIFrame(): HTMLIFrameElement;
}
