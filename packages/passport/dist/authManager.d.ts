import { User, UserWithEtherKey } from './types';
import { PassportConfiguration } from './config';
export default class AuthManager {
    private userManager;
    private config;
    constructor(config: PassportConfiguration);
    login(): Promise<User>;
    loginCallback(): Promise<void>;
    logout(): Promise<void>;
    getUser(): Promise<User>;
    requestRefreshTokenAfterRegistration(): Promise<UserWithEtherKey | null>;
    private mapOidcUserToDomainModel;
}
