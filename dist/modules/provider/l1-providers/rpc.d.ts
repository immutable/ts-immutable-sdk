import { ethers } from 'ethers';
export declare const WALLET_ACTION: {
    SWITCH_CHAIN: string;
    CONNECT: string;
};
type ExternalProvider = ethers.providers.ExternalProvider;
type RequestableProvider = ExternalProvider & {
    request: NonNullable<ethers.providers.ExternalProvider['request']>;
};
export declare function isRequestableProvider(provider: ExternalProvider): provider is RequestableProvider;
export declare function connectProvider(provider: RequestableProvider, chainID: number | undefined): Promise<void>;
export {};
