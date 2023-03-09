import { IMXProvider } from '../provider/imxProvider';
import { Networks, UserProfile } from './types';
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
    getIdToken(): Promise<string | undefined>;
}
