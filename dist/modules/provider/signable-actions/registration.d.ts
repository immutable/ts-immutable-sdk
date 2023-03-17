import { RegisterUserResponse, GetSignableRegistrationResponse, EthSigner } from 'types';
import { Signers } from './types';
import { UsersApi } from '@imtbl/core-sdk';
import { Configuration } from 'config';
export declare function registerOffchain(signers: Signers, config: Configuration): Promise<RegisterUserResponse>;
export declare function isRegisteredOnChain(starkPublicKey: string, ethSigner: EthSigner, config: Configuration): Promise<boolean>;
export declare function getSignableRegistrationOnchain(etherKey: string, starkPublicKey: string, usersApi: UsersApi): Promise<GetSignableRegistrationResponse>;
