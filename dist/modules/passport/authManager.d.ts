import { User, UserWithEtherKey } from './types';
import { PassportConfiguration } from './config';
export default class AuthManager {
    private userManager;
    private config;
    constructor(config: PassportConfiguration);
    login(): Promise<User>;
    loginCallback(): Promise<void>;
    getUser(): Promise<User>;
    requestRefreshTokenAfterRegistration(jwt: string): Promise<UserWithEtherKey | null>;
    private mapOidcUserToDomainModel;
}
