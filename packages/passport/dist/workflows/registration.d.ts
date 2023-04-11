import { UsersApi, WalletConnection } from '@imtbl/core-sdk';
export type registerPassportParams = WalletConnection & {
    usersApi: UsersApi;
};
export default function registerPassport({ ethSigner, starkSigner, usersApi }: registerPassportParams, authorization: string): Promise<string>;
