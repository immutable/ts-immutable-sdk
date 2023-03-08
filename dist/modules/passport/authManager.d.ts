import { User } from './types';
type AuthInput = {
    clientId: string;
    redirectUri: string;
};
export default class AuthManager {
    private userManager;
    constructor({ clientId, redirectUri }: AuthInput);
    private mapOidcUserToDomainModel;
    login(): Promise<User>;
    loginCallback(): Promise<void>;
    getUser(): Promise<User>;
    requestRefreshTokenAfterRegistration(jwt: string): Promise<User | null>;
}
export {};
