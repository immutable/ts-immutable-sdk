import { EnvironmentConfiguration, Networks, OidcConfiguration } from '../types';
export interface ImxApiConfiguration {
    basePath: string;
}
export interface PassportConfiguration {
    network: Networks;
    oidcConfiguration: {
        authenticationDomain: string;
        clientId: string;
        logoutRedirectUri: string;
        redirectUri: string;
    };
    imxAPIConfiguration: ImxApiConfiguration;
    magicPublishableApiKey: string;
    magicProviderId: string;
}
export declare const Config: {
    PRODUCTION: EnvironmentConfiguration;
    SANDBOX: EnvironmentConfiguration;
    DEVELOPMENT: EnvironmentConfiguration;
};
export declare const getPassportConfiguration: (environmentConfiguration: EnvironmentConfiguration, oidcConfiguration: OidcConfiguration) => PassportConfiguration;
