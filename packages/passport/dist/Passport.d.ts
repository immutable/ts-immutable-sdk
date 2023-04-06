import { IMXProvider } from '@imtbl/provider';
import { EnvironmentConfiguration, OidcConfiguration, UserProfile } from './types';
export declare class Passport {
    private authManager;
    private magicAdapter;
    private readonly config;
    constructor(environmentConfiguration: EnvironmentConfiguration, oidcConfiguration: OidcConfiguration);
    connectImx(): Promise<IMXProvider>;
    loginCallback(): Promise<void>;
    getUserInfo(): Promise<UserProfile>;
    getIdToken(): Promise<string | undefined>;
    getAccessToken(): Promise<string>;
    private registerUser;
}
