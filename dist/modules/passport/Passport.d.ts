import { Networks, UserProfile } from './types';
import { IMXProvider } from '../provider';
export type PassportConfig = {
    clientId: string;
    network?: Networks;
    redirectUri: string;
};
export declare class Passport {
    private authManager;
    private magicAdapter;
    constructor(config: PassportConfig);
    connectImx(): Promise<IMXProvider>;
    loginCallback(): Promise<void>;
    getUserInfo(): Promise<UserProfile>;
}
