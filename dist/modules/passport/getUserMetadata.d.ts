import { PassportMetadata } from './types';
export declare const getUserEtherKeyFromMetadata: (authDomain: string, jwt: string) => Promise<string>;
export declare const getUserPassportMetadata: (authDomain: string, jwt: string) => Promise<PassportMetadata>;
