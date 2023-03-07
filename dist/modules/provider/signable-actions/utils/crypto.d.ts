import { Signer } from '@ethersproject/abstract-signer';
export declare function signRaw(payload: string, signer: Signer): Promise<string>;
type IMXAuthorisationHeaders = {
    timestamp: string;
    signature: string;
};
export declare function generateIMXAuthorisationHeaders(ethSigner: Signer): Promise<IMXAuthorisationHeaders>;
export declare function signMessage(message: string, signer: Signer): Promise<{
    message: string;
    ethAddress: string;
    ethSignature: string;
}>;
export {};
