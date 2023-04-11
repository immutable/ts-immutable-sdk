export type UserProfile = {
    email?: string;
    nickname?: string;
    sub: string;
};
export type User = {
    idToken?: string;
    accessToken: string;
    refreshToken?: string;
    profile: UserProfile;
    etherKey?: string;
};
export type PassportMetadata = {
    ether_key: string;
    stark_key: string;
    user_admin_key: string;
};
export declare enum Networks {
    PRODUCTION = "mainnet",
    SANDBOX = "goerli",
    DEVELOPMENT = "goerli"
}
export interface EnvironmentConfiguration {
    network: Networks;
    authenticationDomain: string;
    magicPublishableApiKey: string;
    magicProviderId: string;
    baseIMXApiPath: string;
    passportDomain: string;
}
export interface OidcConfiguration {
    clientId: string;
    logoutRedirectUri: string;
    redirectUri: string;
}
type WithRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
export type UserWithEtherKey = WithRequired<User, 'etherKey'>;
export {};
