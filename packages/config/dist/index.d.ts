import { ImmutableXConfiguration as CoreSDKConfig } from '@imtbl/core-sdk';
export declare enum Environment {
    DEVELOPMENT = "development",
    SANDBOX = "sandbox",
    PRODUCTION = "production"
}
type StarkExConfig = CoreSDKConfig & {
    env: Environment;
};
export declare class Configuration {
    private readonly starkExConfig;
    constructor(config: StarkExConfig);
    getStarkExConfig(): StarkExConfig;
}
export declare const PRODUCTION: StarkExConfig;
export declare const SANDBOX: StarkExConfig;
export {};
